import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.dateHeure) data.dateHeure = new Date(body.dateHeure);
  if (body.statut) data.statut = body.statut;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.duree) data.duree = body.duree;

  const rdv = await prisma.rendezVous.update({
    where: { id },
    data,
    include: {
      client: { select: { nom: true, prenom: true, telephone: true } },
    },
  });

  return NextResponse.json(rdv);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.rendezVous.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
