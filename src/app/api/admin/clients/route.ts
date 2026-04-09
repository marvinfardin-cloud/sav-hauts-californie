import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.get("search");

  const where = search
    ? {
        OR: [
          { nom: { contains: search, mode: "insensitive" as const } },
          { prenom: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const clients = await prisma.client.findMany({
    where,
    include: {
      _count: { select: { tickets: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}
