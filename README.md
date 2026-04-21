# Callinster

Callinster is an Expo + React Native app focused on helping users keep up with people in their contact list. It combines contacts access, one-tap communication links, scheduled call reminders, and a tiered feature model (Basic / Premium / Elite).

## Feature overview

### 1) Contacts feed (Home tab)
- Loads device contacts with `expo-contacts` after permission is granted.
- Supports filtering via:
  - phone-number avoid prefixes (`avoidPrefixes`)
  - name avoid prefixes (`avoidNamePrefixes`)
- Shows a limited daily contact feed for non-Elite tiers and allows search/filter interactions.
- Supports one-tap connect flows with deep links/fallback links for apps like Phone, WhatsApp, Telegram, Skype, Zoom, Teams, Messenger, Discord, and Snapchat.

### 2) Favorites (Favorites tab)
- Favorites are stored locally in AsyncStorage (`favoriteContacts`).
- Elite users can view/manage favorites directly in the Favorites tab.
- Non-Elite users see upgrade prompts instead of favorites management.

### 3) Scheduled-call reminders
- Users can schedule call reminders from the Home experience.
- Reminders are scheduled with `expo-notifications` and persisted in AsyncStorage (`scheduledCalls`).
- Android notification channels are configured in-app for reliable reminder delivery.

### 4) Profile & settings
- Uses Clerk user profile data (name, email, avatar).
- Includes:
  - Notification settings modal
  - Notification test action
  - Account and privacy info modals
  - Sign out action
- Theme state is managed with `ThemeContext` and persisted locally.

### 5) Tier gating
- Tier model is `basic | premium | elite`.
- Current gating in the UI includes differences in:
  - visible favorites features
  - delete/contact limits
  - upgrade prompts and plan cards
  - notification customization availability in settings

> Note: tier state is currently local context state, not a connected billing backend.

---

## Architecture

### App structure
- `app/_layout.tsx`: root providers (`ClerkProvider`, `ThemeProvider`) and splash/font setup.
- `app/index.tsx`: redirects to auth flow.
- `app/(auth)/login.tsx`: Google SSO sign-in with Clerk.
- `app/(tabs)/_layout.tsx`: bottom tab navigator (Home, Favorites, Profile).
- `app/(tabs)/index.tsx`: contacts feed + scheduling + reminders.
- `app/(tabs)/notifications.tsx`: favorites and tier-gated upgrade UI.
- `app/(tabs)/profile.tsx`: profile card, settings modals, notification actions.

### State and persistence
- **Auth/session**: Clerk (`@clerk/clerk-expo`).
- **Device data APIs**: `expo-contacts`, `expo-notifications`, `expo-linking`.
- **Local persistence**: AsyncStorage (favorites, scheduled calls, filters, preferences, counters).
- **Theme**: app-level context with persisted mode.
- **Tier**: local subscription context provider (`Subsceiption.tsx`).

---

## Required environment and configuration

## 1) Clerk (required)
Set this in your environment before launching:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
```

You also need Clerk OAuth configured for Google sign-in because login uses `startSSOFlow({ strategy: "oauth_google" })`.

## 2) Expo notifications (required for reminders)
- Ensure your build includes `expo-notifications` plugin config (already present in `app.config.js`).
- Grant notification permission on device when prompted.
- On Android, channels are created at runtime (for example `call-notifications`, `profile-notifications`).

## 3) Android-specific config
- Android permissions are declared in `app.config.js`:
  - `NOTIFICATIONS`
  - `SCHEDULE_EXACT_ALARM`
  - `WAKE_LOCK`
  - `READ_CONTACTS`
- If you are using Firebase services with native Android builds, set:

```bash
GOOGLE_SERVICES_FILE=<absolute_or_project_relative_path_to_google-services.json>
```

## 4) PayPal placeholders
- There is no active PayPal integration wired in this repository at the moment.
- If you add one, define your own `EXPO_PUBLIC_PAYPAL_*` placeholders and document callback URLs and environment mode (sandbox/live) before shipping.

---

## Local development and build

### Prerequisites
- Node.js + npm
- Android Studio (for emulator/native Android builds) and/or Xcode (for iOS)
- Expo tooling (via `npx expo ...` commands)

### Install
```bash
npm install
```

### Run dev client (matches current script)
```bash
npm run start
```
This runs `expo start --dev-client`.

### Run Android native build + install
```bash
npm run android
```

### Run iOS native build + install
```bash
npm run ios
```

### Run web
```bash
npm run web
```

### Lint
```bash
npm run lint
```

> The `reset-project` npm script exists in `package.json` but points to a missing `scripts/reset-project.js` file in this repo, so it should be treated as non-functional unless restored.

---

## Known limitations

1. **Tier/billing is local-only**
   - Subscription tier behavior is currently app-state-driven and not connected to a real payment backend.

2. **Notification reliability depends on device policy**
   - OEM battery optimization (especially on Android) may delay or suppress scheduled notifications.

3. **Permissions are mandatory for core workflows**
   - Denied contacts permission blocks contacts feed.
   - Denied notifications permission blocks reminder usefulness.

4. **Holiday reminder behavior**
   - Holiday notifications in settings are date-specific and only schedule for matching dates.

5. **Template residue in scripts**
   - `npm run reset-project` is a leftover script target and currently broken in this repository.

---

## Troubleshooting

### Notifications do not fire
1. Confirm app notification permission is granted in OS settings.
2. On Android, ensure notification channels are enabled for the app.
3. Disable battery optimization for Callinster (Android settings) to improve scheduled delivery.
4. Test on a physical device; emulators can behave inconsistently with background notification delivery.

### Contacts list is empty
1. Confirm contacts permission is granted.
2. Check whether your avoid-prefix filters are hiding most/all contacts.
3. Pull-to-refresh or restart app after permission changes.

### Login issues (Google SSO)
1. Verify `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set.
2. Confirm Google OAuth is configured in Clerk for your redirect URIs and build targets.
3. Rebuild native dev client if auth/native config changed.

---

## Tech stack
- Expo SDK 54 + React Native 0.81
- Expo Router
- Clerk Expo SDK
- AsyncStorage
- Expo Contacts / Notifications / Linking
