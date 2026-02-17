"use client";

import { useState, useEffect } from "react";
import { getSessionId } from "@/lib/session";

/**
 * Hook that safely returns the sessionId only on the client.
 * Returns "" during SSR and hydration, then updates to the real ID.
 * This prevents hydration mismatches from localStorage access.
 */
const useSessionId = (): string => {
    const [sessionId, setSessionId] = useState("");

    useEffect(() => {
        setSessionId(getSessionId());
    }, []);

    return sessionId;
};

export default useSessionId;
