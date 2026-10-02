import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Ingresa tu nombre completo"),
    email: z.string().trim().email("Correo no válido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Za-z]/, "Debe incluir una letra")
      .regex(/\d/, "Debe incluir un número"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });