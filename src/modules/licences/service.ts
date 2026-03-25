/**
 * backend/src/modules/licences/service.ts
 */
import { supabase } from '../../config/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface LicenceFilters {
  search?: string
  type?:   string
  status?: string
  page?:   number
  limit?:  number
}

// ── getAllLicences ─────────────────────────────────────────────────────────────
export const getAllLicences = async (filters: LicenceFilters & { userId?: string } = {}) => {
  const { search, type, status, userId, page = 1, limit = 15 } = filters
  let query = supabase.from('Licence').select('*', { count: 'exact' })

  if (search)  query = query.or(`companyName.ilike.%${search}%,id.ilike.%${search}%`)
  if (type)    query = query.eq('type', type)
  if (status)  query = query.eq('status', status)
  if (userId)  query = query.eq('userId', userId)

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1).order('createdAt', { ascending: false })

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    results:    data ?? [],
    total:      count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

// ── getLicences (alias used in some places) ───────────────────────────────────
export const getLicences = getAllLicences

// ── getLicenceById ────────────────────────────────────────────────────────────
export const getLicenceById = async (id: string) => {
  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ── createLicence ─────────────────────────────────────────────────────────────
export const createLicence = async (payload: {
  type:        string
  companyName: string
  userId:      string
  documents?:  string[]
  declaration?: boolean
}) => {
  const { data, error } = await supabase
    .from('Licence')
    .insert({
      type:         payload.type,
      companyName: payload.companyName,
      userId:      payload.userId,
      documents:    payload.documents ?? [],
      status:       'pending',
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ── updateLicenceStatus ───────────────────────────────────────────────────────
export const updateLicenceStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('Licence')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ── deleteLicence ─────────────────────────────────────────────────────────────
export const deleteLicence = async (id: string) => {
  const { error } = await supabase.from('Licence').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return { deleted: true }
}

// ── getLicenceStats ───────────────────────────────────────────────────────────
export const getLicenceStats = async () => {
  const { data, error } = await supabase
    .from('Licence')
    .select('status')
  if (error) throw new Error(error.message)

  const stats = (data ?? []).reduce((acc: Record<string, number>, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1
    return acc
  }, {})

  return {
    total:     data?.length ?? 0,
    active:    stats['active']    ?? 0,
    pending:   stats['pending']   ?? 0,
    suspended: stats['suspended'] ?? 0,
    expired:   stats['expired']   ?? 0,
  }
}

// ── getLicencesByType ─────────────────────────────────────────────────────────
export const getLicencesByType = async () => {
  const { data, error } = await supabase.from('Licence').select('type')
  if (error) throw new Error(error.message)

  return (data ?? []).reduce((acc: Record<string, number>, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1
    return acc
  }, {})
}

// ── getRecentLicences ─────────────────────────────────────────────────────────
export const getRecentLicences = async (limit = 5) => {
  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── getPendingLicences ────────────────────────────────────────────────────────
export const getPendingLicences = async () => {
  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .eq('status', 'pending')
    .order('createdAt', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── getExpiringSoonLicences ───────────────────────────────────────────────────
export const getExpiringSoonLicences = async () => {
  const thirtyDays = new Date()
  thirtyDays.setDate(thirtyDays.getDate() + 30)

  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .eq('status', 'active')
    .lte('expiresAt', thirtyDays.toISOString())
    .order('expiresAt', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── getLicencesIssuedThisMonth ────────────────────────────────────────────────
export const getLicencesIssuedThisMonth = async () => {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .gte('createdAt', start.toISOString())
    .order('createdAt', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── verifyLicence ─────────────────────────────────────────────────────────────
export const verifyLicence = async (id: string) => {
  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error('Licence not found')
  return { valid: data.status === 'active', licence: data }
}

// ── getLicenceRenewals ────────────────────────────────────────────────────────
export const getLicenceRenewals = async () => {
  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .eq('status', 'renewal_pending')
    .order('createdAt', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── getLicenceHistory ─────────────────────────────────────────────────────────
export const getLicenceHistory = async (id: string) => {
  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .eq('licence_id', id)
    .order('createdAt', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── getLicencesByUser ─────────────────────────────────────────────────────────
export const getLicencesByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })
  if (error) throw new Error(error.message)
  return { userId, licences: data ?? [], summary: { total: data?.length ?? 0 } }
}

// ── getMostCommonLicenceTypes ─────────────────────────────────────────────────
export const getMostCommonLicenceTypes = async () => {
  const { data, error } = await supabase.from('Licence').select('type')
  if (error) throw new Error(error.message)

  const counts = (data ?? []).reduce((acc: Record<string, number>, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({ type, count }))
}

// ── getSuspendedLicences ──────────────────────────────────────────────────────
export const getSuspendedLicences = async () => {
  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .eq('status', 'suspended')
    .order('createdAt', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}
