import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  adminId?: number
}

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(401).json({ error: 'Token requerido' })
    return
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }
    req.adminId = payload.id
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}