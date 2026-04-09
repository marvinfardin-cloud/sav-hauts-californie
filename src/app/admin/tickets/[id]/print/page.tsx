import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { STATUT_CONFIG, StatutKey, SHOP_NAME, SHOP_ADDRESS, SHOP_PHONE, SHOP_EMAIL } from "@/lib/constants";

export default async function PrintTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      client: true,
      technicien: true,
      historique: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!ticket) notFound();

  const config = STATUT_CONFIG[ticket.statut as StatutKey];
  const formatDate = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <html>
      <head>
        <title>Ticket {ticket.numero} — {SHOP_NAME}</title>
        <style>{`
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
          h1 { font-size: 20px; margin: 0; }
          h2 { font-size: 14px; color: #666; margin: 16px 0 8px; text-transform: uppercase; }
          .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #1e40af; padding-bottom: 16px; margin-bottom: 16px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .field { margin-bottom: 4px; }
          .label { font-size: 11px; color: #666; text-transform: uppercase; }
          .value { font-size: 13px; font-weight: 600; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #f3f4f6; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f9fafb; font-weight: 600; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #666; text-align: center; }
          .signature { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
          .signature-box { border-top: 1px solid #333; padding-top: 8px; font-size: 11px; text-align: center; }
        `}</style>
      </head>
      <body>
        {/* Print button with inline JS since this is a server component */}
        <div className="no-print" style={{ marginBottom: "16px" }}>
          <a href="javascript:window.print()" style={{ padding: "8px 16px", cursor: "pointer", display: "inline-block", background: "#1e40af", color: "white", textDecoration: "none", borderRadius: "6px" }}>
            Imprimer
          </a>
        </div>

        <div className="header">
          <div>
            <h1>{SHOP_NAME}</h1>
            <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0" }}>
              {SHOP_ADDRESS} — {SHOP_PHONE}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "18px", fontWeight: "bold", fontFamily: "monospace" }}>{ticket.numero}</p>
            <span className="status">{config?.label || ticket.statut}</span>
          </div>
        </div>

        <h2>Client</h2>
        <div className="grid">
          <div className="field">
            <div className="label">Nom</div>
            <div className="value">{ticket.client.prenom} {ticket.client.nom}</div>
          </div>
          <div className="field">
            <div className="label">Email</div>
            <div className="value">{ticket.client.email}</div>
          </div>
          {ticket.client.telephone && (
            <div className="field">
              <div className="label">Téléphone</div>
              <div className="value">{ticket.client.telephone}</div>
            </div>
          )}
        </div>

        <h2>Matériel</h2>
        <div className="grid">
          <div className="field">
            <div className="label">Description</div>
            <div className="value">{ticket.materiel}</div>
          </div>
          <div className="field">
            <div className="label">Marque / Modèle</div>
            <div className="value">{ticket.marque} {ticket.modele}</div>
          </div>
          {ticket.numeroSerie && (
            <div className="field">
              <div className="label">N° série</div>
              <div className="value">{ticket.numeroSerie}</div>
            </div>
          )}
          <div className="field">
            <div className="label">Date de dépôt</div>
            <div className="value">{formatDate(ticket.dateDepot)}</div>
          </div>
          {ticket.dateEstimee && (
            <div className="field">
              <div className="label">Date estimée</div>
              <div className="value">{formatDate(ticket.dateEstimee)}</div>
            </div>
          )}
          {ticket.technicien && (
            <div className="field">
              <div className="label">Technicien</div>
              <div className="value">{ticket.technicien.nom}</div>
            </div>
          )}
        </div>

        <h2>Panne déclarée</h2>
        <p style={{ fontSize: "13px" }}>{ticket.panneDeclaree}</p>

        {ticket.notesPubliques && (
          <>
            <h2>Notes</h2>
            <p style={{ fontSize: "13px", whiteSpace: "pre-wrap" }}>{ticket.notesPubliques}</p>
          </>
        )}

        <h2>Historique</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Statut</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {ticket.historique.map((h) => (
              <tr key={h.id}>
                <td>{formatDate(h.createdAt)}</td>
                <td>{STATUT_CONFIG[h.statut as StatutKey]?.label || h.statut}</td>
                <td>{h.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="signature">
          <div>
            <div className="signature-box">Signature client</div>
          </div>
          <div>
            <div className="signature-box">Signature atelier</div>
          </div>
        </div>

        <div className="footer">
          {SHOP_NAME} — {SHOP_ADDRESS} — {SHOP_PHONE} — {SHOP_EMAIL}
        </div>
      </body>
    </html>
  );
}
