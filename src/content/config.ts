import { defineCollection, z } from 'astro:content';

const levelCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.number(),
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    icon: z.string(),
    color: z.string(),
    xpRequired: z.number(),
  }),
});

const questionTestSchema = z.object({
  expectedOutput: z.string(),
  call: z.string().optional(),
});

const questionCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.number(),
    level: z.number(),
    type: z.enum(['fill', 'write', 'predict']),
    title: z.string(),
    xp: z.number(),
    hint: z.string().optional(),
    tests: z.array(questionTestSchema),
  }),
});

export const collections = {
  level: levelCollection,
  question: questionCollection,
};
