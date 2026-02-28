'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc-client';
import { Search, Users } from 'lucide-react';
import PersonMatchCard from '@/components/family/PersonMatchCard';

export default function FamilyReunificationPage() {
  const t = useTranslations('familyReunification');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const utils = trpc.useUtils();

  const searchResults = trpc.displacedPerson.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 2 }
  );

  const createGroupMutation = trpc.displacedPerson.family.create.useMutation();
  const addMemberMutation = trpc.displacedPerson.family.addMember.useMutation();

  const togglePerson = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const [creating, setCreating] = useState(false);

  const handleCreateGroup = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length < 2) return;
    setCreating(true);
    try {
      const group = await createGroupMutation.mutateAsync({
        headOfFamilyId: ids[0],
        familySize: ids.length,
      });
      for (const personId of ids.slice(1)) {
        await addMemberMutation.mutateAsync({
          familyGroupId: group.id,
          personId,
        });
      }
      setSelectedIds(new Set());
      utils.displacedPerson.search.invalidate();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-in">
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-6">{t('title')}</h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border bg-card ps-10 pe-4 py-2.5 text-sm"
        />
      </div>

      {/* Selection Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border bg-primary/5 p-3">
          <span className="text-sm">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="btn-ghost px-3 py-1.5 text-sm"
            >
              Clear
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={selectedIds.size < 2 || creating}
              className="rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Users className="inline h-4 w-4 me-1.5" />
              {t('createGroup')}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {searchResults.isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {searchResults.data && searchResults.data.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            {t('searchResults')} ({searchResults.data.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchResults.data.map((person: any) => (
              <PersonMatchCard
                key={person.id}
                person={person}
                selected={selectedIds.has(person.id)}
                onToggle={togglePerson}
              />
            ))}
          </div>
        </div>
      )}

      {searchResults.data && searchResults.data.length === 0 && searchQuery.length >= 2 && (
        <div className="text-center py-12 text-muted-foreground">{t('noResults')}</div>
      )}

      {searchQuery.length < 2 && !searchResults.isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          {t('selectMembers')}
        </div>
      )}
    </div>
  );
}
