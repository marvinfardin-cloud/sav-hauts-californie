import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      client: true,
      technicien: true,
      historique: { orderBy: { createdAt: "desc" } },
      photos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket non trouvé" }, { status: 404 });
  }

  return NextResponse.json(ticket);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { notesPubliques, notesPrivees, dateEstimee, technicienId } = body;

  const data: Record<string, unknown> = {};
  if (notesPubliques !== undefined) data.notesPubliques = notesPubliques;
  if (notesPrivees !== undefined) data.notesPrivees = notesPrivees;
  if (dateEstimee !== undefined) data.dateEstimee = dateEstimee ? new Date(dateEstimee) : null;
  if (technicienId !== undefined) data.technicienId = technicienId || null;

  const ticket = await prisma.ticket.update({
    where: { id },
    data,
    include: { client: true, technicien: true },
  });

  return NextResponse.json(ticket);
}
