import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-client";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status < 500) && failureCount < 2,
      },
      mutations: { retry: 0 },
    },
  });
