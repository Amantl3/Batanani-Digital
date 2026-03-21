import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

// ─── Dates ────────────────────────────────────────────────────────────────────
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = parseISO(dateStr)
  return isValid(d) ? format(d, 'd MMM yyyy') : '—'
}

export function formatDateTime(dateStr: string): string {
  const d = parseISO(dateStr)
  return isValid(d) ? format(d, 'd MMM yyyy, HH:mm') : '—'
}

export function formatRelative(dateStr: string): string {
  const d = parseISO(dateStr)
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—'
}

// ─── Numbers / currency ───────────────────────────────────────────────────────
export function formatCurrency(amount: number, currency = 'BWP'): string {
  return new Intl.NumberFormat('en-BW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-BW').format(n)
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`
}

export function formatDelta(n: number, unit = ''): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}${unit}`
}

// ─── Licence / complaint labels ───────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  telecom:       'Telecommunications',
  broadcast:     'Broadcasting',
  postal:        'Postal',
  internet:      'Internet',
  type_approval: 'Type Approval',
  billing:       'Billing dispute',
  quality:       'Service quality',
  coverage:      'Coverage issue',
  data:          'Data / internet',
  fraud:         'Fraud / scam',
  other:         'Other',
}

export function formatCategory(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat
}

export function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Files ────────────────────────────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1_024)         return `${bytes} B`
  if (bytes < 1_048_576)     return `${(bytes / 1_024).toFixed(1)} KB`
  return                             `${(bytes / 1_048_576).toFixed(1)} MB`
}

export function truncate(str: string, max: number): string {
  return str.length <= max ? str : `${str.slice(0, max)}…`
}
