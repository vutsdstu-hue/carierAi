import { getAuthToken } from "./authStorage";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const isFormDataBody = typeof FormData !== "undefined" && options?.body instanceof FormData;
  let apiBase = (import.meta as any).env?.VITE_API_BASE_URL ? String((import.meta as any).env.VITE_API_BASE_URL) : "";
  if (!apiBase && typeof window !== "undefined") {
    // Fallback for GitHub Pages if Actions vars weren't injected into the build
    if (window.location.hostname.endsWith("github.io")) {
      apiBase = "https://carierai.onrender.com/api";
    }
  }

  const headers: Record<string, string> = {
    ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
    ...(options?.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const normalizedBase = apiBase.replace(/\/$/, "");
  const normalizedPath = (path.startsWith("/") ? path : `/${path}`).replace(/\/+$/, "");
  const pathWithoutDuplicateApi =
    normalizedBase.endsWith("/api") && normalizedPath.startsWith("/api/")
      ? normalizedPath.replace(/^\/api/, "")
      : normalizedPath;
  const url = normalizedBase ? `${normalizedBase}${pathWithoutDuplicateApi || "/"}` : path;
  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const messageBase = data?.message ?? `Request failed with ${res.status}`;
    const more =
      data?.errors && typeof data.errors === "object"
        ? `: ${JSON.stringify(data.errors)}`
        : data?.errors && typeof data.errors !== "object"
          ? `: ${String(data.errors)}`
          : "";
    throw new Error(`${messageBase}${more}`);
  }

  return data as T;
}

