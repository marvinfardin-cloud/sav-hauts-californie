import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (from && to) {
    where.dateHeure = {
      gte: new Date(from),
      lte: new Date(to),
    };
  }

  const rdvs = await prisma.rendezVous.findMany({
    where,
    include: {
      client: { select: { nom: true, prenom: true, telephone: true } },
    },
    orderBy: { dateHeure: "asc" },
  });

  return NextResponse.json(rdvs);
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, dateHeure, type, notes, duree } = body;

  const rdv = await prisma.rendezVous.create({
    data: {
      clientId,
      dateHeure: new Date(dateHeure),
      type,
      notes,
      duree: duree || 30,
    },
    include: {
      client: { select: { nom: true, prenom: true, telephone: true } },
    },
  });

  return NextResponse.json(rdv);
}
