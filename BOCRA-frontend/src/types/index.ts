// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'officer' | 'licensee' | 'public'

export interface User {
  id:                string
  email:             string
  fullName:          string
  role:              UserRole
  omangVerified:     boolean
  preferredLanguage: 'en' | 'tn'
  createdAt:         string
}

export interface LoginCredentials {
  email:     string
  password:  string
  totpCode?: string
}

export interface RegisterPayload {
  email:             string
  password:          string
  confirmPassword:   string
  fullName:          string
  omangNumber?:      string
  preferredLanguage: 'en' | 'tn'
}

// ─── Licences ─────────────────────────────────────────────────────────────────
export type LicenceCategory = 'telecom' | 'broadcast' | 'postal' | 'internet' | 'type_approval'
export type LicenceStatus   = 'active'  | 'pending'   | 'suspended' | 'expired'

export interface Licence {
  id:            string
  licenceNumber: string
  holderName:    string
  category:      LicenceCategory
  status:        LicenceStatus
  issuedAt:      string
  expiresAt:     string | null
  conditions:    Record<string, unknown>
  documentUrl:   string | null
}

export interface LicenceApplication {
  id:          string
  reference:   string
  category:    LicenceCategory
  companyName: string
  status:      'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  stage:       string
  submittedAt: string
  updatedAt:   string
}

// ─── Complaints ───────────────────────────────────────────────────────────────
export type ComplaintCategory = 'billing' | 'quality' | 'coverage' | 'data' | 'fraud' | 'other'
export type ComplaintStatus   = 'submitted' | 'in_review' | 'escalated' | 'resolved' | 'closed'

export interface Complaint {
  id:              string
  referenceNumber: string
  providerName:    string
  category:        ComplaintCategory
  status:          ComplaintStatus
  description:     string
  submittedAt:     string
  resolvedAt:      string | null
  daysOpen:        number
}

export interface ComplaintSubmission {
  providerLicenceId: string
  category:          ComplaintCategory
  description:       string
  contact: {
    name:  string
    email: string
    phone: string
  }
  attachments?: string[]
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface DashboardKPIs {
  activeLicences:         number
  activeLicencesDelta:    number
  complaintsYTD:          number
  complaintsYTDDelta:     number
  broadbandPenetration:   number
  broadbandDelta:         number
  mobileSubscribers:      number
  mobileSubscribersDelta: number
}

export interface ComplaintsByCategory { category: ComplaintCategory; count: number }
export interface LicencesBySector     { sector: LicenceCategory; count: number; pct: number }
export interface MonthlyApplications  { month: string; count: number }

// ─── Shared ───────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data:       T[]
  total:      number
  page:       number
  limit:      number
  totalPages: number
}

export interface ApiError {
  type:     string
  title:    string
  status:   number
  detail:   string
  instance: string
}

export type SystemStatus = 'operational' | 'degraded' | 'maintenance' | 'down'

export interface ServiceStatus {
  name:   string
  key:    string
  status: SystemStatus
}
