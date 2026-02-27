'use client';

import { useTranslations } from 'next-intl';
import { FLOOD_SEVERITIES, FLOOD_ZONE_STATUSES } from '@sudanflood/shared';

interface FloodZoneFiltersProps {
  severity: string;
  status: string;
  onSeverityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function FloodZoneFilters({
  severity,
  status,
  onSeverityChange,
  onStatusChange,
}: FloodZoneFiltersProps) {
  const t = useTranslations('floodZone');

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={severity}
        onChange={(e) => onSeverityChange(e.target.value)}
        className="rounded-md border bg-card px-3 py-2 text-sm"
      >
        <option value="">{t('allSeverities')}</option>
        {FLOOD_SEVERITIES.map((s) => (
          <option key={s} value={s}>
            {t(`severity_${s}`)}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-md border bg-card px-3 py-2 text-sm"
      >
        <option value="">{t('allStatuses')}</option>
        {FLOOD_ZONE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(`status_${s}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
