import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Shield, Mail, Lock, Eye, Database, Clock } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

function InView({ children, className }: { children: React.ReactNode; className?: string }) {
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

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-bocra-navy px-6 py-16">
        <InView className="container-page text-center">
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-xl text-slate-300">How BOCRA protects your personal information</p>
          </motion.div>
        </InView>
      </section>

      <div className="container-page py-12">
        <InView className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="bg-white rounded-lg border border-slate-200 p-8 space-y-8">
            
            {/* Last Updated */}
            <div className="flex items-center gap-2 text-sm text-slate-500 border-b border-slate-200 pb-4">
              <Clock className="h-4 w-4" />
              <span>Last updated: March 2026</span>
            </div>

            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
              <p className="text-slate-600 leading-relaxed">
                The Botswana Communications Regulatory Authority (BOCRA) is committed to protecting your privacy and ensuring you have a positive experience on our website and with our services. This Privacy Policy explains how we collect, use, disclose and otherwise handle your personal information.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Database className="h-6 w-6 text-bocra-teal" />
                2. Information We Collect
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Directly from You</h3>
                  <p className="text-slate-600">When you interact with BOCRA services, we may collect:</p>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600">
                    <li>Name, contact details, and identification information</li>
                    <li>Licence application and compliance information</li>
                    <li>Complaint details and supporting documents</li>
                    <li>Payment and billing information</li>
                    <li>Correspondence and communication records</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mt-4">Automatically Collected</h3>
                  <p className="text-slate-600">When you visit our website, we automatically collect:</p>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600">
                    <li>IP address and browser information</li>
                    <li>Pages visited and time spent on site</li>
                    <li>Referring website and links clicked</li>
                    <li>Device type and operating system</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Eye className="h-6 w-6 text-bocra-teal" />
                3. How We Use Your Information
              </h2>
              <p className="text-slate-600">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Process licence applications and renewals</li>
                <li>Handle complaints and inquiries</li>
                <li>Provide regulatory services and communications</li>
                <li>Comply with legal obligations</li>
                <li>Improve our website and services</li>
                <li>Send important updates and notifications</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Lock className="h-6 w-6 text-bocra-teal" />
                4. Data Security
              </h2>
              <p className="text-slate-600 leading-relaxed">
                BOCRA implements appropriate technical, administrative and physical security measures to protect your personal information against unauthorized access, alteration, disclosure or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            {/* Sharing Your Information */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-6 w-6 text-bocra-teal" />
                5. Sharing Your Information
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We do not sell or rent your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Government agencies as required by law</li>
                <li>Service providers who assist us in operations</li>
                <li>Other parties with your explicit consent</li>
                <li>Law enforcement when legally required</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">6. Your Rights</h2>
              <p className="text-slate-600 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge a complaint with relevant authorities</li>
              </ul>
            </section>

            {/* Cookies */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">7. Cookies and Tracking</h2>
              <p className="text-slate-600 leading-relaxed">
                Our website uses cookies to enhance user experience and gather analytics. You can choose to disable cookies in your browser settings, though some functionality may be limited.
              </p>
            </section>

            {/* Data Retention */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">8. Data Retention</h2>
              <p className="text-slate-600 leading-relaxed">
                We retain your personal information for as long as necessary to provide services, comply with legal obligations, and resolve disputes. Retention periods vary depending on the nature of the information and how we use it.
              </p>
            </section>

            {/* Third-Party Links */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">9. Third-Party Links</h2>
              <p className="text-slate-600 leading-relaxed">
                Our website may contain links to third-party websites. This Privacy Policy does not apply to external sites, and we are not responsible for their privacy practices. Please review their privacy policies before providing any information.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">10. Children's Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                BOCRA's services are not directed to individuals under 18. We do not knowingly collect information from children. If we become aware that a child has provided information, we will take steps to delete such information.
              </p>
            </section>

            {/* Policy Changes */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">11. Changes to This Policy</h2>
              <p className="text-slate-600 leading-relaxed">
                BOCRA may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the updated policy on our website.
              </p>
            </section>

            {/* Contact Information */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Mail className="h-6 w-6 text-bocra-teal" />
                12. Contact Us
              </h2>
              <p className="text-slate-600 leading-relaxed">
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-bocra-teal/5 rounded-lg border border-bocra-teal/20">
                <p className="font-semibold text-gray-900">Botswana Communications Regulatory Authority</p>
                <p className="text-slate-600">Plot 50671 Independence Ave, Gaborone</p>
                <p className="text-slate-600">Email: <a href="mailto:info@bocra.org.bw" className="text-bocra-teal hover:underline">info@bocra.org.bw</a></p>
                <p className="text-slate-600">Phone: <a href="tel:+2673957755" className="text-bocra-teal hover:underline">+267 395 7755</a></p>
              </div>
            </section>

          </motion.div>
        </InView>
      </div>
    </div>
  )
}
