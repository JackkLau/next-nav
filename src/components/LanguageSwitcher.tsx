"use client";

import { usePathname, useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import CountryFlag from "react-country-flag";
import { useState, useRef, useEffect } from "react";

const languages = [
  { code: "en", labelKey: "lang.en", country: "US" },
  { code: "zh-CN", labelKey: "lang.zh_cn", country: "CN" },
  { code: "zh-TW", labelKey: "lang.zh_tw", country: "TW" },
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

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(pathname.split("/")[1]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setOpen(false);
    setSelected(code);
    const segments = pathname.split("/");
    segments[1] = code;
    router.push(segments.join("/"));
  };

  const currentLang = languages.find((l) => l.code === selected) || languages[0];

  return (
    <div ref={ref} className="relative inline-block min-w-[110px] ml-2">
      <button
        type="button"
        className={buttonVariants({ variant: "outline", size: "sm" }) + " min-w-[110px] px-2 py-1 flex items-center justify-between"}
        aria-label={t('switch_language')}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center">
          <CountryFlag countryCode={currentLang.country} svg style={{ width: 18, height: 18, marginRight: 6 }} />
          <span className="inline truncate">{t(currentLang.labelKey)}</span>
        </span>
        <svg className="ml-2 w-3 h-3" viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z" fill="currentColor" /></svg>
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-hidden">
          {languages.map((lang) => (
            <li
              key={lang.code}
              className={
                "flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100" +
                (lang.code === selected ? " font-bold bg-gray-50" : "")
              }
              onClick={() => handleSelect(lang.code)}
            >
              <CountryFlag countryCode={lang.country} svg style={{ width: 18, height: 18, marginRight: 6 }} />
              <span className="inline truncate">{t(lang.labelKey)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 