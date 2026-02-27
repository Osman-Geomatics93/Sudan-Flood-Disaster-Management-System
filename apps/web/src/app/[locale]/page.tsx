import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="text-center max-w-xl mx-auto animate-slide-up">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary text-primary-foreground text-xl font-bold">
            SF
          </div>
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-3">
          {t('common.appName')}
        </h1>
        <p className="text-base text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
          {t('auth.loginSubtitle')}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/dashboard" className="btn-primary">
            {t('nav.dashboard')}
          </Link>
          <Link
            href="/dashboard"
            locale="en"
            className="btn-secondary"
          >
            English
          </Link>
          <Link
            href="/dashboard"
            locale="ar"
            className="btn-secondary font-arabic"
          >
            العربية
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center animate-slide-up delay-2">
          <div className="card p-5">
            <div className="text-2xl font-bold text-severity-severe">0</div>
            <div className="text-xs text-muted-foreground mt-1">{t('dashboard.activeZones')}</div>
          </div>
          <div className="card p-5">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-xs text-muted-foreground mt-1">{t('dashboard.activeRescues')}</div>
          </div>
          <div className="card p-5">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
            <div className="text-xs text-muted-foreground mt-1">{t('dashboard.totalSheltered')}</div>
          </div>
          <div className="card p-5">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">0</div>
            <div className="text-xs text-muted-foreground mt-1">{t('dashboard.pendingCalls')}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
