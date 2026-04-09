"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import { STATUT_CONFIG, StatutKey } from "@/lib/constants";

interface Ticket {
  id: string;
  numero: string;
  materiel: string;
  marque: string;
  modele: string;
  numeroSerie: string | null;
  panneDeclaree: string;
  statut: string;
  dateDepot: string;
  dateEstimee: string | null;
  notesPubliques: string | null;
  notesPrivees: string | null;
  client: { id: string; nom: string; prenom: string; email: string; telephone: string | null };
  technicien: { id: string; nom: string } | null;
  historique: Array<{ id: string; statut: string; note: string | null; createdAt: string }>;
  photos: Array<{ id: string; url: string; type: string }>;
}

interface User {
  id: string;
  nom: string;
}

export default function AdminTicketDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusNote, setStatusNote] = useState("");
  const [notesPubliques, setNotesPubliques] = useState("");
  const [notesPrivees, setNotesPrivees] = useState("");
  const [dateEstimee, setDateEstimee] = useState("");
  const [technicienId, setTechnicienId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTicket = async () => {
    const res = await fetch(`/api/admin/tickets/${id}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setTicket(data);
    setNotesPubliques(data.notesPubliques || "");
    setNotesPrivees(data.notesPrivees || "");
    setDateEstimee(data.dateEstimee ? data.dateEstimee.split("T")[0] : "");
    setTechnicienId(data.technicien?.id || "");
    setLoading(false);
  };

  useEffect(() => {
    Promise.all([
      fetchTicket(),
      fetch("/api/admin/users").then((r) => r.json()).then(setUsers),
    ]);
  }, [id]);

  const changeStatus = async (newStatut: string) => {
    setSaving(true);
    await fetch(`/api/admin/tickets/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: newStatut, note: statusNote || undefined }),
    });
    setStatusNote("");
    await fetchTicket();
    setSaving(false);
  };

  const saveDetails = async () => {
    setSaving(true);
    await fetch(`/api/admin/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notesPubliques,
        notesPrivees,
        dateEstimee: dateEstimee || null,
        technicienId: technicienId || null,
      }),
    });
    await fetchTicket();
    setSaving(false);
  };

  if (loading || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  const statutKeys: StatutKey[] = ["RECU", "DIAGNOSTIC", "ATTENTE_PIECES", "EN_REPARATION", "PRET", "LIVRE"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header type="admin" />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => router.push("/admin/tickets")} className="text-sm text-blue-800 hover:underline mb-1 inline-block">
              &larr; Retour aux tickets
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {ticket.numero} — {ticket.materiel}
            </h1>
          </div>
          <Link
            href={`/admin/tickets/${id}/print`}
            target="_blank"
            className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50"
          >
            Imprimer
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status change */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Changer le statut</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {statutKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => changeStatus(key)}
                    disabled={saving || ticket.statut === key}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      ticket.statut === key
                        ? "bg-blue-800 text-white border-blue-800"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 disabled:opacity-50"
                    }`}
                  >
                    {STATUT_CONFIG[key].label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Note optionnelle pour le changement de statut..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Détails du ticket</h2>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Matériel</span>
                  <p className="font-medium">{ticket.materiel}</p>
                </div>
                <div>
                  <span className="text-gray-500">Marque / Modèle</span>
                  <p className="font-medium">{ticket.marque} {ticket.modele}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date de dépôt</span>
                  <p className="font-medium">{new Date(ticket.dateDepot).toLocaleDateString("fr-FR")}</p>
                </div>
                {ticket.numeroSerie && (
                  <div>
                    <span className="text-gray-500">N° série</span>
                    <p className="font-medium">{ticket.numeroSerie}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500">Panne déclarée</span>
                <p className="mt-1">{ticket.panneDeclaree}</p>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Technicien</label>
                  <select
                    value={technicienId}
                    onChange={(e) => setTechnicienId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Non assigné</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Date estimée</label>
                  <input
                    type="date"
                    value={dateEstimee}
                    onChange={(e) => setDateEstimee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Notes publiques (visibles par le client)</label>
                  <textarea
                    value={notesPubliques}
                    onChange={(e) => setNotesPubliques(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Notes privées (internes)</label>
                  <textarea
                    value={notesPrivees}
                    onChange={(e) => setNotesPrivees(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  />
                </div>
                <button
                  onClick={saveDetails}
                  disabled={saving}
                  className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </div>

            {/* Photos */}
            {ticket.photos.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ticket.photos.map((p) => (
                    <div key={p.id} className="relative">
                      <img src={p.url} alt={p.type} className="rounded-lg w-full h-32 object-cover" />
                      <span className="absolute top-1 left-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                        {p.type === "avant" ? "Avant" : "Après"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Client</h2>
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  <Link href={`/admin/clients/${ticket.client.id}`} className="text-blue-800 hover:underline">
                    {ticket.client.prenom} {ticket.client.nom}
                  </Link>
                </p>
                <p className="text-gray-500">{ticket.client.email}</p>
                {ticket.client.telephone && (
                  <p className="text-gray-500">{ticket.client.telephone}</p>
                )}
              </div>
            </div>

            {/* Current status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Statut actuel</h2>
              <StatusBadge statut={ticket.statut} />
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Historique</h2>
              <div className="space-y-3">
                {ticket.historique.map((entry, i) => {
                  const config = STATUT_CONFIG[entry.statut as StatutKey];
                  return (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${config?.dotColor || "bg-gray-300"}`} />
                        {i < ticket.historique.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium">{config?.label || entry.statut}</p>
                        {entry.note && <p className="text-xs text-gray-500">{entry.note}</p>}
                        <p className="text-xs text-gray-400">
                          {new Date(entry.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
