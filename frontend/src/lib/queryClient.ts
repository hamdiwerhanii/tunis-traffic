import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
            retry: 1,
            retryDelay: (attemptIndex) =>
                Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            retry: 0,
        },
    },
});
