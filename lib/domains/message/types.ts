/** The other side of a conversation — either a company (resolved via its
 * owner) or, failing that, a bare user profile. */
export interface MessageParticipant {
  userId: string
  name: string
  avatarUrl: string | null
  companySlug: string | null
}

export interface ConversationSummary {
  participant: MessageParticipant
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface MessageItem {
  id: string
  senderId: string
  receiverId: string
  message: string
  read: boolean
  createdAt: string
  rfqId: string | null
}
