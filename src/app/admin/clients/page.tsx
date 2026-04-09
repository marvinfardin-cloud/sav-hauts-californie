"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface Client {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  createdAt: string;
  _count: { tickets: number };
}

export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchClients = async (query: string = "") => {
    const params = query ? `?search=${encodeURIComponent(query)}` : "";
    const res = await fetch(`/api/admin/clients${params}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setClients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(search);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header type="admin" />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Clients</h1>

        <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, prénom ou email..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900"
            >
              Rechercher
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Aucun client trouvé.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Téléphone</th>
                  <th className="px-4 py-3 font-medium">Tickets</th>
                  <th className="px-4 py-3 font-medium">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">
                      {client.prenom} {client.nom}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{client.email}</td>
                    <td className="px-4 py-3 text-gray-600">{client.telephone || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {client._count.tickets}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
