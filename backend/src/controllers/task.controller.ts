import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!
    const { page = '1', limit = '10', status, search } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = { userId }
    if (status) where.status = status
    if (search) where.title = { contains: search as string }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.task.count({ where })
    ])

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title } = req.body
    if (!title) {
      res.status(400).json({ error: 'Title is required' })
      return
    }

    const task = await prisma.task.create({
      data: { title, userId: req.userId! }
    })

    res.status(201).json(task)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId! }
    })

    if (!task) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    res.json(task)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId! }
    })

    if (!task) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    const updated = await prisma.task.update({
      where: { id },
      data: req.body
    })

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId! }
    })

    if (!task) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    await prisma.task.delete({ where: { id } })
    res.json({ message: 'Task deleted' })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const toggleTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const task = await prisma.task.findFirst({
      where: { id, userId: req.userId! }
    })

    if (!task) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status: task.status === 'pending' ? 'completed' : 'pending' }
    })

    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}