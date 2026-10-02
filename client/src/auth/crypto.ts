const ITERATIONS = 210_000;

const toBase64 = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromBase64 = (b64: string) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function derive(password: string, salt: Uint8Array) {
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations: ITERATIONS },
    key, 256
  );
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { hash: toBase64(await derive(password, salt)), salt: toBase64(salt) };
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  const candidate = toBase64(await derive(password, fromBase64(salt)));
  return candidate === hash;
}