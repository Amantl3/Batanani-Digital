import { Router } from 'express'
import { getDocuments, getDocument, seed } from './controller'

const router = Router()

router.get('/',        getDocuments)
router.get('/seed',    seed)
router.get('/:id',     getDocument)

export default router