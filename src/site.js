import { fetchPublicCatalog, isSupabaseConfigured } from "./lib/supabaseClient.js";

const grid = document.getElementById("product-grid");
const filters = document.getElementById("filters");
const search = document.getElementById("search");
let products = [];
let categories = [];
let settings = {};
let activeCategory = "all";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function safeUrl(value, fallback = "#") {
  if (!value) return fallback;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : fallback;
  } catch {
    return fallback;
  }
}

function whatsAppUrl(message) {
  const number = String(settings.whatsapp_business_number || "").replace(/\D/g, "");
  return number.length >= 10 ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : "#contact";
}

function categoryName(id) {
  return categories.find((category) => category.id === id)?.name || "Home essentials";
}

function renderFilters() {
  const items = [{ id: "all", name: "All products" }, ...categories];
  filters.innerHTML = items.map((category) => `
    <button class="filter ${category.id === activeCategory ? "active" : ""}" type="button" aria-pressed="${category.id === activeCategory}" data-category="${escapeHtml(category.id)}">${escapeHtml(category.name)}</button>
  `).join("");
  filters.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    renderFilters();
    renderProducts();
  }));
}

function productImage(product) {
  return product.image_url
    ? `<img class="product-photo" src="${escapeHtml(safeUrl(product.image_url))}" alt="${escapeHtml(product.name)}" loading="lazy" />`
    : `<span aria-hidden="true">${escapeHtml(product.icon || "◈")}</span>`;
}

function renderProducts() {
  const query = search.value.trim().toLowerCase();
  const shown = products.filter((product) =>
    (activeCategory === "all" || product.category_id === activeCategory) &&
    `${product.name} ${categoryName(product.category_id)} ${product.description}`.toLowerCase().includes(query)
  );
  document.getElementById("count").textContent = `${shown.length} ${shown.length === 1 ? "ITEM" : "ITEMS"}`;
  grid.innerHTML = shown.length ? shown.map((product) => {
    const query = encodeURIComponent(product.name);
    const amazon = safeUrl(product.amazon_url, `https://www.amazon.in/s?k=${query}`);
    const flipkart = safeUrl(product.flipkart_url, `https://www.flipkart.com/search?q=${query}`);
    const message = `Hi, I'm interested in ${product.name}. Please share details about price, availability, and customization.`;
    return `<article class="card">
      <div class="product-art">${product.label ? `<span class="tag">${escapeHtml(product.label)}</span>` : ""}${productImage(product)}</div>
      <div class="card-body"><div class="card-meta"><span>${escapeHtml(categoryName(product.category_id))}</span><span>Home essentials</span></div>
      <h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description)}</p><div class="price">${escapeHtml(product.price_text || "Ask for price")}</div>
      <div class="card-actions"><a class="button" href="${escapeHtml(amazon)}" target="_blank" rel="noopener noreferrer">View on Amazon ↗</a>
      <a class="button" href="${escapeHtml(flipkart)}" target="_blank" rel="noopener noreferrer">View on Flipkart ↗</a>
      <a class="button primary custom" href="${escapeHtml(whatsAppUrl(message))}" target="_blank" rel="noopener noreferrer">Custom order on WhatsApp</a></div></div></article>`;
  }).join("") : `<div class="empty">No products are available yet, or none match that search.</div>`;
}

function renderSettings() {
  if (settings.brand_tagline) document.querySelector(".hero-layout p").textContent = settings.brand_tagline;
  if (settings.logo_url) document.querySelector(".hero-logo").src = safeUrl(settings.logo_url, "Logo.jpeg");
  const faqRoot = document.getElementById("faq-list");
  if (faqRoot && Array.isArray(settings.faqs) && settings.faqs.length) {
    faqRoot.innerHTML = settings.faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join("");
  }
  document.querySelectorAll(".whatsapp-contact").forEach((link) => {
    link.href = whatsAppUrl("Hi, I have a question about your kitchen and home products.");
  });
}

async function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  document.querySelectorAll(".whatsapp-contact").forEach((link) => {
    link.href = whatsAppUrl("Hi, I have a question about your kitchen and home products.");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
  search.addEventListener("input", renderProducts);
  if (!isSupabaseConfigured) {
    document.getElementById("catalog-status").textContent = "The catalog is waiting for its Supabase project settings.";
    return;
  }
  document.getElementById("catalog-status").textContent = "Loading catalog…";
  try {
    ({ products, categories, settings } = await fetchPublicCatalog());
    renderSettings();
    renderFilters();
    renderProducts();
    document.getElementById("catalog-status").textContent = "";
  } catch (error) {
    console.error("Catalog load failed", error);
    document.getElementById("catalog-status").textContent = "The catalog could not be loaded. Please try again shortly.";
  }
}

init();
