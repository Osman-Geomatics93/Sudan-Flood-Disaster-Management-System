'use client';

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  severe: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  extreme: 'bg-red-200 text-red-950 dark:bg-red-950 dark:text-red-200',
};

export function SeverityBadge({ severity }: { severity: string }) {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.moderate;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {severity}
    </span>
  );
}
