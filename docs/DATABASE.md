# ALSOUK Database

## Database
- Supabase PostgreSQL

## Main Tables
- profiles
- companies
- suppliers
- categories
- products
- rfq_requests
- messages

## Relationships
- User → Company
- Company → Products
- Company → RFQs
- Category → Products
- Supplier → Company

## Security
- Row Level Security (RLS)
- Auth via Supabase Auth
- Public read where appropriate
- Protected write operations

## Migrations
- 0001 Initial schema
- 0002 Initial data improvements
- 0003 Fix companies.owner_id

## Notes
- UUID primary keys
- Foreign keys enforced
- Indexed lookup columns
