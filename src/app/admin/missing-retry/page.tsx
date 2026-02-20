"use client";

import * as Label from "@radix-ui/react-label";
import { useState } from "react";

import { getAdminAuthHeader } from "@/lib/admin-client";

type ApiError = {
  error?: string;
  details?: unknown;
};

function formatApiError(data: ApiError, fallback: string): string {
  const base = data.error ?? fallback;

  if (!data.details) return base;

  try {
    return `${base} · ${JSON.stringify(data.details)}`;
  } catch {
    return base;
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();

  try {
    return JSON.parse(raw) as T;
  } catch {
    const short = raw.slice(0, 120).replace(/\s+/g, " ").trim();
    throw new Error(`Resposta inválida da API (status ${response.status}). ${short || "Sem detalhes."}`);
  }
}

export default function MissingRetryPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(false);
  const [hydrateLimit, setHydrateLimit] = useState(3);
  const [hydrateOrder, setHydrateOrder] = useState<"oldest" | "newest">("oldest");

  async function runHydrationRetryBatch() {
    setIsHydrating(true);
    setStatus("Executando campanha de retry (missing)...");

    try {
      const authHeader = getAdminAuthHeader();

      if (!authHeader) {
        throw new Error("Sessão admin inválida. Faça login novamente.");
      }

      const response = await fetch("/api/spell-reference-hydrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          limit: hydrateLimit,
          retryMissing: true,
          retryOnlyMissing: true,
          retryOrder: hydrateOrder,
        }),
      });

      const data = await parseJsonResponse<
        {
          processed?: Array<{ status: "saved" | "not-found" | "skipped" }>;
          error?: string;
        } & ApiError
      >(response);

      if (!response.ok) {
        throw new Error(formatApiError(data, "Falha ao executar campanha de retry"));
      }

      const processed = data.processed ?? [];
      const savedCount = processed.filter((item) => item.status === "saved").length;
      const notFoundCount = processed.filter((item) => item.status === "not-found").length;
      const skippedCount = processed.filter((item) => item.status === "skipped").length;

      setStatus(
        `Campanha finalizada. Processadas: ${processed.length} · Salvas: ${savedCount} · Não encontradas: ${notFoundCount} · Skipped: ${skippedCount}`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado ao executar campanha de retry");
    } finally {
      setIsHydrating(false);
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-100">Retry Missing</h1>
        <p className="text-sm text-zinc-300">
          Reprocessa em lote apenas registros pendentes da fila de missing da spell reference.
        </p>
      </header>

      <section className="grid gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="grid gap-2 sm:max-w-xs">
          <Label.Root className="text-sm font-medium text-zinc-200" htmlFor="hydrate-limit">
            Limite por execução
          </Label.Root>
          <input
            id="hydrate-limit"
            type="number"
            min={1}
            max={10}
            value={hydrateLimit}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isNaN(value)) return;
              setHydrateLimit(Math.min(10, Math.max(1, value)));
            }}
            className="rounded-md border border-zinc-700 bg-zinc-900 p-2 text-sm text-zinc-100 outline-none focus:border-amber-300"
          />
        </div>

        <div className="grid gap-2 sm:max-w-xs">
          <Label.Root className="text-sm font-medium text-zinc-200" htmlFor="hydrate-order">
            Ordem
          </Label.Root>
          <select
            id="hydrate-order"
            value={hydrateOrder}
            onChange={(event) => setHydrateOrder(event.target.value === "newest" ? "newest" : "oldest")}
            className="rounded-md border border-zinc-700 bg-zinc-900 p-2 text-sm text-zinc-100 outline-none focus:border-amber-300"
          >
            <option value="oldest">Mais antigos primeiro</option>
            <option value="newest">Mais recentes primeiro</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runHydrationRetryBatch}
            disabled={isHydrating}
            className="rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isHydrating ? "Executando retry..." : "Rodar Retry Missing"}
          </button>
        </div>
      </section>

      {status ? (
        <p className="rounded-md border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200">{status}</p>
      ) : null}
    </main>
  );
}
