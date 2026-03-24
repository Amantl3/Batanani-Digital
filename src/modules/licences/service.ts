/**
 * src/services/licences.ts
 */
import api from './api'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LicenceFilters {
  q?:        string
  category?: string
  status?:   string
  page?:     number
  limit?:    number
}

// Matches what LicenceApplicationPage sends on submit
export interface ApplyPayload {
  category:    string   // licence category e.g. "telecom"
  companyName: string
  documents?:  string[] // file names
  declaration?: boolean
  // userId is injected here from sessionStorage so the page doesn't have to
  userId?:     string
}

export interface Licence {
  id:            string
  licenceNumber: string
  holderName:    string
  category:      string
  status:        string
  issuedAt:      string
  expiresAt:     string | null
  conditions:    Record<string, unknown>
  documentUrl:   string | null
  reference?:    string  // returned after apply: "APP-2025-XXXXX"
}

export interface LicenceListResponse {
  data:       Licence[]
  total:      number
  page:       number
  limit:      number
  totalPages: number
}

// ── Public: list with filters & pagination ────────────────────────────────────
export const getLicences = async (
  filters: LicenceFilters = {}
): Promise<LicenceListResponse> => {
  const params = new URLSearchParams()
  if (filters.q)        params.set('q',        filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.status)   params.set('status',   filters.status)
  if (filters.page)     params.set('page',     String(filters.page))
  if (filters.limit)    params.set('limit',    String(filters.limit))

  const { data } = await api.get<LicenceListResponse>(
    `/licences?${params.toString()}`
  )
  return data
}

// ── Public: single licence by ID ──────────────────────────────────────────────
export const getLicenceById = async (id: string): Promise<Licence> => {
  const { data } = await api.get<{ success: boolean; data: Licence }>(
    `/licences/${id}`
  )
  return data.data
}

// ── Protected: submit a new licence application ───────────────────────────────
export const applyForLicence = async (payload: ApplyPayload): Promise<Licence> => {
  // Pull userId from sessionStorage so pages don't have to pass it manually
  const raw    = sessionStorage.getItem('user')
  const userId = raw ? (JSON.parse(raw) as { id: string }).id : 'guest'

  const { data } = await api.post<{ success: boolean; data: Licence }>(
    `/licences`,
    {
      type:        payload.category,   // backend expects "type"
      companyName: payload.companyName,
      userId:      payload.userId ?? userId,
      documents:   payload.documents ?? [],
      declaration: payload.declaration ?? true,
    }
  )
  return data.data
}

// ── Protected: get licences belonging to the logged-in user ──────────────────
export const getMyApplications = async (): Promise<LicenceListResponse> => {
  const raw    = sessionStorage.getItem('user')
  const userId = raw ? (JSON.parse(raw) as { id: string }).id : null

  if (!userId) return { data: [], total: 0, page: 1, limit: 15, totalPages: 0 }

  const { data } = await api.get<{
    userId:   string
    summary:  unknown
    licences: Licence[]
  }>(`/licences/user/${userId}`)

  // Always return a safe array even if backend sends unexpected shape
  const licences = Array.isArray(data.licences) ? data.licences : []

  return {
    data:       licences,
    total:      licences.length,
    page:       1,
    limit:      licences.length,
    totalPages: 1,
  }
}
   
