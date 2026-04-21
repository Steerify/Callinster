export type SubscriptionTier = "basic" | "premium" | "elite";

export const PAYPAL_PLAN_IDS: Record<Exclude<SubscriptionTier, "basic">, string | undefined> = {
  premium: process.env.EXPO_PUBLIC_PAYPAL_PREMIUM_PLAN_ID,
  elite: process.env.EXPO_PUBLIC_PAYPAL_ELITE_PLAN_ID,
};

export const PAYPAL_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  environment: process.env.EXPO_PUBLIC_PAYPAL_ENVIRONMENT ?? "sandbox",
  mobileReturnUrl: process.env.EXPO_PUBLIC_PAYPAL_MOBILE_RETURN_URL,
  mobileCancelUrl: process.env.EXPO_PUBLIC_PAYPAL_MOBILE_CANCEL_URL,
};
