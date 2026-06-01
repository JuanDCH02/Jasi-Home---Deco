import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export const getCategories = async (_req: Request, res: Response) => {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    return res.json(categories)
}

export const createCategory = async (req: Request, res: Response) => {
    const { name } = req.body
    if (!name) { return res.status(400).json({ error: 'Nombre requerido' }); }
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    const category = await prisma.category.create({ data: { name, slug } })
    return res.status(201).json(category)
}

export const deleteCategory = async (req: Request, res: Response) => {
    await prisma.category.delete({ where: { id: Number(req.params.id) } })
    return res.json({ message: 'Categoría eliminada' })
}