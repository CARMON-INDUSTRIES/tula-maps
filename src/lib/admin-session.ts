import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "tula_obras_admin";
export const ADMIN_SESSION_SECONDS = 4 * 60 * 60;

export function passwordMatches(password: unknown): boolean {
  const expected = process.env.OBRAS_ADMIN_PASSWORD;
  if (!expected || typeof password !== "string" || password.length > 256) return false;
  return timingSafeEqual(createHash("sha256").update(password).digest(), createHash("sha256").update(expected).digest());
}

function signature(payload: string): string {
  const secret = process.env.OBRAS_SESSION_SECRET;
  if (!secret) throw new Error("Falta configurar la sesión de administración.");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createAdminSession(now = Date.now()): string {
  const payload = `${Math.floor(now / 1000) + ADMIN_SESSION_SECONDS}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${signature(payload)}`;
}

export function isAdminSession(token: string | undefined, now = Date.now()): boolean {
  if (!token || !process.env.OBRAS_SESSION_SECRET || token.length > 200) return false;
  const [expires, nonce, signed, ...extra] = token.split(".");
  if (extra.length || !/^\d+$/.test(expires ?? "") || !/^[a-f0-9]{32}$/.test(nonce ?? "") || !/^[a-f0-9]{64}$/.test(signed ?? "")) return false;
  const expiration = Number(expires);
  if (expiration <= Math.floor(now / 1000) || expiration > Math.floor(now / 1000) + ADMIN_SESSION_SECONDS) return false;
  return timingSafeEqual(Buffer.from(signed, "hex"), Buffer.from(signature(`${expires}.${nonce}`), "hex"));
}
