import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, requirePermission } from '../trpc.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  addTaskDependencySchema,
  addTaskCommentSchema,
  listTasksSchema,
  idParamSchema,
} from '@sudanflood/shared';
import { z } from 'zod';
import {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  addDependency,
  removeDependency,
  addComment,
  getTaskComments,
  deleteTask,
  getTaskStats,
} from '../services/task.service.js';

const assignTaskSchema = z.object({
  taskId: z.string().uuid(),
  assignedToUserId: z.string().uuid(),
});

export const taskRouter = router({
  list: protectedProcedure
    .use(requirePermission('task:read'))
    .input(listTasksSchema)
    .query(async ({ input, ctx }) => {
      return listTasks(ctx.db, input);
    }),

  getById: protectedProcedure
    .use(requirePermission('task:read'))
    .input(idParamSchema)
    .query(async ({ input, ctx }) => {
      return getTaskById(ctx.db, input.id);
    }),

  create: protectedProcedure
    .use(requirePermission('task:create'))
    .input(createTaskSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.orgId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You must belong to an organization to create tasks',
        });
      }
      return createTask(ctx.db, input, ctx.user.id, ctx.user.orgId);
    }),

  update: protectedProcedure
    .use(requirePermission('task:update'))
    .input(updateTaskSchema)
    .mutation(async ({ input, ctx }) => {
      return updateTask(ctx.db, input);
    }),

  updateStatus: protectedProcedure
    .use(requirePermission('task:update'))
    .input(updateTaskStatusSchema)
    .mutation(async ({ input, ctx }) => {
      return updateTaskStatus(ctx.db, input);
    }),

  assign: protectedProcedure
    .use(requirePermission('task:update'))
    .input(assignTaskSchema)
    .mutation(async ({ input, ctx }) => {
      return assignTask(ctx.db, input.taskId, input.assignedToUserId);
    }),

  addDependency: protectedProcedure
    .use(requirePermission('task:update'))
    .input(addTaskDependencySchema)
    .mutation(async ({ input, ctx }) => {
      return addDependency(ctx.db, input.taskId, input.dependsOnTaskId);
    }),

  removeDependency: protectedProcedure
    .use(requirePermission('task:update'))
    .input(addTaskDependencySchema)
    .mutation(async ({ input, ctx }) => {
      return removeDependency(ctx.db, input.taskId, input.dependsOnTaskId);
    }),

  addComment: protectedProcedure
    .use(requirePermission('task:update'))
    .input(addTaskCommentSchema)
    .mutation(async ({ input, ctx }) => {
      return addComment(ctx.db, input.taskId, ctx.user.id, input.body);
    }),

  getComments: protectedProcedure
    .use(requirePermission('task:read'))
    .input(idParamSchema)
    .query(async ({ input, ctx }) => {
      return getTaskComments(ctx.db, input.id);
    }),

  delete: protectedProcedure
    .use(requirePermission('task:create'))
    .input(idParamSchema)
    .mutation(async ({ input, ctx }) => {
      return deleteTask(ctx.db, input.id);
    }),

  stats: protectedProcedure.use(requirePermission('task:read')).query(async ({ ctx }) => {
    return getTaskStats(ctx.db);
  }),
});
