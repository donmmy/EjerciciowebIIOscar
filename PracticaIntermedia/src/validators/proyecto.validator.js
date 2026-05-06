import { z } from "zod";

export const proyectoValidator = z.object({
    body: z.object({
        name: z.string()
            .min(2, "El nombre debe tener al menos 2 caracteres")
            .max(200, "El nombre no debe exceder 200 caracteres"),
        projectCode: z.string()
            .min(2, "El código de proyecto debe tener al menos 2 caracteres")
            .max(50, "El código de proyecto no debe exceder 50 caracteres"),
        client: z.string()
            .min(1, "El cliente es requerido"),
        description: z.string()
            .max(1000, "La descripción no debe exceder 1000 caracteres")
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
        }).optional(),
        status: z.enum(['activo', 'completado', 'suspendido'])
            .optional(),
        budget: z.number()
            .min(0, "El presupuesto no puede ser negativo")
            .optional(),
        startDate: z.string()
            .datetime()
            .optional()
            .or(z.literal("")),
        endDate: z.string()
            .datetime()
            .optional()
            .or(z.literal(""))
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
});

export const proyectoUpdateValidator = z.object({
    body: proyectoValidator.shape.body.partial(),
    query: z.object({}).optional(),
    params: z.object({}).optional()
});

export default proyectoValidator;
