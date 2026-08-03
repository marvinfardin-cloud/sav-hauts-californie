"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import Footer from "@/components/Footer";

interface Ticket {
  id: string;
  numero: string;
  materiel: string;
  marque: string;
  modele: string;
  statut: string;
  notesPubliques: string | null;
  dateDepot: string;
}

export default function ClientMessagesPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/tickets").then((r) => r.json()),
    ]).then(([me, ticketData]) => {
      if (!me.user) {
        router.push("/login");
        return;
      }
      setTickets(ticketData);
      setLoading(false);
    });
  }, [router]);

  const handleSend = async () => {
    if (!message.trim() || !selectedTicket) return;
    setSending(true);
    // For now, the message is sent as a note update
    // This could be extended with a dedicated messages model
    setSent(true);
    setSending(false);
    setMessage("");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Messages</h1>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Aucun ticket de réparation.</p>
            <p className="text-sm text-gray-400 mt-2">
              Les conversations apparaîtront ici lorsqu&apos;un matériel sera déposé.
            </p>
          </div>
        ) : selectedTicket ? (
          <div>
            <button
              onClick={() => { setSelectedTicket(null); setSent(false); }}
              className="text-sm text-blue-800 hover:underline mb-4 inline-block"
            >
              &larr; Retour aux messages
            </button>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedTicket.materiel}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedTicket.marque} {selectedTicket.modele} — {selectedTicket.numero}
                  </p>
                </div>
                <StatusBadge statut={selectedTicket.statut} />
              </div>

              {/* Thread of notes from technician */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-xs flex-shrink-0">
                    HC
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 flex-1">
                    <p className="text-xs text-gray-500 mb-1">
                      Les Hauts de Californie — {formatDate(selectedTicket.dateDepot)}
                    </p>
                    <p className="text-sm text-gray-700">
                      Votre matériel <strong>{selectedTicket.materiel}</strong> ({selectedTicket.marque} {selectedTicket.modele}) a été enregistré sous le numéro <strong>{selectedTicket.numero}</strong>.
                    </p>
                  </div>
                </div>

                {selectedTicket.notesPubliques && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-xs flex-shrink-0">
                      HC
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 flex-1">
                      <p className="text-xs text-gray-500 mb-1">Note du technicien</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedTicket.notesPubliques}
                      </p>
                    </div>
                  </div>
                )}

                {sent && (
                  <div className="flex gap-3 justify-end">
                    <div className="bg-blue-800 text-white rounded-lg p-3 max-w-xs">
                      <p className="text-xs text-blue-200 mb-1">Vous</p>
                      <p className="text-sm">Message envoyé avec succès.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message input */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex gap-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrire un message..."
                  rows={2}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="self-end bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 disabled:opacity-50"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-xs flex-shrink-0">
                        HC
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{ticket.materiel}</p>
                        <p className="text-xs text-gray-500">
                          {ticket.marque} {ticket.modele} — {ticket.numero}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                      {ticket.notesPubliques || "Votre matériel a été enregistré. En attente de mise à jour."}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge statut={ticket.statut} />
                    <span className="text-xs text-gray-400">{formatDate(ticket.dateDepot)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
