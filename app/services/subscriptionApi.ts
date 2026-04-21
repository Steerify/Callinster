import { PAYPAL_CONFIG } from "../constants/subscription";
import type { SubscriptionTier } from "../constants/subscription";

type ApiMethod = "GET" | "POST";

type CreateSubscriptionResponse = {
  checkoutUrl: string;
  subscriptionId?: string;
};

type CaptureSubscriptionResponse = {
  tier: SubscriptionTier;
  status: "active" | "pending" | "canceled" | "failed";
};

type SubscriptionStatusResponse = {
  tier: SubscriptionTier;
  status: "active" | "pending" | "canceled" | "failed";
};

async function apiRequest<T>(path: string, method: ApiMethod, token: string | null, body?: object): Promise<T> {
  if (!PAYPAL_CONFIG.baseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function createSubscriptionCheckout(
  tier: Exclude<SubscriptionTier, "basic">,
  token: string | null,
): Promise<CreateSubscriptionResponse> {
  return apiRequest<CreateSubscriptionResponse>("/billing/paypal/subscriptions/create", "POST", token, {
    tier,
    mobileReturnUrl: PAYPAL_CONFIG.mobileReturnUrl,
    mobileCancelUrl: PAYPAL_CONFIG.mobileCancelUrl,
  });
}

export async function captureSubscriptionApproval(
  subscriptionId: string,
  token: string | null,
): Promise<CaptureSubscriptionResponse> {
  return apiRequest<CaptureSubscriptionResponse>("/billing/paypal/subscriptions/capture", "POST", token, {
    subscriptionId,
  });
}

export async function fetchSubscriptionStatus(token: string | null): Promise<SubscriptionStatusResponse> {
  return apiRequest<SubscriptionStatusResponse>("/billing/subscription-status", "GET", token);
}
