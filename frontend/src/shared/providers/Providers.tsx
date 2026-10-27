"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { createQueryClient } from "@/lib/query-client";

type ProvidersProps = {
  children: ReactNode;
};

const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(createQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default Providers;
