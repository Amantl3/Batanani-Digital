import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const LINKS = [
  { label: 'Privacy policy',  to: '/privacy'       },
  { label: 'Accessibility',   to: '/accessibility' },
  { label: 'Contact us',      to: '/contact'       },
  { label: 'Sitemap',         to: '/sitemap'       },
]

export default function Footer() {
  const { i18n } = useTranslation()

  return (
    <footer className="bg-bocra-navy">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Botswana Communications Regulatory Authority
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-xs text-white/40 transition-colors hover:text-white/70"
              >
                {l.label}
              </Link>
            ))}

            {/* Language toggle */}
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
  )
}
