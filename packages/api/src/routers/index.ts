import { router } from '../trpc.js';
import { authRouter } from './auth.router.js';
import { organizationRouter } from './organization.router.js';
import { floodZoneRouter } from './flood-zone.router.js';
import { rescueRouter } from './rescue.router.js';
import { emergencyCallRouter } from './emergency-call.router.js';
import { shelterRouter } from './shelter.router.js';
import { displacedPersonRouter } from './displaced-person.router.js';

export const appRouter = router({
  auth: authRouter,
  organization: organizationRouter,
  floodZone: floodZoneRouter,
  rescue: rescueRouter,
  emergencyCall: emergencyCallRouter,
  shelter: shelterRouter,
  displacedPerson: displacedPersonRouter,
  // Remaining routers added in later milestones:
  // supply, task, notification,
  // infrastructure, weather, uavSurvey, citizenReport, report, upload
});

export type AppRouter = typeof appRouter;
