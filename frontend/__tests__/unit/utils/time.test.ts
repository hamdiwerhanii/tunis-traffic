import { formatDuration, nextArrival, timeAgo } from "@/modules/Traffic/utils/time";

describe("time helpers", () => {
  it.each([
    [9, "9 min"],
    [60, "1 h"],
    [65, "1 h 05 min"],
    [130, "2 h 10 min"],
  ])("formats %i minutes as %s", (minutes, text) => {
    expect(formatDuration(minutes)).toBe(text);
  });

  it("describes how long ago a search happened", () => {
    const now = new Date("2026-10-26T12:00:00Z");
    expect(timeAgo("2026-10-26T11:59:40Z", now)).toBe("Just now");
    expect(timeAgo("2026-10-26T11:45:00Z", now)).toBe("15 min ago");
    expect(timeAgo("2026-10-26T09:00:00Z", now)).toBe("3 h ago");
    expect(timeAgo("2026-10-24T12:00:00Z", now)).toBe("2 d ago");
  });

  it("uses today for a later arrival time and tomorrow for an earlier one", () => {
    const now = new Date(2026, 9, 26, 10, 0);

    const later = nextArrival("11:30", now);
    expect([later.getDate(), later.getHours(), later.getMinutes()]).toEqual([26, 11, 30]);

    const earlier = nextArrival("08:30", now);
    expect([earlier.getDate(), earlier.getHours(), earlier.getMinutes()]).toEqual([27, 8, 30]);
  });
});
