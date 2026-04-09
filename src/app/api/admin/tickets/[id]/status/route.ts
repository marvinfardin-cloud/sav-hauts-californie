import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendStatusChange } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const { statut, note } = await req.json();

  if (!statut) {
    return NextResponse.json({ error: "Statut requis" }, { status: 400 });
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      statut,
      historique: {
        create: { statut, note },
      },
    },
    include: { client: true },
  });

  // Send email notification
  try {
    await sendStatusChange(
      ticket.client.email,
      ticket.materiel,
      ticket.numero,
      statut
    );
  } catch (e) {
    console.error("Failed to send status change email:", e);
  }

  return NextResponse.json(ticket);
}
