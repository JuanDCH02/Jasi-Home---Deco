import { Router } from 'express'
import { upload }       from '../middlewares/upload.middleware'
import { uploadImage }  from '../controllers/upload.controller'
import { requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

router.post('/', requireAdmin, upload.single('image'), uploadImage)

export default router