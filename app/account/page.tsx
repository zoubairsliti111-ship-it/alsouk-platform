"use client"

import { useEffect, useState, useTransition, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { StudioPanel } from "@/components/studio/studio-panel"
import { useAuth } from "@/components/auth-provider"
import { BuyerAccountView } from "@/components/account/buyer-account-view"
import { ImagePlus } from "lucide-react"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import {
  fetchCompanyForUser,
  createCompany,
  updateCompany
} from "@/lib/supabase/company-service"
import { type Company } from "@/lib/directory-data"
import { MerchantPosts } from "@/components/marketplace/merchant-posts"
import { getProducts } from "@/lib/services/products-service"
import { getExhibitions } from "@/lib/services/exhibitions-service"
import { ProductCard } from "@/components/marketplace/product-card"
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  Loader2,
  Building2,
  ShoppingBag,
  ChevronRight,
  Sparkles,
  Globe,
  MapPin,
  Lock,
  Calendar,
  Box,
  Edit2,
  Save,
  X,
  FileText,
  Trash2,
  Plus,
  Layers,
  Image as ImageIcon,
  Award,
  ExternalLink,
  Eye,
  CheckCircle,
  AlertCircle,
  Store,
  Share2,
  Check,
  QrCode,
  ThumbsUp,
  MessageCircle,
  Send,
  Heart,
  Briefcase,
  Users,
  Flag,
  Languages,
  BadgeAlert,
  Menu,
  PhoneCall
} from "lucide-react"

// Predefined Tunisian/North African countries and cities matching directory-data
const COUNTRY_TO_CITIES: Record<string, string[]> = {
  tn: ["tunis", "sfax", "monastir", "nabeul", "tozeur", "kairouan"],
  ma: ["casablanca", "marrakech"],
  dz: ["algiers", "oran"],
  eg: ["cairo", "alexandria"],
  ly: ["tripoli", "benghazi"]
}

// Predefined lists for B2B classification
const BUSINESS_TYPES = [
  "manufacturer",
  "supplier",
  "exporter",
  "wholesaler",
  "distributor",
  "service_provider"
]

const INDUSTRIES = [
  "food",
  "textiles",
  "machinery",
  "construction",
  "handicrafts",
  "cosmetics",
  "leather",
  "chemicals",
  "agriculture"
]

const LANGUAGES_OPTIONS = [
  { key: "ar", label: "العربية (Arabic)" },
  { key: "fr", label: "Français (French)" },
  { key: "en", label: "English" }
]

const EXPORT_MARKETS_OPTIONS = [
  { key: "tn", label: "Tunisia (تونس)" },
  { key: "ly", label: "Libya (ليبيا)" },
  { key: "dz", label: "Algeria (الجزائر)" },
  { key: "eu", label: "Europe" },
  { key: "gcc", label: "GCC (الخليج)" },
  { key: "af", label: "Africa (إفريقيا)" }
]

const PREDEFINED_EMOJIS = ["👤", "💼", "🏭", "📦", "🛒", "🏢", "🧑‍💼", "👩‍💼", "🌾", "🦁", "🌟"]

const localT = {
  en: {
    personalInfo: "Personal Information",
    statFollowers: "Followers",
    statFollowing: "Following",
    statProducts: "Products",
    statRfqsMatching: "RFQs Matching",
    statUpdatesPosted: "Updates Posted",
    statExhibitions: "Exhibitions",
    statBuyerReviews: "Buyer Reviews",
    editBusinessParams: "Edit Business Parameters",
    editBusinessParamsDesc: "Adjust your trade classifications and regional parameters based on level",
    companyNameLabel: "Company Name",
    sloganLabel: "Slogan / Pitch",
    descriptionLabel: "Description",
    businessEmailLabel: "Business Email",
    whatsappNumberLabel: "WhatsApp Number",
    activateSupplierSpace: "Complete Your Profile",
    tabBuyerReviews: "Buyer Reviews",
    verifiedReviewsTitle: "Verified Buyer Reviews",
    verifiedReviewsDesc: "Authentic comments, ratings, and feedback from regional partners",
    noReviewsYetTitle: "No reviews yet",
    noReviewsYetDesc: "Reviews from verified buyers will appear here once available.",
    tabAboutTrade: "About & Trade",
    tabInstagramFeed: "Instagram Feed",
    tabFeaturedProducts: "Featured Products",
    accountStatusLabel: "Account Status",
    progressiveProfileTitle: "Progressive B2B Profile System",
    progressiveProfileDesc: "Only show capabilities assigned to your account plan. Starter plans keep your space simple, while Business and Enterprise unlock advanced features.",
    assignedByAlsouk: "Assigned by ALSOUK",
    requestPlanUpgrade: "Request Plan Upgrade",
    boostTrustTitle: "Increase profile completeness to boost buyer trust",
    boostTrustDescPrefix: "Your profile completion is currently at",
    boostTrustDescSuffix: "%. Complete the missing fields below to achieve verified status and get highlighted search placements.",
    companyOverviewTitle: "Company Overview",
    companyOverviewDefault: "Welcome to our B2B trade profile. Complete your description to tell regional buyers about your factory capacity, organic quality, and direct export options.",
    tradeInformationTitle: "Trade Information",
    wholesaleSupplierDefault: "Wholesale B2B Supplier from Tunisia",
    exporterWholesalerDefault: "Exporter & Wholesaler",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    editProfile: "Edit Profile",
    avatar: "Avatar",
    country: "Country",
    city: "City",
    accountType: "Account Type",
    companyInfo: "Company Information",
    editCompany: "Edit Company Profile",
    completeCompanyCta: "Complete your company profile",
    completeCompanyDesc: "Showcase your capabilities, products, and verification to regional & global B2B buyers.",
    security: "Security",
    changePassword: "Change Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    updatePasswordBtn: "Update Password",
    accountSummary: "Account Summary",
    memberSince: "Member Since",
    numProducts: "Number of Products",
    numRfqs: "Number of RFQs",
    numMessages: "Number of Messages",
    passwordUpdated: "Password updated successfully!",
    profileUpdated: "Profile updated successfully!",
    companyUpdated: "Company profile updated successfully!",
    selectCity: "Select City",
    selectCountry: "Select Country",
    enterCity: "Enter your city",
    updating: "Saving...",
    passwordLengthError: "Password must be at least 8 characters long",
    passwordMismatchError: "Passwords do not match",
    requiredFieldsError: "Please fill in all required fields",
    customAvatarUrl: "Or paste a custom avatar image URL",
    avatarOptionLabel: "Choose an Avatar Icon / Emoji",
    savingChanges: "Saving...",
    tagline: "Tagline / Pitch",
    description: "Company Description",
    logoUrl: "Logo Image URL",
    bannerUrl: "Banner Image URL",
    websiteUrl: "Website URL",
    websiteMode: "Website Strategy",
    businessEmail: "Business Email",
    whatsappNumber: "WhatsApp Number (with prefix)",
    streetAddress: "Street Address",
    postalCode: "Postal Code",
    businessType: "Business Type",
    primaryIndustry: "Primary Industry",
    yearEstablished: "Year Established",
    companySize: "Company Size (Employees)",
    taxIdentifier: "Tax Identifier (Matricule Fiscal / RNE)",
    supportedLanguages: "Supported Languages",
    exportMarkets: "Target Export Markets",
    socialLinks: "Social Presence & Networks",
    profileProgress: "Profile Progress",
    verificationStatus: "Verification Tier",
    previewPublic: "Preview Public Page",
    previewStore: "Preview Store",
    checklistTitle: "Missing Information Checklist",
    onboardingTitle: "Register Your B2B Company",
    onboardingDesc: "Set up your official company profile to access regional buyers, showcase custom catalogs, and receive instant RFQs.",
    launchOnboarding: "Launch Company Profile",
    addGalleryPhoto: "Add Gallery Image Link",
    addCertificate: "Add Quality Certificate",
    photoUrlLabel: "Photo/Document URL",
    captionLabel: "Caption / Title",
    addBtn: "Add Asset",
    noMedia: "No media assets uploaded yet."
  },
  fr: {
    personalInfo: "Informations Personnelles",
    statFollowers: "Abonnés",
    statFollowing: "Abonnements",
    statProducts: "Produits",
    statRfqsMatching: "Demandes correspondantes",
    statUpdatesPosted: "Publications",
    statExhibitions: "Expositions",
    statBuyerReviews: "Avis acheteurs",
    editBusinessParams: "Modifier les paramètres commerciaux",
    editBusinessParamsDesc: "Ajustez vos classifications commerciales et paramètres régionaux selon votre niveau",
    companyNameLabel: "Nom de l'entreprise",
    sloganLabel: "Slogan / Argument",
    descriptionLabel: "Description",
    businessEmailLabel: "E-mail professionnel",
    whatsappNumberLabel: "Numéro WhatsApp",
    activateSupplierSpace: "Compléter votre profil",
    tabBuyerReviews: "Avis acheteurs",
    verifiedReviewsTitle: "Avis vérifiés des acheteurs",
    verifiedReviewsDesc: "Commentaires, notes et retours authentiques de partenaires régionaux",
    noReviewsYetTitle: "Aucun avis pour le moment",
    noReviewsYetDesc: "Les avis des acheteurs vérifiés apparaîtront ici dès qu'ils seront disponibles.",
    tabAboutTrade: "À propos & Commerce",
    tabInstagramFeed: "Fil Instagram",
    tabFeaturedProducts: "Produits en vedette",
    accountStatusLabel: "Statut du compte",
    progressiveProfileTitle: "Système de profil B2B progressif",
    progressiveProfileDesc: "N'affiche que les fonctionnalités attribuées à votre forfait. Les forfaits Starter gardent votre espace simple, tandis que Business et Enterprise débloquent des fonctionnalités avancées.",
    assignedByAlsouk: "Attribué par ALSOUK",
    requestPlanUpgrade: "Demander une mise à niveau",
    boostTrustTitle: "Complétez votre profil pour renforcer la confiance des acheteurs",
    boostTrustDescPrefix: "Votre profil est actuellement complété à",
    boostTrustDescSuffix: "%. Complétez les champs manquants ci-dessous pour obtenir le statut vérifié et un meilleur placement dans les recherches.",
    companyOverviewTitle: "Aperçu de l'entreprise",
    companyOverviewDefault: "Bienvenue sur notre profil commercial B2B. Complétez votre description pour informer les acheteurs régionaux de votre capacité de production, qualité biologique et options d'exportation directe.",
    tradeInformationTitle: "Informations commerciales",
    wholesaleSupplierDefault: "Fournisseur B2B en gros de Tunisie",
    exporterWholesalerDefault: "Exportateur & Grossiste",
    saveChanges: "Enregistrer",
    cancel: "Annuler",
    editProfile: "Modifier le profil",
    avatar: "Avatar",
    country: "Pays",
    city: "Ville",
    accountType: "Type de compte",
    companyInfo: "Informations sur l'Entreprise",
    editCompany: "Modifier le profil de l'entreprise",
    completeCompanyCta: "Complétez le profil de votre entreprise",
    completeCompanyDesc: "Présentez vos capacités, vos produits et vos vérifications aux acheteurs B2B régionaux et mondiaux.",
    security: "Sécurité",
    changePassword: "Changer le mot de passe",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    updatePasswordBtn: "Mettre à jour le mot de passe",
    accountSummary: "Résumé du Compte",
    memberSince: "Membre depuis",
    numProducts: "Nombre de produits",
    numRfqs: "Nombre de RFQ",
    numMessages: "Nombre de messages",
    passwordUpdated: "Mot de passe mis à jour avec succès !",
    profileUpdated: "Profil mis à jour avec succès !",
    companyUpdated: "Profil de l'entreprise mis à jour avec succès !",
    selectCity: "Sélectionnez une ville",
    selectCountry: "Sélectionnez un pays",
    enterCity: "Entrez votre ville",
    updating: "Enregistrement...",
    passwordLengthError: "Le mot de passe doit comporter au moins 8 caractères",
    passwordMismatchError: "Les motifs de passe ne correspondent pas",
    requiredFieldsError: "Veuillez remplir tous les champs obligatoires",
    customAvatarUrl: "Ou collez l'URL d'une image d'avatar personnalisée",
    avatarOptionLabel: "Choisissez un emoji / icône d'avatar",
    savingChanges: "Enregistrement...",
    tagline: "Slogan / Présentation",
    description: "Description de l'entreprise",
    logoUrl: "URL du logo",
    bannerUrl: "URL de la bannière",
    websiteUrl: "URL du site Web",
    websiteMode: "Mode du site Web",
    businessEmail: "Email professionnel",
    whatsappNumber: "Numéro WhatsApp (avec préfixe)",
    streetAddress: "Adresse de la rue",
    postalCode: "Code postal",
    businessType: "Type d'entreprise",
    primaryIndustry: "Secteur primaire",
    yearEstablished: "Année d'établissement",
    companySize: "Taille de l'entreprise (Employés)",
    taxIdentifier: "Identifiant fiscal (Matricule Fiscal / RNE)",
    supportedLanguages: "Langues supportées",
    exportMarkets: "Marchés d'exportation cibles",
    socialLinks: "Présence sociale & Réseaux",
    profileProgress: "Progrès du profil",
    verificationStatus: "Niveau de vérification",
    previewPublic: "Prévisualiser le profil public",
    previewStore: "Prévisualiser la boutique",
    checklistTitle: "Informations recommandées manquantes",
    onboardingTitle: "Créez le profil de votre entreprise",
    onboardingDesc: "Configurez le profil officiel de votre entreprise pour attirer les acheteurs régionaux, présenter vos catalogues et recevoir des RFQ instantanés.",
    launchOnboarding: "Créer le profil de l'entreprise",
    addGalleryPhoto: "Ajouter un lien d'image",
    addCertificate: "Ajouter un certificat de qualité",
    photoUrlLabel: "URL du document/photo",
    captionLabel: "Légende / Titre",
    addBtn: "Ajouter l'élément",
    noMedia: "Aucun fichier multimédia téléchargé pour le moment."
  },
  ar: {
    personalInfo: "المعلومات الشخصية",
    statFollowers: "المتابعون",
    statFollowing: "المتابَعون",
    statProducts: "المنتجات",
    statRfqsMatching: "طلبات مطابقة",
    statUpdatesPosted: "المنشورات",
    statExhibitions: "المعارض",
    statBuyerReviews: "تقييمات المشترين",
    editBusinessParams: "تعديل بيانات العمل",
    editBusinessParamsDesc: "اضبط تصنيفاتك التجارية وبياناتك الإقليمية حسب مستوى حسابك",
    companyNameLabel: "اسم الشركة",
    sloganLabel: "الشعار / الوصف المختصر",
    descriptionLabel: "الوصف",
    businessEmailLabel: "البريد الإلكتروني للأعمال",
    whatsappNumberLabel: "رقم واتساب",
    activateSupplierSpace: "أكمل ملفك الشخصي",
    tabBuyerReviews: "تقييمات المشترين",
    verifiedReviewsTitle: "تقييمات المشترين الموثَّقة",
    verifiedReviewsDesc: "تعليقات وتقييمات وآراء حقيقية من شركاء إقليميين",
    noReviewsYetTitle: "لا توجد تقييمات بعد",
    noReviewsYetDesc: "ستظهر هنا تقييمات المشترين الموثَّقين فور توفرها.",
    tabAboutTrade: "عن الشركة والتجارة",
    tabInstagramFeed: "المنشورات",
    tabFeaturedProducts: "المنتجات المميزة",
    accountStatusLabel: "حالة الحساب",
    progressiveProfileTitle: "نظام الملف التعريفي B2B التدريجي",
    progressiveProfileDesc: "تُعرض فقط الإمكانيات المخصَّصة لخطة حسابك. الخطة الأساسية تُبقي مساحتك بسيطة، بينما خطتا الأعمال والمؤسسات تفتحان ميزات متقدمة.",
    assignedByAlsouk: "مُخصَّصة من ALSOUK",
    requestPlanUpgrade: "اطلب ترقية الخطة",
    boostTrustTitle: "أكمل ملفك التعريفي لزيادة ثقة المشترين",
    boostTrustDescPrefix: "نسبة اكتمال ملفك حاليًا",
    boostTrustDescSuffix: "٪. أكمل الحقول الناقصة أدناه للحصول على حالة موثَّقة وترتيب أفضل في نتائج البحث.",
    companyOverviewTitle: "نظرة عامة على الشركة",
    companyOverviewDefault: "مرحبًا بك في ملفك التجاري B2B. أكمل الوصف لتُطلع المشترين الإقليميين على قدرتك الإنتاجية وجودة منتجاتك وخيارات التصدير المباشر.",
    tradeInformationTitle: "المعلومات التجارية",
    wholesaleSupplierDefault: "مورّد جملة B2B من تونس",
    exporterWholesalerDefault: "مُصدِّر وتاجر جملة",
    saveChanges: "حفظ التغييرات",
    cancel: "إلغاء",
    editProfile: "تعديل الملف الشخصي",
    avatar: "الصورة الشخصية",
    country: "البلد",
    city: "المدينة",
    accountType: "نوع الحساب",
    companyInfo: "معلومات الشركة",
    editCompany: "تعديل ملف الشركة",
    completeCompanyCta: "أكمل ملف تعريف شركتك",
    completeCompanyDesc: "اعرض قدراتك ومنتجاتك وتوثيقك لمشتري B2B الإقليميين والعالميين.",
    security: "الأمان",
    changePassword: "تغيير كلمة المرور",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    updatePasswordBtn: "تحديث كلمة المرور",
    accountSummary: "ملخص الحساب",
    memberSince: "عضو منذ",
    numProducts: "عدد المنتجات",
    numRfqs: "عدد طلبات عروض الأسعار",
    numMessages: "عدد الرسائل",
    passwordUpdated: "تم تحديث كلمة المرور بنجاح!",
    profileUpdated: "تم تحديث الملف الشخصي بنجاح!",
    companyUpdated: "تم تحديث ملف تعريف الشركة بنجاح!",
    selectCity: "اختر المدينة",
    selectCountry: "اختر البلد",
    enterCity: "أدخل مدينتك",
    updating: "جاري الحفظ...",
    passwordLengthError: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
    passwordMismatchError: "كلمات المرور غير متطابقة",
    requiredFieldsError: "يرجى ملء جميع الحقول المطلوبة",
    customAvatarUrl: "أو الصق رابط صورة مخصص",
    avatarOptionLabel: "اختر رمزاً أو رمزاً تعبيرياً للصورة الشخصية",
    savingChanges: "جاري الحفظ...",
    tagline: "شعار / عرض سريع",
    description: "وصف الشركة",
    logoUrl: "رابط شعار الشركة",
    bannerUrl: "رابط غلاف الشركة",
    websiteUrl: "رابط الموقع الإلكتروني",
    websiteMode: "استراتيجية الموقع",
    businessEmail: "البريد الإلكتروني للعمل",
    whatsappNumber: "رقم الواتساب (مع الرمز)",
    streetAddress: "العنوان بالكامل",
    postalCode: "الرمز البريدي",
    businessType: "نوع العمل التجاري",
    primaryIndustry: "الصناعة الأساسية",
    yearEstablished: "سنة التأسيس",
    companySize: "حجم الشركة (عدد الموظفين)",
    taxIdentifier: "المعرف الضريبي (الرقم الجبائي / RNE)",
    supportedLanguages: "اللغات المدعومة",
    exportMarkets: "الأسواق التصديرية المستهدفة",
    socialLinks: "الحسابات الاجتماعية والشبكات",
    profileProgress: "مدى اكتمال الملف",
    verificationStatus: "مستوى التوثيق",
    previewPublic: "معاينة الملف العام",
    previewStore: "معاينة المتجر الالكتروني",
    checklistTitle: "قائمة البيانات الموصى بها المفقودة",
    onboardingTitle: "إنشاء الملف التعريفي للشركة",
    onboardingDesc: "قم بإنشاء وتفعيل الملف التعريفي لشركتك للوصول إلى المشترين وعرض الكتالوجات واستقبل طلبات عرض الأسعار.",
    launchOnboarding: "تفعيل ملف الشركة",
    addGalleryPhoto: "إضافة رابط صورة للمعرض",
    addCertificate: "إضافة شهادة جودة أو رخصة",
    photoUrlLabel: "رابط الصورة / المستند",
    captionLabel: "الوصف / العنوان",
    addBtn: "إضافة عنصر",
    noMedia: "لم يتم تحميل أي ملفات وسائط بعد."
  }
}

function AccountScreen() {
  const { t, dir, lang } = useLanguage()
  const router = useRouter()
  const dict = localT[lang] || localT.en
  const dirT = directoryT[lang] || directoryT.en

  // Auth state
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Role selector state
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"buyer" | "supplier" | null>(null)

  // New premium profile layout tabs: posts, products, about, exhibitions, reviews, certificates
  const [activeProfileTab, setActiveProfileTab] = useState<"posts" | "products" | "about" | "exhibitions" | "reviews" | "certificates" | "studio">("about")

  // Sidebar controls
  const [showEditSettingsModal, setShowEditSettingsModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  // Personal Information editing state
  const [fullNameInput, setFullNameInput] = useState("")
  const [countryInput, setCountryInput] = useState("")
  const [cityInput, setCityInput] = useState("")
  const [avatarInput, setAvatarInput] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  const [profileError, setProfileError] = useState("")

  // Security editing state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [updatingPassword, setUpdatingPassword] = useState(false)

  // Company Information and Account Summary state
  const [company, setCompany] = useState<Company | null>(null)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [productForm, setProductForm] = useState({ name: "", price: "", minOrderQuantity: "1", unit: "" })
  const [productImageFile, setProductImageFile] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)
  const [savingProduct, setSavingProduct] = useState(false)
  const [productSavedNote, setProductSavedNote] = useState(false)
  const [companyMedia, setCompanyMedia] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [exhibitions, setExhibitions] = useState<any[]>([])
  const [productsCount, setProductsCount] = useState(0)
  const [rfqsCount, setRfqsCount] = useState(0)
  const [fetchingCompanyInfo, setFetchingCompanyInfo] = useState(false)

  // Followers & Following — real counts, fetched from company_follows in
  // fetchExtraData (were hardcoded to 1240/180 before this fix).
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [updatesPostedCount, setUpdatesPostedCount] = useState(0)
  // UX FIX (requested): the edit form used to always be visible inline.
  // Now it's collapsed by default once a company exists, and only opens
  // via the "Edit Profile" button — closing again automatically after a
  // successful save.
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const { user: authUser } = useAuth()

  // Likes & Comments Simulator State for posts
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [postComments, setPostComments] = useState<Record<string, string[]>>({})
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({})

  // Interactive Company Profile edit state
  const [companySuccess, setCompanySuccess] = useState("")
  const [companyError, setCompanyError] = useState("")
  const [companyForm, setCompanyForm] = useState({
    profileLevel: "starter" as "starter" | "business" | "enterprise",
    name: "",
    tagline: "",
    description: "",
    logoUrl: "",
    bannerUrl: "",
    websiteUrl: "",
    websiteMode: "alsouk" as "external" | "alsouk" | "both",
    businessEmail: "",
    phoneNumber: "",
    whatsappNumber: "",
    country: "tn",
    city: "",
    postalCode: "",
    streetAddress: "",
    businessType: "",
    primaryIndustry: "",
    yearEstablished: "" as string | number,
    companySize: "",
    taxIdentifier: "",
    supportedLanguages: [] as string[],
    exportMarkets: [] as string[],
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    linkedinUrl: "",
    youtubeUrl: ""
  })

  // Onboarding Wizard states
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [onboardingForm, setOnboardingForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    country: "tn",
    city: "",
    businessType: "",
    primaryIndustry: ""
  })

  // Custom Media Management Input states
  const [photoUrl, setPhotoUrl] = useState("")
  const [photoCaption, setPhotoCaption] = useState("")
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [certUrl, setCertUrl] = useState("")
  const [certCaption, setCertCaption] = useState("")

  const initializeProfileForm = (currentUser: any) => {
    if (!currentUser) return
    const metadata = currentUser.user_metadata || {}
    setFullNameInput(metadata.full_name || "")
    setCountryInput(metadata.country || "")
    setCityInput(metadata.city || "")
    setAvatarInput(metadata.avatar_url || "")
  }

  const fetchExtraData = async (currentUser: any) => {
    if (!currentUser) return
    setFetchingCompanyInfo(true)
    const supabase = createClient()
    const metadata = currentUser.user_metadata || {}
    const accountType = metadata.account_type

    let currentCompanyId = null

    try {
      // 1. Query company profile via service (including memberships)
      const companyData = await fetchCompanyForUser(currentUser.id)

      if (companyData) {
        setCompany(companyData)
        currentCompanyId = companyData.id

        // Fetch company media assets
        const { data: mediaRows } = await supabase
          .from("company_media")
          .select("*")
          .eq("company_id", companyData.id)
          .order("position", { ascending: true })
        if (mediaRows) {
          setCompanyMedia(mediaRows)
        }

        // Fetch catalog products
        const { data: rows } = await supabase
          .from("products")
          .select("id,name,slug,price,currency,min_order_quantity,unit,product_images(id,url,storage_bucket,storage_path,alt,is_primary,position)")
          .eq("company_id", companyData.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(12)
        const productsList = (rows ?? []).map((r: any) => {
          const images = (r.product_images ?? []).slice().sort((a: any, b: any) => Number(b.is_primary) - Number(a.is_primary) || (a.position ?? 0) - (b.position ?? 0))
          const img = images[0]
          return {
            id: r.id,
            name: r.name,
            slug: r.slug,
            price: r.price === null ? null : Number(r.price),
            currency: r.currency || "USD",
            minOrderQuantity: Number(r.min_order_quantity) || 1,
            unit: r.unit || null,
            primaryImage: img ? { id: img.id, url: img.url, storageBucket: img.storage_bucket || "product-images", storagePath: img.storage_path, alt: img.alt, isPrimary: Boolean(img.is_primary), position: Number(img.position) || 0 } : null,
          }
        })
        setProducts(productsList)

        // Fetch trade exhibitions list
        const exhibitionsList = await getExhibitions()
        setExhibitions(exhibitionsList.slice(0, 3))

        // Set up the company edit form
        setCompanyForm({
          profileLevel: companyData.profileLevel || "starter",
          name: companyData.name || "",
          tagline: companyData.tagline || "",
          description: companyData.description || "",
          logoUrl: companyData.logoUrl || "",
          bannerUrl: companyData.bannerUrl || "",
          websiteUrl: companyData.websiteUrl || "",
          websiteMode: companyData.websiteMode || "alsouk",
          businessEmail: companyData.businessEmail || "",
          phoneNumber: companyData.phoneNumber || "",
          whatsappNumber: companyData.whatsappNumber || "",
          country: companyData.country || "tn",
          city: companyData.city || "",
          postalCode: companyData.postalCode || "",
          streetAddress: companyData.streetAddress || "",
          businessType: companyData.businessType || "",
          primaryIndustry: companyData.primaryIndustry || "",
          yearEstablished: companyData.yearEstablished || "",
          companySize: companyData.companySize || "",
          taxIdentifier: companyData.taxIdentifier || "",
          supportedLanguages: companyData.supportedLanguages || [],
          exportMarkets: companyData.exportMarkets || [],
          facebookUrl: companyData.facebookUrl || "",
          instagramUrl: companyData.instagramUrl || "",
          tiktokUrl: companyData.tiktokUrl || "",
          linkedinUrl: companyData.linkedinUrl || "",
          youtubeUrl: companyData.youtubeUrl || ""
        })
      } else {
        // FIX (was): this branch used to fabricate a fake "mock-company-123"
        // company with hardcoded demo data ("Sfax Olive Export Co.") and
        // silently present it to the user as if it were their real company.
        // This was confirmed in production logs: real users hitting this
        // path had their post/product/image writes fail (400s) because
        // "mock-company-123" is not a real row in `companies`, and it is
        // not even a valid UUID.
        //
        // Correct behavior: the user genuinely has no company yet. Show
        // that real state (company = null) so the UI can render a proper
        // "create your company" call-to-action instead of fake data.
        // TODO (separate task, not a migration/backend concern): build the
        // actual "create company" onboarding form/flow wherever `company
        // === null` is rendered in this page, calling the real
        // `createCompany` in lib/supabase/company-service.ts.
        setCompany(null)
      }

      // 2. Query products count
      if (accountType === "supplier" && currentCompanyId) {
        const { count, error: productsError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("company_id", currentCompanyId)

        if (!productsError && count !== null) {
          setProductsCount(count)
        } else {
          setProductsCount(0)
        }
      } else {
        setProductsCount(0)
      }

      // 3. Query RFQs count
      if (currentCompanyId) {
        const { count: rfqsCountVal, error: rfqsError } = await supabase
          .from("rfqs")
          .select("*", { count: "exact", head: true })
          .eq("company_id", currentCompanyId)

        if (!rfqsError && rfqsCountVal !== null) {
          setRfqsCount(rfqsCountVal)
        } else {
          // Fallback check
          const phoneVal = metadata.phone_number || ""
          let filterStr = `email.eq.${currentUser.email}`
          if (phoneVal) {
            filterStr += `,phone.eq.${phoneVal}`
          }
          if (companyData?.supplierId) {
            filterStr += `,supplier_id.eq.${companyData.supplierId}`
          }
          const { count: legacyCount } = await supabase
            .from("rfqs")
            .select("*", { count: "exact", head: true })
            .or(filterStr)
          setRfqsCount(legacyCount || 0)
        }
      }

      // 4. Real followers count (was hardcoded 1240) + real posts count
      //    (was hardcoded to literally "3" whenever a company existed).
      //    company_follows / commercial_posts now have correct table
      //    grants (fixed this session), so these queries work.
      if (currentCompanyId) {
        const { count: followersVal } = await supabase
          .from("company_follows")
          .select("*", { count: "exact", head: true })
          .eq("company_id", currentCompanyId)
        setFollowersCount(followersVal || 0)

        const { count: postsVal } = await supabase
          .from("commercial_posts")
          .select("*", { count: "exact", head: true })
          .eq("company_id", currentCompanyId)
          .is("deleted_at", null)
        setUpdatesPostedCount(postsVal || 0)
      }

      // 5. Real "following" count for the current user (was hardcoded 180).
      const { count: followingVal } = await supabase
        .from("company_follows")
        .select("*", { count: "exact", head: true })
        .eq("user_id", currentUser.id)
      setFollowingCount(followingVal || 0)

    } catch (err) {
      console.error("Error fetching extra data:", err)
    } finally {
      setFetchingCompanyInfo(false)
    }
  }

  useEffect(() => {
    const supabase = createClient()

    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: import("@supabase/supabase-js").Session | null } }) => {
      if (!session) {
        router.replace("/login")
      } else {
        const currentUser = session.user
        setUser(currentUser)
        initializeProfileForm(currentUser)

        // Show role chooser modal if account_type is not yet set
        if (!currentUser.user_metadata?.account_type) {
          setShowRoleModal(true)
        } else {
          fetchExtraData(currentUser)
        }
      }
      setLoading(false)
    })

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: import("@supabase/supabase-js").Session | null) => {
      if (!session) {
        setUser(null)
        router.replace("/login")
      } else {
        const currentUser = session.user
        setUser(currentUser)
        initializeProfileForm(currentUser)
        if (!currentUser.user_metadata?.account_type) {
          setShowRoleModal(true)
        } else {
          setShowRoleModal(false)
          fetchExtraData(currentUser)
        }
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    setLoading(true)
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const handleSaveRole = async () => {
    if (!selectedRole) return

    setUpdating(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { account_type: selectedRole }
      })

      if (error) {
        console.error("Error updating account type:", error)
        alert(error.message)
      } else if (data.user) {
        setUser(data.user)
        setShowRoleModal(false)
        fetchExtraData(data.user)
      }
    } catch (err) {
      console.error("Unexpected error updating account type:", err)
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccess("")
    setProfileError("")

    if (!fullNameInput.trim()) {
      setProfileError(dict.requiredFieldsError)
      return
    }

    setUpdating(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullNameInput.trim(),
          country: countryInput,
          city: cityInput,
          avatar_url: avatarInput.trim()
        }
      })

      if (error) {
        setProfileError(error.message)
      } else if (data.user) {
        setUser(data.user)
        setProfileSuccess(dict.profileUpdated)
        fetchExtraData(data.user)
      }
    } catch (err: any) {
      setProfileError(err.message || "An unexpected error occurred")
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess("")
    setPasswordError("")

    if (newPassword.length < 8) {
      setPasswordError(dict.passwordLengthError)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(dict.passwordMismatchError)
      return
    }

    setUpdatingPassword(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setPasswordError(error.message)
      } else {
        setPasswordSuccess(dict.passwordUpdated)
        setNewPassword("")
        setConfirmPassword("")
        setIsChangingPassword(false)
      }
    } catch (err: any) {
      setPasswordError(err.message || "An unexpected error occurred")
    } finally {
      setUpdatingPassword(false)
    }
  }

  // Interactive Company Profile Submission/Update
  const handleUpdateCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setCompanySuccess("")
    setCompanyError("")

    if (!companyForm.name.trim()) {
      setCompanyError(dict.requiredFieldsError)
      return
    }

    setUpdating(true)

    try {
      const parsedYear = companyForm.yearEstablished ? Number(companyForm.yearEstablished) : null
      const formattedSlug = company?.slug || companyForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")

      const payload = {
        ...companyForm,
        slug: formattedSlug,
        yearEstablished: parsedYear
      }

      let updatedComp = null
      if (company) {
        updatedComp = await updateCompany(company.id, payload)
      } else {
        updatedComp = await createCompany(user.id, payload)
      }

      if (updatedComp) {
        setCompany(updatedComp)
        setCompanySuccess(dict.companyUpdated)
        fetchExtraData(user)
        // UX FIX: collapse the form back after a successful save instead
        // of leaving it open indefinitely — short delay so the success
        // message is actually visible first.
        setTimeout(() => setIsEditingCompany(false), 1800)
      } else {
        setCompanyError("Failed to persist company profile. Please ensure matching fields.")
      }
    } catch (err: any) {
      setCompanyError(err.message || "An unexpected error occurred while modifying the company")
    } finally {
      setUpdating(false)
    }
  }

  // Onboarding direct launch
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onboardingForm.name.trim()) return

    setUpdating(true)
    const calculatedSlug = onboardingForm.slug.trim() || onboardingForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")

    try {
      const payload: Partial<Company> = {
        name: onboardingForm.name.trim(),
        slug: calculatedSlug,
        tagline: onboardingForm.tagline.trim() || null,
        country: onboardingForm.country,
        city: onboardingForm.city || null,
        businessType: onboardingForm.businessType || null,
        primaryIndustry: onboardingForm.primaryIndustry || null,
        supportedLanguages: ["fr", "en"],
        exportMarkets: ["tn"]
      }

      const newComp = await createCompany(user.id, payload)
      if (newComp) {
        setCompany(newComp)
        setOnboardingStep(1)
        fetchExtraData(user)
      }
    } catch (err) {
      console.error("Onboarding creation error:", err)
    } finally {
      setUpdating(false)
    }
  }

  // Media Manager Add Asset
  const handleAddMediaAsset = async (mediaType: "factory_photo" | "certificate" | "video", url: string, caption: string) => {
    if (!url.trim()) return
    const supabase = createClient()
    if (!company) return

    setUpdating(true)
    try {
      const { data, error } = await supabase
        .from("company_media")
        .insert({
          company_id: company.id,
          media_type: mediaType,
          storage_bucket: "company-media",
          storage_path: `asset-${Math.random().toString(36).substring(7)}`,
          url: url.trim(),
          caption: caption.trim() || null,
          position: companyMedia.length
        })
        .select()

      if (!error && data) {
        setCompanyMedia(prev => [...prev, data[0]])
        if (mediaType === "factory_photo") {
          setPhotoUrl("")
          setPhotoCaption("")
        } else {
          setCertUrl("")
          setCertCaption("")
        }
      }
    } catch (err) {
      console.error("Error inserting media:", err)
    } finally {
      setUpdating(false)
    }
  }

  // Real upload: photo from camera or gallery -> Supabase Storage -> company_media row
  const handleUploadPhoto = async (file: File) => {
    if (!company) return
    setUploadingPhoto(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop() || "jpg"
      const path = `${company.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { error: uploadError } = await supabase.storage.from("company-photos").upload(path, file, { cacheControl: "3600", upsert: false })
      if (uploadError) { console.error("Error uploading photo:", uploadError); return }
      const { data: urlData } = supabase.storage.from("company-photos").getPublicUrl(path)
      await handleAddMediaAsset("factory_photo", urlData.publicUrl, file.name)
    } catch (err) {
      console.error("Error uploading photo:", err)
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Real upload: short video from camera or gallery -> Supabase Storage -> company_media row
  const handleUploadVideo = async (file: File) => {
    if (!company) return
    setUploadingVideo(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop() || "mp4"
      const path = `${company.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { error: uploadError } = await supabase.storage.from("company-videos").upload(path, file, { cacheControl: "3600", upsert: false })
      if (uploadError) { console.error("Error uploading video:", uploadError); return }
      const { data: urlData } = supabase.storage.from("company-videos").getPublicUrl(path)
      await handleAddMediaAsset("video", urlData.publicUrl, file.name)
    } catch (err) {
      console.error("Error uploading video:", err)
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleAddProduct = async () => {
    if (!company) return
    if (!productForm.name.trim()) return
    setSavingProduct(true)
    try {
      const supabase = createClient()
      const { data: storeRow } = await supabase.from("stores").select("id").eq("company_id", company.id).maybeSingle()
      if (!storeRow) { console.error("No store found for this company"); setSavingProduct(false); return }
      const slugBase = productForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      const slug = `${slugBase}-${Date.now().toString(36)}`
      const { data: newProduct, error: insertError } = await supabase.from("products").insert({
        store_id: storeRow.id,
        company_id: company.id,
        name: productForm.name.trim(),
        slug,
        price: productForm.price ? Number(productForm.price) : null,
        currency: "TND",
        min_order_quantity: productForm.minOrderQuantity ? Number(productForm.minOrderQuantity) : 1,
        unit: productForm.unit.trim() || null,
        is_active: true,
      }).select().single()
      if (insertError || !newProduct) { console.error("Error creating product:", insertError); setSavingProduct(false); return }
      if (productImageFile) {
        const ext = productImageFile.name.split(".").pop() || "jpg"
        const path = `${company.id}/${newProduct.id}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from("product-images").upload(path, productImageFile, { cacheControl: "3600", upsert: false })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path)
          await supabase.from("product_images").insert({ product_id: newProduct.id, url: urlData.publicUrl, storage_bucket: "product-images", storage_path: path, is_primary: true, position: 0 })
        }
      }
      const refreshed = await getProducts({ companyId: company.id, limit: 12 })
      setProductSavedNote(true)
      setTimeout(() => setProductSavedNote(false), 3000)
      setTimeout(() => document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150)
      setProducts(refreshed)
      setShowAddProductModal(false)
      setProductForm({ name: "", price: "", minOrderQuantity: "1", unit: "" })
      setProductImageFile(null)
      setProductImagePreview(null)
    } catch (err) {
      console.error("Error adding product:", err)
    } finally {
      setSavingProduct(false)
    }
  }

  // Media Manager Delete Asset
  const handleDeleteMediaAsset = async (id: string) => {
    const supabase = createClient()
    setUpdating(true)
    try {
      const { error } = await supabase
        .from("company_media")
        .delete()
        .eq("id", id)

      if (!error) {
        setCompanyMedia(prev => prev.filter(x => x.id !== id))
      }
    } catch (err) {
      console.error("Error deleting media:", err)
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateLevel = async (level: "starter" | "business" | "enterprise") => {
    if (!company) return
    setUpdating(true)
    setCompanySuccess("")
    setCompanyError("")
    try {
      const updated = await updateCompany(company.id, { profileLevel: level })
      if (updated) {
        setCompany(updated)
        setCompanyForm(prev => ({ ...prev, profileLevel: level }))
        setCompanySuccess(`Upgraded profile to ${level.toUpperCase()} level successfully!`)
        setActiveProfileTab("about")
      } else {
        setCompanyError("Failed to update profile level.")
      }
    } catch (err: any) {
      setCompanyError(err.message || "An unexpected error occurred.")
    } finally {
      setUpdating(false)
    }
  }

  // Dynamic visible tabs based on profileLevel
  const visibleTabs = useMemo(() => {
    const tabs: { id: "about" | "posts" | "products" | "certificates" | "reviews" | "exhibitions" | "studio"; label: string; icon: import("lucide-react").LucideIcon }[] = [
      { id: "studio" as const, label: "Studio", icon: ImagePlus },
      { id: "about" as const, label: dict.tabAboutTrade, icon: Building2 },
      { id: "products" as const, label: dict.tabFeaturedProducts, icon: Box },
    ]
    return tabs
  }, [company?.profileLevel, lang])

  // Safeguard active tab via safe render derivation
  const activeTabResolved = useMemo(() => {
    if (!visibleTabs.some(t => t.id === activeProfileTab)) {
      return "about"
    }
    return activeProfileTab
  }, [visibleTabs, activeProfileTab])

  const handleLanguageCheckboxChange = (key: string) => {
    setCompanyForm(prev => {
      const current = prev.supportedLanguages
      if (current.includes(key)) {
        return { ...prev, supportedLanguages: current.filter(x => x !== key) }
      } else {
        return { ...prev, supportedLanguages: [...current, key] }
      }
    })
  }

  const handleExportMarketCheckboxChange = (key: string) => {
    setCompanyForm(prev => {
      const current = prev.exportMarkets
      if (current.includes(key)) {
        return { ...prev, exportMarkets: current.filter(x => x !== key) }
      } else {
        return { ...prev, exportMarkets: [...current, key] }
      }
    })
  }

  // Social updates interaction simulators
  const toggleLikePost = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  const addCommentToPost = (postId: string) => {
    const comment = newCommentText[postId] || ""
    if (!comment.trim()) return

    setPostComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment.trim()]
    }))
    setNewCommentText((prev) => ({
      ...prev,
      [postId]: ""
    }))
  }

  const copyProfileLink = () => {
    if (typeof window === "undefined") return
    const url = `${window.location.origin}/companies/${company?.slug || "profile"}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const missingChecklist = useMemo(() => {
    if (!company) return []
    const items = []
    if (!company.description) items.push({ key: "description", label: "Add a complete company description", tab: "about" as const })
    if (!company.logoUrl) items.push({ key: "logoUrl", label: "Upload a company logo image", tab: "about" as const })
    if (!company.bannerUrl) items.push({ key: "bannerUrl", label: "Upload a cover banner", tab: "about" as const })
    if (!company.taxIdentifier) items.push({ key: "taxIdentifier", label: "Provide Tax ID (Matricule Fiscal / RNE)", tab: "about" as const })
    if (!company.websiteUrl) items.push({ key: "websiteUrl", label: "Define website strategy & domain", tab: "about" as const })
    if (!company.facebookUrl && !company.linkedinUrl && !company.instagramUrl) items.push({ key: "social", label: "Add social media handles (Facebook, LinkedIn, etc.)", tab: "about" as const })
    if (companyMedia.length === 0) items.push({ key: "media", label: "Upload factory photos or quality certificates", tab: "certificates" as const })
    return items
  }, [company, companyMedia])

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login via useEffect
  }

  const metadata = user.user_metadata || {}
  const fullName = metadata.full_name || t.auth.notSet
  const phoneVal = metadata.phone_number || t.auth.notSet

  // Hide synthetic phone-based emails from displaying as actual emails
  const isSyntheticEmail = user.email && (
    user.email.endsWith("@phone.alsouk.com") ||
    /^phone\d+@alsouk\.com$/i.test(user.email)
  )
  const emailVal = user.email && !isSyntheticEmail ? user.email : (metadata.email_address || t.auth.notSet)
  const accountType = metadata.account_type || ""

  if (accountType === "buyer") {
    return <BuyerAccountView name={fullName} avatarUrl={metadata.avatar_url || null} userId={user.id} />
  }

  // Avatar rendering helper
  const renderAvatar = (url: string, name: string) => {
    const isEmoji = url && url.length <= 4 && !url.includes("http") && !url.includes(".")
    if (isEmoji) {
      return (
        <div className="relative flex size-24 sm:size-32 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary/15 to-blue-500/15 text-5xl sm:text-6xl shadow-xl border border-primary/20 backdrop-blur-md">
          {url}
        </div>
      )
    }
    if (url && (url.startsWith("http") || url.startsWith("/") || url.includes("."))) {
      return (
        <div className="relative flex size-24 sm:size-32 overflow-hidden rounded-3xl bg-secondary shadow-xl border-4 border-card transition-transform hover:scale-102">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={name} className="size-full object-cover" />
        </div>
      )
    }
    const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : "U"
    return (
      <div className="relative flex size-24 sm:size-32 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary to-blue-600 text-4xl sm:text-5xl font-black text-white shadow-xl shadow-primary/20 border-4 border-card">
        {initial}
      </div>
    )
  }

  // Member Since date parsing (pure approach)
  const memberSinceDate = new Date(user.created_at || "2026-07-30T00:00:00.000Z")
  const memberSinceStr = memberSinceDate.toLocaleDateString(
    lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : "ar-TN",
    { month: "short", year: "numeric" }
  )

  const coverImage = companyMedia.find(m => m.media_type === "product_gallery" || m.media_type === "factory_photo")?.url || company?.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"

  return (
    <div className="w-full bg-secondary/5 min-h-screen pb-24" dir={dir}>

      {/* 1. Hero Header & Premium Layout Banner */}
      <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-neutral-900 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverImage} alt="Cover image" className="w-full h-full object-cover opacity-85 group-hover:scale-101 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Quick action buttons on cover */}
        <div className="absolute top-4 right-4 sm:right-8 flex gap-2">
          <button
            onClick={() => setShowEditSettingsModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 transition-all cursor-pointer shadow-md"
          >
            <Edit2 className="size-3.5" />
            <span className="hidden sm:inline">Settings & Security</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Profile Card & Bio Header overlay */}
        <div className="relative -mt-12 sm:-mt-20 z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
            <div className="shrink-0">
              {renderAvatar(company?.logoUrl || metadata.avatar_url, company?.name || fullName)}
            </div>

            <div className="space-y-2 pt-2 md:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3.5xl font-black text-foreground tracking-tight">
                  {company?.name || fullName}
                </h1>

                {company?.verificationTier === "premium" && (
                  <span className="flex items-center gap-1 text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shadow-xs animate-pulse">
                    <Shield className="size-3.5 shrink-0" />
                    <span>Verified Gold Partner</span>
                  </span>
                )}
                {company?.verificationTier === "verified" && (
                  <span className="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle className="size-3.5 shrink-0" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <p className="text-sm font-bold text-muted-foreground">
                @{company?.slug || (company?.name ? company.name.toLowerCase().replace(/[^a-z0-9]+/g, "") : "")} {company?.tagline ? `• ${company.tagline}` : ""}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1 text-xs text-muted-foreground font-semibold">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-primary" />
                  <span className="capitalize">{(company?.city || metadata.city) ? `${company?.city || metadata.city}, ${metadata.country ? dirT.countries[metadata.country as keyof typeof dirT.countries] : "Tunisia"}` : "Location not set"}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5 text-primary" />
                  <span>Member Since {memberSinceStr}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="size-3.5 text-primary" />
                  <span className="capitalize">{company?.businessType ? company.businessType.replace("_", " ") : "Business type not set"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. Profile Actions Hub */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {company ? (
              <>
                <button
                  onClick={() => { setActiveProfileTab("about"); setIsEditingCompany(true); setTimeout(() => document.getElementById("company-edit-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100) }}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-xs font-black text-white hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer"
                >
                  <Edit2 className="size-3.5" />
                  <span>{dict.editProfile}</span>
                </button>
                <button
                  onClick={copyProfileLink}
                  className="size-10 rounded-xl border border-border bg-card hover:bg-secondary/40 flex items-center justify-center text-foreground transition-all cursor-pointer shadow-xs"
                  title="Copy Profile Link"
                >
                  {copiedLink ? <Check className="size-4 text-emerald-500 animate-scale-up" /> : <Share2 className="size-4" />}
                </button>
                <button
                  onClick={() => setShowQRModal(true)}
                  className="size-10 rounded-xl border border-border bg-card hover:bg-secondary/40 flex items-center justify-center text-foreground transition-all cursor-pointer shadow-xs"
                  title="Show QR Code"
                >
                  <QrCode className="size-4" />
                </button>
                <button
                  onClick={async () => {
                    if (!authUser || !company) return
                    const supabase = createClient()
                    if (isFollowing) {
                      await supabase.from("company_follows").delete().eq("company_id", company.id).eq("user_id", authUser.id)
                      setIsFollowing(false)
                    } else {
                      await supabase.from("company_follows").insert({ company_id: company.id, user_id: authUser.id })
                      setIsFollowing(true)
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isFollowing
                      ? "bg-secondary text-foreground hover:bg-secondary/80"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveProfileTab("about")}
                className="w-full md:w-auto flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-xs font-black text-white hover:opacity-90 shadow-lg shadow-primary/10 transition-all cursor-pointer"
              >
                <Sparkles className="size-4 text-white animate-spin" />
                <span>{dict.activateSupplierSpace}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. B2B Profile Statistics Dashboard */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 py-4 my-4 border-b border-border/60">
          {[
            { label: dict.statFollowers, val: followersCount + (isFollowing ? 1 : 0), icon: Users, color: "text-blue-500 bg-blue-500/5" },
            { label: dict.statFollowing, val: followingCount, icon: Users, color: "text-amber-500 bg-amber-500/5" },
            { label: dict.statProducts, val: productsCount, icon: Box, color: "text-purple-500 bg-purple-500/5" },
            { label: dict.statRfqsMatching, val: rfqsCount, icon: FileText, color: "text-emerald-500 bg-emerald-500/5" },
            { label: dict.statUpdatesPosted, val: updatesPostedCount, icon: Sparkles, color: "text-indigo-500 bg-indigo-500/5" },
            { label: dict.statExhibitions, val: exhibitions.length, icon: Briefcase, color: "text-rose-500 bg-rose-500/5" },
            { label: dict.statBuyerReviews, val: 0, icon: Award, color: "text-yellow-500 bg-yellow-500/5" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-card border border-border/80 rounded-xl p-2.5 text-center hover:shadow-md transition-all">
              <span className={`inline-flex size-7 items-center justify-center rounded-lg mb-1.5 ${stat.color}`}>
                <stat.icon className="size-3.5" />
              </span>
              <div className="text-base font-black text-foreground">{stat.val}</div>
              <div className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wide line-clamp-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 4. Segmented Tabs for the Premium Layout */}
        <div className="flex border-b border-border overflow-x-auto no-scrollbar scroll-smooth">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveProfileTab(tab.id as any)}
              className={`py-3 px-5 text-xs font-black flex items-center gap-1.5 shrink-0 border-b-2 transition-all cursor-pointer ${
                activeTabResolved === tab.id
                  ? "border-primary text-primary bg-primary/5 rounded-t-xl"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/15"
              }`}
            >
              <tab.icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 5. TAB PANELS */}
        <div className="py-8">

          {/* Tab 1: About & Deep Trade Information */}
          {activeTabResolved === "about" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2 space-y-8">

                {/* Progressive Profile Level Switcher */}
                {company && (
                  <div className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border border-primary/20 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{dict.accountStatusLabel}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          company.profileLevel === "enterprise"
                            ? "bg-purple-600 text-white shadow-xs"
                            : company.profileLevel === "business"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                        }`}>
                          Level {company.profileLevel === "enterprise" ? "3 — Enterprise Plan" : company.profileLevel === "business" ? "2 — Business Plan" : "1 — Starter Plan"}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-foreground">{dict.progressiveProfileTitle}</h3>
                      <p className="text-[11px] leading-normal text-muted-foreground max-w-xl">
                        {dict.progressiveProfileDesc}
                      </p>
                    </div>

                    <div className="shrink-0 text-start sm:text-end">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{dict.assignedByAlsouk}</span>
                      <a href="mailto:support@alsouk.com" className="inline-block mt-1 text-xs font-black text-primary hover:underline">
                        {dict.requestPlanUpgrade} &rarr;
                      </a>
                    </div>
                  </div>
                )}

                {/* Profile progress rating alert if incomplete */}
                {company && company.profileCompletion < 85 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl flex items-start gap-3">
                    <BadgeAlert className="size-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-black">{dict.boostTrustTitle}</p>
                      <p className="text-[11px] leading-normal opacity-90">
                        {dict.boostTrustDescPrefix} {company.profileCompletion}{dict.boostTrustDescSuffix}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-foreground flex items-center gap-2">
                      <Building2 className="size-4.5 text-primary" />
                      <span>{dict.companyOverviewTitle}</span>
                    </h3>
                  </div>

                  <p className="text-xs font-semibold text-muted-foreground leading-relaxed whitespace-pre-line">
                    {company?.description || dict.companyOverviewDefault}
                  </p>
                </div>

                {/* Trade Details Panel */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <Briefcase className="size-4.5 text-primary" />
                    <span>{dict.tradeInformationTitle}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                    {[
                      { label: dict.yearEstablished, val: company?.yearEstablished || "2005", icon: Calendar, minLevel: "starter" },
                      { label: "Total Employees", val: company?.companySize || "51 - 200", icon: Users, minLevel: "enterprise" },
                      { label: "Factory Size", val: "2,500 square meters", icon: Building2, minLevel: "enterprise" },
                      { label: "Annual Revenue", val: "$1M - $5M USD", icon: Shield, minLevel: "enterprise" },
                      { label: "Supported Languages", val: company?.supportedLanguages?.join(", ")?.toUpperCase() || "FR, EN, AR", icon: Languages, minLevel: "enterprise" },
                      { label: "Target Export Markets", val: company?.exportMarkets?.join(", ")?.toUpperCase() || "EU, GCC", icon: Flag, minLevel: "enterprise" }
                    ].filter(item => {
                      const lvl = company?.profileLevel || "starter"
                      if (lvl === "enterprise") return true
                      if (lvl === "business") return item.minLevel !== "enterprise"
                      return item.minLevel === "starter"
                    }).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3.5 p-3.5 bg-secondary/10 border border-border/40 rounded-xl">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <item.icon className="size-4" />
                        </span>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
                          <p className="text-xs font-black text-foreground mt-0.5">{item.val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live edit fields inside About Tab.
                    FIX (previous session): was gated behind `{company &&
                    (...)}`, which meant a brand-new user (company === null)
                    could never see this form at all. Fixed by rendering
                    unconditionally.
                    UX FIX (this session, requested): the form was then
                    always visible inline even after a company exists,
                    which is noisy. Now: still shown unconditionally when
                    there's no company yet (so creation still works exactly
                    as before), but collapsed by default once a company
                    exists — only opens via "Edit Profile" / "Complete your
                    profile" and closes again after a successful save. */}
                {(isEditingCompany || !company) && (
                  <form id="company-edit-form" onSubmit={handleUpdateCompanyProfile} className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
                    <div className="border-b border-border pb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black text-foreground">{dict.editBusinessParams}</h3>
                        <p className="text-[11px] text-muted-foreground">{dict.editBusinessParamsDesc}</p>
                      </div>
                      {company && (
                        <button
                          type="button"
                          onClick={() => setIsEditingCompany(false)}
                          className="shrink-0 size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
                          title={dict.cancel}
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>

                    {/* FIX: these two states existed and were correctly set
                        by handleUpdateCompanyProfile, but were never
                        rendered anywhere — meaning save success AND save
                        failure were both silently invisible to the user. */}
                    {companyError && (
                      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold">
                        {companyError}
                      </div>
                    )}
                    {companySuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        {companySuccess}
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* STARTER FIELDS (Level 1+) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">{dict.companyNameLabel} *</label>
                        <input
                          type="text"
                          value={companyForm.name}
                          onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                          className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">{dict.sloganLabel}</label>
                        <input
                          type="text"
                          value={companyForm.tagline}
                          onChange={(e) => setCompanyForm({...companyForm, tagline: e.target.value})}
                          className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">{dict.descriptionLabel}</label>
                        <textarea
                          value={companyForm.description}
                          onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                          rows={4}
                          className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">{dict.businessEmailLabel}</label>
                          <input
                            type="email"
                            value={companyForm.businessEmail}
                            onChange={(e) => setCompanyForm({...companyForm, businessEmail: e.target.value})}
                            className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">{dict.whatsappNumberLabel}</label>
                          <input
                            type="text"
                            value={companyForm.whatsappNumber}
                            onChange={(e) => setCompanyForm({...companyForm, whatsappNumber: e.target.value})}
                            className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* BUSINESS FIELDS (Level 2+) */}
                      {(company?.profileLevel === "business" || company?.profileLevel === "enterprise") && (
                        <div className="space-y-4 pt-4 border-t border-border/60 animate-in fade-in duration-300">
                          <div className="border-b border-border pb-1">
                            <h4 className="text-xs font-black text-foreground">Business Level Parameters</h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-muted-foreground">Website URL</label>
                              <input
                                type="text"
                                value={companyForm.websiteUrl}
                                onChange={(e) => setCompanyForm({...companyForm, websiteUrl: e.target.value})}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-muted-foreground">Website Strategy</label>
                              <select
                                value={companyForm.websiteMode}
                                onChange={(e) => setCompanyForm({...companyForm, websiteMode: e.target.value as any})}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary"
                              >
                                <option value="alsouk">ALSOUK Storefront</option>
                                <option value="external">External Website</option>
                                <option value="both">Both</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-muted-foreground">Business Type</label>
                              <select
                                value={companyForm.businessType}
                                onChange={(e) => setCompanyForm({...companyForm, businessType: e.target.value})}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary"
                              >
                                <option value="">Select type</option>
                                {BUSINESS_TYPES.map(x => <option key={x} value={x}>{x.replace("_", " ")}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-muted-foreground">Primary Industry</label>
                              <select
                                value={companyForm.primaryIndustry}
                                onChange={(e) => setCompanyForm({...companyForm, primaryIndustry: e.target.value})}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary"
                              >
                                <option value="">Select industry</option>
                                {INDUSTRIES.map(x => <option key={x} value={x}>{x}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">Year Established</label>
                            <input
                              type="number"
                              value={companyForm.yearEstablished}
                              onChange={(e) => setCompanyForm({...companyForm, yearEstablished: e.target.value})}
                              className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary"
                            />
                          </div>

                          {/* Social handles */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-muted-foreground">Facebook URL</label>
                              <input
                                type="text"
                                value={companyForm.facebookUrl}
                                onChange={(e) => setCompanyForm({...companyForm, facebookUrl: e.target.value})}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-muted-foreground">Instagram URL</label>
                              <input
                                type="text"
                                value={companyForm.instagramUrl}
                                onChange={(e) => setCompanyForm({...companyForm, instagramUrl: e.target.value})}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ENTERPRISE FIELDS (Level 3) */}
                      {company?.profileLevel === "enterprise" && (
                        <div className="space-y-4 pt-4 border-t border-border/60 animate-in fade-in duration-300">
                          <div className="border-b border-border pb-1">
                            <h4 className="text-xs font-black text-foreground">Enterprise Level Parameters</h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-muted-foreground">Company Size (Employees)</label>
                              <input
                                type="text"
                                value={companyForm.companySize}
                                onChange={(e) => setCompanyForm({...companyForm, companySize: e.target.value})}
                                placeholder="e.g. 51-200"
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-muted-foreground">Tax Identifier (MF / RNE)</label>
                              <input
                                type="text"
                                value={companyForm.taxIdentifier}
                                onChange={(e) => setCompanyForm({...companyForm, taxIdentifier: e.target.value})}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary"
                              />
                            </div>
                          </div>

                          {/* Supported Languages Checklist */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">Supported Languages</label>
                            <div className="flex gap-4">
                              {LANGUAGES_OPTIONS.map(opt => (
                                <label key={opt.key} className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                  <input
                                    type="checkbox"
                                    checked={companyForm.supportedLanguages.includes(opt.key)}
                                    onChange={() => handleLanguageCheckboxChange(opt.key)}
                                    className="rounded border-border text-primary focus:ring-primary/20"
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Target Export Markets Checklist */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">Target Export Markets</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {EXPORT_MARKETS_OPTIONS.map(opt => (
                                <label key={opt.key} className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                  <input
                                    type="checkbox"
                                    checked={companyForm.exportMarkets.includes(opt.key)}
                                    onChange={() => handleExportMarketCheckboxChange(opt.key)}
                                    className="rounded border-border text-primary focus:ring-primary/20"
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t border-border/40">
                        <button
                          type="submit"
                          disabled={updating}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-black text-white hover:opacity-90 transition-all cursor-pointer"
                        >
                          {updating && <Loader2 className="size-4 animate-spin" />}
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

              </div>

              {/* Sidebar Checklist & Details */}
              <div className="space-y-6">

                {/* Profile completeness score */}
                {company && (
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">B2B Profile Health</h4>
                    <div className="flex items-center gap-4">
                      <div className="relative size-16 flex items-center justify-center shrink-0">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-border" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-primary transition-all duration-500" strokeDasharray={`${company.profileCompletion}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-sm font-black text-foreground">{company.profileCompletion}%</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Completeness Score</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">Aim for &gt;85% to receive the Verified Partner badge.</p>
                      </div>
                    </div>

                    {missingChecklist.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Recommended Next Steps:</p>
                        {missingChecklist.map((item) => (
                          <div key={item.key} className="flex items-start gap-2 text-[11px] text-foreground font-semibold">
                            <AlertCircle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Photos & Videos link */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Photos & Videos</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Manage your product photos and short videos in Studio.</p>
                  <button type="button" onClick={() => setActiveProfileTab("studio")} className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white hover:opacity-95 w-full">
                    Open Studio
                  </button>
                </div>

                {/* Direct Contact Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Instant Contacts</h4>
                  <div className="space-y-3.5">
                    <a href={`mailto:${company?.businessEmail || "contact@alsouk.com"}`} className="flex items-center gap-3 p-3.5 bg-secondary/15 rounded-xl border border-border/40 text-xs font-bold text-foreground hover:bg-secondary/30 transition-all">
                      <Mail className="size-4 text-primary shrink-0" />
                      <span className="truncate">{company?.businessEmail || "Not added yet"}</span>
                    </a>
                    <a href={`tel:${company?.phoneNumber || "+216 71 123 456"}`} className="flex items-center gap-3 p-3.5 bg-secondary/15 rounded-xl border border-border/40 text-xs font-bold text-foreground hover:bg-secondary/30 transition-all">
                      <Phone className="size-4 text-primary shrink-0" />
                      <span>{company?.phoneNumber || "Not added yet"}</span>
                    </a>
                    {company?.whatsappNumber && (
                      <a href={`https://wa.me/${company.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 transition-all">
                        <PhoneCall className="size-4 shrink-0" />
                        <span>Instant WhatsApp Chat</span>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 2: Premium Instagram-Style social feed */}
          {activeTabResolved === "posts" && (
            <div className="space-y-8 max-w-2xl mx-auto">

              {/* If owner/authenticated, allow instant posting */}
              {company && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
                  <MerchantPosts companyId={company.id} lang={lang} />
                </div>
              )}


            </div>
          )}

          {/* Tab 3: Featured Products catalog */}
          {activeTabResolved === "studio" && (
            <div className="space-y-6">
              {company && <StudioPanel company={{ id: company.id, name: company.name, logo_url: company.logoUrl }} />}
            </div>
          )}

          {activeTabResolved === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 id="products-section" className="text-base font-black text-foreground">Showcased Products</h3>
                  <p className="text-xs text-muted-foreground">Premium selected catalog available for regional B2B quotes</p>
                </div>
                {company && (
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-xs font-black text-white hover:opacity-95 shadow-xs cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <span>Add New Product</span>
                  </button>
                )}
              </div>

              {showAddProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-foreground">Add New Product</h3>
                      <button type="button" onClick={() => setShowAddProductModal(false)} className="text-muted-foreground text-xl leading-none">&times;</button>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">Product Name *</label>
                      <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full mt-1 px-3.5 py-2 rounded-xl border border-border text-sm" placeholder="e.g. Organic Olive Oil 1L" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-muted-foreground">Price (TND)</label>
                        <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full mt-1 px-3.5 py-2 rounded-xl border border-border text-sm" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground">Min Order Qty</label>
                        <input type="number" value={productForm.minOrderQuantity} onChange={(e) => setProductForm({ ...productForm, minOrderQuantity: e.target.value })} className="w-full mt-1 px-3.5 py-2 rounded-xl border border-border text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">Unit (optional)</label>
                      <input type="text" value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} className="w-full mt-1 px-3.5 py-2 rounded-xl border border-border text-sm" placeholder="e.g. box, kg, piece" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">Product Photo</label>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) { setProductImageFile(f); setProductImagePreview(URL.createObjectURL(f)) }
                      }} className="w-full mt-1 text-xs" />
                      {productImagePreview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={productImagePreview} alt="preview" className="mt-2 h-28 w-28 object-cover rounded-xl border border-border" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      disabled={savingProduct || !productForm.name.trim()}
                      className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-black text-white disabled:opacity-50"
                    >
                      {savingProduct ? "Saving..." : "Save Product"}
                    </button>
                  </div>
                </div>
              )}

              {productSavedNote && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-700 flex items-center gap-2">
                  ✓ Product added successfully
                </div>
              )}

              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-border p-12 text-center max-w-md mx-auto space-y-4">
                  <Box className="size-12 text-muted-foreground mx-auto" />
                  <div>
                    <h4 className="text-sm font-black text-foreground">No Products Active</h4>
                    <p className="text-xs text-muted-foreground leading-normal mt-1">Register organic products to list them here on your public partner profile.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Trade Exhibitions */}
          {activeTabResolved === "exhibitions" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-black text-foreground">Exhibition Directory</h3>
                <p className="text-xs text-muted-foreground">Exhibition stands and trade showcases approved on ALSOUK trade events</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exhibitions.map((exh, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={exh.coverUrl} alt={exh.name} className="h-36 w-full object-cover" />
                      <div className="p-5 space-y-2">
                        <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">Official Stands</span>
                        <h4 className="text-sm font-black text-foreground">{exh.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{exh.description}</p>
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <a href={`/exhibitions/${exh.slug}`} className="w-full inline-flex items-center justify-center gap-1 bg-secondary text-xs font-bold text-foreground hover:bg-secondary/80 py-2.5 rounded-xl transition-all">
                        <span>Visit Virtual Hall</span>
                        <ChevronRight className="size-3.5 rtl:rotate-180" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Gallery & Quality Certificates */}
          {activeTabResolved === "certificates" && (
            <div className="space-y-8">

              {/* Media gallery uploads */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-foreground flex items-center gap-1.5">
                      <ImageIcon className="size-4.5 text-primary" />
                      <span>{company?.profileLevel === "starter" ? "Simple Showcase Gallery" : "Factory & Production Gallery"}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {company?.profileLevel === "starter"
                        ? "Essential images showing your business operations (max 4 photos for starter users)."
                        : "Showcase your assembly lines, warehouse facilities, and product storage."}
                    </p>
                  </div>
                  {company && (
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        id="photo-upload-input"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadPhoto(f); e.target.value = "" }}
                        disabled={uploadingPhoto || (company.profileLevel === "starter" && companyMedia.filter(x => x.media_type === "factory_photo").length >= 4)}
                        className="hidden"
                      />
                      <label
                        htmlFor="photo-upload-input"
                        className={`rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:opacity-95 shrink-0 inline-flex items-center gap-1.5 ${uploadingPhoto || (company.profileLevel === "starter" && companyMedia.filter(x => x.media_type === "factory_photo").length >= 4) ? "opacity-50 pointer-events-none cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {uploadingPhoto ? "Uploading..." : "Add Photo"}
                      </label>
                    </div>
                  )}
                </div>

                {companyMedia.filter(x => x.media_type === "factory_photo").length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {companyMedia.filter(x => x.media_type === "factory_photo")
                      .slice(0, company?.profileLevel === "starter" ? 4 : undefined)
                      .map((med) => (
                        <div key={med.id} className="relative aspect-video rounded-xl overflow-hidden border border-border bg-secondary group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={med.url} alt="Showcase" className="size-full object-cover" />
                          {company && (
                            <button
                              onClick={() => handleDeleteMediaAsset(med.id)}
                              className="absolute top-2 right-2 size-7 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground italic">No photos showcased yet. Add some above.</div>
                )}
              </div>

              {/* Catalog PDFs (Business Level only) */}
              {company?.profileLevel === "business" && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in duration-300">
                  <div className="border-b border-border pb-2">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                      <FileText className="size-4.5 text-primary" />
                      <span>B2B Marketing Catalog PDF</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Attach a digital brochure for buyers to download directly.</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste PDF URL (e.g. Google Drive link)"
                      defaultValue={company.metadata?.catalog_url || ""}
                      onBlur={async (e) => {
                        const val = e.target.value.trim()
                        const metadataCopy = { ...company.metadata, catalog_url: val }
                        await updateCompany(company.id, { metadata: metadataCopy })
                        setCompanySuccess("Marketing catalog link updated!")
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold focus:outline-none"
                    />
                    <button className="px-4 py-2.5 bg-primary text-white text-xs font-black rounded-xl">Save Brochure</button>
                  </div>

                  {company.metadata?.catalog_url && (
                    <a
                      href={company.metadata.catalog_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-black text-primary hover:underline"
                    >
                      <ExternalLink className="size-4" />
                      <span>Download Current Business Catalog PDF</span>
                    </a>
                  )}
                </div>
              )}

              {/* Short Videos: real camera/gallery upload of short clips */}
              {company && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-foreground flex items-center gap-1.5">
                        <span>Short Videos</span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Upload short clips from your phone showing your products or facility</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="video/*"
                        id="video-upload-input"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadVideo(f); e.target.value = "" }}
                        disabled={uploadingVideo}
                        className="hidden"
                      />
                      <label
                        htmlFor="video-upload-input"
                        className={`rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:opacity-95 shrink-0 inline-flex items-center gap-1.5 ${uploadingVideo ? "opacity-50 pointer-events-none cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {uploadingVideo ? "Uploading..." : "Add Video"}
                      </label>
                    </div>
                  </div>

                  {companyMedia.filter(x => x.media_type === "video").length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {companyMedia.filter(x => x.media_type === "video").map((med) => (
                        <div key={med.id} className="relative rounded-xl overflow-hidden border border-border bg-black">
                          <video src={med.url} controls className="w-full aspect-video" />
                          <button
                            type="button"
                            onClick={() => handleDeleteMediaAsset(med.id)}
                            className="absolute top-2 end-2 px-2 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-6">No videos uploaded yet.</p>
                  )}
                </div>
              )}

              {/* Quality certifications (Enterprise Level only) */}
              {company?.profileLevel === "enterprise" && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-foreground flex items-center gap-1.5">
                        <Award className="size-4.5 text-primary" />
                        <span>Quality & Standard Certifications</span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">ISO, Organic Agriculture, and regulatory licenses establishing trust</p>
                    </div>
                    {company && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste certificate link"
                          value={certUrl}
                          onChange={(e) => setCertUrl(e.target.value)}
                          className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddMediaAsset("certificate", certUrl, "ISO Standard Certificate")}
                          className="rounded-xl bg-primary px-4 py-2 text-xs font-black text-white hover:opacity-95 cursor-pointer shrink-0"
                        >
                          Add License
                        </button>
                      </div>
                    )}
                  </div>

                  {companyMedia.filter(x => x.media_type === "certificate").length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {companyMedia.filter(x => x.media_type === "certificate").map((med) => (
                        <div key={med.id} className="p-4 bg-secondary/20 border border-border rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center bg-primary/10 text-primary rounded-xl shrink-0">
                              <Award className="size-5" />
                            </span>
                            <div>
                              <p className="text-xs font-black text-foreground">{med.caption || "ISO Standard License"}</p>
                              <a href={med.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline font-bold mt-0.5 inline-block">View certification</a>
                            </div>
                          </div>
                          {company && (
                            <button
                              onClick={() => handleDeleteMediaAsset(med.id)}
                              className="size-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground italic">No official certificates uploaded yet. Promote your compliance above.</div>
                  )}
                </div>
              )}

              {/* Multiple Administrators Section (Enterprise Level only) */}
              {company?.profileLevel === "enterprise" && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in duration-300">
                  <div className="border-b border-border pb-2">
                    <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                      <Users className="size-4.5 text-primary" />
                      <span>Company Team & Administrators</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Manage multiple team members allowed to publish posts or products.</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-3 bg-secondary/15 rounded-xl border border-border/40">
                      <div>
                        <p className="font-black text-foreground">{fullNameInput || "Me"}</p>
                        <p className="text-[10px] text-muted-foreground">Owner Account (Primary)</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">Active Owner</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-secondary/15 rounded-xl border border-border/40 opacity-75">
                      <div>
                        <p className="font-bold text-foreground">Trade Agent 1</p>
                        <p className="text-[10px] text-muted-foreground">Sub-admin representative</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold">Simulated Admin</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Tab 6: Buyer Reviews.
              FIX: this used to render two fully fabricated testimonials
              ("Sourcing Agent, Marseilles" / "Bulk Wholesaler, Tripoli")
              with invented quotes, star ratings, and dates — presented as
              real buyer feedback. No reviews system exists anywhere in the
              database. Replaced with an honest empty state, matching the
              pattern already used for Posts/Products when empty. */}
          {activeTabResolved === "reviews" && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-black text-foreground">{dict.verifiedReviewsTitle}</h3>
                <p className="text-xs text-muted-foreground">{dict.verifiedReviewsDesc}</p>
              </div>

              <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
                <Award className="size-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-black text-foreground">{dict.noReviewsYetTitle}</p>
                <p className="text-xs text-muted-foreground">{dict.noReviewsYetDesc}</p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 6. Mobile Bottom Actions Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-40 p-3 flex sm:hidden gap-2.5 items-center">
        <a
          href={`tel:${company?.phoneNumber || "+21671123456"}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-secondary text-xs font-bold text-foreground hover:bg-secondary/80 transition-all"
        >
          <Phone className="size-4" />
          <span>Call Agent</span>
        </a>
        <button
          onClick={() => {
            alert("Redirecting to B2B Instant RFQ Desk...")
            router.push("/rfq")
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-primary text-xs font-black text-white hover:opacity-95 shadow-md shadow-primary/20 transition-all"
        >
          <Send className="size-4" />
          <span>Request Quote</span>
        </button>
      </div>

      {/* 7. QR CODE MODAL DIALOG */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[24px] border border-border bg-card p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-end">
              <button onClick={() => setShowQRModal(false)} className="size-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 pt-2">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <QrCode className="size-6" />
              </span>
              <h3 className="text-lg font-black text-foreground">Scan B2B Storefront</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Present this QR code to buyers during tradeshows and physical events to launch your B2B organic catalogue.</p>

              <div className="size-44 bg-neutral-100 border border-neutral-200 rounded-2xl mx-auto flex items-center justify-center">
                {/* Beautiful custom CSS-only QR block */}
                <div className="size-36 border-4 border-black p-1 relative flex items-center justify-center">
                  <div className="absolute top-1 left-1 size-8 bg-black" />
                  <div className="absolute top-1 right-1 size-8 bg-black" />
                  <div className="absolute bottom-1 left-1 size-8 bg-black" />
                  <div className="size-24 bg-neutral-900 rounded-md" />
                  <span className="absolute text-xs font-black text-white bg-primary px-1.5 py-0.5 rounded shadow-sm">ALSOUK</span>
                </div>
              </div>

              <p className="text-[10px] font-bold text-muted-foreground uppercase pt-2">@{company?.slug || "store"}</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. EDIT SETTINGS & SECURITY MODAL DIALOG */}
      {showEditSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                <span>Account Security & Parameters</span>
              </h3>
              <button
                onClick={() => setShowEditSettingsModal(false)}
                className="size-8 rounded-xl border border-border hover:bg-secondary/40 flex items-center justify-center text-muted-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-6">

              {/* Profile details */}
              <div className="space-y-4 pb-4 border-b border-border">
                <h4 className="text-xs font-black uppercase text-muted-foreground">Personal Parameters</h4>

                {profileSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl">
                    {profileSuccess}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                      <input
                        type="text"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-border bg-secondary/10"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Avatar Emoji</label>
                      <input
                        type="text"
                        value={avatarInput}
                        onChange={(e) => setAvatarInput(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-border bg-secondary/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-white text-xs font-black py-2.5 rounded-xl transition-all cursor-pointer hover:opacity-95"
                  >
                    Update Profile Details
                  </button>
                </form>
              </div>

              {/* Security change password */}
              <div className="space-y-4 pb-4 border-b border-border">
                <h4 className="text-xs font-black uppercase text-muted-foreground">Change Password</h4>

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl">
                    {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-xl">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-border bg-secondary/10"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-border bg-secondary/10"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-white text-xs font-black py-2.5 rounded-xl transition-all cursor-pointer hover:opacity-95"
                  >
                    Change Password Securely
                  </button>
                </form>
              </div>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/20 hover:bg-destructive/10 text-xs font-extrabold text-destructive py-3 transition-all cursor-pointer"
              >
                <LogOut className="size-4" />
                <span>Disconnect Account</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Role Picker Dialog / Modal (Keep exactly as original behavior) */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir={dir}>
          <div className="w-full max-w-[500px] rounded-[24px] border border-border bg-card p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">

            <div className="text-center mb-6">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-blue-600 text-white mb-4">
                <Sparkles className="size-5 text-white" />
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                {t.auth.chooseRoleTitle}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {t.auth.chooseRoleDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">

              {/* Buyer Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("buyer")}
                className={`flex items-start gap-4 p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                  selectedRole === "buyer"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.01]"
                    : "border-border/80 hover:border-primary/50 hover:bg-secondary/40"
                }`}
              >
                <span className={`flex size-10 items-center justify-center rounded-xl transition-all shrink-0 ${
                  selectedRole === "buyer" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  <ShoppingBag className="size-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{t.auth.buyer}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                    {t.auth.buyerDesc}
                  </p>
                </div>
              </button>

              {/* Supplier Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("supplier")}
                className={`flex items-start gap-4 p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                  selectedRole === "supplier"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.01]"
                    : "border-border/80 hover:border-primary/50 hover:bg-secondary/40"
                }`}
              >
                <span className={`flex size-10 items-center justify-center rounded-xl transition-all shrink-0 ${
                  selectedRole === "supplier" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  <Building2 className="size-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{t.auth.supplier}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                    {t.auth.supplierDesc}
                  </p>
                </div>
              </button>

            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveRole}
              disabled={updating || !selectedRole}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-xs font-extrabold text-white py-3.5 transition-all shadow-md shadow-primary/10 disabled:opacity-50 cursor-pointer"
            >
              {updating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t.marketplace.loading}</span>
                </>
              ) : (
                <>
                  <span>{t.auth.saveRoleBtn}</span>
                  <ChevronRight className="size-4 rtl:rotate-180" />
                </>
              )}
            </button>

          </div>
        </div>
      )}

    </div>
  )
}

export default function AccountPage() {
  return (
    <MarketplaceShell>
      <AccountScreen />
    </MarketplaceShell>
  )
}
