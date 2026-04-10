import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const isAdmin = req.nextUrl.searchParams.get("admin") === "true";
  const cookieName = isAdmin ? "admin_session_token" : "session_token";
  const token = req.cookies.get(cookieName)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  // Clear the cookie on the response
  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
