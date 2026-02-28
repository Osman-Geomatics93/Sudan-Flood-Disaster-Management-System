'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import {
  LayoutDashboard,
  Map,
  MapPin,
  LifeBuoy,
  Phone,
  Home,
  Users,
  Package,
  CheckSquare,
  Building2,
  FileText,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  BarChart3,
  CloudLightning,
  Heart,
  Calculator,
  Shield,
} from 'lucide-react';
import Image from 'next/image';
import { useState, type ComponentType } from 'react';
import { trpc } from '@/lib/trpc-client';
import type { UserRole } from '@sudanflood/shared';

interface NavItem {
  href: string;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
  roles: readonly UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    labelKey: 'dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'agency_admin', 'field_worker', 'citizen'],
  },
  {
    href: '/dashboard/flood-zones',
    labelKey: 'floodZones',
    icon: Map,
    roles: ['super_admin', 'agency_admin', 'field_worker', 'citizen'],
  },
  {
    href: '/dashboard/rescue-operations',
    labelKey: 'rescue',
    icon: LifeBuoy,
    roles: ['super_admin', 'agency_admin', 'field_worker'],
  },
  {
    href: '/dashboard/emergency-calls',
    labelKey: 'emergencyCalls',
    icon: Phone,
    roles: ['super_admin', 'agency_admin', 'field_worker'],
  },
  {
    href: '/dashboard/shelters',
    labelKey: 'shelters',
    icon: Home,
    roles: ['super_admin', 'agency_admin', 'field_worker', 'citizen'],
  },
  {
    href: '/dashboard/displaced-persons',
    labelKey: 'displacedPersons',
    icon: Users,
    roles: ['super_admin', 'agency_admin', 'field_worker'],
  },
  {
    href: '/dashboard/supplies',
    labelKey: 'supplies',
    icon: Package,
    roles: ['super_admin', 'agency_admin', 'field_worker'],
  },
  {
    href: '/dashboard/tasks',
    labelKey: 'tasks',
    icon: CheckSquare,
    roles: ['super_admin', 'agency_admin', 'field_worker'],
  },
  {
    href: '/dashboard/organizations',
    labelKey: 'organizations',
    icon: Building2,
    roles: ['super_admin', 'agency_admin', 'field_worker'],
  },
  {
    href: '/dashboard/reports',
    labelKey: 'reports',
    icon: FileText,
    roles: ['super_admin', 'agency_admin', 'field_worker'],
  },
  {
    href: '/dashboard/analytics',
    labelKey: 'analytics',
    icon: BarChart3,
    roles: ['super_admin', 'agency_admin'],
  },
  {
    href: '/dashboard/map',
    labelKey: 'commandCenter',
    icon: MapPin,
    roles: ['super_admin', 'agency_admin', 'field_worker'],
  },
  {
    href: '/dashboard/weather-alerts',
    labelKey: 'weatherAlerts',
    icon: CloudLightning,
    roles: ['super_admin', 'agency_admin', 'field_worker', 'citizen'],
  },
  {
    href: '/dashboard/family-reunification',
    labelKey: 'familyReunification',
    icon: Heart,
    roles: ['super_admin', 'agency_admin', 'field_worker'],
  },
  {
    href: '/dashboard/resource-planner',
    labelKey: 'resourcePlanner',
    icon: Calculator,
    roles: ['super_admin', 'agency_admin'],
  },
  { href: '/dashboard/audit-logs', labelKey: 'auditLogs', icon: Shield, roles: ['super_admin'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const userRole = (session?.user?.role ?? 'citizen') as UserRole;
  const filteredNavItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="bg-card/80 hidden w-[260px] flex-col border-e backdrop-blur-sm md:flex">
        <SidebarContent items={filteredNavItems} session={session} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="bg-foreground/20 fixed inset-0 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="bg-card animate-slide-down fixed inset-y-0 start-0 w-[260px] shadow-lg">
            <SidebarContent items={filteredNavItems} session={session} />
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-auto">
        <Header
          session={session}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({
  items,
  session,
}: {
  items: NavItem[];
  session: ReturnType<typeof useSession>['data'];
}) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <>
      <div className="border-b px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="SudanFlood"
            width={32}
            height={32}
            className="h-8 w-8 rounded-md"
          />
          <span className="font-heading text-base font-semibold tracking-tight">SudanFlood</span>
        </Link>
        {session?.user && (
          <p className="text-muted-foreground mt-2.5 truncate text-xs">{session.user.email}</p>
        )}
      </div>
      <nav className="custom-scrollbar flex-1 space-y-0.5 overflow-auto px-3 py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href + item.labelKey}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              style={{
                transitionProperty: 'background-color, color',
                transitionDuration: 'var(--duration-fast)',
                transitionTimingFunction: 'var(--ease-smooth)',
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function Header({
  session,
  onMenuToggle,
  mobileMenuOpen,
}: {
  session: ReturnType<typeof useSession>['data'];
  onMenuToggle: () => void;
  mobileMenuOpen: boolean;
}) {
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName =
    session?.user?.firstName_en ||
    session?.user?.firstName_ar ||
    session?.user?.email?.split('@')[0] ||
    '';

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="btn-ghost p-2 md:hidden" aria-label="Toggle menu">
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex items-center gap-1">
        {/* Language Switcher */}
        <Link href="/dashboard" locale="en" className="btn-ghost px-2.5 py-1.5 text-xs">
          EN
        </Link>
        <Link href="/dashboard" locale="ar" className="btn-ghost font-arabic px-2.5 py-1.5 text-xs">
          عربي
        </Link>

        <div className="bg-border mx-1 h-5 w-px" />

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn-ghost text-muted-foreground hover:text-foreground p-2"
          aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notification Bell */}
        <NotificationBell />

        <div className="bg-border mx-1 h-5 w-px" />

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1.5"
            style={{
              transitionProperty: 'background-color',
              transitionDuration: 'var(--duration-fast)',
              transitionTimingFunction: 'var(--ease-smooth)',
            }}
          >
            <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium">
              {initials}
            </div>
            <ChevronDown className="text-muted-foreground h-3 w-3" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="bg-card animate-in absolute end-0 top-full z-50 mt-1.5 w-52 rounded-md border py-1 shadow-md">
                <div className="border-b px-3.5 py-2.5">
                  <p className="truncate text-sm font-medium">{displayName}</p>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {session?.user?.email}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs capitalize">
                    {session?.user?.role?.replace('_', ' ')}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-destructive hover:bg-accent flex w-full items-center gap-2 px-3.5 py-2 text-sm"
                  style={{
                    transitionProperty: 'background-color',
                    transitionDuration: 'var(--duration-fast)',
                    transitionTimingFunction: 'var(--ease-smooth)',
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  {tAuth('logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NotificationBell() {
  const unreadQuery = trpc.notification.unreadCount.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const count = typeof unreadQuery.data === 'number' ? unreadQuery.data : 0;

  return (
    <Link
      href="/dashboard/notifications"
      className="hover:bg-accent text-muted-foreground hover:text-foreground relative rounded-md p-2"
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="bg-destructive text-destructive-foreground absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
