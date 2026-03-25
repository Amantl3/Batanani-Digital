/**
 * Admin service — all endpoints require admin/officer JWT role.
 * Backend integration: these call /api/v1/admin/* on Railway.
 */
import api from './api'
import type { LicenceApplication, Complaint } from '@/types'
import type { LicenceFilters } from './licences'

export interface AdminApplicationFilters {
  q?:       string
  status?:  string
  type?:    string
  page?:    number
  limit?:   number
}

export interface AdminComplaintFilters {
  q?:        string
  status?:   string
  provider?: string
  page?:     number
  limit?:    number
}

export interface OfficerDecision {
  status:      'approved' | 'rejected' | 'pending_docs' | 'under_review'
  officerNote: string
}

export interface ComplaintUpdate {
  status:      string
  officerNote: string
}

// ── Applications ───────────────────────────────────────────────────────────────
export const getAllApplications = (filters: AdminApplicationFilters = {}) =>
  api.get<{ data: LicenceApplication[]; total: number; totalPages: number }>(
    '/admin/applications', { params: filters }
  ).then(r => r.data)

export const updateApplication = (ref: string, decision: OfficerDecision) =>
  api.patch<LicenceApplication>(`/admin/applications/${ref}`, decision).then(r => r.data)

// ── Complaints ─────────────────────────────────────────────────────────────────
export const getAllComplaints = (filters: AdminComplaintFilters = {}) =>
  api.get<{ data: Complaint[]; total: number }>('/admin/complaints', { params: filters }).then(r => r.data)

export const updateComplaint = (ref: string, update: ComplaintUpdate) =>
  api.patch<Complaint>(`/admin/complaints/${ref}`, update).then(r => r.data)

// ── Export ─────────────────────────────────────────────────────────────────────
export const exportApplications = (format: 'csv' | 'pdf', filters: AdminApplicationFilters = {}) =>
  api.get<Blob>(`/admin/applications/export`, {
    params: { format, ...filters },
    responseType: 'blob',
  }).then(r => r.data)

export const exportComplaints = (format: 'csv' | 'pdf') =>
  api.get<Blob>('/admin/complaints/export', {
    params: { format },
    responseType: 'blob',
  }).then(r => r.data)

export const exportLicences = (format: 'csv' | 'pdf', filters: LicenceFilters = {}) =>
  api.get<Blob>('/admin/licences/export', {
    params: { format, ...filters },
    responseType: 'blob',
  }).then(r => r.data)