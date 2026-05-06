import { stat } from "fs";
import { z } from "zod";

export const userValidator = z.object({
    body: z.object({
        email: z.string().email({message: "Email no válido"}).transform(email => email.toLowerCase()),
        password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
        name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre debe tener menos de 100 caracteres"),
        lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100, "El apellido debe tener menos de 100 caracteres"),
        nif: z.string().min(8, "El NIF debe tener al menos 8 caracteres").max(12, "El NIF debe tener menos de 12 caracteres"),
        role: z.enum(['admin', 'guest']).optional()
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
});

export const validateCodeValidator = z.object({
    body: z.object({
        code: z.string().length(6, "El código debe tener exactamente 6 dígitos").regex(/^\d+$/, "El código solo puede contener números")
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
});

export const loginValidator = z.object({
    body: z.object({
        email: z.string().email({message: "Email no válido"}).transform(email => email.toLowerCase()),
        password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
});

export const userInfoValidator = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre debe tener menos de 100 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100, "El apellido debe tener menos de 100 caracteres"),
    nif: z.string().min(8, "El NIF debe tener al menos 8 caracteres").max(12, "El NIF debe tener menos de 12 caracteres"),
});

export const basicRegisterValidator = z.object({
    body: z.object({
        name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre debe tener menos de 100 caracteres"),
        lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100, "El apellido debe tener menos de 100 caracteres"),
        nif: z.string().min(8, "El NIF debe tener al menos 8 caracteres").max(12, "El NIF debe tener menos de 12 caracteres")
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
});

export const userCompanyValidator = z.object({
    body: z.object({
        name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre debe tener menos de 100 caracteres"),
        cif: z.string().min(8, "El CIF debe tener al menos 8 caracteres").max(12, "El CIF debe tener menos de 12 caracteres"),
        address: z.object({
            street: z.string().min(2, "La calle debe tener al menos 2 caracteres"),
            number: z.string().min(1, "El número es requerido"),
            postal: z.string().regex(/^\d{5}$/, "El código postal debe tener 5 dígitos"),
            city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
            province: z.string().min(2, "La provincia debe tener al menos 2 caracteres")
        }),
        isFreelance: z.boolean().default(false)
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
});

export const newPasswordValidator = z.object({
    body: z.object({
        currentPassword: z.string().min(8, "La contraseña actual debe tener al menos 8 caracteres"),
        newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    }).refine((val) => val.newPassword !== val.currentPassword, {message: "La nueva contraseña debe ser diferente a la actual", path: ["newPassword"]}),
    query: z.object({}).optional(),
    params: z.object({}).optional()
});

export const userIsAdminValidator = z.object({
    role: z.enum(['admin', 'guest'], "El rol debe ser admin o guest").refine(role => role === 'admin', {message: "El usuario no tiene permisos de administrador"}),
    //status: z.enum(['pending', 'verified'], "El estado debe ser pending o verified").refine(status => status === 'verified', {message: "El usuario no está verificado"}),
    //company: z.string().min(1, "El usuario debe pertenecer a una compañía")
});
export default userValidator;
