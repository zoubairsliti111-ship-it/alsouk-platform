import { type Notification, type NotificationType, type NotificationFilter } from "@/lib/domains/notification/types"

export type DBNotificationRow = {
  id: string
  recipient_id: string
  actor_company_id: string | null
  type: string
  entity_type: string | null
  entity_id: string | null
  title: string
  body: string
  image_url: string | null
  action_url: string | null
  is_read: boolean
  created_at: string
  metadata: any
}

/**
 * Maps a database row from the `notifications` table to a strictly typed `Notification` domain object.
 */
export function mapNotificationRow(row: DBNotificationRow): Notification {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    actorCompanyId: row.actor_company_id,
    type: row.type as NotificationType,
    entityType: row.entity_type,
    entityId: row.entity_id,
    title: row.title,
    body: row.body,
    imageUrl: row.image_url,
    actionUrl: row.action_url,
    isRead: row.is_read,
    createdAt: row.created_at,
    metadata: row.metadata || {}
  }
}

/**
 * Fetches notifications for a given recipient with cursor pagination and optional filters.
 */
export async function fetchNotifications(
  supabase: any,
  recipientId: string,
  filter: NotificationFilter = {}
): Promise<{ data: Notification[]; nextCursor: string | null }> {
  const limit = filter.limit ? Math.min(filter.limit, 100) : 20

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (filter.unreadOnly) {
    query = query.eq("is_read", false)
  }

  if (filter.type) {
    query = query.eq("type", filter.type)
  }

  if (filter.cursor) {
    // For desc order cursor pagination, get items created before the cursor timestamp
    query = query.lt("created_at", filter.cursor)
  }

  const { data, error } = await query

  if (error) {
    console.error("[notifications-service] Error fetching notifications:", error)
    throw new Error(error.message)
  }

  const notifications = (data as DBNotificationRow[] || []).map(mapNotificationRow)
  const nextCursor =
    notifications.length === limit ? notifications[notifications.length - 1].createdAt : null

  return {
    data: notifications,
    nextCursor
  }
}

/**
 * Gets the total count of unread notifications for a user.
 */
export async function fetchUnreadCount(supabase: any, recipientId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", recipientId)
    .eq("is_read", false)

  if (error) {
    console.error("[notifications-service] Error fetching unread count:", error)
    throw new Error(error.message)
  }

  return count || 0
}

/**
 * Marks a single notification as read or unread.
 */
export async function markNotificationRead(
  supabase: any,
  recipientId: string,
  notificationId: string,
  isRead: boolean = true
): Promise<Notification> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: isRead })
    .eq("id", notificationId)
    .eq("recipient_id", recipientId)
    .select()
    .single()

  if (error) {
    console.error("[notifications-service] Error marking notification read:", error)
    throw new Error(error.message)
  }

  return mapNotificationRow(data as DBNotificationRow)
}

/**
 * Marks all notifications as read for a recipient.
 */
export async function markAllNotificationsRead(supabase: any, recipientId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", recipientId)
    .eq("is_read", false)

  if (error) {
    console.error("[notifications-service] Error marking all notifications read:", error)
    throw new Error(error.message)
  }
}

/**
 * Deletes a single notification.
 */
export async function deleteNotification(
  supabase: any,
  recipientId: string,
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("recipient_id", recipientId)

  if (error) {
    console.error("[notifications-service] Error deleting notification:", error)
    throw new Error(error.message)
  }
}

/**
 * Deletes all notifications for a recipient.
 */
export async function deleteAllNotifications(supabase: any, recipientId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("recipient_id", recipientId)

  if (error) {
    console.error("[notifications-service] Error bulk deleting notifications:", error)
    throw new Error(error.message)
  }
}

/**
 * Sends a notification. Common low-level helper.
 */
export async function createNotification(
  supabase: any,
  payload: {
    recipientId: string
    type: NotificationType
    title: string
    body: string
    actorCompanyId?: string | null
    entityType?: string | null
    entityId?: string | null
    imageUrl?: string | null
    actionUrl?: string | null
    metadata?: Record<string, any>
  }
): Promise<Notification> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      recipient_id: payload.recipientId,
      actor_company_id: payload.actorCompanyId || null,
      type: payload.type,
      entity_type: payload.entityType || null,
      entity_id: payload.entityId || null,
      title: payload.title,
      body: payload.body,
      image_url: payload.imageUrl || null,
      action_url: payload.actionUrl || null,
      metadata: payload.metadata || {}
    })
    .select()
    .single()

  if (error) {
    console.error("[notifications-service] Error inserting notification:", error)
    throw new Error(error.message)
  }

  return mapNotificationRow(data as DBNotificationRow)
}

/**
 * Helper to trigger a Follower notification.
 */
export async function notifyFollower(
  supabase: any,
  recipientId: string,
  actorCompanyId: string,
  followerName: string
): Promise<Notification> {
  return createNotification(supabase, {
    recipientId,
    type: "follower",
    actorCompanyId,
    entityType: "company",
    entityId: actorCompanyId,
    title: "New Follower 👤",
    body: `${followerName} started following your company on ALSOUK.`,
    actionUrl: `/companies/${actorCompanyId}`,
    metadata: { followerName }
  })
}

/**
 * Helper to trigger a Comment notification.
 */
export async function notifyComment(
  supabase: any,
  recipientId: string,
  actorCompanyId: string,
  postTitle: string,
  commentSnippet: string,
  postUrl: string,
  entityId: string
): Promise<Notification> {
  return createNotification(supabase, {
    recipientId,
    type: "comment",
    actorCompanyId,
    entityType: "post",
    entityId,
    title: "New Comment 💬",
    body: `A user commented on "${postTitle}": "${commentSnippet.slice(0, 50)}..."`,
    actionUrl: postUrl,
    metadata: { postTitle, commentSnippet }
  })
}

/**
 * Helper to trigger a Like notification.
 */
export async function notifyLike(
  supabase: any,
  recipientId: string,
  actorCompanyId: string,
  entityTitle: string,
  entityUrl: string,
  entityType: string,
  entityId: string
): Promise<Notification> {
  return createNotification(supabase, {
    recipientId,
    type: "like",
    actorCompanyId,
    entityType,
    entityId,
    title: "New Like ❤️",
    body: `Your post "${entityTitle}" received a new like.`,
    actionUrl: entityUrl,
    metadata: { entityTitle }
  })
}

/**
 * Helper to trigger an RFQ notification.
 */
export async function notifyRFQ(
  supabase: any,
  recipientId: string,
  companyName: string,
  productRequested: string,
  rfqId: string
): Promise<Notification> {
  return createNotification(supabase, {
    recipientId,
    type: "rfq_received",
    entityType: "rfq",
    entityId: rfqId,
    title: "New RFQ Received 📦",
    body: `You received a new RFQ from ${companyName} for "${productRequested}".`,
    actionUrl: `/account?tab=rfqs&rfqId=${rfqId}`,
    metadata: { companyName, productRequested, rfqId }
  })
}

/**
 * Helper to trigger a Message notification.
 */
export async function notifyMessage(
  supabase: any,
  recipientId: string,
  senderName: string,
  messageSnippet: string,
  chatUrl: string,
  messageId: string
): Promise<Notification> {
  return createNotification(supabase, {
    recipientId,
    type: "message",
    entityType: "message",
    entityId: messageId,
    title: "New Message ✉️",
    body: `${senderName}: "${messageSnippet.slice(0, 60)}..."`,
    actionUrl: chatUrl,
    metadata: { senderName, messageSnippet }
  })
}

/**
 * Helper to trigger a Live Stream notification.
 */
export async function notifyLiveStarted(
  supabase: any,
  recipientId: string,
  companyName: string,
  streamTitle: string,
  streamUrl: string,
  streamId: string
): Promise<Notification> {
  return createNotification(supabase, {
    recipientId,
    type: "live_started",
    entityType: "stream",
    entityId: streamId,
    title: "🔴 Live Stream Started",
    body: `${companyName} is live now: "${streamTitle}"`,
    actionUrl: streamUrl,
    metadata: { companyName, streamTitle }
  })
}
