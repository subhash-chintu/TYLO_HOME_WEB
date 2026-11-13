create table public.categories (
  id text primary key,
  name text not null,
  description text not null default '',
  icon text not null default '◈',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_id text not null references public.categories(id) on update cascade on delete restrict,
  description text not null default '',
  details text[] not null default '{}',
  image_url text,
  icon text not null default '◈',
  label text not null default '',
  price_text text not null default 'Ask for price',
  amazon_url text,
  flipkart_url text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id text primary key default 'main' check (id = 'main'),
  whatsapp_business_number text,
  contact_email text,
  brand_tagline text not null default 'Thoughtful details for everyday spaces.',
  logo_url text,
  faqs jsonb not null default '[]'::jsonb check (jsonb_typeof(faqs) = 'array'),
  updated_at timestamptz not null default now()
);

create table public.cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index products_public_order_idx on public.products (sort_order, name) where is_published;
create index products_category_idx on public.products (category_id, sort_order);
create index categories_active_order_idx on public.categories (sort_order, name) where is_active;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.cms_admins enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.site_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.site_settings to authenticated;
grant select on public.cms_admins to authenticated;
revoke all on public.cms_admins from anon;

create policy "public reads active categories"
  on public.categories for select to anon, authenticated
  using (is_active);
create policy "cms admins read all categories"
  on public.categories for select to authenticated
  using (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
create policy "cms admins insert categories"
  on public.categories for insert to authenticated
  with check (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
create policy "cms admins update categories"
  on public.categories for update to authenticated
  using (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
create policy "cms admins delete categories"
  on public.categories for delete to authenticated
  using (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));

create policy "public reads published products"
  on public.products for select to anon, authenticated
  using (is_published);
create policy "cms admins read all products"
  on public.products for select to authenticated
  using (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
create policy "cms admins insert products"
  on public.products for insert to authenticated
  with check (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
create policy "cms admins update products"
  on public.products for update to authenticated
  using (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
create policy "cms admins delete products"
  on public.products for delete to authenticated
  using (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));

create policy "public reads main site settings"
  on public.site_settings for select to anon, authenticated
  using (id = 'main');
create policy "cms admins read site settings"
  on public.site_settings for select to authenticated
  using (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
create policy "cms admins insert site settings"
  on public.site_settings for insert to authenticated
  with check (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
create policy "cms admins update site settings"
  on public.site_settings for update to authenticated
  using (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));

create policy "cms admins read their own membership"
  on public.cms_admins for select to authenticated
  using (user_id = (select auth.uid()));

insert into public.categories (id, name, description, icon, sort_order) values
  ('taps', 'Taps', 'Kitchen and bathroom taps', '♧', 10),
  ('sinks', 'Sinks', 'Kitchen sinks and bowls', '▱', 20),
  ('basins', 'Basins', 'Countertop and wall basins', '◒', 30),
  ('tiles', 'Tiles', 'Tiles and surface finishes', '▦', 40),
  ('granite', 'Granite', 'Natural stone and cut-to-size', '⬛', 50),
  ('adhesives', 'Adhesives', 'Adhesives and installation essentials', '▤', 60),
  ('custom', 'Custom work', 'Made-to-measure pieces', '✳', 70)
on conflict (id) do nothing;

insert into public.products (slug, name, category_id, description, details, icon, label, price_text, is_published, sort_order) values
  ('arc-pull-down-tap', 'Arc Pull-Down Tap', 'taps', 'A clean, practical tap for a modern kitchen. Ask us about finish and installation options.', array['Kitchen fitting', 'Multiple finishes available', 'Ask for current availability'], '🚰', 'Popular', 'Ask for price', true, 10),
  ('undermount-kitchen-sink', 'Undermount Kitchen Sink', 'sinks', 'A deep-bowl sink designed to sit neatly below the countertop.', array['Stainless steel', 'Multiple bowl sizes', 'Ask about cut-out dimensions'], '▱', 'Kitchen', 'Ask for price', true, 20),
  ('stone-counter-basin', 'Stone Counter Basin', 'basins', 'A natural-stone look for a statement bathroom counter.', array['Countertop installation', 'Stone pattern may vary', 'Custom options by enquiry'], '◒', 'Custom', 'Ask for price', true, 30),
  ('textured-wall-tile', 'Textured Wall Tile', 'tiles', 'A subtle textured finish for kitchen backsplashes and bathroom walls.', array['Matte finish', 'Multiple sizes and designs', 'Confirm stock before ordering'], '▦', 'Surfaces', 'Ask for price', true, 40),
  ('black-granite-slab', 'Black Granite Slab', 'granite', 'Natural granite for counters, ledges, and custom-cut surfaces.', array['Natural stone', 'Cut-to-size options', 'Pattern varies by slab'], '⬛', 'Natural stone', 'Ask for price', true, 50),
  ('tile-adhesive', 'Tile Adhesive', 'adhesives', 'An installation essential for tile projects. Contact us for product and coverage details.', array['Ask for product specifications', 'Coverage depends on surface and application', 'Availability varies'], '▧', 'Installation', 'Ask for price', true, 60),
  ('made-to-measure-vanity', 'Made-to-Measure Vanity', 'custom', 'A custom bathroom vanity planned around your measurements and preferred finish.', array['Made to order', 'Share measurements and reference photos', 'Final quote confirmed by our team'], '▤', 'Made to order', 'Ask for price', true, 70),
  ('sanitary-shower-set', 'Sanitary Shower Set', 'taps', 'A coordinated shower fitting set for a simple, refined bathroom update.', array['Bathroom fitting', 'Finish options available', 'Ask about compatibility'], '◉', 'Bathroom', 'Ask for price', true, 80)
on conflict (slug) do nothing;

insert into public.site_settings (id, whatsapp_business_number, contact_email, faqs)
values ('main', null, null, '[
  {"question":"How do custom orders work?","answer":"Send us the product name, measurements, finish, and reference photos. We will confirm what can be made and share the quote."},
  {"question":"Where can I buy a listed product?","answer":"Use the marketplace buttons on each product to visit its Amazon or Flipkart listing. Availability is managed by the marketplace."},
  {"question":"Can products be made in a different size or finish?","answer":"Message us with the product name, measurements, and preferred finish so we can confirm customization options."}
]'
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads product images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');
create policy "cms admins upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
create policy "cms admins update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())))
  with check (bucket_id = 'product-images' and exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
create policy "cms admins delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and exists (select 1 from public.cms_admins a where a.user_id = (select auth.uid())));
