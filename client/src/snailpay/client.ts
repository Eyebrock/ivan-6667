import type { PaymentRequest, SnailpayTransaction } from "./types";

const TIMEOUT_MS = 8000;

export class SnailPayTimeoutError extends Error {
  constructor() {
    super("La solicitud tardó demasiado. Intenta de nuevo.");
    this.name = "SnailPayTimeoutError";
  }
}

export class SnailPayNetworkError extends Error {
  constructor() {
    super("No se pudo conectar con el servicio de pagos.");
    this.name = "SnailPayNetworkError";
  }
}

export async function chargeSnailPay(payload: PaymentRequest): Promise<SnailpayTransaction> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("/api/snailpay/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    return (await res.json()) as SnailpayTransaction;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new SnailPayTimeoutError();
    }
    throw new SnailPayNetworkError();
  } finally {
    clearTimeout(timer);
  }
}