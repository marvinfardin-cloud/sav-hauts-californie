"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RDV_TYPES } from "@/lib/constants";

export default function ClientRdvPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [type, setType] = useState("depot");
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingRdvs, setExistingRdvs] = useState<Array<{ id: string; dateHeure: string; type: string; statut: string }>>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/rdv").then((r) => r.json()),
    ]).then(([me, rdvs]) => {
      if (!me.user) {
        router.push("/login?redirect=/client/rdv");
        return;
      }
      setExistingRdvs(rdvs);
      setLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot("");
    fetch(`/api/rdv/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || []);
        setLoadingSlots(false);
      });
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);

    const res = await fetch("/api/rdv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dateHeure: selectedSlot, type, notes: notes || undefined }),
    });

    if (res.ok) {
      setSuccess(true);
    }
    setSubmitting(false);
  };

  // Get minimum selectable date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const formatSlotTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const formatRdvDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header type="client" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Prendre un rendez-vous</h1>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-green-800 mb-2">Rendez-vous confirmé !</h2>
            <p className="text-green-700 text-sm">
              Un email de confirmation vous a été envoyé.
            </p>
            <button
              onClick={() => { setSuccess(false); setSelectedDate(""); setSelectedSlot(""); }}
              className="mt-4 text-sm text-green-700 underline"
            >
              Prendre un autre rendez-vous
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de rendez-vous
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {RDV_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={minDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  SAV : Lun-Jeu 7h-16h | Ven 7h-15h (fermé samedi et dimanche)
                </p>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Créneau horaire
                  </label>
                  {loadingSlots ? (
                    <p className="text-sm text-gray-500">Chargement des créneaux...</p>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-orange-600">
                      Aucun créneau disponible pour cette date. Le SAV est fermé le samedi et dimanche.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                            selectedSlot === slot
                              ? "bg-blue-800 text-white border-blue-800"
                              : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          {formatSlotTime(slot)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Description du matériel, type de panne..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedSlot || submitting}
              className="w-full bg-blue-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Confirmation..." : "Confirmer le rendez-vous"}
            </button>
          </form>
        )}

        {/* Existing appointments */}
        {existingRdvs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Mes rendez-vous
            </h2>
            <div className="space-y-2">
              {existingRdvs.map((rdv) => (
                <div key={rdv.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {formatRdvDate(rdv.dateHeure)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {RDV_TYPES.find((t) => t.value === rdv.type)?.label || rdv.type}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rdv.statut === "confirme" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {rdv.statut === "confirme" ? "Confirmé" : rdv.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
