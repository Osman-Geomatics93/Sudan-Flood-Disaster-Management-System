'use client';

import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import type { UserRole } from '@sudanflood/shared';

const AdminDashboard = dynamic(() => import('@/components/dashboard/AdminDashboard'));
const AgencyDashboard = dynamic(() => import('@/components/dashboard/AgencyDashboard'));
const FieldWorkerDashboard = dynamic(() => import('@/components/dashboard/FieldWorkerDashboard'));
const CitizenDashboard = dynamic(() => import('@/components/dashboard/CitizenDashboard'));

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user?.role ?? 'citizen') as UserRole;

  switch (userRole) {
    case 'super_admin':
      return <AdminDashboard />;
    case 'agency_admin':
      return <AgencyDashboard />;
    case 'field_worker':
      return <FieldWorkerDashboard />;
    case 'citizen':
      return <CitizenDashboard />;
    default:
      return <CitizenDashboard />;
  }
}
