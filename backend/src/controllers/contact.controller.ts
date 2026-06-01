import { Request, Response } from 'express'

export const sendContact = async (req: Request, res: Response) => {
    const { name, email, message, phone } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' })
    }
    // Por ahora solo logueamos — después conectamos email (nodemailer/resend)
    console.log('📩 Nueva consulta:', { name, email, phone, message })
    res.json({ message: 'Consulta recibida, te contactamos pronto' })
}