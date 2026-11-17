"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppContext } from '@/app/context/AppContext';
import { withRole } from '@/app/middleware/roleMiddleware';
import ManagerShell from './ManagerShell';
import { managerNavigation } from '../lib/navigation.mjs';

const DraftContext = createContext(() => {});
export function useManagerDraft() { return useContext(DraftContext); }

function ProtectedLayout({ children }) {
  const router = useRouter(), pathname = usePathname();
  const { logout } = useContext(AppContext);
  const draft = useRef({ dirty: false, busy: false });
  const markDirty = useCallback((dirty, busy = false) => { draft.current = { dirty, busy }; }, []);
  useEffect(() => {
    const key = window.location.hash.slice(1);
    const target = managerNavigation.find(item => item.id === key);
    if (pathname === '/manager' && target) router.replace(target.href);
  }, [pathname, router]);
  useEffect(() => {
    function warn(event) { if (draft.current.dirty || draft.current.busy) event.preventDefault(); }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);
  function canLeave() {
    if (draft.current.busy) return false;
    return !draft.current.dirty || window.confirm('Bỏ các thay đổi chưa lưu?');
  }
  function navigate(href) {
    if (href === pathname) return true;
    if (!canLeave()) return false;
    markDirty(false);
    return true;
  }
  async function signOut() {
    const previous = draft.current;
    // Logout redirects on success. Avoid a second beforeunload prompt; restore on failure.
    markDirty(false);
    try {
      const result = await logout();
      if (result === false) draft.current = previous;
      return result;
    } catch (error) { draft.current = previous; throw error; }
  }
  return <DraftContext.Provider value={markDirty}><ManagerShell onNavigate={navigate} beforeLogout={canLeave} onLogout={signOut}>{children}</ManagerShell></DraftContext.Provider>;
}

const GuardedLayout = withRole(ProtectedLayout, ['merchant']);
export default function ManagerLayout({ children }) {
  const { isLoading } = useContext(AppContext);
  return isLoading ? <p role="status" className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Đang xác minh phiên merchant…</p> : <GuardedLayout>{children}</GuardedLayout>;
}
