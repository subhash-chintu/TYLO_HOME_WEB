import { isSupabaseConfigured, supabase } from "./lib/supabaseClient.js";

const loginPanel = document.getElementById("login-panel");
const dashboard = document.getElementById("dashboard");
const loginMessage = document.getElementById("login-message");
const dashboardMessage = document.getElementById("dashboard-message");
const productDialog = document.getElementById("product-dialog");
const productForm = document.getElementById("product-form");
let currentUser = null;
let categories = [];
let products = [];
let storeSettings = {};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function uniqueToken() {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function slugify(value) {
  return String(value).normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `product-${uniqueToken()}`;
}

function setMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? "#ffaaa0" : "var(--gold-light)";
}

function categoryLabel(id) {
  return categories.find((category) => category.id === id)?.name || "(missing category)";
}

function showLogin() {
  currentUser = null;
  loginPanel.hidden = false;
  dashboard.hidden = true;
}

async function handleSession(session) {
  if (!session?.user) {
    showLogin();
    return;
  }
  const { data, error } = await supabase.from("cms_admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
  if (error || !data) {
    setMessage(loginMessage, "This account is not on the store admin list. Ask the owner to grant access.", true);
    await supabase.auth.signOut();
    showLogin();
    return;
  }
  currentUser = session.user;
  loginPanel.hidden = true;
  dashboard.hidden = false;
  document.getElementById("signed-in-as").textContent = currentUser.email || "Signed in";
  await loadDashboard();
}

async function loadDashboard() {
  setMessage(dashboardMessage, "Loading store content…");
  const [categoryResult, productResult, settingsResult] = await Promise.all([
    supabase.from("categories").select("id,name,description,icon,sort_order,is_active").order("sort_order").order("name"),
    supabase.from("products").select("id,slug,name,category_id,description,details,image_url,icon,label,price_text,amazon_url,flipkart_url,is_published,sort_order").order("sort_order").order("name"),
    supabase.from("site_settings").select("*").eq("id", "main").maybeSingle(),
  ]);
  const failure = categoryResult.error || productResult.error || settingsResult.error;
  if (failure) {
    setMessage(dashboardMessage, failure.message, true);
    return;
  }
  categories = categoryResult.data || [];
  products = productResult.data || [];
  storeSettings = settingsResult.data || {};
  renderProducts();
  renderCategories();
  renderCategoryOptions();
  populateSettings();
  setMessage(dashboardMessage, "Changes are saved directly to the catalog.");
}

function renderProducts() {
  const tbody = document.getElementById("products-table");
  tbody.innerHTML = products.length ? products.map((product) => `
    <tr><td><strong>${escapeHtml(product.name)}</strong>${product.image_url ? "<br><small>Photo added</small>" : ""}</td>
    <td>${escapeHtml(categoryLabel(product.category_id))}</td><td>${escapeHtml(product.price_text)}</td>
    <td>${product.is_published ? "Published" : "Hidden"}</td>
    <td><div class="row-actions"><button class="button" type="button" data-edit-product="${escapeHtml(product.id)}">Edit</button><button class="button danger" type="button" data-delete-product="${escapeHtml(product.id)}">Delete</button></div></td></tr>
  `).join("") : `<tr><td colspan="5" class="muted">No products yet. Add a product to start your catalog.</td></tr>`;
  tbody.querySelectorAll("[data-edit-product]").forEach((button) => button.addEventListener("click", () => openProductForm(products.find((p) => p.id === button.dataset.editProduct))));
  tbody.querySelectorAll("[data-delete-product]").forEach((button) => button.addEventListener("click", () => deleteProduct(button.dataset.deleteProduct)));
}

function renderCategories() {
  const root = document.getElementById("category-list");
  root.innerHTML = categories.length ? categories.map((category) => `
    <div class="category-row"><div><strong>${escapeHtml(category.icon)} ${escapeHtml(category.name)} ${category.is_active ? "" : "(hidden)"}</strong><small>${escapeHtml(category.description)}</small></div>
    <div class="row-actions"><button class="button" type="button" data-edit-category="${escapeHtml(category.id)}">Edit</button><button class="button danger" type="button" data-delete-category="${escapeHtml(category.id)}">Delete</button></div></div>
  `).join("") : `<p class="muted">No categories yet.</p>`;
  root.querySelectorAll("[data-edit-category]").forEach((button) => button.addEventListener("click", () => editCategory(button.dataset.editCategory)));
  root.querySelectorAll("[data-delete-category]").forEach((button) => button.addEventListener("click", () => deleteCategory(button.dataset.deleteCategory)));
}

function renderCategoryOptions(selected = "") {
  const select = productForm.elements.category_id;
  const options = categories.filter((category) => category.is_active || category.id === selected);
  select.innerHTML = options.map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`).join("");
  if (selected) select.value = selected;
}

function openProductForm(product = null) {
  productForm.reset();
  productForm.elements.id.value = product?.id || "";
  productForm.elements.image_url.value = product?.image_url || "";
  productForm.elements.name.value = product?.name || "";
  renderCategoryOptions(product?.category_id || categories.find((c) => c.is_active)?.id || "");
  productForm.elements.description.value = product?.description || "";
  productForm.elements.details.value = (product?.details || []).join("\n");
  productForm.elements.price_text.value = product?.price_text || "Ask for price";
  productForm.elements.label.value = product?.label || "";
  productForm.elements.amazon_url.value = product?.amazon_url || "";
  productForm.elements.flipkart_url.value = product?.flipkart_url || "";
  productForm.elements.is_published.checked = product ? product.is_published : true;
  document.getElementById("product-form-title").textContent = product ? "Edit product" : "Add product";
  productDialog.showModal();
}

async function uploadPhoto(file) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be 8 MB or smaller.");
  const extension = file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${uniqueToken()}.${extension}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

async function saveProduct(event) {
  event.preventDefault();
  const form = productForm;
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  setMessage(dashboardMessage, "Saving product…");
  try {
    const photo = form.elements.image.files[0];
    const uploadedUrl = await uploadPhoto(photo);
    const name = form.elements.name.value.trim();
    const payload = {
      slug: slugify(name),
      name,
      category_id: form.elements.category_id.value,
      description: form.elements.description.value.trim(),
      details: form.elements.details.value.split("\n").map((value) => value.trim()).filter(Boolean),
      image_url: uploadedUrl || form.elements.image_url.value || null,
      icon: "◈",
      label: form.elements.label.value.trim(),
      price_text: form.elements.price_text.value.trim() || "Ask for price",
      amazon_url: form.elements.amazon_url.value.trim() || null,
      flipkart_url: form.elements.flipkart_url.value.trim() || null,
      is_published: form.elements.is_published.checked,
      updated_at: new Date().toISOString(),
    };
    const id = form.elements.id.value;
    const result = id
      ? await supabase.from("products").update(payload).eq("id", id)
      : await supabase.from("products").insert(payload);
    if (result.error) throw result.error;
    productDialog.close();
    await loadDashboard();
    setMessage(dashboardMessage, "Product saved. The website and app will show the update on their next refresh.");
  } catch (error) {
    setMessage(dashboardMessage, error.message || "Could not save product.", true);
  } finally {
    button.disabled = false;
  }
}

async function deleteProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product || !window.confirm(`Delete ${product.name}?`)) return;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) setMessage(dashboardMessage, error.message, true);
  else { await loadDashboard(); setMessage(dashboardMessage, "Product deleted."); }
}

function clearCategoryForm() {
  const form = document.getElementById("category-form");
  form.reset();
  form.elements.id.value = "";
  form.elements.icon.value = "◈";
  form.elements.sort_order.value = String((categories.length + 1) * 10);
  form.elements.is_active.checked = true;
  document.getElementById("cancel-category").hidden = true;
}

function editCategory(id) {
  const category = categories.find((item) => item.id === id);
  if (!category) return;
  const form = document.getElementById("category-form");
  form.elements.id.value = category.id;
  form.elements.name.value = category.name;
  form.elements.description.value = category.description;
  form.elements.icon.value = category.icon;
  form.elements.sort_order.value = category.sort_order;
  form.elements.is_active.checked = category.is_active;
  document.getElementById("cancel-category").hidden = false;
}

async function saveCategory(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const id = form.elements.id.value || slugify(form.elements.name.value);
  const payload = {
    id,
    name: form.elements.name.value.trim(),
    description: form.elements.description.value.trim(),
    icon: form.elements.icon.value.trim() || "◈",
    sort_order: Number(form.elements.sort_order.value) || 0,
    is_active: form.elements.is_active.checked,
    updated_at: new Date().toISOString(),
  };
  const result = form.elements.id.value
    ? await supabase.from("categories").update(payload).eq("id", form.elements.id.value)
    : await supabase.from("categories").insert(payload);
  if (result.error) setMessage(dashboardMessage, result.error.message, true);
  else { clearCategoryForm(); await loadDashboard(); setMessage(dashboardMessage, "Category saved."); }
}

async function deleteCategory(id) {
  const category = categories.find((item) => item.id === id);
  if (!category || !window.confirm(`Delete category ${category.name}? It cannot be deleted while products use it.`)) return;
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) setMessage(dashboardMessage, error.message, true);
  else { await loadDashboard(); setMessage(dashboardMessage, "Category deleted."); }
}

function populateSettings() {
  const form = document.getElementById("settings-form");
  form.elements.whatsapp_business_number.value = storeSettings.whatsapp_business_number || "";
  form.elements.contact_email.value = storeSettings.contact_email || "";
  form.elements.brand_tagline.value = storeSettings.brand_tagline || "";
  form.elements.faqs.value = (storeSettings.faqs || []).map((faq) => `${faq.question} | ${faq.answer}`).join("\n");
}

async function saveSettings(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const faqs = form.elements.faqs.value.split("\n").map((line) => {
    const separator = line.indexOf("|");
    return separator < 0 ? null : { question: line.slice(0, separator).trim(), answer: line.slice(separator + 1).trim() };
  }).filter((faq) => faq?.question && faq?.answer);
  const number = form.elements.whatsapp_business_number.value.replace(/\D/g, "");
  const payload = {
    id: "main",
    whatsapp_business_number: number || null,
    contact_email: form.elements.contact_email.value.trim() || null,
    brand_tagline: form.elements.brand_tagline.value.trim(),
    faqs,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "id" });
  if (error) setMessage(dashboardMessage, error.message, true);
  else { storeSettings = payload; setMessage(dashboardMessage, "Store settings saved."); }
}

if (!isSupabaseConfigured) {
  document.getElementById("setup-notice").hidden = false;
  document.getElementById("setup-notice").textContent = "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the local .env file and Render environment settings, then run the catalog database migration.";
  document.querySelectorAll("#login-form input,#login-form button").forEach((element) => { element.disabled = true; });
} else {
  document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    setMessage(loginMessage, "Signing in…");
    const { data, error } = await supabase.auth.signInWithPassword({ email: form.elements.email.value.trim(), password: form.elements.password.value });
    button.disabled = false;
    if (error) setMessage(loginMessage, error.message, true);
    else await handleSession(data.session);
  });
  supabase.auth.onAuthStateChange((_event, session) => queueMicrotask(() => handleSession(session)));
  supabase.auth.getSession().then(({ data }) => handleSession(data.session));
}

document.getElementById("sign-out").addEventListener("click", async () => { await supabase?.auth.signOut(); showLogin(); });
document.getElementById("add-product").addEventListener("click", () => openProductForm());
document.getElementById("close-product").addEventListener("click", () => productDialog.close());
document.getElementById("cancel-product").addEventListener("click", () => productDialog.close());
productForm.addEventListener("submit", saveProduct);
document.getElementById("category-form").addEventListener("submit", saveCategory);
document.getElementById("cancel-category").addEventListener("click", clearCategoryForm);
document.getElementById("settings-form").addEventListener("submit", saveSettings);
document.querySelectorAll(".admin-tabs .tab").forEach((tab) => tab.addEventListener("click", () => {
  document.querySelectorAll(".admin-tabs .tab").forEach((item) => item.classList.toggle("active", item === tab));
  document.querySelectorAll(".admin-panel").forEach((panel) => { panel.hidden = panel.id !== tab.dataset.panel; });
}));
