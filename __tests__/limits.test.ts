import { getDailyDeleteLimitByTier, isWithinDailyDeleteLimit } from "../app/(tabs)/callHelpers";

describe("daily delete limits by tier", () => {
  it("uses a limit of 5 for basic", () => {
    expect(getDailyDeleteLimitByTier("basic")).toBe(5);
    expect(isWithinDailyDeleteLimit(4, "basic")).toBe(true);
    expect(isWithinDailyDeleteLimit(5, "basic")).toBe(false);
  });

  it("uses a limit of 10 for premium", () => {
    expect(getDailyDeleteLimitByTier("premium")).toBe(10);
    expect(isWithinDailyDeleteLimit(9, "premium")).toBe(true);
    expect(isWithinDailyDeleteLimit(10, "premium")).toBe(false);
  });

  it("uses unlimited deletes for elite", () => {
    expect(getDailyDeleteLimitByTier("elite")).toBe(Number.POSITIVE_INFINITY);
    expect(isWithinDailyDeleteLimit(10_000, "elite")).toBe(true);
  });
});
