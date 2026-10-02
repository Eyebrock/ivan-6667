import { z } from "zod";

export const rechargeSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "16 dígitos, sin espacios"),
  expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato MM/AA"),
  cvv: z.string().regex(/^\d{3}$/, "3 dígitos"),
  fullName: z.string().trim().min(1, "Ingresa el nombre del titular"),
  amount: z.coerce.number().positive("Debe ser mayor que cero").max(50_000, "Máximo 50,000"),
});