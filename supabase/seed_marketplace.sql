-- ALSOUK — marketplace demo seed (companies, stores, categories, products, images).
--
-- Purpose: make the marketplace surface feel "alive" (companies, stores,
-- categories and products) after 0002_create_marketplace.sql has been applied.
-- Safe to re-run: every insert is guarded by ON CONFLICT on a natural key.
--
-- Where to run: Supabase → SQL Editor → New query → paste → Run. Run AFTER
-- 0002_create_marketplace.sql. Image URLs point at the bundled /images/*.png
-- assets so products render without configuring Supabase Storage.

begin;

-- 1. Categories (global taxonomy) -------------------------------------------
insert into public.categories (slug, name, description, position) values
  ('food-agriculture', 'Food & Agriculture', 'Dates, olive oil, grains and agri-products.', 1),
  ('textiles-apparel', 'Textiles & Apparel',  'Fabrics, garments and finished textiles.',    2),
  ('leather-footwear', 'Leather & Footwear',  'Leather goods, footwear and accessories.',    3),
  ('ceramics-decor',   'Ceramics & Decor',    'Handmade ceramics, tiles and home decor.',    4),
  ('machinery',        'Machinery & Equipment','Industrial machinery and equipment.',        5)
on conflict (slug) do nothing;

-- 2. Companies ---------------------------------------------------------------
insert into public.companies (slug, name, description, country, city, website, verified) values
  ('sahara-dates',     'Sahara Dates Export',  'Premium Deglet Nour dates, packed for export.',              'Tunisia', 'Tozeur',   'https://example.com/sahara', true),
  ('medina-olive',     'Medina Olive Co.',     'Cold-pressed extra-virgin olive oil producer.',              'Tunisia', 'Sfax',     'https://example.com/medina', true),
  ('carthage-textiles','Carthage Textiles',    'Cotton and technical fabrics for wholesale buyers.',         'Tunisia', 'Monastir', 'https://example.com/carthage', false),
  ('kairouan-leather', 'Kairouan Leather',     'Traditional and modern leather goods manufacturer.',         'Tunisia', 'Kairouan', 'https://example.com/kairouan', true)
on conflict (slug) do nothing;

-- 3. Company ↔ category links ------------------------------------------------
insert into public.company_categories (company_id, category_id)
select c.id, cat.id
from (values
  ('sahara-dates',      'food-agriculture'),
  ('medina-olive',      'food-agriculture'),
  ('carthage-textiles', 'textiles-apparel'),
  ('kairouan-leather',  'leather-footwear')
) as m(company_slug, category_slug)
join public.companies c   on c.slug   = m.company_slug
join public.categories cat on cat.slug = m.category_slug
on conflict (company_id, category_id) do nothing;

-- 4. Stores (one storefront per company) ------------------------------------
insert into public.stores (company_id, name, slug, tagline, description, is_active)
select c.id, s.name, s.slug, s.tagline, s.description, true
from (values
  ('sahara-dates',      'Sahara Dates Store',   'sahara-dates-store',     'Export-grade Tunisian dates',      'Deglet Nour and Medjool dates, bulk and retail packs.'),
  ('medina-olive',      'Medina Olive Store',   'medina-olive-store',     'Extra-virgin, cold-pressed',       'Single-origin olive oil in tins, bottles and bulk.'),
  ('carthage-textiles', 'Carthage Fabrics',     'carthage-fabrics',       'Cotton & technical fabrics',       'Rolls and cut fabric for garment manufacturers.'),
  ('kairouan-leather',  'Kairouan Leather Shop','kairouan-leather-shop',  'Handcrafted leather goods',        'Bags, belts and footwear made to order.')
) as s(company_slug, name, slug, tagline, description)
join public.companies c on c.slug = s.company_slug
on conflict (slug) do nothing;

-- 5. Products ----------------------------------------------------------------
insert into public.products
  (store_id, company_id, name, slug, description, price, currency, min_order_quantity, unit, is_active)
select st.id, st.company_id, p.name, p.slug, p.description,
       p.price, 'USD', p.moq, p.unit, true
from (values
  ('sahara-dates-store',    'Deglet Nour Dates 5kg',      'deglet-nour-5kg',      'Premium branched Deglet Nour dates, 5kg carton.',        18.00, 500, 'carton'),
  ('sahara-dates-store',    'Pitted Dates 10kg',          'pitted-dates-10kg',    'Machine-pitted dates for industrial use, 10kg.',         30.00, 200, 'carton'),
  ('medina-olive-store',    'Extra Virgin Olive Oil 1L',  'evoo-1l',              'Cold-pressed EVOO, acidity < 0.3%, 1L bottle.',           6.50, 1000, 'bottle'),
  ('medina-olive-store',    'Olive Oil Bulk 200L',        'evoo-bulk-200l',       'Bulk extra-virgin olive oil, 200L food-grade drum.',   900.00,   5, 'drum'),
  ('carthage-fabrics',      'Combed Cotton Fabric',       'combed-cotton',        '180gsm combed cotton, natural, per meter roll.',          2.20, 3000, 'meter'),
  ('kairouan-leather-shop', 'Full-Grain Leather Bag',     'fullgrain-bag',        'Handmade full-grain leather satchel.',                    45.00,  50, 'unit')
) as p(store_slug, name, slug, description, price, moq, unit)
join public.stores st on st.slug = p.store_slug
on conflict (store_id, slug) do nothing;

-- 6. Product images (primary) ------------------------------------------------
insert into public.product_images (product_id, storage_path, url, alt, position, is_primary)
select pr.id, i.path, i.url, pr.name, 0, true
from (values
  ('deglet-nour-5kg',   'seed/product-dates.png',    '/images/product-dates.png'),
  ('pitted-dates-10kg', 'seed/product-dates.png',    '/images/product-dates.png'),
  ('evoo-1l',           'seed/product-oliveoil.png', '/images/product-oliveoil.png'),
  ('evoo-bulk-200l',    'seed/product-oliveoil.png', '/images/product-oliveoil.png'),
  ('combed-cotton',     'seed/product-textiles.png', '/images/product-textiles.png'),
  ('fullgrain-bag',     'seed/product-leather.png',  '/images/product-leather.png')
) as i(product_slug, path, url)
join public.products pr on pr.slug = i.product_slug
where not exists (
  select 1 from public.product_images ex where ex.product_id = pr.id and ex.is_primary
);

-- 7. Product ↔ category links ------------------------------------------------
insert into public.product_categories (product_id, category_id)
select pr.id, cat.id
from (values
  ('deglet-nour-5kg',   'food-agriculture'),
  ('pitted-dates-10kg', 'food-agriculture'),
  ('evoo-1l',           'food-agriculture'),
  ('evoo-bulk-200l',    'food-agriculture'),
  ('combed-cotton',     'textiles-apparel'),
  ('fullgrain-bag',     'leather-footwear')
) as m(product_slug, category_slug)
join public.products pr    on pr.slug  = m.product_slug
join public.categories cat on cat.slug = m.category_slug
on conflict (product_id, category_id) do nothing;

commit;
