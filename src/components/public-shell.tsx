import Link from "next/link";
import { withLang, type Locale } from "@/lib/i18n";
import { LanguageSelect } from "@/components/language-select";
import { getUiTexts, uiText } from "@/lib/ui-text";

type PublicShellProps = {
  locale: Locale;
  currentPath: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

type NavItem = {
  key: string;
  labelKey: string;
  href?: string;
};

const navItems: NavItem[] = [
  { key: "home", labelKey: "nav.home", href: "/" },
  { key: "atributos", labelKey: "nav.attributes", href: "/atributos" },
  { key: "race", labelKey: "nav.race", href: "/racas" },
  { key: "class", labelKey: "nav.class" },
  { key: "kit", labelKey: "nav.kit" },
  { key: "traits", labelKey: "nav.traits" },
  { key: "nwp", labelKey: "nav.nwp" },
  { key: "wp", labelKey: "nav.wp" },
  { key: "equips", labelKey: "nav.equips" },
  { key: "spells", labelKey: "nav.spells" },
];

const navFallbackLabel: Record<string, string> = {
  home: "Home",
  atributos: "Attributes",
  race: "Race",
  class: "Class",
  kit: "Kit",
  traits: "Traits",
  nwp: "Non Weapon Proficiency",
  wp: "Weapon Proficiency",
  equips: "Equipment",
  spells: "Spells",
};

export async function PublicShell({ locale, currentPath, title, description, children }: PublicShellProps) {
  const isEn = locale === "en";
  const uiTexts = await getUiTexts(["public-shell"], locale);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6">
      <header className="rounded-xl border border-[var(--graphite)] bg-[var(--black-elevated)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--white-muted)]">{uiText(uiTexts, "public-shell", "badge", isEn ? "Public Guide" : "Guia Público")}</p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--gold-bright)]">{title}</h1>
            {description ? <p className="mt-2 max-w-4xl text-sm text-[var(--white-secondary)]">{description}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={withLang("/admin/spell-import", locale)}
              className="rounded-md border border-[var(--graphite)] px-3 py-1.5 text-xs font-semibold text-[var(--white-primary)] hover:bg-[var(--hover-gold-bg)] hover:border-[var(--hover-gold-border)]"
            >
              {uiText(uiTexts, "public-shell", "admin", "Admin")}
            </Link>
            <LanguageSelect locale={locale} currentPath={currentPath} />
          </div>
        </div>
      </header>

      <div className="mt-4 grid gap-4 md:grid-cols-[260px_1fr]">
        <aside className="rounded-xl border border-[var(--graphite)] bg-[var(--black-elevated)] p-4 shadow-[var(--shadow-soft)]">
          <p className="text-xs uppercase tracking-widest text-[var(--white-muted)]">{uiText(uiTexts, "public-shell", "sections", isEn ? "Sections" : "Seções")}</p>
          <nav className="mt-3 space-y-1">
            {navItems.map((item) => {
              const fallbackLabel = navFallbackLabel[item.key] ?? item.key;
              const label = uiText(uiTexts, "public-shell", item.labelKey, fallbackLabel);
              const active = item.href ? currentPath === item.href || (item.href === "/atributos" && currentPath.startsWith("/atributos")) : false;

              if (!item.href) {
                return (
                  <div key={item.key} className="rounded-md border border-[var(--graphite)] px-3 py-2 text-sm text-[var(--white-muted)]">
                    {label}
                  </div>
                );
              }

              return (
                <Link
                  key={item.key}
                  href={withLang(item.href, locale)}
                  className={`block rounded-md border px-3 py-2 text-sm ${
                    active
                      ? "border-[var(--gold-primary)] bg-[var(--hover-gold-bg)] text-[var(--gold-bright)]"
                      : "border-[var(--graphite)] text-[var(--white-secondary)] hover:bg-[var(--hover-gold-bg)] hover:border-[var(--hover-gold-border)]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="rounded-xl border border-[var(--graphite)] bg-[var(--black-elevated)] p-6 shadow-[var(--shadow-soft)]">{children}</section>
      </div>
    </main>
  );
}
