"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import CountryFlag from "react-country-flag";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

const languages = [
  { code: "en", labelKey: "lang.en", country: "US" },
  { code: "ja", labelKey: "lang.ja", country: "JP" },
  { code: "ko", labelKey: "lang.ko", country: "KR" },
  { code: "fr", labelKey: "lang.fr", country: "FR" },
  { code: "de", labelKey: "lang.de", country: "DE" },
  { code: "es", labelKey: "lang.es", country: "ES" },
  { code: "pt", labelKey: "lang.pt", country: "PT" },
  { code: "ru", labelKey: "lang.ru", country: "RU" },
  // { code: "ar", labelKey: "lang.ar", country: "SA" },
  { code: "it", labelKey: "lang.it", country: "IT" },
];

export default function LanguageSwitcher({ fullWidth = false }: { fullWidth?: boolean }) {
  const pathname = usePathname();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const selected = pathname.split("/")[1];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const localizedHref = (code: string) => {
    const segments = pathname.split("/");
    segments[1] = code;
    return segments.join("/");
  };

  const handleSelect = () => {
    setOpen(false);
  };

  const currentLang = languages.find((l) => l.code === selected) || languages[0];

  return (
    <div ref={ref} className={cn("relative", fullWidth ? "w-full" : "ml-2 shrink-0")}>
      <button
        type="button"
        className={cn(
          "flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          fullWidth ? "h-11 w-full" : "h-10 min-w-[118px]",
        )}
        aria-label={t('switch_language')}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex min-w-0 items-center">
          <CountryFlag countryCode={currentLang.country} svg style={{ width: 18, height: 18, marginRight: 8 }} />
          <span className="inline truncate">{t(currentLang.labelKey)}</span>
        </span>
        <svg className={cn("size-3 shrink-0 transition-transform", open && "rotate-180")} viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z" fill="currentColor" /></svg>
      </button>
        <ul
          className={cn(
            "absolute z-50 mt-2 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10",
            fullWidth ? "left-0 right-0" : "right-0 w-48",
            !open && "hidden",
          )}
        >
          {languages.map((lang) => (
            <li key={lang.code}>
              <Link
                href={localizedHref(lang.code)}
                hrefLang={lang.code}
                lang={lang.code}
                className={cn(
                  "flex min-h-10 items-center rounded-lg px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                  lang.code === selected && "bg-blue-50 font-semibold text-blue-700",
                )}
                onClick={handleSelect}
              >
                <CountryFlag countryCode={lang.country} svg style={{ width: 18, height: 18, marginRight: 8 }} />
                <span className="inline truncate">{t(lang.labelKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
    </div>
  );
}
