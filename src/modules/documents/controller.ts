import { Request, Response } from 'express'
import * as service from './service'

export async function getDocuments(req: Request, res: Response) {
  try {
    const docs = await service.getAllDocuments()
    res.json({ data: docs })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' })
  }
}

export async function getDocument(req: Request, res: Response) {
  try {
    const doc = await service.getDocumentById(req.params.id as string)
    if (!doc) return res.status(404).json({ error: 'Document not found' })
    res.json(doc)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch document' })
  }
}

export async function seed(req: Request, res: Response) {
  try {
    const result = await service.seedDocuments()
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Seed failed' })
  }
}