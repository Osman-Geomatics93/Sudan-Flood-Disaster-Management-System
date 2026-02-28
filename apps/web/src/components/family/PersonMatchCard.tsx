'use client';

import { Check } from 'lucide-react';

interface PersonMatchCardProps {
  person: {
    id: string;
    registrationCode: string;
    firstName_ar: string;
    lastName_ar: string;
    firstName_en: string | null;
    lastName_en: string | null;
    phone: string | null;
    status: string;
    shelter?: { name_en: string | null; shelterCode: string } | null;
  };
  selected: boolean;
  onToggle: (id: string) => void;
}

export default function PersonMatchCard({ person, selected, onToggle }: PersonMatchCardProps) {
  return (
    <div
      onClick={() => onToggle(person.id)}
      className={`card p-4 cursor-pointer transition-colors border-2 ${
        selected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-accent'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">
            {person.firstName_ar} {person.lastName_ar}
          </p>
          {person.firstName_en && (
            <p className="text-xs text-muted-foreground">
              {person.firstName_en} {person.lastName_en}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-muted-foreground">{person.registrationCode}</span>
            <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{person.status}</span>
          </div>
          {person.shelter && (
            <p className="text-xs text-muted-foreground mt-1">
              {person.shelter.name_en} ({person.shelter.shelterCode})
            </p>
          )}
          {person.phone && <p className="text-xs text-muted-foreground mt-1">{person.phone}</p>}
        </div>
        {selected && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  );
}
