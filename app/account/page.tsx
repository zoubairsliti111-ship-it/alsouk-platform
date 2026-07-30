"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
import {
  fetchCompanyForUser,
  createCompany,
  updateCompany
} from "@/lib/supabase/company-service"
import { type Company } from "@/lib/directory-data"
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
  FileText
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
    verificationStatus: "Verification Tier"
  },
  fr: {
    personalInfo: "Informations Personnelles",
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
    verificationStatus: "Niveau de vérification"
  },
  ar: {
    personalInfo: "المعلومات الشخصية",
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
    verificationStatus: "مستوى التوثيق"
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

  // Personal Information editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
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
  const [productsCount, setProductsCount] = useState(0)
  const [rfqsCount, setRfqsCount] = useState(0)
  const [fetchingCompanyInfo, setFetchingCompanyInfo] = useState(false)

  // Interactive Company Profile edit state
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [companySuccess, setCompanySuccess] = useState("")
  const [companyError, setCompanyError] = useState("")
  const [companyForm, setCompanyForm] = useState({
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

        // Set up the company edit form
        setCompanyForm({
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
      const phoneVal = metadata.phone_number || ""
      let filterStr = `email.eq.${currentUser.email}`
      if (phoneVal) {
        filterStr += `,phone.eq.${phoneVal}`
      }
      if (companyData?.supplierId) {
        filterStr += `,supplier_id.eq.${companyData.supplierId}`
      }

      const { count: rfqsCountVal, error: rfqsError } = await supabase
        .from("rfqs")
        .select("*", { count: "exact", head: true })
        .or(filterStr)

      if (!rfqsError && rfqsCountVal !== null) {
        setRfqsCount(rfqsCountVal)
      } else {
        setRfqsCount(0)
      }

    } catch (err) {
      console.error("Error fetching extra data:", err)
    } finally {
      setFetchingCompanyInfo(false)
    }
  }

  useEffect(() => {
    const supabase = createClient()

    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
        setIsEditingProfile(false)
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
      const formattedSlug = companyForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")

      const payload = {
        ...companyForm,
        slug: company?.slug || formattedSlug,
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
        setIsEditingCompany(false)
        fetchExtraData(user)
      } else {
        setCompanyError("Failed to persist company profile. Please ensure matching fields.")
      }
    } catch (err: any) {
      setCompanyError(err.message || "An unexpected error occurred while modifying the company")
    } finally {
      setUpdating(false)
    }
  }

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

  // Avatar rendering helper
  const renderAvatar = (url: string, name: string) => {
    const isEmoji = url && url.length <= 4 && !url.includes("http") && !url.includes(".")
    if (isEmoji) {
      return (
        <div className="relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary/10 to-blue-500/10 text-4xl shadow-md border border-primary/20">
          {url}
        </div>
      )
    }
    if (url && (url.startsWith("http") || url.startsWith("/") || url.includes("."))) {
      return (
        <div className="relative flex size-20 overflow-hidden rounded-3xl bg-secondary shadow-md border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={name} className="size-full object-cover" />
        </div>
      )
    }
    const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : "U"
    return (
      <div className="relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary to-blue-600 text-3xl font-black text-white shadow-lg shadow-primary/20">
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" dir={dir}>

      {/* Page title */}
      <div className="text-center sm:text-start">
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {t.auth.profileTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.auth.profileSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">

        {/* Column 1: Sidebar Profile Overview & Account Type */}
        <div className="space-y-6">

          {/* Section 1 & 2: Overview Card */}
          <div className="rounded-[20px] border border-border bg-card p-6 text-center shadow-lg shadow-primary/5">
            <div className="flex justify-center mb-4">
              {renderAvatar(metadata.avatar_url, fullName)}
            </div>
            <h2 className="text-xl font-black text-foreground tracking-tight">{fullName}</h2>

            {/* Section 2: Account Type Badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 transition-all">
              {accountType === "buyer" ? (
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20 text-xs font-bold shadow-sm">
                  <ShoppingBag className="size-4 shrink-0" />
                  {t.auth.buyer}
                </span>
              ) : accountType === "supplier" ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 text-xs font-bold shadow-sm">
                  <Building2 className="size-4 shrink-0" />
                  {t.auth.supplier}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground bg-secondary px-3.5 py-1.5 rounded-full text-xs font-bold">
                  <User className="size-4 shrink-0" />
                  {t.auth.notSet}
                </span>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-border/60 text-start space-y-3.5">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Globe className="size-4 text-muted-foreground" />
                <span className="font-medium">
                  {metadata.country && dirT.countries[metadata.country as keyof typeof dirT.countries]
                    ? dirT.countries[metadata.country as keyof typeof dirT.countries]
                    : metadata.country || t.auth.notSet}
                  {metadata.city && `, ${
                    dirT.cities[metadata.city] || metadata.city
                  }`}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="font-medium">
                  {dict.memberSince}: {memberSinceStr}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/20 hover:bg-destructive/10 text-xs font-extrabold text-destructive py-3 transition-all cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>{t.auth.logout}</span>
            </button>
          </div>

          {/* Section 5: Account Summary Metrics */}
          <div className="rounded-[20px] border border-border bg-card p-6 shadow-lg shadow-primary/5 space-y-4">
            <h3 className="text-sm font-black text-foreground tracking-tight flex items-center gap-2">
              <Box className="size-4 text-primary" />
              <span>{dict.accountSummary}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/40 rounded-2xl p-3 text-center border border-border/50">
                <div className="text-2xl font-black text-foreground">{productsCount}</div>
                <div className="text-[10px] font-bold text-muted-foreground mt-0.5 line-clamp-1">{dict.numProducts}</div>
              </div>
              <div className="bg-secondary/40 rounded-2xl p-3 text-center border border-border/50">
                <div className="text-2xl font-black text-foreground">{rfqsCount}</div>
                <div className="text-[10px] font-bold text-muted-foreground mt-0.5 line-clamp-1">{dict.numRfqs}</div>
              </div>
              <div className="bg-secondary/40 rounded-2xl p-3 text-center border border-border/50 col-span-2">
                <div className="text-2xl font-black text-foreground">0</div>
                <div className="text-[10px] font-bold text-muted-foreground mt-0.5">{dict.numMessages}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Column 2: Profile Details, Company Profile & Security */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Personal Information Card */}
          <div className="rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-lg shadow-primary/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <User className="size-5 text-primary" />
                <span>{dict.personalInfo}</span>
              </h3>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-primary hover:bg-primary/5 rounded-lg border border-primary/20 transition-all cursor-pointer"
                >
                  <Edit2 className="size-3" />
                  <span>{dict.editProfile}</span>
                </button>
              )}
            </div>

            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                <Sparkles className="size-4" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-xl">
                {profileError}
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-5">

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">{t.auth.fullName}</label>
                  <input
                    type="text"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    placeholder={t.auth.fullNamePlaceholder}
                    className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* Avatar Picker Choice */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground block">{dict.avatarOptionLabel}</label>
                  <div className="flex flex-wrap gap-2 py-1">
                    {PREDEFINED_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatarInput(emoji)}
                        className={`size-10 rounded-xl flex items-center justify-center text-xl border transition-all cursor-pointer ${
                          avatarInput === emoji
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                            : "border-border hover:bg-secondary/50"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="pt-1.5">
                    <input
                      type="text"
                      value={avatarInput}
                      onChange={(e) => setAvatarInput(e.target.value)}
                      placeholder={dict.customAvatarUrl}
                      className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Country and City selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Country Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">{dict.country}</label>
                    <select
                      value={countryInput}
                      onChange={(e) => {
                        setCountryInput(e.target.value)
                        setCityInput("") // Reset city upon changing country
                      }}
                      className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                    >
                      <option value="">{dict.selectCountry}</option>
                      {Object.keys(COUNTRY_TO_CITIES).map((key) => (
                        <option key={key} value={key}>
                          {dirT.countries[key as keyof typeof dirT.countries] || key}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">{dict.city}</label>
                    {countryInput && COUNTRY_TO_CITIES[countryInput] ? (
                      <select
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      >
                        <option value="">{dict.selectCity}</option>
                        {COUNTRY_TO_CITIES[countryInput].map((city) => (
                          <option key={city} value={city}>
                            {dirT.cities[city] || city}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        placeholder={dict.enterCity}
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-xs font-extrabold text-white py-3 px-6 transition-all shadow-md shadow-primary/10 disabled:opacity-50 cursor-pointer"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>{dict.savingChanges}</span>
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        <span>{dict.saveChanges}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false)
                      initializeProfileForm(user)
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-border hover:bg-secondary/50 text-xs font-bold text-foreground py-3 px-6 transition-all cursor-pointer"
                  >
                    <X className="size-4" />
                    <span>{dict.cancel}</span>
                  </button>
                </div>

              </form>
            ) : (
              <div className="space-y-4">

                {/* Full Name display */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-center sm:gap-4 border-b border-border/50 pb-4">
                  <span className="text-xs font-bold text-muted-foreground">{t.auth.fullName}</span>
                  <span className="text-xs font-black text-foreground sm:col-span-2">{fullName}</span>
                </div>

                {/* Phone display - read-only */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-center sm:gap-4 border-b border-border/50 pb-4">
                  <span className="text-xs font-bold text-muted-foreground">{t.auth.phone}</span>
                  <span className="text-xs font-semibold text-foreground sm:col-span-2 flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <span>{phoneVal}</span>
                  </span>
                </div>

                {/* Email display - read-only */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-center sm:gap-4 border-b border-border/50 pb-4">
                  <span className="text-xs font-bold text-muted-foreground">{t.auth.email}</span>
                  <span className="text-xs font-semibold text-foreground sm:col-span-2 flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <span className="break-all">{emailVal}</span>
                  </span>
                </div>

                {/* Country display */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-center sm:gap-4 border-b border-border/50 pb-4">
                  <span className="text-xs font-bold text-muted-foreground">{dict.country}</span>
                  <span className="text-xs font-semibold text-foreground sm:col-span-2 capitalize flex items-center gap-2">
                    <Globe className="size-4 text-muted-foreground" />
                    <span>
                      {metadata.country && dirT.countries[metadata.country as keyof typeof dirT.countries]
                        ? dirT.countries[metadata.country as keyof typeof dirT.countries]
                        : metadata.country || t.auth.notSet}
                    </span>
                  </span>
                </div>

                {/* City display */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-center sm:gap-4">
                  <span className="text-xs font-bold text-muted-foreground">{dict.city}</span>
                  <span className="text-xs font-semibold text-foreground sm:col-span-2 capitalize flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span>
                      {metadata.city && dirT.cities[metadata.city]
                        ? dirT.cities[metadata.city]
                        : metadata.city || t.auth.notSet}
                    </span>
                  </span>
                </div>

              </div>
            )}
          </div>

          {/* Section 3: Company Information Card (Visible only to Suppliers) */}
          {accountType === "supplier" && (
            <div className="rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <Building2 className="size-5 text-primary" />
                  <span>{dict.companyInfo}</span>
                </h3>
                {company && !isEditingCompany && (
                  <button
                    onClick={() => setIsEditingCompany(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-primary hover:bg-primary/5 rounded-lg border border-primary/20 transition-all cursor-pointer"
                  >
                    <Edit2 className="size-3" />
                    <span>{dict.editCompany}</span>
                  </button>
                )}
              </div>

              {companySuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <span>{companySuccess}</span>
                </div>
              )}

              {companyError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-xl">
                  {companyError}
                </div>
              )}

              {fetchingCompanyInfo ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : isEditingCompany ? (
                <form onSubmit={handleUpdateCompanyProfile} className="space-y-6">

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">{t.auth.fullName}</label>
                    <input
                      type="text"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                      placeholder="e.g. Sfax Olive Oil Export"
                      className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Tagline */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">{dict.tagline}</label>
                    <input
                      type="text"
                      value={companyForm.tagline}
                      onChange={(e) => setCompanyForm({...companyForm, tagline: e.target.value})}
                      placeholder="e.g. Premium organic olive oil from Sfax"
                      className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">{dict.description}</label>
                    <textarea
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                      placeholder="Describe your factory, products, production capacity..."
                      className="w-full min-h-24 px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                    />
                  </div>

                  {/* Logo & Banner URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">{dict.logoUrl}</label>
                      <input
                        type="text"
                        value={companyForm.logoUrl}
                        onChange={(e) => setCompanyForm({...companyForm, logoUrl: e.target.value})}
                        placeholder="e.g. /logos/company.png"
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">{dict.bannerUrl}</label>
                      <input
                        type="text"
                        value={companyForm.bannerUrl}
                        onChange={(e) => setCompanyForm({...companyForm, bannerUrl: e.target.value})}
                        placeholder="e.g. /banners/company.jpg"
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Website Strategy */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">{dict.websiteUrl}</label>
                      <input
                        type="text"
                        value={companyForm.websiteUrl}
                        onChange={(e) => setCompanyForm({...companyForm, websiteUrl: e.target.value})}
                        placeholder="e.g. www.sfaxoliveoil.com"
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">{dict.websiteMode}</label>
                      <select
                        value={companyForm.websiteMode}
                        onChange={(e) => setCompanyForm({...companyForm, websiteMode: e.target.value as any})}
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      >
                        <option value="external">External Website only</option>
                        <option value="alsouk">ALSOUK Generated Store only</option>
                        <option value="both">Both strategies</option>
                      </select>
                    </div>
                  </div>

                  {/* Business Classification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">{dict.businessType}</label>
                      <select
                        value={companyForm.businessType}
                        onChange={(e) => setCompanyForm({...companyForm, businessType: e.target.value})}
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all capitalize"
                      >
                        <option value="">Choose business type</option>
                        {BUSINESS_TYPES.map(type => (
                          <option key={type} value={type}>{type.replace("_", " ")}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">{dict.primaryIndustry}</label>
                      <select
                        value={companyForm.primaryIndustry}
                        onChange={(e) => setCompanyForm({...companyForm, primaryIndustry: e.target.value})}
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all capitalize"
                      >
                        <option value="">Choose primary industry</option>
                        {INDUSTRIES.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Demographics & Tax Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">{dict.yearEstablished}</label>
                      <input
                        type="number"
                        value={companyForm.yearEstablished}
                        onChange={(e) => setCompanyForm({...companyForm, yearEstablished: e.target.value})}
                        placeholder="e.g. 2012"
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">{dict.companySize}</label>
                      <select
                        value={companyForm.companySize}
                        onChange={(e) => setCompanyForm({...companyForm, companySize: e.target.value})}
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      >
                        <option value="">Choose size</option>
                        <option value="1-10">1 - 10 employees</option>
                        <option value="11-50">11 - 50 employees</option>
                        <option value="51-200">51 - 200 employees</option>
                        <option value="201-500">201 - 500 employees</option>
                        <option value="500+">More than 500</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="text-xs font-bold text-muted-foreground">{dict.taxIdentifier}</label>
                      <input
                        type="text"
                        value={companyForm.taxIdentifier}
                        onChange={(e) => setCompanyForm({...companyForm, taxIdentifier: e.target.value})}
                        placeholder="e.g. 1234567/A/M/000"
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Physical Address details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">{dict.country}</label>
                      <select
                        value={companyForm.country}
                        onChange={(e) => setCompanyForm({...companyForm, country: e.target.value, city: ""})}
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all capitalize"
                      >
                        {Object.keys(COUNTRY_TO_CITIES).map(k => (
                          <option key={k} value={k}>{dirT.countries[k as keyof typeof dirT.countries] || k}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">{dict.city}</label>
                      {COUNTRY_TO_CITIES[companyForm.country] ? (
                        <select
                          value={companyForm.city}
                          onChange={(e) => setCompanyForm({...companyForm, city: e.target.value})}
                          className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all capitalize"
                        >
                          <option value="">{dict.selectCity}</option>
                          {COUNTRY_TO_CITIES[companyForm.country].map(city => (
                            <option key={city} value={city}>{dirT.cities[city] || city}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={companyForm.city}
                          onChange={(e) => setCompanyForm({...companyForm, city: e.target.value})}
                          placeholder={dict.enterCity}
                          className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                        />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">{dict.postalCode}</label>
                      <input
                        type="text"
                        value={companyForm.postalCode}
                        onChange={(e) => setCompanyForm({...companyForm, postalCode: e.target.value})}
                        placeholder="e.g. 3000"
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">{dict.streetAddress}</label>
                    <input
                      type="text"
                      value={companyForm.streetAddress}
                      onChange={(e) => setCompanyForm({...companyForm, streetAddress: e.target.value})}
                      placeholder="e.g. Route de Gabes Km 2"
                      className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                    />
                  </div>

                  {/* Multi-language and Export Destination selections (Extensible arrays) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-secondary/15 border border-border/50">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-foreground block">{dict.supportedLanguages}</label>
                      <div className="space-y-2">
                        {LANGUAGES_OPTIONS.map(opt => (
                          <label key={opt.key} className="flex items-center gap-2.5 text-xs font-medium text-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={companyForm.supportedLanguages.includes(opt.key)}
                              onChange={() => handleLanguageCheckboxChange(opt.key)}
                              className="rounded border-border text-primary focus:ring-primary size-4"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-foreground block">{dict.exportMarkets}</label>
                      <div className="space-y-2">
                        {EXPORT_MARKETS_OPTIONS.map(opt => (
                          <label key={opt.key} className="flex items-center gap-2.5 text-xs font-medium text-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={companyForm.exportMarkets.includes(opt.key)}
                              onChange={() => handleExportMarketCheckboxChange(opt.key)}
                              className="rounded border-border text-primary focus:ring-primary size-4"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Social Network URLs */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-black text-foreground tracking-tight border-b border-border/50 pb-1.5 flex items-center gap-1.5">
                      <span>{dict.socialLinks}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">Facebook URL</label>
                        <input
                          type="text"
                          value={companyForm.facebookUrl}
                          onChange={(e) => setCompanyForm({...companyForm, facebookUrl: e.target.value})}
                          placeholder="https://facebook.com/company"
                          className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">Instagram URL</label>
                        <input
                          type="text"
                          value={companyForm.instagramUrl}
                          onChange={(e) => setCompanyForm({...companyForm, instagramUrl: e.target.value})}
                          placeholder="https://instagram.com/company"
                          className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">TikTok URL</label>
                        <input
                          type="text"
                          value={companyForm.tiktokUrl}
                          onChange={(e) => setCompanyForm({...companyForm, tiktokUrl: e.target.value})}
                          placeholder="https://tiktok.com/@company"
                          className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">LinkedIn URL</label>
                        <input
                          type="text"
                          value={companyForm.linkedinUrl}
                          onChange={(e) => setCompanyForm({...companyForm, linkedinUrl: e.target.value})}
                          placeholder="https://linkedin.com/company/name"
                          className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground">YouTube URL</label>
                        <input
                          type="text"
                          value={companyForm.youtubeUrl}
                          onChange={(e) => setCompanyForm({...companyForm, youtubeUrl: e.target.value})}
                          placeholder="https://youtube.com/c/company"
                          className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission and Cancel CTA Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-xs font-extrabold text-white py-3 px-6 transition-all shadow-md shadow-primary/10 disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>{dict.savingChanges}</span>
                        </>
                      ) : (
                        <>
                          <Save className="size-4" />
                          <span>{dict.saveChanges}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingCompany(false)
                        fetchExtraData(user)
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-border hover:bg-secondary/50 text-xs font-bold text-foreground py-3 px-6 transition-all cursor-pointer"
                    >
                      <X className="size-4" />
                      <span>{dict.cancel}</span>
                    </button>
                  </div>

                </form>
              ) : company ? (
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    {company.logoUrl ? (
                      <div className="size-16 rounded-2xl border border-border bg-white overflow-hidden shrink-0 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={company.logoUrl} alt={company.name} className="size-full object-contain p-1" />
                      </div>
                    ) : (
                      <div className="size-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-foreground">{company.name}</h4>
                        {company.verified && (
                          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {t.marketplace.companies.verified}
                          </span>
                        )}
                      </div>

                      {company.websiteUrl && (
                        <a
                          href={company.websiteUrl.startsWith("http") ? company.websiteUrl : `https://${company.websiteUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <Globe className="size-3.5" />
                          <span>{company.websiteUrl}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Profile Progress Indicator Bar */}
                  <div className="bg-secondary/15 p-4 rounded-xl border border-border/50 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>{dict.profileProgress}</span>
                      <span className="text-primary">{company.profileCompletion}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${company.profileCompletion}%` }}></div>
                    </div>
                  </div>

                  {company.description && (
                    <div className="text-xs text-muted-foreground leading-relaxed bg-secondary/20 p-4 rounded-xl border border-border/55">
                      {company.description}
                    </div>
                  )}

                  {/* Structured Details Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium border-t border-border/50 pt-4">

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span>
                        {company.city ? (dirT.cities[company.city] || company.city) : ""}, {company.country ? (dirT.countries[company.country as keyof typeof dirT.countries] || company.country) : ""}
                      </span>
                    </div>

                    {company.taxIdentifier && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="size-4 text-muted-foreground" />
                        <span>MF / RNE: <strong className="text-foreground">{company.taxIdentifier}</strong></span>
                      </div>
                    )}

                    {company.businessType && (
                      <div className="flex items-center gap-2 text-muted-foreground capitalize">
                        <Building2 className="size-4 text-muted-foreground" />
                        <span>Type: <strong className="text-foreground">{company.businessType.replace("_", " ")}</strong></span>
                      </div>
                    )}

                    {company.primaryIndustry && (
                      <div className="flex items-center gap-2 text-muted-foreground capitalize">
                        <Box className="size-4 text-muted-foreground" />
                        <span>Industry: <strong className="text-foreground">{company.primaryIndustry}</strong></span>
                      </div>
                    )}

                    {company.companySize && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="size-4 text-muted-foreground" />
                        <span>Size: <strong className="text-foreground">{company.companySize} employees</strong></span>
                      </div>
                    )}

                    {company.yearEstablished && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span>Est: <strong className="text-foreground">{company.yearEstablished}</strong></span>
                      </div>
                    )}

                  </div>

                  {/* Target Export Destinations and Languages Tagging display */}
                  {(company.supportedLanguages.length > 0 || company.exportMarkets.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-secondary/15 p-4 rounded-xl border border-border/50">
                      {company.supportedLanguages.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-bold text-muted-foreground">{dict.supportedLanguages}</span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {company.supportedLanguages.map(l => (
                              <span key={l} className="bg-card px-2.5 py-1 rounded-md border border-border text-[10px] font-bold text-foreground capitalize">
                                {LANGUAGES_OPTIONS.find(o => o.key === l)?.label || l}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {company.exportMarkets.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-bold text-muted-foreground">{dict.exportMarkets}</span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {company.exportMarkets.map(m => (
                              <span key={m} className="bg-card px-2.5 py-1 rounded-md border border-border text-[10px] font-bold text-foreground uppercase">
                                {EXPORT_MARKETS_OPTIONS.find(o => o.key === m)?.label || m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verification Status */}
                  <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 shrink-0" />
                      <span className="text-xs font-bold capitalize">{dict.verificationStatus}: <strong>{company.verificationTier}</strong></span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-secondary/15 rounded-2xl border border-dashed border-border/80">
                  <Building2 className="size-10 text-muted-foreground/60 mx-auto mb-3" />
                  <h4 className="text-sm font-black text-foreground mb-1">{dict.completeCompanyCta}</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-normal mb-4">
                    {dict.completeCompanyDesc}
                  </p>
                  <button
                    onClick={() => setIsEditingCompany(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-xs font-extrabold text-white py-3 px-6 transition-all shadow-md shadow-primary/10 cursor-pointer"
                  >
                    <PlusIcon className="size-4 shrink-0" />
                    <span>Create Company Profile</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Security Card (Change Password & LogOut) */}
          <div className="rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-lg shadow-primary/5 space-y-6">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <span>{dict.security}</span>
            </h3>

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

            {isChangingPassword ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">{dict.newPassword}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={dict.newPassword}
                      className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">{t.auth.confirmPassword}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.auth.confirmPassword}
                      className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-xs font-extrabold text-white py-3 px-6 transition-all shadow-md shadow-primary/10 disabled:opacity-50 cursor-pointer"
                  >
                    {updatingPassword ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>{t.marketplace.loading}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="size-4" />
                        <span>{dict.updatePasswordBtn}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false)
                      setNewPassword("")
                      setConfirmPassword("")
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-border hover:bg-secondary/50 text-xs font-bold text-foreground py-3 px-6 transition-all cursor-pointer"
                  >
                    <span>{dict.cancel}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border hover:bg-secondary/50 text-xs font-extrabold text-foreground py-3 px-5 transition-all cursor-pointer"
                >
                  <Lock className="size-4 text-muted-foreground" />
                  <span>{dict.changePassword}</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

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

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

export default function AccountPage() {
  return (
    <MarketplaceShell>
      <AccountScreen />
    </MarketplaceShell>
  )
}
