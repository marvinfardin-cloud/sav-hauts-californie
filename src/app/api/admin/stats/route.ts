import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const [
    totalTickets,
    ticketsByStatut,
    urgentTickets,
    todayRdvs,
    recentTickets,
  ] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.groupBy({
      by: ["statut"],
      _count: { id: true },
    }),
    prisma.ticket.findMany({
      where: {
        dateEstimee: { lt: new Date() },
        statut: { notIn: ["PRET", "LIVRE"] },
      },
      include: {
        client: { select: { nom: true, prenom: true } },
        technicien: { select: { nom: true } },
      },
      orderBy: { dateEstimee: "asc" },
    }),
    prisma.rendezVous.findMany({
      where: {
        dateHeure: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      include: {
        client: { select: { nom: true, prenom: true, telephone: true } },
      },
      orderBy: { dateHeure: "asc" },
    }),
    prisma.ticket.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { nom: true, prenom: true } },
        technicien: { select: { nom: true } },
      },
    }),
  ]);

  const statutCounts = Object.fromEntries(
    ticketsByStatut.map((s) => [s.statut, s._count.id])
  );

  return NextResponse.json({
    totalTickets,
    statutCounts,
    urgentTickets,
    todayRdvs,
    recentTickets,
  });
}
