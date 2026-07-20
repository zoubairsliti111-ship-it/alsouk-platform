-- ALSOUK — sample supplier rows for a fresh Supabase project.
-- Mirrors the production data so a new environment renders the same directory.
-- Run after schema.sql. Values match the columns the app reads (see
-- lib/supabase/suppliers-service.ts).

insert into public.suppliers
  (company_name, description, country, city, category, business_type, years_in_business, verified, rating, response_rate, reviews, products, min_moq, region, monogram, logo_color)
values
  ('Atlas Ceramics', 'Ceramic products manufacturer', 'Tunisia', 'Nabeul', 'construction', 'manufacturer', 6, true, 4.7, 94, 154, 96, 200, 'capital', 'AC', 'green'),
  ('Carthage Textiles', 'Textile manufacturer and exporter', 'Tunisia', 'Monastir', 'textiles', 'manufacturer', 12, true, 4.8, 96, 268, 512, 1000, 'coastal', 'CT', 'blue'),
  ('Kairouan Leather', 'Leather products', 'Tunisia', 'Kairouan', 'leather', 'manufacturer', 15, true, 4.6, 92, 189, 233, 100, 'central', 'KL', 'blue'),
  ('Medina Olive Co.', 'Premium olive oil manufacturer', 'Tunisia', 'Sfax', 'food', 'manufacturer', 8, true, 4.9, 98, 312, 148, 500, 'coastal', 'MO', 'green'),
  ('Sahara Dates Export', 'Dates exporter', 'Tunisia', 'Tozeur', 'food', 'exporter', 10, true, 5, 99, 421, 64, 1000, 'south', 'SD', 'green'),
  ('Tunis Metalworks', 'Industrial metal products', 'Tunisia', 'Tunis', 'machinery', 'manufacturer', 4, false, 4.4, 88, 87, 178, 50, 'capital', 'TM', 'blue');
