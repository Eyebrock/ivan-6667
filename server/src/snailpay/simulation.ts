import type { Request } from "express";

const MAX_DELAY_MS = 30_000;

export function shouldSimulateSystemError(req: Request): boolean {
  return (
    process.env.SNAILPAY_DOWN === "true" ||
    req.header("x-snailpay-simulate") === "system_error"
  );
}

export function requestedDelayMs(req: Request): number {
  const ms = Number(req.header("x-snailpay-delay-ms"));
  return Number.isFinite(ms) && ms > 0 ? Math.min(ms, MAX_DELAY_MS) : 0;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));