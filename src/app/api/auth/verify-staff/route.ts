import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserSession, setSessionCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", req.url));
  }

  const session = await prisma.session.findUnique({ where: { token } });

  if (!session || !session.userId || session.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/admin/login?error=expired", req.url));
  }

  // Delete the magic link session
  await prisma.session.delete({ where: { id: session.id } });

  // Create a real session
  const sessionToken = await createUserSession(session.userId);
  await setSessionCookie(sessionToken, "admin_session_token");

  return NextResponse.redirect(new URL("/admin", req.url));
}
