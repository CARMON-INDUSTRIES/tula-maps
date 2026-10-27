import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "tula_obras_admin";
export const ADMIN_SESSION_SECONDS = 4 * 60 * 60;
export const LOGIN_ATTEMPTS_COOKIE = "tula_obras_intentos";
export const LOGIN_LOCK_SECONDS = 15 * 60;
export const MAX_LOGIN_ATTEMPTS = 3;

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

// shortcut: límite por navegador con cookie firmada; un bloqueo global requiere almacenamiento compartido.
export function readLoginAttempts(token: string | undefined, now = Date.now()) {
  const empty = { failed: 0, expires: 0 };
  if (!token || token.length > 200 || !process.env.OBRAS_SESSION_SECRET) return empty;
  const [kind, count, expiration, signed, ...extra] = token.split(".");
  if (extra.length || kind !== "attempts" || !/^[1-3]$/.test(count ?? "") || !/^\d+$/.test(expiration ?? "") || !/^[a-f0-9]{64}$/.test(signed ?? "")) return empty;
  const expires = Number(expiration);
  if (expires <= Math.floor(now / 1000) || expires > Math.floor(now / 1000) + LOGIN_LOCK_SECONDS) return empty;
  if (!timingSafeEqual(Buffer.from(signed, "hex"), Buffer.from(signature(`${kind}.${count}.${expiration}`), "hex"))) return empty;
  return { failed: Number(count), expires };
}

export function createLoginAttempt(failed: number, now = Date.now()) {
  const payload = `attempts.${Math.min(MAX_LOGIN_ATTEMPTS, Math.max(1, failed))}.${Math.floor(now / 1000) + LOGIN_LOCK_SECONDS}`;
  return `${payload}.${signature(payload)}`;
}
