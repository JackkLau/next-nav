"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import CountryFlag from "react-country-flag";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { localizedPathWithQuery } from '@/lib/locale-navigation';

const languages = [
  { code: "en", labelKey: "lang.en", country: "US" },
  { code: "ja", labelKey: "lang.ja", country: "JP" },
  { code: "ko", labelKey: "lang.ko", country: "KR" },
  { code: "fr", labelKey: "lang.fr", country: "FR" },
  { code: "de", labelKey: "lang.de", country: "DE" },
  { code: "es", labelKey: "lang.es", country: "ES" },
  { code: "pt", labelKey: "lang.pt", country: "PT" },
  { code: "ru", labelKey: "lang.ru", country: "RU" },
  { code: "it", labelKey: "lang.it", country: "IT" },
];

export default function LanguageSwitcher({ fullWidth = false }: { fullWidth?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const selected = pathname.split("/")[1];
  const currentLinkRef = useRef<HTMLAnchorElement>(null);
  const currentLang = languages.find((language) => language.code === selected) || languages[0];

  return (
    <div className={cn(fullWidth ? "w-full" : "ml-2 shrink-0")}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              fullWidth ? "h-11 w-full" : "h-10 min-w-[118px]",
            )}
            aria-label={t('switch_language')}
          >
            <span className="flex min-w-0 items-center">
              <CountryFlag countryCode={currentLang.country} svg style={{ width: 18, height: 18, marginRight: 8 }} />
              <span className="inline truncate">{t(currentLang.labelKey)}</span>
            </span>
            <svg className={cn("size-3 shrink-0 transition-transform", open && "rotate-180")} viewBox="0 0 10 6" aria-hidden="true">
              <path d="M0 0l5 6 5-6z" fill="currentColor" />
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className={cn(
            "z-[80] max-h-72 overflow-auto rounded-xl border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10",
            fullWidth ? "w-[var(--radix-popover-trigger-width)]" : "w-48",
          )}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            currentLinkRef.current?.focus();
          }}
        >
          <ul aria-label={t('switch_language')}>
            {languages.map((language) => (
              <li key={language.code}>
                <Link
                  ref={language.code === selected ? currentLinkRef : undefined}
                  href={localizedPathWithQuery(pathname, language.code, searchParams.toString())}
                  hrefLang={language.code}
                  lang={language.code}
                  aria-current={language.code === selected ? 'page' : undefined}
                  className={cn(
                    "flex min-h-10 items-center rounded-lg px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    language.code === selected && "bg-blue-50 font-semibold text-blue-700",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <CountryFlag countryCode={language.country} svg style={{ width: 18, height: 18, marginRight: 8 }} />
                  <span className="inline truncate">{t(language.labelKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
