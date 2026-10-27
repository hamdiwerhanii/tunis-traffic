import { screen } from "@testing-library/react";
import axe from "axe-core";

import ControlPanel from "@/modules/Traffic/components/ControlPanel";
import QuickPlaces from "@/modules/Traffic/components/QuickPlaces";
import SearchBox from "@/modules/Traffic/components/SearchBox";
import { useMapStore } from "@/modules/Traffic/store/map.store";

import { BARDO, json, mockApi, renderWithClient, resetStore } from "../helpers";

const audit = async (container: HTMLElement) => {
  const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  return results.violations.map((violation) => `${violation.id}: ${violation.help}`);
};

describe("accessibility", () => {
  beforeEach(() => {
    resetStore();
    mockApi({
      "GET /api/favorites": () => json([]),
      "GET /api/search-history": () => json([]),
      "GET /api/traffic/status": () => json({ liveTraffic: false }),
    });
  });

  it("search and quick places have no axe violations", async () => {
    const { container } = renderWithClient(
      <>
        <SearchBox />
        <QuickPlaces />
      </>,
    );
    expect(await audit(container)).toEqual([]);
  });

  it.each(["trip", "saved", "recent"] as const)("the %s tab has no axe violations", async (tab) => {
    useMapStore.setState({ activeTab: tab, isPanelOpen: true, selectedPlace: BARDO });
    const { container } = renderWithClient(<ControlPanel />);
    await screen.findAllByRole("tab");
    expect(await audit(container)).toEqual([]);
  });
});
