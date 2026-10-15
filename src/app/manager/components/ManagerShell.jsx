"use client";

import { useContext, useState } from 'react';
import { LayoutDashboard, Package, Boxes, Gift, CalendarDays, ShoppingBag, Menu, LogOut } from 'lucide-react';
import { AppContext } from '@/app/context/AppContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';

export const navigation = [
  ['overview', 'Tổng quan', LayoutDashboard], ['products', 'Sản phẩm', Package],
  ['combos', 'Combo', Boxes], ['gifts', 'Gift', Gift],
  ['subscriptions', 'Đăng ký hàng tháng', CalendarDays], ['orders', 'Đơn hàng', ShoppingBag],
];

function Navigation({ current, onNavigate }) {
  return <nav aria-label="Quản lý cửa hàng" className="grid gap-1">{navigation.map(([key, label, Icon]) =>
    <a key={key} href={key==='overview'?'/manager':`/manager/${key}`} aria-current={current === key ? 'page' : undefined} onClick={event => { if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return; event.preventDefault(); onNavigate(key); }}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring ${current === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />{label}
    </a>)}</nav>;
}

export default function ManagerShell({ current, onNavigate, children }) {
  const { user, logout } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const name = user?.fullName || user?.name || user?.username || user?.email || 'Tài khoản merchant';
  async function signOut() {
    if (leaving) return;
    setLeaving(true); setLogoutError('');
    try { if (!await logout()) setLogoutError('Chưa đăng xuất được. Vui lòng thử lại.'); }
    catch { setLogoutError('Chưa đăng xuất được. Vui lòng thử lại.'); }
    finally { setLeaving(false); }
  }
  return <div className="min-h-dvh bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
    <a href="#manager-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-popover focus:p-3">Đến nội dung chính</a>
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-card p-5 lg:flex">
        <div className="mb-9 px-3"><p className="font-serif text-2xl font-semibold">TotMart</p><p className="mt-1 text-sm text-muted-foreground">Quản lý cửa hàng</p></div>
        <Navigation current={current} onNavigate={onNavigate} />
        <p className="mt-auto px-3 pt-8 text-xs leading-relaxed text-muted-foreground">Sản phẩm và các gói thuộc cửa hàng của bạn.</p>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex min-h-20 items-center justify-between gap-3 border-b bg-card px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetTrigger asChild><Button variant="ghost" className="size-11 lg:hidden" aria-label="Mở menu cửa hàng"><Menu /></Button></SheetTrigger>
              <SheetContent side="left" className="gap-6 p-5 data-[side=left]:w-[min(90vw,320px)]" showCloseButton={false}>
                <div><SheetTitle className="font-serif text-2xl">TotMart</SheetTitle><SheetDescription>Quản lý cửa hàng</SheetDescription></div>
                <Navigation current={current} onNavigate={key => { if (onNavigate(key) !== false) setMenuOpen(false); }} />
                <Button variant="outline" className="min-h-11" onClick={() => setMenuOpen(false)}>Đóng menu</Button>
              </SheetContent>
            </Sheet>
            <div className="min-w-0"><p className="text-xs text-muted-foreground">Cửa hàng của bạn</p><p className="truncate font-medium" title={name}>{name}</p></div>
          </div>
          <Button variant="outline" disabled={leaving} className="min-h-11" onClick={signOut}><LogOut aria-hidden="true" /><span>{leaving ? 'Đang thoát…' : 'Đăng xuất'}</span></Button>
        </header>
        {logoutError && <p role="alert" className="px-4 py-3 text-sm text-destructive sm:px-8">{logoutError}</p>}
        <main id="manager-content" tabIndex={-1} className="mx-auto max-w-[1440px] p-4 outline-none sm:p-8">{children}</main>
      </div>
    </div><Toaster />
  </div>;
}
