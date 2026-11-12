# TYLO HOME mobile app

Cross-platform Expo and React Native app starter for iOS and Android. It includes a searchable product catalog, category browsing, product details, marketplace search links, WhatsApp enquiry actions, and a Help screen. The UI follows the TYLO HOME black, white, and gold palette and uses the supplied logo.

## Start the app

Requirements: Node.js LTS and npm. Install dependencies and start Expo from this folder:

```sh
npm install
npx expo start
```

Install an Expo Go version compatible with the Expo SDK in `package.json` on a physical phone, then scan the QR code. A simulator is optional. Local iOS simulator builds require macOS and Xcode; cloud builds can be made with Expo Application Services (EAS).

## Add real store details

- Replace the sample products in `src/data/products.js` with your actual products, descriptions, and specifications.
- Add exact `amazonUrl` and `flipkartUrl` values to a product when you have its listing. If omitted, the app opens a marketplace search for that product name.
- Replace `91XXXXXXXXXX` in `src/config.js` with your WhatsApp Business number: country code plus digits only, with no plus sign or spaces.
- Add real product photos before release. The current catalog uses simple symbols as image placeholders.

The catalog is static and needs no backend for this first release.
