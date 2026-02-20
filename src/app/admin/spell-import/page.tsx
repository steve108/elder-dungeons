"use client";

import * as Label from "@radix-ui/react-label";
import Image from "next/image";
import { useMemo, useState } from "react";

import { SpellPreview } from "@/components/spell-preview";
import { getAdminAuthHeader } from "@/lib/admin-client";
import type { SpellPayload } from "@/lib/spell";

function BusyIndicator({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/40 bg-zinc-900/70 px-3 py-2 text-xs text-amber-200">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-300/40 border-t-amber-300" />
      <span>{label}</span>
    </div>
  );
}

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

function normalizeOptionalUrl(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    const url = new URL(trimmed);
    return url.toString();
  } catch {
    return undefined;
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

export default function SpellImportPage() {
  const [spellText, setSpellText] = useState("");
  const [sourceImageUrl, setSourceImageUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [parsedSpell, setParsedSpell] = useState<SpellPayload | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegeneratingIcon, setIsRegeneratingIcon] = useState(false);
  const [isDragOverImageArea, setIsDragOverImageArea] = useState(false);
  const isBusy = isParsing || isSaving || isRegeneratingIcon;

  const canParse = useMemo(() => spellText.trim().length > 0 || Boolean(imageDataUrl), [spellText, imageDataUrl]);

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : null;
        if (!result) {
          reject(new Error("Não foi possível ler a imagem."));
          return;
        }

        resolve(result);
      };

      reader.onerror = () => reject(new Error("Erro ao carregar imagem."));
      reader.readAsDataURL(file);
    });
  }

  async function applyImageFile(file: File, source: "upload" | "clipboard" | "dragdrop") {
    if (!file.type.startsWith("image/")) {
      setStatus("Arquivo inválido. Envie uma imagem.");
      return;
    }

    try {
      const result = await readFileAsDataUrl(file);
      setImageDataUrl(result);
      setImageName(file.name || "imagem-sem-nome");

      if (source === "clipboard") {
        setStatus("Imagem da área de transferência carregada.");
      }

      if (source === "dragdrop") {
        setStatus("Imagem arrastada e carregada com sucesso.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado ao carregar imagem.");
    }
  }

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setImageDataUrl(null);
      setImageName("");
      return;
    }

    await applyImageFile(file, "upload");
  }

  async function onPasteImage(event: React.ClipboardEvent<HTMLDivElement>) {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;

    event.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    await applyImageFile(file, "clipboard");
  }

  function onDragOverImage(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOverImageArea(true);
  }

  function onDragLeaveImage(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOverImageArea(false);
  }

  async function onDropImage(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOverImageArea(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await applyImageFile(file, "dragdrop");
  }

  async function parseSpell() {
    if (!canParse) {
      setStatus("Forneça texto ou imagem para fazer o parse.");
      return;
    }

    setIsParsing(true);
    setStatus("Processando spell...");

    try {
      const normalizedSourceUrl = normalizeOptionalUrl(sourceImageUrl);
      const hasInvalidSourceUrl = sourceImageUrl.trim().length > 0 && !normalizedSourceUrl;

      if (hasInvalidSourceUrl) {
        setStatus("URL da imagem inválida; o parse será feito sem URL de origem.");
      }

      const response = await fetch("/api/spell-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: spellText.length > 0 ? spellText : undefined,
          imageDataUrl,
          sourceImageUrl: normalizedSourceUrl,
        }),
      });

      const data = await parseJsonResponse<{ spell?: SpellPayload } & ApiError>(response);
      if (!response.ok || !data.spell) {
        throw new Error(formatApiError(data, "Falha ao processar spell"));
      }

      setParsedSpell(data.spell);
      if (data.spell.iconUrl) {
        setStatus("Spell analisada com sucesso e ícone gerado.");
      } else {
        setStatus("Spell analisada com sucesso. Ícone não foi gerado automaticamente; use 'Regenerar Ícone'.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado no parse");
    } finally {
      setIsParsing(false);
    }
  }

  async function saveSpell() {
    if (!parsedSpell) {
      setStatus("Faça o parse antes de salvar.");
      return;
    }

    setIsSaving(true);
    setStatus("Salvando spell...");

    try {
      const authHeader = getAdminAuthHeader();

      if (!authHeader) {
        throw new Error("Sessão admin inválida. Faça login novamente.");
      }

      const response = await fetch("/api/spell-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(parsedSpell),
      });

      const data = (await response.json()) as { id?: number } & ApiError;
      if (!response.ok || !data.id) {
        throw new Error(formatApiError(data, "Falha ao salvar spell"));
      }

      setSpellText("");
      setSourceImageUrl("");
      setImageDataUrl(null);
      setImageName("");
      setParsedSpell(null);
      setFileInputKey((prev) => prev + 1);
      setStatus(`Spell salva com sucesso. ID: ${data.id}. Formulário resetado.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado ao salvar");
    } finally {
      setIsSaving(false);
    }
  }

  async function regenerateSpellIcon() {
    if (!parsedSpell) {
      setStatus("Faça o parse antes de regenerar o ícone.");
      return;
    }

    setIsRegeneratingIcon(true);
    setStatus("Regenerando ícone da spell...");

    try {
      const authHeader = getAdminAuthHeader();

      if (!authHeader) {
        throw new Error("Sessão admin inválida. Faça login novamente.");
      }

      const response = await fetch("/api/spell-icon-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(parsedSpell),
      });

      const data = await parseJsonResponse<{ iconUrl?: string; iconPrompt?: string } & ApiError>(response);

      if (!response.ok || !data.iconUrl || !data.iconPrompt) {
        throw new Error(formatApiError(data, "Falha ao regenerar ícone"));
      }

      setParsedSpell((prev) =>
        prev
          ? {
              ...prev,
              iconUrl: data.iconUrl,
              iconPrompt: data.iconPrompt,
            }
          : prev,
      );

      setStatus("Ícone regenerado com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado ao regenerar ícone");
    } finally {
      setIsRegeneratingIcon(false);
    }
  }

  return (
    <section className="grid gap-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <h2 className="text-xl font-semibold text-amber-300">Inserir Spell</h2>

      <section className="grid gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="grid gap-2">
          <Label.Root className="text-sm font-medium text-zinc-200" htmlFor="spell-text">
            Texto da Spell
          </Label.Root>
          <textarea
            id="spell-text"
            className="min-h-56 rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-100 outline-none focus:border-amber-300"
            placeholder="Cole aqui o texto bruto da spell AD&D 2e"
            value={spellText}
            onChange={(event) => setSpellText(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label.Root className="text-sm font-medium text-zinc-200" htmlFor="spell-image">
            Upload de Imagem
          </Label.Root>

          <div
            role="button"
            tabIndex={0}
            onPaste={onPasteImage}
            onDragOver={onDragOverImage}
            onDragLeave={onDragLeaveImage}
            onDrop={onDropImage}
            className={[
              "rounded-md border border-dashed p-3 text-sm outline-none",
              isDragOverImageArea
                ? "border-amber-300 bg-zinc-800/70 text-zinc-100"
                : "border-zinc-700 bg-zinc-900/40 text-zinc-300",
            ].join(" ")}
          >
            Arraste e solte uma imagem aqui, ou cole da área de transferência com Ctrl+V.
          </div>

          <input
            key={fileInputKey}
            id="spell-image"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="rounded-md border border-zinc-700 bg-zinc-900 p-2 text-sm text-zinc-100"
          />
          {imageName ? <p className="text-xs text-zinc-300">Imagem carregada: {imageName}</p> : null}
          {imageDataUrl ? (
            <div className="mt-1 w-fit rounded-md border border-zinc-700 bg-zinc-900 p-2">
              <p className="mb-2 text-xs text-zinc-400">Preview da imagem</p>
              <Image
                src={imageDataUrl}
                alt="Preview da imagem da spell"
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 rounded object-cover"
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label.Root className="text-sm font-medium text-zinc-200" htmlFor="source-image-url">
            URL da imagem (opcional para persistir referência)
          </Label.Root>
          <input
            id="source-image-url"
            type="url"
            value={sourceImageUrl}
            onChange={(event) => setSourceImageUrl(event.target.value)}
            placeholder="https://..."
            className="rounded-md border border-zinc-700 bg-zinc-900 p-2 text-sm text-zinc-100 outline-none focus:border-amber-300"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={parseSpell}
            disabled={!canParse || isBusy}
            className="rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isParsing ? "Parsing..." : "Parse Spell"}
          </button>
          {isParsing ? <BusyIndicator label="Analisando spell e gerando imagem..." /> : null}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="text-base font-semibold text-zinc-100">Conferência</h3>
        <p className="text-sm text-zinc-300">Confira os dados extraídos antes de salvar.</p>
        {parsedSpell ? (
          <div className="grid gap-2 text-sm text-zinc-200">
            <p>
              <span className="text-zinc-400">Nome:</span> {parsedSpell.name}
            </p>
            <p>
              <span className="text-zinc-400">Nível:</span> {parsedSpell.level}
            </p>
            <p>
              <span className="text-zinc-400">Class:</span> {parsedSpell.spellClass}
            </p>
            <p>
              <span className="text-zinc-400">Escola:</span> {parsedSpell.school ?? "-"}
            </p>
            <p>
              <span className="text-zinc-400">Esfera:</span> {parsedSpell.sphere ?? "-"}
            </p>
            <p>
              <span className="text-zinc-400">Fonte:</span> {parsedSpell.source ?? "-"}
            </p>
            <p>
              <span className="text-zinc-400">Pode ser dispersada:</span> {parsedSpell.canBeDispelled ? "Sim" : "Não"}
            </p>
            <p>
              <span className="text-zinc-400">Como dispersar:</span> {parsedSpell.dispelHow ?? "-"}
            </p>
            <p>
              <span className="text-zinc-400">Resultado do Save:</span> {parsedSpell.savingThrowOutcome ?? "-"}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Nenhuma spell parseada ainda.</p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={regenerateSpellIcon}
            disabled={!parsedSpell || isBusy}
            className="rounded-md bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRegeneratingIcon ? "Regenerando ícone..." : "Regenerar Ícone"}
          </button>
          {isRegeneratingIcon ? <BusyIndicator label="Gerando e enviando ícone para o bucket..." /> : null}
          <button
            type="button"
            onClick={saveSpell}
            disabled={!parsedSpell || isBusy}
            className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Salvando..." : "Save Spell"}
          </button>
        </div>
      </section>

      {parsedSpell ? <SpellPreview value={parsedSpell} /> : null}
      {status ? <p className="text-sm text-zinc-200">{status}</p> : null}
    </section>
  );
}
