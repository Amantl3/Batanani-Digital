import api from './api'

export const getAllApplications = async (params: any = {}) => {
  const { data } = await api.get('/admin/licences', { params })
  return data
}

export const getApplication = async (id: string) => {
  const { data } = await api.get(`/admin/licences/${id}`)
  return data
}

// Fixed the name here to match the UI call
export const updateApplicationStatus = async (id: string, status: string) => {
  const { data } = await api.patch(`/admin/licences/${id}/status`, { status })
  return data
}

export const getAllComplaints = async (params: any = {}) => {
  const { data } = await api.get('/admin/complaints', { params })
  return data
}

export const updateComplaint = async (id: string, update: any) => {
  const { data } = await api.patch(`/admin/complaints/${id}/status`, update)
  return data
}

export const getAllDocuments = async () => {
  const { data } = await api.get('/documents')
  return data
}

export const getAllUsers = async () => {
  const { data } = await api.get('/admin/users')
  return data
}