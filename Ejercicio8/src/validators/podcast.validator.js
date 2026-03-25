import { z } from 'zod';

export const createPodcastSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).trim(),
    description: z.string().max(1000).trim().optional(),
    duration: z.number().int().positive(),
    categories: z.array(z.string()).optional(),
    coverImage: z.string().url().optional()
  })
});

export const updatePodcastSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(1000).trim().optional(),
    duration: z.number().int().positive().optional(),
    categories: z.array(z.string()).optional(),
    coverImage: z.string().url().optional()
  })
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID no válido')
  })
});
