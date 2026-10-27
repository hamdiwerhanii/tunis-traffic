import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SavedPlaces from "@/modules/Traffic/components/SavedPlaces";
import { useMapStore } from "@/modules/Traffic/store/map.store";

import { json, mockApi, noContent, renderWithClient, resetStore } from "../helpers";

const FAVORITE = {
  id: "f1",
  name: "Bardo Museum",
  address: "Le Bardo, Tunis",
  lat: 36.8094,
  lng: 10.1342,
  createdAt: "2026-10-26T10:00:00Z",
};

describe("SavedPlaces", () => {
  beforeEach(resetStore);

  it("shows a helpful empty state", async () => {
    mockApi({ "GET /api/favorites": () => json([]) });
    renderWithClient(<SavedPlaces />);
    expect(await screen.findByText(/No saved places yet/)).toBeInTheDocument();
  });

  it("opens a saved place on the map", async () => {
    mockApi({ "GET /api/favorites": () => json([FAVORITE]) });
    const user = userEvent.setup();
    renderWithClient(<SavedPlaces />);

    await user.click(await screen.findByRole("button", { name: /^Bardo Museum/ }));
    expect(useMapStore.getState().selectedPlace).toMatchObject({ name: "Bardo Museum" });
  });

  it("removes a place with a clearly labelled button", async () => {
    let deleted = false;
    mockApi({
      "GET /api/favorites": () => json(deleted ? [] : [FAVORITE]),
      "DELETE /api/favorites/f1": () => {
        deleted = true;
        return noContent();
      },
    });
    const user = userEvent.setup();
    renderWithClient(<SavedPlaces />);

    await user.click(
      await screen.findByRole("button", { name: "Remove Bardo Museum from saved places" }),
    );
    await waitFor(() => expect(screen.getByText(/No saved places yet/)).toBeInTheDocument());
    expect(deleted).toBe(true);
  });

  it("offers a retry when loading fails", async () => {
    mockApi({ "GET /api/favorites": () => json({ message: "boom" }, 500) });
    renderWithClient(<SavedPlaces />);
    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
