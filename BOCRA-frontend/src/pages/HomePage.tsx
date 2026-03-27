import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Search, ArrowRight, FileText, Shield, Globe, Lock,
  Zap, Phone, ChevronRight, PlayCircle, TrendingUp,
  Users, Award, Radio, MapPin,
  ArrowBigRightDash,
} from 'lucide-react'
import { cn } from '@/utils/cn'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

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

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '1,248', label: 'Active licensees',      icon: Award      },
  { value: '3.8M',  label: 'Mobile subscribers',    icon: Users      },
  { value: '62.4%', label: 'Broadband penetration', icon: TrendingUp },
  { value: '98.2%', label: 'Platform uptime',       icon: Radio      },
]

const SERVICES = [
  { icon: FileText, title: 'Licensing',           desc: 'Apply for and manage telecommunications, broadcasting, postal and internet service licences.', to: '/licensing',    color: 'text-bocra-teal',  bg: 'bg-bocra-teal/10',  border: 'border-bocra-teal/20'  },
  { icon: Shield,   title: 'Consumer protection', desc: 'File complaints against licensed providers and track your case in real time.',                  to: '/complaints',   color: 'text-bocra-red',   bg: 'bg-bocra-red/10',   border: 'border-bocra-red/20'   },
  { icon: Globe,    title: '.bw Domain registry', desc: 'Register and manage .bw domain names for Botswana-based organisations.',                       to: '/portal',       color: 'text-bocra-green', bg: 'bg-bocra-green/10', border: 'border-bocra-green/20' },
  { icon: Lock,     title: 'Cyber security',      desc: "Access CSIRT advisories, security alerts and guidance for Botswana's digital sector.",          to: '/publications', color: 'text-bocra-gold',  bg: 'bg-bocra-gold/10',  border: 'border-bocra-gold/20'  },
  { icon: Zap,      title: 'Self-service portal', desc: 'Pay fees, submit compliance reports, and renew licences without visiting our offices.',         to: '/portal',       color: 'text-bocra-teal',  bg: 'bg-bocra-teal/10',  border: 'border-bocra-teal/20'  },
  { icon: Radio,    title: 'Regulatory dashboard',desc: 'Explore live market data, sector statistics and regulatory performance indicators.',             to: '/dashboard',    color: 'text-bocra-green', bg: 'bg-bocra-green/10', border: 'border-bocra-green/20' },
]

const NEWS = [
  { tag: 'Consultation open', tagColor: 'bg-bocra-teal/10 text-bocra-teal',   title: 'Draft Cybersecurity Policy for Electronic Communications Networks',  date: '18 Mar 2025', closes: 'Closes 15 Apr 2025' },
  { tag: 'Consumer alert',    tagColor: 'bg-bocra-red/10 text-bocra-red',     title: 'Warning against unlicensed VOIP providers operating in Botswana',    date: '15 Mar 2025', closes: null               },
  { tag: 'Announcement',      tagColor: 'bg-bocra-green/10 text-bocra-green', title: 'Revised Type Approval guidelines for mobile devices published',       date: '12 Mar 2025', closes: null               },
]

const QUICK_LINKS = [
  { label: 'Apply for a licence',     to: '/portal'       },
  { label: 'File a complaint',        to: '/complaints'   },
  { label: 'Check licence status',    to: '/licensing'    },
  { label: 'View open consultations', to: '/publications' },
  { label: 'Register a .bw domain',  to: '/portal'       },
  { label: 'Download publications',   to: '/publications' },
]

const FOOTER_LINKS = [
  {
    category: 'Licensing',
    links: [
      { label: 'Apply for licence', to: '/portal' },
      { label: 'Renew licence', to: '/portal' },
      { label: 'Licence registry', to: '/licensing' },
      { label: 'Type approval', to: '#' },
      { label: 'Licence conditions', to: '#' },
    ],
  },
  {
    category: 'Consumers',
    links: [
      { label: 'File a complaint', to: '/complaints' },
      { label: 'Track complaint', to: '/complaints/track' },
      { label: 'Consumer rights', to: '#' },
      { label: 'FAQs', to: '#' },
      { label: 'Toll-free helpline', to: '#' },
    ],
  },
  {
    category: 'Regulation',
    links: [
      { label: 'Publications', to: '/publications' },
      { label: 'Consultations', to: '/publications' },
      { label: 'Regulations', to: '/publications' },
      { label: 'Government gazettes', to: '/publications' },
      { label: 'Annual reports', to: '/publications' },
    ],
  },
  {
    category: 'About BOCRA',
    links: [
      { label: 'Who we are', to: '#' },
      { label: 'Board & management', to: '#' },
      { label: 'Mandate', to: '#' },
      { label: 'Careers', to: '#' },
      { label: 'Contact us', to: '/contact' },
    ],
  },
]

const BOTTOM_LINKS = [
  { label: 'Contact us', to: '/contact' },
  { label: 'Sitemap', to: '/sitemap' },
  { label: 'Privacy policy', to: '/privacy-policy' },
  { label: 'Terms of use', to: '/terms' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Sitemap', to: '/sitemap' },
]

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* HERO — full viewport with image + overlay + content*/}
      <section className="relative flex min-h-screen items-center overflow-hidden sm:min-h-[92vh]">

        {/* ── Background image ── */}
        <img
          src="/gabsCBD.jpg"
          alt="Gaborone CBD skyline"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* ── Dark gradient overlay — REQUIRED for text visibility ── */}
        <div className="absolute inset-0 bg-gradient-to-r from-bocra-navy/95 via-bocra-navy/80 to-bocra-navy/40" />
        {/* Bottom fade into stats strip */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bocra-navy/60 to-transparent" />

        {/* ── Hero content ── */}
        <div className="container-page relative z-10 pb-48 pt-12 sm:py-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            {/* Logo */}
            <motion.div variants={fadeUp} className="mb-8">
              <img
                src="/bocra-logo-white.png"
                alt="BOCRA"
                className="h-12 w-auto"
              />
            </motion.div>

            {/* Regulator badge */}
            <motion.div variants={fadeUp} className="mb-5 inline-flex items-center gap-2 rounded-full border border-bocra-teal/50 bg-bocra-teal/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-bocra-teal" />
              <span className="text-sm font-medium text-bocra-teal">Botswana's communications regulator</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="mb-4 font-heading text-3xl font-bold leading-tight tracking-tight text-white sm:mb-6 sm:text-6xl"
            >
              Connecting{' '}
              <span className="text-bocra-teal">Botswana</span>
              <br />to a{' '}
              <span className="text-bocra-gold">digital future</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeUp}
              className="mb-6 max-w-xl text-sm leading-relaxed text-white/75 sm:mb-8 sm:text-lg"
            >
              BOCRA regulates telecommunications, broadcasting, postal and internet services in the public interest — enabling every Motswana to participate in the digital economy.
            </motion.p>

            {/* Search bar */}
            <motion.div
              variants={fadeUp}
              className="mb-6 flex flex-col overflow-hidden rounded-xl bg-white shadow-card-lg sm:mb-8 sm:flex-row sm:max-w-lg"
            >
              <div className="flex flex-1 items-center gap-3 px-5 py-1 sm:py-0">
                <Search className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search licences, regulations, publications…"
                  className="flex-1 border-none bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none sm:py-4"
                />
              </div>
              <button className="m-2 rounded-lg bg-bocra-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600 sm:py-0">
                Search
              </button>
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/licensing" className="flex items-center justify-center gap-2 rounded-xl bg-bocra-teal px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-teal-600">
                Apply for a licence <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/complaints" className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20">
                <Shield className="h-4 w-4" /> File a complaint
              </Link>
              <Link to="/portal" className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20">
                <ArrowBigRightDash className="h-4 w-4" /> Access portal
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Stats strip ── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-0 sm:px-0 sm:py-0">
          <div className="container-page">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg shadow-slate-950/30 ring-1 ring-white/30 sm:rounded-b-none sm:rounded-t-3xl"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 sm:divide-x sm:divide-white/15">
                {STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    variants={fadeUp}
                    className={cn(
                      "flex flex-col items-center gap-1 px-4 py-2 text-center sm:flex-row sm:gap-3 sm:px-6 sm:py-5 sm:text-left",
                      i < 2 && "border-b border-white/15 sm:border-b-0",
                      i % 2 === 0 && "border-r border-white/15 sm:border-r-0"
                    )}
                  >
                    <s.icon className="h-5 w-5 shrink-0 text-bocra-teal" />
                    <div>
                      <p className="hidden font-heading text-xl font-bold text-white sm:block sm:text-2xl">{s.value}</p>
                      <p className="text-xs text-white/70">{s.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="h-1 bg-gradient-to-r from-bocra-teal via-bocra-gold to-bocra-green" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          QUICK ACCESS
      ══════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-100 bg-white py-5">
        <div className="container-page">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Quick access:
            </span>
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-bocra-teal hover:bg-bocra-teal/5 hover:text-bocra-teal"
              >
                {l.label} <ChevronRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SERVICES GRID
      ══════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <InView>
            <motion.div variants={fadeUp} className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-bocra-teal/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-bocra-teal">
                Our services
              </span>
              <h2 className="font-heading text-4xl font-bold text-slate-900">
                Everything you need,<br />in one place
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-500">
                From applying for a licence to tracking your complaint — BOCRA's digital platform brings all regulatory services online.
              </p>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s) => (
                <motion.div key={s.title} variants={fadeUp}>
                  <Link
                    to={s.to}
                    className={`group flex h-full flex-col rounded-2xl border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-card-lg ${s.border}`}
                  >
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                      <s.icon className={`h-6 w-6 ${s.color}`} />
                    </div>
                    <h3 className={`mb-2 font-heading text-lg font-bold text-slate-900 group-hover:${s.color}`}>
                      {s.title}
                    </h3>
                    <p className="flex-1 text-sm leading-relaxed text-slate-500">{s.desc}</p>
                    <div className={`mt-4 flex items-center gap-1 text-sm font-semibold ${s.color}`}>
                      Get started <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </InView>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BOTSWANA STORY 
      ══════════════════════════════════════════════════════ */}
      <section className="overflow-hidden bg-bocra-navy">
        <div className="grid lg:grid-cols-2">

          {/* Text side */}
          <InView className="flex items-center px-8 py-20 lg:px-16">
            <div>
              <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full bg-bocra-gold/20 px-4 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-bocra-gold" />
                <span className="text-xs font-semibold uppercase tracking-widest text-bocra-gold">Connecting Botswana</span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="mb-6 font-heading text-4xl font-bold leading-tight text-white">
                From the Kalahari to the<br />
                <span className="text-bocra-teal">digital frontier</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mb-6 text-base leading-relaxed text-slate-400">
                Botswana's breathtaking landscapes and rich cultural heritage are matched by an ambitious digital future. BOCRA is building the regulatory foundation that lets every citizen — from Gaborone to the most remote village — access quality communications services.
              </motion.p>
              <motion.p variants={fadeUp} className="mb-8 text-base leading-relaxed text-slate-400">
                Our mandate covers telecommunications, broadcasting, postal services, internet governance, and cybersecurity — ensuring innovation thrives within a fair, transparent framework.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Link to="/publications" className="flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                  Our publications
                </Link>
              </motion.div>
            </div>
          </InView>

          {/* Image grid — 2×2 */}
          <div className="grid min-h-[500px] grid-cols-2 grid-rows-2 gap-1">
            <img src="/bocraB.jpg"    alt="BOCRA building"        className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.background = '#1e3a5f'; (e.target as HTMLImageElement).alt = '' }} />
            <img src="/gabsCBD.jpg"   alt="Gaborone CBD"          className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.background = '#1a3a5c' }} />
            <img src="/Kasane-Drone.jpg" alt="Okavango Delta"        className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.background = '#164a3a' }} />
            <img src="/towerA.jpg" alt="Digital connectivity" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.background = '#2d1a3a' }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          NEWS & CONSULTATIONS
      ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="container-page">
          <InView>
            <div className="mb-10 flex items-end justify-between">
              <motion.div variants={fadeUp}>
                <span className="mb-3 inline-block rounded-full bg-bocra-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-bocra-green">
                  Latest updates
                </span>
                <h2 className="font-heading text-4xl font-bold text-slate-900">
                  News & consultations
                </h2>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Link to="/publications" className="hidden items-center gap-1.5 text-sm font-semibold text-bocra-teal hover:underline sm:flex">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {NEWS.map((n, i) => (
                <motion.article
                  key={i}
                  variants={fadeUp}
                  className="group cursor-pointer rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-all hover:-translate-y-1 hover:border-slate-200 hover:shadow-card-md"
                >
                  <span className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${n.tagColor}`}>
                    {n.tag}
                  </span>
                  <h3 className="mb-3 font-heading text-base font-bold leading-snug text-slate-900 group-hover:text-bocra-teal">
                    {n.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{n.date}</span>
                    {n.closes && (
                      <span className="rounded-full bg-bocra-red/10 px-2 py-0.5 text-bocra-red">{n.closes}</span>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          </InView>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          COMPLAINT CTA BANNER
          Put a dark atmospheric image at /public/cta-bg.jpg
          e.g. BOCRA office, customer service desk, or abstract telecom
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24">
        {/* Background image with overlay */}
        <img
          src="/Kasane-Drone.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {/* Always-present dark fallback + overlay */}
        <div className="absolute inset-0 bg-bocra-navy" style={{ zIndex: -1 }} />
        <div className="absolute inset-0 bg-gradient-to-br from-bocra-navy/90 via-bocra-navy/80 to-bocra-red/30" />

        <div className="container-page relative z-10">
          <InView className="mx-auto max-w-2xl text-center">
            <motion.span variants={fadeUp} className="mb-4 inline-block rounded-full border border-bocra-gold/40 bg-bocra-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-bocra-gold">
              Consumer protection
            </motion.span>
            <motion.h2 variants={fadeUp} className="mb-6 font-heading text-4xl font-bold text-white">
              Not satisfied with your<br />service provider?
            </motion.h2>
            <motion.p variants={fadeUp} className="mb-8 text-lg text-white/70">
              BOCRA protects your rights as a communications consumer. If your provider has failed to resolve your complaint within 14 days, we can help.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              <Link to="/complaints" className="flex items-center gap-2 rounded-xl bg-bocra-red px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-red-800">
                <Shield className="h-5 w-5" /> File a complaint now
              </Link>
              <a href="tel:+2673957755" className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20">
                <Phone className="h-5 w-5" /> +267 395 7755
              </a>
            </motion.div>
          </InView>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER — single footer, built into this page only
          MainLayout suppresses its Footer component on /
      ══════════════════════════════════════════════════════ */}
      <footer className="bg-bocra-navy">

        {/* Links grid */}
        <div className="container-page border-b border-white/10 py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

            {/* Brand column */}
            <div className="lg:col-span-1">
              <img src="/bocra-logo-white.png" alt="BOCRA" className="mb-5 h-10 w-auto" />
              <p className="mb-6 text-sm leading-relaxed text-slate-400">
                Botswana Communications Regulatory Authority — regulating telecommunications, broadcasting, postal and internet services in the public interest.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: '𝕏', label: 'Twitter / X' },
                  { icon: 'f', label: 'Facebook'    },
                  { icon: 'in',label: 'LinkedIn'    },
                  { icon: '▶', label: 'YouTube'     },
                ].map((s) => (
                  <a key={s.label} href="#" aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sm text-white/50 transition-all hover:border-bocra-teal hover:text-bocra-teal"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_LINKS.map((col) => (
              <div key={col.category}>
                <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-white/40">{col.category}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-sm text-slate-400 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact bar */}
        <div className="container-page border-b border-white/10 py-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Phone,    label: 'Toll-free helpline', value: '+267 395 7755',           sub: 'Mon–Fri, 07:30–17:00 CAT' },
              { icon: Globe,    label: 'Email',              value: 'info@bocra.org.bw',       sub: 'General enquiries'        },
              { icon: MapPin,   label: 'Physical address',   value: 'Plot 50671, Independence Ave',sub: 'Gaborone, Botswana'       },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bocra-teal/10">
                  <c.icon className="h-5 w-5 text-bocra-teal" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{c.value}</p>
                  <p className="text-xs text-slate-500">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="container-page py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Botswana Communications Regulatory Authority. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {BOTTOM_LINKS.map((link) => (
                <Link key={link.label} to={link.to} className="text-xs text-slate-500 transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
              <div className="flex overflow-hidden rounded-full border border-white/15">
                <button className="bg-bocra-teal px-3 py-1 text-xs font-semibold text-white">EN</button>
                <button className="px-3 py-1 text-xs font-medium text-slate-400 transition-colors hover:text-white">ST</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}