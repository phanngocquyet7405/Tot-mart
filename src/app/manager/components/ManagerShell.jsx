"use client";

import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { AppContext } from '@/app/context/AppContext';
import { Toaster } from '@/components/ui/sonner';
import WorkspaceShell from '@/components/workspace/WorkspaceShell';
import { useWorkspaceLogout } from '@/components/workspace/useWorkspaceLogout';
import { managerNavigation } from '../lib/navigation.mjs';

export default function ManagerShell({ onNavigate, onLogout, beforeLogout, children }) {
  const { user } = useContext(AppContext);
  const pathname = usePathname();
  const session = useWorkspaceLogout(onLogout, beforeLogout);
  const account = { name: user?.fullName || user?.name || user?.username || user?.email || 'Tài khoản merchant', email: user?.email, roleLabel: 'Merchant' };
  return <><WorkspaceShell brand={{ name: 'TotMart', label: 'Quản lý cửa hàng', href: '/manager' }}
    navigation={managerNavigation} pathname={pathname} onNavigate={onNavigate} account={account}
    onLogout={session.signOut} logoutPending={session.pending} logoutError={session.error} contentClassName="max-w-[1440px]">
    {children}
  </WorkspaceShell><Toaster /></>;
}
