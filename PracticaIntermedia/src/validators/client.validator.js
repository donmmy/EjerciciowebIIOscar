import { z } from "zod";

export const clientValidator = z.object({
    name: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no debe exceder 100 caracteres"),
    cif: z.string()
        .min(2, "El CIF debe tener al menos 2 caracteres")
        .max(20, "El CIF no debe exceder 20 caracteres"),
    email: z.string()
        .email("Email no válido")
        .optional()
        .or(z.literal("")),
    phone: z.string()
        .regex(/^\+?[0-9\s\-]{7,15}$/, "Número de teléfono no válido")
        .optional()
        .or(z.literal("")),
    address: z.object({
        street: z.string()
            .min(2, "La calle debe tener al menos 2 caracteres")
            .max(100, "La calle no debe exceder 100 caracteres"),
        number: z.string()
            .min(1, "El número es requerido")
            .max(10, "El número no debe exceder 10 caracteres"),
        postal: z.string()
            .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos"),
        city: z.string()
            .min(2, "La ciudad debe tener al menos 2 caracteres")
            .max(100, "La ciudad no debe exceder 100 caracteres"),
        province: z.string()
            .min(2, "La provincia debe tener al menos 2 caracteres")
            .max(100, "La provincia no debe exceder 100 caracteres")
    }).optional()
});

export const clientUpdateValidator = clientValidator.partial();

export default clientValidator;
