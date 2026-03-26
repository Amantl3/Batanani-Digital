import api from './api'

export type NotificationKind = 'application_update' | 'complaint_update' | 'fee_due' | 'compliance_due' | 'info'

export interface Notification {
  id:        string
  kind:      NotificationKind
  title:     string
  body:      string
  read:      boolean
  urgent:    boolean
  link?:     string
  createdAt: string
}

// GET /api/v1/notifications — fetched by portal on every load + polled every 30s
export const getNotifications = () =>
  api.get<Notification[]>('/notifications').then(r => r.data)

export const markRead = (id: string) =>
  api.patch<void>(`/notifications/${id}/read`).then(r => r.data)

export const markAllRead = () =>
  api.patch<void>('/notifications/read-all').then(r => r.data)