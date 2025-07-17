"use client";

import { usePathname, useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const languages = [
  { code: "en", labelKey: "lang.en" },
  { code: "zh-CN", labelKey: "lang.zh_CN" },  
  { code: "zh-TW", labelKey: "lang.zh_TW" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <select
      onChange={handleChange}
      defaultValue={pathname.split("/")[1]}
      className={buttonVariants({ variant: "outline", size: "sm" }) + " min-w-[110px] px-2 py-1 ml-2"}
      style={{ minWidth: 110 }}
      aria-label={t('switch_language')}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {t(lang.labelKey)}
        </option>
      ))}
    </select>
  );
} 