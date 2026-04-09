import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, nom, prenom, telephone } = body;

  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  // Find or prepare to create client on verification
  let client = await prisma.client.findUnique({ where: { email } });

  if (!client && (!nom || !prenom)) {
    return NextResponse.json({ needsRegistration: true });
  }

  // Create magic link token stored as a session with short expiry
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  if (!client) {
    // Create client first
    client = await prisma.client.create({
      data: { email, nom, prenom, telephone },
    });
  }

  await prisma.session.create({
    data: { clientId: client.id, token, expiresAt },
  });

  try {
    await sendMagicLink(email, token);
  } catch (e) {
    console.error("Failed to send email:", e);
    // In development, return token directly for testing
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({ success: true, devToken: token });
    }
  }

  return NextResponse.json({ success: true });
}
