import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PlaceCard from "@/modules/Traffic/components/PlaceCard";
import { useMapStore } from "@/modules/Traffic/store/map.store";

import { BARDO, json, mockApi, renderWithClient, resetStore } from "../helpers";

describe("PlaceCard", () => {
  beforeEach(() => {
    resetStore();
    useMapStore.setState({ selectedPlace: BARDO });
  });

  it("saves the selected place", async () => {
    mockApi({
      "GET /api/favorites": () => json([]),
      "POST /api/favorites": (body) =>
        json({ id: "f1", address: null, createdAt: "2026-10-26T10:00:00Z", ...(body as object) }, 201),
    });
    const user = userEvent.setup();
    renderWithClient(<PlaceCard />);

    await user.click(screen.getByRole("button", { name: "Save place" }));
    expect(await screen.findByText("Saved")).toBeInTheDocument();
  });

  it("explains a duplicate instead of failing silently", async () => {
    mockApi({
      "GET /api/favorites": () => json([]),
      "POST /api/favorites": () => json({ message: "This place is already in your favorites" }, 409),
    });
    const user = userEvent.setup();
    renderWithClient(<PlaceCard />);

    await user.click(screen.getByRole("button", { name: "Save place" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("This place is already saved.");
  });

  it("opens the trip planner with this place as destination", async () => {
    mockApi({ "GET /api/favorites": () => json([]) });
    const user = userEvent.setup();
    renderWithClient(<PlaceCard />);

    await user.click(screen.getByRole("button", { name: "Plan a trip here" }));
    expect(useMapStore.getState()).toMatchObject({
      destination: BARDO,
      activeTab: "trip",
      isPanelOpen: true,
    });
  });

  it("can be closed", async () => {
    mockApi({ "GET /api/favorites": () => json([]) });
    const user = userEvent.setup();
    renderWithClient(<PlaceCard />);

    await user.click(screen.getByRole("button", { name: "Close place details" }));
    expect(useMapStore.getState().selectedPlace).toBeNull();
  });
});
