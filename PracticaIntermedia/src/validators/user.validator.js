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

export const userInfoValidator = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre debe tener menos de 100 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100, "El apellido debe tener menos de 100 caracteres"),
    nif: z.string().min(8, "El NIF debe tener al menos 8 caracteres").max(12, "El NIF debe tener menos de 12 caracteres"),
});

export const basicRegisterValidator = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre debe tener menos de 100 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100, "El apellido debe tener menos de 100 caracteres"),
    nif: z.string().min(8, "El NIF debe tener al menos 8 caracteres").max(12, "El NIF debe tener menos de 12 caracteres"),
});

export const userCompanyValidator = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre debe tener menos de 100 caracteres"),
    cif: z.string().min(8, "El CIF debe tener al menos 8 caracteres").max(12, "El CIF debe tener menos de 12 caracteres"),
    address: z.object({
        street: z.string().min(2, "La calle debe tener al menos 2 caracteres"),
        number: z.string().min(1, "El número es requerido"),
        postal: z.string().regex(/^\d{5}$/, "El código postal debe tener 5 dígitos"),
        city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
        province: z.string().min(2, "La provincia debe tener al menos 2 caracteres")
    }),
    isFreelance: z.boolean().default(false),
});

export default userValidator;
