"use client";

import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { withAdmin } from '../middleware/roleMiddleware';
import { AppContext } from '../context/AppContext';
import { AdminNotificationProvider } from '../context/NotificationContext';
import { NotificationBell } from './components/notifications/NotificationBell';
import { adminNavigation } from './components/adminNavigation.mjs';
import WorkspaceShell from '@/components/workspace/WorkspaceShell';
import { useWorkspaceLogout } from '@/components/workspace/useWorkspaceLogout';

function AdminLayout({ children }) {
  const { user, logout } = useContext(AppContext);
  const pathname = usePathname();
  const session = useWorkspaceLogout(logout);
  const account = { name: user?.fullName || user?.name || user?.username || user?.email || 'Admin', email: user?.email, roleLabel: 'Quản trị viên' };
  return <AdminNotificationProvider><WorkspaceShell brand={{ name: 'TotBoxAdmin', label: 'Management', href: '/dashboard' }}
    navigation={adminNavigation} pathname={pathname} account={account} onLogout={session.signOut}
    logoutPending={session.pending} logoutError={session.error} headerActions={<NotificationBell />}>
    {children}
  </WorkspaceShell></AdminNotificationProvider>;
}

export default withAdmin(AdminLayout);
