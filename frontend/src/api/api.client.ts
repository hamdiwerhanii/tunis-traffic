// Simplified API client for Tunis Traffic (no auth needed)

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

class ApiClient {
    private baseURL: string;

    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    }

    private async request<T>(
        method: RequestMethod,
        path: string,
        body?: unknown
    ): Promise<T> {
        const url = `${this.baseURL}${path}`;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        const config: RequestInit = {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
                error.message || `Request failed with status ${response.status}`
            );
        }

        // Handle empty responses (204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    async get<T>(path: string): Promise<T> {
        return this.request<T>("GET", path);
    }

    async post<T>(path: string, body?: unknown): Promise<T> {
        return this.request<T>("POST", path, body);
    }

    async patch<T>(path: string, body?: unknown): Promise<T> {
        return this.request<T>("PATCH", path, body);
    }

    async delete<T>(path: string): Promise<T> {
        return this.request<T>("DELETE", path);
    }
}

export const apiClient = new ApiClient();
