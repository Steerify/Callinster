// Error tracking utility — Sentry can be wired in later if needed.

export const logError = (error: Error, context: Record<string, unknown> = {}) => {
  console.error("[Callinster Error]", error, context);
};

export const logMessage = (message: string, context: Record<string, unknown> = {}) => {
  console.log("[Callinster]", message, context);
};
