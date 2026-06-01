import { Router } from 'express'
import { createOrder, getOrders, updateOrderStatus, getDashboardStats } from '../controllers/order.controller'
import { requireAdmin } from '../middlewares/auth.middleware'

const router = Router()
router.get('/stats',         requireAdmin, getDashboardStats)   // antes de rutas con params
router.get('/',              requireAdmin, getOrders)
router.post('/',             createOrder)                       // público (registro de consulta)
router.patch('/:id/status',  requireAdmin, updateOrderStatus)

export default router
