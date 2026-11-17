"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CommerceCatalog from '../../components/CommerceCatalog';
function BoxPage() {
  const params = useSearchParams();
  const kind = params.get('type') === 'gift' ? 'gift' : 'combo';
  return <CommerceCatalog key={kind} kind={kind} onlyAvailable={false} />;
}
export default function BoxListing() {
  return <Suspense fallback={<p role="status" className="p-8">Đang tải danh mục…</p>}><BoxPage /></Suspense>;
}
