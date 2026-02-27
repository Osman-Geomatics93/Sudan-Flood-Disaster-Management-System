'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft, Heart, Home, Users } from 'lucide-react';
import { HEALTH_STATUSES } from '@sudanflood/shared';
import type { HealthStatus } from '@sudanflood/shared';

const STATUS_STYLES: Record<string, string> = {
  registered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  sheltered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  relocated: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  returned_home: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  missing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  deceased: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const HEALTH_STYLES: Record<string, string> = {
  healthy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  minor_injury: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  major_injury: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  chronic_condition: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function DisplacedPersonDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('displacedPerson');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const personQuery = trpc.displacedPerson.getById.useQuery({ id });
  const sheltersQuery = trpc.shelter.list.useQuery({ page: 1, limit: 200, hasCapacity: true });
  const utils = trpc.useUtils();

  // Assign shelter state
  const [selectedShelterId, setSelectedShelterId] = useState('');
  const assignMutation = trpc.displacedPerson.assignShelter.useMutation({
    onSuccess: () => {
      utils.displacedPerson.getById.invalidate({ id });
      setSelectedShelterId('');
    },
  });

  // Update health state
  const [healthStatus, setHealthStatus] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const updateHealthMutation = trpc.displacedPerson.updateHealth.useMutation({
    onSuccess: () => {
      utils.displacedPerson.getById.invalidate({ id });
      setHealthStatus('');
      setHealthNotes('');
    },
  });

  // Family group state
  const [familySize, setFamilySize] = useState('1');
  const createFamilyMutation = trpc.displacedPerson.family.create.useMutation({
    onSuccess: () => {
      utils.displacedPerson.getById.invalidate({ id });
    },
  });

  if (personQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (personQuery.error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        {personQuery.error.message}
      </div>
    );
  }

  const person = personQuery.data;
  if (!person) return null;

  const handleAssignShelter = () => {
    if (!selectedShelterId) return;
    assignMutation.mutate({ personId: id, shelterId: selectedShelterId });
  };

  const handleUpdateHealth = () => {
    if (!healthStatus) return;
    updateHealthMutation.mutate({
      id,
      healthStatus: healthStatus as HealthStatus,
      healthNotes: healthNotes || undefined,
    });
  };

  const handleCreateFamilyGroup = () => {
    createFamilyMutation.mutate({
      headOfFamilyId: id,
      familySize: Number(familySize) || 1,
    });
  };

  return (
    <div className="animate-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-md p-2 hover:bg-accent">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight" dir="rtl">
              {person.firstName_ar} {person.lastName_ar}
            </h1>
            {person.firstName_en && (
              <p className="text-sm text-muted-foreground">
                {person.firstName_en} {person.lastName_en}
              </p>
            )}
            <p className="font-mono text-sm text-muted-foreground">{person.registrationCode}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Info */}
          <div className="card">
            <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">{t('personalInfo')}</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">{t('dateOfBirth')}</dt>
                <dd className="mt-1 text-sm">{person.dateOfBirth ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('gender')}</dt>
                <dd className="mt-1 text-sm">{person.gender ? t(`gender_${person.gender}`) : '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('nationalId')}</dt>
                <dd className="mt-1 text-sm">{person.nationalId ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('phone')}</dt>
                <dd className="mt-1 text-sm">{person.phone ?? '-'}</dd>
              </div>
              {person.specialNeeds && (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted-foreground">{t('specialNeeds')}</dt>
                  <dd className="mt-1 text-sm">{person.specialNeeds}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Health Info */}
          <div className="card">
            <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">{t('healthInfo')}</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">{t('healthStatus')}</dt>
                <dd className="mt-1">
                  <span className={`badge ${HEALTH_STYLES[person.healthStatus] ?? ''}`}>
                    {t(`health_${person.healthStatus}`)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('hasDisability')}</dt>
                <dd className="mt-1 text-sm">{person.hasDisability ? tCommon('yes') : tCommon('no')}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('isUnaccompaniedMinor')}</dt>
                <dd className="mt-1 text-sm">{person.isUnaccompaniedMinor ? tCommon('yes') : tCommon('no')}</dd>
              </div>
              {person.healthNotes && (
                <div>
                  <dt className="text-sm text-muted-foreground">{t('healthNotes')}</dt>
                  <dd className="mt-1 text-sm">{person.healthNotes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Assign Shelter Action */}
          <div className="rounded-lg border border-blue-300 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
            <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Home className="h-5 w-5" />
              {t('assignShelter')}
            </h2>
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedShelterId}
                onChange={(e) => setSelectedShelterId(e.target.value)}
                className="input-field flex-1 min-w-[200px]"
              >
                <option value="">{t('selectShelter')}</option>
                {(sheltersQuery.data?.items ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_en} ({s.currentOccupancy}/{s.capacity})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignShelter}
                disabled={!selectedShelterId || assignMutation.isPending}
                className="btn-primary disabled:opacity-50"
              >
                {assignMutation.isPending ? tCommon('loading') : t('assignShelter')}
              </button>
            </div>
          </div>

          {/* Update Health Action */}
          <div className="rounded-lg border border-green-300 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
            <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Heart className="h-5 w-5" />
              {t('updateHealth')}
            </h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <select
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                  className="input-field flex-1 min-w-[200px]"
                >
                  <option value="">{t('selectHealthStatus')}</option>
                  {HEALTH_STATUSES.map((h) => (
                    <option key={h} value={h}>{t(`health_${h}`)}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder={t('healthNotes')}
                className="input-field w-full"
              />
              <button
                onClick={handleUpdateHealth}
                disabled={!healthStatus || updateHealthMutation.isPending}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {updateHealthMutation.isPending ? tCommon('loading') : t('updateHealth')}
              </button>
            </div>
          </div>

          {/* Family Group */}
          {!person.familyGroupId && (
            <div className="rounded-lg border border-purple-300 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-950">
              <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Users className="h-5 w-5" />
                {t('createFamilyGroup')}
              </h2>
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('familySize')}</label>
                  <input
                    type="number"
                    min="1"
                    value={familySize}
                    onChange={(e) => setFamilySize(e.target.value)}
                    className="input-field w-24"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleCreateFamilyGroup}
                    disabled={createFamilyMutation.isPending}
                    className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    {createFamilyMutation.isPending ? tCommon('loading') : t('createFamilyGroup')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-heading mb-4 text-lg font-semibold tracking-tight">{t('status')}</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">{t('status')}</dt>
                <dd className="mt-1">
                  <span className={`badge ${STATUS_STYLES[person.status] ?? ''}`}>
                    {t(`status_${person.status}`)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('registeredAt')}</dt>
                <dd className="mt-1 text-sm">{new Date(person.registeredAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          {/* Shelter info */}
          {person.currentShelterId && (
            <div className="card">
              <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Home className="h-5 w-5" />
                {t('currentShelter')}
              </h2>
              <Link
                href={`/dashboard/shelters/${person.currentShelterId}`}
                className="block text-sm text-primary dark:text-primary hover:underline"
              >
                {person.shelterName ?? person.shelterCode}
              </Link>
              {person.shelterCode && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">{person.shelterCode}</p>
              )}
            </div>
          )}

          {/* Family group info */}
          {person.familyGroupId && (
            <div className="card">
              <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Users className="h-5 w-5" />
                {t('familyGroup')}
              </h2>
              <p className="font-mono text-sm">{person.familyCode}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('familySize')}: {person.familySize}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
