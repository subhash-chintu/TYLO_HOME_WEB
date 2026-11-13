# TYLO HOME catalog CMS setup

The catalog is shared by the Render static website and Expo app. The product editor is served at `/admin.html`. Supabase handles catalog data, admin authentication, and product image storage.

## Project configuration

The Supabase project reference supplied for this work is `cndzoktsttrabjrhdqff`. Its PostgreSQL connection URL included a `[YOUR-PASSWORD]` placeholder, and the connected Supabase account currently cannot access that project. Do not use the connection URL in the browser or mobile app. Once the project is accessible, use its API URL and **publishable** key.

Set these values in a local `.env` file for the web app:

```dotenv
VITE_SUPABASE_URL=https://cndzoktsttrabjrhdqff.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Set the same values in `mobile/.env` with the `EXPO_PUBLIC_` prefix, and add them to the EAS environment for mobile builds.

Never add the PostgreSQL password, `service_role` key, or Supabase secret key to a web or mobile client. The publishable key is public by design; the database policies control its access.

## Database and first administrator

Apply `supabase/migrations/20261113115134_tylo_catalog_cms.sql` to the TYLO HOME project. It creates the product, category, settings, admin-membership, and storage policies and seeds the current sample catalog. All exposed tables have Row Level Security enabled. Public clients can read active/published catalog content. Only accounts listed in `public.cms_admins` can make edits or upload images.

In Supabase Auth, create or invite the owner account and disable public sign-ups. Add that user as the first CMS admin from the SQL Editor:

```sql
insert into public.cms_admins (user_id)
select id from auth.users where email = 'owner@example.com'
on conflict (user_id) do nothing;
```

Use the exact admin email used in Auth. Later admins need both an Auth account and a `cms_admins` row.

## Render deployment

The Render service stays a static site; it does not need Docker or a start command. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the Render service's environment settings. Build command: `npm ci && npm run build`. Publish directory: `dist`.

After the variables are set, redeploy. Sign in at `/admin.html` to manage products, categories, contact details, FAQs, and product photos. Changes appear in the website and mobile app when they next refresh the catalog.
