"use client";

import Image from "next/image";
import { ArrowUpRight, Sparkles, Gift } from "lucide-react";
import PlanComparison from "./PlanComparison";

export default function PlanCard({ box, onOpenPlan }) {
  const imageUrl = box.images?.[0]?.url || box.image || "/assets/placeholder.png";

  return (
    <article className="tm-commerce tm-commerce--atelier tm-plan-card group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Khung ảnh hộp quà chuẩn Bokksu */}
      <div className="tm-plan-card__image relative aspect-4/3 sm:aspect-16/10 bg-gradient-to-b from-stone-50 via-background to-stone-100/50 dark:from-stone-900 dark:to-stone-950 border-b border-border/60 overflow-hidden">
        <Image
          src={imageUrl}
          alt={box.name || "Hộp đăng ký"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-background/90 backdrop-blur-xs text-primary border border-primary/20 text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs">
          <Sparkles size={11} className="text-amber-500" />
          <span>Hộp định kỳ tuyển chọn</span>
        </div>
      </div>

      {/* Nội dung chi tiết hộp & Bảng so sánh kỳ hạn */}
      <div className="tm-plan-card__body p-6 flex flex-col flex-1 gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
            {box.name || "Hộp quà đăng ký"}
          </h3>
          {(box.descriptions || box.description) && (
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground mt-2 line-clamp-2">
              {box.descriptions || box.description}
            </p>
          )}
        </div>

        <div className="py-1 flex-1">
          <PlanComparison plans={box.apiPlans} />
        </div>

        <button
          type="button"
          className="tm-button tm-button--primary w-full py-3.5 px-5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-auto"
          disabled={!box.apiPlans?.length}
          onClick={() => onOpenPlan(box)}
        >
          <Gift size={16} />
          <span>Chọn gói & địa chỉ</span>
          <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  );
}
