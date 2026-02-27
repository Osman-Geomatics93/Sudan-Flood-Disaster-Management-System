'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import {
  LayoutDashboard,
  Map,
  LifeBuoy,
  Phone,
  Home,
  Users,
  Package,
  CheckSquare,
  Building2,
  FileText,
  Settings,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import type { UserRole } from '@sudanflood/shared';

interface NavItem {
  href: string;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
  roles: readonly UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, roles: ['super_admin', 'agency_admin', 'field_worker', 'citizen'] },
  { href: '/dashboard/flood-zones', labelKey: 'floodZones', icon: Map, roles: ['super_admin', 'agency_admin', 'field_worker', 'citizen'] },
  { href: '/dashboard/rescue', labelKey: 'rescue', icon: LifeBuoy, roles: ['super_admin', 'agency_admin', 'field_worker'] },
  { href: '/dashboard/emergency-calls', labelKey: 'emergencyCalls', icon: Phone, roles: ['super_admin', 'agency_admin', 'field_worker'] },
  { href: '/dashboard/shelters', labelKey: 'shelters', icon: Home, roles: ['super_admin', 'agency_admin', 'field_worker', 'citizen'] },
  { href: '/dashboard/displaced-persons', labelKey: 'displacedPersons', icon: Users, roles: ['super_admin', 'agency_admin', 'field_worker'] },
  { href: '/dashboard/supplies', labelKey: 'supplies', icon: Package, roles: ['super_admin', 'agency_admin', 'field_worker'] },
  { href: '/dashboard/tasks', labelKey: 'tasks', icon: CheckSquare, roles: ['super_admin', 'agency_admin', 'field_worker'] },
  { href: '/dashboard/organizations', labelKey: 'organizations', icon: Building2, roles: ['super_admin', 'agency_admin', 'field_worker'] },
  { href: '/dashboard/reports', labelKey: 'reports', icon: FileText, roles: ['super_admin', 'agency_admin'] },
  { href: '/dashboard/settings', labelKey: 'settings', icon: Settings, roles: ['super_admin', 'agency_admin'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
      <aside className="hidden md:flex w-64 flex-col border-e bg-card">
        <SidebarContent items={filteredNavItems} session={session} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 start-0 w-64 bg-card shadow-lg">
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
        <div className="p-6">{children}</div>
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
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            SF
          </div>
          <span className="font-bold text-lg">SudanFlood</span>
        </Link>
        {session?.user && (
          <p className="mt-2 text-xs text-muted-foreground truncate">
            {session.user.email}
          </p>
        )}
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-auto custom-scrollbar">
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
    <header className="flex items-center justify-between border-b px-4 md:px-6 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden rounded-md p-2 hover:bg-accent"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <Link
          href="/dashboard"
          locale="en"
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded"
        >
          EN
        </Link>
        <Link
          href="/dashboard"
          locale="ar"
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded font-arabic"
        >
          عربي
        </Link>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-md p-2 hover:bg-accent text-muted-foreground hover:text-foreground"
          aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {initials}
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute end-0 top-full z-50 mt-1 w-48 rounded-md border bg-card py-1 shadow-lg">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {session?.user?.role?.replace('_', ' ')}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
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
