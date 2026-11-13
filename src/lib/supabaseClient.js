import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  url && publishableKey && !url.includes("your-project-ref") && publishableKey.startsWith("sb_publishable_")
);

export const supabase = isSupabaseConfigured
  ? createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function fetchPublicCatalog() {
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const [categoryResult, productResult, settingsResult] = await Promise.all([
    supabase.from("categories").select("id,name,description,icon,sort_order").eq("is_active", true).order("sort_order").order("name"),
    supabase.from("products").select("id,slug,name,category_id,description,details,image_url,icon,label,price_text,amazon_url,flipkart_url,sort_order").eq("is_published", true).order("sort_order").order("name"),
    supabase.from("site_settings").select("whatsapp_business_number,contact_email,brand_tagline,logo_url,faqs").eq("id", "main").maybeSingle(),
  ]);
  if (categoryResult.error) throw categoryResult.error;
  if (productResult.error) throw productResult.error;
  if (settingsResult.error) throw settingsResult.error;
  return { categories: categoryResult.data || [], products: productResult.data || [], settings: settingsResult.data || {} };
}
