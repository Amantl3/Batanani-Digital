import api from './api'
import type {
  DashboardKPIs,
  ComplaintsByCategory,
  LicencesBySector,
  MonthlyApplications,
} from '@/types'

export type Period = 'q1' | 'q2' | 'q3' | 'q4' | 'ytd' | 'custom'

export interface DashboardParams {
  period?: Period
  from?:   string
  to?:     string
}

export const getDashboardKPIs = (params: DashboardParams = {}) =>
  api
    .get<DashboardKPIs>('/analytics/dashboard', { params })
    .then((r) => r.data)

export const getComplaintsByCategory = (params: DashboardParams = {}) =>
  api
    .get<ComplaintsByCategory[]>('/analytics/complaints-by-category', { params })
    .then((r) => r.data)

export const getLicencesBySector = () =>
  api
    .get<LicencesBySector[]>('/analytics/licences-by-sector')
    .then((r) => r.data)

export const getMonthlyApplications = () =>
  api
    .get<MonthlyApplications[]>('/analytics/monthly-applications')
    .then((r) => r.data)
