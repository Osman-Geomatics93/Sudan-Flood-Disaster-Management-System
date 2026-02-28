import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="animate-slide-up mx-auto max-w-xl text-center">
        <div className="mb-8">
          <div className="bg-primary text-primary-foreground inline-flex h-14 w-14 items-center justify-center rounded-lg text-xl font-bold">
            SF
          </div>
        </div>
        <h1 className="font-heading mb-3 text-4xl font-bold tracking-tight">
          {t('common.appName')}
        </h1>
        <p className="text-muted-foreground mx-auto mb-10 max-w-md text-base leading-relaxed">
          {t('auth.loginSubtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">
            {t('nav.dashboard')}
          </Link>
          <Link href="/dashboard" locale="en" className="btn-secondary">
            English
          </Link>
          <Link href="/dashboard" locale="ar" className="btn-secondary font-arabic">
            العربية
          </Link>
        </div>

        <div className="animate-slide-up delay-2 mt-16 grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <div className="card p-5">
            <div className="text-severity-severe text-2xl font-bold">0</div>
            <div className="text-muted-foreground mt-1 text-xs">{t('dashboard.activeZones')}</div>
          </div>
          <div className="card p-5">
            <div className="text-primary text-2xl font-bold">0</div>
            <div className="text-muted-foreground mt-1 text-xs">{t('dashboard.activeRescues')}</div>
          </div>
          <div className="card p-5">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
            <div className="text-muted-foreground mt-1 text-xs">
              {t('dashboard.totalSheltered')}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">0</div>
            <div className="text-muted-foreground mt-1 text-xs">{t('dashboard.pendingCalls')}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
