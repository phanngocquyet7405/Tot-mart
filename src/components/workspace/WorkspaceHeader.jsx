"use client";

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetTrigger } from '@/components/ui/sheet';
import AccountMenu from './AccountMenu';

export default function WorkspaceHeader({ label, sidebarId, mobileId, desktopOpen, mobileOpen, onToggleDesktop, account, onLogout, pending, actions }) {
  return <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b bg-background px-4 py-2">
    <div className="flex min-w-0 items-center gap-2">
      <Button variant="ghost" className="hidden size-11 md:inline-flex" onClick={onToggleDesktop} aria-label={desktopOpen ? 'Ẩn thanh bên' : 'Hiện thanh bên'} aria-expanded={desktopOpen} aria-controls={sidebarId}><Menu className="size-5" aria-hidden="true" /></Button>
      <SheetTrigger asChild><Button variant="ghost" className="size-11 md:hidden" aria-label="Mở menu" aria-expanded={mobileOpen} aria-controls={mobileId}><Menu className="size-5" aria-hidden="true" /></Button></SheetTrigger>
      <span className="hidden truncate text-sm font-medium text-muted-foreground sm:block">{label}</span>
    </div>
    <div className="flex min-w-0 items-center gap-2">{actions}<AccountMenu account={account} onLogout={onLogout} pending={pending} /></div>
  </header>;
}
