import api from './api'
import type {
  Complaint,
  ComplaintSubmission,
  PaginatedResponse,
} from '@/types'

export const submitComplaint = (payload: ComplaintSubmission) =>
  api
    .post<{ referenceNumber: string }>('/complaints', payload)
    .then((r) => r.data)

export const trackComplaint = (ref: string) =>
  api.get<Complaint>(`/complaints/track/${ref}`).then((r) => r.data)

export const getMyComplaints = () =>
  api
    .get<PaginatedResponse<Complaint>>('/complaints')
    .then((r) => r.data)

export const uploadAttachment = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post<{ key: string; url: string }>('/complaints/attachments', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}