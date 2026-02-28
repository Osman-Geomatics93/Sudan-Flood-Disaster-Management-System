import { router, adminProcedure, requirePermission } from '../trpc.js';
import {
  exportSuppliesSchema,
  exportDisplacedPersonsSchema,
  exportTasksSchema,
} from '@sudanflood/shared';
import { generateExcelExport, generatePdfTable } from '../services/export.service.js';
import { listSupplies } from '../services/supply.service.js';
import { listDisplacedPersons } from '../services/displaced-person.service.js';
import { listTasks } from '../services/task.service.js';

export const exportRouter = router({
  supplies: adminProcedure
    .use(requirePermission('report:export'))
    .input(exportSuppliesSchema)
    .mutation(async ({ input, ctx }) => {
      const data = await listSupplies(ctx.db, { page: 1, limit: 1000 });
      const columns = [
        { key: 'trackingCode', header: 'Tracking Code' },
        { key: 'itemName_en', header: 'Item Name' },
        { key: 'supplyType', header: 'Type' },
        { key: 'quantity', header: 'Quantity' },
        { key: 'unit', header: 'Unit' },
        { key: 'status', header: 'Status' },
      ];

      const items = data.items.map((i: any) => ({
        trackingCode: i.trackingCode,
        itemName_en: i.itemName_en,
        supplyType: i.supplyType,
        quantity: i.quantity,
        unit: i.unit,
        status: i.status,
      }));

      if (input.format === 'excel') {
        const buf = generateExcelExport(items, columns, 'Supplies');
        return { fileName: `supplies-${Date.now()}.xlsx`, data: buf.toString('base64'), mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
      } else {
        const buf = generatePdfTable(items, columns, 'Relief Supplies Report');
        return { fileName: `supplies-${Date.now()}.html`, data: buf.toString('base64'), mimeType: 'text/html' };
      }
    }),

  displacedPersons: adminProcedure
    .use(requirePermission('report:export'))
    .input(exportDisplacedPersonsSchema)
    .mutation(async ({ input, ctx }) => {
      const data = await listDisplacedPersons(ctx.db, { page: 1, limit: 1000 });
      const columns = [
        { key: 'registrationCode', header: 'Code' },
        { key: 'firstName_ar', header: 'First Name (AR)' },
        { key: 'lastName_ar', header: 'Last Name (AR)' },
        { key: 'status', header: 'Status' },
        { key: 'healthStatus', header: 'Health' },
        { key: 'phone', header: 'Phone' },
      ];

      const items = data.items.map((i: any) => ({
        registrationCode: i.registrationCode,
        firstName_ar: i.firstName_ar,
        lastName_ar: i.lastName_ar,
        status: i.status,
        healthStatus: i.healthStatus,
        phone: i.phone || '',
      }));

      if (input.format === 'excel') {
        const buf = generateExcelExport(items, columns, 'Displaced Persons');
        return { fileName: `displaced-persons-${Date.now()}.xlsx`, data: buf.toString('base64'), mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
      } else {
        const buf = generatePdfTable(items, columns, 'Displaced Persons Report');
        return { fileName: `displaced-persons-${Date.now()}.html`, data: buf.toString('base64'), mimeType: 'text/html' };
      }
    }),

  tasks: adminProcedure
    .use(requirePermission('report:export'))
    .input(exportTasksSchema)
    .mutation(async ({ input, ctx }) => {
      const data = await listTasks(ctx.db, { page: 1, limit: 1000 });
      const columns = [
        { key: 'taskCode', header: 'Code' },
        { key: 'title_en', header: 'Title' },
        { key: 'status', header: 'Status' },
        { key: 'priority', header: 'Priority' },
      ];

      const items = data.items.map((i: any) => ({
        taskCode: i.taskCode,
        title_en: i.title_en || i.title_ar,
        status: i.status,
        priority: i.priority,
      }));

      if (input.format === 'excel') {
        const buf = generateExcelExport(items, columns, 'Tasks');
        return { fileName: `tasks-${Date.now()}.xlsx`, data: buf.toString('base64'), mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
      } else {
        const buf = generatePdfTable(items, columns, 'Tasks Report');
        return { fileName: `tasks-${Date.now()}.html`, data: buf.toString('base64'), mimeType: 'text/html' };
      }
    }),
});
