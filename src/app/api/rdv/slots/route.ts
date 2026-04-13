import { NextRequest, NextResponse } from "next/server";
import { SAV_HOURS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const dateStr = req.nextUrl.searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ error: "Date requise" }, { status: 400 });
  }

  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const ranges = SAV_HOURS[dayOfWeek];

  if (!ranges) {
    return NextResponse.json({ slots: [] });
  }

  // Generate 30-minute slots
  const slots: string[] = [];
  for (const [start, end] of ranges) {
    for (let h = start; h < end; h++) {
      for (const m of [0, 30]) {
        if (h === end - 1 && m === 30) continue; // Don't add last half-hour slot
        const slotDate = new Date(date);
        slotDate.setUTCHours(h + 4, m, 0, 0);
        // Only future slots
        if (slotDate > new Date()) {
          slots.push(slotDate.toISOString());
        }
      }
    }
  }

  // Check existing appointments
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await prisma.rendezVous.findMany({
    where: {
      dateHeure: { gte: startOfDay, lte: endOfDay },
      statut: { not: "annule" },
    },
  });

  // Filter out slots that already have 3 appointments (max capacity)
  const MAX_PER_SLOT = 3;
  const available = slots.filter((slot) => {
    const slotTime = new Date(slot).getTime();
    const count = existing.filter(
      (rdv) => Math.abs(rdv.dateHeure.getTime() - slotTime) < 30 * 60 * 1000
    ).length;
    return count < MAX_PER_SLOT;
  });

  return NextResponse.json({ slots: available });
}
