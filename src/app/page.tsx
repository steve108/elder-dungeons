import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4">
      <section className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
        <h1 className="text-3xl font-semibold text-amber-300">Elder Dungeons</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-300">
          Painel administrativo para inserção, conferência, listagem e alteração de spells.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/admin/spell-import"
            className="rounded-md bg-amber-300 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
          >
            Entrar no Admin
          </Link>
        </div>
      </section>
    </main>
  );
}
