import { useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const AccessibilityModal = lazy(() => import('@pages/AccessibilityPage').then(m => ({ default: m.AccessibilityModal })))
const PrivacyPolicyModal = lazy(() => import('@pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyModal })))
const TermsOfUseModal = lazy(() => import('@pages/TermsOfUsePage').then(m => ({ default: m.TermsOfUseModal })))

const LINKS = [
  { label: 'Contact us', to: '/contact' },
  { label: 'Sitemap', to: '/sitemap' },
]

export default function Footer() {
  const { i18n } = useTranslation()
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)

  return (
    <>
      <footer className="bg-bocra-navy">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Botswana Communications Regulatory
              Authority
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                className="text-xs text-white/40 transition-colors hover:text-white/70"
              >
                Privacy policy
              </button>

              <button
                type="button"
                onClick={() => setIsAccessibilityOpen(true)}
                className="text-xs text-white/40 transition-colors hover:text-white/70"
              >
                Accessibility
              </button>

              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="text-xs text-white/40 transition-colors hover:text-white/70"
              >
                Terms of use
              </button>

              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-xs text-white/40 transition-colors hover:text-white/70"
                >
                  {l.label}
                </Link>
              ))}

              <button
                onClick={() =>
                  i18n.changeLanguage(i18n.language === 'en' ? 'tn' : 'en')
                }
                className="flex items-center gap-1.5 rounded-md border border-white/20 px-2.5 py-1 text-xs text-white/60 transition-colors hover:border-white/40 hover:text-white/80"
              >
                {i18n.language === 'en' ? '🇧🇼 Setswana' : '🇬🇧 English'}
              </button>
            </div>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <PrivacyPolicyModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
        />
        <AccessibilityModal
          isOpen={isAccessibilityOpen}
          onClose={() => setIsAccessibilityOpen(false)}
        />
        <TermsOfUseModal
          isOpen={isTermsOpen}
          onClose={() => setIsTermsOpen(false)}
        />
      </Suspense>
    </>
  )
}
