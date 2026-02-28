'use client';

import { Users, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FamilyMember {
  id: string;
  firstName_ar: string;
  lastName_ar: string;
  status: string;
  shelter?: { name_en: string | null; shelterCode: string } | null;
}

interface FamilyGroupCardProps {
  familyCode: string;
  headName: string;
  members: FamilyMember[];
}

export default function FamilyGroupCard({ familyCode, headName, members }: FamilyGroupCardProps) {
  const t = useTranslations('familyReunification');
  const shelterIds = new Set(members.map((m) => m.shelter?.shelterCode).filter(Boolean));
  const crossShelter = shelterIds.size > 1;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{familyCode}</span>
        </div>
        {crossShelter && (
          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-xs">{t('crossShelterWarning')}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-2">{t('headOfFamily')}: {headName}</p>
      <div className="space-y-1.5">
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between text-xs">
            <span>{m.firstName_ar} {m.lastName_ar}</span>
            <span className="text-muted-foreground">
              {m.shelter?.shelterCode || '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
