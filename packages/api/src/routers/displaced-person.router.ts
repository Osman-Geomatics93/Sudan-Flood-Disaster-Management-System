import { router, protectedProcedure, requirePermission } from '../trpc.js';
import {
  listDisplacedPersonsSchema,
  registerDisplacedPersonSchema,
  updateDisplacedPersonSchema,
  assignShelterSchema,
  updateHealthSchema,
  createFamilyGroupSchema,
  addFamilyMemberSchema,
  idParamSchema,
  searchSchema,
} from '@sudanflood/shared';
import {
  listDisplacedPersons,
  getDisplacedPersonById,
  registerDisplacedPerson,
  updateDisplacedPerson,
  assignShelter,
  updateHealth,
  searchDisplacedPersons,
  getDisplacedPersonStats,
  createFamilyGroup,
  addFamilyMember,
  getFamilyGroupById,
} from '../services/displaced-person.service.js';

const familyRouter = router({
  create: protectedProcedure
    .input(createFamilyGroupSchema)
    .mutation(async ({ input, ctx }) => {
      return createFamilyGroup(ctx.db, input);
    }),

  addMember: protectedProcedure
    .input(addFamilyMemberSchema)
    .mutation(async ({ input, ctx }) => {
      return addFamilyMember(ctx.db, input);
    }),

  getById: protectedProcedure
    .input(idParamSchema)
    .query(async ({ input, ctx }) => {
      return getFamilyGroupById(ctx.db, input.id);
    }),
});

export const displacedPersonRouter = router({
  list: protectedProcedure
    .input(listDisplacedPersonsSchema)
    .query(async ({ input, ctx }) => {
      return listDisplacedPersons(ctx.db, input);
    }),

  getById: protectedProcedure
    .input(idParamSchema)
    .query(async ({ input, ctx }) => {
      return getDisplacedPersonById(ctx.db, input.id);
    }),

  register: protectedProcedure
    .use(requirePermission('dp:register'))
    .input(registerDisplacedPersonSchema)
    .mutation(async ({ input, ctx }) => {
      return registerDisplacedPerson(ctx.db, input);
    }),

  update: protectedProcedure
    .use(requirePermission('dp:update'))
    .input(updateDisplacedPersonSchema)
    .mutation(async ({ input, ctx }) => {
      return updateDisplacedPerson(ctx.db, input);
    }),

  assignShelter: protectedProcedure
    .use(requirePermission('dp:update'))
    .input(assignShelterSchema)
    .mutation(async ({ input, ctx }) => {
      return assignShelter(ctx.db, input);
    }),

  updateHealth: protectedProcedure
    .use(requirePermission('dp:update'))
    .input(updateHealthSchema)
    .mutation(async ({ input, ctx }) => {
      return updateHealth(ctx.db, input);
    }),

  search: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      return searchDisplacedPersons(ctx.db, input.query);
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    return getDisplacedPersonStats(ctx.db);
  }),

  family: familyRouter,
});
