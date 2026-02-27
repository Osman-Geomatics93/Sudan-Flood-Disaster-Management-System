'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft, Search } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  registered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  sheltered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  relocated: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  returned_home: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  missing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  deceased: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function SearchDisplacedPersonsPage() {
  const t = useTranslations('displacedPerson');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const searchQuery = trpc.displacedPerson.search.useQuery(
    { query: searchTerm },
    { enabled: searchTerm.length >= 1 },
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchTerm(query.trim());
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-md p-2 hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">{t('searchTitle')}</h1>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim().length >= 2) {
                  setSearchTerm(e.target.value.trim());
                }
              }}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-md border bg-background py-2 pe-3 ps-10 text-sm"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {tCommon('search')}
          </button>
        </div>
      </form>

      {searchQuery.isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {searchQuery.data && searchQuery.data.length === 0 && (
        <div className="rounded-lg border py-12 text-center text-muted-foreground">
          {t('noResults')}
        </div>
      )}

      {searchQuery.data && searchQuery.data.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t('code')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('nameAr')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('nameEn')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('status')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('phone')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('nationalId')}</th>
              </tr>
            </thead>
            <tbody>
              {searchQuery.data.map((person) => (
                <tr key={person.id} className="border-b hover:bg-muted/30 cursor-pointer">
                  <td className="px-4 py-3 font-mono">
                    <Link href={`/dashboard/displaced-persons/${person.id}`} className="text-primary hover:underline">
                      {person.registrationCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3" dir="rtl">
                    <Link href={`/dashboard/displaced-persons/${person.id}`} className="hover:underline">
                      {person.firstName_ar} {person.lastName_ar}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {person.firstName_en && person.lastName_en
                      ? `${person.firstName_en} ${person.lastName_en}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[person.status] ?? ''}`}>
                      {t(`status_${person.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{person.phone ?? '-'}</td>
                  <td className="px-4 py-3">{person.nationalId ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
