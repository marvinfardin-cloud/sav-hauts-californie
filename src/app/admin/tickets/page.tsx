"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import { STATUT_CONFIG, StatutKey } from "@/lib/constants";

interface Ticket {
  id: string;
  numero: string;
  materiel: string;
  marque: string;
  statut: string;
  createdAt: string;
  dateEstimee: string | null;
  client: { nom: string; prenom: string; email: string };
  technicien: { nom: string; id: string } | null;
}

interface User {
  id: string;
  nom: string;
  role: string;
}

function TicketsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statut, setStatut] = useState(searchParams.get("statut") || "");
  const [technicienId, setTechnicienId] = useState("");

  const fetchTickets = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statut) params.set("statut", statut);
    if (technicienId) params.set("technicienId", technicienId);

    const res = await fetch(`/api/admin/tickets?${params}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  }, [search, statut, technicienId, router]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
    ]).then(([usersData]) => {
      setUsers(usersData);
    });
    fetchTickets();
  }, [fetchTickets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header type="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Tickets SAV</h1>
          <Link
            href="/admin/tickets/nouveau"
            className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900"
          >
            + Nouveau ticket
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par n°, nom, matériel..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statut}
              onChange={(e) => { setStatut(e.target.value); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Tous les statuts</option>
              {(Object.keys(STATUT_CONFIG) as StatutKey[]).map((key) => (
                <option key={key} value={key}>
                  {STATUT_CONFIG[key].label}
                </option>
              ))}
            </select>
            <select
              value={technicienId}
              onChange={(e) => setTechnicienId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Tous les techniciens</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.nom}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Filtrer
            </button>
          </form>
        </div>

        {/* Tickets list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Aucun ticket trouvé.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">N°</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Matériel</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Technicien</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-800">{ticket.numero}</td>
                      <td className="px-4 py-3">
                        {ticket.client.prenom} {ticket.client.nom}
                      </td>
                      <td className="px-4 py-3">{ticket.materiel}</td>
                      <td className="px-4 py-3">
                        <StatusBadge statut={ticket.statut} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {ticket.technicien?.nom || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" /></div>}>
      <TicketsList />
    </Suspense>
  );
}
