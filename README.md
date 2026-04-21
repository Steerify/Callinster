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

## Android release (EAS + Gradle)

### 1) Configured release settings

- **App config** (`app.config.js`)
  - Android package is controlled by `ANDROID_APPLICATION_ID` (defaults to `com.callinster`).
  - Android `versionCode` is controlled by `ANDROID_VERSION_CODE` (defaults to `1`).
- **EAS profiles** (`eas.json`)
  - `production-aab`: Google Play app bundle (`.aab`).
  - `production-apk`: release APK (`.apk`).
  - `local-release`: local Gradle-compatible store build using `credentialsSource: local`.
- **Native Android signing** (`android/app/build.gradle`)
  - Release signing uses Gradle properties:
    - `CALLINSTER_UPLOAD_STORE_FILE`
    - `CALLINSTER_UPLOAD_STORE_PASSWORD`
    - `CALLINSTER_UPLOAD_KEY_ALIAS`
    - `CALLINSTER_UPLOAD_KEY_PASSWORD`
  - If these are absent, release build falls back to debug signing (safe for CI smoke builds, **not** Play Store distribution).

### 2) Validate current release configuration

```bash
npx expo config --type public | rg -n '"android"|"package"|"versionCode"'
./android/gradlew -p android :app:tasks --all | rg -n 'assembleRelease|bundleRelease'
```

### 3) Build commands (exact)

#### Cloud build with EAS

```bash
# AAB (Google Play)
eas build --platform android --profile production-aab

# APK (internal QA / sideload)
eas build --platform android --profile production-apk
```

Artifact URLs appear:
- In CLI output under **Build details** / **Install page** links.
- On Expo dashboard project builds page (`https://expo.dev/accounts/<owner>/projects/<slug>/builds`).

#### Local Gradle build (signed when secrets are provided)

```bash
cd android
./gradlew clean
./gradlew bundleRelease   # outputs .aab
./gradlew assembleRelease # outputs .apk
```

Artifacts appear at:
- `android/app/build/outputs/bundle/release/app-release.aab`
- `android/app/build/outputs/apk/release/app-release.apk`

### 4) If CI/local credentials are missing

Minimal required secrets:
- `CALLINSTER_UPLOAD_STORE_FILE` (path to keystore file)
- `CALLINSTER_UPLOAD_STORE_PASSWORD`
- `CALLINSTER_UPLOAD_KEY_ALIAS`
- `CALLINSTER_UPLOAD_KEY_PASSWORD`
- `EXPO_TOKEN` (for non-interactive EAS cloud builds)
- `GOOGLE_SERVICES_FILE` (if Firebase config is required in build context)

One-command path once secrets are supplied:

```bash
eas build --platform android --profile production-aab --non-interactive
```
