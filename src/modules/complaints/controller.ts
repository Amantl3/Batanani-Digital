import { Request, Response } from 'express'
import * as service from './service'

function mapComplaint(c: any) {
  return {
    id:          c.id,
    refNumber:   c.refNumber || c.id.slice(0, 8),
    category:    c.category  || 'General',
    provider:    c.provider  || 'Unknown',
    region:      c.region    || 'Gaborone',
    status:      c.status    || 'pending',
    createdAt:   c.createdAt,
    description: c.description,
  }
}

export const listComplaints = async (req: Request, res: Response) => {
  try {
    const { q, category, status, page, limit } = req.query as any
    const data = await service.getAllComplaints({
      search:   q as string,
      category: category as string,
      status:   status as string,
      page:     page  ? Number(page)  : 1,
      limit:    limit ? Number(limit) : 1000,
    })
    res.json({
      success: true,
      data:    data.results.map(mapComplaint),
      total:   data.total,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const createComplaint = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id ?? null
    console.log('COMPLAINT BODY:', req.body)
    const data = await service.createComplaint({ ...req.body, userId })
    res.status(201).json({ success: true, data: mapComplaint(data) })
  } catch (error: any) {
    console.error('COMPLAINT CREATE ERROR:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const data = await service.updateComplaintStatus(String(req.params.id), req.body.status)
    res.json({ success: true, data: mapComplaint(data) })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const complaintStats = async (_req: Request, res: Response) => {
  try {
    const data = await service.getComplaintStats()
    res.json({ success: true, data })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getComplaint = async (req: Request, res: Response) => {
  try {
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const trackComplaintByRef = async (req: Request, res: Response) => {
  try {
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const complaintsByCategory = async (req: Request, res: Response) => {
  try {
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const complaintsByProvider = async (req: Request, res: Response) => {
  try {
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const recentComplaints = async (req: Request, res: Response) => {
  try {
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const getMyComplaints = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id ?? undefined
    const data = await service.getAllComplaints({ userId, page: 1, limit: 50 })
    res.json({ success: true, data: data.results.map(mapComplaint) })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}
