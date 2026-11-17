"use client";

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Box, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import SidebarNavigation from './SidebarNavigation';
import WorkspaceHeader from './WorkspaceHeader';
import { isSidebarShortcut } from './navigation.mjs';

function WorkspaceBrand({ brand, onNavigate }) {
  return (
    <Link
      href={brand.href}
      prefetch={false}
      onNavigate={event => { if (onNavigate(brand.href) === false) event.preventDefault(); }}
      className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs">
        <Box className="size-6" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-sans text-lg font-bold text-foreground">{brand.name}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{brand.label}</span>
      </span>
    </Link>
  );
}

export default function WorkspaceShell({ brand, navigation, pathname, onNavigate, account, onLogout, logoutPending, logoutError, headerActions, contentClassName, children }) {
  const id = useId();
  const sidebarId = `${id}-sidebar`, mobileId = `${id}-mobile`, mainId = `${id}-content`;
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const main = useRef(null);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    function resize() { if (media.matches) setMobileOpen(false); }
    media.addEventListener('change', resize);
    function shortcut(event) {
      if (!isSidebarShortcut(event)) return;
      event.preventDefault();
      if (media.matches) setDesktopOpen(value => !value);
      else setMobileOpen(value => !value);
    }
    window.addEventListener('keydown', shortcut);
    return () => { media.removeEventListener('change', resize); window.removeEventListener('keydown', shortcut); };
  }, []);

  function navigate(href) {
    if (onNavigate?.(href) === false) return false;
    setMobileOpen(false);
    return true;
  }

  const sidebar = (
    <>
      <div className="shrink-0 border-b border-sidebar-border p-4">
        <WorkspaceBrand brand={brand} onNavigate={navigate} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
        <SidebarNavigation items={navigation} pathname={pathname} label={brand.label} onNavigate={navigate} />
      </div>
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="min-h-11 w-full justify-start gap-3 text-destructive-text hover:bg-destructive/10 hover:text-destructive-text"
          disabled={logoutPending}
          onClick={() => { void onLogout(); }}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {logoutPending ? 'Đang đăng xuất…' : 'Đăng xuất'}
        </Button>
      </div>
    </>
  );

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <div className="min-h-dvh bg-background font-sans text-foreground selection:bg-primary selection:text-primary-foreground">
        <a
          href={`#${mainId}`}
          onClick={() => main.current?.focus()}
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[60] focus:rounded-lg focus:bg-popover focus:p-3 focus:text-foreground focus:shadow-md"
        >
          Đến nội dung chính
        </a>
        <aside
          id={sidebarId}
          aria-label={brand.label}
          hidden={!desktopOpen}
          className={cn(
            'fixed inset-y-0 left-0 z-40 hidden h-dvh w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
            desktopOpen && 'md:flex'
          )}
        >
          {sidebar}
        </aside>
        <div className={cn('min-w-0 transition-all duration-200', desktopOpen && 'md:pl-64')}>
          <WorkspaceHeader
            label={brand.label}
            sidebarId={sidebarId}
            mobileId={mobileId}
            desktopOpen={desktopOpen}
            mobileOpen={mobileOpen}
            onToggleDesktop={() => setDesktopOpen(value => !value)}
            account={account}
            onLogout={onLogout}
            pending={logoutPending}
            actions={headerActions}
          />
          {logoutError && !mobileOpen && (
            <p role="alert" className="break-words border-b border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive-text">
              {logoutError}
            </p>
          )}
          <main ref={main} id={mainId} tabIndex={-1} inert={logoutPending} className={cn('mx-auto min-w-0 p-4 outline-none md:p-6', contentClassName)}>
            {children}
          </main>
        </div>
      </div>
      <SheetContent
        id={mobileId}
        side="left"
        showCloseButton={false}
        className="gap-0 border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground data-[side=left]:w-[min(90vw,18rem)]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu {brand.label.toLocaleLowerCase('vi')}</SheetTitle>
          <SheetDescription>Chọn khu vực làm việc hoặc đóng menu để quay lại nội dung.</SheetDescription>
        </SheetHeader>
        <div className="flex shrink-0 justify-end border-b border-sidebar-border px-3 py-2">
          <Button variant="ghost" className="min-h-11 gap-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
            <X className="size-4" aria-hidden="true" />
            Đóng menu
          </Button>
        </div>
        {sidebar}
        {logoutError && (
          <p role="alert" className="shrink-0 break-words border-t border-destructive/20 bg-destructive/5 p-3 text-sm font-medium text-destructive-text">
            {logoutError}
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
