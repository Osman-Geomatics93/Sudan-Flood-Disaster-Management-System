import { eq } from 'drizzle-orm';
import { router, protectedProcedure, adminProcedure, superAdminProcedure } from '../trpc.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  listOrganizationsSchema,
  idParamSchema,
} from '@sudanflood/shared';
import { states, localities } from '@sudanflood/db/schema';
import {
  listOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '../services/organization.service.js';

export const organizationRouter = router({
  list: protectedProcedure.input(listOrganizationsSchema).query(async ({ input, ctx }) => {
    return listOrganizations(ctx.db, input);
  }),

  getById: protectedProcedure.input(idParamSchema).query(async ({ input, ctx }) => {
    return getOrganizationById(ctx.db, input.id);
  }),

  create: superAdminProcedure.input(createOrganizationSchema).mutation(async ({ input, ctx }) => {
    return createOrganization(ctx.db, input);
  }),

  update: adminProcedure.input(updateOrganizationSchema).mutation(async ({ input, ctx }) => {
    return updateOrganization(ctx.db, input);
  }),

  delete: superAdminProcedure.input(idParamSchema).mutation(async ({ input, ctx }) => {
    return deleteOrganization(ctx.db, input.id);
  }),

  listStates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(states).orderBy(states.name_en);
  }),

  listLocalities: protectedProcedure
    .input(idParamSchema)
    .query(async ({ input, ctx }) => {
      return ctx.db
        .select()
        .from(localities)
        .where(eq(localities.stateId, input.id))
        .orderBy(localities.name_en);
    }),
});
