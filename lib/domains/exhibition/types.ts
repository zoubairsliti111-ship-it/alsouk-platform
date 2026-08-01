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
