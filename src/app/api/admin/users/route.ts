import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, role: true, email: true },
  });

  return NextResponse.json(users);
}
