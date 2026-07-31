-- ALSOUK — Add company_id reference to RFQs and business entities
-- This prepares for future multi-user company management and decouples user ownership.

-- 1. Alter public.rfqs table to add company_id column if it doesn't exist
alter table public.rfqs add column if not exists company_id uuid references public.companies(id) on delete set null;

-- Create index for performance
create index if not exists rfqs_company_id_idx on public.rfqs (company_id);
