import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Task API is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})