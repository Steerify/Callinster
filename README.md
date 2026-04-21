# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## PayPal subscription configuration

Set the following environment variables (for example in `.env`) before testing subscription upgrades:

- `EXPO_PUBLIC_API_BASE_URL`: Base URL for your backend API that proxies PayPal calls.
- `EXPO_PUBLIC_PAYPAL_CLIENT_ID`: PayPal REST client ID (used by backend).
- `PAYPAL_CLIENT_SECRET`: PayPal REST client secret (server-side only, never expose in app bundle).
- `EXPO_PUBLIC_PAYPAL_PREMIUM_PLAN_ID`: PayPal plan ID for Premium tier.
- `EXPO_PUBLIC_PAYPAL_ELITE_PLAN_ID`: PayPal plan ID for Elite tier.
- `EXPO_PUBLIC_PAYPAL_ENVIRONMENT`: `sandbox` or `live`.
- `PAYPAL_WEBHOOK_ID`: PayPal webhook ID used by backend signature verification.
- `PAYPAL_WEBHOOK_URL`: Public backend endpoint URL receiving PayPal webhook events.
- `EXPO_PUBLIC_PAYPAL_MOBILE_RETURN_URL`: Deep-link URL that PayPal should redirect to on successful approval.
- `EXPO_PUBLIC_PAYPAL_MOBILE_CANCEL_URL`: Deep-link URL that PayPal should redirect to when user cancels.

### Required backend endpoints

The mobile app now calls these backend integration points:

- `POST /billing/paypal/subscriptions/create` → create PayPal subscription and return checkout URL.
- `POST /billing/paypal/subscriptions/capture` → capture/activate approved subscription.
- `GET /billing/subscription-status` → return webhook-driven subscription status for current user.

`/billing/subscription-status` should read the latest tier/status from your server-side store (updated by PayPal webhooks) so the app can stay in sync across devices and app restarts.
