import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTicketNumber } from "@/lib/utils";
import { sendNewTicket } from "@/lib/email";

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const url = req.nextUrl;
  const statut = url.searchParams.get("statut");
  const technicienId = url.searchParams.get("technicienId");
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (statut) where.statut = statut;
  if (technicienId) where.technicienId = technicienId;
  if (search) {
    where.OR = [
      { numero: { contains: search, mode: "insensitive" } },
      { materiel: { contains: search, mode: "insensitive" } },
      { client: { nom: { contains: search, mode: "insensitive" } } },
      { client: { prenom: { contains: search, mode: "insensitive" } } },
    ];
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      client: { select: { nom: true, prenom: true, email: true, telephone: true } },
      technicien: { select: { nom: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, clientEmail, clientNom, clientPrenom, clientTelephone, materiel, marque, modele, numeroSerie, panneDeclaree, technicienId } = body;

  // Find or create client
  let finalClientId = clientId;
  if (!finalClientId && clientEmail) {
    let client = await prisma.client.findUnique({ where: { email: clientEmail } });
    if (!client) {
      client = await prisma.client.create({
        data: { email: clientEmail, nom: clientNom, prenom: clientPrenom, telephone: clientTelephone },
      });
    }
    finalClientId = client.id;
  }

  if (!finalClientId) {
    return NextResponse.json({ error: "Client requis" }, { status: 400 });
  }

  // Generate ticket number
  const year = new Date().getFullYear();
  const count = await prisma.ticket.count({
    where: { numero: { startsWith: `SAV-${year}` } },
  });
  const numero = generateTicketNumber(count);

  const ticket = await prisma.ticket.create({
    data: {
      numero,
      clientId: finalClientId,
      materiel,
      marque,
      modele,
      numeroSerie,
      panneDeclaree,
      technicienId,
      historique: {
        create: { statut: "RECU", note: "Dépôt du matériel" },
      },
    },
    include: { client: true },
  });

  // Send email to client
  try {
    await sendNewTicket(ticket.client.email, ticket.numero, ticket.materiel);
  } catch (e) {
    console.error("Failed to send new ticket email:", e);
  }

  return NextResponse.json(ticket);
}
