import { getTypicalTraffic } from "@/modules/Traffic/utils/traffic-level";

describe("getTypicalTraffic (Tunis time, UTC+1)", () => {
  it("reports heavy traffic during the weekday morning rush", () => {
    expect(getTypicalTraffic(new Date("2026-10-26T07:00:00Z"))).toMatchObject({
      level: "heavy",
      isPeak: true,
      peakLabel: "Morning rush",
      peakEnd: "09:00",
    });
  });

  it("reports moderate traffic just before a rush", () => {
    expect(getTypicalTraffic(new Date("2026-10-26T06:15:00Z")).level).toBe("medium");
  });

  it("reports light traffic at midday and announces the evening rush", () => {
    expect(getTypicalTraffic(new Date("2026-10-26T11:00:00Z"))).toMatchObject({
      level: "low",
      isPeak: false,
      nextPeak: "Evening rush starts at 16:30",
    });
  });

  it("points to Monday after the Friday evening rush", () => {
    expect(getTypicalTraffic(new Date("2026-10-30T19:00:00Z")).nextPeak).toBe(
      "Next rush hour: Monday at 07:30",
    );
  });

  it("treats weekends as light traffic, even at rush hour", () => {
    expect(getTypicalTraffic(new Date("2026-10-31T07:00:00Z"))).toMatchObject({
      level: "low",
      isPeak: false,
    });
  });
});
