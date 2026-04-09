"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";

interface Client {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  createdAt: string;
  tickets: Array<{
    id: string;
    numero: string;
    materiel: string;
    marque: string;
    modele: string;
    statut: string;
    createdAt: string;
    technicien: { nom: string } | null;
  }>;
  rendezvous: Array<{
    id: string;
    dateHeure: string;
    type: string;
    statut: string;
  }>;
}

export default function AdminClientDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/clients/${id}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setClient(data);
        setLoading(false);
      });
  }, [id, router]);

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  const activeTickets = client.tickets.filter((t) => t.statut !== "LIVRE");
  const pastTickets = client.tickets.filter((t) => t.statut === "LIVRE");
  const upcomingRdvs = client.rendezvous.filter((r) => new Date(r.dateHeure) > new Date());
  const typeLabels: Record<string, string> = { depot: "Dépôt", retrait: "Retrait", diagnostic: "Diagnostic" };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header type="admin" />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push("/admin/clients")}
          className="text-sm text-blue-800 hover:underline mb-4 inline-block"
        >
          &larr; Retour aux clients
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client info card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-xl mb-4">
                {client.prenom[0]}{client.nom[0]}
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {client.prenom} {client.nom}
              </h1>
              <div className="mt-4 space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">Email</span>
                  <a href={`mailto:${client.email}`} className="text-blue-800 hover:underline">
                    {client.email}
                  </a>
                </div>
                {client.telephone && (
                  <div>
                    <span className="text-gray-500 block text-xs">Téléphone</span>
                    <a href={`tel:${client.telephone}`} className="text-blue-800 hover:underline">
                      {client.telephone}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 block text-xs">Client depuis</span>
                  <span>{new Date(client.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{client.tickets.length}</p>
                  <p className="text-xs text-gray-500">Tickets</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{client.rendezvous.length}</p>
                  <p className="text-xs text-gray-500">Rendez-vous</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets and RDV */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active tickets */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Tickets en cours ({activeTickets.length})
              </h2>
              {activeTickets.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun ticket en cours.</p>
              ) : (
                <div className="space-y-2">
                  {activeTickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/admin/tickets/${ticket.id}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{ticket.materiel}</p>
                          <p className="text-xs text-gray-500">
                            {ticket.marque} {ticket.modele} — {ticket.numero}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Déposé le {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <StatusBadge statut={ticket.statut} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming RDVs */}
            {upcomingRdvs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Rendez-vous à venir ({upcomingRdvs.length})
                </h2>
                <div className="space-y-2">
                  {upcomingRdvs.map((rdv) => (
                    <div key={rdv.id} className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm font-medium capitalize">
                        {new Date(rdv.dateHeure).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-gray-500">{typeLabels[rdv.type] || rdv.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past tickets */}
            {pastTickets.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Historique ({pastTickets.length})
                </h2>
                <div className="space-y-2">
                  {pastTickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/admin/tickets/${ticket.id}`}
                      className="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-gray-700">{ticket.materiel}</p>
                          <p className="text-xs text-gray-500">
                            {ticket.numero} — {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <StatusBadge statut={ticket.statut} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
