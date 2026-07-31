"use client"

import { useEffect, useState, useTransition, useMemo } from "react"
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
  Store
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
    onboardingDesc: "قم بإنشاء وتفعيل الملف التعريفي لشركتك للوصول إلى المشترين وعرض الكتالوجات واستقبال طلبات عرض الأسعار.",
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

  // Supplier Dashboard Navigation Tabs
  const [activeTab, setActiveTab] = useState<"profile" | "digital" | "media" | "preview">("profile")

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
  const [companyMedia, setCompanyMedia] = useState<any[]>([])
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
  const handleAddMediaAsset = async (mediaType: "factory_photo" | "certificate", url: string, caption: string) => {
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

  // Live missing information checklist calculator
  const missingChecklist = useMemo(() => {
    if (!company) return []
    const items = []
    if (!company.description) items.push({ key: "description", label: "Add a complete company description", tab: "profile" as const })
    if (!company.logoUrl) items.push({ key: "logoUrl", label: "Upload a company logo image", tab: "profile" as const })
    if (!company.bannerUrl) items.push({ key: "bannerUrl", label: "Upload a cover banner", tab: "profile" as const })
    if (!company.taxIdentifier) items.push({ key: "taxIdentifier", label: "Provide Tax ID (Matricule Fiscal / RNE)", tab: "profile" as const })
    if (!company.websiteUrl) items.push({ key: "websiteUrl", label: "Define website strategy & domain", tab: "digital" as const })
    if (!company.facebookUrl && !company.linkedinUrl && !company.instagramUrl) items.push({ key: "social", label: "Add social media handles (Facebook, LinkedIn, etc.)", tab: "digital" as const })
    if (companyMedia.length === 0) items.push({ key: "media", label: "Upload factory photos or quality certificates", tab: "media" as const })
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" dir={dir}>

      {/* Page title */}
      <div className="text-center sm:text-start flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {t.auth.profileTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.auth.profileSubtitle}
          </p>
        </div>

        {/* Preview Links directly in Header if Company is active */}
        {company && (
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <a
              href={`/companies/${company.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary/40 transition-all shadow-xs"
            >
              <Eye className="size-4 text-muted-foreground" />
              <span>{dict.previewPublic}</span>
            </a>
            <a
              href={`/stores/${company.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-black text-primary hover:bg-primary/15 transition-all shadow-xs"
            >
              <Store className="size-4 shrink-0" />
              <span>{dict.previewStore}</span>
            </a>
          </div>
        )}
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

          {/* Section 3: Company Dashboard/Wizard (Visible only to Suppliers) */}
          {accountType === "supplier" && (
            <div className="space-y-6">
              {company ? (
                <div className="rounded-[20px] border border-border bg-card overflow-hidden shadow-lg shadow-primary/5">
                  {/* Tab Navigation header */}
                  <div className="flex border-b border-border bg-secondary/20">
                    {[
                      { id: "profile", label: "Profile", icon: Building2 },
                      { id: "digital", label: "Digital", icon: Globe },
                        { id: "media", label: "Media", icon: ImageIcon },
                      { id: "preview", label: "Insights", icon: Sparkles }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 px-2 text-[10px] sm:text-xs font-black flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
                          activeTab === tab.id
                            ? "border-primary text-primary bg-card"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/10"
                        }`}
                      >
                        <tab.icon className="size-3.5 shrink-0" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-6 sm:p-8 space-y-6">
                    {companySuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle className="size-4 shrink-0" />
                        <span>{companySuccess}</span>
                      </div>
                    )}

                    {companyError && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-xl">
                        {companyError}
                      </div>
                    )}

                    {/* TAB 1: Profile basic editing */}
                    {activeTab === "profile" && (
                      <form onSubmit={handleUpdateCompanyProfile} className="space-y-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Company Name *</label>
                          <input
                            type="text"
                            value={companyForm.name}
                            onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                            className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">{dict.tagline}</label>
                          <input
                            type="text"
                            value={companyForm.tagline}
                            onChange={(e) => setCompanyForm({...companyForm, tagline: e.target.value})}
                            className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">{dict.description}</label>
                          <textarea
                            value={companyForm.description}
                            onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}
                            rows={4}
                            className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">{dict.logoUrl}</label>
                            <input
                              type="text"
                              value={companyForm.logoUrl}
                              onChange={(e) => setCompanyForm({...companyForm, logoUrl: e.target.value})}
                              className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">{dict.bannerUrl}</label>
                            <input
                              type="text"
                              value={companyForm.bannerUrl}
                              onChange={(e) => setCompanyForm({...companyForm, bannerUrl: e.target.value})}
                              className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">{dict.businessType}</label>
                            <select
                              value={companyForm.businessType}
                              onChange={(e) => setCompanyForm({...companyForm, businessType: e.target.value})}
                              className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all capitalize"
                            >
                              <option value="">Select type</option>
                              {BUSINESS_TYPES.map(x => (
                                <option key={x} value={x}>{x.replace("_", " ")}</option>
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
                              <option value="">Select industry</option>
                              {INDUSTRIES.map(x => (
                                <option key={x} value={x}>{x}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">{dict.yearEstablished}</label>
                            <input
                              type="number"
                              value={companyForm.yearEstablished}
                              onChange={(e) => setCompanyForm({...companyForm, yearEstablished: e.target.value})}
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
                              <option value="">Select size</option>
                              <option value="1-10">1-10</option>
                              <option value="11-50">11-50</option>
                              <option value="51-200">51-200</option>
                              <option value="201-500">201-500</option>
                              <option value="500+">500+</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">{dict.taxIdentifier}</label>
                            <input
                              type="text"
                              value={companyForm.taxIdentifier}
                              onChange={(e) => setCompanyForm({...companyForm, taxIdentifier: e.target.value})}
                              className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={updating}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-xs font-black text-white hover:opacity-90 transition-all cursor-pointer shadow-md disabled:opacity-50"
                          >
                            {updating && <Loader2 className="size-4 animate-spin" />}
                            <span>Save Profile</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* TAB 2: Digital Strategy & Social presence */}
                    {activeTab === "digital" && (
                      <form onSubmit={handleUpdateCompanyProfile} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">{dict.websiteUrl}</label>
                            <input
                              type="text"
                              value={companyForm.websiteUrl}
                              onChange={(e) => setCompanyForm({...companyForm, websiteUrl: e.target.value})}
                              placeholder="e.g. www.mycompany.com"
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
                              <option value="alsouk">ALSOUK Generated Store only</option>
                              <option value="external">External Custom Website only</option>
                              <option value="both">Both strategies</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border">
                          <h4 className="text-xs font-black text-foreground uppercase tracking-wider">{dict.socialLinks}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">Facebook Page URL</label>
                              <input
                                type="text"
                                value={companyForm.facebookUrl}
                                onChange={(e) => setCompanyForm({...companyForm, facebookUrl: e.target.value})}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">Instagram Account URL</label>
                              <input
                                type="text"
                                value={companyForm.instagramUrl}
                                onChange={(e) => setCompanyForm({...companyForm, instagramUrl: e.target.value})}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">TikTok Handle URL</label>
                              <input
                                type="text"
                                value={companyForm.tiktokUrl}
                                onChange={(e) => setCompanyForm({...companyForm, tiktokUrl: e.target.value})}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">LinkedIn Company URL</label>
                              <input
                                type="text"
                                value={companyForm.linkedinUrl}
                                onChange={(e) => setCompanyForm({...companyForm, linkedinUrl: e.target.value})}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={updating}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-xs font-black text-white hover:opacity-90 transition-all cursor-pointer shadow-md disabled:opacity-50"
                          >
                            {updating && <Loader2 className="size-4 animate-spin" />}
                            <span>Save Digital Presence</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* TAB 3: Factory Gallery & Certificates management */}
                    {activeTab === "media" && (
                      <div className="space-y-8">

                        {/* Section A: Factory Photos Gallery */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="size-4 text-primary" />
                            <span>{dict.addGalleryPhoto}</span>
                          </h4>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              placeholder="Photo Image URL (e.g. /photos/factory1.jpg)"
                              value={photoUrl}
                              onChange={(e) => setPhotoUrl(e.target.value)}
                              className="flex-1 px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Photo Caption (e.g. Sfax Assembly Factory)"
                              value={photoCaption}
                              onChange={(e) => setPhotoCaption(e.target.value)}
                              className="sm:w-64 px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddMediaAsset("factory_photo", photoUrl, photoCaption)}
                              disabled={updating || !photoUrl.trim()}
                              className="rounded-xl bg-primary px-5 py-3 text-xs font-black text-white hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {dict.addBtn}
                            </button>
                          </div>

                          {/* Render current photos */}
                          {companyMedia.filter(x => x.media_type === "factory_photo").length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                              {companyMedia.filter(x => x.media_type === "factory_photo").map((med) => (
                                <div key={med.id} className="relative group rounded-xl overflow-hidden border border-border bg-secondary aspect-video">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={med.url} alt={med.caption || "Factory image"} className="size-full object-cover" />
                                  <button
                                    onClick={() => handleDeleteMediaAsset(med.id)}
                                    className="absolute top-2 right-2 size-7 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer"
                                    title="Delete Photo"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">{dict.noMedia}</p>
                          )}
                        </div>

                        {/* Section B: Quality Standard Certificates */}
                        <div className="space-y-4 pt-6 border-t border-border">
                          <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="size-4 text-primary" />
                            <span>{dict.addCertificate}</span>
                          </h4>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              placeholder="Certificate Document URL (e.g. /certs/iso9001.pdf)"
                              value={certUrl}
                              onChange={(e) => setCertUrl(e.target.value)}
                              className="flex-1 px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Certificate Title (e.g. ISO 9001:2015 Quality cert)"
                              value={certCaption}
                              onChange={(e) => setCertCaption(e.target.value)}
                              className="sm:w-64 px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddMediaAsset("certificate", certUrl, certCaption)}
                              disabled={updating || !certUrl.trim()}
                              className="rounded-xl bg-primary px-5 py-3 text-xs font-black text-white hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {dict.addBtn}
                            </button>
                          </div>

                          {/* Render current certificates */}
                          {companyMedia.filter(x => x.media_type === "certificate").length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              {companyMedia.filter(x => x.media_type === "certificate").map((med) => (
                                <div key={med.id} className="flex items-center justify-between p-3.5 bg-secondary/35 rounded-xl border border-border">
                                  <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                      <Award className="size-5" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-foreground">{med.caption || "Quality standard license"}</p>
                                      <a href={med.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary font-semibold hover:underline">View Document</a>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteMediaAsset(med.id)}
                                    className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all cursor-pointer"
                                    title="Delete Cert"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">{dict.noMedia}</p>
                          )}
                        </div>

                      </div>
                    )}

                    {/* TAB 4: Profile Insights, checklist & Preview links */}
                    {activeTab === "preview" && (
                      <div className="space-y-6">

                        {/* Completion score Gauge */}
                        <div className="p-5 rounded-2xl bg-secondary/25 border border-border flex flex-col sm:flex-row items-center gap-5">
                          <div className="relative size-24 flex items-center justify-center shrink-0">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                              <path className="text-border" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              <path className="text-primary transition-all duration-500" strokeDasharray={`${company.profileCompletion}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <span className="absolute text-xl font-black text-foreground">{company.profileCompletion}%</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-foreground">B2B Profile Health Score</h4>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                              Suppliers with completion ratings above 80% generate up to 4x more buyer leads and RFQ matching opportunities regionally.
                            </p>
                          </div>
                        </div>

                        {/* Verification details card */}
                        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-4">
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Shield className="size-6" />
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-black text-foreground">Verification Rating: <span className="uppercase text-emerald-600 dark:text-emerald-400">{company.verificationTier}</span></h4>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {company.verificationTier === "basic" ? (
                                "Your profile is on basic verification. To upgrade to premium verified visibility, please upload your official tax documentation or register matching catalog products."
                              ) : (
                                "Congratulations! Your profile has been verified as premium on ALSOUK. You have premium listing preference in searches."
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-foreground uppercase tracking-wider">{dict.checklistTitle}</h4>
                          {missingChecklist.length > 0 ? (
                            <div className="space-y-2">
                              {missingChecklist.map((item) => (
                                <button
                                  key={item.key}
                                  onClick={() => {
                                    setActiveTab(item.tab)
                                    setIsEditingCompany(true)
                                  }}
                                  className="w-full text-start p-3 bg-secondary/15 border border-border/60 hover:bg-secondary/40 rounded-xl text-xs font-bold text-foreground flex items-center justify-between transition-all cursor-pointer"
                                >
                                  <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                                    <AlertCircle className="size-4 text-amber-500" />
                                    <span>{item.label}</span>
                                  </span>
                                  <ChevronRight className="size-4 text-muted-foreground/50 rtl:rotate-180" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 bg-emerald-500/10 p-4 border border-emerald-500/20 rounded-xl">
                              <CheckCircle className="size-4" />
                              <span>Your company profile is 100% complete! Great job!</span>
                            </p>
                          )}
                        </div>

                      </div>
                    )}

                  </div>
                </div>
              ) : (
                /* BEAUTIFUL ONBOARDING FLOW FOR NO COMPANY */
                <div className="rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-xl shadow-primary/5 space-y-6">

                  <div className="text-center max-w-md mx-auto space-y-3">
                    <span className="inline-flex size-14 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary to-blue-600 text-white shadow-md shadow-primary/25">
                      <Building2 className="size-6 text-white" />
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground">
                      {dict.onboardingTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {dict.onboardingDesc}
                    </p>
                  </div>

                  <form onSubmit={handleOnboardingSubmit} className="space-y-5 pt-4 border-t border-border/60 max-w-lg mx-auto">
                    {onboardingStep === 1 ? (
                      <div className="space-y-4 animate-scale-up">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground">Company legal Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sfax Olive Processing S.A."
                            value={onboardingForm.name}
                            onChange={(e) => setOnboardingForm({
                              ...onboardingForm,
                              name: e.target.value,
                              slug: e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")
                            })}
                            className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground">Slug (Public profile link) *</label>
                          <input
                            type="text"
                            required
                            placeholder="sfax-olive-oil"
                            value={onboardingForm.slug}
                            onChange={(e) => setOnboardingForm({
                              ...onboardingForm,
                              slug: e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")
                            })}
                            className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground">Tagline / Core Pitch</label>
                          <input
                            type="text"
                            placeholder="e.g. Leader in premium organic olive oils export in Tunisia"
                            value={onboardingForm.tagline}
                            onChange={(e) => setOnboardingForm({ ...onboardingForm, tagline: e.target.value })}
                            className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={!onboardingForm.name.trim()}
                          onClick={() => setOnboardingStep(2)}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-black text-white hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <span>Next: Classification Details</span>
                          <ChevronRight className="size-4 rtl:rotate-180" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-scale-up">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Business Type *</label>
                            <select
                              required
                              value={onboardingForm.businessType}
                              onChange={(e) => setOnboardingForm({ ...onboardingForm, businessType: e.target.value })}
                              className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                            >
                              <option value="">Select classification</option>
                              {BUSINESS_TYPES.map(x => (
                                <option key={x} value={x}>{x.replace("_", " ")}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Primary Industry *</label>
                            <select
                              required
                              value={onboardingForm.primaryIndustry}
                              onChange={(e) => setOnboardingForm({ ...onboardingForm, primaryIndustry: e.target.value })}
                              className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                            >
                              <option value="">Select industry</option>
                              {INDUSTRIES.map(x => (
                                <option key={x} value={x}>{x}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Country *</label>
                            <select
                              value={onboardingForm.country}
                              onChange={(e) => setOnboardingForm({ ...onboardingForm, country: e.target.value, city: "" })}
                              className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                            >
                              {Object.keys(COUNTRY_TO_CITIES).map(x => (
                                <option key={x} value={x}>{dirT.countries[x as keyof typeof dirT.countries] || x}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">City *</label>
                            <select
                              value={onboardingForm.city}
                              onChange={(e) => setOnboardingForm({ ...onboardingForm, city: e.target.value })}
                              className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-secondary/20 focus:border-primary focus:bg-card focus:outline-none transition-all"
                            >
                              <option value="">Select city</option>
                              {COUNTRY_TO_CITIES[onboardingForm.country].map(city => (
                                <option key={city} value={city}>{dirT.cities[city] || city}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={updating || !onboardingForm.businessType || !onboardingForm.primaryIndustry}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-xs font-black text-white hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-primary/25"
                          >
                            {updating ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Sparkles className="size-4 text-white" />
                            )}
                            <span>{dict.launchOnboarding}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOnboardingStep(1)}
                            className="rounded-xl border border-border px-5 py-3.5 text-xs font-bold text-foreground hover:bg-secondary/40 transition-all cursor-pointer"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    )}
                  </form>

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

export default function AccountPage() {
  return (
    <MarketplaceShell>
      <AccountScreen />
    </MarketplaceShell>
  )
}
