"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Globe, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocale } from "@/app/actions/setLocale";
import { SUPPORTED_LOCALES, LOCALE_LABELS } from "@/i18n/config";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (nextLocale) => {
    if (nextLocale === locale || isPending) return;
    startTransition(() => {
      setLocale(nextLocale);
    });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          aria-label="Change language"
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#4a7c44] transition-colors uppercase tracking-wide disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Globe className="w-3.5 h-3.5" />
          )}
          {LOCALE_LABELS[locale]?.short ?? locale.toUpperCase()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        {SUPPORTED_LOCALES.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleSelect(code)}
            className={`cursor-pointer ${code === locale ? "font-bold text-[#4a7c44]" : ""}`}
          >
            {LOCALE_LABELS[code]?.full ?? code}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
