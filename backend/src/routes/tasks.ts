import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { getTasks, createTask, getTask, updateTask, deleteTask, toggleTask } from '../controllers/task.controller'

const router = Router()

router.use(authenticate)

router.get('/', getTasks)
router.post('/', createTask)
router.get('/:id', getTask)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)
router.post('/:id/toggle', toggleTask)

export default router