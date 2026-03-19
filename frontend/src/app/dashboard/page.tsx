'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Task {
  id: string
  title: string
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchTasks = useCallback(async (s: string, f: string, p: number) => {
    setLoading(true)
    try {
      const params: any = { page: p, limit: 10 }
      if (f !== 'all') params.status = f
      if (s) params.search = s
      const res = await api.get('/tasks', { params })
      setTasks(res.data.tasks)
      setTotalPages(res.data.pagination.totalPages)
      setTotal(res.data.pagination.total)
    } catch {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { router.push('/login'); return }
    fetchTasks(search, filter, page)
  }, [filter, page])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchTasks(val, filter, 1)
    }, 400)
  }

  const handleFilterChange = (val: string) => {
    setFilter(val)
    setPage(1)
  }

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try { await api.post('/auth/logout', { refreshToken }) } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    router.push('/login')
  }

  const openAddModal = () => {
    setEditTask(null)
    setTaskTitle('')
    setShowModal(true)
  }

  const openEditModal = (task: Task) => {
    setEditTask(task)
    setTaskTitle(task.title)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!taskTitle.trim()) { toast.error('Title cannot be empty'); return }
    setSaving(true)
    try {
      if (editTask) {
        await api.patch(`/tasks/${editTask.id}`, { title: taskTitle })
        toast.success('Task updated!')
      } else {
        await api.post('/tasks', { title: taskTitle })
        toast.success('Task added!')
      }
      setShowModal(false)
      fetchTasks(search, filter, page)
    } catch {
      toast.error('Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted!')
      fetchTasks(search, filter, page)
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await api.post(`/tasks/${id}/toggle`)
      fetchTasks(search, filter, page)
    } catch {
      toast.error('Failed to update task')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Task Manager</h1>
            <p className="text-xs text-gray-400">{total} task{total !== 1 ? 's' : ''} total</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition shadow-sm"
          >
            + Add Task
          </button>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"/>
            <p className="text-sm">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium text-gray-500">
              {search ? `No results for "${search}"` : 'No tasks yet. Add one!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100"
              >
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => handleToggle(task.id)}
                  className="w-5 h-5 accent-blue-600 cursor-pointer flex-shrink-0"
                />
                <span className={`flex-1 text-gray-800 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {task.status}
                </span>
                <button
                  onClick={() => openEditModal(task)}
                  className="text-sm text-blue-500 hover:text-blue-700 font-medium transition flex-shrink-0"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-sm text-red-400 hover:text-red-600 font-medium transition flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border bg-white text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition shadow-sm"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border bg-white text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition shadow-sm"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editTask ? 'Edit Task' : 'New Task'}
            </h2>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="What needs to be done?"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : editTask ? 'Update' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
