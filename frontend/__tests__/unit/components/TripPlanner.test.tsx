import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TripPlanner from "@/modules/Traffic/components/TripPlanner";
import { useMapStore } from "@/modules/Traffic/store/map.store";

import { BARDO, json, mockApi, renderWithClient, resetStore } from "../helpers";

const ROUTE = {
  provider: "osrm",
  liveTraffic: false,
  distanceKm: 7.9,
  durationMinutes: 9,
  delayMinutes: 0,
  departAt: "2026-10-26T10:00:00Z",
  arriveAt: "2026-10-26T10:09:00Z",
  path: [
    [36.8065, 10.1815],
    [36.8094, 10.1342],
  ],
};

describe("TripPlanner", () => {
  beforeEach(resetStore);

  it("asks for a starting point before planning", async () => {
    mockApi({ "GET /api/favorites": () => json([]) });
    useMapStore.setState({ destination: BARDO });
    const user = userEvent.setup();
    renderWithClient(<TripPlanner />);

    await user.click(screen.getByRole("button", { name: "When should I leave?" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Share your location first");
  });

  it("asks for a destination before planning", async () => {
    mockApi({ "GET /api/favorites": () => json([]) });
    useMapStore.setState({ userLocation: { lat: 36.8065, lng: 10.1815 } });
    const user = userEvent.setup();
    renderWithClient(<TripPlanner />);

    await user.click(screen.getByRole("button", { name: "When should I leave?" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose where you want to go.");
  });

  it("plans a trip to a popular place and shows the result", async () => {
    let requested = "";
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("/api/routes")) {
        requested = url;
        return json(ROUTE);
      }
      return json([]);
    });
    useMapStore.setState({ userLocation: { lat: 36.8065, lng: 10.1815 } });
    const user = userEvent.setup();
    renderWithClient(<TripPlanner />);

    await user.selectOptions(screen.getByLabelText("To"), "Bardo Museum");
    await user.click(screen.getByRole("button", { name: "When should I leave?" }));

    const result = await screen.findByRole("region", { name: "Trip result" });
    expect(result).toHaveTextContent("Now");
    expect(result).toHaveTextContent("9 min");
    expect(result).toHaveTextContent("7.9 km");
    expect(result).toHaveTextContent("Estimate without live traffic");
    expect(requested).toContain("toLat=36.8094");
    expect(requested).not.toContain("arriveAt");
    expect(useMapStore.getState().route).toMatchObject({ distanceKm: 7.9 });
  });
});
