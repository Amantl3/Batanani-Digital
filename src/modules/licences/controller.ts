import { Request, Response } from 'express'
import {
  getAllLicences,
  getLicence,
  createLicence,
  updateLicenceStatus,
  deleteLicence,
  getLicenceStats,
  getRecentLicences,
  getPendingLicences,
  getExpiringSoonLicences,
} from './service'

const DEMO_USER_ID = 'demo-user'

function mapLicence(lic: any) {
  return {
    id:            lic.id,
    licenceNumber: lic.id,
    holderName:    lic.companyName ?? 'Unknown',
    category:      lic.type        ?? 'Unknown',
    status:        lic.status      ?? 'unknown',
    region:        lic.region      ?? 'Gaborone',
    issuedAt:      lic.createdAt   ?? null,
    expiresAt:     lic.expiresAt   ?? null,
    conditions:    lic.conditions  ?? {},
    documentUrl:   lic.documentUrl ?? null,
  }
}

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
    res.status(500).json({ success: false, error: error.message })
  }
}

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    if (!status) return res.status(400).json({ success: false, error: 'status is required' })
    const data = await updateLicenceStatus(String(req.params.id), status)
    res.json({ success: true, data: mapLicence(data) })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const licenceStats = async (_req: Request, res: Response) => {
  try {
    const data = await getLicenceStats()
    res.json({
      success: true,
      data: {
        activeLicences:          data.total || 0,
        activeLicencesDelta:     5,
        complaintsYTD:           12,
        complaintsYTDDelta:      -2,
        mobileSubscribers:       2841,
        mobileSubscribersDelta:  156,
      },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const myApplications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id ?? DEMO_USER_ID
    const data = await getAllLicences({ userId, page: 1, limit: 50 })
    res.json({ success: true, data: data.results.map(mapLicence) })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getLicenceById = async (req: Request, res: Response) => {
  try {
    const data = await getLicence(String(req.params.id))
    res.json({ success: true, data: mapLicence(data) })
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message })
  }
}

export const applyForLicence = async (req: Request, res: Response) => {
  try {
    const { type, category, companyName } = req.body
    const licenceType = type || category
    // Use authenticated user if available, fall back to demo user
    const userId = (req as any).user?.id ?? DEMO_USER_ID
    if (!licenceType || !companyName) {
      return res.status(400).json({ success: false, error: 'type and companyName are required' })
    }
    const data = await createLicence({ type: licenceType, companyName, userId })
    const mapped = mapLicence(data)
    res.status(201).json({ success: true, data: mapped, reference: mapped.id })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const removeLicence = async (req: Request, res: Response) => {
  try {
    const data = await deleteLicence(String(req.params.id))
    res.json({ success: true, data })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const recentLicences = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5
    const data  = await getRecentLicences(limit)
    res.json({ success: true, data: data.map(mapLicence) })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const pendingLicences = async (_req: Request, res: Response) => {
  try {
    const data = await getPendingLicences()
    res.json({ success: true, data })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const expiringSoonLicences = async (_req: Request, res: Response) => {
  try {
    const data = await getExpiringSoonLicences()
    res.json({ success: true, data })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}
