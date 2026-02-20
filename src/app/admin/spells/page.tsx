"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { getAdminAuthHeader } from "@/lib/admin-client";
import type { SpellListItem } from "@/lib/spell-ui";

type ListResponse = {
  items?: SpellListItem[];
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  error?: string;
};

const PAGE_SIZE = 50;

export default function SpellListPage() {
  const [nameFilter, setNameFilter] = useState("");
  const [spellClassFilter, setSpellClassFilter] = useState<"" | "arcane" | "divine">("");
  const [levelFilter, setLevelFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [items, setItems] = useState<SpellListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [status, setStatus] = useState("Use os filtros e clique em Buscar.");
  const [isLoading, setIsLoading] = useState(false);

  async function onSearch(event?: FormEvent, forcedPage?: number) {
    event?.preventDefault();

    const authHeader = getAdminAuthHeader();
    if (!authHeader) {
      setStatus("Sessão admin inválida. Faça login novamente.");
      return;
    }

    const params = new URLSearchParams();
    const page = forcedPage ?? 1;

    if (nameFilter.trim()) params.set("name", nameFilter.trim());
    if (spellClassFilter) params.set("spellClass", spellClassFilter);
    if (levelFilter.trim()) params.set("level", levelFilter.trim());
    if (groupFilter.trim()) params.set("group", groupFilter.trim());
    params.set("page", String(page));

    setIsLoading(true);
    setStatus("Buscando spells...");

    try {
      const response = await fetch(`/api/spells?${params.toString()}`, {
        headers: {
          Authorization: authHeader,
        },
      });

      const data = (await response.json()) as ListResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao listar spells");
      }

      const nextItems = data.items ?? [];
      const nextPage = data.page ?? page;
      const nextTotalPages = data.totalPages ?? 1;
      const nextTotal = data.total ?? nextItems.length;

      setItems(nextItems);
      setCurrentPage(nextPage);
      setTotalPages(nextTotalPages);
      setTotalItems(nextTotal);
      setStatus(`${nextTotal} registro(s) encontrado(s). Página ${nextPage} de ${nextTotalPages}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado ao listar spells");
    } finally {
      setIsLoading(false);
    }
  }

  async function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || isLoading) return;
    await onSearch(undefined, nextPage);
  }

  return (
    <section className="grid gap-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <h2 className="text-xl font-semibold text-amber-300">Listagem de Spells</h2>

      <form onSubmit={onSearch} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 md:grid-cols-5">
        <label className="grid gap-1 text-sm text-zinc-200 md:col-span-2">
          Nome
          <input
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-300"
            placeholder="Ex: Magic Missile"
          />
        </label>

        <label className="grid gap-1 text-sm text-zinc-200">
          Class
          <select
            value={spellClassFilter}
            onChange={(event) =>
              setSpellClassFilter(
                event.target.value === "arcane" || event.target.value === "divine" ? event.target.value : "",
              )
            }
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-300"
          >
            <option value="">Todos</option>
            <option value="arcane">Arcane</option>
            <option value="divine">Divine</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm text-zinc-200">
          Lvl
          <input
            value={levelFilter}
            onChange={(event) => setLevelFilter(event.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-300"
            placeholder="0-9"
          />
        </label>

        <label className="grid gap-1 text-sm text-zinc-200">
          Esfera ou Escola
          <input
            value={groupFilter}
            onChange={(event) => setGroupFilter(event.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-300"
            placeholder="Ex: Alteration"
          />
        </label>

        <div className="md:col-span-4">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50"
          >
            {isLoading ? "Buscando..." : "Buscar"}
          </button>
          <p className="mt-2 text-xs text-zinc-400">Paginação fixa de {PAGE_SIZE} por página.</p>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[780px] text-sm">
          <thead className="bg-zinc-900 text-zinc-300">
            <tr>
              <th className="px-3 py-2 text-left">Nome</th>
              <th className="px-3 py-2 text-left">Lvl</th>
              <th className="px-3 py-2 text-left">Class</th>
              <th className="px-3 py-2 text-left">Escola</th>
              <th className="px-3 py-2 text-left">Esfera</th>
              <th className="px-3 py-2 text-left">Fonte</th>
              <th className="px-3 py-2 text-left">View</th>
              <th className="px-3 py-2 text-left">Alterar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-800 text-zinc-100">
                <td className="px-3 py-2 font-medium">
                  <Link
                    href={`/admin/spells/${item.id}/view`}
                    className="text-inherit hover:underline"
                    title="Visualizar spell"
                  >
                    {item.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{item.level}</td>
                <td className="px-3 py-2">{item.spellClass}</td>
                <td className="px-3 py-2">{item.school ?? "-"}</td>
                <td className="px-3 py-2">{item.sphere ?? "-"}</td>
                <td className="px-3 py-2">{item.source ?? "-"}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/spells/${item.id}/view`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 text-zinc-200 hover:border-amber-300 hover:text-amber-300"
                    title="Visualizar"
                  >
                    👁
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/spells/${item.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 text-zinc-200 hover:border-amber-300 hover:text-amber-300"
                    title="Editar"
                  >
                    ✎
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-zinc-400">
                  Nenhum registro para exibir.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
        <p className="text-sm text-zinc-300">
          Página {currentPage} de {totalPages} · Total {totalItems}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isLoading || currentPage <= 1}
            onClick={() => void goToPage(currentPage - 1)}
            className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-zinc-100 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={isLoading || currentPage >= totalPages}
            onClick={() => void goToPage(currentPage + 1)}
            className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-zinc-100 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>

      <p className="text-sm text-zinc-300">{status}</p>
    </section>
  );
}
