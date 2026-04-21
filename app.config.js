const ANDROID_APPLICATION_ID = process.env.ANDROID_APPLICATION_ID || "com.callinster";
const ANDROID_VERSION_CODE = Number(process.env.ANDROID_VERSION_CODE || 1);

module.exports = {
  "expo": {
    "name": "Callinster",
    "slug": "Callinster",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#034078"
    },
    "scheme": "callinster",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "edgeToEdgeEnabled": true,
      "package": ANDROID_APPLICATION_ID,
      "permissions": [
        "NOTIFICATIONS",
        "SCHEDULE_EXACT_ALARM",
        "WAKE_LOCK",
        "READ_CONTACTS"
      ],
      "googleServicesFile": process.env.GOOGLE_SERVICES_FILE,
      "versionCode": ANDROID_VERSION_CODE
    },
    "ios": {
      "bundleIdentifier": "com.callinster",
      "buildNumber": "1.0.0",
      "supportsTablet": true,
      "infoPlist": {
        "UIBackgroundModes": [
          "remote-notification"
        ],
        "NSContactsUsageDescription": "Allow Callinster to access your contacts for easy call scheduling"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-3940256099942544~3347511713",
          "iosAppId": "ca-app-pub-3940256099942544~1458002511"
        }
      ],
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#ffffff"
        }
      ],
      "expo-font"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "notification": {
      "icon": "./assets/images/icon.png",
      "color": "#5E72E4",
      "iosDisplayInForeground": true,
      "androidMode": "default",
      "androidCollapsedTitle": "Callinster"
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/85f39e43-cf2f-4045-8a69-1b8caff0b399"
    },
    "extra": {
      "eas": {
        "projectId": "85f39e43-cf2f-4045-8a69-1b8caff0b399"
      }
    },
    "owner": "steerify9ja"
  }
}
