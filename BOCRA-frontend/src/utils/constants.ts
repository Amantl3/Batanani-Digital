export const APP_NAME = 'BOCRA Digital'

// Dashboard is intentionally excluded from public nav
// Admin accesses it via /admin/dashboard
export const NAV_LINKS = [
  { label: 'Home',         path: '/',            requiresAuth: false },
  { label: 'Licensing',    path: '/licensing',   requiresAuth: false },
  { label: 'Complaints',   path: '/complaints',  requiresAuth: false },
  { label: 'Publications', path: '/publications',requiresAuth: false },
  { label: 'My Portal',    path: '/portal',      requiresAuth: true  },
] as const

export const LICENCE_CATEGORIES = [
  { value: 'telecom',       label: 'Telecommunications' },
  { value: 'broadcast',     label: 'Broadcasting' },
  { value: 'postal',        label: 'Postal' },
  { value: 'internet',      label: 'Internet' },
  { value: 'type_approval', label: 'Type Approval' },
] as const

export const LICENCE_STATUSES = [
  { value: 'active',    label: 'Active' },
  { value: 'pending',   label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'expired',   label: 'Expired' },
] as const

export const COMPLAINT_CATEGORIES = [
  { value: 'billing',  label: 'Billing dispute' },
  { value: 'quality',  label: 'Service quality / outage' },
  { value: 'coverage', label: 'Coverage issue' },
  { value: 'data',     label: 'Data / internet problem' },
  { value: 'fraud',    label: 'Fraud / scam' },
  { value: 'other',    label: 'Other' },
] as const

export const SERVICE_PROVIDERS = [
  { value: 'mascom', label: 'Mascom Wireless' },
  { value: 'orange', label: 'Orange Botswana' },
  { value: 'btc',    label: 'BTC (Botswana Telecom)' },
  { value: 'bbc',    label: 'Botswana Broadcasting Corp.' },
  { value: 'other',  label: 'Other / Unlicensed' },
] as const

export const FILE_UPLOAD = {
  maxSizeBytes:  5 * 1024 * 1024,
  acceptedTypes: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
  maxFiles:      5,
} as const