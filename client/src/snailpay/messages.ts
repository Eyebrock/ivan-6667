import { PaymentStatus, type SnailpayTransaction } from "./types";

const DETAIL_MESSAGES: Record<string, string> = {
  accredited: "Tu recarga fue aprobada.",
  invalid_request: "Revisa los datos ingresados e intenta de nuevo.",
  system_unavailable: "SnailPay no está disponible en este momento. Intenta más tarde.",
  cc_rejected_insufficient_funds: "Tu tarjeta no tiene fondos suficientes.",
  cc_rejected_high_risk: "Tu tarjeta fue rechazada por seguridad.",
  cc_rejected_bad_filled_date: "La fecha de vencimiento es incorrecta.",
  cc_rejected_bad_filled_security_code: "El código de seguridad es incorrecto.",
  cc_rejected_other_reason: "Tu tarjeta fue rechazada.",
};

export function getUserMessage(tx: Pick<SnailpayTransaction, "status" | "status_detail">): string {
  return DETAIL_MESSAGES[tx.status_detail] ?? "No pudimos procesar la recarga. Intenta de nuevo.";
}

export function isApproved(tx: Pick<SnailpayTransaction, "status">): boolean {
  return tx.status === PaymentStatus.COMPLETED;
}