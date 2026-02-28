'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';

type ExportFormat = 'excel' | 'pdf';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<{ fileName: string; data: string; mimeType: string }>;
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export default function ExportButton({ onExport }: ExportButtonProps) {
  const t = useTranslations('export');
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setShowMenu(false);
    setExporting(true);
    try {
      const result = await onExport(format);
      const blob = base64ToBlob(result.data, result.mimeType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {exporting ? t('exporting') : <>{t('excel').split(' ')[0]}</>}
      </button>
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute end-0 top-full z-50 mt-1 w-40 rounded-md border bg-card py-1 shadow-md">
            <button
              onClick={() => handleExport('excel')}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
            >
              {t('excel')}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
            >
              {t('pdf')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
