import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Accessibility,
  Globe,
  Keyboard,
  MessageSquare,
  MonitorSmartphone,
  ShieldCheck,
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

const commitments = [
  {
    title: 'Inclusive design',
    description:
      'BOCRA aims to make its digital services understandable and usable by people with different abilities, devices and levels of digital literacy.',
    icon: Accessibility,
  },
  {
    title: 'Keyboard-friendly navigation',
    description:
      'Core navigation, forms and actions should remain accessible to users who rely on keyboards or assistive technologies rather than a mouse or touch input.',
    icon: Keyboard,
  },
  {
    title: 'Readable content',
    description:
      'Pages are structured with headings, meaningful labels, clear calls to action and consistent language to support screen readers and easier comprehension.',
    icon: Globe,
  },
  {
    title: 'Responsive access',
    description:
      'The website is designed to work across phones, tablets, laptops and desktop screens so users can access BOCRA services in different environments.',
    icon: MonitorSmartphone,
  },
]

const supportItems = [
  'Use clear page titles, headings and descriptive link text where possible',
  'Maintain colour contrast and readable text sizing across key user journeys',
  'Support zoom and mobile-responsive layouts without loss of essential content',
  'Design forms and service actions with visible labels, helper text and clear feedback',
  'Review content and interface updates to improve accessibility over time',
]

export function AccessibilityContent() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-bocra-teal/10 p-3">
            <ShieldCheck className="h-6 w-6 text-bocra-teal" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Accessibility commitment
            </h2>
            <p className="leading-relaxed text-slate-600">
              BOCRA recognises that digital access is essential for public
              participation, complaints handling, licensing services, consumer
              information and communication with stakeholders. We are working to
              provide an online experience that supports people who use
              assistive technologies, keyboard navigation, larger text, mobile
              devices and alternative ways of interacting with digital services.
            </p>
            <p className="leading-relaxed text-slate-600">
              Accessibility is an ongoing process. Some parts of this website
              may still be improved over time as content, forms and service
              tools continue to evolve.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {commitments.map(({ title, description, icon: Icon }) => (
          <section
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bocra-teal/10">
              <Icon className="h-6 w-6 text-bocra-teal" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-3 leading-relaxed text-slate-600">{description}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            What we aim to support
          </h2>
          <ul className="mt-5 space-y-3 text-slate-600">
            {supportItems.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-bocra-teal" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-bocra-teal/20 bg-bocra-teal/5 p-8 shadow-sm">
          <div className="flex items-start gap-3">
            <MessageSquare className="mt-1 h-6 w-6 text-bocra-teal" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Need assistance?
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                If you have difficulty accessing information on this website,
                using an online form or completing a digital service, please
                contact BOCRA so that support can be provided and the issue can
                be reviewed.
              </p>

              <div className="mt-6 space-y-2 text-slate-700">
                <p className="font-semibold">
                  Botswana Communications Regulatory Authority
                </p>
                <p>Plot 50671 Independence Avenue, Gaborone, Botswana</p>
                <p>
                  Tel:{' '}
                  <a
                    href="tel:+2673957755"
                    className="text-bocra-teal hover:underline"
                  >
                    +267 395 7755
                  </a>
                </p>
                <p>
                  Email:{' '}
                  <a
                    href="mailto:info@bocra.org.bw"
                    className="text-bocra-teal hover:underline"
                  >
                    info@bocra.org.bw
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export function AccessibilityModal({
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
        aria-label="Close accessibility information"
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
            <h2 className="text-2xl font-bold text-white">Accessibility</h2>
            <p className="mt-1 text-sm text-slate-300">
              BOCRA’s commitment to inclusive digital access
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
          <AccessibilityContent />
        </div>
      </motion.div>
    </div>
  )
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-bocra-navy px-6 py-16">
        <InView className="container-page text-center">
          <motion.div variants={fadeUp} className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Accessibility
            </h1>
            <p className="text-xl text-slate-300">
              BOCRA is committed to making its digital services more inclusive,
              usable and accessible for everyone.
            </p>
          </motion.div>
        </InView>
      </section>

      <div className="container-page py-12">
        <InView className="mx-auto max-w-5xl">
          <motion.div variants={fadeUp}>
            <AccessibilityContent />
          </motion.div>
        </InView>
      </div>
    </div>
  )
}
