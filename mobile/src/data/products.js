export const categories = [
  { id: "taps", name: "Taps", icon: "♧", description: "Kitchen and bathroom taps" },
  { id: "sinks", name: "Sinks", icon: "▱", description: "Kitchen sinks and bowls" },
  { id: "basins", name: "Basins", icon: "◒", description: "Countertop and wall basins" },
  { id: "tiles", name: "Tiles", icon: "▦", description: "Tiles and surface finishes" },
  { id: "granite", name: "Granite", icon: "⬛", description: "Natural stone and cut-to-size" },
  { id: "adhesives", name: "Adhesives", icon: "▤", description: "Adhesives and installation essentials" },
  { id: "custom", name: "Custom work", icon: "✳", description: "Made-to-measure pieces" },
];

export const products = [
  {
    id: "arc-pull-down-tap",
    name: "Arc Pull-Down Tap",
    categoryId: "taps",
    description: "A clean, practical tap for a modern kitchen. Ask us about finish and installation options.",
    details: ["Kitchen fitting", "Multiple finishes available", "Ask for current availability"],
    icon: "🚰",
    label: "Popular",
  },
  {
    id: "undermount-kitchen-sink",
    name: "Undermount Kitchen Sink",
    categoryId: "sinks",
    description: "A deep-bowl sink designed to sit neatly below the countertop.",
    details: ["Stainless steel", "Multiple bowl sizes", "Ask about cut-out dimensions"],
    icon: "▱",
    label: "Kitchen",
  },
  {
    id: "stone-counter-basin",
    name: "Stone Counter Basin",
    categoryId: "basins",
    description: "A natural-stone look for a statement bathroom counter.",
    details: ["Countertop installation", "Stone pattern may vary", "Custom options by enquiry"],
    icon: "◒",
    label: "Custom",
  },
  {
    id: "textured-wall-tile",
    name: "Textured Wall Tile",
    categoryId: "tiles",
    description: "A subtle textured finish for kitchen backsplashes and bathroom walls.",
    details: ["Matte finish", "Multiple sizes and designs", "Confirm stock before ordering"],
    icon: "▦",
    label: "Surfaces",
  },
  {
    id: "black-granite-slab",
    name: "Black Granite Slab",
    categoryId: "granite",
    description: "Natural granite for counters, ledges, and custom-cut surfaces.",
    details: ["Natural stone", "Cut-to-size options", "Pattern varies by slab"],
    icon: "⬛",
    label: "Natural stone",
  },
  {
    id: "tile-adhesive",
    name: "Tile Adhesive",
    categoryId: "adhesives",
    description: "An installation essential for tile projects. Contact us for product and coverage details.",
    details: ["Ask for product specifications", "Coverage depends on surface and application", "Availability varies"],
    icon: "▧",
    label: "Installation",
  },
  {
    id: "made-to-measure-vanity",
    name: "Made-to-Measure Vanity",
    categoryId: "custom",
    description: "A custom bathroom vanity planned around your measurements and preferred finish.",
    details: ["Made to order", "Share measurements and reference photos", "Final quote confirmed by our team"],
    icon: "▤",
    label: "Made to order",
  },
  {
    id: "sanitary-shower-set",
    name: "Sanitary Shower Set",
    categoryId: "taps",
    description: "A coordinated shower fitting set for a simple, refined bathroom update.",
    details: ["Bathroom fitting", "Finish options available", "Ask about compatibility"],
    icon: "◉",
    label: "Bathroom",
  },
];

export function getCategory(categoryId) {
  return categories.find((category) => category.id === categoryId) || categories[0];
}
