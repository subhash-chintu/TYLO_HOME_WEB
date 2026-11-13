# TYLO HOME mobile app

Cross-platform Expo and React Native app starter for iOS and Android. It includes a searchable product catalog, category browsing, product details, marketplace search links, WhatsApp enquiry actions, and a Help screen. The UI follows the TYLO HOME black, white, and gold palette and uses the supplied logo.

## Start the app

Requirements: Node.js 22.13 or newer and npm (required by the current Expo SDK 58). Install dependencies and start Expo from this folder:

```sh
npm install
npx expo start
```

Install an Expo Go version compatible with the Expo SDK in `package.json` on a physical phone, then scan the QR code. A simulator is optional. Local iOS simulator builds require macOS and Xcode; cloud builds can be made with Expo Application Services (EAS).

## Connect the live catalog

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Use the Supabase project API URL and a publishable key. Never put the database password, service-role key, or secret API key in the mobile app.

The app reads published products, active categories, and store settings from Supabase when configured. It keeps the sample catalog as a fallback if no connection is configured or the catalog is temporarily unavailable. The WhatsApp Business number, FAQs, product details, images, and marketplace links are managed in the web admin page.

For an EAS build, configure the same two `EXPO_PUBLIC_...` variables in the EAS environment used by the selected build profile before building.

## Build an installable Android APK

This project has an internal EAS profile that creates an APK for direct installation. After signing in to an Expo account, run:

```sh
npx eas-cli@latest build --platform android --profile preview
```

The app package ID is currently `com.tylohome.catalog`. Choose the final package ID before publishing to Google Play.

## Build and test on iPhone and iPad

The iOS app uses bundle ID `com.tylohome.catalog` and supports iPad layouts. A TestFlight build requires an active Apple Developer Program membership and an App Store Connect app record. Start a signed App Store distribution build with:

```sh
npx eas-cli@latest build --platform ios --profile production
```

After the build finishes, upload it with `npx eas-cli@latest submit --platform ios`, then use App Store Connect → Apps → TYLO HOME → TestFlight to enable internal testing and invite testers. Testers install Apple's TestFlight app on each iPhone or iPad and accept the invitation. External testers require Apple's TestFlight beta review before they can install the build.
