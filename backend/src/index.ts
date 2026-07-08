import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes    from './routes/auth.routes'
import productRoutes from './routes/product.routes'
import categoryRoutes from './routes/category.routes'
import contactRoutes from './routes/contact.routes'
import uploadRoutes from './routes/upload.routes'
import orderRoutes from './routes/order.routes'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth',       authRoutes)
app.use('/api/products',   productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/contact',    contactRoutes)
app.use('/api/upload',      uploadRoutes)
app.use('/api/orders',     orderRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(process.env.PORT || 3000, () => {
  console.log( `🚀 Server running on http://localhost:${process.env.PORT || 3000}` )
})