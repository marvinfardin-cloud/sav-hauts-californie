import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { sendStaffMagicLink } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal that the user doesn't exist
    return NextResponse.json({ success: true });
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.session.create({
    data: { userId: user.id, token, expiresAt },
  });

  try {
    await sendStaffMagicLink(email, token);
  } catch (e) {
    console.error("Failed to send email:", e);
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({ success: true, devToken: token });
    }
  }

  return NextResponse.json({ success: true });
}
