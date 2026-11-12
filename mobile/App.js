import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,

  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { categories, getCategory, products } from "./src/data/products";
import { WHATSAPP_BUSINESS_NUMBER } from "./src/config";

const COLORS = {
  background: "#090909",
  surface: "#15130f",
  surfaceRaised: "#1b1812",
  border: "#3e3422",
  gold: "#d6a638",
  goldLight: "#f3da87",
  white: "#f7f5f0",
  muted: "#b4ada0",
  dim: "#8e877a",
  ink: "#17130a",
};

const tabs = [
  { id: "Home", label: "Home", icon: "⌂" },
  { id: "Categories", label: "Categories", icon: "▦" },
  { id: "Help", label: "Help", icon: "?" },
];

function openExternal(url, label) {
  Linking.openURL(url).catch(() => {
    Alert.alert("Could not open link", "Please try again or open " + label + " on your device.");
  });
}

function openWhatsApp(message) {
  const digits = WHATSAPP_BUSINESS_NUMBER.replace(/\D/g, "");
  if (!digits || /X/i.test(WHATSAPP_BUSINESS_NUMBER) || digits.length < 10) {
    Alert.alert(
      "WhatsApp number not set",
      "Add your WhatsApp Business number in mobile/src/config.js. Use your country code and digits only."
    );
    return;
  }
  openExternal("https://wa.me/" + digits + "?text=" + encodeURIComponent(message), "WhatsApp");
}

function marketplaceUrl(product, marketplace) {
  const exactUrl = marketplace === "amazon" ? product.amazonUrl : product.flipkartUrl;
  if (exactUrl) return exactUrl;
  const query = encodeURIComponent(product.name);
  return marketplace === "amazon"
    ? "https://www.amazon.in/s?k=" + query
    : "https://www.flipkart.com/search?q=" + query;
}

function BrandHeader({ compact = false }) {
  return (
    <View style={[styles.brandHeader, compact && styles.brandHeaderCompact]}>
      <Image source={require("./assets/logo.jpeg")} style={styles.logo} resizeMode="contain" />
      <View style={styles.brandCopy}>
        <Text style={styles.eyebrow}>ADHESIVE · SANITARY · FITTINGS</Text>
        <Text style={styles.brandTitle}>
          TYLO <Text style={styles.goldText}>HOME</Text>
        </Text>
        {!compact && <Text style={styles.brandSubtitle}>Thoughtful details for everyday spaces.</Text>}
      </View>
    </View>
  );
}

function SectionHeading({ eyebrow, title, copy }) {
  return (
    <View style={styles.sectionHeading}>
      {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      <Text style={styles.pageTitle}>{title}</Text>
      {!!copy && <Text style={styles.bodyCopy}>{copy}</Text>}
    </View>
  );
}

function ActionButton({ title, onPress, primary = false, accessibilityLabel }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        primary && styles.actionButtonPrimary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionButtonText, primary && styles.actionButtonTextPrimary]}>
        {title}
      </Text>
    </Pressable>
  );
}

function CategoryChip({ category, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryChip,
        selected && styles.categoryChipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
        {category === null ? "All items" : category.name}
      </Text>
    </Pressable>
  );
}

function ProductCard({ product, columns, onPress }) {
  const category = getCategory(product.categoryId);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={"View " + product.name + " details"}
      onPress={onPress}
      style={({ pressed }) => [
        styles.productCard,
        columns === 1 ? styles.productCardSingle : styles.productCardGrid,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.productArt}>
        <Text style={styles.productTag}>{product.label}</Text>
        <Text style={styles.productIcon} accessibilityLabel={category.name + " product"}>
          {product.icon}
        </Text>
      </View>
      <View style={styles.productCardCopy}>
        <Text style={styles.productCategory}>{category.name.toUpperCase()}</Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>Enquire for price</Text>
        <Text style={styles.productMore}>View details  ›</Text>
      </View>
    </Pressable>
  );
}

function ProductGrid({ items, columns, onProductPress }) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No products found</Text>
        <Text style={styles.bodyCopy}>Try a different search or choose another category.</Text>
      </View>
    );
  }

  const rows = [];
  for (let index = 0; index < items.length; index += columns) {
    rows.push(items.slice(index, index + columns));
  }

  return (
    <View style={styles.productGrid}>
      {rows.map((row, rowIndex) => (
        <View style={styles.productRow} key={"row-" + rowIndex}>
          {row.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              columns={columns}
              onPress={() => onProductPress(product)}
            />
          ))}
          {columns > 1 && row.length < columns && <View style={styles.productGridSpacer} />}
        </View>
      ))}
    </View>
  );
}

function HomeScreen({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  filteredProducts,
  columns,
  onProductPress,
}) {
  return (
    <View>
      <BrandHeader />
      <View style={styles.homeIntro}>
        <Text style={styles.eyebrow}>KITCHEN · BATH · SURFACES</Text>
        <Text style={styles.heroTitle}>Make room for better living.</Text>
        <Text style={styles.bodyCopy}>
          Browse taps, sinks, basins, tiles, granite, adhesives, and made-to-measure pieces.
        </Text>
      </View>
      <TextInput
        accessibilityLabel="Search products"
        autoCapitalize="none"
        onChangeText={setSearch}
        placeholder="Search products…"
        placeholderTextColor={COLORS.dim}
        returnKeyType="search"
        style={styles.searchInput}
        value={search}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        <CategoryChip
          category={null}
          selected={selectedCategory === "all"}
          onPress={() => setSelectedCategory("all")}
        />
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
          />
        ))}
      </ScrollView>
      <View style={styles.catalogHeading}>
        <View>
          <Text style={styles.eyebrow}>THE COLLECTION</Text>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "all" ? "Explore products" : getCategory(selectedCategory).name}
          </Text>
        </View>
        <Text style={styles.itemCount}>{filteredProducts.length} items</Text>
      </View>
      <ProductGrid items={filteredProducts} columns={columns} onProductPress={onProductPress} />
    </View>
  );
}

function CategoriesScreen({ onSelectCategory }) {
  return (
    <View>
      <BrandHeader compact />
      <SectionHeading
        eyebrow="BROWSE BY ROOM"
        title="Categories"
        copy="Choose a category to see the products available."
      />
      <View style={styles.categoryList}>
        {categories.map((category) => (
          <Pressable
            accessibilityRole="button"
            key={category.id}
            onPress={() => onSelectCategory(category.id)}
            style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}
          >
            <View style={styles.categoryIconBox}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            </View>
            <View style={styles.categoryCardCopy}>
              <Text style={styles.categoryCardTitle}>{category.name}</Text>
              <Text style={styles.categoryCardDescription}>{category.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ProductDetails({ product, onBack }) {
  const category = getCategory(product.categoryId);
  const orderMessage = "Hi TYLO HOME, I am interested in " + product.name +
    ". Please share the price, availability, and customization details.";

  return (
    <View>
      <BrandHeader compact />
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹  Back to products</Text>
      </Pressable>
      <View style={[styles.productArt, styles.detailArt]}>
        <Text style={styles.productTag}>{product.label}</Text>
        <Text style={styles.detailIcon}>{product.icon}</Text>
      </View>
      <Text style={styles.productCategory}>{category.name.toUpperCase()}</Text>
      <Text style={styles.detailTitle}>{product.name}</Text>
      <Text style={styles.detailDescription}>{product.description}</Text>
      <Text style={styles.detailPrice}>Price: enquire with our team</Text>
      <View style={styles.detailList}>
        {product.details.map((detail) => (
          <View key={detail} style={styles.detailBulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.detailBulletText}>{detail}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.eyebrow}>SHOP OR ASK US</Text>
      <View style={styles.detailActions}>
        <ActionButton title="Find on Amazon  ↗" onPress={() => openExternal(marketplaceUrl(product, "amazon"), "Amazon")} />
        <ActionButton title="Find on Flipkart  ↗" onPress={() => openExternal(marketplaceUrl(product, "flipkart"), "Flipkart")} />
        <ActionButton title="Custom order on WhatsApp" primary onPress={() => openWhatsApp(orderMessage)} />
      </View>
    </View>
  );
}

function HelpScreen() {
  const generalMessage = "Hi TYLO HOME, I have a question about your kitchen and home products.";

  return (
    <View>
      <BrandHeader compact />
      <SectionHeading
        eyebrow="WE’RE HERE TO HELP"
        title="Talk to our team"
        copy="Ask about product details, availability, delivery, or a custom order."
      />
      <View style={styles.helpCard}>
        <Text style={styles.helpIcon}>↗</Text>
        <Text style={styles.cardTitle}>WhatsApp Business</Text>
        <Text style={styles.bodyCopy}>
          Message us with a product name, measurements, or a photo of your space.
        </Text>
        <ActionButton title="Chat with TYLO HOME" primary onPress={() => openWhatsApp(generalMessage)} />
      </View>
      <Text style={[styles.eyebrow, styles.faqEyebrow]}>QUICK ANSWERS</Text>
      <View style={styles.faqList}>
        <FaqItem
          question="How do custom orders work?"
          answer="Send us the product name, measurements, finish, and reference photos. We’ll confirm what can be made and share the quote."
        />
        <FaqItem
          question="How do I buy a listed product?"
          answer="Open a product and choose Amazon or Flipkart to search the marketplace, or message us for a custom enquiry."
        />
        <FaqItem
          question="Can I request a different size or finish?"
          answer="Yes, ask us about the product and share the size and finish you need. We’ll confirm available options."
        />
      </View>
    </View>
  );
}

function FaqItem({ question, answer }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={() => setExpanded(!expanded)}
      style={styles.faqItem}
    >
      <View style={styles.faqQuestionRow}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Text style={styles.faqToggle}>{expanded ? "−" : "+"}</Text>
      </View>
      {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </Pressable>
  );
}

function BottomTabs({ activeTab, onTabChange }) {
  return (
    <View style={styles.tabBar} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={() => onTabChange(tab.id)}
            style={styles.tabButton}
          >
            <Text style={[styles.tabIcon, selected && styles.tabSelected]}>{tab.icon}</Text>
            <Text style={[styles.tabText, selected && styles.tabSelected]}>{tab.label}</Text>
            {selected && <View style={styles.activeMark} />}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const columns = width >= 700 ? 3 : width < 350 ? 1 : 2;
  const [activeTab, setActiveTab] = useState("Home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const category = getCategory(product.categoryId);
      const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
      const matchesSearch =
        query.length === 0 ||
        (product.name + " " + product.description + " " + category.name).toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  function selectCategory(categoryId) {
    setSelectedCategory(categoryId);
    setSearch("");
    setSelectedProduct(null);
    setActiveTab("Home");
  }

  function changeTab(tabId) {
    setSelectedProduct(null);
    setActiveTab(tabId);
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      <ExpoStatusBar style="light" />
      <View style={styles.app}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.screenContent}
          showsVerticalScrollIndicator={false}
        >
          {selectedProduct ? (
            <ProductDetails product={selectedProduct} onBack={() => setSelectedProduct(null)} />
          ) : activeTab === "Categories" ? (
            <CategoriesScreen onSelectCategory={selectCategory} />
          ) : activeTab === "Help" ? (
            <HelpScreen />
          ) : (
            <HomeScreen
              search={search}
              setSearch={setSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              filteredProducts={filteredProducts}
              columns={columns}
              onProductPress={setSelectedProduct}
            />
          )}
          <View style={styles.bottomSpace} />
        </ScrollView>
        {!selectedProduct && <BottomTabs activeTab={activeTab} onTabChange={changeTab} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  app: { flex: 1, backgroundColor: COLORS.background },
  screenContent: { paddingHorizontal: 20, paddingTop: 16 },
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 17,
    marginBottom: 25,
  },
  brandHeaderCompact: { marginBottom: 23 },
  logo: { width: 64, height: 64, borderRadius: 4, marginRight: 13, backgroundColor: COLORS.background },
  brandCopy: { flex: 1 },
  eyebrow: { color: COLORS.goldLight, fontSize: 10, letterSpacing: 1.7, fontWeight: "700" },
  brandTitle: { color: COLORS.white, fontSize: 21, fontWeight: "700", letterSpacing: -0.4, marginTop: 4 },
  goldText: { color: COLORS.goldLight },
  brandSubtitle: { color: COLORS.muted, fontSize: 12, marginTop: 5 },
  homeIntro: { marginBottom: 17 },
  heroTitle: { color: COLORS.white, fontSize: 31, lineHeight: 36, fontWeight: "600", letterSpacing: -0.8, marginTop: 8 },
  bodyCopy: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  searchInput: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    color: COLORS.white,
    backgroundColor: COLORS.surface,
    fontSize: 15,
  },
  chipsRow: { paddingVertical: 14, gap: 8, paddingRight: 16 },
  categoryChip: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  categoryChipSelected: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  categoryChipText: { color: COLORS.muted, fontSize: 12, fontWeight: "600" },
  categoryChipTextSelected: { color: COLORS.ink },
  catalogHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 },
  sectionTitle: { color: COLORS.white, fontSize: 21, fontWeight: "600", marginTop: 4 },
  itemCount: { color: COLORS.dim, fontSize: 12, paddingBottom: 4 },
  productGrid: { gap: 12 },
  productRow: { flexDirection: "row", gap: 12 },
  productCard: { backgroundColor: COLORS.surface, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  productCardGrid: { flex: 1 },
  productCardSingle: { width: "100%" },
  productGridSpacer: { flex: 1 },
  productArt: {
    height: 126,
    backgroundColor: COLORS.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  productTag: {
    position: "absolute",
    top: 10,
    left: 10,
    color: COLORS.goldLight,
    backgroundColor: "#211b10",
    borderColor: "#5b4827",
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: "700",
  },
  productIcon: { color: COLORS.goldLight, fontSize: 48 },
  productCardCopy: { padding: 12 },
  productCategory: { color: COLORS.goldLight, fontSize: 9, fontWeight: "700", letterSpacing: 1.2 },
  productName: { color: COLORS.white, fontSize: 14, lineHeight: 19, fontWeight: "600", marginTop: 6, minHeight: 38 },
  productPrice: { color: COLORS.muted, fontSize: 11, marginTop: 7 },
  productMore: { color: COLORS.goldLight, fontSize: 12, fontWeight: "600", marginTop: 10 },
  sectionHeading: { marginBottom: 19 },
  pageTitle: { color: COLORS.white, fontSize: 28, fontWeight: "600", letterSpacing: -0.5, marginTop: 7 },
  categoryList: { gap: 10 },
  categoryCard: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 11,
    padding: 12,
  },
  categoryIconBox: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: COLORS.surfaceRaised,
    marginRight: 12,
  },
  categoryIcon: { color: COLORS.goldLight, fontSize: 22 },
  categoryCardCopy: { flex: 1 },
  categoryCardTitle: { color: COLORS.white, fontSize: 15, fontWeight: "600" },
  categoryCardDescription: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  chevron: { color: COLORS.goldLight, fontSize: 26, marginLeft: 8 },
  backButton: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", marginBottom: 12 },
  backButtonText: { color: COLORS.goldLight, fontSize: 14, fontWeight: "600" },
  detailArt: { height: 220, borderRadius: 14, overflow: "hidden", marginBottom: 20 },
  detailIcon: { color: COLORS.goldLight, fontSize: 80 },
  detailTitle: { color: COLORS.white, fontSize: 30, lineHeight: 36, fontWeight: "600", marginTop: 8 },
  detailDescription: { color: COLORS.muted, fontSize: 15, lineHeight: 23, marginTop: 10 },
  detailPrice: { color: COLORS.goldLight, fontSize: 15, fontWeight: "600", marginTop: 16 },
  detailList: { gap: 9, marginTop: 17, marginBottom: 22 },
  detailBulletRow: { flexDirection: "row", alignItems: "flex-start" },
  bullet: { color: COLORS.gold, fontSize: 18, marginRight: 9, lineHeight: 20 },
  detailBulletText: { color: COLORS.muted, flex: 1, fontSize: 13, lineHeight: 20 },
  detailActions: { gap: 10, marginTop: 11 },
  actionButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionButtonPrimary: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  actionButtonText: { color: COLORS.white, fontSize: 14, fontWeight: "600", textAlign: "center" },
  actionButtonTextPrimary: { color: COLORS.ink },
  helpCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 17 },
  helpIcon: { color: COLORS.goldLight, fontSize: 23 },
  cardTitle: { color: COLORS.white, fontSize: 17, fontWeight: "600", marginTop: 7 },
  faqEyebrow: { marginTop: 26, marginBottom: 10 },
  faqList: { borderTopWidth: 1, borderTopColor: COLORS.border },
  faqItem: { borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 16 },
  faqQuestionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 15 },
  faqQuestion: { color: COLORS.white, fontSize: 14, fontWeight: "500", flex: 1 },
  faqToggle: { color: COLORS.goldLight, fontSize: 22 },
  faqAnswer: { color: COLORS.muted, fontSize: 13, lineHeight: 20, marginTop: 10 },
  emptyState: { borderWidth: 1, borderStyle: "dashed", borderColor: COLORS.border, borderRadius: 12, padding: 20, marginTop: 12 },
  emptyTitle: { color: COLORS.white, fontSize: 17, fontWeight: "600" },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 5,
  },
  tabButton: { flex: 1, minHeight: 54, alignItems: "center", justifyContent: "center", borderRadius: 9 },
  tabIcon: { color: COLORS.dim, fontSize: 16, lineHeight: 19, marginBottom: 2 },
  tabText: { color: COLORS.dim, fontSize: 11, fontWeight: "600" },
  tabSelected: { color: COLORS.goldLight },
  activeMark: { position: "absolute", top: 0, width: 26, height: 2, borderRadius: 2, backgroundColor: COLORS.gold },
  pressed: { opacity: 0.8 },
  bottomSpace: { height: 14 },
});
