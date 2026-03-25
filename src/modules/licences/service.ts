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
  let query = supabase.from('licences').select('*', { count: 'exact' })

  if (search)  query = query.or(`company_name.ilike.%${search}%,id.ilike.%${search}%`)
  if (type)    query = query.eq('type', type)
  if (status)  query = query.eq('status', status)
  if (userId)  query = query.eq('user_id', userId)

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1).order('created_at', { ascending: false })

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
    .from('licences')
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
    .from('licences')
    .insert({
      type:         payload.type,
      company_name: payload.companyName,
      user_id:      payload.userId,
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
    .from('licences')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ── deleteLicence ─────────────────────────────────────────────────────────────
export const deleteLicence = async (id: string) => {
  const { error } = await supabase.from('licences').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return { deleted: true }
}

// ── getLicenceStats ───────────────────────────────────────────────────────────
export const getLicenceStats = async () => {
  const { data, error } = await supabase
    .from('licences')
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
  const { data, error } = await supabase.from('licences').select('type')
  if (error) throw new Error(error.message)

  return (data ?? []).reduce((acc: Record<string, number>, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1
    return acc
  }, {})
}

// ── getRecentLicences ─────────────────────────────────────────────────────────
export const getRecentLicences = async (limit = 5) => {
  const { data, error } = await supabase
    .from('licences')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── getPendingLicences ────────────────────────────────────────────────────────
export const getPendingLicences = async () => {
  const { data, error } = await supabase
    .from('licences')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── getExpiringSoonLicences ───────────────────────────────────────────────────
export const getExpiringSoonLicences = async () => {
  const thirtyDays = new Date()
  thirtyDays.setDate(thirtyDays.getDate() + 30)

  const { data, error } = await supabase
    .from('licences')
    .select('*')
    .eq('status', 'active')
    .lte('expires_at', thirtyDays.toISOString())
    .order('expires_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── getLicencesIssuedThisMonth ────────────────────────────────────────────────
export const getLicencesIssuedThisMonth = async () => {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('licences')
    .select('*')
    .gte('created_at', start.toISOString())
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── verifyLicence ─────────────────────────────────────────────────────────────
export const verifyLicence = async (id: string) => {
  const { data, error } = await supabase
    .from('licences')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error('Licence not found')
  return { valid: data.status === 'active', licence: data }
}

// ── getLicenceRenewals ────────────────────────────────────────────────────────
export const getLicenceRenewals = async () => {
  const { data, error } = await supabase
    .from('licences')
    .select('*')
    .eq('status', 'renewal_pending')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── getLicenceHistory ─────────────────────────────────────────────────────────
export const getLicenceHistory = async (id: string) => {
  const { data, error } = await supabase
    .from('licence_history')
    .select('*')
    .eq('licence_id', id)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── getLicencesByUser ─────────────────────────────────────────────────────────
export const getLicencesByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('licences')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return { userId, licences: data ?? [], summary: { total: data?.length ?? 0 } }
}

// ── getMostCommonLicenceTypes ─────────────────────────────────────────────────
export const getMostCommonLicenceTypes = async () => {
  const { data, error } = await supabase.from('licences').select('type')
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
    .from('licences')
    .select('*')
    .eq('status', 'suspended')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}
