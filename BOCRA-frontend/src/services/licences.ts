import api from './api'
import type {
  Licence,
  LicenceApplication,
  PaginatedResponse,
} from '@/types'

export interface LicenceFilters {
  q?:        string
  category?: string
  status?:   string
  page?:     number
  limit?:    number
}

export interface ApplyPayload {
  category:    string
  companyName: string
  documents:   string[]
  declaration: boolean
}

// ── Public ────────────────────────────────────────────────────────────────────
export const getLicences = (filters: LicenceFilters = {}) =>
  api
    .get<PaginatedResponse<Licence>>('/licences', { params: filters })
    .then((r) => r.data)

export const getLicenceById = (id: string) =>
  api.get<Licence>(`/licences/${id}`).then((r) => r.data)

// ── Authenticated ─────────────────────────────────────────────────────────────
export const applyForLicence = (payload: ApplyPayload) =>
  api.post<LicenceApplication>('/licences/apply', payload).then((r) => r.data)

export const getMyApplications = () =>
  api.get<LicenceApplication[]>('/licences/my-applications').then((r) => r.data)

export const renewLicence = (id: string, documents: string[]) =>
  api
    .post<LicenceApplication>(`/licences/${id}/renew`, { documents })
    .then((r) => r.data)

export const downloadCertificate = (id: string) =>
  api
    .get<Blob>(`/licences/${id}/certificate`, { responseType: 'blob' })
    .then((r) => r.data)
