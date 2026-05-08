import { z } from "zod";

export const deliverNoteValidator = z.object({
    body: z.object({
        projectId: z.string()
            .min(1, "El ID del proyecto es requerido"),
        description: z.string()
            .min(1, "La descripción es requerida")
            .max(500, "La descripción no debe exceder 500 caracteres"),
        date: z.string()
            .datetime("La fecha debe ser una fecha válida"),
        format: z.enum(['material', 'hours'], "El formato debe ser 'material' o 'hours'"),
        
        // Campos opcionales para material
        material: z.string()
            .max(200, "El material no debe exceder 200 caracteres")
            .optional(),
        quantity: z.number()
            .min(0, "La cantidad debe ser mayor o igual a 0")
            .optional(),
        unit: z.string()
            .max(50, "La unidad no debe exceder 50 caracteres")
            .optional(),
        
        // Campos opcionales para horas
        hours: z.number()
            .min(0, "Las horas deben ser mayores o iguales a 0")
            .optional(),
        workers: z.array(
            z.object({
                name: z.string()
                    .min(1, "El nombre del trabajador es requerido")
                    .max(100, "El nombre del trabajador no debe exceder 100 caracteres"),
                hours: z.number()
                    .min(0, "Las horas del trabajador deben ser mayores o iguales a 0")
            })
        ).optional()
    }).superRefine((data, ctx) => {
        // Validación condicional según format
        if (data.format === 'material') {
            if (!data.material) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['material'],
                    message: "Cuando format es 'material', el campo material es obligatorio"
                });
            }
            if (data.quantity === undefined || data.quantity === null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['quantity'],
                    message: "Cuando format es 'material', el campo quantity es obligatorio"
                });
            }
            if (!data.unit) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['unit'],
                    message: "Cuando format es 'material', el campo unit es obligatorio"
                });
            }
        }
        
        if (data.format === 'hours') {
            if (data.hours === undefined || data.hours === null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['hours'],
                    message: "Cuando format es 'hours', el campo hours es obligatorio"
                });
            }
        }
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
});

export const deliverNoteUpdateValidator = z.object({
    body: deliverNoteValidator.shape.body.partial(),
    query: z.object({}).optional(),
    params: z.object({}).optional()
});

export default deliverNoteValidator;
