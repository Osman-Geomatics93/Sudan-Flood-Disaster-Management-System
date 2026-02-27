import { z } from 'zod';
import { TASK_STATUSES, TASK_PRIORITIES } from '../constants/enums.js';
import { uuidSchema, paginationSchema } from './common.schema.js';
import { coordinateSchema } from '../utils/geo.js';

export const createTaskSchema = z.object({
  title_en: z.string().min(1).max(300),
  title_ar: z.string().max(600).optional(),
  description: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES).default('medium'),
  assignedToOrgId: uuidSchema,
  assignedToUserId: uuidSchema.optional(),
  incidentId: uuidSchema.optional(),
  floodZoneId: uuidSchema.optional(),
  parentTaskId: uuidSchema.optional(),
  deadline: z.coerce.date().optional(),
  targetLocation: coordinateSchema.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: uuidSchema,
});

export const updateTaskStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(TASK_STATUSES),
  progressPct: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const addTaskDependencySchema = z.object({
  taskId: uuidSchema,
  dependsOnTaskId: uuidSchema,
});

export const addTaskCommentSchema = z.object({
  taskId: uuidSchema,
  body: z.string().min(1),
});

export const listTasksSchema = paginationSchema.extend({
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assignedToOrgId: uuidSchema.optional(),
  createdByOrgId: uuidSchema.optional(),
  incidentId: uuidSchema.optional(),
});
