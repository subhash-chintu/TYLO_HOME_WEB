# TYLO HOME Mobile App Blueprint

## Framework and platform

The app is built with Expo and React Native in JavaScript. One project targets iOS and Android. The first version is a static product catalog: it does not need a backend or account sign-in.

## Implemented screens

- **Home:** TYLO HOME logo and branding, product search, category chips, item count, and a responsive product grid.
- **Categories:** taps, sinks, basins, tiles, granite, adhesives, and custom work. Selecting a category opens the filtered catalog.
- **Product details:** description, specification notes, Amazon and Flipkart search links, and a custom-order action for WhatsApp Business.
- **Help:** general WhatsApp enquiry, plus expandable answers about custom orders and buying products.

The product cards use icon placeholders until real product photos are supplied. WhatsApp remains configured with a placeholder number.

## Current project structure

```text
mobile/
  App.js                    # App screens, navigation, and visual components
  app.json                  # Expo app identity
  assets/logo.jpeg          # TYLO HOME logo
  src/
    config.js               # WhatsApp Business number
    data/products.js        # Sample products and categories
```

Product data can include `id`, `name`, `categoryId`, `description`, `details`, `icon`, and `label`. Add optional `amazonUrl` and `flipkartUrl` fields when exact listings are available; otherwise the app opens a marketplace search for the product name.

## Next steps before release

1. Replace sample catalog entries and icon placeholders with real product details, prices, and photos.
2. Set the WhatsApp Business number in `src/config.js` using country code plus digits only.
3. Add app icon and splash artwork, and finalize business contact and privacy details.
4. Build installable Android and iOS packages with Expo Application Services, then complete device checks and store submissions.

The Render static-site setup is for the website. The mobile app is built and distributed separately through Expo and the app stores.
