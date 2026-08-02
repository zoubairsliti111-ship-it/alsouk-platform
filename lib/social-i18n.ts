import type { Lang } from "@/lib/i18n"

export type SocialDict = {
  // auth
  signIn: string
  signUp: string
  signOut: string
  email: string
  password: string
  authSignInTitle: string
  authSignUpTitle: string
  authSignInSubtitle: string
  authSignUpSubtitle: string
  noAccount: string
  haveAccount: string
  authError: string
  checkEmail: string
  working: string
  // header / account
  account: string
  myCompany: string
  // profile header
  followers: string
  following: string
  posts: string
  videos: string
  products: string
  follow: string
  unfollow: string
  message: string
  requestQuote: string
  share: string
  shareCopied: string
  goLive: string
  editProfile: string
  signInToFollow: string
  // tabs
  tabPosts: string
  tabProducts: string
  tabVideos: string
  tabLive: string
  tabAbout: string
  // posts
  gridView: string
  listView: string
  like: string
  comment: string
  pin: string
  unpin: string
  pinned: string
  edit: string
  delete: string
  save: string
  cancel: string
  createPost: string
  postPlaceholder: string
  publish: string
  addPhoto: string
  addVideo: string
  uploading: string
  confirmDelete: string
  writeComment: string
  send: string
  postsEmpty: string
  postsEmptyMember: string
  // products
  searchInStore: string
  allCategories: string
  productsEmpty: string
  moq: string
  // videos
  videosEmpty: string
  videosEmptyMember: string
  // live
  liveNow: string
  liveUpcoming: string
  livePrevious: string
  joinLive: string
  watchReplay: string
  startLive: string
  endLive: string
  scheduleLive: string
  liveTitle: string
  liveEmpty: string
  liveEmptyMember: string
  goLiveNow: string
  scheduleForLater: string
  // about
  about: string
  contactChannels: string
  website: string
  location: string
  businessHours: string
  businessHoursSoon: string
  noDescription: string
  // states
  notFoundTitle: string
  notFoundSubtitle: string
  errorTitle: string
  errorSubtitle: string
  backToCompanies: string
}

export const socialT: Record<Lang, SocialDict> = {
  en: {
    signIn: "Sign in",
    signUp: "Create account",
    signOut: "Sign out",
    email: "Email",
    password: "Password",
    authSignInTitle: "Welcome back",
    authSignUpTitle: "Join ALSOUK",
    authSignInSubtitle: "Sign in to follow companies, message suppliers and manage your store.",
    authSignUpSubtitle: "Create a free account to source, follow and do business.",
    noAccount: "New to ALSOUK?",
    haveAccount: "Already have an account?",
    authError: "Authentication failed. Check your details and try again.",
    checkEmail: "Check your email to confirm your account, then sign in.",
    working: "Please wait…",
    account: "Account",
    myCompany: "My company",
    followers: "Followers",
    following: "Following",
    posts: "Posts",
    videos: "Videos",
    products: "Products",
    follow: "Follow",
    unfollow: "Following",
    message: "Message",
    requestQuote: "Request Quote",
    share: "Share",
    shareCopied: "Link copied",
    goLive: "Go Live",
    editProfile: "Edit Profile",
    signInToFollow: "Sign in to follow",
    tabPosts: "Posts",
    tabProducts: "Products",
    tabVideos: "Videos",
    tabLive: "Live",
    tabAbout: "About",
    gridView: "Grid",
    listView: "List",
    like: "Like",
    comment: "Comment",
    pin: "Pin",
    unpin: "Unpin",
    pinned: "Pinned",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    createPost: "Create post",
    postPlaceholder: "Share a product update, offer or announcement…",
    publish: "Publish",
    addPhoto: "Photo",
    addVideo: "Video",
    uploading: "Uploading…",
    confirmDelete: "Delete this permanently?",
    writeComment: "Write a comment…",
    send: "Send",
    postsEmpty: "No posts yet.",
    postsEmptyMember: "Publish your first post to showcase products and offers.",
    searchInStore: "Search in this store",
    allCategories: "All",
    productsEmpty: "No products yet.",
    moq: "MOQ",
    videosEmpty: "No videos yet.",
    videosEmptyMember: "Upload a short commercial video to stand out.",
    liveNow: "Live now",
    liveUpcoming: "Upcoming",
    livePrevious: "Previous lives",
    joinLive: "Join live",
    watchReplay: "Watch replay",
    startLive: "Start now",
    endLive: "End live",
    scheduleLive: "Schedule",
    liveTitle: "Session title",
    liveEmpty: "No live sessions yet.",
    liveEmptyMember: "Go live or schedule a session to reach buyers in real time.",
    goLiveNow: "Go live now",
    scheduleForLater: "Schedule for later",
    about: "About",
    contactChannels: "Contact",
    website: "Website",
    location: "Location",
    businessHours: "Business hours",
    businessHoursSoon: "Business hours coming soon.",
    noDescription: "No description provided yet.",
    notFoundTitle: "Company not found",
    notFoundSubtitle: "This company profile doesn't exist or was removed.",
    errorTitle: "Something went wrong",
    errorSubtitle: "We couldn't load this profile. Please try again.",
    backToCompanies: "Back to companies",
  },
  fr: {
    signIn: "Se connecter",
    signUp: "Créer un compte",
    signOut: "Se déconnecter",
    email: "E-mail",
    password: "Mot de passe",
    authSignInTitle: "Bon retour",
    authSignUpTitle: "Rejoindre ALSOUK",
    authSignInSubtitle: "Connectez-vous pour suivre des entreprises, contacter des fournisseurs et gérer votre boutique.",
    authSignUpSubtitle: "Créez un compte gratuit pour sourcer, suivre et faire des affaires.",
    noAccount: "Nouveau sur ALSOUK ?",
    haveAccount: "Vous avez déjà un compte ?",
    authError: "Échec de l'authentification. Vérifiez vos informations et réessayez.",
    checkEmail: "Vérifiez votre e-mail pour confirmer votre compte, puis connectez-vous.",
    working: "Veuillez patienter…",
    account: "Compte",
    myCompany: "Mon entreprise",
    followers: "Abonnés",
    following: "Abonnements",
    posts: "Publications",
    videos: "Vidéos",
    products: "Produits",
    follow: "Suivre",
    unfollow: "Abonné",
    message: "Message",
    requestQuote: "Demander un devis",
    share: "Partager",
    shareCopied: "Lien copié",
    goLive: "Passer en direct",
    editProfile: "Modifier le profil",
    signInToFollow: "Connectez-vous pour suivre",
    tabPosts: "Publications",
    tabProducts: "Produits",
    tabVideos: "Vidéos",
    tabLive: "Direct",
    tabAbout: "À propos",
    gridView: "Grille",
    listView: "Liste",
    like: "J'aime",
    comment: "Commenter",
    pin: "Épingler",
    unpin: "Désépingler",
    pinned: "Épinglé",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Enregistrer",
    cancel: "Annuler",
    createPost: "Créer une publication",
    postPlaceholder: "Partagez une nouveauté produit, une offre ou une annonce…",
    publish: "Publier",
    addPhoto: "Photo",
    addVideo: "Vidéo",
    uploading: "Téléversement…",
    confirmDelete: "Supprimer définitivement ?",
    writeComment: "Écrire un commentaire…",
    send: "Envoyer",
    postsEmpty: "Aucune publication.",
    postsEmptyMember: "Publiez votre première publication pour présenter vos produits et offres.",
    searchInStore: "Rechercher dans cette boutique",
    allCategories: "Tout",
    productsEmpty: "Aucun produit.",
    moq: "Quantité min.",
    videosEmpty: "Aucune vidéo.",
    videosEmptyMember: "Téléversez une courte vidéo commerciale pour vous démarquer.",
    liveNow: "En direct",
    liveUpcoming: "À venir",
    livePrevious: "Directs précédents",
    joinLive: "Rejoindre le direct",
    watchReplay: "Voir le replay",
    startLive: "Démarrer",
    endLive: "Terminer",
    scheduleLive: "Planifier",
    liveTitle: "Titre de la session",
    liveEmpty: "Aucune session en direct.",
    liveEmptyMember: "Passez en direct ou planifiez une session pour toucher les acheteurs en temps réel.",
    goLiveNow: "Passer en direct",
    scheduleForLater: "Planifier plus tard",
    about: "À propos",
    contactChannels: "Contact",
    website: "Site web",
    location: "Localisation",
    businessHours: "Horaires",
    businessHoursSoon: "Horaires bientôt disponibles.",
    noDescription: "Aucune description pour le moment.",
    notFoundTitle: "Entreprise introuvable",
    notFoundSubtitle: "Ce profil d'entreprise n'existe pas ou a été supprimé.",
    errorTitle: "Une erreur est survenue",
    errorSubtitle: "Impossible de charger ce profil. Réessayez.",
    backToCompanies: "Retour aux entreprises",
  },
  ar: {
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    signOut: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    authSignInTitle: "مرحباً بعودتك",
    authSignUpTitle: "انضم إلى ألسوق",
    authSignInSubtitle: "سجّل الدخول لمتابعة الشركات ومراسلة المورّدين وإدارة متجرك.",
    authSignUpSubtitle: "أنشئ حساباً مجانياً للتوريد والمتابعة وإتمام الأعمال.",
    noAccount: "جديد في ألسوق؟",
    haveAccount: "لديك حساب بالفعل؟",
    authError: "فشل تسجيل الدخول. تحقق من بياناتك وحاول مجدداً.",
    checkEmail: "تحقق من بريدك لتأكيد الحساب ثم سجّل الدخول.",
    working: "يرجى الانتظار…",
    account: "الحساب",
    myCompany: "شركتي",
    followers: "المتابعون",
    following: "يتابع",
    posts: "المنشورات",
    videos: "الفيديوهات",
    products: "المنتجات",
    follow: "متابعة",
    unfollow: "متابَع",
    message: "رسالة",
    requestQuote: "طلب عرض سعر",
    share: "مشاركة",
    shareCopied: "تم نسخ الرابط",
    goLive: "بث مباشر",
    editProfile: "تعديل الملف",
    signInToFollow: "سجّل الدخول للمتابعة",
    tabPosts: "المنشورات",
    tabProducts: "المنتجات",
    tabVideos: "الفيديوهات",
    tabLive: "مباشر",
    tabAbout: "حول",
    gridView: "شبكة",
    listView: "قائمة",
    like: "إعجاب",
    comment: "تعليق",
    pin: "تثبيت",
    unpin: "إلغاء التثبيت",
    pinned: "مثبّت",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    createPost: "إنشاء منشور",
    postPlaceholder: "شارك تحديث منتج أو عرضاً أو إعلاناً…",
    publish: "نشر",
    addPhoto: "صورة",
    addVideo: "فيديو",
    uploading: "جارٍ الرفع…",
    confirmDelete: "حذف نهائي؟",
    writeComment: "اكتب تعليقاً…",
    send: "إرسال",
    postsEmpty: "لا توجد منشورات بعد.",
    postsEmptyMember: "انشر أول منشور لعرض منتجاتك وعروضك.",
    searchInStore: "ابحث في هذا المتجر",
    allCategories: "الكل",
    productsEmpty: "لا توجد منتجات بعد.",
    moq: "أدنى كمية",
    videosEmpty: "لا توجد فيديوهات بعد.",
    videosEmptyMember: "ارفع فيديو تجارياً قصيراً لتبرز.",
    liveNow: "مباشر الآن",
    liveUpcoming: "قادم",
    livePrevious: "بث سابق",
    joinLive: "انضم للبث",
    watchReplay: "شاهد الإعادة",
    startLive: "ابدأ الآن",
    endLive: "إنهاء البث",
    scheduleLive: "جدولة",
    liveTitle: "عنوان الجلسة",
    liveEmpty: "لا توجد جلسات بث بعد.",
    liveEmptyMember: "ابدأ بثاً مباشراً أو جدول جلسة للوصول إلى المشترين مباشرة.",
    goLiveNow: "ابدأ البث الآن",
    scheduleForLater: "جدولة لاحقاً",
    about: "حول",
    contactChannels: "التواصل",
    website: "الموقع الإلكتروني",
    location: "الموقع",
    businessHours: "ساعات العمل",
    businessHoursSoon: "ساعات العمل قريباً.",
    noDescription: "لا يوجد وصف بعد.",
    notFoundTitle: "الشركة غير موجودة",
    notFoundSubtitle: "ملف هذه الشركة غير موجود أو تمت إزالته.",
    errorTitle: "حدث خطأ ما",
    errorSubtitle: "تعذّر تحميل هذا الملف. حاول مجدداً.",
    backToCompanies: "العودة إلى الشركات",
  },
}
