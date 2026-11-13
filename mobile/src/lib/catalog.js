import { isSupabaseConfigured, supabase } from "./supabase";

export async function fetchPublicCatalog() {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured yet.");
  const [categoryResult, productResult, settingsResult] = await Promise.all([
    supabase.from("categories").select("id,name,description,icon,sort_order").eq("is_active", true).order("sort_order").order("name"),
    supabase.from("products").select("id,slug,name,category_id,description,details,image_url,icon,label,price_text,amazon_url,flipkart_url,sort_order").eq("is_published", true).order("sort_order").order("name"),
    supabase.from("site_settings").select("whatsapp_business_number,contact_email,brand_tagline,logo_url,faqs").eq("id", "main").maybeSingle(),
  ]);
  if (categoryResult.error) throw categoryResult.error;
  if (productResult.error) throw productResult.error;
  if (settingsResult.error) throw settingsResult.error;
  return {
    categories: (categoryResult.data || []).map((category) => ({ ...category })),
    products: (productResult.data || []).map((product) => ({
      ...product,
      categoryId: product.category_id,
      imageUrl: product.image_url,
      priceText: product.price_text,
      amazonUrl: product.amazon_url,
      flipkartUrl: product.flipkart_url,
    })),
    settings: settingsResult.data || {},
  };
}
