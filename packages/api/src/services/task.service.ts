import { eq, and, count as drizzleCount } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { tasks, taskDependencies, comments, notifications } from '@sudanflood/db/schema';
import type { CreateTaskInput } from '@sudanflood/shared';
import { CODE_PREFIXES } from '@sudanflood/shared';
import { withCodeRetry } from '../utils/entity-code.js';

export async function listTasks(
  db: Database,
  input: {
    page: number;
    limit: number;
    status?: string;
    priority?: string;
    assignedToOrgId?: string;
    createdByOrgId?: string;
    incidentId?: string;
  },
) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (input.status) {
    conditions.push(eq(tasks.status, input.status as (typeof tasks.status.enumValues)[number]));
  }
  if (input.priority) {
    conditions.push(
      eq(tasks.priority, input.priority as (typeof tasks.priority.enumValues)[number]),
    );
  }
  if (input.assignedToOrgId) {
    conditions.push(eq(tasks.assignedToOrgId, input.assignedToOrgId));
  }
  if (input.createdByOrgId) {
    conditions.push(eq(tasks.createdByOrgId, input.createdByOrgId));
  }
  if (input.incidentId) {
    conditions.push(eq(tasks.incidentId, input.incidentId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: tasks.id,
        taskCode: tasks.taskCode,
        title_en: tasks.title_en,
        title_ar: tasks.title_ar,
        status: tasks.status,
        priority: tasks.priority,
        assignedToOrgId: tasks.assignedToOrgId,
        assignedToUserId: tasks.assignedToUserId,
        createdByUserId: tasks.createdByUserId,
        deadline: tasks.deadline,
        progressPct: tasks.progressPct,
        startedAt: tasks.startedAt,
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(tasks.createdAt),
    db.select({ count: drizzleCount() }).from(tasks).where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    items,
    total,
    page: input.page,
    limit: input.limit,
    totalPages: Math.ceil(total / input.limit),
  };
}

export async function getTaskById(db: Database, id: string) {
  const [task] = await db
    .select({
      id: tasks.id,
      taskCode: tasks.taskCode,
      title_en: tasks.title_en,
      title_ar: tasks.title_ar,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      assignedToOrgId: tasks.assignedToOrgId,
      assignedToUserId: tasks.assignedToUserId,
      createdByOrgId: tasks.createdByOrgId,
      createdByUserId: tasks.createdByUserId,
      incidentId: tasks.incidentId,
      floodZoneId: tasks.floodZoneId,
      parentTaskId: tasks.parentTaskId,
      deadline: tasks.deadline,
      startedAt: tasks.startedAt,
      completedAt: tasks.completedAt,
      completionNotes: tasks.completionNotes,
      progressPct: tasks.progressPct,
      metadata: tasks.metadata,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1);

  if (!task) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
  }

  const deps = await db
    .select({
      id: taskDependencies.id,
      dependsOnTaskId: taskDependencies.dependsOnTaskId,
    })
    .from(taskDependencies)
    .where(eq(taskDependencies.taskId, id));

  return { ...task, dependencies: deps };
}

export async function createTask(
  db: Database,
  input: CreateTaskInput,
  userId: string,
  orgId: string,
) {
  return withCodeRetry(
    async (taskCode) => {
      const [task] = await db
        .insert(tasks)
        .values({
          taskCode,
          title_en: input.title_en,
          title_ar: input.title_ar ?? null,
          description: input.description ?? null,
          status: 'draft',
          priority: input.priority,
          assignedToOrgId: input.assignedToOrgId,
          assignedToUserId: input.assignedToUserId ?? null,
          createdByOrgId: orgId,
          createdByUserId: userId,
          incidentId: input.incidentId ?? null,
          floodZoneId: input.floodZoneId ?? null,
          parentTaskId: input.parentTaskId ?? null,
          deadline: input.deadline ?? null,
        })
        .returning();

      if (!task) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create task' });
      }

      return getTaskById(db, task.id);
    },
    db,
    tasks,
    CODE_PREFIXES.TASK,
  );
}

export async function updateTask(
  db: Database,
  input: {
    id: string;
    title_en?: string;
    title_ar?: string;
    description?: string;
    priority?: (typeof tasks.priority.enumValues)[number];
    assignedToOrgId?: string;
    assignedToUserId?: string;
    incidentId?: string;
    floodZoneId?: string;
    deadline?: Date;
  },
) {
  await getTaskById(db, input.id);

  await db
    .update(tasks)
    .set({
      ...(input.title_en !== undefined && { title_en: input.title_en }),
      ...(input.title_ar !== undefined && { title_ar: input.title_ar }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.assignedToOrgId !== undefined && { assignedToOrgId: input.assignedToOrgId }),
      ...(input.assignedToUserId !== undefined && { assignedToUserId: input.assignedToUserId }),
      ...(input.incidentId !== undefined && { incidentId: input.incidentId }),
      ...(input.floodZoneId !== undefined && { floodZoneId: input.floodZoneId }),
      ...(input.deadline !== undefined && { deadline: input.deadline }),
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, input.id));

  return getTaskById(db, input.id);
}

export async function updateTaskStatus(
  db: Database,
  input: {
    id: string;
    status: (typeof tasks.status.enumValues)[number];
    progressPct?: number;
    notes?: string;
  },
) {
  await getTaskById(db, input.id);

  const updates: Record<string, unknown> = {
    status: input.status,
    updatedAt: new Date(),
  };

  if (input.progressPct !== undefined) {
    updates.progressPct = input.progressPct;
  }
  if (input.notes) {
    updates.completionNotes = input.notes;
  }
  if (input.status === 'in_progress') {
    updates.startedAt = new Date();
  }
  if (input.status === 'completed') {
    updates.completedAt = new Date();
    updates.progressPct = 100;
  }

  await db.update(tasks).set(updates).where(eq(tasks.id, input.id));

  await notifyTaskStatusChange(db, input.id, input.status);
  return getTaskById(db, input.id);
}

export async function assignTask(db: Database, taskId: string, assignedToUserId: string) {
  await getTaskById(db, taskId);

  await db
    .update(tasks)
    .set({
      assignedToUserId,
      status: 'assigned',
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId));

  await notifyTaskAssignment(db, taskId, assignedToUserId);
  return getTaskById(db, taskId);
}

export async function addDependency(db: Database, taskId: string, dependsOnTaskId: string) {
  await getTaskById(db, taskId);
  await getTaskById(db, dependsOnTaskId);

  if (taskId === dependsOnTaskId) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'A task cannot depend on itself' });
  }

  await db.insert(taskDependencies).values({ taskId, dependsOnTaskId });
  return getTaskById(db, taskId);
}

export async function removeDependency(db: Database, taskId: string, dependsOnTaskId: string) {
  await db
    .delete(taskDependencies)
    .where(
      and(
        eq(taskDependencies.taskId, taskId),
        eq(taskDependencies.dependsOnTaskId, dependsOnTaskId),
      ),
    );
  return getTaskById(db, taskId);
}

export async function addComment(db: Database, taskId: string, userId: string, body: string) {
  await getTaskById(db, taskId);

  const [comment] = await db.insert(comments).values({ taskId, userId, body }).returning();

  if (!comment) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to add comment' });
  }

  return comment;
}

export async function getTaskComments(db: Database, taskId: string) {
  return db
    .select({
      id: comments.id,
      userId: comments.userId,
      body: comments.body,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(eq(comments.taskId, taskId))
    .orderBy(comments.createdAt);
}

export async function deleteTask(db: Database, id: string) {
  const task = await getTaskById(db, id);

  if (task.status !== 'draft' && task.status !== 'cancelled') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Only tasks in draft or cancelled status can be deleted',
    });
  }

  await db.delete(taskDependencies).where(eq(taskDependencies.taskId, id));
  await db.delete(comments).where(eq(comments.taskId, id));
  await db.delete(tasks).where(eq(tasks.id, id));

  return { success: true };
}

export async function getTaskStats(db: Database) {
  const [totalResult, byStatusResult, byPriorityResult] = await Promise.all([
    db.select({ count: drizzleCount() }).from(tasks),
    db
      .select({
        status: tasks.status,
        count: drizzleCount(),
      })
      .from(tasks)
      .groupBy(tasks.status),
    db
      .select({
        priority: tasks.priority,
        count: drizzleCount(),
      })
      .from(tasks)
      .groupBy(tasks.priority),
  ]);

  return {
    total: totalResult[0]?.count ?? 0,
    byStatus: byStatusResult,
    byPriority: byPriorityResult,
  };
}

async function notifyTaskAssignment(db: Database, taskId: string, assignedUserId: string) {
  try {
    const [task] = await db
      .select({ taskCode: tasks.taskCode, title_en: tasks.title_en })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (task) {
      await db.insert(notifications).values({
        userId: assignedUserId,
        title_en: `Task ${task.taskCode} assigned to you`,
        title_ar: `تم تعيين المهمة ${task.taskCode} لك`,
        body_en: task.title_en,
        notificationType: 'task_assignment',
        severity: 'info',
        referenceType: 'task',
        referenceId: taskId,
      });
    }
  } catch {
    // Don't fail the main operation if notification fails
  }
}

async function notifyTaskStatusChange(db: Database, taskId: string, newStatus: string) {
  try {
    const [task] = await db
      .select({
        taskCode: tasks.taskCode,
        assignedToUserId: tasks.assignedToUserId,
        createdByUserId: tasks.createdByUserId,
      })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) return;

    const usersToNotify = new Set<string>();
    if (task.assignedToUserId) usersToNotify.add(task.assignedToUserId);
    if (task.createdByUserId) usersToNotify.add(task.createdByUserId);

    for (const userId of usersToNotify) {
      await db.insert(notifications).values({
        userId,
        title_en: `Task ${task.taskCode} status changed to ${newStatus}`,
        title_ar: `تم تغيير حالة المهمة ${task.taskCode} إلى ${newStatus}`,
        notificationType: 'task_status_change',
        severity: 'info',
        referenceType: 'task',
        referenceId: taskId,
      });
    }
  } catch {
    // Don't fail the main operation if notification fails
  }
}
