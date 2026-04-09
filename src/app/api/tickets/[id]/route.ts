import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await getClient();
  if (!client) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await prisma.ticket.findFirst({
    where: { id, clientId: client.id },
    include: {
      historique: { orderBy: { createdAt: "desc" } },
      photos: { orderBy: { createdAt: "desc" } },
      technicien: { select: { nom: true } },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket non trouvé" }, { status: 404 });
  }

  return NextResponse.json(ticket);
}
