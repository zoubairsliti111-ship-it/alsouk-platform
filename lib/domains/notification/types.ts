export type NotificationType =
  | "follower"
  | "message"
  | "rfq_received"
  | "rfq_reply"
  | "comment"
  | "like"
  | "mention"
  | "live_started"
  | "product_published"
  | "order_status"
  | "announcement"

export interface Notification {
  id: string
  recipientId: string
  actorCompanyId: string | null
  type: NotificationType
  entityType: string | null
  entityId: string | null
  title: string
  body: string
  imageUrl: string | null
  actionUrl: string | null
  isRead: boolean
  createdAt: string
  metadata: Record<string, any>
}

export interface NotificationFilter {
  unreadOnly?: boolean
  type?: NotificationType
  limit?: number
  cursor?: string // ISO timestamp of the last item for cursor pagination
}
