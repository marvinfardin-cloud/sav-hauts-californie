import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      tickets: {
        include: {
          technicien: { select: { nom: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      rendezvous: { orderBy: { dateHeure: "desc" } },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
  }

  return NextResponse.json(client);
}
