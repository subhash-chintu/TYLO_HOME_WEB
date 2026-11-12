# Mobile App Blueprint

## Product direction

Build one iOS and Android app for the home and kitchen product catalog. Keep the visual system consistent with the static storefront: near-black surfaces, white text, gold accents sampled from the TYLO HOME logo, simple typography, and generous spacing. This is a catalog and enquiry app; purchases happen through Amazon, Flipkart, or WhatsApp Business.

## Recommended framework: Expo + React Native

Use Expo with React Native and TypeScript. One shared codebase can produce iOS and Android apps, and Expo provides a straightforward path to device previews and store builds. Reuse product/category content and visual tokens from the website where practical; the mobile app still needs its own native navigation, release builds, and store review.

## Screens and navigation

Use a bottom tab bar with **Home**, **Categories**, and **Contact & Help**. Product details can open as a pushed screen from Home or Categories.

- **Home** — brand header, search entry, featured products, category shortcuts, and an all-products list/grid.
- **Categories** — browse categories such as Taps, Sinks, Basins, Tiles, Granite, and Customised Items; selecting one filters the product catalog.
- **Product details** — product images, name, short description, category, optional specifications, and actions for Amazon, Flipkart, and custom WhatsApp order.
- **Contact & Help** — WhatsApp contact, phone/email placeholders, business hours, FAQs, and basic enquiry guidance.

## Shared product data model

Keep products in a central JSON or TypeScript data file for the initial static MVP. Suggested fields:

| Field | Purpose |
| --- | --- |
| `id` | Stable unique identifier |
| `name` | Display name |
| `categoryId` | Category reference |
| `description` | Short product details |
| `image` | Local asset path or hosted image URL |
| `amazonUrl` | Optional marketplace listing |
| `flipkartUrl` | Optional marketplace listing |
| `whatsappMessage` | Optional product-specific enquiry text |
| `featured` | Whether to show in featured section |

Categories should also have stable IDs, names, and optional image/icon references. Hide marketplace buttons when the corresponding URL is absent.

## Link behavior

- Open Amazon and Flipkart URLs with the system link handler; validate that configured links use HTTPS.
- Open WhatsApp Business using `https://wa.me/<country-code-and-number>?text=<encoded-message>`.
- Build the enquiry text from the product name and a short request, for example: “Hi, I’m interested in [product name]. Please share details.”
- Keep the phone number in one configuration value. Replace the placeholder with the business number including country code, digits only.
- If WhatsApp is unavailable, the `wa.me` URL can fall back to a browser. Provide a visible general contact option as a fallback.

## Suggested project structure

```text
mobile/
  app/                       # Expo Router routes and layouts
    (tabs)/
      index.tsx              # Home
      categories.tsx         # Categories
      contact.tsx            # Contact & Help
    products/[id].tsx         # Product details
  src/
    components/              # ProductCard, CategoryChip, ActionButton
    data/                    # products.ts, categories.ts
    lib/                     # external-link and WhatsApp helpers
    theme/                   # colors, spacing, typography
    types/                   # Product and Category types
  assets/
    products/                # Local product imagery
```

## Delivery stages

1. **Scaffold** — create the Expo TypeScript app, navigation, theme tokens, and empty screens.
2. **Catalog MVP** — add product/category data, search or category filtering, product details, and responsive loading/empty states.
3. **Enquiry links** — configure marketplace links and WhatsApp Business actions; test on iOS and Android devices.
4. **Polish** — add real product photography, accessibility labels, app icon/splash screen, and contact/FAQ content.
5. **Release** — create iOS and Android builds, test store requirements, prepare privacy and store listing materials, then submit for review.

The first version can remain static and does not require a backend. A backend becomes useful when products, prices, or availability need frequent updates without publishing a new app version.
