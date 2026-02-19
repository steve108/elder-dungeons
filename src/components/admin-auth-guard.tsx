"use client";

import { FormEvent, ReactNode, useEffect, useState, useSyncExternalStore } from "react";

import { ADMIN_BASIC_KEY, ADMIN_SESSION_KEY, buildAdminBasicHeader, isValidAdminLogin } from "@/lib/admin-auth";

type AdminAuthGuardProps = {
  children: ReactNode;
};

function getAdminAuthSnapshot(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const saved = window.localStorage.getItem(ADMIN_SESSION_KEY);
  const basic = window.localStorage.getItem(ADMIN_BASIC_KEY);
  return saved === "1" && Boolean(basic);
}

function subscribeAdminAuth(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("admin-auth-change", handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("admin-auth-change", handler);
  };
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const isAuthenticated = useSyncExternalStore(
    subscribeAdminAuth,
    getAdminAuthSnapshot,
    () => false,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidAdminLogin(username, password)) {
      setError("Usuário ou senha inválidos.");
      return;
    }

    window.localStorage.setItem(ADMIN_SESSION_KEY, "1");
    window.localStorage.setItem(ADMIN_BASIC_KEY, buildAdminBasicHeader(username, password));
    window.dispatchEvent(new Event("admin-auth-change"));
    setError("");
    setPassword("");
  }

  function handleLogout() {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    window.localStorage.removeItem(ADMIN_BASIC_KEY);
    window.dispatchEvent(new Event("admin-auth-change"));
    setUsername("");
    setPassword("");
    setError("");
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col rounded-xl border border-zinc-700 bg-zinc-950 p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-amber-300">Admin</h1>
        <p className="mb-6 text-sm text-zinc-300">Acesse com usuário e senha para continuar.</p>

        <form onSubmit={handleLogin} className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-zinc-200">Usuário</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-300"
              placeholder="Usuário"
              autoComplete="username"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-zinc-200">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-300"
              placeholder="Senha"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            className="rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-100 hover:border-amber-300 hover:text-amber-300"
        >
          Sair
        </button>
      </div>
      {children}
    </div>
  );
}
