import { Router } from 'express'
import { getProducts, getProduct, getAllProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller'
import { requireAdmin } from '../middlewares/auth.middleware'

const router = Router()
router.get('/',            getProducts)
router.get('/admin/all',   requireAdmin, getAllProducts)   // antes de /:slug
router.get('/:slug',       getProduct)
router.post('/',           requireAdmin, createProduct)
router.put('/:id',         requireAdmin, updateProduct)
router.delete('/:id',      requireAdmin, deleteProduct)

export default router