import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SearchBox from "@/modules/Traffic/components/SearchBox";
import { useMapStore } from "@/modules/Traffic/store/map.store";

import { json, mockApi, renderWithClient, resetStore } from "../helpers";

const RESULTS = [
  { id: "1", name: "Bardo National Museum", address: "Bardo, Tunis, Tunisia", lat: 36.8094, lng: 10.1342 },
  { id: "2", name: "Le Bardo", address: "Le Bardo, Tunis, Tunisia", lat: 36.8091, lng: 10.1403 },
];

describe("SearchBox", () => {
  beforeEach(resetStore);

  it("lets the keyboard pick a place, then centers the map and records the search", async () => {
    const recorded: unknown[] = [];
    mockApi({
      "GET /api/places": () => json(RESULTS),
      "GET /api/search-history": () => json([]),
      "POST /api/search-history": (body) => {
        recorded.push(body);
        return json({ id: "h1" }, 201);
      },
    });
    const user = userEvent.setup();
    renderWithClient(<SearchBox />);

    const input = screen.getByRole("combobox", { name: /search a street or place/i });
    await user.type(input, "Bardo");
    expect(await screen.findByRole("option", { name: /Bardo National Museum/ })).toBeInTheDocument();

    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("option", { name: /Le Bardo/ })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Enter}");

    expect(useMapStore.getState().selectedPlace).toMatchObject({ name: "Le Bardo" });
    expect(input).toHaveValue("Le Bardo");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(recorded).toEqual([{ query: "Bardo", placeName: "Le Bardo", lat: 36.8091, lng: 10.1403 }]),
    );
  });

  it("says when nothing is found", async () => {
    mockApi({ "GET /api/places": () => json([]), "GET /api/search-history": () => json([]) });
    const user = userEvent.setup();
    renderWithClient(<SearchBox />);

    await user.type(screen.getByRole("combobox"), "zzzz");
    expect(await screen.findByText(/No place found in Tunisia for "zzzz"/)).toBeInTheDocument();
  });

  it("explains when the search service is down", async () => {
    mockApi({
      "GET /api/places": () => json({ message: "Place search is unavailable" }, 503),
      "GET /api/search-history": () => json([]),
    });
    const user = userEvent.setup();
    renderWithClient(<SearchBox />);

    await user.type(screen.getByRole("combobox"), "Carthage");
    expect(await screen.findByText(/Search is unavailable right now/)).toBeInTheDocument();
  });

  it("does not search for a single letter", async () => {
    const fetchSpy = mockApi({ "GET /api/search-history": () => json([]) });
    const user = userEvent.setup();
    renderWithClient(<SearchBox />);

    await user.type(screen.getByRole("combobox"), "B");
    await new Promise((resolve) => setTimeout(resolve, 450));
    expect(fetchSpy.mock.calls.some(([url]) => String(url).includes("/places"))).toBe(false);
  });
});
