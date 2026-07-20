-- ALSOUK — seed data for the supplier directory.
-- Mirrors the bundled fallback dataset in lib/directory-data.ts so a fresh
-- Supabase project renders the same suppliers. Safe to re-run (upsert).
-- Run after supabase/schema.sql.

insert into public.suppliers
  (id, name, monogram, logo_color, country, city_key, region, verified, rating, reviews, products, years, response_rate, min_moq, business_types, categories)
values
  ('medina-olive', 'Medina Olive Co.', 'MO', 'green', 'tn', 'sfax', 'coastal', true, 4.9, 312, 148, 8, 98, 500, ARRAY['manufacturer', 'exporter']::text[], ARRAY['food', 'cosmetics']::text[]),
  ('carthage-textiles', 'Carthage Textiles', 'CT', 'blue', 'tn', 'monastir', 'coastal', true, 4.8, 268, 512, 12, 96, 1000, ARRAY['manufacturer', 'wholesaler']::text[], ARRAY['textiles', 'leather']::text[]),
  ('atlas-ceramics', 'Atlas Ceramics', 'AC', 'green', 'tn', 'nabeul', 'capital', true, 4.7, 154, 96, 6, 94, 200, ARRAY['manufacturer', 'supplier']::text[], ARRAY['handicrafts', 'construction']::text[]),
  ('sahara-dates', 'Sahara Dates Export', 'SD', 'green', 'tn', 'tozeur', 'south', true, 5, 421, 64, 10, 99, 1000, ARRAY['exporter', 'wholesaler']::text[], ARRAY['food']::text[]),
  ('kairouan-leather', 'Kairouan Leather', 'KL', 'blue', 'tn', 'kairouan', 'central', true, 4.6, 189, 233, 15, 92, 100, ARRAY['manufacturer', 'exporter']::text[], ARRAY['leather']::text[]),
  ('tunis-metalworks', 'Tunis Metalworks', 'TM', 'blue', 'tn', 'tunis', 'capital', false, 4.4, 87, 178, 4, 88, 50, ARRAY['manufacturer', 'supplier']::text[], ARRAY['machinery', 'chemicals']::text[]),
  ('atlas-argan', 'Atlas Argan Group', 'AA', 'green', 'ma', 'casablanca', 'coastal', true, 4.9, 376, 122, 11, 97, 300, ARRAY['manufacturer', 'exporter']::text[], ARRAY['cosmetics', 'food']::text[]),
  ('marrakech-crafts', 'Marrakech Crafts House', 'MC', 'blue', 'ma', 'marrakech', 'central', true, 4.7, 204, 640, 9, 93, 100, ARRAY['wholesaler', 'supplier']::text[], ARRAY['handicrafts', 'textiles']::text[]),
  ('sahel-industries', 'Sahel Industries', 'SI', 'blue', 'dz', 'algiers', 'capital', true, 4.5, 132, 289, 18, 90, 500, ARRAY['manufacturer']::text[], ARRAY['chemicals', 'construction']::text[]),
  ('oran-agrifoods', 'Oran AgriFoods', 'OA', 'green', 'dz', 'oran', 'coastal', false, 4.3, 76, 54, 3, 85, 1000, ARRAY['supplier', 'wholesaler']::text[], ARRAY['food']::text[]),
  ('nile-cotton', 'Nile Cotton Mills', 'NC', 'blue', 'eg', 'cairo', 'capital', true, 4.8, 512, 431, 22, 95, 2000, ARRAY['manufacturer', 'exporter', 'wholesaler']::text[], ARRAY['textiles']::text[]),
  ('delta-machinery', 'Delta Machinery Co.', 'DM', 'blue', 'eg', 'alexandria', 'coastal', true, 4.6, 168, 205, 14, 91, 10, ARRAY['manufacturer', 'supplier']::text[], ARRAY['machinery']::text[]),
  ('tripoli-build', 'Tripoli BuildTech', 'TB', 'green', 'ly', 'tripoli', 'coastal', false, 4.2, 49, 88, 5, 82, 200, ARRAY['supplier', 'wholesaler']::text[], ARRAY['construction']::text[]),
  ('benghazi-chem', 'Benghazi Chemicals', 'BC', 'blue', 'ly', 'benghazi', 'coastal', true, 4.5, 103, 141, 7, 89, 500, ARRAY['manufacturer']::text[], ARRAY['chemicals', 'cosmetics']::text[]);
on conflict (id) do update set
  name = excluded.name,
  monogram = excluded.monogram,
  logo_color = excluded.logo_color,
  country = excluded.country,
  city_key = excluded.city_key,
  region = excluded.region,
  verified = excluded.verified,
  rating = excluded.rating,
  reviews = excluded.reviews,
  products = excluded.products,
  years = excluded.years,
  response_rate = excluded.response_rate,
  min_moq = excluded.min_moq,
  business_types = excluded.business_types,
  categories = excluded.categories;
