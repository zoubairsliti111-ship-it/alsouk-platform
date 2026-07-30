"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MarketplaceShell } from "@/components/marketplace/shell"
import { useLanguage } from "@/components/language-provider"
import { directoryT } from "@/lib/directory-i18n"
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
  X
} from "lucide-react"

// Predefined Tunisian/North African countries and cities matching directory-data
const COUNTRY_TO_CITIES: Record<string, string[]> = {
  tn: ["tunis", "sfax", "monastir", "nabeul", "tozeur", "kairouan"],
  ma: ["casablanca", "marrakech"],
  dz: ["algiers", "oran"],
  eg: ["cairo", "alexandria"],
  ly: ["tripoli", "benghazi"]
}

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
    selectCity: "Select City",
    selectCountry: "Select Country",
    enterCity: "Enter your city",
    updating: "Saving...",
    passwordLengthError: "Password must be at least 8 characters long",
    passwordMismatchError: "Passwords do not match",
    requiredFieldsError: "Please fill in all required fields",
    customAvatarUrl: "Or paste a custom avatar image URL",
    avatarOptionLabel: "Choose an Avatar Icon / Emoji",
    savingChanges: "Saving..."
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
    selectCity: "Sélectionnez une ville",
    selectCountry: "Sélectionnez un pays",
    enterCity: "Entrez votre ville",
    updating: "Enregistrement...",
    passwordLengthError: "Le mot de passe doit comporter au moins 8 caractères",
    passwordMismatchError: "Les mots de passe ne correspondent pas",
    requiredFieldsError: "Veuillez remplir tous les champs obligatoires",
    customAvatarUrl: "Ou collez l'URL d'une image d'avatar personnalisée",
    avatarOptionLabel: "Choisissez un emoji / icône d'avatar",
    savingChanges: "Enregistrement..."
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
    selectCity: "اختر المدينة",
    selectCountry: "اختر البلد",
    enterCity: "أدخل مدينتك",
    updating: "جاري الحفظ...",
    passwordLengthError: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
    passwordMismatchError: "كلمات المرور غير متطابقة",
    requiredFieldsError: "يرجى ملء جميع الحقول المطلوبة",
    customAvatarUrl: "أو الصق رابط صورة مخصص",
    avatarOptionLabel: "اختر رمزاً أو رمزاً تعبيرياً للصورة الشخصية",
    savingChanges: "جاري الحفظ..."
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
  const [company, setCompany] = useState<any>(null)
  const [productsCount, setProductsCount] = useState(0)
  const [rfqsCount, setRfqsCount] = useState(0)
  const [fetchingCompanyInfo, setFetchingCompanyInfo] = useState(false)

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
      // 1. Query matching company
      const { data: companyData } = await supabase
        .from("companies")
        .select("id, name, logo_url, description, website, country, city, verified, supplier_id")
        .eq("owner_id", currentUser.id)
        .maybeSingle()

      if (companyData) {
        setCompany(companyData)
        currentCompanyId = companyData.id
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
      if (companyData?.supplier_id) {
        filterStr += `,supplier_id.eq.${companyData.supplier_id}`
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
              <h3 className="text-base font-black text-foreground mb-6 flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <span>{dict.companyInfo}</span>
              </h3>

              {fetchingCompanyInfo ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : company ? (
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    {company.logo_url ? (
                      <div className="size-16 rounded-2xl border border-border bg-white overflow-hidden shrink-0 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={company.logo_url} alt={company.name} className="size-full object-contain p-1" />
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

                      {company.website && (
                        <a
                          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <Globe className="size-3.5" />
                          <span>{company.website}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {company.description && (
                    <div className="text-xs text-muted-foreground leading-relaxed bg-secondary/20 p-4 rounded-xl border border-border/55">
                      {company.description}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span>
                        {company.city ? (dirT.cities[company.city] || company.city) : ""}, {company.country ? (dirT.countries[company.country as keyof typeof dirT.countries] || company.country) : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 px-4 bg-secondary/15 rounded-2xl border border-dashed border-border/80">
                  <Building2 className="size-10 text-muted-foreground/60 mx-auto mb-3" />
                  <h4 className="text-sm font-black text-foreground mb-1">{dict.completeCompanyCta}</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-normal mb-1">
                    {dict.completeCompanyDesc}
                  </p>
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
