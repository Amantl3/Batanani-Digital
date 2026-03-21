import { X, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'

export default function AlertBanner() {
  const { alertBannerVisible, dismissAlertBanner } = useUIStore()
  if (!alertBannerVisible) return null
  return (
    <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-900" role="alert">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
      <p className="flex-1 text-sm">
        <span className="font-semibold">Public consultation open:</span>{' '}
        Draft Telecommunications Amendment Regulations 2025 — comment by 31 March.{' '}
        <Link to="/publications" className="underline hover:no-underline">View consultation →</Link>
      </p>
      <button onClick={dismissAlertBanner} className="shrink-0 rounded p-0.5 text-amber-700 hover:bg-amber-100" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
