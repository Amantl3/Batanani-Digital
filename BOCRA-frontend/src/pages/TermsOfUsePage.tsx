import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  AlertTriangle,
  FileText,
  Gavel,
  Globe,
  Scale,
  ShieldAlert,
  X,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

function InView({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const termsSections = [
  {
    title: 'Use of the website',
    icon: Globe,
    points: [
      'This website is provided to share public information about BOCRA, support regulatory services and enable users to access online tools, forms and portals.',
      'You agree to use the website lawfully and in a way that does not interfere with the security, availability or proper operation of BOCRA systems.',
      'Users must not attempt to gain unauthorised access to restricted areas, upload malicious code or misuse any BOCRA digital service.',
    ],
  },
  {
    title: 'Information accuracy',
    icon: FileText,
    points: [
      'BOCRA aims to keep website information current and accurate, but some content may change without prior notice as services, fees, laws or processes are updated.',
      'Published information is intended for general guidance and should not be treated as a substitute for official legal, regulatory or professional advice.',
    ],
  },
  {
    title: 'Intellectual property',
    icon: Scale,
    points: [
      'Website content, branding, documents, graphics and other materials remain the property of BOCRA or the relevant rights holder unless stated otherwise.',
      'You may view, download or print public information for personal, non-commercial or legitimate stakeholder use, provided that the content is not altered in a misleading way and attribution is preserved where appropriate.',
    ],
  },
  {
    title: 'External links and third-party services',
    icon: ShieldAlert,
    points: [
      'The BOCRA website may link to portals, payment systems, public resources or other external services for convenience or service delivery.',
      'BOCRA is not responsible for the content, availability, security or privacy practices of third-party websites once you leave this site.',
    ],
  },
]

export function TermsOfUseContent() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-bocra-teal/10 p-3">
            <Gavel className="h-6 w-6 text-bocra-teal" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Agreement to these terms
            </h2>
            <p className="leading-relaxed text-slate-600">
              By accessing or using this website, you agree to comply with these
              Terms of Use and any applicable laws, regulations and website
              notices. If you do not agree with these terms, you should
              discontinue use of the website and related digital services.
            </p>
            <p className="leading-relaxed text-slate-600">
              These terms apply to BOCRA public pages, service information,
              complaint channels, licensing content and related online systems
              made available through this website.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {termsSections.map(({ title, icon: Icon, points }) => (
          <section
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bocra-teal/10">
              <Icon className="h-6 w-6 text-bocra-teal" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <ul className="mt-4 space-y-3 text-slate-600">
              {points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-bocra-teal" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Limitation of liability
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            BOCRA makes reasonable efforts to provide reliable access to its
            digital services, but does not guarantee that the website will
            always be uninterrupted, error-free or available at all times. Use
            of the website is at your own risk.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            To the extent permitted by law, BOCRA will not be liable for any
            direct, indirect, incidental or consequential loss arising from
            reliance on website content, system unavailability, delays,
            technical issues, external service failures or misuse by third
            parties.
          </p>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-6 w-6 text-amber-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Changes to these terms
              </h2>
              <p className="mt-4 leading-relaxed text-slate-700">
                BOCRA may update these Terms of Use from time to time to reflect
                changes in law, service delivery, platform features or
                regulatory requirements. Updated terms take effect when posted
                on the website unless otherwise stated.
              </p>
              <p className="mt-4 leading-relaxed text-slate-700">
                Continued use of the website after changes are published may be
                treated as acceptance of the revised terms.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export function TermsOfUseModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close terms of use"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-bocra-navy px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-white">Terms of Use</h2>
            <p className="mt-1 text-sm text-slate-300">
              Conditions for using BOCRA digital platforms and services
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-6 md:px-8">
          <TermsOfUseContent />
        </div>
      </motion.div>
    </div>
  )
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-bocra-navy px-6 py-16">
        <InView className="container-page text-center">
          <motion.div variants={fadeUp} className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Terms of Use
            </h1>
            <p className="text-xl text-slate-300">
              The rules and conditions for using BOCRA digital platforms,
              information and online services.
            </p>
          </motion.div>
        </InView>
      </section>

      <div className="container-page py-12">
        <InView className="mx-auto max-w-5xl">
          <motion.div variants={fadeUp}>
            <TermsOfUseContent />
          </motion.div>
        </InView>
      </div>
    </div>
  )
}
