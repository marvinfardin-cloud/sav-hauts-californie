"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import ProgressBar from "@/components/ProgressBar";
import Footer from "@/components/Footer";

interface Ticket {
  id: string;
  numero: string;
  materiel: string;
  marque: string;
  modele: string;
  statut: string;
  dateDepot: string;
  dateEstimee: string | null;
  notesPubliques: string | null;
}

interface ClientData {
  nom: string;
  prenom: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/tickets").then((r) => r.json()),
    ]).then(([me, ticketData]) => {
      if (!me.user) {
        router.push("/login");
        return;
      }
      setClient(me.user);
      setTickets(ticketData);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  const activeTickets = tickets.filter((t) => t.statut !== "LIVRE");
  const pastTickets = tickets.filter((t) => t.statut === "LIVRE");

  return (
    <div className="min-h-screen flex flex-col">
      <Header type="client" userName={client ? `${client.prenom} ${client.nom}` : undefined} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Mes tickets</h1>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Aucune réparation en cours.</p>
            <p className="text-sm text-gray-400 mt-2">
              Vos tickets apparaîtront ici lorsqu&apos;un matériel sera déposé.
            </p>
          </div>
        ) : (
          <>
            {activeTickets.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  En cours ({activeTickets.length})
                </h2>
                <div className="space-y-3">
                  {activeTickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/client/tickets/${ticket.id}`}
                      className={`block bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                        ticket.statut === "PRET"
                          ? "border-green-300 ring-2 ring-green-100"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">{ticket.materiel}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {ticket.marque} {ticket.modele} — {ticket.numero}
                          </p>
                        </div>
                        <StatusBadge statut={ticket.statut} />
                      </div>
                      <ProgressBar statut={ticket.statut} />
                      {ticket.statut === "PRET" && (
                        <p className="text-sm text-green-700 font-medium mt-3">
                          Votre matériel est prêt ! Venez le récupérer.
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {pastTickets.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Historique ({pastTickets.length})
                </h2>
                <div className="space-y-3">
                  {pastTickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/client/tickets/${ticket.id}`}
                      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">{ticket.materiel}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {ticket.marque} {ticket.modele} — {ticket.numero}
                          </p>
                        </div>
                        <StatusBadge statut={ticket.statut} />
                      </div>
                      <ProgressBar statut={ticket.statut} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
