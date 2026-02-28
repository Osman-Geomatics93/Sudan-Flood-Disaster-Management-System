'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { trpc } from '@/lib/trpc-client';
import { ArrowLeft, Pencil, Trash2, Globe, Mail, Building2 } from 'lucide-react';

const TYPE_STYLES: Record<string, string> = {
  government_federal: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  government_state: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  un_agency: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  international_ngo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  local_ngo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  red_cross_crescent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  military: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  private_sector: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  community_based: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function OrganizationDetailPage() {
  const t = useTranslations('org');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const utils = trpc.useUtils();
  const orgQuery = trpc.organization.getById.useQuery({ id });
  const deleteMutation = trpc.organization.delete.useMutation({
    onSuccess: () => {
      utils.organization.list.invalidate();
      router.push('/dashboard/organizations');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({ id });
  };

  if (orgQuery.isLoading) {
    return (
      <div className="animate-in">
        <div className="flex items-center justify-center py-12">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (orgQuery.error) {
    return (
      <div className="animate-in">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {tCommon('error')}
        </div>
      </div>
    );
  }

  const org = orgQuery.data;
  if (!org) return null;

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/organizations"
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToList')}
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('details')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/organizations/${id}/edit`}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <Pencil className="h-4 w-4" />
            {t('edit')}
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-secondary flex items-center gap-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            {t('delete')}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="mb-3 text-sm text-red-700 dark:text-red-400">{t('deleteConfirm')}</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? tCommon('loading') : tCommon('confirm')}
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary text-sm">
              {tCommon('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Organization Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Building2 className="text-muted-foreground h-5 w-5" />
            {t('name')}
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {t('nameEn')}
              </dt>
              <dd className="mt-0.5 text-sm font-medium">{org.name_en}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {t('nameAr')}
              </dt>
              <dd className="mt-0.5 text-sm font-medium" dir="rtl">
                {org.name_ar}
              </dd>
            </div>
            {org.acronym && (
              <div>
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  {t('acronym')}
                </dt>
                <dd className="mt-0.5 font-mono text-sm">{org.acronym}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {t('orgType')}
              </dt>
              <dd className="mt-1">
                <span className={`badge ${TYPE_STYLES[org.orgType] ?? ''}`}>
                  {t(`type_${org.orgType}` as Parameters<typeof t>[0])}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {t('status')}
              </dt>
              <dd className="mt-1">
                <span
                  className={`badge ${org.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                >
                  {org.isActive ? t('active') : t('inactive')}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Contact Information */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Mail className="text-muted-foreground h-5 w-5" />
            {t('contact')}
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {t('contactEmail')}
              </dt>
              <dd className="mt-0.5 text-sm">
                {org.contactEmail ? (
                  <a href={`mailto:${org.contactEmail}`} className="text-primary hover:underline">
                    {org.contactEmail}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{t('noEmail')}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {t('contactPhone')}
              </dt>
              <dd className="mt-0.5 text-sm">
                {org.contactPhone ? (
                  <a href={`tel:${org.contactPhone}`} className="text-primary hover:underline">
                    {org.contactPhone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{t('noPhone')}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {t('website')}
              </dt>
              <dd className="mt-0.5 text-sm">
                {org.website ? (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {org.website}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{t('noWebsite')}</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Metadata */}
        <div className="rounded-lg border p-6 md:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">{tCommon('actions')}</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {t('createdAt')}
              </dt>
              <dd className="mt-0.5 text-sm">{new Date(org.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                {t('updatedAt')}
              </dt>
              <dd className="mt-0.5 text-sm">{new Date(org.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
