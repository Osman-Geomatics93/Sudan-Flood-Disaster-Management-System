import { router, protectedProcedure, requirePermission } from '../trpc.js';
import {
  requestUploadSchema,
  listAttachmentsSchema,
  getDownloadUrlSchema,
  deleteAttachmentSchema,
} from '@sudanflood/shared';
import {
  requestUpload,
  listAttachments,
  getDownloadUrl,
  deleteAttachment,
} from '../services/file-attachment.service.js';

export const uploadRouter = router({
  requestUpload: protectedProcedure
    .use(requirePermission('upload:create'))
    .input(requestUploadSchema)
    .mutation(async ({ input, ctx }) => {
      return requestUpload(ctx.db, input, ctx.user.id);
    }),

  listByEntity: protectedProcedure.input(listAttachmentsSchema).query(async ({ input, ctx }) => {
    return listAttachments(ctx.db, input);
  }),

  getDownloadUrl: protectedProcedure.input(getDownloadUrlSchema).query(async ({ input, ctx }) => {
    return getDownloadUrl(ctx.db, input.id);
  }),

  delete: protectedProcedure.input(deleteAttachmentSchema).mutation(async ({ input, ctx }) => {
    return deleteAttachment(ctx.db, input.id);
  }),
});
