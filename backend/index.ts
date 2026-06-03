import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean) as string[]

const corsOptions = {
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors(corsOptions))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})