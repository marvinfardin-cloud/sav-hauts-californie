import { NextResponse } from "next/server";
import { getClient, getUser } from "@/lib/auth";

export async function GET() {
  const client = await getClient();
  if (client) {
    return NextResponse.json({ type: "client", user: client });
  }

  const user = await getUser();
  if (user) {
    return NextResponse.json({ type: "staff", user });
  }

  return NextResponse.json({ user: null }, { status: 401 });
}
