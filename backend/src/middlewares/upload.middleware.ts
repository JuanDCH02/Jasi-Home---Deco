import multer from 'multer'

// Guardamos en memoria — Cloudinary recibe el buffer directo
const storage = multer.memoryStorage()

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máx
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp']
        if (allowed.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'))
        }
    },
})