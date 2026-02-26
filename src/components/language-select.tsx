"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { withLang, type Locale } from "@/lib/i18n";

type LanguageSelectProps = {
  locale: Locale;
  currentPath: string;
};

export function LanguageSelect({ locale, currentPath }: LanguageSelectProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const active = locale === "en" ? "en" : "pt";

  function applyLocale(next: Locale) {
    setOpen(false);
    router.push(withLang(currentPath, next));
  }

  function FlagPair({ lang }: { lang: Locale }) {
    const flags =
      lang === "en"
        ? ["/flags/gb.svg", "/flags/us.svg"]
        : ["/flags/br.svg", "/flags/pt.svg"];

    return (
      <span className="flex items-center gap-1">
        <img src={flags[0]} alt="" className="h-3.5 w-5 rounded-sm border border-[var(--border-default)]" />
        <img src={flags[1]} alt="" className="h-3.5 w-5 rounded-sm border border-[var(--border-default)]" />
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-1 hover:bg-[var(--hover-gold-bg)] hover:border-[var(--hover-gold-border)]"
        aria-label="Language selector"
        aria-expanded={open}
      >
        <FlagPair lang={active} />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] p-1 shadow-[var(--shadow-soft)]">
          <button
            type="button"
            onClick={() => applyLocale("pt")}
            className={`flex w-full items-center justify-center rounded px-2 py-1 ${active === "pt" ? "bg-[var(--hover-gold-bg)]" : "hover:bg-[var(--hover-gold-bg)]"}`}
            aria-label="Português"
          >
            <FlagPair lang="pt" />
          </button>
          <button
            type="button"
            onClick={() => applyLocale("en")}
            className={`mt-1 flex w-full items-center justify-center rounded px-2 py-1 ${active === "en" ? "bg-[var(--hover-gold-bg)]" : "hover:bg-[var(--hover-gold-bg)]"}`}
            aria-label="English"
          >
            <FlagPair lang="en" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
