import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-600 text-white text-3xl font-bold mb-4">
            SF
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {t('common.appName')}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {t('auth.loginSubtitle')}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-brand-700 transition-colors"
          >
            {t('nav.dashboard')}
          </Link>
          <Link
            href="/dashboard"
            locale="en"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent transition-colors"
          >
            English
          </Link>
          <Link
            href="/dashboard"
            locale="ar"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent transition-colors font-arabic"
          >
            العربية
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold text-severity-severe">0</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.activeZones')}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold text-brand-600">0</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.activeRescues')}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.totalSheltered')}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.pendingCalls')}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
