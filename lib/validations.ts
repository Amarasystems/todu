import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be less than 120 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  status: z.enum(['backlog', 'in_progress', 'done']),
  priority: z.enum(['low', 'med', 'high']).default('med'),
  startAt: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  dueAt: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  items: z
    .array(
      z.object({
        label: z.string().min(1, 'Checklist item cannot be empty'),
        checked: z.boolean().default(false),
      })
    )
    .default([]),
  percent: z.number().min(0).max(100).default(0).optional(),
});

export const updateTaskSchema = taskSchema.partial();

export const reorderTaskSchema = z.object({
  fromStatus: z.enum(['backlog', 'in_progress', 'done']),
  toStatus: z.enum(['backlog', 'in_progress', 'done']),
  taskId: z.string(),
  toIndex: z.number().min(0),
});

export const getTasksQuerySchema = z.object({
  status: z.enum(['backlog', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  q: z.string().optional(),
  from: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  to: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  scope: z.enum(['all', 'my', 'global']).optional(),
});
