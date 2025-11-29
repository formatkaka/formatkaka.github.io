import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    category: z.enum(['books', 'tech', 'personal', 'movies', 'thoughts']).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
