'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('invalidCredentials'));
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-primary items-end p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-md bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground text-sm font-bold">
              SF
            </div>
            <span className="font-heading text-lg font-semibold text-primary-foreground tracking-tight">
              SudanFlood
            </span>
          </div>
          <h2 className="font-heading text-3xl font-bold text-primary-foreground leading-tight mb-3">
            {t('loginSubtitle')}
          </h2>
          <p className="text-primary-foreground/70 text-sm max-w-md leading-relaxed">
            Inter-agency emergency coordination platform for flood disaster management across Sudan.
          </p>
        </div>
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              SF
            </div>
            <span className="font-heading text-base font-semibold tracking-tight">SudanFlood</span>
          </div>

          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{t('loginTitle')}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t('loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive animate-in">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-field"
                placeholder="admin@sudanflood.gov.sd"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input-field pe-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {t('signingIn')}
                </span>
              ) : (
                t('signIn')
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/80"
              style={{
                transitionProperty: 'color',
                transitionDuration: 'var(--duration-fast)',
                transitionTimingFunction: 'var(--ease-smooth)',
              }}
            >
              {t('signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
