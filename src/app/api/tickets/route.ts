import { NextResponse } from "next/server";
import { getClient } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const client = await getClient();
  if (!client) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const tickets = await prisma.ticket.findMany({
    where: { clientId: client.id },
    include: {
      historique: { orderBy: { createdAt: "desc" } },
      photos: true,
      technicien: { select: { nom: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}
