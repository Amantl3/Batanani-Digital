/**
 * src/modules/licences/service.ts
 */
import { supabase } from '../../config/supabase'

export interface LicenceFilters {
  search?: string
  type?:   string
  status?: string
  page?:   number
  limit?:  number
  userId?: string
}

export const getAllLicences = async (filters: LicenceFilters = {}) => {
  const { search, type, status, userId, page = 1, limit = 15 } = filters
  let query = supabase.from('Licence').select('*', { count: 'exact' })

  // FIX: Fixed the search query formatting for Supabase
  if (search) {
    query = query.or(`companyName.ilike.%${search}%,id.ilike.%${search}%`)
  }
  if (type)   query = query.eq('type', type)
  if (status) query = query.eq('status', status)
  if (userId) query = query.eq('userId', userId)

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

export const getLicence = async (id: string) => {
  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export const createLicence = async (payload: {
  type:        string
  companyName: string
  userId:      string
  region?:     string
}) => {
  const { data, error } = await supabase
    .from('Licence')
    .insert({
      type:        payload.type,
      companyName: payload.companyName,
      userId:      payload.userId,
      region:      payload.region || 'Gaborone', // FIX: Added default region for map
      status:      'pending',
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

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

export const deleteLicence = async (id: string) => {
  const { error } = await supabase.from('Licence').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return { deleted: true }
}

export const getLicenceStats = async () => {
  const { data, error } = await supabase.from('Licence').select('status')
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

export const getRecentLicences = async (limit = 5) => {
  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return data ?? []
}

export const getPendingLicences = async () => {
  const { data, error } = await supabase
    .from('Licence')
    .select('*')
    .eq('status', 'pending')
    .order('createdAt', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

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
