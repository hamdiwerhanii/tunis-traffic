import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";

import { useMapStore } from "@/modules/Traffic/store/map.store";

type Handler = (body: unknown) => Response | Promise<Response>;

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const noContent = () => new Response(null, { status: 204 });

export const mockApi = (routes: Record<string, Handler>) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = new URL(String(input), "http://localhost");
    const key = `${init?.method ?? "GET"} ${url.pathname}`;
    const handler = routes[key];
    if (!handler) return json({ message: `No mock for ${key}` }, 500);
    return handler(init?.body ? JSON.parse(String(init.body)) : undefined);
  });

export const renderWithClient = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

export const resetStore = () => useMapStore.setState(useMapStore.getInitialState(), true);

export const BARDO = { name: "Bardo Museum", lat: 36.8094, lng: 10.1342 };
