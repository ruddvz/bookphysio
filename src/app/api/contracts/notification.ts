export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_reminder_1h'
  | 'appointment_reminder_24h'
  | 'payment_received'
  | 'review_received'

export interface Notification {
  id: string
  type: NotificationType | string
  title: string
  body: string
  read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}
