/**
 * src/modules/complaints/service.ts
 */
import { supabase } from '../../config/supabase'

export interface ComplaintFilters {
  status?: string
  category?: string
  provider?: string
  userId?: string
  page?: number
  limit?: number
  search?: string // Added this to fix the 'search' error
}

export const getAllComplaints = async (filters: ComplaintFilters = {}) => {
  const { status, category, provider, userId, page = 1, limit = 15, search } = filters
  let query = supabase.from('Complaint').select('*', { count: 'exact' })

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)
  if (provider) query = query.eq('provider', provider)
  if (userId) query = query.eq('userId', userId)
  if (search) query = query.ilike('description', `%${search}%`)

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1).order('createdAt', { ascending: false })

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    results: data ?? [],
    total: count ?? 0,
  }
}

export const createComplaint = async (payload: any) => {
  const { data, error } = await supabase
    .from('Complaint')
    .insert([{ ...payload, status: 'pending' }])
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export const updateComplaintStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('Complaint')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export const getComplaintStats = async () => {
  const { data, error } = await supabase.from('Complaint').select('status, category')
  if (error) throw new Error(error.message)

  const stats = (data ?? []).reduce((acc: any, curr: any) => {
    acc[curr.status] = (acc[curr.status] ?? 0) + 1
    return acc
  }, {})

  return {
    total: data?.length ?? 0,
    pending: stats['pending'] ?? 0,
    resolved: stats['resolved'] ?? 0,
  }
}