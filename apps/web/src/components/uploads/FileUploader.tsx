'use client';

import { useState, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';
import { Upload, X } from 'lucide-react';

interface FileUploaderProps {
  entityType: string;
  entityId: string;
  onUploadComplete?: () => void;
}

export default function FileUploader({
  entityType,
  entityId,
  onUploadComplete,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const requestUploadMutation = trpc.upload.requestUpload.useMutation();

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);
      setUploading(true);
      setProgress(0);

      for (const file of Array.from(files)) {
        try {
          const { uploadUrl } = await requestUploadMutation.mutateAsync({
            entityType,
            entityId,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || 'application/octet-stream',
          });

          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          };

          await new Promise<void>((resolve, reject) => {
            xhr.onload = () =>
              xhr.status < 400 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
            xhr.onerror = () => reject(new Error('Upload failed'));
            xhr.open('PUT', uploadUrl);
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
            xhr.send(file);
          });

          setProgress(100);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Upload failed');
        }
      }

      setUploading(false);
      onUploadComplete?.();
    },
    [entityType, entityId, requestUploadMutation, onUploadComplete],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="space-y-3">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <Upload className="text-muted-foreground mb-2 h-8 w-8" />
        <p className="text-muted-foreground text-sm">Drop files here or click to upload</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploading && (
        <div className="flex items-center gap-3">
          <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-muted-foreground text-sm">{progress}%</span>
        </div>
      )}

      {error && (
        <div className="text-destructive flex items-center gap-2 text-sm">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
