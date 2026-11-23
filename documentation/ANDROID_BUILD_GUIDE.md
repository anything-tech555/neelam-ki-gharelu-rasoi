# Android APK & AAB Build Guide: Neelam Ki Gharelu Rasoi

This document details how the installable Android mobile application (`com.neelam.rasoi`) is built, packaged, and distributed.

---

## 1. Application Metadata
- **App Name**: Neelam Ki Gharelu Rasoi (नीलम की घरेलू रसोई)
- **Package ID**: `com.neelam.rasoi`
- **Category**: Food & Drink
- **Target SDK**: Android 34 (Android 14)
- **Minimum SDK**: Android 22 (Android 5.1 Lollipop)
- **Technologies**: Capacitor 6 + React 18 + Vite + Tailwind CSS + PWA Webview + Native Android Gradle

---

## 2. Directory Layout
The native Android project is located at:
- `/customer-app/android`
- `/android` (Mirrored root copy)

Key files:
- `app/src/main/AndroidManifest.xml`: Permissions (`INTERNET`, `ACCESS_NETWORK_STATE`, `VIBRATE`, `POST_NOTIFICATIONS`), app label, launcher activity.
- `app/src/main/res/values/strings.xml`: Application name strings.
- `app/src/main/assets/public/`: Bundled production web build.
- `build.gradle` & `app/build.gradle`: Gradle configuration and dependencies.

---

## 3. How to Build the Debug APK & Release AAB

### Step 1: Ensure Prerequisites
1. **JDK 17**: Ensure `JAVA_HOME` points to JDK 17.
2. **Android SDK**: Ensure `ANDROID_HOME` or `local.properties` points to the Android SDK directory (`sdk.dir=C\:\\Users\\ak\\Android\\Sdk`).

### Step 2: Build and Sync Web Assets
```bash
cd customer-app
npm run build
npx cap copy android
npx cap sync android
```

### Step 3: Compile APK
```bash
cd customer-app/android
./gradlew assembleDebug
```
The output APK is generated at:
`customer-app/android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Compile Android App Bundle (AAB) for Google Play Store
```bash
./gradlew bundleRelease
```
The output AAB is generated at:
`customer-app/android/app/build/outputs/bundle/release/app-release.aab`

---

## 4. Distributing to Customers
1. **Direct APK Sideload**: Send `app-debug.apk` (or signed release APK) via WhatsApp / Email. Customers can tap and install directly on any Android smartphone.
2. **Google Play Store**: Upload `app-release.aab` to Google Play Console under the Food & Drink category.
3. **Progressive Web App (PWA)**: When customers visit `https://neelamrasoi.com` on their mobile browser (Chrome/Edge/Samsung Internet), a native "Install App" banner allows 1-click installation to their home screen with offline caching.
