/**
 * src/modules/licences/controller.ts
 */
import { Request, Response } from 'express'
import {
  getAllLicences,
  getLicenceById,
  createLicence,
  updateLicenceStatus,
  deleteLicence,
  getLicenceStats,
  getLicencesByType,
  getRecentLicences,
  getPendingLicences,
  getExpiringSoonLicences,
  getLicencesIssuedThisMonth,
  verifyLicence,
  getLicenceRenewals,
  getLicenceHistory,
  getLicencesByUser,
  getMostCommonLicenceTypes,
  getSuspendedLicences,
} from './service'

// ── helper: normalise a raw Supabase row to the shape the frontend expects ────
function mapLicence(lic: any) {
  return {
    id:            lic.id,
    licenceNumber: lic.id,
    holderName:    lic.companyName   ?? lic.company_name   ?? 'Unknown',
    category:      lic.type          ?? 'Unknown',
    status:        lic.status        ?? 'unknown',
    issuedAt:      lic.createdAt     ?? lic.created_at     ?? null,
    expiresAt:     lic.expiresAt     ?? lic.expires_at     ?? null,
    conditions:    lic.conditions    ?? {},
    documentUrl:   lic.documentUrl   ?? lic.document_url   ?? null,
  }
}

// ── GET /api/licences ─────────────────────────────────────────────────────────
export const listLicences = async (req: Request, res: Response) => {
  try {
    const { q, category, status, page, limit } = req.query as Record<string, string>
    const data = await getAllLicences({
      search: q,
      type:   category,
      status,
      page:   page  ? Number(page)  : 1,
      limit:  limit ? Number(limit) : 15,
    })

    res.json({
      data:       data.results.map(mapLicence),
      total:      data.total,
      page:       data.page,
      limit:      data.limit,
      totalPages: data.totalPages,
    })
  } catch (error: any) {
    console.error('[listLicences]', error.message, error.stack)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/:id ─────────────────────────────────────────────────────
export const getLicence = async (req: Request, res: Response) => {
  try {
    const id   = String(req.params.id)
    const data = await getLicenceById(id)
    res.json({ success: true, data: mapLicence(data) })
  } catch (error: any) {
    console.error('[getLicence]', error.message)
    res.status(404).json({ success: false, error: error.message })
  }
}

// ── POST /api/licences  (also aliased at POST /api/licences/apply) ────────────
export const applyForLicence = async (req: Request, res: Response) => {
  try {
    // Accept both 'category' (frontend field name) and 'type' (DB field name)
    const { type, category, companyName } = req.body
    const licenceType = type || category

    // userId comes from the JWT via the protect middleware – never trust req.body for this
    const userId = (req as any).user?.id

    if (!licenceType || !companyName) {
      return res.status(400).json({
        success: false,
        error: 'type/category and companyName are required',
      })
    }
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    const data = await createLicence({ type: licenceType, companyName, userId })
    const mapped = mapLicence(data)

    // Return 'reference' at the top level so the frontend onSuccess handler can read data.reference
    res.status(201).json({ success: true, data: mapped, reference: mapped.id })
  } catch (error: any) {
    console.error('[applyForLicence]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── PATCH /api/licences/:id/status ────────────────────────────────────────────
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' })
    }
    const data = await updateLicenceStatus(String(req.params.id), status)
    res.json({ success: true, data: mapLicence(data) })
  } catch (error: any) {
    console.error('[updateStatus]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── DELETE /api/licences/:id ──────────────────────────────────────────────────
export const removeLicence = async (req: Request, res: Response) => {
  try {
    const data = await deleteLicence(String(req.params.id))
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[removeLicence]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/stats ───────────────────────────────────────────────────
export const licenceStats = async (_req: Request, res: Response) => {
  try {
    const data = await getLicenceStats()
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[licenceStats]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/by-type ─────────────────────────────────────────────────
export const licencesByType = async (_req: Request, res: Response) => {
  try {
    const data = await getLicencesByType()
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[licencesByType]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/recent ──────────────────────────────────────────────────
export const recentLicences = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5
    const data  = await getRecentLicences(limit)
    res.json({ success: true, data: data.map(mapLicence) })
  } catch (error: any) {
    console.error('[recentLicences]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/pending ─────────────────────────────────────────────────
export const pendingLicences = async (_req: Request, res: Response) => {
  try {
    const data = await getPendingLicences()
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[pendingLicences]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/expiring-soon ──────────────────────────────────────────
export const expiringSoonLicences = async (_req: Request, res: Response) => {
  try {
    const data = await getExpiringSoonLicences()
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[expiringSoonLicences]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/this-month ──────────────────────────────────────────────
export const licencesThisMonth = async (_req: Request, res: Response) => {
  try {
    const data = await getLicencesIssuedThisMonth()
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[licencesThisMonth]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/:id/verify ──────────────────────────────────────────────
export const verifyLicencePublic = async (req: Request, res: Response) => {
  try {
    const data = await verifyLicence(String(req.params.id))
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[verifyLicencePublic]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/renewals ────────────────────────────────────────────────
export const licenceRenewals = async (_req: Request, res: Response) => {
  try {
    const data = await getLicenceRenewals()
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[licenceRenewals]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/:id/history ─────────────────────────────────────────────
export const licenceHistory = async (req: Request, res: Response) => {
  try {
    const data = await getLicenceHistory(String(req.params.id))
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[licenceHistory]', error.message)
    res.status(404).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/user/:userId ────────────────────────────────────────────
export const licencesByUser = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId)
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' })
    }
    const data = await getLicencesByUser(userId)
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[licencesByUser]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/common-types ────────────────────────────────────────────
export const mostCommonLicenceTypes = async (_req: Request, res: Response) => {
  try {
    const data = await getMostCommonLicenceTypes()
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[mostCommonLicenceTypes]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ── GET /api/licences/suspended ───────────────────────────────────────────────
export const suspendedLicences = async (_req: Request, res: Response) => {
  try {
    const data = await getSuspendedLicences()
    res.json({ success: true, data })
  } catch (error: any) {
    console.error('[suspendedLicences]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}
export const myApplications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    const data = await getAllLicences({ userId, page: 1, limit: 50 })
    res.json({ success: true, data: data.results.map(mapLicence) })
  } catch (error: any) {
    console.error('[myApplications]', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}
