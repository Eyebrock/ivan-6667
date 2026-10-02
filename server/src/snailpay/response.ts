import { randomUUID, randomInt } from "node:crypto";
import type { PaymentStatus, SnailpayTransaction } from "./types.js";

const asString = (v: unknown) => (typeof v === "string" ? v : null);
const asNumber = (v: unknown) => (typeof v === "number" ? v : null);

export function buildResponse(
  body: unknown,
  status: typeof PaymentStatus[keyof typeof PaymentStatus],
  status_detail: string,
  extra: Partial<SnailpayTransaction> = {}
): SnailpayTransaction {
  const raw = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const id = randomUUID();

  return {
    id,
    status,
    status_detail,
    transaction_amount: asNumber(raw.amount),
    date_created: new Date().toISOString(),
    authorization_code: status === "COMPLETED" ? String(randomInt(100000, 999999)) : null,
    reference: `SP-${id.slice(0, 8).toUpperCase()}`,
    payer_id: asString(raw.payer_id),
    payer_email: asString(raw.payer_email),
    card_number: asString(raw.card_number),
    cvv: asString(raw.cvv),
    ...extra,
  };
}