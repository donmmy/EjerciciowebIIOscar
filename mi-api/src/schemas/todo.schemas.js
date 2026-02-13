import { z } from "zod";

export const todoSchema = z.object({
    body:z.object({
        titulo: z.string().min(3, "El titulo es requerido tener 3 letras")
        .max(100,"El titulo no puede exceder 100 letras"),
        descripcion: z.string().optional(),
        completado: z.boolean().default(false),
        prioridad: z.enum(["alta", "media", "baja"]).default("media"),
    })
});

export const updateTodoSchema = z.object({
    body:z.object({
    titulo: z.string().min(3).max(100),
    descripcion: z.string().optional(),
    completado: z.boolean().default(false).optional(),
    prioridad: z.enum(["alta", "media", "baja"]).optional(),
    }),
    params:z.object({
        id: z.number().optional(),
        fechaCreacion: z.date().optional(),
    })
});