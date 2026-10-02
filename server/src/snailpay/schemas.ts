import { z } from "zod";

export const paymentRequestSchema = z.object({
  card_number: z.string().regex(/^\d{16}$/, "Debe tener 16 dígitos"),
  expiration_date: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato MM/AA"),
  cvv: z.string().regex(/^\d{3}$/, "Debe tener 3 dígitos"),
  full_name: z.string().trim().min(1, "Requerido"),
  amount: z.number().positive("Debe ser mayor que cero").max(50_000, "Máximo 50,000"),
  payer_id: z.string().min(1, "Requerido"),
  payer_email: z.string().email("Correo no válido"),
});

export type PaymentRequest = z.infer<typeof paymentRequestSchema>;