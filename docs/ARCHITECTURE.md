# ALSOUK Architecture

## Overview
- Next.js App Router
- TypeScript
- Supabase
- Vercel
- GitHub

## Folder Structure
app/
components/
lib/
supabase/
docs/

## UI Philosophy
- Mobile-first
- UI-first
- Alibaba × TikTok Discovery
- RTL/LTR support

## Data Flow
Supabase → Server Components → UI Components

## Deployment
GitHub → Vercel
Supabase → PostgreSQL

## Rules
- Keep UI components reusable.
- No duplicated logic.
- Mobile experience is the priority.
