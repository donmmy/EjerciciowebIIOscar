import { z } from "zod";

const userValidator = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre debe tener menos de 100 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100, "El apellido debe tener menos de 100 caracteres"),
    nif: z.string().min(8, "El NIF debe tener al menos 8 caracteres").max(12, "El NIF debe tener menos de 12 caracteres"),
    role: z.enum(['admin', 'guest'], "El rol debe ser admin o guest"),
    status: z.enum(['pending', 'verified']),
    verificationAttempts: z.number().min(0).max(3),
    company: z.string(),
    address: z.object({
        street: z.string(),
        number: z.string(),
        postal: z.string(),
        city: z.string(),
        province: z.string()
    })
});

export const validateCodeValidator = z.object({
    code: z.string().length(6, "El código debe tener exactamente 6 dígitos").regex(/^\d+$/, "El código solo puede contener números")
});
export const loginValidator = z.object({
    email: z.string().email({message: "Email no válido"}).transform(email => email.toLowerCase()),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
});
export default userValidator;
