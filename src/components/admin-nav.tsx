"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/spell-import", label: "Inserir Spell" },
  { href: "/admin/spells", label: "Listar Spells" },
  { href: "/admin/missing-retry", label: "Retry Missing" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "rounded-md border px-3 py-2 text-sm font-medium transition",
              isActive
                ? "border-amber-300 bg-amber-300 text-zinc-950"
                : "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-amber-300 hover:text-amber-300",
            ].join(" ")}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
