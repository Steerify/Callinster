import React, { createContext, useContext, useState } from "react";

type SubscriptionTier = "basic" | "premium" | "elite";

interface SubscriptionContextProps {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
}

const SubscriptionContext = createContext<SubscriptionContextProps>({
  tier: "elite",
  setTier: () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tier, setTier] = useState<SubscriptionTier>("basic");
  return (
    <SubscriptionContext.Provider value={{ tier, setTier }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Default export for compatibility with Expo Router / file-based component expectations
export default SubscriptionProvider;
