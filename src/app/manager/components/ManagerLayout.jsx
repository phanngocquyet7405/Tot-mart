"use client";
import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppContext } from '@/app/context/AppContext';
import { withRole } from '@/app/middleware/roleMiddleware';
import ManagerShell, { navigation } from './ManagerShell';
const DraftContext=createContext(()=>{});
export function useManagerDraft(){return useContext(DraftContext);}
function ProtectedLayout({children}){
  const router=useRouter(),pathname=usePathname();
  const dirty=useRef(false);
  const markDirty=useCallback(value=>{dirty.current=value;},[]);
  const current=pathname.split('/')[2]||'overview';
  useEffect(()=>{const key=window.location.hash.slice(1);if(pathname==='/manager'&&navigation.some(([item])=>item===key))router.replace(key==='overview'?'/manager':`/manager/${key}`);},[pathname,router]);
  useEffect(()=>{function warn(event){if(dirty.current)event.preventDefault();}window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[]);
  function navigate(key){if(dirty.current&&!window.confirm('Bỏ các thay đổi chưa lưu?'))return false;dirty.current=false;router.push(key==='overview'?'/manager':`/manager/${key}`);return true;}
  return <DraftContext.Provider value={markDirty}><ManagerShell current={current} onNavigate={navigate}>{children}</ManagerShell></DraftContext.Provider>;
}
const GuardedLayout=withRole(ProtectedLayout,['merchant']);
export default function ManagerLayout({children}){const {isLoading}=useContext(AppContext);return isLoading?<p role="status" className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Đang xác minh phiên merchant…</p>:<GuardedLayout>{children}</GuardedLayout>;}
