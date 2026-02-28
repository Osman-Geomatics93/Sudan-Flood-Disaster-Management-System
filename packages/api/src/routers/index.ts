import { router } from '../trpc.js';
import { authRouter } from './auth.router.js';
import { organizationRouter } from './organization.router.js';
import { floodZoneRouter } from './flood-zone.router.js';
import { rescueRouter } from './rescue.router.js';
import { emergencyCallRouter } from './emergency-call.router.js';
import { shelterRouter } from './shelter.router.js';
import { displacedPersonRouter } from './displaced-person.router.js';
import { supplyRouter } from './supply.router.js';
import { taskRouter } from './task.router.js';
import { notificationRouter } from './notification.router.js';
import { reportRouter } from './report.router.js';
import { auditLogRouter } from './audit-log.router.js';
import { weatherAlertRouter } from './weather-alert.router.js';
import { uploadRouter } from './upload.router.js';
import { analyticsRouter } from './analytics.router.js';
import { resourcePlannerRouter } from './resource-planner.router.js';
import { exportRouter } from './export.router.js';

export const appRouter = router({
  auth: authRouter,
  organization: organizationRouter,
  floodZone: floodZoneRouter,
  rescue: rescueRouter,
  emergencyCall: emergencyCallRouter,
  shelter: shelterRouter,
  displacedPerson: displacedPersonRouter,
  supply: supplyRouter,
  task: taskRouter,
  notification: notificationRouter,
  report: reportRouter,
  auditLog: auditLogRouter,
  weatherAlert: weatherAlertRouter,
  upload: uploadRouter,
  analytics: analyticsRouter,
  resourcePlanner: resourcePlannerRouter,
  export: exportRouter,
});

export type AppRouter = typeof appRouter;
