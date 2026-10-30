"use client";
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import PlanComparison from './PlanComparison';
export default function PlanCard({ box, onOpenPlan }) {
  return <article className="tm-commerce tm-commerce--atelier tm-plan-card">
    <div className="tm-plan-card__image"><Image src={box.images?.[0]?.url || box.image || '/assets/placeholder.png'} alt={box.name || 'Hộp đăng ký'} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain p-4" /></div>
    <div className="tm-plan-card__body">
      <h3 className="font-serif text-2xl font-bold leading-snug">{box.name || 'Hộp đăng ký'}</h3>
      {(box.descriptions || box.description) && <p className="text-sm leading-relaxed text-muted-foreground">{box.descriptions || box.description}</p>}
      <PlanComparison plans={box.apiPlans} />
      <button type="button" className="tm-button tm-button--primary mt-auto w-full" disabled={!box.apiPlans?.length} onClick={() => onOpenPlan(box)}>Chọn gói & địa chỉ<ArrowUpRight size={18} /></button>
    </div>
  </article>;
}
