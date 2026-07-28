export type Lang = "ar" | "fr" | "en"

export const LANGS: { code: Lang; label: string; native: string; dir: "rtl" | "ltr" }[] = [
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "fr", label: "French", native: "Français", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
]

type Dict = {
  nav: {
    categories: string
    suppliers: string
    products: string
    rfq: string
    about: string
    signIn: string
    joinFree: string
    forBuyers: string
    forSuppliers: string
    help: string
  }
  hero: {
    badge: string
    title1: string
    titleHighlight: string
    title2: string
    subtitle: string
    searchPlaceholder: string
    searchButton: string
    popular: string
    popularTerms: string[]
    ctaPrimary: string
    ctaSecondary: string
    trusted: string
  }
  opportunities: {
    title: string
    subtitle: string
    badge: string
    viewAll: string
    items: {
      title: string
      type: string
      badge: string
      price: string
      moq: string
      supplier: string
      location: string
    }[]
  }
  categories: {
    title: string
    subtitle: string
    viewAll: string
    suppliersLabel: string
    items: { name: string; count: string }[]
  }
  suppliers: {
    title: string
    subtitle: string
    verified: string
    goldSupplier: string
    viewProfile: string
    responseRate: string
    yearsLabel: string
  }
  products: {
    title: string
    subtitle: string
    viewAll: string
    moq: string
    perUnit: string
    inquire: string
    items: { name: string; price: string; moq: string; supplier: string }[]
  }
  rfq: {
    badge: string
    title: string
    subtitle: string
    step1: string
    step1desc: string
    step2: string
    step2desc: string
    step3: string
    step3desc: string
    formTitle: string
    productLabel: string
    productPlaceholder: string
    quantityLabel: string
    quantityPlaceholder: string
    detailsLabel: string
    detailsPlaceholder: string
    submit: string
    note: string
  }
  why: {
    title: string
    subtitle: string
    items: { title: string; desc: string }[]
  }
  stats: {
    title: string
    items: { value: string; label: string }[]
  }
  testimonials: {
    title: string
    subtitle: string
    items: { quote: string; name: string; role: string }[]
  }
  footer: {
    tagline: string
    newsletter: string
    newsletterDesc: string
    emailPlaceholder: string
    subscribe: string
    colBuy: string
    colSell: string
    colCompany: string
    colSupport: string
    buy: string[]
    sell: string[]
    company: string[]
    support: string[]
    rights: string
    terms: string
    privacy: string
    country: string
  }
  marketplace: {
    breadcrumbHome: string
    loading: string
    error: string
    errorDesc: string
    retry: string
    companies: {
      title: string
      subtitle: string
      empty: string
      verified: string
      storefronts: string
      categories: string
      website: string
      viewStore: string
      viewProducts: string
      notFound: string
      notFoundDesc: string
      back: string
    }
    categories: {
      title: string
      subtitle: string
      empty: string
      productsIn: string
      subcategories: string
      notFound: string
      notFoundDesc: string
      back: string
    }
    stores: {
      about: string
      products: string
      categories: string
      empty: string
      viewCompany: string
      notFound: string
      notFoundDesc: string
    }
    products: {
      title: string
      subtitle: string
      empty: string
      moq: string
      perUnit: string
      priceOnRequest: string
      inStock: string
      outOfStock: string
      sku: string
      description: string
      details: string
      soldBy: string
      categories: string
      gallery: string
      noImage: string
      viewProduct: string
      notFound: string
      notFoundDesc: string
      back: string
    }
  }
  search: {
    title: string
    placeholder: string
    button: string
    resultsFor: string
    searching: string
    prompt: string
    noResults: string
    noResultsDesc: string
    suppliers: string
    companies: string
    products: string
  }
  ai: {
    launch: string
    title: string
    subtitle: string
    placeholder: string
    send: string
    greeting: string
    thinking: string
    error: string
    disabledTitle: string
    disabledBody: string
  }
  discovery: {
    title: string
    subtitle: string
    tabs: {
      all: string
      factory: string
      product: string
      process: string
    }
    items: {
      title: string
      supplier: string
      duration: string
      views: string
      category: string
      type: "all" | "factory" | "product" | "process"
    }[]
  }
  export: {
    title: string
    subtitle: string
    items: {
      title: string
      desc: string
      stat: string
      statLabel: string
    }[]
  }
}

export const translations: Record<Lang, Dict> = {
  en: {
    nav: {
      categories: "Categories",
      suppliers: "Suppliers",
      products: "Products",
      rfq: "Request Quote",
      about: "About",
      signIn: "Sign In",
      joinFree: "Join Free",
      forBuyers: "For Buyers",
      forSuppliers: "For Suppliers",
      help: "Help Center",
    },
    hero: {
      badge: "Tunisia's leading B2B trade platform",
      title1: "Connect with trusted",
      titleHighlight: "manufacturers & suppliers",
      title2: "across Tunisia and North Africa",
      subtitle:
        "ALSOUK links manufacturers, wholesalers, exporters and buyers on one elegant marketplace. Source quality products, request quotes and grow your business.",
      searchPlaceholder: "Search products, suppliers or categories...",
      searchButton: "Search",
      popular: "Popular:",
      popularTerms: ["Olive Oil", "Textiles", "Ceramics", "Dates", "Machinery"],
      ctaPrimary: "Start Sourcing",
      ctaSecondary: "Become a Supplier",
      trusted: "Trusted by 12,000+ businesses",
    },
    opportunities: {
      title: "Today's Opportunities",
      subtitle: "High-priority sourcing and flash deals from vetted Tunisian manufacturers",
      badge: "Flash Sourcing",
      viewAll: "View more opportunities",
      items: [
        {
          title: "High-Grade Olive Oil Bulk Contract (Extra Virgin)",
          type: "Agri-Food",
          badge: "Trending",
          price: "13.950 - 19.220 DT",
          moq: "5,000 L",
          supplier: "Medina Olive Co.",
          location: "Sfax, Tunisia"
        },
        {
          title: "Premium Organic Cotton Yarn Roll",
          type: "Textiles",
          badge: "Hot Deal",
          price: "6.510 - 10.540 DT",
          moq: "1,000 m",
          supplier: "Carthage Textiles",
          location: "Monastir, Tunisia"
        },
        {
          title: "Handpainted Ceramic Dinnerware Set",
          type: "Handicrafts",
          badge: "Exclusive",
          price: "24.800 - 43.400 DT",
          moq: "50 sets",
          supplier: "Atlas Ceramics",
          location: "Nabeul, Tunisia"
        },
        {
          title: "Premium Organic Deglet Nour Dates Pallet",
          type: "Agri-Food",
          badge: "Fast Moving",
          price: "9.920 - 15.500 DT",
          moq: "2 tons",
          supplier: "Sahara Dates Export",
          location: "Tozeur, Tunisia"
        }
      ]
    },
    categories: {
      title: "Explore Categories",
      subtitle: "Browse thousands of verified products across leading industries",
      viewAll: "View all categories",
      suppliersLabel: "suppliers",
      items: [
        { name: "Food & Agriculture", count: "3,200+" },
        { name: "Textiles & Apparel", count: "2,800+" },
        { name: "Industrial Machinery", count: "1,500+" },
        { name: "Construction & Building", count: "1,900+" },
        { name: "Handicrafts & Ceramics", count: "1,100+" },
        { name: "Cosmetics & Health", count: "950+" },
        { name: "Leather & Footwear", count: "1,300+" },
        { name: "Chemicals & Plastics", count: "720+" },
      ],
    },
    suppliers: {
      title: "Featured Suppliers",
      subtitle: "Verified manufacturers and exporters ready to fulfill your orders",
      verified: "Verified",
      goldSupplier: "Gold Supplier",
      viewProfile: "View profile",
      responseRate: "Response rate",
      yearsLabel: "on ALSOUK",
    },
    products: {
      title: "Featured Products",
      subtitle: "Handpicked quality products from top-rated suppliers",
      viewAll: "View all products",
      moq: "MOQ",
      perUnit: "/ unit",
      inquire: "Inquire now",
      items: [
        { name: "Extra Virgin Olive Oil", price: "13.950 - 19.220 DT", moq: "500 L", supplier: "Medina Olive Co." },
        { name: "Premium Cotton Fabric", price: "6.510 - 10.540 DT", moq: "1,000 m", supplier: "Carthage Textiles" },
        { name: "Handcrafted Ceramic Tiles", price: "24.800 - 43.400 DT", moq: "200 pcs", supplier: "Atlas Ceramics" },
        { name: "Deglet Nour Dates", price: "9.920 - 15.500 DT", moq: "1 ton", supplier: "Sahara Dates Export" },
        { name: "Genuine Leather Goods", price: "37.200 - 86.800 DT", moq: "100 pcs", supplier: "Kairouan Leather" },
        { name: "Industrial Components", price: "46.500 - 139.500 DT", moq: "50 pcs", supplier: "Tunis Metalworks" },
      ],
    },
    rfq: {
      badge: "Request for Quotation",
      title: "Tell us what you need, get quotes fast",
      subtitle:
        "Post a single request and receive competitive quotes from multiple verified suppliers within 24 hours.",
      step1: "Post your request",
      step1desc: "Describe your product needs and quantity in minutes.",
      step2: "Receive quotations",
      step2desc: "Verified suppliers send tailored quotes and samples.",
      step3: "Compare & order",
      step3desc: "Choose the best offer and trade with confidence.",
      formTitle: "Submit your RFQ",
      productLabel: "Product name",
      productPlaceholder: "e.g. Extra virgin olive oil",
      quantityLabel: "Quantity",
      quantityPlaceholder: "e.g. 500 L",
      detailsLabel: "Details",
      detailsPlaceholder: "Describe specifications, packaging, delivery...",
      submit: "Get Free Quotes",
      note: "Free to post. No commitment required.",
    },
    why: {
      title: "Why Choose ALSOUK",
      subtitle: "The trusted way to trade across Tunisia and North Africa",
      items: [
        { title: "Verified Suppliers", desc: "Every supplier is vetted and verified so you trade with confidence." },
        { title: "Secure Trade Assurance", desc: "Protected payments and order tracking from quote to delivery." },
        { title: "Local & Regional Reach", desc: "Deep coverage in Tunisia with growing access across North Africa." },
        { title: "Fast RFQ Matching", desc: "Get competitive quotes from multiple suppliers within 24 hours." },
        { title: "Multilingual Support", desc: "Trade seamlessly in Arabic, French and English." },
        { title: "Logistics & Export", desc: "Integrated shipping and export support for smooth delivery." },
      ],
    },
    stats: {
      title: "Powering trade across the region",
      items: [
        { value: "12,000+", label: "Verified Suppliers" },
        { value: "480K+", label: "Products Listed" },
        { value: "35+", label: "Industries Covered" },
        { value: "24 h", label: "Average Quote Time" },
      ],
    },
    testimonials: {
      title: "Trusted by businesses like yours",
      subtitle: "Hear from buyers and suppliers growing with ALSOUK",
      items: [
        { quote: "ALSOUK helped us find reliable olive oil exporters in days, not months. The quality verification is a game changer.", name: "Sonia Ben Ali", role: "Procurement Manager, EuroFoods" },
        { quote: "As a manufacturer, we tripled our export inquiries within the first quarter of joining the platform.", name: "Karim Trabelsi", role: "CEO, Carthage Textiles" },
        { quote: "The RFQ system is incredibly efficient. We received five competitive quotes overnight.", name: "Leïla Mansour", role: "Buyer, Atlas Distribution" },
      ],
    },
    footer: {
      tagline: "The premium B2B marketplace connecting Tunisia and North Africa.",
      newsletter: "Stay in the loop",
      newsletterDesc: "Get trade insights and new supplier alerts.",
      emailPlaceholder: "Enter your email",
      subscribe: "Subscribe",
      colBuy: "For Buyers",
      colSell: "For Suppliers",
      colCompany: "Company",
      colSupport: "Support",
      buy: ["Browse Categories", "Request Quotes", "Trade Assurance", "Buyer Protection"],
      sell: ["Sell on ALSOUK", "Supplier Membership", "Verification", "Export Services"],
      company: ["About Us", "Careers", "Press", "Partners"],
      support: ["Help Center", "Contact Us", "Shipping Guide", "Report Abuse"],
      rights: "All rights reserved.",
      terms: "Terms",
      privacy: "Privacy",
      country: "Tunisia",
    },
    marketplace: {
      breadcrumbHome: "Home",
      loading: "Loading…",
      error: "Something went wrong",
      errorDesc: "We couldn't load this content. Please try again.",
      retry: "Try again",
      companies: {
        title: "Companies",
        subtitle: "Browse verified companies and their storefronts across the marketplace.",
        empty: "No companies to show yet.",
        verified: "Verified",
        storefronts: "Storefronts",
        categories: "Categories",
        website: "Visit website",
        viewStore: "View store",
        viewProducts: "View products",
        notFound: "Company not found",
        notFoundDesc: "This company doesn't exist or is no longer available.",
        back: "Back to companies",
      },
      categories: {
        title: "Categories",
        subtitle: "Explore products by category across the marketplace.",
        empty: "No categories to show yet.",
        productsIn: "Products in this category",
        subcategories: "Subcategories",
        notFound: "Category not found",
        notFoundDesc: "This category doesn't exist or is no longer available.",
        back: "Back to categories",
      },
      stores: {
        about: "About",
        products: "Products",
        categories: "Categories",
        empty: "This store hasn't published any products yet.",
        viewCompany: "View company",
        notFound: "Store not found",
        notFoundDesc: "This storefront doesn't exist or is no longer active.",
      },
      products: {
        title: "Products",
        subtitle: "Discover products from suppliers across Tunisia and North Africa.",
        empty: "No products to show yet.",
        moq: "MOQ",
        perUnit: "per unit",
        priceOnRequest: "Price on request",
        inStock: "In stock",
        outOfStock: "Out of stock",
        sku: "SKU",
        description: "Description",
        details: "Details",
        soldBy: "Sold by",
        categories: "Categories",
        gallery: "Gallery",
        noImage: "No image available",
        viewProduct: "View product",
        notFound: "Product not found",
        notFoundDesc: "This product doesn't exist or is no longer available.",
        back: "Back to products",
      },
    },
    search: {
      title: "Search",
      placeholder: "Search products, suppliers or companies…",
      button: "Search",
      resultsFor: "Results for",
      searching: "Searching…",
      prompt: "Search suppliers, companies and products across the marketplace.",
      noResults: "No results found",
      noResultsDesc: "Try a different keyword or check your spelling.",
      suppliers: "Suppliers",
      companies: "Companies",
      products: "Products",
    },
    ai: {
      launch: "Ask ALSOUK",
      title: "ALSOUK Assistant",
      subtitle: "Your B2B commerce helper",
      placeholder: "Ask about suppliers, products or RFQs…",
      send: "Send",
      greeting: "Hi! I can help you find suppliers, compare products and prepare RFQs. What are you sourcing today?",
      thinking: "Thinking…",
      error: "Something went wrong. Please try again.",
      disabledTitle: "Assistant coming soon",
      disabledBody: "The AI assistant isn't enabled yet. Meanwhile, use search to find suppliers and products, or post an RFQ to get quotes.",
    },
    discovery: {
      title: "Live Sourcing & Factory Tours",
      subtitle: "Step inside premium Tunisian manufacturing facilities and verify quality first-hand through curated B2B demonstrations.",
      tabs: {
        all: "All Features",
        factory: "Factory Highlights",
        product: "Product Demos",
        process: "Process Tours"
      },
      items: [
        { title: "Premium Extra Virgin Olive Oil Cold-Pressing Process", supplier: "Medina Olive Co.", duration: "2:45", views: "3.4k views", category: "Agri-Food", type: "process" },
        { title: "Automated Circular Knitting & Yarn Spinning Facility Tour", supplier: "Carthage Textiles", duration: "3:15", views: "1.8k views", category: "Textiles", type: "factory" },
        { title: "Artisanal Pottery Shaping & Hand-Painting Techniques", supplier: "Atlas Ceramics", duration: "1:50", views: "2.1k views", category: "Handicrafts", type: "product" },
        { title: "High-Yield Date Sorting & Eco-Friendly Packaging Lines", supplier: "Sahara Dates Export", duration: "2:10", views: "1.2k views", category: "Agri-Food", type: "process" },
        { title: "Automated Leather Cutting & Luxury Shoe Assembly Demonstration", supplier: "Kairouan Leather", duration: "3:40", views: "940 views", category: "Leather Goods", type: "product" },
        { title: "Precision Metal Stamping & Welding Operations Tour", supplier: "Tunis Metalworks", duration: "4:05", views: "1.5k views", category: "Industrial", type: "factory" }
      ]
    },
    export: {
      title: "Tunisia's Strategic Export Advantage",
      subtitle: "Source from a modern, world-class hub situated at the crossroads of Europe, Africa, and the Middle East.",
      items: [
        { title: "Unmatched Proximity", desc: "Located just 140km from southern Europe, facilitating extremely short shipping lead times.", stat: "1-3 Days", statLabel: "Transit to EU" },
        { title: "Duty-Free Trade Agreements", desc: "Benefit from free trade agreements with the European Union, UK, and major African nations.", stat: "0%", statLabel: "Customs Tariffs" },
        { title: "Skilled & Vetted Craftsmanship", desc: "Access a rich heritage of precision engineering, handcrafts, and high-quality food production.", stat: "100%", statLabel: "Vetted Standards" },
        { title: "Modern Deep-Water Ports", desc: "Highly connected maritime network with world-class facilities and streamlined export processing.", stat: "7+", statLabel: "Active Commercial Ports" }
      ]
    },
  },
  fr: {
    nav: {
      categories: "Catégories",
      suppliers: "Fournisseurs",
      products: "Produits",
      rfq: "Demander un devis",
      about: "À propos",
      signIn: "Connexion",
      joinFree: "Inscription gratuite",
      forBuyers: "Pour les acheteurs",
      forSuppliers: "Pour les fournisseurs",
      help: "Centre d'aide",
    },
    hero: {
      badge: "La 1ère plateforme B2B de Tunisie",
      title1: "Connectez-vous à des",
      titleHighlight: "fabricants & fournisseurs de confiance",
      title2: "en Tunisie et en Afrique du Nord",
      subtitle:
        "ALSOUK relie fabricants, grossistes, exportateurs et acheteurs sur une place de marché élégante. Sourcez des produits de qualité, demandez des devis et développez votre activité.",
      searchPlaceholder: "Rechercher produits, fournisseurs ou catégories...",
      searchButton: "Rechercher",
      popular: "Populaire :",
      popularTerms: ["Huile d'olive", "Textiles", "Céramique", "Dattes", "Machines"],
      ctaPrimary: "Commencer l'achat",
      ctaSecondary: "Devenir fournisseur",
      trusted: "Approuvé par plus de 12 000 entreprises",
    },
    opportunities: {
      title: "Opportunités du Jour",
      subtitle: "Sourcing prioritaire et offres flash des fabricants tunisiens vérifiés",
      badge: "Sourcing Flash",
      viewAll: "Voir plus d'opportunités",
      items: [
        {
          title: "Contrat de Vrac d'Huile d'Olive Extra Vierge de Qualité",
          type: "Agroalimentaire",
          badge: "Tendance",
          price: "13.950 - 19.220 DT",
          moq: "5 000 L",
          supplier: "Medina Olive Co.",
          location: "Sfax, Tunisie"
        },
        {
          title: "Rouleau de Fil de Coton Biologique de Qualité Supérieure",
          type: "Textiles",
          badge: "Offre Spéciale",
          price: "6.510 - 10.540 DT",
          moq: "1 000 m",
          supplier: "Carthage Textiles",
          location: "Monastir, Tunisie"
        },
        {
          title: "Service de Table en Céramique Peint à la Main",
          type: "Artisanat",
          badge: "Exclusif",
          price: "24.800 - 43.400 DT",
          moq: "50 services",
          supplier: "Atlas Ceramics",
          location: "Nabeul, Tunisie"
        },
        {
          title: "Palette de Dattes Deglet Nour Biologiques Supérieures",
          type: "Agroalimentaire",
          badge: "Flux Rapide",
          price: "9.920 - 15.500 DT",
          moq: "2 tonnes",
          supplier: "Sahara Dates Export",
          location: "Tozeur, Tunisie"
        }
      ]
    },
    categories: {
      title: "Explorer les catégories",
      subtitle: "Parcourez des milliers de produits vérifiés dans les principales industries",
      viewAll: "Voir toutes les catégories",
      suppliersLabel: "fournisseurs",
      items: [
        { name: "Alimentation & Agriculture", count: "3 200+" },
        { name: "Textiles & Habillement", count: "2 800+" },
        { name: "Machines industrielles", count: "1 500+" },
        { name: "Construction & Bâtiment", count: "1 900+" },
        { name: "Artisanat & Céramique", count: "1 100+" },
        { name: "Cosmétiques & Santé", count: "950+" },
        { name: "Cuir & Chaussures", count: "1 300+" },
        { name: "Chimie & Plastiques", count: "720+" },
      ],
    },
    suppliers: {
      title: "Fournisseurs en vedette",
      subtitle: "Fabricants et exportateurs vérifiés prêts à traiter vos commandes",
      verified: "Vérifié",
      goldSupplier: "Fournisseur Or",
      viewProfile: "Voir le profil",
      responseRate: "Taux de réponse",
      yearsLabel: "sur ALSOUK",
    },
    products: {
      title: "Produits en vedette",
      subtitle: "Produits de qualité sélectionnés auprès des meilleurs fournisseurs",
      viewAll: "Voir tous les produits",
      moq: "Qté min.",
      perUnit: "/ unité",
      inquire: "Demander",
      items: [
        { name: "Huile d'olive extra vierge", price: "13.950 - 19.220 DT", moq: "500 L", supplier: "Medina Olive Co." },
        { name: "Tissu de coton premium", price: "6.510 - 10.540 DT", moq: "1 000 m", supplier: "Carthage Textiles" },
        { name: "Carreaux en céramique artisanaux", price: "24.800 - 43.400 DT", moq: "200 pcs", supplier: "Atlas Ceramics" },
        { name: "Dattes Deglet Nour", price: "9.920 - 15.500 DT", moq: "1 tonne", supplier: "Sahara Dates Export" },
        { name: "Articles en cuir véritable", price: "37.200 - 86.800 DT", moq: "100 pcs", supplier: "Kairouan Leather" },
        { name: "Composants industriels", price: "46.500 - 139.500 DT", moq: "50 pcs", supplier: "Tunis Metalworks" },
      ],
    },
    rfq: {
      badge: "Demande de devis",
      title: "Dites-nous ce dont vous avez besoin, recevez des devis rapidement",
      subtitle:
        "Publiez une seule demande et recevez des devis compétitifs de plusieurs fournisseurs vérifiés sous 24 heures.",
      step1: "Publiez votre demande",
      step1desc: "Décrivez vos besoins et quantités en quelques minutes.",
      step2: "Recevez des devis",
      step2desc: "Les fournisseurs vérifiés envoient des devis et échantillons.",
      step3: "Comparez & commandez",
      step3desc: "Choisissez la meilleure offre et commercez en confiance.",
      formTitle: "Soumettre votre demande",
      productLabel: "Nom du produit",
      productPlaceholder: "ex. Huile d'olive extra vierge",
      quantityLabel: "Quantité",
      quantityPlaceholder: "ex. 500 L",
      detailsLabel: "Détails",
      detailsPlaceholder: "Spécifications, emballage, livraison...",
      submit: "Obtenir des devis gratuits",
      note: "Gratuit et sans engagement.",
    },
    why: {
      title: "Pourquoi choisir ALSOUK",
      subtitle: "La manière fiable de commercer en Tunisie et en Afrique du Nord",
      items: [
        { title: "Fournisseurs vérifiés", desc: "Chaque fournisseur est contrôlé et vérifié pour commercer en confiance." },
        { title: "Transactions sécurisées", desc: "Paiements protégés et suivi des commandes du devis à la livraison." },
        { title: "Portée locale & régionale", desc: "Forte couverture en Tunisie et accès croissant en Afrique du Nord." },
        { title: "Correspondance RFQ rapide", desc: "Recevez des devis compétitifs de plusieurs fournisseurs sous 24 h." },
        { title: "Support multilingue", desc: "Commercez facilement en arabe, français et anglais." },
        { title: "Logistique & export", desc: "Support d'expédition et d'export intégré pour une livraison fluide." },
      ],
    },
    stats: {
      title: "Au service du commerce régional",
      items: [
        { value: "12 000+", label: "Fournisseurs vérifiés" },
        { value: "480K+", label: "Produits référencés" },
        { value: "35+", label: "Industries couvertes" },
        { value: "24 h", label: "Délai moyen de devis" },
      ],
    },
    testimonials: {
      title: "Approuvé par des entreprises comme la vôtre",
      subtitle: "Découvrez les acheteurs et fournisseurs qui grandissent avec ALSOUK",
      items: [
        { quote: "ALSOUK nous a aidés à trouver des exportateurs d'huile d'olive fiables en quelques jours. La vérification qualité change tout.", name: "Sonia Ben Ali", role: "Responsable achats, EuroFoods" },
        { quote: "En tant que fabricant, nous avons triplé nos demandes d'export dès le premier trimestre sur la plateforme.", name: "Karim Trabelsi", role: "PDG, Carthage Textiles" },
        { quote: "Le système de devis est incroyablement efficace. Nous avons reçu cinq devis compétitifs en une nuit.", name: "Leïla Mansour", role: "Acheteuse, Atlas Distribution" },
      ],
    },
    footer: {
      tagline: "La place de marché B2B premium qui relie la Tunisie et l'Afrique du Nord.",
      newsletter: "Restez informé",
      newsletterDesc: "Recevez des analyses commerciales et des alertes fournisseurs.",
      emailPlaceholder: "Entrez votre e-mail",
      subscribe: "S'abonner",
      colBuy: "Pour les acheteurs",
      colSell: "Pour les fournisseurs",
      colCompany: "Entreprise",
      colSupport: "Support",
      buy: ["Parcourir les catégories", "Demander des devis", "Assurance commerciale", "Protection acheteur"],
      sell: ["Vendre sur ALSOUK", "Adhésion fournisseur", "Vérification", "Services d'export"],
      company: ["À propos", "Carrières", "Presse", "Partenaires"],
      support: ["Centre d'aide", "Nous contacter", "Guide d'expédition", "Signaler un abus"],
      rights: "Tous droits réservés.",
      terms: "Conditions",
      privacy: "Confidentialité",
      country: "Tunisie",
    },
    marketplace: {
      breadcrumbHome: "Accueil",
      loading: "Chargement…",
      error: "Une erreur est survenue",
      errorDesc: "Impossible de charger ce contenu. Veuillez réessayer.",
      retry: "Réessayer",
      companies: {
        title: "Entreprises",
        subtitle: "Parcourez les entreprises vérifiées et leurs boutiques sur la place de marché.",
        empty: "Aucune entreprise à afficher pour le moment.",
        verified: "Vérifiée",
        storefronts: "Boutiques",
        categories: "Catégories",
        website: "Visiter le site",
        viewStore: "Voir la boutique",
        viewProducts: "Voir les produits",
        notFound: "Entreprise introuvable",
        notFoundDesc: "Cette entreprise n'existe pas ou n'est plus disponible.",
        back: "Retour aux entreprises",
      },
      categories: {
        title: "Catégories",
        subtitle: "Explorez les produits par catégorie sur la place de marché.",
        empty: "Aucune catégorie à afficher pour le moment.",
        productsIn: "Produits dans cette catégorie",
        subcategories: "Sous-catégories",
        notFound: "Catégorie introuvable",
        notFoundDesc: "Cette catégorie n'existe pas ou n'est plus disponible.",
        back: "Retour aux catégories",
      },
      stores: {
        about: "À propos",
        products: "Produits",
        categories: "Catégories",
        empty: "Cette boutique n'a pas encore publié de produits.",
        viewCompany: "Voir l'entreprise",
        notFound: "Boutique introuvable",
        notFoundDesc: "Cette boutique n'existe pas ou n'est plus active.",
      },
      products: {
        title: "Produits",
        subtitle: "Découvrez les produits de fournisseurs de Tunisie et d'Afrique du Nord.",
        empty: "Aucun produit à afficher pour le moment.",
        moq: "Qté min.",
        perUnit: "par unité",
        priceOnRequest: "Prix sur demande",
        inStock: "En stock",
        outOfStock: "Rupture de stock",
        sku: "Réf.",
        description: "Description",
        details: "Détails",
        soldBy: "Vendu par",
        categories: "Catégories",
        gallery: "Galerie",
        noImage: "Aucune image disponible",
        viewProduct: "Voir le produit",
        notFound: "Produit introuvable",
        notFoundDesc: "Ce produit n'existe pas ou n'est plus disponible.",
        back: "Retour aux produits",
      },
    },
    search: {
      title: "Recherche",
      placeholder: "Rechercher produits, fournisseurs ou entreprises…",
      button: "Rechercher",
      resultsFor: "Résultats pour",
      searching: "Recherche…",
      prompt: "Recherchez fournisseurs, entreprises et produits sur la marketplace.",
      noResults: "Aucun résultat",
      noResultsDesc: "Essayez un autre mot-clé ou vérifiez l'orthographe.",
      suppliers: "Fournisseurs",
      companies: "Entreprises",
      products: "Produits",
    },
    ai: {
      launch: "Demander à ALSOUK",
      title: "Assistant ALSOUK",
      subtitle: "Votre aide au commerce B2B",
      placeholder: "Fournisseurs, produits ou devis…",
      send: "Envoyer",
      greeting: "Bonjour ! Je peux vous aider à trouver des fournisseurs, comparer des produits et préparer des devis. Que recherchez-vous ?",
      thinking: "Réflexion…",
      error: "Une erreur est survenue. Veuillez réessayer.",
      disabledTitle: "Assistant bientôt disponible",
      disabledBody: "L'assistant IA n'est pas encore activé. En attendant, utilisez la recherche pour trouver des fournisseurs et des produits, ou publiez une demande de devis.",
    },
    discovery: {
      title: "Sourcing en Direct & Visites d'Usines",
      subtitle: "Entrez dans les usines tunisiennes de premier plan et vérifiez la qualité de fabrication via des démonstrations B2B exclusives.",
      tabs: {
        all: "Tout afficher",
        factory: "Points forts de l'usine",
        product: "Démos de produits",
        process: "Visites des processus"
      },
      items: [
        { title: "Processus de pressage à froid d'huile d'olive extra vierge", supplier: "Medina Olive Co.", duration: "2:45", views: "3.4k vues", category: "Agroalimentaire", type: "process" },
        { title: "Visite de l'usine de tricotage circulaire et de filature", supplier: "Carthage Textiles", duration: "3:15", views: "1.8k vues", category: "Textiles", type: "factory" },
        { title: "Techniques de façonnage et peinture manuelle de poteries", supplier: "Atlas Ceramics", duration: "1:50", views: "2.1k vues", category: "Artisanat", type: "product" },
        { title: "Lignes de tri de dattes et emballage éco-responsable", supplier: "Sahara Dates Export", duration: "2:10", views: "1.2k vues", category: "Agroalimentaire", type: "process" },
        { title: "Démo de découpe automatisée de cuir et assemblage de chaussures", supplier: "Kairouan Leather", duration: "3:40", views: "940 vues", category: "Maroquinerie", type: "product" },
        { title: "Visite des opérations d'emboutissage et de soudage de précision", supplier: "Tunis Metalworks", duration: "4:05", views: "1.5k vues", category: "Industriel", type: "factory" }
      ]
    },
    export: {
      title: "L'avantage Stratégique à l'Export de la Tunisie",
      subtitle: "Approvisionnez-vous auprès d'un pôle moderne idéalement situé au carrefour de l'Europe, de l'Afrique et du Moyen-Orient.",
      items: [
        { title: "Proximité Incomparable", desc: "Situé à seulement 140 km du sud de l'Europe, permettant des délais de livraison extrêmement courts.", stat: "1-3 Jours", statLabel: "Transit vers l'UE" },
        { title: "Accords de Libre-Échange", desc: "Bénéficiez d'accords de libre-échange avec l'Union européenne, le Royaume-Uni et les pays d'Afrique.", stat: "0%", statLabel: "Tarifs Douaniers" },
        { title: "Savoir-Faire Qualifié & Audité", desc: "Accédez à un riche patrimoine d'ingénierie, d'artisanat et de production alimentaire de qualité.", stat: "100%", statLabel: "Normes Vérifiées" },
        { title: "Ports Commerciaux Modernes", desc: "Réseau maritime hautement connecté doté d'installations de classe mondiale pour simplifier l'export.", stat: "7+", statLabel: "Ports Commerciaux" }
      ]
    },
  },
  ar: {
    nav: {
      categories: "الفئات",
      suppliers: "الموردون",
      products: "المنتجات",
      rfq: "طلب عرض سعر",
      about: "من نحن",
      signIn: "تسجيل الدخول",
      joinFree: "انضم مجاناً",
      forBuyers: "للمشترين",
      forSuppliers: "للموردين",
      help: "مركز المساعدة",
    },
    hero: {
      badge: "المنصة التجارية B2B الرائدة في تونس",
      title1: "تواصل مع",
      titleHighlight: "مصنّعين وموردين موثوقين",
      title2: "في تونس وشمال إفريقيا",
      subtitle:
        "تربط ألسوق بين المصنّعين وتجار الجملة والمصدّرين والمشترين في سوق أنيق واحد. احصل على منتجات عالية الجودة، اطلب عروض الأسعار وطوّر أعمالك.",
      searchPlaceholder: "ابحث عن منتجات أو موردين أو فئات...",
      searchButton: "بحث",
      popular: "الأكثر بحثاً:",
      popularTerms: ["زيت الزيتون", "المنسوجات", "الخزف", "التمور", "الآلات"],
      ctaPrimary: "ابدأ التوريد",
      ctaSecondary: "كن مورّداً",
      trusted: "موثوق من أكثر من 12,000 شركة",
    },
    opportunities: {
      title: "فرص اليوم",
      subtitle: "فرص توريد ذات أولوية عالية وعروض خاطفة من مصنعين تونسيين معتمدين",
      badge: "توريد خاطف",
      viewAll: "عرض المزيد من الفرص",
      items: [
        {
          title: "عقد زيت زيتون بكر ممتاز سائب ذو جودة عالية",
          type: "الأغذية والزراعة",
          badge: "رائج",
          price: "13.950 - 19.220 د.ت",
          moq: "5,000 لتر",
          supplier: "شركة مدينة للزيتون",
          location: "صفاقس، تونس"
        },
        {
          title: "رول خيوط قطنية عضوية فاخرة",
          type: "المنسوجات",
          badge: "عرض خاص",
          price: "6.510 - 10.540 د.ت",
          moq: "1,000 م",
          supplier: "قرطاج للمنسوجات",
          location: "المنستير، تونس"
        },
        {
          title: "طقم مائدة خزفي ملون يدويًا بالكامل",
          type: "الحرف اليدوية",
          badge: "حصري",
          price: "24.800 - 43.400 د.ت",
          moq: "50 طقم",
          supplier: "أطلس للخزف",
          location: "نابل، تونس"
        },
        {
          title: "تمور دقلة النور الفاخرة العضوية الممتازة",
          type: "الأغذية والزراعة",
          badge: "سريع الطلب",
          price: "9.920 - 15.500 د.ت",
          moq: "2 طن",
          supplier: "الصحراء لتصدير التمور",
          location: "توزر، تونس"
        }
      ]
    },
    categories: {
      title: "استكشف الفئات",
      subtitle: "تصفّح آلاف المنتجات الموثّقة في أبرز الصناعات",
      viewAll: "عرض كل الفئات",
      suppliersLabel: "مورّد",
      items: [
        { name: "الأغذية والزراعة", count: "+3,200" },
        { name: "المنسوجات والملابس", count: "+2,800" },
        { name: "الآلات الصناعية", count: "+1,500" },
        { name: "البناء والتشييد", count: "+1,900" },
        { name: "الحرف والخزف", count: "+1,100" },
        { name: "مستحضرات التجميل والصحة", count: "+950" },
        { name: "الجلود والأحذية", count: "+1,300" },
        { name: "الكيماويات والبلاستيك", count: "+720" },
      ],
    },
    suppliers: {
      title: "موردون مميزون",
      subtitle: "مصنّعون ومصدّرون موثّقون جاهزون لتلبية طلباتك",
      verified: "موثّق",
      goldSupplier: "مورّد ذهبي",
      viewProfile: "عرض الملف",
      responseRate: "معدل الاستجابة",
      yearsLabel: "على ألسوق",
    },
    products: {
      title: "منتجات مميزة",
      subtitle: "منتجات مختارة عالية الجودة من أفضل الموردين",
      viewAll: "عرض كل المنتجات",
      moq: "الحد الأدنى",
      perUnit: "/ للوحدة",
      inquire: "استفسر الآن",
      items: [
        { name: "زيت زيتون بكر ممتاز", price: "13.950 - 19.220 د.ت", moq: "500 لتر", supplier: "شركة مدينة للزيتون" },
        { name: "قماش قطني فاخر", price: "6.510 - 10.540 د.ت", moq: "1,000 م", supplier: "قرطاج للمنسوجات" },
        { name: "بلاط خزفي يدوي الصنع", price: "24.800 - 43.400 د.ت", moq: "200 قطعة", supplier: "أطلس للخزف" },
        { name: "تمور دقلة النور", price: "9.920 - 15.500 د.ت", moq: "1 طن", supplier: "الصحراء لتصدير التمور" },
        { name: "منتجات جلدية أصلية", price: "37.200 - 86.800 د.ت", moq: "100 قطعة", supplier: "القيروان للجلود" },
        { name: "مكوّنات صناعية", price: "46.500 - 139.500 د.ت", moq: "50 قطعة", supplier: "تونس للأشغال المعدنية" },
      ],
    },
    rfq: {
      badge: "طلب عرض سعر",
      title: "أخبرنا بما تحتاجه، واحصل على عروض الأسعار بسرعة",
      subtitle:
        "انشر طلباً واحداً واحصل على عروض أسعار تنافسية من عدة موردين موثّقين خلال 24 ساعة.",
      step1: "انشر طلبك",
      step1desc: "صف احتياجاتك من المنتجات والكمية في دقائق.",
      step2: "استقبل العروض",
      step2desc: "يرسل الموردون الموثّقون عروضاً وعينات مخصّصة.",
      step3: "قارن واطلب",
      step3desc: "اختر أفضل عرض وتاجر بثقة.",
      formTitle: "قدّم طلب عرض السعر",
      productLabel: "اسم المنتج",
      productPlaceholder: "مثال: زيت زيتون بكر ممتاز",
      quantityLabel: "الكمية",
      quantityPlaceholder: "مثال: 500 لتر",
      detailsLabel: "التفاصيل",
      detailsPlaceholder: "صف المواصفات والتغليف والتسليم...",
      submit: "احصل على عروض مجانية",
      note: "النشر مجاني وبدون أي التزام.",
    },
    why: {
      title: "لماذا تختار ألسوق",
      subtitle: "الطريقة الموثوقة للتجارة في تونس وشمال إفريقيا",
      items: [
        { title: "موردون موثّقون", desc: "يتم فحص كل مورّد والتحقق منه لتتاجر بثقة تامة." },
        { title: "تأمين تجاري آمن", desc: "مدفوعات محمية وتتبّع للطلبات من العرض حتى التسليم." },
        { title: "انتشار محلي وإقليمي", desc: "تغطية واسعة في تونس ووصول متنامٍ في شمال إفريقيا." },
        { title: "مطابقة سريعة للطلبات", desc: "احصل على عروض تنافسية من عدة موردين خلال 24 ساعة." },
        { title: "دعم متعدد اللغات", desc: "تاجر بسلاسة بالعربية والفرنسية والإنجليزية." },
        { title: "الخدمات اللوجستية والتصدير", desc: "دعم متكامل للشحن والتصدير لتسليم سلس." },
      ],
    },
    stats: {
      title: "نُشغّل التجارة عبر المنطقة",
      items: [
        { value: "+12,000", label: "مورّد موثّق" },
        { value: "+480K", label: "منتج مُدرج" },
        { value: "+35", label: "صناعة مغطّاة" },
        { value: "24 س", label: "متوسط وقت العرض" },
      ],
    },
    testimonials: {
      title: "موثوق من شركات مثل شركتك",
      subtitle: "استمع إلى المشترين والموردين الذين ينمون مع ألسوق",
      items: [
        { quote: "ساعدتنا ألسوق في العثور على مصدّري زيت زيتون موثوقين في أيام لا أشهر. التحقق من الجودة نقلة نوعية.", name: "سونيا بن علي", role: "مديرة المشتريات، يوروفودز" },
        { quote: "كمصنّع، ضاعفنا استفسارات التصدير ثلاث مرات خلال الربع الأول من انضمامنا للمنصة.", name: "كريم الطرابلسي", role: "الرئيس التنفيذي، قرطاج للمنسوجات" },
        { quote: "نظام طلب العروض فعّال للغاية. استلمنا خمسة عروض تنافسية بين ليلة وضحاها.", name: "ليلى منصور", role: "مشترية، أطلس للتوزيع" },
      ],
    },
    footer: {
      tagline: "السوق الفاخر B2B الذي يربط تونس بشمال إفريقيا.",
      newsletter: "ابقَ على اطلاع",
      newsletterDesc: "احصل على رؤى تجارية وتنبيهات الموردين الجدد.",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      subscribe: "اشترك",
      colBuy: "للمشترين",
      colSell: "للموردين",
      colCompany: "الشركة",
      colSupport: "الدعم",
      buy: ["تصفّح الفئات", "طلب عروض الأسعار", "التأمين التجاري", "حماية المشتري"],
      sell: ["البيع على ألسوق", "عضوية المورّد", "التوثيق", "خدمات التصدير"],
      company: ["من نحن", "الوظائف", "الصحافة", "الشركاء"],
      support: ["مركز المساعدة", "اتصل بنا", "دليل الشحن", "الإبلاغ عن إساءة"],
      rights: "جميع الحقوق محفوظة.",
      terms: "الشروط",
      privacy: "الخصوصية",
      country: "تونس",
    },
    marketplace: {
      breadcrumbHome: "الرئيسية",
      loading: "جارٍ التحميل…",
      error: "حدث خطأ ما",
      errorDesc: "تعذّر تحميل هذا المحتوى. يرجى المحاولة مرة أخرى.",
      retry: "إعادة المحاولة",
      companies: {
        title: "الشركات",
        subtitle: "تصفّح الشركات الموثّقة ومتاجرها عبر السوق.",
        empty: "لا توجد شركات لعرضها بعد.",
        verified: "موثّقة",
        storefronts: "المتاجر",
        categories: "الفئات",
        website: "زيارة الموقع",
        viewStore: "عرض المتجر",
        viewProducts: "عرض المنتجات",
        notFound: "الشركة غير موجودة",
        notFoundDesc: "هذه الشركة غير موجودة أو لم تعد متاحة.",
        back: "العودة إلى الشركات",
      },
      categories: {
        title: "الفئات",
        subtitle: "استكشف المنتجات حسب الفئة عبر السوق.",
        empty: "لا توجد فئات لعرضها بعد.",
        productsIn: "منتجات في هذه الفئة",
        subcategories: "الفئات الفرعية",
        notFound: "الفئة غير موجودة",
        notFoundDesc: "هذه الفئة غير موجودة أو لم تعد متاحة.",
        back: "العودة إلى الفئات",
      },
      stores: {
        about: "نبذة",
        products: "المنتجات",
        categories: "الفئات",
        empty: "لم ينشر هذا المتجر أي منتجات بعد.",
        viewCompany: "عرض الشركة",
        notFound: "المتجر غير موجود",
        notFoundDesc: "هذا المتجر غير موجود أو لم يعد نشطًا.",
      },
      products: {
        title: "المنتجات",
        subtitle: "اكتشف منتجات الموردين في تونس وشمال إفريقيا.",
        empty: "لا توجد منتجات لعرضها بعد.",
        moq: "الحد الأدنى للطلب",
        perUnit: "لكل وحدة",
        priceOnRequest: "السعر عند الطلب",
        inStock: "متوفر",
        outOfStock: "غير متوفر",
        sku: "الرمز",
        description: "الوصف",
        details: "التفاصيل",
        soldBy: "يُباع بواسطة",
        categories: "الفئات",
        gallery: "المعرض",
        noImage: "لا توجد صورة متاحة",
        viewProduct: "عرض المنتج",
        notFound: "المنتج غير موجود",
        notFoundDesc: "هذا المنتج غير موجود أو لم يعد متاحًا.",
        back: "العودة إلى المنتجات",
      },
    },
    search: {
      title: "بحث",
      placeholder: "ابحث عن منتجات أو موردين أو شركات…",
      button: "بحث",
      resultsFor: "نتائج البحث عن",
      searching: "جارٍ البحث…",
      prompt: "ابحث عن الموردين والشركات والمنتجات في السوق.",
      noResults: "لا توجد نتائج",
      noResultsDesc: "جرّب كلمة مختلفة أو تحقق من الإملاء.",
      suppliers: "الموردون",
      companies: "الشركات",
      products: "المنتجات",
    },
    ai: {
      launch: "اسأل ألسوق",
      title: "مساعد ألسوق",
      subtitle: "مساعدك في التجارة بين الشركات",
      placeholder: "اسأل عن الموردين أو المنتجات أو طلبات عروض الأسعار…",
      send: "إرسال",
      greeting: "مرحبًا! يمكنني مساعدتك في العثور على الموردين ومقارنة المنتجات وإعداد طلبات عروض الأسعار. ما الذي تبحث عنه اليوم؟",
      thinking: "جارٍ التفكير…",
      error: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      disabledTitle: "المساعد قريبًا",
      disabledBody: "مساعد الذكاء الاصطناعي غير مُفعّل بعد. في هذه الأثناء، استخدم البحث للعثور على الموردين والمنتجات، أو انشر طلب عرض سعر.",
    },
    discovery: {
      title: "استكشاف الموردين وجولات المصانع المباشرة",
      subtitle: "ادخل إلى أفضل مرافق التصنيع التونسية وتحقق من الجودة مباشرة عبر عروض فيديو حصرية لمشاهدة الإنتاج الفعلي.",
      tabs: {
        all: "كل العروض",
        factory: "أبرز مزايا المصانع",
        product: "عروض المنتجات",
        process: "جولات خطوط الإنتاج"
      },
      items: [
        { title: "عملية العصر البارد لزيت الزيتون البكر الممتاز", supplier: "شركة مدينة للزيتون", duration: "2:45", views: "3.4k مشاهدة", category: "الأغذية والزراعة", type: "process" },
        { title: "جولة في مصنع الغزل والنسيج الدائري المؤتمت", supplier: "قرطاج للمنسوجات", duration: "3:15", views: "1.8k مشاهدة", category: "المنسوجات", type: "factory" },
        { title: "تقنيات تشكيل وتلوين الخزف الفخاري يدوياً", supplier: "أطلس للخزف", duration: "1:50", views: "2.1k مشاهدة", category: "الحرف اليدوية", type: "product" },
        { title: "خطوط فرز التمور وتغليفها الصديق للبيئة", supplier: "الصحراء لتصدير التمور", duration: "2:10", views: "1.2k مشاهدة", category: "الأغذية والزراعة", type: "process" },
        { title: "استعراض لقص الجلد الآلي وتجميع الأحذية الفاخرة", supplier: "القيروان للجلود", duration: "3:40", views: "940 مشاهدة", category: "المنتجات الجلدية", type: "product" },
        { title: "جولة في عمليات كبس المعادن واللحام عالية الدقة", supplier: "تونس للأشغال المعدنية", duration: "4:05", views: "1.5k مشاهدة", category: "صناعي", type: "factory" }
      ]
    },
    export: {
      title: "ميزة التصدير الاستراتيجية لتونس",
      subtitle: "استورد من مركز تصنيع حديث ذي مستوى عالمي يقع في مفترق الطرق بين أوروبا وأفريقيا والشرق الأوسط.",
      items: [
        { title: "قرب جغرافي لا مثيل له", desc: "تقع تونس على بعد 140 كم فقط من جنوب أوروبا، مما يضمن أوقات شحن قياسية وقصيرة للغاية.", stat: "1-3 أيام", statLabel: "العبور إلى أوروبا" },
        { title: "اتفاقيات التجارة الحرة", desc: "استفد من الإعفاء الجمركي الكامل بفضل اتفاقيات الشراكة مع الاتحاد الأوروبي والمملكة المتحدة وأفريقيا.", stat: "0%", statLabel: "التعريفات الجمركية" },
        { title: "مهارة يدوية معتمدة وعريقة", desc: "وصول إلى إرث غني من الدقة الهندسية والحرف الفنية والأغذية الزراعية الفاخرة المعتمدة دولياً.", stat: "100%", statLabel: "معايير موثقة" },
        { title: "موانئ تجارية حديثة", desc: "شبكة نقل بحري متكاملة مع بنية تحتية وموانئ تجارية مجهزة لتسريع إجراءات التصدير.", stat: "7+ موانئ", statLabel: "نشطة للتصدير" }
      ]
    },
  },
}
