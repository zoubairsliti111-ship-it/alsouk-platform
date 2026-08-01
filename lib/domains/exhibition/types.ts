import type { Company } from "@/lib/domains/company/types"

export interface Exhibition {
  id: string
  name: string
  slug: string
  organizer: string
  description: string | null
  coverUrl: string | null
  country: string
  city: string
  startDate: string
  endDate: string
  categories: string[]
  createdAt?: string
  updatedAt?: string
  logoUrl?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  website?: string | null
}

export interface ExhibitionBooth {
  id: string
  exhibitionId: string
  companyId: string
  bannerUrl: string | null
  logoUrl?: string | null
  description: string
  isArchived: boolean
  createdAt?: string
  updatedAt?: string

  // Virtual Booth Details
  boothNumber?: string
  category?: string
  isFeatured?: boolean
  status?: "Draft" | "Submitted" | "Published" | "Archived"
  title?: string | null
  shortDescription?: string | null
  contactPerson?: string | null
  contactPhone?: string | null
  contactWhatsapp?: string | null
  contactEmail?: string | null
  contactWebsite?: string | null

  // Joined relations
  company?: Company | null
  exhibits?: ExhibitionExhibit[]
  media?: ExhibitionMedia[]
  documents?: ExhibitionDocument[]
}

export interface ExhibitionExhibit {
  id: string
  boothId: string
  name: string
  shortDescription?: string | null
  description: string | null
  images: string[]
  videos: string[]
  pdfUrl: string | null
  brochureUrl: string | null
  isFeatured: boolean
  sortOrder: number
  createdAt?: string
  updatedAt?: string
  category?: string | null
  status?: "Draft" | "Submitted" | "Published" | "Archived"
}

export interface ExhibitionMedia {
  id: string
  boothId: string
  mediaType: "image" | "video"
  url: string
  caption: string | null
  sortOrder: number
  createdAt?: string
  thumbnailUrl?: string | null
  isCover?: boolean
}

export interface ExhibitionDocument {
  id: string
  boothId: string
  name: string
  url: string
  fileSize: string | null
  sortOrder: number
  createdAt?: string
  language?: string | null
  description?: string | null
}

export type ExhibitionApplicationStatus = "Pending" | "Approved" | "Rejected"

export interface ExhibitionApplication {
  id: string
  exhibitionId: string
  companyId: string | null
  companyName: string
  contactPerson: string
  email: string
  phone: string
  country: string
  businessCategory: string
  shortDescription: string
  message: string | null
  status: ExhibitionApplicationStatus
  reviewNotes: string | null
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  createdAt?: string
  updatedAt?: string

  // Optional joined models
  exhibition?: Exhibition | null
}

// ===========================================================================
// Visitor Experience & B2B Networking Types (TASK 009)
// ===========================================================================

export interface ExhibitionFavorite {
  id: string
  visitorId: string
  targetType: "booth" | "exhibit"
  targetId: string // booth_id or exhibit_id
  createdAt: string
  // Virtual Joined Objects
  booth?: ExhibitionBooth | null
  exhibit?: ExhibitionExhibit | null
}

export interface ExhibitionRecentlyViewed {
  id: string
  visitorId: string
  targetType: "booth" | "exhibit"
  targetId: string // booth_id or exhibit_id
  viewedAt: string
  // Virtual Joined Objects
  booth?: ExhibitionBooth | null
  exhibit?: ExhibitionExhibit | null
}

export type ExhibitionMeetingStatus = "Pending" | "Accepted" | "Rejected" | "Completed" | "Cancelled"

export interface ExhibitionMeeting {
  id: string
  visitorId: string
  boothId: string
  companyId: string
  preferredDate: string
  preferredTime: string
  purpose: string
  expectedVolume: string
  preferredLanguage: string
  notes: string | null
  status: ExhibitionMeetingStatus
  createdAt: string
  updatedAt: string
  // Virtual Relations
  booth?: ExhibitionBooth | null
}

export interface ExhibitionVisitorNote {
  id: string
  visitorId: string
  boothId: string
  noteText: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ===========================================================================
// Exhibition Analytics Types (TASK 010)
// ===========================================================================

export interface OrganizerAnalytics {
  totalExhibitions: number
  totalBooths: number
  activeBooths: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  totalVisitors: number
  uniqueVisitors: number
  totalMeetings: number
  completedMeetings: number
  totalRfqs: number
  totalCatalogDownloads: number
  qrScans: number
  averageSessionDuration: number // in seconds
  topPerformingBooths: {
    id: string
    companyName: string
    boothNumber: string
    views: number
    contacts: number
    rating: number
  }[]
  topCategories: {
    name: string
    count: number
    percentage: number
  }[]
  visitorCountries: {
    code: string
    name: string
    count: number
    percentage: number
  }[]
  trafficTrends: {
    label: string
    visitors: number
    uniqueVisitors: number
  }[]
  dailyTraffic: { date: string; visitors: number; uniqueVisitors: number }[]
  weeklyTraffic: { week: string; visitors: number; uniqueVisitors: number }[]
  monthlyTraffic: { month: string; visitors: number; uniqueVisitors: number }[]
}

export interface ExhibitorAnalytics {
  boothViews: number
  uniqueVisitors: number
  exhibitViews: number
  catalogDownloads: number
  galleryViews: number
  videoViews: number
  qrScans: number
  rfqsReceived: number
  meetingRequests: number
  acceptedMeetings: number
  rejectedMeetings: number
  completedMeetings: number
  whatsAppClicks: number
  emailClicks: number
  websiteClicks: number
  conversionRate: number
  trafficTrends: {
    label: string
    views: number
    unique: number
  }[]
  exhibitsPerformance: {
    id: string
    name: string
    views: number
    downloads: number
  }[]
  meetingTrends: {
    label: string
    requested: number
    completed: number
  }[]
}

export interface TrafficReport {
  totalViews: number
  uniqueViews: number
  byDay: { date: string; views: number; unique: number }[]
  byDevice: { device: string; percentage: number }[]
}

export interface MeetingReport {
  totalRequested: number
  totalAccepted: number
  totalCompleted: number
  byDay: { date: string; count: number }[]
}

export interface DownloadReport {
  totalDownloads: number
  byDocument: { id: string; name: string; count: number }[]
}

export interface QRReport {
  totalScans: number
  byBooth: { id: string; boothNumber: string; companyName: string; count: number }[]
}
