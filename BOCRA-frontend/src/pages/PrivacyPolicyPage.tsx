import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Clock, Database, Eye, Lock, Mail, Shield, X } from 'lucide-react'

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

export function PrivacyPolicyContent() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 text-sm text-slate-500">
        <Clock className="h-4 w-4" />
        <span>Updated using BOCRA public website information and contact details</span>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
        <p className="leading-relaxed text-slate-600">
          Botswana Communications Regulatory Authority (BOCRA) is the regulator
          of the communications sector in Botswana, covering
          telecommunications, Internet and ICTs, radio communications,
          broadcasting, postal services and related matters. This privacy notice
          explains how personal information may be collected, used, stored and
          protected when members of the public use BOCRA digital services,
          submit complaints, make licensing enquiries, contact the Authority or
          interact with online forms and portals.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Database className="h-6 w-6 text-bocra-teal" />
          2. Information BOCRA May Collect
        </h2>
        <div className="space-y-3 text-slate-600">
          <div>
            <h3 className="font-semibold text-gray-900">Information you provide</h3>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Names, phone numbers, email addresses and postal details</li>
              <li>Complaint details, supporting documents and reference information</li>
              <li>Licensing, type approval, compliance or application information</li>
              <li>Messages, requests and records submitted through BOCRA channels</li>
              <li>Payment or transaction-related details where a service requires it</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Information collected automatically</h3>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>IP address, browser type and operating system</li>
              <li>Pages visited, referral source and usage activity</li>
              <li>Device and session data needed for security and analytics</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Eye className="h-6 w-6 text-bocra-teal" />
          3. How BOCRA Uses Information
        </h2>
        <ul className="list-inside list-disc space-y-2 text-slate-600">
          <li>To process complaints, requests, applications and regulatory services</li>
          <li>To communicate with consumers, licensees and stakeholders</li>
          <li>To monitor service delivery, improve digital platforms and protect users</li>
          <li>To comply with legal and regulatory obligations under Botswana law</li>
          <li>To maintain records, security, fraud prevention and service integrity</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Lock className="h-6 w-6 text-bocra-teal" />
          4. Security and Retention
        </h2>
        <p className="leading-relaxed text-slate-600">
          BOCRA applies administrative, technical and organisational safeguards
          to protect information against unauthorised access, misuse,
          alteration, loss or disclosure. Personal information is retained only
          for as long as necessary to provide services, meet statutory or
          regulatory obligations, resolve disputes, support investigations and
          preserve official records.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Shield className="h-6 w-6 text-bocra-teal" />
          5. Sharing of Information
        </h2>
        <p className="leading-relaxed text-slate-600">
          BOCRA does not sell personal information. Information may be shared
          where necessary with authorised service providers, relevant public
          institutions, law-enforcement bodies, courts or other parties where
          disclosure is required by law, necessary for regulatory functions or
          permitted with the data subject's consent.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">6. Your Choices and Rights</h2>
        <ul className="list-inside list-disc space-y-2 text-slate-600">
          <li>Request access to personal information held in relation to your submission</li>
          <li>Ask for correction of inaccurate or incomplete details</li>
          <li>Make enquiries about how your information is being used</li>
          <li>Raise concerns through BOCRA using the official contact channels below</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">7. Website and External Links</h2>
        <p className="leading-relaxed text-slate-600">
          BOCRA online platforms may contain links to external systems and
          related platforms such as portals, licensing systems and monitoring
          tools. Once you leave the BOCRA website, the privacy practices of that
          external service will apply. Users should review the policies of those
          services separately.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">8. BOCRA Contact Details</h2>
        <p className="leading-relaxed text-slate-600">
          The contact information below is taken from BOCRA's public website.
        </p>
        <div className="rounded-lg border border-bocra-teal/20 bg-bocra-teal/5 p-4">
          <p className="font-semibold text-gray-900">
            Botswana Communications Regulatory Authority
          </p>
          <p className="text-slate-600">Plot 50671 Independence Avenue</p>
          <p className="text-slate-600">Gaborone, Botswana</p>
          <p className="text-slate-600">
            Tel:{' '}
            <a
              href="tel:+2673957755"
              className="text-bocra-teal hover:underline"
            >
              +267 395 7755
            </a>
          </p>
          <p className="text-slate-600">Fax: +267 395 7976</p>
          <p className="text-slate-600">
            Email:{' '}
            <a
              href="mailto:info@bocra.org.bw"
              className="text-bocra-teal hover:underline"
            >
              info@bocra.org.bw
            </a>
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Source: publicly available information on www.bocra.org.bw.
          </p>
        </div>
      </section>
    </div>
  )
}

export function PrivacyPolicyModal({
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
        aria-label="Close privacy policy"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-bocra-navy px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
            <p className="mt-1 text-sm text-slate-300">
              Based on BOCRA public information and official contact details
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
          <PrivacyPolicyContent />
        </div>
      </motion.div>
    </div>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-bocra-navy px-6 py-16">
        <InView className="container-page text-center">
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-xl text-slate-300">
              How BOCRA handles and protects personal information
            </p>
          </motion.div>
        </InView>
      </section>

      <div className="container-page py-12">
        <InView className="mx-auto max-w-4xl">
          <motion.div
            variants={fadeUp}
            className="rounded-lg border border-slate-200 bg-white p-8"
          >
            <PrivacyPolicyContent />
          </motion.div>
        </InView>
      </div>
    </div>
  )
}
