# Task Management System

A full-stack Task Management System built with Node.js, TypeScript, Next.js, and SQLite.

## Tech Stack

**Backend**
- Node.js + Express
- TypeScript
- Prisma ORM + SQLite
- JWT Authentication (Access + Refresh Tokens)
- bcrypt password hashing

**Frontend**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Axios with automatic token refresh
- react-hot-toast notifications

## Features

- User registration and login
- JWT-based authentication with access and refresh tokens
- Create, view, edit, delete tasks
- Toggle task status (pending / completed)
- Search tasks by title
- Filter tasks by status
- Pagination
- Responsive design

## Project Structure
```
task-management/
├── backend/          # Node.js REST API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── index.ts
│   └── prisma/
│       └── schema.prisma
└── frontend/         # Next.js web app
    └── src/
        ├── app/
        │   ├── login/
        │   ├── register/
        │   └── dashboard/
        ├── context/
        └── lib/
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login and get tokens |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout and invalidate token |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | Get all tasks (pagination, filter, search) |
| POST | /tasks | Create a new task |
| GET | /tasks/:id | Get a single task |
| PATCH | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |
| POST | /tasks/:id/toggle | Toggle task status |

## Getting Started

### Prerequisites
- Node.js v20+
- npm

### Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

Add a `.env` file in the backend folder:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"
PORT=5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Add a `.env.local` file in the frontend folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.