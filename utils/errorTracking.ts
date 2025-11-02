import * as Sentry from "sentry-expo";

// Sentry.init({
//   dsn: "your-sentry-dsn",
//   enableInExpoDevelopment: false,
//   debug: false,
//   tracesSampleRate: 0.2,
// });

export const logError = (error: Error, context = {}) => {
  if (__DEV__) {
    console.error(error);
  } else {
    Sentry.Native.captureException(error, { extra: context });
  }
};
export const logMessage = (message: string, context = {}) => {
  if (__DEV__) {
    console.log(message);
  } else {
    Sentry.Native.captureMessage(message, { extra: context });
  }
};
