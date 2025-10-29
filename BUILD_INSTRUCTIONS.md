# SproutChat - Mobile App Build Instructions

Your app is now configured as a multi-platform Progressive Web App (PWA) that works on:
- **Web browsers** (PC/Mac)
- **Android** (APK)
- **iOS** (via Xcode)

## Project Structure

```
project/
├── src/              # React/TypeScript source code
├── dist/             # Built web app (after `npm run build`)
├── android/          # Android native project
├── ios/              # iOS native project
└── capacitor.config.ts  # Capacitor configuration
```

## Build for Web (Browser)

```bash
npm run build
npm run preview
```

The built app is in the `dist/` folder and works in any modern browser.

---

## Build Android APK

### Prerequisites
- Install [Android Studio](https://developer.android.com/studio)
- Install Android SDK (API level 33+)
- Set up environment variables for Android SDK

### Steps

1. **Build and sync the app:**
   ```bash
   npm run sync
   ```

2. **Open in Android Studio:**
   ```bash
   npm run android
   ```
   Or manually open: `android/` folder in Android Studio

3. **Build APK:**
   - In Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`
   - Or via command line:
     ```bash
     cd android
     ./gradlew assembleDebug
     ```
   - APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

4. **Install on device:**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## Build iOS App

### Prerequisites
- macOS with Xcode installed
- iOS developer account (for App Store distribution)

### Steps

1. **Build and sync the app:**
   ```bash
   npm run sync
   ```

2. **Open in Xcode:**
   ```bash
   npm run ios
   ```
   Or manually open: `ios/App/App.xcworkspace` in Xcode

3. **Build and run:**
   - Select a simulator or connected device
   - Click the Play button in Xcode
   - For production builds, use `Product > Archive`

---

## Permissions Configured

The Android app includes these permissions:
- ✅ Internet access
- ✅ Location (GPS navigation)
- ✅ Camera (plant identification)
- ✅ Microphone (voice mode)
- ✅ Storage (for saved data)

iOS permissions are handled via runtime prompts.

---

## Update App After Code Changes

After making changes to your React code:

```bash
npm run sync
```

Then rebuild in Android Studio or Xcode.

---

## Environment Variables

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

These work automatically in all platforms (Web, Android, iOS).

---

## Troubleshooting

### Android Build Issues
- Clean build: `cd android && ./gradlew clean`
- Sync Gradle files in Android Studio
- Check Android SDK path is correct

### iOS Build Issues
- Run `pod install` in `ios/App/` folder
- Clean build folder: `Product > Clean Build Folder` in Xcode
- Check signing certificates are valid

### App Not Updating
- Always run `npm run sync` after code changes
- Clear app data on device
- Uninstall and reinstall the app

---

## Quick Reference

| Task | Command |
|------|---------|
| Build web version | `npm run build` |
| Sync to native platforms | `npm run sync` |
| Open Android Studio | `npm run android` |
| Open Xcode | `npm run ios` |
| Build APK | `cd android && ./gradlew assembleDebug` |
