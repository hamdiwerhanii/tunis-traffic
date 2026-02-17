"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { FC, ReactNode } from "react";

import { queryClient } from "@/lib/queryClient";

type ProvidersProps = {
    children: ReactNode;
};

const Providers: FC<ProvidersProps> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            {children}
        </QueryClientProvider>
    );
};

export default Providers;
