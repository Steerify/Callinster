# Callinster — Reproduction Guide

🔧 **Purpose:** This file explains how to reproduce the Callinster app locally, the architecture, feature list, important notes, storage keys, testing checklist, and recommended follow-ups so any developer can duplicate the app precisely.

---

## 1) Quick summary

- Platform: **React Native (Expo SDK ~53)**
- Language: **TypeScript**
- Router: **expo-router** (file-based routing)
- Key services: **Clerk (SSO)**, **expo-contacts**, **expo-notifications**, **AsyncStorage**

---

## 2) Repository layout (important files)

- `app/` — screens and file-based routes
  - `app/_layout.tsx` — root layout (ClerkProvider, ThemeProvider, Splash)
  - `app/index.tsx` — redirects to login
  - `app/(auth)/login.tsx` — Clerk Google SSO and login animation
  - `app/(tabs)/index.tsx` — main home + scheduling, contact logic
- `app/components/` — `Contact.tsx`, `Loader.tsx`, `ThemeSwitch.tsx`, `Subsceiption.tsx`
- `app/contexts/ThemeContext.tsx`
- `constants/theme.ts`
- `app.json` — Expo manifest & permissions
- `package.json` — dependencies & scripts

---

## 3) Setup & run (minimum steps)

1. clone repo

   git clone <repo> && cd callinster

2. install deps

   yarn install

3. set environment variables (locally or EAS):

   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key

   Also configure Google OAuth in the Clerk dashboard with proper redirect URIs (dev client / standalone app).

4. run dev client

   - yarn start (Expo dev client)
   - yarn android / yarn ios (or use EAS builds)

5. when prompted, grant **Contacts** and **Notifications** permissions

---

## 4) Features & technical details

- Contacts: uses `expo-contacts` and filters by `avoidPrefixes` and `avoidNamePrefixes`.
- Connect flows: attempts deep link (e.g., `whatsapp://send`), otherwise opens web/store fallback via `getFallbackLink`.
- Scheduling: uses `expo-notifications` to schedule reminders; scheduled calls are stored under `scheduledCalls` in AsyncStorage.
- Theme: managed in `ThemeContext` and persisted in AsyncStorage under key `theme`.
- Subscription: `app/components/Subsceiption.tsx` provides `useSubscription()` (local provider). Important: the provider is currently commented out in `app/_layout.tsx` which causes `useSubscription()` to use its default value.

---

## 5) Persistence keys (AsyncStorage)

- `avoidPrefixes` (string array)
- `avoidNamePrefixes` (string array)
- `scheduledCalls` (array of scheduled call objects)
- `favoriteContacts` (array)
- `weeklyPreferences` (object)
- `usernames_<contact.id>` (object)
- `theme` ("light" | "dark")
- Daily counters: `${key}_${YYYY-MM-DD}` (e.g. `deletes_2025-12-23`)

---

## 6) Important notes & gotchas

- Auth: Clerk SSO must be configured (publishable key + redirect URIs). The app relies on Clerk's `startSSOFlow({ strategy: 'oauth_google' })` for sign-in.
- SubscriptionProvider: currently not wrapped in `app/_layout.tsx` (commented out). Because `Subsceiption.tsx` creates a default context value, the app acts like the user has the highest tier by default. To replicate production gating, enable the provider or integrate a real billing backend.
- Notifications: test scheduled notifications on real device (background/killed state). On Android, create the notification channel and handle battery optimizations.
- Data sensitivity: contact usernames and metadata are stored in AsyncStorage (not encrypted). Consider `expo-secure-store` for PII.

---

## 7) Testing checklist

- [ ] Google SSO (login + redirect to `(tabs)`)
- [ ] Contacts permission flows (allow/deny)
- [ ] Contact listing & avoid-prefix filtering
- [ ] Deep link open flow (when app installed & not installed)
- [ ] Schedule notification -> notification trigger -> deep link call
- [ ] Theme toggle persistence
- [ ] Subscription limits (deletes/day) — enable provider and test different tiers

---

## 8) Recommended follow-ups (developer hints)

- Enable `SubscriptionProvider` in `app/_layout.tsx` and connect to a real billing API (Stripe / in-app purchases) to enforce limits.
- Move sensitive values to `expo-secure-store` or backend storage.
- Add unit tests and E2E tests for notification & deep-link flows.
- Add a CI workflow that runs `yarn lint` and an Expo build check.

---

## 9) Quick commands

- yarn install
- yarn start
- yarn android
- yarn ios
- yarn web
- yarn lint

---

If you want, I can:

- Add a small code change to **enable `SubscriptionProvider`** and create a PR with that change.
- Create unit tests or a `README.md` style summary in the repo root.

---

Last updated: 2025-12-23
