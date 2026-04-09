import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClientSession, setSessionCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?error=invalid", req.url));
  }

  const session = await prisma.session.findUnique({ where: { token } });

  if (!session || !session.clientId || session.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/?error=expired", req.url));
  }

  // Delete the magic link session
  await prisma.session.delete({ where: { id: session.id } });

  // Create a real session
  const sessionToken = await createClientSession(session.clientId);
  await setSessionCookie(sessionToken);

  return NextResponse.redirect(new URL("/client/dashboard", req.url));
}
