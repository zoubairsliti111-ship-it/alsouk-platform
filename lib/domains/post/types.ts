import { type Company } from "@/lib/domains/company/types"

export type CommercialPostStatus = "draft" | "published"

export interface CommercialPost {
  id: string
  companyId: string
  authorId: string | null
  status: CommercialPostStatus
  visibility: string
  content: string
  images: string[]
  attachments: Record<string, any>[]
  viewCount: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  company?: Partial<Company>
}
