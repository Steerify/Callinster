import { useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PAYPAL_CONFIG, PAYPAL_PLAN_IDS } from "../constants/subscription";
import type { SubscriptionTier } from "../constants/subscription";
import {
  captureSubscriptionApproval,
  createSubscriptionCheckout,
  fetchSubscriptionStatus,
} from "../services/subscriptionApi";

type CheckoutState = "idle" | "pending" | "success" | "failure";
type SubscriptionStatus = "active" | "pending" | "canceled" | "failed";

interface SubscriptionContextProps {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  checkoutState: CheckoutState;
  error: string | null;
  setTier: (tier: SubscriptionTier) => Promise<void>;
  syncSubscriptionFromBackend: () => Promise<void>;
  startCheckout: (tier: Exclude<SubscriptionTier, "basic">) => Promise<void>;
}

const STORAGE_KEY = "subscription_tier";
const STATUS_STORAGE_KEY = "subscription_status";

const SubscriptionContext = createContext<SubscriptionContextProps>({
  tier: "basic",
  status: "canceled",
  checkoutState: "idle",
  error: null,
  setTier: async () => {},
  syncSubscriptionFromBackend: async () => {},
  startCheckout: async () => {},
});

WebBrowser.maybeCompleteAuthSession();

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<SubscriptionTier>("basic");
  const [status, setStatus] = useState<SubscriptionStatus>("canceled");
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [error, setError] = useState<string | null>(null);
  const { getToken, isSignedIn } = useAuth();

  const setTier = useCallback(async (nextTier: SubscriptionTier) => {
    setTierState(nextTier);
    await SecureStore.setItemAsync(STORAGE_KEY, nextTier);
  }, []);

  const setSubscriptionStatus = useCallback(async (nextStatus: SubscriptionStatus) => {
    setStatus(nextStatus);
    await SecureStore.setItemAsync(STATUS_STORAGE_KEY, nextStatus);
  }, []);

  const syncSubscriptionFromBackend = useCallback(async () => {
    if (!isSignedIn) {
      await setTier("basic");
      await setSubscriptionStatus("canceled");
      return;
    }

    const token = await getToken();
    if (!token) return;

    const response = await fetchSubscriptionStatus(token);
    await setTier(response.tier);
    await setSubscriptionStatus(response.status);
  }, [getToken, isSignedIn, setSubscriptionStatus, setTier]);

  const startCheckout = useCallback(
    async (nextTier: Exclude<SubscriptionTier, "basic">) => {
      setCheckoutState("pending");
      setError(null);

      try {
        if (!PAYPAL_PLAN_IDS[nextTier]) {
          throw new Error(`Missing PayPal plan ID for ${nextTier} tier.`);
        }
        const token = await getToken();
        const { checkoutUrl } = await createSubscriptionCheckout(nextTier, token);
        const returnUrl = PAYPAL_CONFIG.mobileReturnUrl || Linking.createURL("/paypal-return");

        const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, returnUrl);
        if (result.type !== "success" || !result.url) {
          setCheckoutState("failure");
          setError("Checkout was cancelled before confirmation.");
          return;
        }

        const params = Linking.parse(result.url).queryParams ?? {};
        const subscriptionIdParam = params.subscription_id;
        const subscriptionId = Array.isArray(subscriptionIdParam)
          ? subscriptionIdParam[0]
          : typeof subscriptionIdParam === "string"
            ? subscriptionIdParam
            : undefined;

        if (!subscriptionId) {
          throw new Error("PayPal did not return a subscription_id.");
        }

        const capture = await captureSubscriptionApproval(subscriptionId, token);
        await setTier(capture.tier);
        await setSubscriptionStatus(capture.status);
        setCheckoutState("success");
      } catch (checkoutError) {
        setCheckoutState("failure");
        setError(checkoutError instanceof Error ? checkoutError.message : "Unable to complete checkout.");
      }
    },
    [getToken, setSubscriptionStatus, setTier],
  );

  useEffect(() => {
    (async () => {
      const [savedTier, savedStatus] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEY),
        SecureStore.getItemAsync(STATUS_STORAGE_KEY),
      ]);

      if (savedTier === "basic" || savedTier === "premium" || savedTier === "elite") {
        setTierState(savedTier);
      }

      if (savedStatus === "active" || savedStatus === "pending" || savedStatus === "canceled" || savedStatus === "failed") {
        setStatus(savedStatus);
      }

      try {
        await syncSubscriptionFromBackend();
      } catch {
        // keep local cached values when backend is unavailable
      }
    })();
  }, [syncSubscriptionFromBackend]);

  const value = useMemo(
    () => ({ tier, status, checkoutState, error, setTier, syncSubscriptionFromBackend, startCheckout }),
    [checkoutState, error, setTier, startCheckout, status, syncSubscriptionFromBackend, tier],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export default SubscriptionProvider;
