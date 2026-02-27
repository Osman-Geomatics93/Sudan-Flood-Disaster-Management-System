'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft, Droplets, Zap, Stethoscope, ShowerHead, CookingPot, Shield, Users } from 'lucide-react';
import { Marker, Popup } from 'react-leaflet';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false });

const STATUS_STYLES: Record<string, string> = {
  preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  at_capacity: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  overcrowded: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  closing: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const FACILITY_ICONS = [
  { key: 'hasWater', icon: Droplets },
  { key: 'hasElectricity', icon: Zap },
  { key: 'hasMedical', icon: Stethoscope },
  { key: 'hasSanitation', icon: ShowerHead },
  { key: 'hasKitchen', icon: CookingPot },
  { key: 'hasSecurity', icon: Shield },
] as const;

export default function ShelterDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('shelter');
  const router = useRouter();

  const shelterQuery = trpc.shelter.getById.useQuery({ id });

  if (shelterQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (shelterQuery.error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        {shelterQuery.error.message}
      </div>
    );
  }

  const shelter = shelterQuery.data;
  if (!shelter) return null;

  const occupancyPct = shelter.capacity > 0
    ? Math.round((shelter.currentOccupancy / shelter.capacity) * 100)
    : 0;

  const occupancyColor =
    occupancyPct >= 100 ? 'bg-red-500' :
    occupancyPct >= 80 ? 'bg-yellow-500' :
    'bg-green-500';

  const location = shelter.location as { type: string; coordinates: [number, number] } | null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-md p-2 hover:bg-accent">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{shelter.name_en}</h1>
            {shelter.name_ar && <p className="text-sm text-muted-foreground" dir="rtl">{shelter.name_ar}</p>}
            <p className="font-mono text-sm text-muted-foreground">{shelter.shelterCode}</p>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[shelter.status] ?? ''}`}>
          {t(`status_${shelter.status}`)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Occupancy bar */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('occupancy')}</h2>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{shelter.currentOccupancy} / {shelter.capacity}</span>
              <span>{occupancyPct}%</span>
            </div>
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${occupancyColor}`}
                style={{ width: `${Math.min(occupancyPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Facilities */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('facilities')}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FACILITY_ICONS.map(({ key, icon: Icon }) => {
                const available = shelter[key] as boolean;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2 rounded-md border p-3 text-sm ${
                      available ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-muted opacity-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t(key)}
                  </div>
                );
              })}
            </div>
            {shelter.facilityNotes && (
              <p className="mt-4 text-sm text-muted-foreground">{shelter.facilityNotes}</p>
            )}
          </div>

          {/* Map */}
          {location && (
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">{t('location')}</h2>
              <LeafletMap
                center={[location.coordinates[1], location.coordinates[0]]}
                zoom={14}
                className="h-[300px] w-full rounded-md"
              >
                <Marker position={[location.coordinates[1], location.coordinates[0]]}>
                  <Popup>{shelter.name_en}</Popup>
                </Marker>
              </LeafletMap>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('details')}</h2>
            <dl className="space-y-3">
              {shelter.address_en && (
                <div>
                  <dt className="text-sm text-muted-foreground">{t('addressEn')}</dt>
                  <dd className="mt-1 text-sm">{shelter.address_en}</dd>
                </div>
              )}
              {shelter.address_ar && (
                <div>
                  <dt className="text-sm text-muted-foreground">{t('addressAr')}</dt>
                  <dd className="mt-1 text-sm" dir="rtl">{shelter.address_ar}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted-foreground">{t('capacity')}</dt>
                <dd className="mt-1 text-sm">{shelter.capacity}</dd>
              </div>
              {shelter.openedAt && (
                <div>
                  <dt className="text-sm text-muted-foreground">{t('openedAt')}</dt>
                  <dd className="mt-1 text-sm">{new Date(shelter.openedAt).toLocaleDateString()}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted-foreground">{t('createdAt')}</dt>
                <dd className="mt-1 text-sm">{new Date(shelter.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          <Link
            href={`/dashboard/displaced-persons?shelterId=${shelter.id}`}
            className="flex items-center gap-2 rounded-lg border bg-card p-4 text-sm font-medium hover:bg-accent"
          >
            <Users className="h-4 w-4" />
            {t('viewDisplacedPersons')}
          </Link>
        </div>
      </div>
    </div>
  );
}
