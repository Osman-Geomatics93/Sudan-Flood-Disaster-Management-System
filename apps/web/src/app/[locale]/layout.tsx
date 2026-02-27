import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, Noto_Sans_Arabic } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SessionProvider } from '@/providers/session-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { TRPCProvider } from '@/providers/trpc-provider';
import '@/styles/globals.css';

const fontHeading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const fontBody = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const fontArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'SudanFlood - Disaster Management System',
  description: 'Sudan Flood Disaster Management System for inter-agency emergency coordination',
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'ar' | 'en')) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${fontHeading.variable} ${fontBody.variable} ${fontArabic.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <SessionProvider>
          <ThemeProvider>
            <TRPCProvider>
              <NextIntlClientProvider messages={messages}>
                {children}
              </NextIntlClientProvider>
            </TRPCProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
