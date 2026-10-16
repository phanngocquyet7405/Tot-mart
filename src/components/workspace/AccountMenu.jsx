"use client";

import { ChevronDown, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AccountMenu({ account, onLogout, pending }) {
  return <DropdownMenu><DropdownMenuTrigger asChild>
    <Button variant="ghost" className="h-auto min-h-11 min-w-0 max-w-[60vw] gap-2 px-2 sm:max-w-sm" aria-label={`Tài khoản ${account.name}`}>
      <Avatar className="size-8 shrink-0"><AvatarFallback className="bg-primary text-xs text-primary-foreground">{account.name.slice(0, 2).toLocaleUpperCase('vi')}</AvatarFallback></Avatar>
      <span className="min-w-0 text-left"><span className="block truncate text-sm font-medium">{account.name}</span><span className="block truncate text-xs text-muted-foreground">{account.roleLabel}</span></span>
      <ChevronDown className="hidden size-4 shrink-0 sm:block" aria-hidden="true" />
    </Button>
  </DropdownMenuTrigger><DropdownMenuContent align="end" className="w-64 max-w-[calc(100vw-2rem)]">
    <DropdownMenuLabel className="whitespace-normal break-words">{account.name}{account.email && <span className="mt-1 block text-xs font-normal text-muted-foreground">{account.email}</span>}</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="min-h-11 text-destructive" disabled={pending} onSelect={event => { event.preventDefault(); void onLogout(); }}>
      <LogOut aria-hidden="true" />{pending ? 'Đang đăng xuất…' : 'Đăng xuất'}
    </DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>;
}
