import { randomUUID } from "crypto";

/**
 * Resolves a client identifier for rate limiting from trusted proxy
 * headers only.
 *
 * `x-forwarded-for` is intentionally NOT used: it is client-suppliable
 * and can be spoofed by any caller to pick an arbitrary bucket (or to
 * collide with another user's bucket) unless every hop in front of the
 * app is known to strip/overwrite it, which we cannot guarantee here.
 *
 * Instead we only trust headers that a specific, known edge/proxy layer
 * sets and that are not passed through from the original client:
 *  - `cf-connecting-ip`: set by Cloudflare at the edge (only trustworthy
 *    when the app is actually deployed behind Cloudflare).
 *  - `x-real-ip`: conventionally set by a trusted reverse proxy
 *    (nginx/ingress) that overwrites it rather than forwarding it.
 *
 * If neither trusted header is present we do NOT fall back to a shared
 * `'unknown'` string bucket, since that would let unrelated clients pool
 * into (and rate-limit) one another, or let an attacker deliberately
 * omit headers to hide inside a shared bucket. Instead we return a
 * unique per-request identifier so each such request gets its own,
 * unshared bucket.
 */
export function getClientIp(headers: Headers | null | undefined): string {
  const cfIp = headers?.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  const realIp = headers?.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return `untrusted:${randomUUID()}`;
}
