import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, useInView } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle, FileText, Shield, Globe, Lock, Zap, Radio } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { cn } from '@/utils/cn'

const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

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

const CONTACT_INFO = [
  { icon: Phone, title: 'Phone', content: '+267 395 7755', subtext: 'Business hours: Mon-Fri, 8AM-5PM' },
  { icon: Mail, title: 'Email', content: 'info@bocra.org.bw', subtext: 'Response time: Within 48 hours' },
  { icon: MapPin, title: 'Office', content: 'Plot 50779, Gaborone', subtext: 'Botswana' },
  { icon: Clock, title: 'Hours', content: '8:00 AM - 5:00 PM', subtext: 'Monday to Friday' },
]

const SITEMAP = [
  {
    title: 'Main Pages',
    links: [
      { label: 'Home', to: '/', icon: Globe },
      { label: 'Licensing', to: '/licensing', icon: FileText },
      { label: 'Complaints', to: '/complaints', icon: Shield },
      { label: 'Publications', to: '/publications', icon: FileText },
    ],
  },
  {
    title: 'Portal',
    links: [
      { label: 'My Portal', to: '/portal', icon: Lock },
      { label: 'Apply for Licence', to: '/portal/apply', icon: FileText },
      { label: 'Renew Licence', to: '/portal/renew', icon: Zap },
      { label: 'Payment History', to: '/portal/payment-history', icon: Globe },
    ],
  },
  {
    title: 'Specialised Services',
    links: [
      { label: 'Compliance', to: '/portal/compliance', icon: FileText },
      { label: 'Domain Registration', to: '/portal/DomainRegistration', icon: Lock },
      { label: 'Fee Payment', to: '/portal/pay', icon: Globe },
      { label: 'Complaints Map', to: '/map', icon: MapPin },
    ],
  },
  {
    title: 'Authentication',
    links: [
      { label: 'Login', to: '/login', icon: Lock },
      { label: 'Register', to: '/register', icon: FileText },
      { label: 'Forgot Password', to: '/forgot-password', icon: AlertCircle },
    ],
  },
]

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const [submitSuccess, setSubmitSuccess] = useState(false)

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`Thanks ${data.name}! We'll get back to you soon.`)
      setSubmitSuccess(true)
      reset()
      
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-bocra-navy px-6 py-16">
        <InView className="container-page text-center">
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-xl text-slate-300">Have questions? We're here to help. Reach out to BOCRA anytime.</p>
          </motion.div>
        </InView>
      </section>

      <div className="container-page py-12">
        {/* Contact Info Grid */}
        <InView className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {CONTACT_INFO.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-bocra-teal/10 mb-4">
                <item.icon className="w-6 h-6 text-bocra-teal" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="font-medium text-bocra-teal mb-2">{item.content}</p>
              <p className="text-sm text-gray-600">{item.subtext}</p>
            </motion.div>
          ))}
        </InView>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <InView>
            <motion.div variants={fadeUp} className="bg-white rounded-lg border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-800">Message sent successfully! We'll be in touch soon.</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      {...register('name')}
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bocra-teal focus:border-transparent transition-colors',
                        errors.name && 'border-red-300'
                      )}
                      placeholder="Your name"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bocra-teal focus:border-transparent transition-colors',
                        errors.phone && 'border-red-300'
                      )}
                      placeholder="Your phone"
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bocra-teal focus:border-transparent transition-colors',
                      errors.email && 'border-red-300'
                    )}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    {...register('subject')}
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bocra-teal focus:border-transparent transition-colors',
                      errors.subject && 'border-red-300'
                    )}
                    placeholder="What is this about?"
                  />
                  {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bocra-teal focus:border-transparent transition-colors resize-none',
                      errors.message && 'border-red-300'
                    )}
                    placeholder="Tell us more..."
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-bocra-teal text-white font-semibold py-3 rounded-lg hover:bg-bocra-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </InView>

          {/* Quick Links */}
          <InView>
            <motion.div variants={fadeUp} className="bg-white rounded-lg border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Needed</h2>
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg hover:border-bocra-teal hover:bg-bocra-teal/5 transition-all cursor-pointer">
                  <Link to="/licensing" className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Apply for a Licence</span>
                    <Shield className="w-5 h-5 text-bocra-teal" />
                  </Link>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg hover:border-bocra-teal hover:bg-bocra-teal/5 transition-all cursor-pointer">
                  <Link to="/complaints" className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">File a Complaint</span>
                    <AlertCircle className="w-5 h-5 text-bocra-teal" />
                  </Link>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg hover:border-bocra-teal hover:bg-bocra-teal/5 transition-all cursor-pointer">
                  <Link to="/portal/DomainRegistration" className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Register .bw Domain</span>
                    <Globe className="w-5 h-5 text-bocra-teal" />
                  </Link>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg hover:border-bocra-teal hover:bg-bocra-teal/5 transition-all cursor-pointer">
                  <Link to="/portal/pay" className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Pay Fees Online</span>
                    <Lock className="w-5 h-5 text-bocra-teal" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </InView>
        </div>

        {/* Sitemap Section */}
        <InView className="mb-16">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Site Map</h2>
            <p className="text-gray-600">Quick access to all BOCRA services and resources</p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {SITEMAP.map((section, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        to={link.to}
                        className="flex items-center gap-2 text-gray-600 hover:text-bocra-teal transition-colors group"
                      >
                        <link.icon className="w-4 h-4 text-slate-400 group-hover:text-bocra-teal transition-colors" />
                        <span className="text-sm group-hover:font-medium">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </InView>

        {/* CTA Section */}
        <InView>
          <motion.div variants={fadeUp} className="bg-gradient-to-r from-bocra-navy to-bocra-teal rounded-lg p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Need Immediate Assistance?</h2>
            <p className="text-lg text-white/90 mb-6">Call our hotline or visit our office during business hours</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:+26739577755" className="px-6 py-3 bg-white text-bocra-navy font-semibold rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +267 395 7755
              </a>
              <a href="mailto:info@bocra.org.bw" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                <Mail className="w-4 h-4" />
                info@bocra.org.bw
              </a>
            </div>
          </motion.div>
        </InView>
      </div>
    </div>
  )
}
