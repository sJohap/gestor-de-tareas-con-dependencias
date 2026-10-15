import { z } from "zod";

const email = z
  .string("El correo es obligatorio")
  .trim()
  .toLowerCase()
  .pipe(z.email("El correo no es válido").max(254, "El correo es demasiado largo"));

export const registerSchema = z.object({
  name: z
    .string("El nombre es obligatorio")
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede tener más de 80 caracteres"),
  email,
  password: z
    .string("La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña no puede tener más de 128 caracteres")
    .regex(/\p{L}/u, "La contraseña debe tener al menos una letra")
    .regex(/\d/, "La contraseña debe tener al menos un número"),
});

export const loginSchema = z.object({
  email,
  password: z.string("La contraseña es obligatoria").min(1, "La contraseña es obligatoria"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
