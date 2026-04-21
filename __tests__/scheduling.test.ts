import { cleanContact, isValidScheduledCallTime } from "../app/(tabs)/callHelpers";

describe("isValidScheduledCallTime", () => {
  const now = new Date("2026-04-21T10:00:00.000Z");

  it("rejects past datetimes", () => {
    const past = new Date("2026-04-21T09:59:00.000Z");
    expect(isValidScheduledCallTime(past, now)).toBe(false);
  });

  it("rejects near-now datetimes within one minute", () => {
    const nearNow = new Date("2026-04-21T10:00:30.000Z");
    expect(isValidScheduledCallTime(nearNow, now)).toBe(false);
  });

  it("accepts a valid future datetime beyond one minute", () => {
    const validFuture = new Date("2026-04-21T10:01:01.000Z");
    expect(isValidScheduledCallTime(validFuture, now)).toBe(true);
  });
});

describe("cleanContact", () => {
  it("normalizes phone input by stripping separators and converting local leading 0 to +234", () => {
    expect(cleanContact("0803-123-4567", false)).toBe("+2348031234567");
  });

  it("preserves international phone input with leading +", () => {
    expect(cleanContact("+1 (415) 555-2671", false)).toBe("+14155552671");
  });

  it("trims username input instead of phone-normalizing it", () => {
    expect(cleanContact("   @john_doe   ", true)).toBe("@john_doe");
  });
});
