import { z } from "zod";

const userValidator = z.object({
    email: z.string().email({message: "Email no válido"}).transform(email => email.toLowerCase()),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre debe tener menos de 100 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100, "El apellido debe tener menos de 100 caracteres"),
    nif: z.string().min(8, "El NIF debe tener al menos 8 caracteres").max(12, "El NIF debe tener menos de 12 caracteres"),
    role: z.enum(['admin', 'guest'], "El rol debe ser admin o guest"),
    status: z.enum(['pending', 'verified']),
    verificationCode: z.string().min(6).max(6),
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

