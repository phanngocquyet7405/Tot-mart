"use client";
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/app/context/AppContext';
export default function ClientLayout({ children }) {
  const { user, isLoading } = useContext(AppContext);
  const router = useRouter();
  useEffect(() => { if (!isLoading && user?.role === 'merchant') router.replace('/manager'); }, [user, isLoading, router]);
  if (isLoading || user?.role === 'merchant') return null;
  return children;
}
