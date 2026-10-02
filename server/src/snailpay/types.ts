export const PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;


export type SnailpayTransaction = {
 id: string;
  status: typeof PaymentStatus[keyof typeof PaymentStatus];
  status_detail: string;
  transaction_amount: number | null;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string | null;
  payer_email: string | null;
  card_number: string | null;
  cvv: string | null;
  // Solo en errores de validación
  errors?: { field: string; message: string }[];
};