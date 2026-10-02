import type { PaymentRequest } from "./schemas.js";
import type { PaymentStatus } from "./types.js";

const SUCCESS_CARD = { number: "1234123412341234", expiration: "12/26", cvv: "543" };

const REJECTED_CARDS: Record<string, string> = {
  "4000000000000002": "cc_rejected_insufficient_funds",
  "4000000000000127": "cc_rejected_high_risk",
};

export interface ChargeOutcome {
  httpStatus: number;
  status: typeof PaymentStatus[keyof typeof PaymentStatus];
  status_detail: string;
}

export function evaluateCharge(req: PaymentRequest): ChargeOutcome {
  const rejected = (status_detail: string): ChargeOutcome => ({
    httpStatus: 402,
    status: "FAILED",
    status_detail,
  });

  const knownRejection = REJECTED_CARDS[req.card_number];
  if (knownRejection) return rejected(knownRejection);

  if (req.card_number !== SUCCESS_CARD.number) return rejected("cc_rejected_other_reason");
  if (req.expiration_date !== SUCCESS_CARD.expiration) return rejected("cc_rejected_bad_filled_date");
  if (req.cvv !== SUCCESS_CARD.cvv) return rejected("cc_rejected_bad_filled_security_code");

  return { httpStatus: 201, status: "COMPLETED", status_detail: "accredited" };
}