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
      "package": "com.callinster",
      "useNextNotificationsApi": true,
      "permissions": [
        "NOTIFICATIONS",
        "SCHEDULE_EXACT_ALARM",
        "WAKE_LOCK",
        "READ_CONTACTS"
      ],
      "googleServicesFile": process.env.GOOGLE_SERVICES_FILE,
      "versionCode": 1
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
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff",
          // "sounds": [
          //   "./assets/notification-sound.wav"
          // ]
        }
      ],
      "expo-font",
      "sentry-expo"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#5E72E4",
      "iosDisplayInForeground": true,
      "androidMode": "default",
      "androidCollapsedTitle": "Callinster"
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/your-project-id"
    },
    "extra": {
      "eas": {
        "projectId": "ff36acd5-0fed-4940-8059-f37a63f1bd8c"
      },
      "router": {}
    },
    "owner": "samibyrone"
  }
}
