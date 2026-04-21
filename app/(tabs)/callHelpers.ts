export type SubscriptionTier = "basic" | "premium" | "elite" | string;

export const cleanContact = (contact: string, isUsername: boolean): string => {
  if (isUsername) return contact.trim();

  let phone = contact.replace(/[^\d+]/g, "");
  if (!phone.startsWith("+")) {
    if (/^0\d{7,10}$/.test(phone)) phone = "+234" + phone.substring(1);
  }

  return phone;
};

export const isValidScheduledCallTime = (
  callTime: Date,
  now: Date = new Date(),
  minimumLeadTimeMs: number = 60_000
): boolean => callTime.getTime() > now.getTime() + minimumLeadTimeMs;

export const getDailyDeleteLimitByTier = (tier: SubscriptionTier): number => {
  if (tier === "premium") return 10;
  if (tier === "elite") return Number.POSITIVE_INFINITY;
  return 5;
};

export const isWithinDailyDeleteLimit = (deletesToday: number, tier: SubscriptionTier): boolean =>
  deletesToday < getDailyDeleteLimitByTier(tier);
