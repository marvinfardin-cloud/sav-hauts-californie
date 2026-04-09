"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { SAV_HOURS, RDV_TYPES } from "@/lib/constants";

interface Rdv {
  id: string;
  dateHeure: string;
  duree: number;
  type: string;
  statut: string;
  notes: string | null;
  client: { nom: string; prenom: string; telephone: string | null };
}

interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

export default function PlanningPage() {
  const router = useRouter();
  const [rdvs, setRdvs] = useState<Rdv[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // New RDV modal
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalTime, setModalTime] = useState("");
  const [modalType, setModalType] = useState("depot");
  const [modalClientSearch, setModalClientSearch] = useState("");
  const [modalClients, setModalClients] = useState<Client[]>([]);
  const [modalSelectedClient, setModalSelectedClient] = useState<Client | null>(null);
  const [modalNotes, setModalNotes] = useState("");

  const fetchRdvs = useCallback(async () => {
    const from = weekStart.toISOString();
    const to = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`/api/admin/rdv?from=${from}&to=${to}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setRdvs(data);
    setLoading(false);
  }, [weekStart, router]);

  useEffect(() => {
    fetchRdvs();
  }, [fetchRdvs]);

  const prevWeek = () => setWeekStart(new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000));
  const nextWeek = () => setWeekStart(new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000));

  const days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const typeLabels: Record<string, string> = { depot: "Dépôt", retrait: "Retrait", diagnostic: "Diagnostic" };
  const typeColors: Record<string, string> = {
    depot: "bg-blue-100 border-blue-300 text-blue-800",
    retrait: "bg-green-100 border-green-300 text-green-800",
    diagnostic: "bg-purple-100 border-purple-300 text-purple-800",
  };

  const hours = Array.from({ length: 10 }, (_, i) => 7 + i); // 7h to 16h

  const handleSlotClick = (date: Date, hour: number) => {
    const dayOfWeek = date.getDay();
    const ranges = SAV_HOURS[dayOfWeek];
    if (!ranges) return;
    const inRange = ranges.some(([start, end]) => hour >= start && hour < end);
    if (!inRange) return;

    setModalDate(date.toISOString().split("T")[0]);
    setModalTime(`${String(hour).padStart(2, "0")}:00`);
    setShowModal(true);
  };

  const searchClients = async (query: string) => {
    setModalClientSearch(query);
    if (query.length < 2) { setModalClients([]); return; }
    const res = await fetch(`/api/admin/clients?search=${encodeURIComponent(query)}`);
    setModalClients(await res.json());
  };

  const createRdv = async () => {
    if (!modalSelectedClient) return;
    const dateHeure = new Date(`${modalDate}T${modalTime}:00`);
    await fetch("/api/admin/rdv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: modalSelectedClient.id,
        dateHeure: dateHeure.toISOString(),
        type: modalType,
        notes: modalNotes || undefined,
      }),
    });
    setShowModal(false);
    setModalSelectedClient(null);
    setModalClientSearch("");
    setModalNotes("");
    fetchRdvs();
  };

  const formatWeekRange = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return `${weekStart.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} — ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header type="admin" />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Planning</h1>
          <div className="flex items-center gap-3">
            <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              &larr;
            </button>
            <span className="text-sm font-medium text-gray-700">{formatWeekRange()}</span>
            <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              &rarr;
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="w-16 p-2 text-xs text-gray-500 border-b border-r bg-gray-50">Heure</th>
                {days.map((day, i) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  const dayOfWeek = day.getDay();
                  const hasSAV = !!SAV_HOURS[dayOfWeek];
                  return (
                    <th
                      key={i}
                      className={`p-2 text-xs border-b border-r last:border-r-0 ${
                        isToday ? "bg-blue-50" : "bg-gray-50"
                      } ${!hasSAV ? "text-gray-300" : "text-gray-700"}`}
                    >
                      <div className="font-medium">{dayNames[i]}</div>
                      <div className="text-gray-400">{day.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => (
                <tr key={hour}>
                  <td className="p-2 text-xs text-gray-500 border-b border-r bg-gray-50 text-center font-mono">
                    {hour}h
                  </td>
                  {days.map((day, dayIdx) => {
                    const dayOfWeek = day.getDay();
                    const ranges = SAV_HOURS[dayOfWeek];
                    const inRange = ranges?.some(([s, e]) => hour >= s && hour < e);
                    const dayRdvs = rdvs.filter((r) => {
                      const d = new Date(r.dateHeure);
                      return d.toDateString() === day.toDateString() && d.getHours() === hour;
                    });

                    return (
                      <td
                        key={dayIdx}
                        className={`p-1 border-b border-r last:border-r-0 align-top min-h-[60px] h-16 ${
                          inRange ? "bg-white cursor-pointer hover:bg-blue-50" : "bg-gray-50"
                        }`}
                        onClick={() => inRange && handleSlotClick(day, hour)}
                      >
                        {dayRdvs.map((rdv) => (
                          <div
                            key={rdv.id}
                            className={`text-xs p-1.5 rounded border mb-1 ${typeColors[rdv.type] || "bg-gray-100 border-gray-300"}`}
                          >
                            <div className="font-medium truncate">
                              {new Date(rdv.dateHeure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              {" "}{rdv.client.prenom} {rdv.client.nom}
                            </div>
                            <div className="text-[10px] opacity-75">
                              {typeLabels[rdv.type] || rdv.type}
                            </div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          {Object.entries(typeColors).map(([key, color]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${color.split(" ")[0]}`} />
              <span>{typeLabels[key]}</span>
            </div>
          ))}
        </div>
      </main>

      {/* New RDV Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Nouveau rendez-vous</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Heure</label>
                <input
                  type="time"
                  value={modalTime}
                  onChange={(e) => setModalTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select
                value={modalType}
                onChange={(e) => setModalType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {RDV_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Client</label>
              {!modalSelectedClient ? (
                <>
                  <input
                    type="text"
                    value={modalClientSearch}
                    onChange={(e) => searchClients(e.target.value)}
                    placeholder="Rechercher un client..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  {modalClients.length > 0 && (
                    <div className="border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto divide-y">
                      {modalClients.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setModalSelectedClient(c)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          {c.prenom} {c.nom}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">{modalSelectedClient.prenom} {modalSelectedClient.nom}</span>
                  <button onClick={() => setModalSelectedClient(null)} className="text-xs text-red-600">Changer</button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <textarea
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              />
            </div>

            <button
              onClick={createRdv}
              disabled={!modalSelectedClient}
              className="w-full bg-blue-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 disabled:opacity-50"
            >
              Créer le rendez-vous
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
