/**
 * Format a date for display. Returns ISO date string if no Intl support.
 */
export function formatDate(date: Date | string, locale: string = 'ar-SD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return d.toISOString().split('T')[0] ?? d.toISOString();
  }
}

/**
 * Format date + time
 */
export function formatDateTime(date: Date | string, locale: string = 'ar-SD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

/**
 * Relative time (e.g. "5 minutes ago")
 */
export function timeAgo(date: Date | string, locale: string = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (seconds < 60) return rtf.format(-seconds, 'second');
    if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), 'minute');
    if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), 'hour');
    if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 86400), 'day');
    return rtf.format(-Math.floor(seconds / 2592000), 'month');
  } catch {
    return d.toISOString();
  }
}
