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
        { name: "Extra Virgin Olive Oil", price: "$4.50 - $6.20", moq: "500 L", supplier: "Medina Olive Co." },
        { name: "Premium Cotton Fabric", price: "$2.10 - $3.40", moq: "1,000 m", supplier: "Carthage Textiles" },
        { name: "Handcrafted Ceramic Tiles", price: "$8.00 - $14.00", moq: "200 pcs", supplier: "Atlas Ceramics" },
        { name: "Deglet Nour Dates", price: "$3.20 - $5.00", moq: "1 ton", supplier: "Sahara Dates Export" },
        { name: "Genuine Leather Goods", price: "$12.00 - $28.00", moq: "100 pcs", supplier: "Kairouan Leather" },
        { name: "Industrial Components", price: "$15.00 - $45.00", moq: "50 pcs", supplier: "Tunis Metalworks" },
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
        { name: "Huile d'olive extra vierge", price: "4,50 $ - 6,20 $", moq: "500 L", supplier: "Medina Olive Co." },
        { name: "Tissu de coton premium", price: "2,10 $ - 3,40 $", moq: "1 000 m", supplier: "Carthage Textiles" },
        { name: "Carreaux en céramique artisanaux", price: "8,00 $ - 14,00 $", moq: "200 pcs", supplier: "Atlas Ceramics" },
        { name: "Dattes Deglet Nour", price: "3,20 $ - 5,00 $", moq: "1 tonne", supplier: "Sahara Dates Export" },
        { name: "Articles en cuir véritable", price: "12,00 $ - 28,00 $", moq: "100 pcs", supplier: "Kairouan Leather" },
        { name: "Composants industriels", price: "15,00 $ - 45,00 $", moq: "50 pcs", supplier: "Tunis Metalworks" },
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
        { name: "زيت زيتون بكر ممتاز", price: "4.50$ - 6.20$", moq: "500 لتر", supplier: "شركة مدينة للزيتون" },
        { name: "قماش قطني فاخر", price: "2.10$ - 3.40$", moq: "1,000 م", supplier: "قرطاج للمنسوجات" },
        { name: "بلاط خزفي يدوي الصنع", price: "8.00$ - 14.00$", moq: "200 قطعة", supplier: "أطلس للخزف" },
        { name: "تمور دقلة النور", price: "3.20$ - 5.00$", moq: "1 طن", supplier: "الصحراء لتصدير التمور" },
        { name: "منتجات جلدية أصلية", price: "12.00$ - 28.00$", moq: "100 قطعة", supplier: "القيروان للجلود" },
        { name: "مكوّنات صناعية", price: "15.00$ - 45.00$", moq: "50 قطعة", supplier: "تونس للأشغال المعدنية" },
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
  },
}
