'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc-client';
import { AlertTriangle } from 'lucide-react';

export default function ResourcePlannerPage() {
  const t = useTranslations('resourcePlanner');
  const [personCount, setPersonCount] = useState(5);

  const shortagesQuery = trpc.resourcePlanner.criticalShortages.useQuery();
  const gapsQuery = trpc.resourcePlanner.supplyGaps.useQuery();
  const recommendationQuery = trpc.resourcePlanner.shelterRecommendation.useQuery({
    personCount,
  });

  return (
    <div className="animate-in">
      <h1 className="font-heading mb-6 text-2xl font-semibold tracking-tight">{t('title')}</h1>

      {/* Critical Shortages */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-medium">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          {t('criticalShortages')}
        </h2>
        {shortagesQuery.data && shortagesQuery.data.length > 0 ? (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-4 py-3 text-start font-medium">{t('shelter')}</th>
                    <th className="px-4 py-3 text-end font-medium">Occupancy</th>
                    <th className="px-4 py-3 text-end font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {shortagesQuery.data.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="px-4 py-3">
                        {s.name_en}{' '}
                        <span className="text-muted-foreground text-xs">({s.shelterCode})</span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        {s.currentOccupancy}/{s.capacity}
                      </td>
                      <td className="px-4 py-3 text-end font-medium text-orange-600 dark:text-orange-400">
                        {s.occupancyRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t('noCriticalShortages')}</p>
        )}
      </section>

      {/* Supply Gap Analysis */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-medium">{t('supplyGaps')}</h2>
        {gapsQuery.data && gapsQuery.data.length > 0 && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-4 py-3 text-start font-medium">{t('type')}</th>
                    <th className="px-4 py-3 text-end font-medium">Total</th>
                    <th className="px-4 py-3 text-end font-medium">Delivered</th>
                    <th className="px-4 py-3 text-end font-medium">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {gapsQuery.data.map((g) => (
                    <tr key={g.supplyType} className="border-b">
                      <td className="px-4 py-3 capitalize">{g.supplyType.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-end">{g.totalQuantity}</td>
                      <td className="px-4 py-3 text-end text-green-600 dark:text-green-400">
                        {g.deliveredQuantity}
                      </td>
                      <td className="px-4 py-3 text-end text-yellow-600 dark:text-yellow-400">
                        {g.requestedQuantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Shelter Recommendation */}
      <section>
        <h2 className="mb-3 text-lg font-medium">{t('shelterRecommendation')}</h2>
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm">People to shelter:</label>
          <input
            type="number"
            min={1}
            value={personCount}
            onChange={(e) => setPersonCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="bg-card w-24 rounded-md border px-3 py-2 text-sm"
          />
        </div>
        {recommendationQuery.data && recommendationQuery.data.length > 0 ? (
          <div className="space-y-2">
            {recommendationQuery.data.map((s) => (
              <div key={s.id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{s.name_en}</p>
                  <p className="text-muted-foreground text-xs">
                    {s.shelterCode} · {s.status}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {s.availableCapacity} available
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {s.currentOccupancy}/{s.capacity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No shelters available for {personCount} persons
          </p>
        )}
      </section>
    </div>
  );
}
