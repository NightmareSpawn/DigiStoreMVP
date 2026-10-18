import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "./db";

const SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
const COOKIE_NAME = "session";

export type SessionPayload = {
  userId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
  phone: string;
};

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

/** Set the session cookie. Call from a Route Handler or Server Action. */
export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

/** Read + verify the current session from cookies (server-only). */
export function getSession(): SessionPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Load the full current user row (server-only). Returns null if not logged in. */
export async function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  return user;
}

/** Throws-free guard: returns the user only if they hold one of the allowed roles. */
export async function requireRole(roles: SessionPayload["role"][]) {
  const session = getSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}
