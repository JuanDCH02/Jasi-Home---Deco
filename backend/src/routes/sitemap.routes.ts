import { Router } from 'express'
import { getSitemap } from '../controllers/sitemap.controller'

const router = Router()
router.get('/sitemap.xml', getSitemap)

export default router
