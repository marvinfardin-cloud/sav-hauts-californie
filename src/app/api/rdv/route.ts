import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendRdvConfirmation } from "@/lib/email";
import { formatDateLong, formatTime } from "@/lib/utils";

export async function GET() {
  const client = await getClient();
  if (!client) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const rdvs = await prisma.rendezVous.findMany({
    where: { clientId: client.id },
    orderBy: { dateHeure: "desc" },
  });

  return NextResponse.json(rdvs);
}

export async function POST(req: NextRequest) {
  const client = await getClient();
  if (!client) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { dateHeure, type, notes } = body;

  if (!dateHeure || !type) {
    return NextResponse.json({ error: "Date et type requis" }, { status: 400 });
  }

  const rdv = await prisma.rendezVous.create({
    data: {
      clientId: client.id,
      dateHeure: new Date(dateHeure),
      type,
      notes,
    },
  });

  try {
    await sendRdvConfirmation(
      client.email,
      formatDateLong(rdv.dateHeure),
      formatTime(rdv.dateHeure),
      rdv.type
    );
  } catch (e) {
    console.error("Failed to send RDV confirmation email:", e);
  }

  return NextResponse.json(rdv);
}
