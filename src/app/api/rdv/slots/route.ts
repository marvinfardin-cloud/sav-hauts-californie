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

  // Generate 30-minute slots as "YYYY-MM-DDTHH:mm" strings (local Martinique time)
  const slots: string[] = [];
  for (const [start, end] of ranges) {
    for (let h = start; h < end; h++) {
      for (const m of [0, 30]) {
        if (h === end - 1 && m === 30) continue;
        const hStr = String(h).padStart(2, "0");
        const mStr = String(m).padStart(2, "0");
        slots.push(`${dateStr}T${hStr}:${mStr}`);
      }
    }
  }

  // Check existing appointments
  const startOfDay = new Date(`${dateStr}T00:00:00`);
  const endOfDay = new Date(`${dateStr}T23:59:59`);

  const existing = await prisma.rendezVous.findMany({
    where: {
      dateHeure: { gte: startOfDay, lte: endOfDay },
      statut: { not: "annule" },
    },
  });

  const MAX_PER_SLOT = 3;
  const available = slots.filter((slot) => {
    const count = existing.filter((rdv) => {
      const rdvStr = rdv.dateHeure.toISOString().slice(0, 16);
      const rdvLocal = new Date(rdv.dateHeure);
      const localStr = `${dateStr}T${String(rdvLocal.getUTCHours()).padStart(2, "0")}:${String(rdvLocal.getUTCMinutes()).padStart(2, "0")}`;
      return localStr === slot;
    }).length;
    return count < MAX_PER_SLOT;
  });

  return NextResponse.json({ slots: available });
}
