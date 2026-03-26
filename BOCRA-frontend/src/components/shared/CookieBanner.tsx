import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'

const STORAGE_KEY = 'bocra_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  const accept = () => { localStorage.setItem(STORAGE_KEY, 'accepted'); setVisible(false) }
  const deny   = () => { localStorage.setItem(STORAGE_KEY, 'denied');   setVisible(false) }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bocra-teal/10">
            <Cookie className="h-5 w-5 text-bocra-teal" />
          </div>

          {/* Text */}
          <div className="flex-1 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">We use cookies</p>
            <p className="mt-0.5 leading-relaxed">
              This site uses cookies to improve your experience and for analytics. By accepting, you
              agree to our use of cookies as described in our{' '}
              <a href="https://www.bocra.org.bw/sites/default/files/documents/Annexure_3.3.1A_ccTLD_BW_Acceptable_User_Policy_Feb_2022.pdf" target="_blank" rel="noopener noreferrer" className="font-medium text-bocra-teal hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={deny}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Deny
            </button>
            <button
              onClick={accept}
              className="rounded-lg bg-bocra-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
            >
              Accept all
            </button>
            <button
              onClick={deny}
              aria-label="Dismiss"
              className="ml-1 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
