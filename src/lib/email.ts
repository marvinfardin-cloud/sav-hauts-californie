import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

const FOOTER = `
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
<p style="font-size:13px;color:#6b7280;line-height:1.5;">
  <strong>Les Hauts de Californie</strong> — 97232 Le Lamentin<br />
  Tél : 05.96.42.75.00 — zingzag10@hotmail.fr<br />
  SAV : Lun-Jeu 7h-12h / 13h-16h | Ven 7h-12h / 13h-15h
</p>
`;

function wrap(body: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h2 style="color:#1e40af;margin:0;">Les Hauts de Californie</h2>
        <p style="color:#6b7280;margin:4px 0 0;">Service Après-Vente</p>
      </div>
      ${body}
      ${FOOTER}
    </div>
  `;
}

const FROM = process.env.EMAIL_FROM || "SAV Les Hauts de Californie <noreply@hauts-californie.fr>";

export async function sendMagicLink(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Accédez à votre espace SAV - Les Hauts de Californie",
    html: wrap(`
      <p>Bonjour,</p>
      <p>Cliquez sur le bouton ci-dessous pour accéder à votre espace SAV :</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${url}" style="background-color:#1e40af;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Accéder à mon espace SAV
        </a>
      </div>
      <p style="font-size:13px;color:#6b7280;">Ce lien est valable 15 minutes. Si vous n'avez pas demandé ce lien, ignorez cet email.</p>
    `),
  });
}

const STATUT_LABELS: Record<string, string> = {
  RECU: "Reçu",
  DIAGNOSTIC: "En diagnostic",
  ATTENTE_PIECES: "En attente de pièces",
  EN_REPARATION: "En réparation",
  PRET: "Prêt à récupérer",
  LIVRE: "Livré",
};

export async function sendNewTicket(email: string, numero: string, materiel: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Votre matériel a été enregistré - ${numero}`,
    html: wrap(`
      <p>Bonjour,</p>
      <p>Votre matériel <strong>${materiel}</strong> a bien été enregistré sous le numéro <strong>${numero}</strong>.</p>
      <p>Vous pouvez suivre l'avancement de votre réparation depuis votre espace client :</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color:#1e40af;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Suivre ma réparation
        </a>
      </div>
    `),
  });
}

export async function sendStatusChange(
  email: string,
  materiel: string,
  numero: string,
  statut: string
) {
  const label = STATUT_LABELS[statut] || statut;
  const isPret = statut === "PRET";

  const extraMessage = isPret
    ? `
      <div style="background-color:#dcfce7;border:1px solid #16a34a;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:#16a34a;font-weight:bold;font-size:16px;margin:0 0 8px;">
          ✅ Votre matériel est prêt à être récupéré !
        </p>
        <p style="margin:0;color:#333;">
          Vous pouvez venir le récupérer aux horaires du SAV :<br />
          <strong>Lun-Jeu :</strong> 7h-12h / 13h-16h<br />
          <strong>Vendredi :</strong> 7h-12h / 13h-15h<br /><br />
          📞 Pour toute question : <strong>05.96.42.75.00</strong>
        </p>
      </div>
    `
    : "";

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: isPret
      ? `✅ Votre ${materiel} est prêt ! - ${numero}`
      : `Mise à jour de votre réparation - ${numero}`,
    html: wrap(`
      <p>Bonjour,</p>
      <p>Le statut de votre <strong>${materiel}</strong> (dossier ${numero}) a été mis à jour :</p>
      <div style="text-align:center;margin:16px 0;">
        <span style="background-color:#f3f4f6;padding:8px 16px;border-radius:20px;font-weight:bold;font-size:16px;">
          ${label}
        </span>
      </div>
      ${extraMessage}
      <div style="text-align:center;margin:24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color:#1e40af;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Voir le détail
        </a>
      </div>
    `),
  });
}

export async function sendRdvConfirmation(
  email: string,
  date: string,
  heure: string,
  type: string
) {
  const typeLabel =
    type === "depot" ? "Dépôt matériel" : type === "retrait" ? "Retrait" : "Diagnostic";

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Confirmation de rendez-vous - ${typeLabel}`,
    html: wrap(`
      <p>Bonjour,</p>
      <p>Votre rendez-vous a bien été confirmé :</p>
      <div style="background-color:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;"><strong>Type :</strong> ${typeLabel}</p>
        <p style="margin:8px 0 0;"><strong>Date :</strong> ${date}</p>
        <p style="margin:8px 0 0;"><strong>Heure :</strong> ${heure}</p>
      </div>
      <p><strong>Rappel des horaires SAV :</strong></p>
      <p>
        Lun-Jeu : 7h-12h / 13h-16h<br />
        Vendredi : 7h-12h / 13h-15h
      </p>
      <p>📞 05.96.42.75.00</p>
    `),
  });
}
