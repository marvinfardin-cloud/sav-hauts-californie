import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClientSession } from "@/lib/auth";

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

  // Set cookie directly on the redirect response
  const response = NextResponse.redirect(new URL("/client/dashboard", req.url));
  response.cookies.set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return response;
}
