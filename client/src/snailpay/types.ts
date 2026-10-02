export const PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type PaymentStatusValue = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface SnailpayTransaction {
  id: string;
  status: PaymentStatusValue;
  status_detail: string;
  transaction_amount: number | null;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string | null;
  payer_email: string | null;
  card_number: string | null;
  cvv: string | null;
  errors?: { field: string; message: string }[];
}

export interface PaymentRequest {
  card_number: string;
  expiration_date: string;
  cvv: string;
  full_name: string;
  amount: number;
  payer_id: string;
  payer_email: string;
}