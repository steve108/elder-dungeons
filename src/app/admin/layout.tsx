import { ReactNode } from "react";

import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8">
      <AdminAuthGuard>
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-amber-300">Elder Dungeons Admin</h1>
          <p className="mt-1 text-sm text-zinc-300">Gerencie importação, listagem e edição de spells.</p>
        </header>
        <AdminNav />
        {children}
      </AdminAuthGuard>
    </main>
  );
}
