"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import ProgressBar from "@/components/ProgressBar";
import Footer from "@/components/Footer";
import { STATUT_CONFIG, StatutKey, SHOP_PHONE } from "@/lib/constants";

interface HistoriqueEntry {
  id: string;
  statut: string;
  note: string | null;
  createdAt: string;
}

interface Photo {
  id: string;
  url: string;
  type: string;
  createdAt: string;
}

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
  technicien: { nom: string } | null;
  historique: HistoriqueEntry[];
  photos: Photo[];
}

export default function ClientTicketDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tickets/${id}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setTicket(data);
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Ticket non trouvé.</p>
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const avantPhotos = ticket.photos.filter((p) => p.type === "avant");
  const apresPhotos = ticket.photos.filter((p) => p.type === "apres");

  return (
    <div className="min-h-screen flex flex-col">
      <Header type="client" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <button
          onClick={() => router.push("/client/dashboard")}
          className="text-sm text-blue-800 hover:underline mb-4 inline-block"
        >
          &larr; Retour à mes réparations
        </button>

        {ticket.statut === "PRET" && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
            <p className="text-green-800 font-semibold text-lg">
              Votre matériel est prêt à être récupéré !
            </p>
            <p className="text-green-700 text-sm mt-1">
              Venez le récupérer aux horaires du SAV. Pour toute question : {SHOP_PHONE}
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{ticket.materiel}</h1>
              <p className="text-sm text-gray-500">
                {ticket.marque} {ticket.modele}
              </p>
            </div>
            <StatusBadge statut={ticket.statut} />
          </div>

          <div className="mb-6 py-3">
            <ProgressBar statut={ticket.statut} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">N° dossier</span>
              <p className="font-medium">{ticket.numero}</p>
            </div>
            <div>
              <span className="text-gray-500">Date de dépôt</span>
              <p className="font-medium">{formatDate(ticket.dateDepot)}</p>
            </div>
            {ticket.numeroSerie && (
              <div>
                <span className="text-gray-500">N° série</span>
                <p className="font-medium">{ticket.numeroSerie}</p>
              </div>
            )}
            {ticket.dateEstimee && (
              <div>
                <span className="text-gray-500">Date estimée</span>
                <p className="font-medium">{formatDate(ticket.dateEstimee)}</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Panne déclarée</span>
            <p className="mt-1 text-gray-900">{ticket.panneDeclaree}</p>
          </div>

          {ticket.notesPubliques && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Notes du technicien</span>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{ticket.notesPubliques}</p>
            </div>
          )}
        </div>

        {/* Photos */}
        {(avantPhotos.length > 0 || apresPhotos.length > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Photos</h2>
            {avantPhotos.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm text-gray-500 mb-2">Avant réparation</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {avantPhotos.map((p) => (
                    <img key={p.id} src={p.url} alt="Avant" className="rounded-lg w-full h-32 object-cover" />
                  ))}
                </div>
              </div>
            )}
            {apresPhotos.length > 0 && (
              <div>
                <h3 className="text-sm text-gray-500 mb-2">Après réparation</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {apresPhotos.map((p) => (
                    <img key={p.id} src={p.url} alt="Après" className="rounded-lg w-full h-32 object-cover" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Historique</h2>
          <div className="space-y-4">
            {ticket.historique.map((entry, i) => {
              const config = STATUT_CONFIG[entry.statut as StatutKey];
              return (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${config?.dotColor || "bg-gray-300"}`} />
                    {i < ticket.historique.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-sm text-gray-900">
                      {config?.label || entry.statut}
                    </p>
                    {entry.note && (
                      <p className="text-sm text-gray-600 mt-0.5">{entry.note}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(entry.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
