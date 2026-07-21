import type { Lang } from "@/lib/i18n"
import type {
  BusinessTypeKey,
  CategoryKey,
  CountryKey,
  MoqTier,
  RegionKey,
  YearsTier,
} from "@/lib/directory-data"

type DirectoryDict = {
  breadcrumbHome: string
  hero: {
    badge: string
    title: string
    subtitle: string
    stat1: string
    stat1label: string
    stat2: string
    stat2label: string
    stat3: string
    stat3label: string
  }
  search: {
    placeholder: string
    button: string
  }
  filters: {
    title: string
    clearAll: string
    country: string
    region: string
    category: string
    businessType: string
    verified: string
    verifiedOnly: string
    moq: string
    years: string
    showFilters: string
    hideFilters: string
    apply: string
  }
  sort: {
    label: string
    relevance: string
    rating: string
    products: string
    years: string
  }
  results: {
    count: (n: number) => string
    verifiedFilterActive: string
  }
  card: {
    verified: string
    rating: string
    reviews: string
    products: string
    yearsInBusiness: string
    responseRate: string
    mainCategories: string
    contact: string
    quote: string
    moqFrom: string
  }
  empty: {
    title: string
    subtitle: string
    reset: string
  }
  error: {
    title: string
    subtitle: string
    retry: string
  }
  pagination: {
    label: string
    previous: string
    next: string
    pageOf: (page: number, total: number) => string
  }
  countries: Record<CountryKey, string>
  regions: Record<RegionKey, string>
  categories: Record<CategoryKey, string>
  businessTypes: Record<BusinessTypeKey, string>
  cities: Record<string, string>
  moqTiers: Record<MoqTier, string>
  yearsTiers: Record<YearsTier, string>
  anyOption: string
  profile: {
    backToDirectory: string
    verified: string
    memberSince: string
    about: string
    aboutEmpty: string
    gallery: string
    galleryEmpty: string
    categories: string
    products: string
    productsCount: (n: number) => string
    productsEmpty: string
    certifications: string
    certificationsEmpty: string
    commercialTerms: string
    moq: string
    moqUnit: string
    responseRate: string
    rating: string
    reviews: string
    businessType: string
    yearsInBusiness: string
    location: string
    region: string
    requestQuote: string
    contactSupplier: string
    notFoundTitle: string
    notFoundSubtitle: string
    errorTitle: string
    errorSubtitle: string
    retry: string
  }
}

export const directoryT: Record<Lang, DirectoryDict> = {
  en: {
    breadcrumbHome: "Home",
    hero: {
      badge: "Verified B2B Suppliers Directory",
      title: "Find trusted suppliers across North Africa",
      subtitle:
        "Browse thousands of verified manufacturers, exporters and wholesalers. Filter by country, category and business type, then request quotes in minutes.",
      stat1: "12,000+",
      stat1label: "Verified suppliers",
      stat2: "35+",
      stat2label: "Industries",
      stat3: "24 h",
      stat3label: "Avg. response",
    },
    search: {
      placeholder: "Search suppliers, products or categories...",
      button: "Search",
    },
    filters: {
      title: "Filters",
      clearAll: "Clear all",
      country: "Country",
      region: "Region",
      category: "Category",
      businessType: "Business type",
      verified: "Verification",
      verifiedOnly: "Verified suppliers only",
      moq: "Minimum order quantity",
      years: "Years in business",
      showFilters: "Show filters",
      hideFilters: "Hide filters",
      apply: "Apply",
    },
    sort: {
      label: "Sort by",
      relevance: "Relevance",
      rating: "Highest rated",
      products: "Most products",
      years: "Most experienced",
    },
    results: {
      count: (n) => `${n} supplier${n === 1 ? "" : "s"} found`,
      verifiedFilterActive: "Verified only",
    },
    card: {
      verified: "Verified",
      rating: "Rating",
      reviews: "reviews",
      products: "Products",
      yearsInBusiness: "Years",
      responseRate: "Response",
      mainCategories: "Main categories",
      contact: "Contact",
      quote: "Request quotation",
      moqFrom: "MOQ from",
    },
    empty: {
      title: "No suppliers match your filters",
      subtitle: "Try adjusting or clearing some filters to see more results.",
      reset: "Clear all filters",
    },
    error: {
      title: "Couldn't load suppliers",
      subtitle: "We couldn't reach the suppliers database. Please try again in a moment.",
      retry: "Try again",
    },
    pagination: {
      label: "Suppliers pagination",
      previous: "Previous",
      next: "Next",
      pageOf: (page, total) => `Page ${page} of ${total}`,
    },
    countries: {
      tn: "Tunisia",
      ma: "Morocco",
      dz: "Algeria",
      eg: "Egypt",
      ly: "Libya",
    },
    regions: {
      capital: "Capital region",
      north: "North",
      central: "Central",
      south: "South",
      coastal: "Coastal",
    },
    categories: {
      food: "Food & Agriculture",
      textiles: "Textiles & Apparel",
      machinery: "Industrial Machinery",
      construction: "Construction & Building",
      handicrafts: "Handicrafts & Ceramics",
      cosmetics: "Cosmetics & Health",
      leather: "Leather & Footwear",
      chemicals: "Chemicals & Plastics",
    },
    businessTypes: {
      manufacturer: "Manufacturer",
      supplier: "Supplier",
      exporter: "Exporter",
      wholesaler: "Wholesaler",
    },
    cities: {
      sfax: "Sfax",
      monastir: "Monastir",
      nabeul: "Nabeul",
      tozeur: "Tozeur",
      kairouan: "Kairouan",
      tunis: "Tunis",
      casablanca: "Casablanca",
      marrakech: "Marrakech",
      algiers: "Algiers",
      oran: "Oran",
      cairo: "Cairo",
      alexandria: "Alexandria",
      tripoli: "Tripoli",
      benghazi: "Benghazi",
    },
    moqTiers: {
      any: "Any quantity",
      lt100: "Under 100 units",
      "100to500": "100 – 500 units",
      "500to1000": "500 – 1,000 units",
      gt1000: "Over 1,000 units",
    },
    yearsTiers: {
      any: "Any experience",
      "1to3": "1 – 3 years",
      "3to5": "3 – 5 years",
      "5to10": "5 – 10 years",
      gt10: "Over 10 years",
    },
    anyOption: "All",
    profile: {
      backToDirectory: "Back to directory",
      verified: "Verified supplier",
      memberSince: "On ALSOUK since",
      about: "About the company",
      aboutEmpty: "This supplier hasn't added a company description yet.",
      gallery: "Gallery",
      galleryEmpty: "No gallery images have been published yet.",
      categories: "Product categories",
      products: "Products",
      productsCount: (n) => `${n} product${n === 1 ? "" : "s"} in catalog`,
      productsEmpty: "The full product catalog isn't available online yet — request a quote to receive it.",
      certifications: "Certifications",
      certificationsEmpty: "No certifications have been listed yet.",
      commercialTerms: "Commercial terms",
      moq: "Minimum order",
      moqUnit: "units",
      responseRate: "Response rate",
      rating: "Rating",
      reviews: "reviews",
      businessType: "Business type",
      yearsInBusiness: "Years in business",
      location: "Location",
      region: "Region",
      requestQuote: "Request Quote",
      contactSupplier: "Contact supplier",
      notFoundTitle: "Supplier not found",
      notFoundSubtitle: "We couldn't find the supplier you're looking for. It may have been removed.",
      errorTitle: "Couldn't load this supplier",
      errorSubtitle: "We couldn't reach the suppliers database. Please try again in a moment.",
      retry: "Try again",
    },
  },
  fr: {
    breadcrumbHome: "Accueil",
    hero: {
      badge: "Annuaire de fournisseurs B2B vérifiés",
      title: "Trouvez des fournisseurs de confiance en Afrique du Nord",
      subtitle:
        "Parcourez des milliers de fabricants, exportateurs et grossistes vérifiés. Filtrez par pays, catégorie et type d'entreprise, puis demandez des devis en quelques minutes.",
      stat1: "12 000+",
      stat1label: "Fournisseurs vérifiés",
      stat2: "35+",
      stat2label: "Industries",
      stat3: "24 h",
      stat3label: "Réponse moy.",
    },
    search: {
      placeholder: "Rechercher fournisseurs, produits ou catégories...",
      button: "Rechercher",
    },
    filters: {
      title: "Filtres",
      clearAll: "Tout effacer",
      country: "Pays",
      region: "Région",
      category: "Catégorie",
      businessType: "Type d'entreprise",
      verified: "Vérification",
      verifiedOnly: "Fournisseurs vérifiés uniquement",
      moq: "Quantité minimale de commande",
      years: "Années d'activité",
      showFilters: "Afficher les filtres",
      hideFilters: "Masquer les filtres",
      apply: "Appliquer",
    },
    sort: {
      label: "Trier par",
      relevance: "Pertinence",
      rating: "Mieux notés",
      products: "Plus de produits",
      years: "Plus expérimentés",
    },
    results: {
      count: (n) => `${n} fournisseur${n === 1 ? "" : "s"} trouvé${n === 1 ? "" : "s"}`,
      verifiedFilterActive: "Vérifiés uniquement",
    },
    card: {
      verified: "Vérifié",
      rating: "Note",
      reviews: "avis",
      products: "Produits",
      yearsInBusiness: "Années",
      responseRate: "Réponse",
      mainCategories: "Catégories principales",
      contact: "Contacter",
      quote: "Demander un devis",
      moqFrom: "Qté min. dès",
    },
    empty: {
      title: "Aucun fournisseur ne correspond à vos filtres",
      subtitle: "Essayez d'ajuster ou d'effacer certains filtres pour voir plus de résultats.",
      reset: "Effacer tous les filtres",
    },
    error: {
      title: "Impossible de charger les fournisseurs",
      subtitle: "Nous n'avons pas pu joindre la base de données des fournisseurs. Veuillez réessayer dans un instant.",
      retry: "Réessayer",
    },
    pagination: {
      label: "Pagination des fournisseurs",
      previous: "Précédent",
      next: "Suivant",
      pageOf: (page, total) => `Page ${page} sur ${total}`,
    },
    countries: {
      tn: "Tunisie",
      ma: "Maroc",
      dz: "Algérie",
      eg: "Égypte",
      ly: "Libye",
    },
    regions: {
      capital: "Région de la capitale",
      north: "Nord",
      central: "Centre",
      south: "Sud",
      coastal: "Côtier",
    },
    categories: {
      food: "Alimentation & Agriculture",
      textiles: "Textiles & Habillement",
      machinery: "Machines industrielles",
      construction: "Construction & Bâtiment",
      handicrafts: "Artisanat & Céramique",
      cosmetics: "Cosmétiques & Santé",
      leather: "Cuir & Chaussures",
      chemicals: "Chimie & Plastiques",
    },
    businessTypes: {
      manufacturer: "Fabricant",
      supplier: "Fournisseur",
      exporter: "Exportateur",
      wholesaler: "Grossiste",
    },
    cities: {
      sfax: "Sfax",
      monastir: "Monastir",
      nabeul: "Nabeul",
      tozeur: "Tozeur",
      kairouan: "Kairouan",
      tunis: "Tunis",
      casablanca: "Casablanca",
      marrakech: "Marrakech",
      algiers: "Alger",
      oran: "Oran",
      cairo: "Le Caire",
      alexandria: "Alexandrie",
      tripoli: "Tripoli",
      benghazi: "Benghazi",
    },
    moqTiers: {
      any: "Toute quantité",
      lt100: "Moins de 100 unités",
      "100to500": "100 – 500 unités",
      "500to1000": "500 – 1 000 unités",
      gt1000: "Plus de 1 000 unités",
    },
    yearsTiers: {
      any: "Toute expérience",
      "1to3": "1 – 3 ans",
      "3to5": "3 – 5 ans",
      "5to10": "5 – 10 ans",
      gt10: "Plus de 10 ans",
    },
    anyOption: "Tous",
    profile: {
      backToDirectory: "Retour à l'annuaire",
      verified: "Fournisseur vérifié",
      memberSince: "Sur ALSOUK depuis",
      about: "À propos de l'entreprise",
      aboutEmpty: "Ce fournisseur n'a pas encore ajouté de description.",
      gallery: "Galerie",
      galleryEmpty: "Aucune image de galerie n'a encore été publiée.",
      categories: "Catégories de produits",
      products: "Produits",
      productsCount: (n) => `${n} produit${n === 1 ? "" : "s"} au catalogue`,
      productsEmpty: "Le catalogue complet n'est pas encore disponible en ligne — demandez un devis pour le recevoir.",
      certifications: "Certifications",
      certificationsEmpty: "Aucune certification n'a encore été renseignée.",
      commercialTerms: "Conditions commerciales",
      moq: "Commande minimale",
      moqUnit: "unités",
      responseRate: "Taux de réponse",
      rating: "Note",
      reviews: "avis",
      businessType: "Type d'entreprise",
      yearsInBusiness: "Années d'activité",
      location: "Emplacement",
      region: "Région",
      requestQuote: "Demander un devis",
      contactSupplier: "Contacter le fournisseur",
      notFoundTitle: "Fournisseur introuvable",
      notFoundSubtitle: "Nous n'avons pas trouvé le fournisseur recherché. Il a peut-être été supprimé.",
      errorTitle: "Impossible de charger ce fournisseur",
      errorSubtitle: "Nous n'avons pas pu joindre la base de données des fournisseurs. Veuillez réessayer dans un instant.",
      retry: "Réessayer",
    },
  },
  ar: {
    breadcrumbHome: "الرئيسية",
    hero: {
      badge: "دليل الموردين الموثّقين B2B",
      title: "اعثر على موردين موثوقين في شمال إفريقيا",
      subtitle:
        "تصفّح آلاف المصنّعين والمصدّرين وتجار الجملة الموثّقين. صفِّ حسب البلد والفئة ونوع النشاط، ثم اطلب عروض الأسعار في دقائق.",
      stat1: "+12,000",
      stat1label: "مورّد موثّق",
      stat2: "+35",
      stat2label: "صناعة",
      stat3: "24 س",
      stat3label: "متوسط الرد",
    },
    search: {
      placeholder: "ابحث عن موردين أو منتجات أو فئات...",
      button: "بحث",
    },
    filters: {
      title: "عوامل التصفية",
      clearAll: "مسح الكل",
      country: "البلد",
      region: "المنطقة",
      category: "الفئة",
      businessType: "نوع النشاط",
      verified: "التوثيق",
      verifiedOnly: "الموردون الموثّقون فقط",
      moq: "الحد الأدنى للطلب",
      years: "سنوات النشاط",
      showFilters: "إظهار عوامل التصفية",
      hideFilters: "إخفاء عوامل التصفية",
      apply: "تطبيق",
    },
    sort: {
      label: "ترتيب حسب",
      relevance: "الصلة",
      rating: "الأعلى تقييماً",
      products: "الأكثر منتجات",
      years: "الأكثر خبرة",
    },
    results: {
      count: (n) => `تم العثور على ${n} مورّد`,
      verifiedFilterActive: "الموثّقون فقط",
    },
    card: {
      verified: "موثّق",
      rating: "التقييم",
      reviews: "مراجعة",
      products: "منتج",
      yearsInBusiness: "سنة",
      responseRate: "الرد",
      mainCategories: "الفئات الرئيسية",
      contact: "تواصل",
      quote: "طلب عرض سعر",
      moqFrom: "الحد الأدنى من",
    },
    empty: {
      title: "لا يوجد موردون يطابقون عوامل التصفية",
      subtitle: "حاول تعديل أو مسح بعض عوامل التصفية لرؤية المزيد من النتائج.",
      reset: "مسح كل عوامل التصفية",
    },
    error: {
      title: "تعذّر تحميل الموردين",
      subtitle: "تعذّر الوصول إلى قاعدة بيانات الموردين. يُرجى المحاولة مرة أخرى بعد قليل.",
      retry: "إعادة المحاولة",
    },
    pagination: {
      label: "ترقيم صفحات الموردين",
      previous: "السابق",
      next: "التالي",
      pageOf: (page, total) => `صفحة ${page} من ${total}`,
    },
    countries: {
      tn: "تونس",
      ma: "المغرب",
      dz: "الجزائر",
      eg: "مصر",
      ly: "ليبيا",
    },
    regions: {
      capital: "منطقة العاصمة",
      north: "الشمال",
      central: "الوسط",
      south: "الجنوب",
      coastal: "الساحل",
    },
    categories: {
      food: "الأغذية والزراعة",
      textiles: "المنسوجات والملابس",
      machinery: "الآلات الصناعية",
      construction: "البناء والتشييد",
      handicrafts: "الحرف والخزف",
      cosmetics: "مستحضرات التجميل والصحة",
      leather: "الجلود والأحذية",
      chemicals: "الكيماويات والبلاستيك",
    },
    businessTypes: {
      manufacturer: "مصنّع",
      supplier: "مورّد",
      exporter: "مصدّر",
      wholesaler: "تاجر جملة",
    },
    cities: {
      sfax: "صفاقس",
      monastir: "المنستير",
      nabeul: "نابل",
      tozeur: "توزر",
      kairouan: "القيروان",
      tunis: "تونس",
      casablanca: "الدار البيضاء",
      marrakech: "مراكش",
      algiers: "الجزائر العاصمة",
      oran: "وهران",
      cairo: "القاهرة",
      alexandria: "الإسكندرية",
      tripoli: "طرابلس",
      benghazi: "بنغازي",
    },
    moqTiers: {
      any: "أي كمية",
      lt100: "أقل من 100 وحدة",
      "100to500": "100 – 500 وحدة",
      "500to1000": "500 – 1,000 وحدة",
      gt1000: "أكثر من 1,000 وحدة",
    },
    yearsTiers: {
      any: "أي خبرة",
      "1to3": "1 – 3 سنوات",
      "3to5": "3 – 5 سنوات",
      "5to10": "5 – 10 سنوات",
      gt10: "أكثر من 10 سنوات",
    },
    anyOption: "الكل",
    profile: {
      backToDirectory: "العودة إلى الدليل",
      verified: "مورّد موثّق",
      memberSince: "على ألسوق منذ",
      about: "عن الشركة",
      aboutEmpty: "لم يضف هذا المورّد وصفاً للشركة بعد.",
      gallery: "معرض الصور",
      galleryEmpty: "لم يتم نشر أي صور في المعرض بعد.",
      categories: "فئات المنتجات",
      products: "المنتجات",
      productsCount: (n) => `${n} منتج في الكتالوج`,
      productsEmpty: "الكتالوج الكامل غير متاح على الإنترنت بعد — اطلب عرض سعر لاستلامه.",
      certifications: "الشهادات",
      certificationsEmpty: "لم يتم إدراج أي شهادات بعد.",
      commercialTerms: "الشروط التجارية",
      moq: "الحد الأدنى للطلب",
      moqUnit: "وحدة",
      responseRate: "معدل الرد",
      rating: "التقييم",
      reviews: "مراجعة",
      businessType: "نوع النشاط",
      yearsInBusiness: "سنوات النشاط",
      location: "الموقع",
      region: "المنطقة",
      requestQuote: "طلب عرض سعر",
      contactSupplier: "تواصل مع المورّد",
      notFoundTitle: "المورّد غير موجود",
      notFoundSubtitle: "تعذّر العثور على المورّد المطلوب. ربما تمت إزالته.",
      errorTitle: "تعذّر تحميل هذا المورّد",
      errorSubtitle: "تعذّر الوصول إلى قاعدة بيانات الموردين. يُرجى المحاولة مرة أخرى بعد قليل.",
      retry: "إعادة المحاولة",
    },
  },
}
