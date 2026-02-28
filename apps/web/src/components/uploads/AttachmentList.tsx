'use client';

import { trpc } from '@/lib/trpc-client';
import { FileIcon, Download, Trash2 } from 'lucide-react';

interface AttachmentListProps {
  entityType: string;
  entityId: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentList({ entityType, entityId }: AttachmentListProps) {
  const utils = trpc.useUtils();
  const attachmentsQuery = trpc.upload.listByEntity.useQuery({ entityType, entityId });
  const deleteMutation = trpc.upload.delete.useMutation({
    onSuccess: () => utils.upload.listByEntity.invalidate({ entityType, entityId }),
  });

  const attachments = attachmentsQuery.data;
  if (!attachments || attachments.length === 0) return null;

  const handleDownload = async (id: string) => {
    const result = await utils.upload.getDownloadUrl.fetch({ id });
    window.open(result.url, '_blank');
  };

  return (
    <div className="space-y-2">
      {attachments.map((file) => (
        <div key={file.id} className="flex items-center gap-3 rounded-md border p-3">
          <FileIcon className="text-muted-foreground h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.fileName}</p>
            <p className="text-muted-foreground text-xs">
              {formatFileSize(file.fileSize)} · {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handleDownload(file.id)}
              className="btn-ghost text-muted-foreground hover:text-foreground p-1.5"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteMutation.mutate({ id: file.id })}
              disabled={deleteMutation.isPending}
              className="btn-ghost text-muted-foreground hover:text-destructive p-1.5"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
