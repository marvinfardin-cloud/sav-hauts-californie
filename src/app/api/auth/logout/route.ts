import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const isAdmin = req.nextUrl.searchParams.get("admin") === "true";
  const cookieName = isAdmin ? "admin_session_token" : "session_token";
  const token = cookieStore.get(cookieName)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    cookieStore.delete(cookieName);
  }

  return NextResponse.json({ success: true });
}
