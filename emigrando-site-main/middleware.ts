// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/intake";

// utilidades
const te = new TextEncoder();
function hex(buf: ArrayBuffer) {
  const b = new Uint8Array(buf);
  return [...b].map(x => x.toString(16).padStart(2, "0")).join("");
}
async function hmacSHA256(keyRaw: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    te.encode(keyRaw),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, te.encode(data));
  return hex(sig);
}

export async function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname;

  // login y assets públicos dentro de /intake
  if (pathname.startsWith(`${PROTECTED_PREFIX}/login`)) return NextResponse.next();

  if (pathname.startsWith(PROTECTED_PREFIX)) {
    const cookie = cookies.get("INTAKE_AUTH")?.value || "";
    const secret = process.env.INTAKE_SECRET;

    // si no hay secreto configurado, niega acceso por seguridad
    if (!secret) {
      const url = new URL(`${PROTECTED_PREFIX}/login`, req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    try {
      // formato: base64(payload).hex(hmac)
      const [payloadB64, sig] = cookie.split(".");
      if (!payloadB64 || !sig) throw new Error("bad cookie");

      const expected = await hmacSHA256(secret, payloadB64);
      if (expected !== sig) throw new Error("bad sig");

      const payloadJson = Buffer.from(payloadB64, "base64").toString("utf-8");
      const payload = JSON.parse(payloadJson) as { exp?: number };

      if (!payload?.exp || Date.now() > payload.exp) throw new Error("expired");

      // ok
      return NextResponse.next();
    } catch {
      const url = new URL(`${PROTECTED_PREFIX}/login`, req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/intake/:path*"],
};
