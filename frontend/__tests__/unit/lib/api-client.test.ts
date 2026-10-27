import { apiClient, ApiError } from "@/lib/api-client";

import { json, noContent } from "../helpers";

describe("apiClient", () => {
  it("calls the same-origin /api proxy and returns JSON", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(json([{ id: "1" }]));

    await expect(apiClient.get("/favorites")).resolves.toEqual([{ id: "1" }]);
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/favorites",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("sends JSON bodies", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ id: "1" }, 201));

    await apiClient.post("/favorites", { name: "Bardo" });
    const [, init] = fetchSpy.mock.calls[0];
    expect(init).toMatchObject({ method: "POST", body: '{"name":"Bardo"}' });
    expect(init?.headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("turns validation errors into a readable ApiError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      json({ message: ["name should not be empty", "lat must be inside Tunisia"] }, 400),
    );

    const error = await apiClient.post("/favorites", {}).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      message: "name should not be empty. lat must be inside Tunisia",
    });
  });

  it("handles empty 204 responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(noContent());
    await expect(apiClient.delete("/search-history")).resolves.toBeUndefined();
  });

  it("falls back to a generic message when the body is not JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("Bad gateway", { status: 502 }));
    await expect(apiClient.get("/places?q=x")).rejects.toThrow("Request failed (502)");
  });
});
