import { cookies } from "next/headers";
import { prisma } from "./prisma";
import crypto from "crypto";

// Generate a secure random token
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Create a session for a client
export async function createClientSession(clientId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: { clientId, token, expiresAt },
  });

  return token;
}

// Create a session for a staff user
export async function createUserSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  return token;
}

// Get the current client from session cookie
export async function getClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { client: true },
  });

  if (!session || !session.client || session.expiresAt < new Date()) {
    return null;
  }

  return session.client;
}

// Get the current staff user from session cookie
export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session_token")?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({ where: { token } });

  if (!session || !session.userId || session.expiresAt < new Date()) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  return user;
}
