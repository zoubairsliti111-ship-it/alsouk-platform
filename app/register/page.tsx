"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Globe,
  Check,
  ChevronDown,
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  MapPin,
  Globe2,
  FileText,
  Upload,
  Camera,
  ChevronRight,
  ArrowLeft,
  Briefcase,
  Store,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react"

import { LanguageProvider, useLanguage } from "@/components/language-provider"
import { LANGS } from "@/lib/i18n"

// Custom SVG Brand Icons since they are not bundled in this version of lucide-react
const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

// Tunisia Governorates for realistic Step 2
const GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte",
  "Béja", "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia",
  "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès", "Medenine",
  "Tataouine", "Gafsa", "Tozeur", "Kebili"
].sort()

// Localized translations for the Registration Flow
const REG_TRANS = {
  en: {
    title: "Join ALSOUK",
    subtitle: "Create your business account to start buying and selling on ALSOUK.",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    email: "Email Address",
    emailPlaceholder: "name@company.com",
    phone: "Phone Number",
    phonePlaceholder: "+216 -- --- ---",
    password: "Password",
    confirmPassword: "Confirm Password",
    btnContinue: "Continue",
    btnBack: "Back",
    btnCreate: "Create My Store",
    alreadyAccount: "Already have an account?",
    signIn: "Sign In",
    step: "Step",
    of: "of",
    // Step 2
    compName: "Company Name",
    compNamePlaceholder: "e.g., Carthage Olive Oil Co.",
    busType: "Business Type",
    country: "Country",
    gov: "Governorate",
    city: "City",
    cityPlaceholder: "e.g., Sfax, Tunis",
    address: "Business Address",
    addressPlaceholder: "Street, Industrial Zone, Postal Code",
    website: "Website (Optional)",
    websitePlaceholder: "https://www.company.com",
    desc: "Short Business Description",
    descPlaceholder: "Describe your business, products, or manufacturing capacity...",
    // Step 3
    storeSection: "Store Section",
    storeLogo: "Store Logo",
    coverImg: "Cover Image",
    storeName: "Store Name",
    storeNamePlaceholder: "e.g., Carthage Olive Oil Store",
    storeUrl: "Store URL",
    storeUrlPlaceholder: "carthage-olive-oil",
    storeDesc: "Store Description",
    storeDescPlaceholder: "A detailed description of your store, values, and offerings...",
    profileSection: "Profile Section",
    profilePhoto: "Profile Photo",
    ownerName: "Owner Name",
    ownerNamePlaceholder: "Your full name as the business owner",
    position: "Position",
    positionPlaceholder: "e.g., CEO, Founder, Export Manager",
    shortBio: "Short Bio",
    shortBioPlaceholder: "Tell buyers a bit about yourself...",
    contactSection: "Contact Section",
    busPhone: "Business Phone",
    busPhonePlaceholder: "e.g., +216 71 000 000",
    busEmail: "Business Email",
    busEmailPlaceholder: "info@company.com",
    socialLinks: "Social Links",
    facebookPlaceholder: "Facebook page URL",
    linkedinPlaceholder: "LinkedIn profile URL",
    instagramPlaceholder: "Instagram handle",
    tiktokPlaceholder: "TikTok handle",
    mockUpload: "Click to upload"
  },
  fr: {
    title: "Rejoindre ALSOUK",
    subtitle: "Créez votre compte professionnel pour commencer à acheter et vendre sur ALSOUK.",
    fullName: "Nom complet",
    fullNamePlaceholder: "Entrez votre nom complet",
    email: "Adresse e-mail",
    emailPlaceholder: "nom@entreprise.com",
    phone: "Numéro de téléphone",
    phonePlaceholder: "+216 -- --- ---",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    btnContinue: "Continuer",
    btnBack: "Retour",
    btnCreate: "Créer ma boutique",
    alreadyAccount: "Vous avez déjà un compte ?",
    signIn: "Se connecter",
    step: "Étape",
    of: "sur",
    // Step 2
    compName: "Nom de l'entreprise",
    compNamePlaceholder: "ex : Carthage Olive Oil Co.",
    busType: "Type d'entreprise",
    country: "Pays",
    gov: "Gouvernorat",
    city: "Ville",
    cityPlaceholder: "ex : Sfax, Tunis",
    address: "Adresse de l'entreprise",
    addressPlaceholder: "Rue, Zone Industrielle, Code Postal",
    website: "Site Internet (Optionnel)",
    websitePlaceholder: "https://www.entreprise.com",
    desc: "Brève description de l'entreprise",
    descPlaceholder: "Décrivez votre activité, vos produits ou votre capacité de production...",
    // Step 3
    storeSection: "Section Boutique",
    storeLogo: "Logo de la boutique",
    coverImg: "Image de couverture",
    storeName: "Nom de la boutique",
    storeNamePlaceholder: "ex : Boutique d'Huile d'Olive Carthage",
    storeUrl: "URL de la boutique",
    storeUrlPlaceholder: "carthage-huile-olive",
    storeDesc: "Description de la boutique",
    storeDescPlaceholder: "Une description détaillée de votre boutique, vos valeurs...",
    profileSection: "Section Profil",
    profilePhoto: "Photo de profil",
    ownerName: "Nom du propriétaire",
    ownerNamePlaceholder: "Votre nom complet en tant que propriétaire",
    position: "Poste",
    positionPlaceholder: "ex : PDG, Fondateur, Responsable Export",
    shortBio: "Brève biographie",
    shortBioPlaceholder: "Parlez un peu de vous aux acheteurs...",
    contactSection: "Section Contact",
    busPhone: "Téléphone professionnel",
    busPhonePlaceholder: "ex : +216 71 000 000",
    busEmail: "E-mail professionnel",
    busEmailPlaceholder: "info@entreprise.com",
    socialLinks: "Liens sociaux",
    facebookPlaceholder: "URL de la page Facebook",
    linkedinPlaceholder: "URL du profil LinkedIn",
    instagramPlaceholder: "Compte Instagram",
    tiktokPlaceholder: "Compte TikTok",
    mockUpload: "Cliquez pour télécharger"
  },
  ar: {
    title: "انضم إلى السوق",
    subtitle: "أنشئ حسابك التجاري للبدء في البيع والشراء على منصة السوق.",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "أدخل اسمك الكامل",
    email: "البريد الإلكتروني",
    emailPlaceholder: "name@company.com",
    phone: "رقم الهاتف",
    phonePlaceholder: "+216 -- --- ---",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    btnContinue: "استمرار",
    btnBack: "رجوع",
    btnCreate: "إنشاء متجري",
    alreadyAccount: "هل لديك حساب بالفعل؟",
    signIn: "تسجيل الدخول",
    step: "الخطوة",
    of: "من",
    // Step 2
    compName: "اسم الشركة",
    compNamePlaceholder: "مثال: شركة قرطاج لزيت الزيتون",
    busType: "نوع العمل",
    country: "البلد",
    gov: "الولاية",
    city: "المدينة",
    cityPlaceholder: "مثال: صفاقس، تونس",
    address: "عنوان العمل",
    addressPlaceholder: "الشارع، المنطقة الصناعية، الرمز البريدي",
    website: "الموقع الإلكتروني (اختياري)",
    websitePlaceholder: "https://www.company.com",
    desc: "وصف قصير للعمل",
    descPlaceholder: "صف نشاطك التجاري، منتجاتك، أو طاقتك الإنتاجية...",
    // Step 3
    storeSection: "قسم المتجر",
    storeLogo: "شعار المتجر",
    coverImg: "صورة الغلاف",
    storeName: "اسم المتجر",
    storeNamePlaceholder: "مثال: متجر قرطاج لزيت الزيتون الممتاز",
    storeUrl: "رابط المتجر",
    storeUrlPlaceholder: "carthage-olive-oil",
    storeDesc: "وصف المتجر",
    storeDescPlaceholder: "وصف تفصيلي لمتجرك وقيمك وعروضك...",
    profileSection: "قسم الملف الشخصي",
    profilePhoto: "الصورة الشخصية",
    ownerName: "اسم صاحب العمل",
    ownerNamePlaceholder: "اسمك الكامل بصفتك صاحب العمل",
    position: "المنصب",
    positionPlaceholder: "مثال: المدير التنفيزي، المؤسس، مدير التصدير",
    shortBio: "سيرة ذاتية قصيرة",
    shortBioPlaceholder: "أخبر المشترين بنبذة قصيرة عنك...",
    contactSection: "قسم الاتصال",
    busPhone: "هاتف العمل",
    busPhonePlaceholder: "مثال: +216 71 000 000",
    busEmail: "البريد الإلكتروني للعمل",
    busEmailPlaceholder: "info@company.com",
    socialLinks: "روابط التواصل الاجتماعي",
    facebookPlaceholder: "رابط صفحة فيسبوك",
    linkedinPlaceholder: "رابط ملف لينكد إن",
    instagramPlaceholder: "حساب إنستغرام",
    tiktokPlaceholder: "حساب تيك توك",
    mockUpload: "انقر للتحميل"
  }
}

const BUSINESS_TYPES = [
  "Manufacturer",
  "Supplier",
  "Wholesaler",
  "Retailer",
  "Exporter",
  "Importer"
]

function RegisterContent() {
  const { lang, setLang, dir } = useLanguage()
  const router = useRouter()
  const [langOpen, setLangOpen] = useState(false)
  const currentLang = LANGS.find((l) => l.code === lang) || LANGS[0]

  const t = REG_TRANS[lang as keyof typeof REG_TRANS] || REG_TRANS.en

  // Wizard States
  const [step, setStep] = useState(1)

  // Form Fields State
  const [formData, setFormData] = useState({
    // Step 1
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",

    // Step 2
    companyName: "",
    businessType: "Manufacturer",
    country: "Tunisia",
    governorate: "Tunis",
    city: "",
    businessAddress: "",
    website: "",
    businessDescription: "",

    // Step 3
    storeLogo: "",
    coverImage: "",
    storeName: "",
    storeUrl: "",
    storeDescription: "",
    profilePhoto: "",
    ownerName: "",
    position: "",
    shortBio: "",
    businessPhone: "",
    businessEmail: "",
    facebook: "",
    linkedin: "",
    instagram: "",
    tiktok: ""
  })

  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Toggle Password Visibilities
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Input Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }

      // Auto-fill Store Name and Owner Name in Step 2 if they are empty
      if (name === "companyName" && !prev.storeName) {
        updated.storeName = value
        updated.storeUrl = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      }
      if (name === "fullName" && !prev.ownerName) {
        updated.ownerName = value
      }
      return updated
    })
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Upload simulation states
  const [mockUploads, setMockUploads] = useState({
    storeLogo: "/images/product-oliveoil.png",
    coverImage: "/images/supplier-factory.png",
    profilePhoto: "/images/product-ceramics.png"
  })

  const simulateUpload = (field: "storeLogo" | "coverImage" | "profilePhoto") => {
    // Cycles images to look interactive
    const images = {
      storeLogo: ["/images/product-oliveoil.png", "/images/product-textiles.png", "/images/product-ceramics.png"],
      coverImage: ["/images/supplier-factory.png", "/images/product-dates.png", "/images/product-leather.png"],
      profilePhoto: ["/images/product-ceramics.png", "/images/product-dates.png", "/images/product-textiles.png"]
    }
    const currentList = images[field]
    const currentIndex = currentList.indexOf(mockUploads[field])
    const nextIndex = (currentIndex + 1) % currentList.length
    const nextUrl = currentList[nextIndex]

    setMockUploads(prev => ({ ...prev, [field]: nextUrl }))
    setFormData(prev => ({ ...prev, [field]: nextUrl }))
  }

  // Validations
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required."
    if (!formData.email.trim()) {
      newErrors.email = "Email is required."
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format."
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required."
    if (!formData.password) {
      newErrors.password = "Password is required."
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters."
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.companyName.trim()) newErrors.companyName = "Company Name is required."
    if (!formData.city.trim()) newErrors.city = "City is required."
    if (!formData.businessAddress.trim()) newErrors.businessAddress = "Business Address is required."
    if (!formData.businessDescription.trim()) newErrors.businessDescription = "Business Description is required."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.storeName.trim()) newErrors.storeName = "Store Name is required."
    if (!formData.storeUrl.trim()) newErrors.storeUrl = "Store URL is required."
    if (!formData.storeDescription.trim()) newErrors.storeDescription = "Store Description is required."
    if (!formData.ownerName.trim()) newErrors.ownerName = "Owner Name is required."
    if (!formData.position.trim()) newErrors.position = "Position is required."
    if (!formData.shortBio.trim()) newErrors.shortBio = "Short Bio is required."
    if (!formData.businessPhone.trim()) newErrors.businessPhone = "Business Phone is required."
    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = "Business Email is required."
    } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
      newErrors.businessEmail = "Invalid email format."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigation handlers
  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep1()) {
      setStep(2)
      window.scrollTo(0, 0)
    }
  }

  const handleStep2Continue = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep2()) {
      setStep(3)
      window.scrollTo(0, 0)
    }
  }

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep3()) {
      // Encode data to pass to the dashboard to show personalization
      const encodedData = encodeURIComponent(JSON.stringify({
        ...formData,
        storeLogo: mockUploads.storeLogo,
        coverImage: mockUploads.coverImage,
        profilePhoto: mockUploads.profilePhoto
      }))
      router.push(`/supplier/dashboard?data=${encodedData}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] pb-12" dir={dir}>

      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-50 w-full h-[64px] border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto h-full flex items-center justify-between px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#2563EB] text-lg font-bold text-white shadow-sm">
              A
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              AL<span className="text-[#2563EB]">SOUK</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Globe className="size-4 text-[#2563EB]" />
                <span>{currentLang.native}</span>
                <ChevronDown className={`size-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <div className={`absolute ${dir === "rtl" ? "left-0" : "right-0"} top-full mt-2 z-50 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg`}>
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code)
                        setLangOpen(false)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span className="w-full text-start">{l.native}</span>
                      {l.code === lang && <Check className="size-4 text-[#2563EB]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">

          {/* Progress indicators for Step 2 and 3 */}
          {step > 1 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span className="uppercase tracking-wider">Supplier Registration</span>
                <span>{t.step} {step} {t.of} 3</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Master Form Card */}
          <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-sm border border-slate-100">

            {/* Step 1: Create Account */}
            {step === 1 && (
              <form onSubmit={handleStep1Continue} className="space-y-6">
                <div className="text-center sm:text-start">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.title}</h1>
                  <p className="text-sm text-slate-500 mt-2 font-normal leading-relaxed">
                    {t.subtitle}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.fullName} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <User className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400`} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder={t.fullNamePlaceholder}
                        className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-xl border ${errors.fullName ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white transition-all`}
                      />
                    </div>
                    {errors.fullName && <span className="text-xs font-bold text-[#EF4444]">{errors.fullName}</span>}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.email} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400`} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t.emailPlaceholder}
                        className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-xl border ${errors.email ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white transition-all`}
                      />
                    </div>
                    {errors.email && <span className="text-xs font-bold text-[#EF4444]">{errors.email}</span>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.phone} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400`} />
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t.phonePlaceholder}
                        className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-xl border ${errors.phone ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white transition-all`}
                      />
                    </div>
                    {errors.phone && <span className="text-xs font-bold text-[#EF4444]">{errors.phone}</span>}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.password} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-12" : "pl-12 pr-12"} rounded-xl border ${errors.password ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute ${dir === "rtl" ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600`}
                      >
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                    {errors.password && <span className="text-xs font-bold text-[#EF4444]">{errors.password}</span>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.confirmPassword} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400`} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-12" : "pl-12 pr-12"} rounded-xl border ${errors.confirmPassword ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute ${dir === "rtl" ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600`}
                      >
                        {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="text-xs font-bold text-[#EF4444]">{errors.confirmPassword}</span>}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-[#2563EB] font-bold text-white shadow-sm hover:bg-[#2563EB]/95 active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-8"
                >
                  <span>{t.btnContinue}</span>
                  <ChevronRight className="size-4" />
                </button>

                <div className="text-center pt-4 border-t border-slate-100">
                  <p className="text-sm font-semibold text-slate-500">
                    {t.alreadyAccount}{" "}
                    <span className="text-[#2563EB] hover:underline cursor-pointer">
                      {t.signIn}
                    </span>
                  </p>
                </div>
              </form>
            )}

            {/* Step 2: Business Information */}
            {step === 2 && (
              <form onSubmit={handleStep2Continue} className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <Building2 className="size-4" />
                  </span>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Business Information</h1>
                </div>

                <div className="space-y-4">
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.compName} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400`} />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder={t.compNamePlaceholder}
                        className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-xl border ${errors.companyName ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white transition-all`}
                      />
                    </div>
                    {errors.companyName && <span className="text-xs font-bold text-[#EF4444]">{errors.companyName}</span>}
                  </div>

                  {/* Business Type Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.busType} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400 pointer-events-none`} />
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-10" : "pl-12 pr-10"} rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none appearance-none focus:border-[#2563EB] focus:bg-white transition-all`}
                      >
                        {BUSINESS_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute ${dir === "rtl" ? "left-4" : "right-4"} top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none`} />
                    </div>
                  </div>

                  {/* Country (Prefilled default Tunisia) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.country} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <Globe2 className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400 pointer-events-none`} />
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-10" : "pl-12 pr-10"} rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none appearance-none focus:border-[#2563EB] focus:bg-white transition-all`}
                      >
                        <option value="Tunisia">Tunisia</option>
                        <option value="Algeria">Algeria</option>
                        <option value="Morocco">Morocco</option>
                        <option value="Libya">Libya</option>
                        <option value="Egypt">Egypt</option>
                      </select>
                      <ChevronDown className={`absolute ${dir === "rtl" ? "left-4" : "right-4"} top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none`} />
                    </div>
                  </div>

                  {/* Governorate */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.gov} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400 pointer-events-none`} />
                      <select
                        name="governorate"
                        value={formData.governorate}
                        onChange={handleInputChange}
                        className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-10" : "pl-12 pr-10"} rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none appearance-none focus:border-[#2563EB] focus:bg-white transition-all`}
                      >
                        {GOVERNORATES.map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute ${dir === "rtl" ? "left-4" : "right-4"} top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none`} />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.city} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400`} />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder={t.cityPlaceholder}
                        className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-xl border ${errors.city ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white transition-all`}
                      />
                    </div>
                    {errors.city && <span className="text-xs font-bold text-[#EF4444]">{errors.city}</span>}
                  </div>

                  {/* Business Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.address} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-3 size-5 text-slate-400`} />
                      <textarea
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        placeholder={t.addressPlaceholder}
                        rows={2}
                        className={`w-full p-3 ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-xl border ${errors.businessAddress ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white transition-all resize-none`}
                      />
                    </div>
                    {errors.businessAddress && <span className="text-xs font-bold text-[#EF4444]">{errors.businessAddress}</span>}
                  </div>

                  {/* Website (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.website}
                    </label>
                    <div className="relative">
                      <Globe2 className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-5 -translate-y-1/2 text-slate-400`} />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder={t.websitePlaceholder}
                        className={`w-full h-12 ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white transition-all`}
                      />
                    </div>
                  </div>

                  {/* Short Business Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.desc} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <FileText className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-3 size-5 text-slate-400`} />
                      <textarea
                        name="businessDescription"
                        value={formData.businessDescription}
                        onChange={handleInputChange}
                        placeholder={t.descPlaceholder}
                        rows={3}
                        className={`w-full p-3 ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"} rounded-xl border ${errors.businessDescription ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white transition-all resize-none`}
                      />
                    </div>
                    {errors.businessDescription && <span className="text-xs font-bold text-[#EF4444]">{errors.businessDescription}</span>}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 rounded-full border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="size-4" />
                    <span>{t.btnBack}</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 rounded-full bg-[#2563EB] font-bold text-white shadow-sm hover:bg-[#2563EB]/95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{t.btnContinue}</span>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Store & Profile Setup */}
            {step === 3 && (
              <form onSubmit={handleStep3Submit} className="space-y-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <Store className="size-4" />
                  </span>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Store & Profile Setup</h1>
                </div>

                {/* STORE SECTION */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h2 className="text-sm font-bold text-[#2563EB] uppercase tracking-wider">
                    {t.storeSection}
                  </h2>

                  {/* Logo and Cover Side-by-Side uploads */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Store Logo */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">{t.storeLogo}</label>
                      <div
                        onClick={() => simulateUpload("storeLogo")}
                        className="h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group"
                      >
                        {mockUploads.storeLogo ? (
                          <>
                            <Image
                              src={mockUploads.storeLogo}
                              alt="Store Logo"
                              fill
                              sizes="200px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="size-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="size-5 text-slate-400 mb-1" />
                            <span className="text-[11px] font-semibold text-slate-500">{t.mockUpload}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">{t.coverImg}</label>
                      <div
                        onClick={() => simulateUpload("coverImage")}
                        className="h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group"
                      >
                        {mockUploads.coverImage ? (
                          <>
                            <Image
                              src={mockUploads.coverImage}
                              alt="Cover Image"
                              fill
                              sizes="200px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="size-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="size-5 text-slate-400 mb-1" />
                            <span className="text-[11px] font-semibold text-slate-500">{t.mockUpload}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Store Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.storeName} <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleInputChange}
                      placeholder={t.storeNamePlaceholder}
                      className={`w-full h-12 px-4 rounded-xl border ${errors.storeName ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                    />
                    {errors.storeName && <span className="text-xs font-bold text-[#EF4444]">{errors.storeName}</span>}
                  </div>

                  {/* Store URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.storeUrl} <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <span className={`absolute ${dir === "rtl" ? "left-4" : "left-4"} top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none`}>
                        alsouk.tn/stores/
                      </span>
                      <input
                        type="text"
                        name="storeUrl"
                        value={formData.storeUrl}
                        onChange={handleInputChange}
                        placeholder={t.storeUrlPlaceholder}
                        className={`w-full h-12 ${dir === "rtl" ? "pl-4 pr-[120px]" : "pl-[120px] pr-4"} rounded-xl border ${errors.storeUrl ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                      />
                    </div>
                    {errors.storeUrl && <span className="text-xs font-bold text-[#EF4444]">{errors.storeUrl}</span>}
                  </div>

                  {/* Store Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.storeDesc} <span className="text-[#EF4444]">*</span>
                    </label>
                    <textarea
                      name="storeDescription"
                      value={formData.storeDescription}
                      onChange={handleInputChange}
                      placeholder={t.storeDescPlaceholder}
                      rows={2}
                      className={`w-full p-3 rounded-xl border ${errors.storeDescription ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all resize-none`}
                    />
                    {errors.storeDescription && <span className="text-xs font-bold text-[#EF4444]">{errors.storeDescription}</span>}
                  </div>
                </div>

                {/* PROFILE SECTION */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h2 className="text-sm font-bold text-[#2563EB] uppercase tracking-wider">
                    {t.profileSection}
                  </h2>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Profile Photo */}
                    <div className="space-y-1.5 shrink-0 text-center sm:text-start">
                      <label className="text-xs font-bold text-slate-700 block">{t.profilePhoto}</label>
                      <div
                        onClick={() => simulateUpload("profilePhoto")}
                        className="size-20 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group"
                      >
                        {mockUploads.profilePhoto ? (
                          <>
                            <Image
                              src={mockUploads.profilePhoto}
                              alt="Profile"
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="size-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <Camera className="size-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      {/* Owner Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          {t.ownerName} <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                          type="text"
                          name="ownerName"
                          value={formData.ownerName}
                          onChange={handleInputChange}
                          placeholder={t.ownerNamePlaceholder}
                          className={`w-full h-11 px-4 rounded-xl border ${errors.ownerName ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                        />
                        {errors.ownerName && <span className="text-xs font-bold text-[#EF4444]">{errors.ownerName}</span>}
                      </div>

                      {/* Position */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          {t.position} <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          placeholder={t.positionPlaceholder}
                          className={`w-full h-11 px-4 rounded-xl border ${errors.position ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                        />
                        {errors.position && <span className="text-xs font-bold text-[#EF4444]">{errors.position}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Short Bio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {t.shortBio} <span className="text-[#EF4444]">*</span>
                    </label>
                    <textarea
                      name="shortBio"
                      value={formData.shortBio}
                      onChange={handleInputChange}
                      placeholder={t.shortBioPlaceholder}
                      rows={2}
                      className={`w-full p-3 rounded-xl border ${errors.shortBio ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all resize-none`}
                    />
                    {errors.shortBio && <span className="text-xs font-bold text-[#EF4444]">{errors.shortBio}</span>}
                  </div>
                </div>

                {/* CONTACT SECTION */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h2 className="text-sm font-bold text-[#2563EB] uppercase tracking-wider">
                    {t.contactSection}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Business Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        {t.busPhone} <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="text"
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleInputChange}
                        placeholder={t.busPhonePlaceholder}
                        className={`w-full h-12 px-4 rounded-xl border ${errors.businessPhone ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                      />
                      {errors.businessPhone && <span className="text-xs font-bold text-[#EF4444]">{errors.businessPhone}</span>}
                    </div>

                    {/* Business Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        {t.busEmail} <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="email"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleInputChange}
                        placeholder={t.busEmailPlaceholder}
                        className={`w-full h-12 px-4 rounded-xl border ${errors.businessEmail ? "border-[#EF4444]" : "border-slate-200"} bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                      />
                      {errors.businessEmail && <span className="text-xs font-bold text-[#EF4444]">{errors.businessEmail}</span>}
                    </div>
                  </div>
                </div>

                {/* SOCIAL LINKS */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h2 className="text-sm font-bold text-[#2563EB] uppercase tracking-wider">
                    {t.socialLinks}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Facebook */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Facebook</label>
                      <div className="relative">
                        <Facebook className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-4 -translate-y-1/2 text-[#1877F2]`} />
                        <input
                          type="url"
                          name="facebook"
                          value={formData.facebook}
                          onChange={handleInputChange}
                          placeholder={t.facebookPlaceholder}
                          className={`w-full h-11 ${dir === "rtl" ? "pr-11 pl-4" : "pl-11 pr-4"} rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                        />
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">LinkedIn</label>
                      <div className="relative">
                        <Linkedin className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-4 -translate-y-1/2 text-[#0A66C2]`} />
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          placeholder={t.linkedinPlaceholder}
                          className={`w-full h-11 ${dir === "rtl" ? "pr-11 pl-4" : "pl-11 pr-4"} rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                        />
                      </div>
                    </div>

                    {/* Instagram */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Instagram</label>
                      <div className="relative">
                        <Instagram className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 size-4 -translate-y-1/2 text-[#E1306C]`} />
                        <input
                          type="text"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          placeholder={t.instagramPlaceholder}
                          className={`w-full h-11 ${dir === "rtl" ? "pr-11 pl-4" : "pl-11 pr-4"} rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                        />
                      </div>
                    </div>

                    {/* TikTok */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">TikTok</label>
                      <div className="relative">
                        <span className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-900`}>
                          @
                        </span>
                        <input
                          type="text"
                          name="tiktok"
                          value={formData.tiktok}
                          onChange={handleInputChange}
                          placeholder={t.tiktokPlaceholder}
                          className={`w-full h-11 ${dir === "rtl" ? "pr-10 pl-4" : "pl-10 pr-4"} rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition-all`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 h-12 rounded-full border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="size-4" />
                    <span>{t.btnBack}</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 rounded-full bg-[#2563EB] font-bold text-white shadow-sm hover:bg-[#2563EB]/95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{t.btnCreate}</span>
                    <Check className="size-4" />
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>

    </div>
  )
}

export default function RegisterPage() {
  return (
    <LanguageProvider>
      <RegisterContent />
    </LanguageProvider>
  )
}
