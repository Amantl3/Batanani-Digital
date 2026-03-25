/**
 * src/app.ts
 */
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors    from 'cors'
import helmet  from 'helmet'
import rateLimit from 'express-rate-limit'
import { supabase }         from './config/supabase'

// ── Imports ──────────────────────────────────────────────────────────────────
import dashboardRoutes      from './modules/dashboard/routes'
import licenceRoutes       from './modules/licences/routes'
import complaintRoutes     from './modules/complaints/routes'
import authRoutes          from './modules/auth/routes'
import chatRoutes          from './modules/chat/routes'
import documentRoutes      from './modules/documents/routes' // Added this

const app  = express()
const PORT = process.env.PORT || 3001

// ── Allowed origins ───────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5173',
  'https://batanani-digital-production.up.railway.app',
]

app.use(helmet({ crossOriginResourcePolicy: false }))

// Manual CORS header middleware
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods',     'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers',     'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }))
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ message: 'BOCRA API is running' })
})

// ── Supabase connection test ───────────────────────────────────────────────────
app.get('/api/test-supabase', async (_req, res) => {
  const { data, error } = await supabase.from('Complaint').select('*').limit(1)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, message: 'Supabase connected', data })
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes)
app.use('/api/complaints',  complaintRoutes)
app.use('/api/licences',    licenceRoutes)
app.use('/api/dashboard',   dashboardRoutes)
app.use('/api/chat',        chatRoutes)
app.use('/api/documents',   documentRoutes) // Added this

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app