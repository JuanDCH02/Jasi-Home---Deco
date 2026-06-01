import { Request, Response } from 'express'
import cloudinary from '../lib/cloudinary'

export const uploadImage = async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: 'No se recibió ninguna imagen' })
        return
    }

    try {
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder:         'jasihome/productos',
                    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
                },
                (error, result) => {
                    if (error || !result) reject(error)
                    else resolve(result)
                }
            )
            stream.end(req.file!.buffer)
        })

        res.json({ url: result.secure_url })
    } catch {
        res.status(500).json({ error: 'Error al subir la imagen' })
    }
}