# ALSOUK — PROJECT STRUCTURE SPECIFICATION

**Date:** August 2026
**Document:** Official Folder and File Tree
**Repository:** ALSOUK B2B Platform

---

## 1. Top-Level Directory Layout

The following structure represents the root files and folders of the ALSOUK repository:

```
.
├── .env.example                     # Reference environment variables
├── .gitignore                       # Ignored build and node artifacts
├── PROJECT_STATUS.md                # Development status and hand-off guide
├── app/                             # Next.js App Router root directories
├── components/                      # UI design components
├── components.json                  # Shadcn UI configuration file
├── docs/                            # Product specifications, audits, guidelines
├── eslint.config.mjs                # ESLint code style configurations
├── middleware.ts                    # Global proxy / routing middleware
├── next-env.d.ts                    # Next.js TypeScript environmental interfaces
├── next.config.mjs                  # Core Next.js configuration flags
├── package-lock.json                # npm dependency lockfile (unused)
├── package.json                     # Main dependencies and script declarations
├── pnpm-lock.yaml                   # Authoritative package lockfile
├── postcss.config.mjs               # PostCSS styling configurations
├── public/                          # Public static assets (images, icons)
├── supabase/                        # Database schemas, migrations, seeds
└── tsconfig.json                    # Strict TypeScript configurations
```

---

## 2. Next.js App Router Layout (`app/`)

The Next.js App router contains all frontend pages and serverless API route handlers.

```
app/
├── globals.css                      # Global styles and Tailwind CSS v4 variables
├── layout.tsx                       # Global page shell, viewport and font providers
├── page.tsx                         # Core B2B Marketplace Homepage
├── robots.ts                        # Crawler configuration
├── sitemap.ts                       # Dynamic XML sitemap generator
├── account/                         # Merchant profile and setup center
│   └── page.tsx                     # Social profile and progressive setup wizard
├── admin/                           # Administrative panel routes
│   ├── layout.tsx                   # Dark-themed admin viewport structure
│   ├── page.tsx                     # Main admin metrics command center
│   ├── applications/                # Incoming application reviews list
│   │   └── page.tsx                 # Searchable application list
│   ├── booths/                      # Approved exhibition booth list
│   │   └── page.tsx                 # Booth list and status manager
│   ├── exhibitions/                 # Exhibition listings and edit space
│   │   ├── page.tsx                 # Table listing all tradeshows
│   │   ├── new/                     # New exhibition creation page
│   │   │   └── page.tsx             # Interactive show creator
│   │   └── [id]/                    # Specific exhibition manager
│   │       ├── page.tsx             # Overview of active exhibition
│   │       └── edit/                # Edit exhibition details
│   │           └── page.tsx         # Date, brand asset and details form
│   ├── rfqs/                        # Global RFQs admin view
│   │   └── page.tsx                 # Token-gated sourcing list
│   └── statistics/                  # Administrator statistics reports
│       └── page.tsx                 # Interactive SVG conversion charts
├── api/                             # Backend serverless API routes
│   ├── admin/                       # Administrative endpoints
│   │   ├── rfqs/                    # Gated RFQ retrieval
│   │   │   └── route.ts
│   │   └── exhibitions/             # Exhibition creation endpoint
│   │       ├── route.ts
│   │       └── [id]/                # Single exhibition override endpoint
│   │           └── route.ts
│   ├── ai/                          # AI Assistant completion route
│   │   └── route.ts                 # Zero-dependency Chat completion route
│   ├── categories/                  # Category tree API
│   │   ├── route.ts                 # Retrieves categories
│   │   └── [slug]/                  # Single category details
│   │       └── route.ts
│   ├── companies/                   # Marketplace business profiles API
│   │   ├── route.ts                 # Company retrieval and creation
│   │   └── [slug]/                  # Company details and catalog fetching
│   │       └── route.ts
│   ├── exhibitions/                 # Public virtual tradeshows API
│   │   ├── route.ts                 # Public exhibitions index
│   │   ├── [slug]/                  # Exhibition details and metadata
│   │   │   ├── route.ts
│   │   │   └── booths/              # Exhibition booths directory
│   │   │       ├── route.ts
│   │   │       └── [id]/            # Individual booth specifications
│   │   │           └── route.ts
│   │   ├── analytics/               # Multi-format reports and analytics
│   │   │   ├── downloads/           # Catalog downloads report
│   │   │   │   └── route.ts
│   │   │   ├── exhibitor/           # Exhibitor dashboard metrics
│   │   │   │   └── route.ts
│   │   │   ├── export/              # Multi-format (CSV, Excel, PDF) export
│   │   │   │   └── route.ts
│   │   │   ├── meetings/            # Meeting metrics retriever
│   │   │   │   └── route.ts
│   │   │   ├── organizer/           # Organizer global dashboards metrics
│   │   │   │   └── route.ts
│   │   │   ├── qr/                  # QR Code scanning trackers
│   │   │   │   └── route.ts
│   │   │   └── traffic/             # Page view traffic metrics
│   │   │       └── route.ts
│   │   ├── applications/            # Trade show application forms
│   │   │   ├── route.ts             # Application submission endpoint
│   │   │   └── [id]/                # Single application status endpoint
│   │   │       └── route.ts
│   │   ├── booth/                   # Booth-specific manager endpoints
│   │   │   ├── route.ts             # Updates booth configuration
│   │   │   ├── documents/           # Catalog document CRUD
│   │   │   │   └── route.ts
│   │   │   ├── media/               # Video and image asset CRUD
│   │   │   │   └── route.ts
│   │   │   └── exhibits/            # Booth exhibits manager
│   │   │       ├── route.ts
│   │   │       └── [id]/            # Exhibit update/delete
│   │   │           └── route.ts
│   │   ├── meetings/                # B2B meeting submissions API
│   │   │   └── route.ts             # Reschedule and cancellation actions
│   │   ├── organizer/               # Organizer-specific endpoints
│   │   │   ├── applications/        # Applications approval/rejection
│   │   │   │   └── route.ts
│   │   │   ├── booths/              # Dynamic booth assignment
│   │   │   │   └── route.ts
│   │   │   ├── dashboard/           # Summary metrics handler
│   │   │   │   └── route.ts
│   │   │   ├── exhibition/          # Show configurations handler
│   │   │   │   └── route.ts
│   │   │   └── statistics/          # Statistics graphs generator
│   │   │       └── route.ts
│   │   └── visitor/                 # Public tradeshow visitor interactions
│   │       ├── favorites/           # Bookmark booth and exhibits
│   │       │   └── route.ts
│   │       ├── meetings/            # Submit networking meeting requests
│   │       │   └── route.ts
│   │       ├── notes/               # Local visitor notepad
│   │       │   └── route.ts
│   │       ├── qr/                  # Generates virtual vCard QR code
│   │       │   └── route.ts
│   │       └── recently-viewed/     # Track visitor history
│   │           └── route.ts
│   ├── notifications/               # Merchant notification updates API
│   │   ├── route.ts                 # Retrieves user notifications
│   │   ├── mark-all-read/           # Marks all notifications read
│   │   │   └── route.ts
│   │   ├── unread-count/            # Gets unread count
│   │   │   └── route.ts
│   │   └── [id]/                    # Update/delete specific notification
│   │       └── route.ts
│   ├── products/                    # General marketplace products API
│   │   ├── route.ts                 # Product catalog index and creator
│   │   └── [id]/                    # Specific product spec
│   │       └── route.ts
│   ├── rfqs/                        # Global RFQ creations and list API
│   │   └── route.ts                 # B2B quotation router
│   ├── search/                      # Global marketplace search API
│   │   └── route.ts                 # Elastic search mock router
│   ├── stores/                      # Storefront resolver API
│   │   └── [slug]/                  # Supplier storefront resolver
│   │       └── route.ts
│   └── suppliers/                   # Legacy directory APIs
│       ├── route.ts                 # Supplier list
│       └── [id]/                    # Supplier profile details
│           └── route.ts
├── categories/                      # Categories listing router
│   ├── layout.tsx
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── companies/                       # Companies directories router
│   ├── layout.tsx
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── discover/                        # Vertical scroll snap feed
│   └── page.tsx                     # TikTok-style player viewport
├── exhibitions/                     # Tradeshow module router
│   ├── page.tsx                     # Tradeshow lists
│   ├── layout.tsx                   # Logical properties shell
│   ├── [slug]/                      # Exhibition landing details
│   │   ├── page.tsx                 # Searchable pavilions directory
│   │   ├── apply/                   # Exhibitor application page
│   │   │   └── page.tsx             # Interactive application form
│   │   └── booths/                  # Booth profiles
│   │       └── [id]/                # Virtual pavilion view
│   │           └── page.tsx         # Meeting scheduler and local notes
│   ├── admin/                       # Organizer's evaluation center
│   │   ├── applications/            # Incoming applications reviewer
│   │   │   ├── page.tsx             # List and filters
│   │   │   └── [id]/                # Detailed review notes form
│   │   │       └── page.tsx
│   ├── analytics/                   # Performance monitoring console
│   │   ├── page.tsx                 # Selector (Organizer vs Exhibitor)
│   │   ├── exhibitor/               # Exhibitor analytics panel
│   │   │   └── page.tsx             # Traffic & click indicators
│   │   └── organizer/               # Organizer global charts
│   │       └── page.tsx             # SVG conversions, metrics
│   ├── application/                 # Application tracking
│   │   └── [id]/                    # Specific application status
│   │       └── page.tsx             # Pending / Approved workflow tracker
│   ├── booth/                       # Exhibitor workspace routing
│   │   └── dashboard/               # Exhibitor dashboard home
│   │       ├── page.tsx             # Core status monitor and lockout checks
│   │       ├── edit/                # Branded profile editor
│   │       │   └── page.tsx         # Logos, banners, tagline update
│   │       ├── exhibits/            # Exhibit catalog manager
│   │       │   ├── page.tsx         # Exhibit grids and order buttons
│   │       │   ├── new/             # Create exhibit page
│   │       │   │   └── page.tsx     # Custom specs form
│   │       │   └── [id]/            # Individual exhibit editor
│   │       │       └── edit/
│   │       │           └── page.tsx # Update specs
│   │       ├── media/               # Media and document center
│   │       │   └── page.tsx         # Image, video, catalog PDF manager
│   │       └── preview/             # Live visual layout simulator
│   │           └── page.tsx         # Visitor preview emulator
│   ├── organizer/                   # Organizer's dashboard routing
│   │   └── dashboard/               # Dashboard index page
│   │       ├── page.tsx             # General metrics command home
│   │       ├── edit/                # Edit exhibition layout
│   │       │   └── page.tsx         # Configuration panel
│   │       ├── applications/        # Applications reviewer page
│   │       │   └── page.tsx         # Space allocator & review list
│   │       ├── booths/              # Active booths supervisor page
│   │       │   └── page.tsx         # Space status toggles
│   │       └── statistics/          # Statistics page
│   │           └── page.tsx         # SVG metrics
│   └── visitor/                     # Visitor experience dashboard
│       ├── page.tsx                 # General overview panel
│       ├── favorites/               # List of saved booths/exhibits
│       │   └── page.tsx
│       ├── history/                 # Browsed booth timeline
│       │   └── page.tsx
│       └── meetings/                # B2B meetings scheduler
│           └── page.tsx             # List of requests and status tracker
├── forgot-password/                 # Forgotten password layout
│   └── page.tsx                     # Recovery form
├── login/                           # User sign-in screen
│   └── page.tsx                     # Synthetic-email login
├── messages/                        # Messaging portal
│   └── page.tsx                     # SoonScreen placeholder
├── notifications/                   # Notification page router
│   └── page.tsx                     # Structured notifications list
├── products/                        # General products router
│   ├── layout.tsx
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── register/                        # New user signup page
│   └── page.tsx                     # Account creation wizard
└── rfq/                             # Quotations portal router
    ├── layout.tsx
    ├── page.tsx                     # Global sourcing catalog
```

---

## 3. Core Service Layers (`lib/services/`)

Contains server-side database orchestrations and API connectors:

```
lib/services/
├── booth-media-service.ts           # Media and Document management for booths
├── categories-client.ts             # Category frontend API wrapper
├── categories-service.ts            # Server-side PostgREST categories query
├── companies-client.ts              # Company frontend API wrapper
├── companies-service.ts             # Server-side PostgREST company query
├── exhibitions-client.ts            # Exhibition frontend API wrapper
├── exhibitions-service.ts           # Exhaustive server-side tradeshow manager
├── marketplace-api.ts               # Shared marketplace fetch helpers
├── notifications-service.ts         # Unified notification dispatch layer
├── posts-service.ts                 # Instagram commercial feed coordinator
├── products-client.ts               # Products frontend API wrapper
├── products-service.ts              # Server-side products catalog query
├── search-client.ts                 # Search frontend API wrapper
├── search-service.ts                # Server-side keyword search query
├── social-service.ts                # Social activity, likes, and follows resolver
├── stores-client.ts                 # Store frontend API wrapper
└── stores-service.ts                # Server-side stores config resolver
```
