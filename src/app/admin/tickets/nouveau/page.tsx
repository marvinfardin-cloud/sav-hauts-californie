"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface ExistingClient {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
}

interface User {
  id: string;
  nom: string;
  role: string;
}

export default function NouveauTicketPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ExistingClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<ExistingClient | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);
  const [loading, setLoading] = useState(false);

  // Client fields
  const [clientEmail, setClientEmail] = useState("");
  const [clientNom, setClientNom] = useState("");
  const [clientPrenom, setClientPrenom] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");

  // Ticket fields
  const [materiel, setMateriel] = useState("");
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [panneDeclaree, setPanneDeclaree] = useState("");
  const [technicienId, setTechnicienId] = useState("");

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then(setUsers);
  }, []);

  const searchClients = async (query: string) => {
    setClientSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/admin/clients?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    setSearchResults(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const body = {
      clientId: selectedClient?.id,
      clientEmail: isNewClient ? clientEmail : undefined,
      clientNom: isNewClient ? clientNom : undefined,
      clientPrenom: isNewClient ? clientPrenom : undefined,
      clientTelephone: isNewClient ? clientTelephone : undefined,
      materiel,
      marque,
      modele,
      numeroSerie: numeroSerie || undefined,
      panneDeclaree,
      technicienId: technicienId || undefined,
    };

    const res = await fetch("/api/admin/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const ticket = await res.json();
      router.push(`/admin/tickets/${ticket.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header type="admin" />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-800 hover:underline mb-4 inline-block"
        >
          &larr; Retour
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6">Nouveau ticket SAV</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Client</h2>

            {!selectedClient && !isNewClient && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => searchClients(e.target.value)}
                  placeholder="Rechercher un client (nom, email)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                {searchResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg divide-y">
                    {searchResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedClient(c)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        <span className="font-medium">{c.prenom} {c.nom}</span>
                        <span className="text-gray-500 ml-2">{c.email}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsNewClient(true)}
                  className="text-sm text-blue-800 hover:underline"
                >
                  + Créer un nouveau client
                </button>
              </div>
            )}

            {selectedClient && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{selectedClient.prenom} {selectedClient.nom}</p>
                  <p className="text-xs text-gray-500">{selectedClient.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedClient(null); setClientSearch(""); }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Changer
                </button>
              </div>
            )}

            {isNewClient && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700">Nouveau client</p>
                  <button
                    type="button"
                    onClick={() => setIsNewClient(false)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Annuler
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Prénom *</label>
                    <input
                      type="text"
                      value={clientPrenom}
                      onChange={(e) => setClientPrenom(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nom *</label>
                    <input
                      type="text"
                      value={clientNom}
                      onChange={(e) => setClientNom(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email *</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={clientTelephone}
                    onChange={(e) => setClientTelephone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Equipment */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Matériel</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description matériel *</label>
                <input
                  type="text"
                  value={materiel}
                  onChange={(e) => setMateriel(e.target.value)}
                  required
                  placeholder="ex: Tondeuse thermique"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Marque *</label>
                  <input
                    type="text"
                    value={marque}
                    onChange={(e) => setMarque(e.target.value)}
                    required
                    placeholder="ex: Honda"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Modèle *</label>
                  <input
                    type="text"
                    value={modele}
                    onChange={(e) => setModele(e.target.value)}
                    required
                    placeholder="ex: HRX 476"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">N° série (optionnel)</label>
                <input
                  type="text"
                  value={numeroSerie}
                  onChange={(e) => setNumeroSerie(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Panne déclarée *</label>
                <textarea
                  value={panneDeclaree}
                  onChange={(e) => setPanneDeclaree(e.target.value)}
                  required
                  rows={3}
                  placeholder="Décrivez la panne..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Technicien assigné</label>
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
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!selectedClient && !isNewClient)}
            className="w-full bg-blue-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-900 disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer le ticket"}
          </button>
        </form>
      </main>
    </div>
  );
}
