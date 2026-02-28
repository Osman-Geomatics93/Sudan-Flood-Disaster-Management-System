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
      className={`card cursor-pointer border-2 p-4 transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'hover:bg-accent border-transparent'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">
            {person.firstName_ar} {person.lastName_ar}
          </p>
          {person.firstName_en && (
            <p className="text-muted-foreground text-xs">
              {person.firstName_en} {person.lastName_en}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-muted-foreground text-xs">{person.registrationCode}</span>
            <span className="bg-muted inline-flex rounded-full px-2 py-0.5 text-xs capitalize">
              {person.status}
            </span>
          </div>
          {person.shelter && (
            <p className="text-muted-foreground mt-1 text-xs">
              {person.shelter.name_en} ({person.shelter.shelterCode})
            </p>
          )}
          {person.phone && <p className="text-muted-foreground mt-1 text-xs">{person.phone}</p>}
        </div>
        {selected && (
          <div className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  );
}
