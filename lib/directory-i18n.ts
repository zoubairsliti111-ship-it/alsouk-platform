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
  countries: Record<CountryKey, string>
  regions: Record<RegionKey, string>
  categories: Record<CategoryKey, string>
  businessTypes: Record<BusinessTypeKey, string>
  cities: Record<string, string>
  moqTiers: Record<MoqTier, string>
  yearsTiers: Record<YearsTier, string>
  anyOption: string
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
  },
}
