import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for API routes, static files, etc.
  matcher: ['/', '/(ar|en)/:path*', '/login', '/register', '/dashboard/:path*'],
};
