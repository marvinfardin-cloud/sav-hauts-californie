"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import { STATUT_CONFIG, StatutKey } from "@/lib/constants";

interface Stats {
  totalTickets: number;
  statutCounts: Record<string, number>;
  urgentTickets: Array<{
    id: string;
    numero: string;
    materiel: string;
    statut: string;
    dateEstimee: string;
    client: { nom: string; prenom: string };
    technicien: { nom: string } | null;
  }>;
  todayRdvs: Array<{
    id: string;
    dateHeure: string;
    type: string;
    client: { nom: string; prenom: string; telephone: string | null };
  }>;
  recentTickets: Array<{
    id: string;
    numero: string;
    materiel: string;
    statut: string;
    createdAt: string;
    client: { nom: string; prenom: string };
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser] = useState<{ nom: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/admin/stats").then((r) => r.json()),
    ]).then(([me, statsData]) => {
      if (me.type !== "staff") {
        router.push("/admin/login");
        return;
      }
      setUser(me.user);
      setStats(statsData);
      setLoading(false);
    });
  }, [router]);

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Martinique" });

  const typeLabels: Record<string, string> = { depot: "Dépôt", retrait: "Retrait", diagnostic: "Diagnostic" };

  const statutKeys: StatutKey[] = ["RECU", "DIAGNOSTIC", "ATTENTE_PIECES", "EN_REPARATION", "PRET", "LIVRE"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header type="admin" userName={user?.nom} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
          <Link
            href="/admin/tickets/nouveau"
            className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900"
          >
            + Nouveau ticket
          </Link>
        </div>

        {/* Status counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statutKeys.map((key) => {
            const config = STATUT_CONFIG[key];
            const count = stats.statutCounts[key] || 0;
            return (
              <Link
                key={key}
                href={`/admin/tickets?statut=${key}`}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className={`w-3 h-3 rounded-full ${config.dotColor} mb-2`} />
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{config.label}</p>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent tickets */}
          {stats.urgentTickets.length > 0 && (
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <h2 className="font-semibold text-red-700 mb-4">
                Tickets urgents ({stats.urgentTickets.length})
              </h2>
              <div className="space-y-3">
                {stats.urgentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/admin/tickets/${ticket.id}`}
                    className="block p-3 rounded-lg border border-red-100 hover:bg-red-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{ticket.materiel}</p>
                        <p className="text-xs text-gray-500">
                          {ticket.client.prenom} {ticket.client.nom} — {ticket.numero}
                        </p>
                      </div>
                      <StatusBadge statut={ticket.statut} />
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Estimé le {new Date(ticket.dateEstimee).toLocaleDateString("fr-FR")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Today's appointments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Rendez-vous du jour ({stats.todayRdvs.length})
            </h2>
            {stats.todayRdvs.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun rendez-vous aujourd&apos;hui.</p>
            ) : (
              <div className="space-y-3">
                {stats.todayRdvs.map((rdv) => (
                  <div key={rdv.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="text-sm font-mono font-semibold text-blue-800 w-12">
                      {formatTime(rdv.dateHeure)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {rdv.client.prenom} {rdv.client.nom}
                      </p>
                      <p className="text-xs text-gray-500">
                        {typeLabels[rdv.type] || rdv.type}
                        {rdv.client.telephone && ` — ${rdv.client.telephone}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent tickets */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Derniers tickets</h2>
              <Link href="/admin/tickets" className="text-sm text-blue-800 hover:underline">
                Voir tous
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">N°</th>
                    <th className="pb-2 font-medium">Client</th>
                    <th className="pb-2 font-medium">Matériel</th>
                    <th className="pb-2 font-medium">Statut</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2">
                        <Link href={`/admin/tickets/${ticket.id}`} className="text-blue-800 hover:underline font-mono text-xs">
                          {ticket.numero}
                        </Link>
                      </td>
                      <td className="py-2">{ticket.client.prenom} {ticket.client.nom}</td>
                      <td className="py-2">{ticket.materiel}</td>
                      <td className="py-2"><StatusBadge statut={ticket.statut} /></td>
                      <td className="py-2 text-gray-500">{new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
