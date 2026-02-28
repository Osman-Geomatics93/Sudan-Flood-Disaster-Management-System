'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName_ar: '',
    lastName_ar: '',
    firstName_en: '',
    lastName_en: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/trpc/auth.register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            email: formData.email,
            password: formData.password,
            firstName_ar: formData.firstName_ar,
            lastName_ar: formData.lastName_ar,
            firstName_en: formData.firstName_en || undefined,
            lastName_en: formData.lastName_en || undefined,
          },
        }),
      });

      if (!res.ok) {
        setError(t('registrationFailed'));
        return;
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Registration succeeded but auto-login failed, redirect to login
        router.push('/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError(t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="HRC Sudan"
            width={56}
            height={56}
            className="mx-auto drop-shadow-md"
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{t('registerTitle')}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t('registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card space-y-4 rounded-lg border p-6 shadow-sm">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName_ar" className="text-sm font-medium">
                {t('firstName_ar')}
              </label>
              <input
                id="firstName_ar"
                name="firstName_ar"
                type="text"
                value={formData.firstName_ar}
                onChange={handleChange}
                required
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName_ar" className="text-sm font-medium">
                {t('lastName_ar')}
              </label>
              <input
                id="lastName_ar"
                name="lastName_ar"
                type="text"
                value={formData.lastName_ar}
                onChange={handleChange}
                required
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName_en" className="text-sm font-medium">
                {t('firstName_en')}
              </label>
              <input
                id="firstName_en"
                name="firstName_en"
                type="text"
                value={formData.firstName_en}
                onChange={handleChange}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName_en" className="text-sm font-medium">
                {t('lastName_en')}
              </label>
              <input
                id="lastName_en"
                name="lastName_en"
                type="text"
                value={formData.lastName_en}
                onChange={handleChange}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex h-10 w-full items-center justify-center rounded-md px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? t('signingUp') : t('signUp')}
          </button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          {t('hasAccount')}{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
