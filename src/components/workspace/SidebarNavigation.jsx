"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { activeNavigationHref } from './navigation.mjs';

const itemClass = 'flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring';

function NavigationLink({ item, activeHref, onNavigate }) {
  const Icon = item.icon;
  const active = activeHref === item.href;
  return <Link href={item.href} prefetch={false} aria-current={active ? 'page' : undefined}
    onNavigate={event => { if (onNavigate?.(item.href) === false) event.preventDefault(); }}
    className={cn(itemClass, active && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground')}>
    {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
    <span className="min-w-0 break-words">{item.label}</span>
  </Link>;
}

function NavigationGroup({ item, activeHref, onNavigate }) {
  const active = item.children.some(child => child.href === activeHref);
  const [open, setOpen] = useState(active);
  const Icon = item.icon;
  return <Collapsible open={open} onOpenChange={setOpen}>
    <CollapsibleTrigger className={cn(itemClass, 'justify-between', active && 'font-medium text-sidebar-accent-foreground')}>
      <span className="flex min-w-0 items-center gap-3"><Icon className="size-4 shrink-0" aria-hidden="true" /><span className="break-words">{item.label}</span></span>
      <ChevronDown className={cn('size-4 shrink-0 transition-transform motion-reduce:transition-none', open && 'rotate-180')} aria-hidden="true" />
    </CollapsibleTrigger>
    <CollapsibleContent><ul className="ml-5 mt-1 space-y-1 border-l border-sidebar-border pl-2">
      {item.children.map(child => <li key={child.href}><NavigationLink item={child} activeHref={activeHref} onNavigate={onNavigate} /></li>)}
    </ul></CollapsibleContent>
  </Collapsible>;
}

export default function SidebarNavigation({ items, pathname, label, onNavigate }) {
  const activeHref = activeNavigationHref(items, pathname);
  return <nav aria-label={label}><ul className="space-y-1">
    {items.map(item => <li key={item.id || item.href || item.label}>
      {item.children ? <NavigationGroup key={`${item.id || item.label}:${activeHref || ''}`} item={item} activeHref={activeHref} onNavigate={onNavigate} />
        : <NavigationLink item={item} activeHref={activeHref} onNavigate={onNavigate} />}
    </li>)}
  </ul></nav>;
}
