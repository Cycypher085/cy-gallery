import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    date: z.date(),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
    readingTime: z.number().optional(),
  }),
});

export const collections = {
  notes: notesCollection,
};