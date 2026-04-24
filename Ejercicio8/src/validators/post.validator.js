import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).trim(),
    content: z.string().min(10).trim(),
    excerpt: z.string().max(500).trim().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.string().url().optional(),
    published: z.boolean().optional()
  })
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).trim().optional(),
    content: z.string().min(10).trim().optional(),
    excerpt: z.string().max(500).trim().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.string().url().optional(),
    published: z.boolean().optional()
  })
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID no válido')
  })
});

export const slugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1)
  })
});
