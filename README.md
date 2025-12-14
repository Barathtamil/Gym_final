# Matrix Gym Management System

A comprehensive gym management system with separate frontend and backend applications.

## Project Structure

```
Gym_final/
├── frontend/          # React + TypeScript + Vite frontend
├── backend/          # Node.js + TypeScript + Express backend
└── README.md
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials

5. Run migrations:
```bash
npm run migrate
```

6. Seed database:
```bash
npm run seed
```

7. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:8080`

## Features

### Frontend
- Modern React UI with Tailwind CSS
- Role-based routing
- Responsive design
- Beautiful login and attendance pages

### Backend
- RESTful API
- JWT Authentication with Refresh Tokens
- MySQL Database
- Winston Logger
- File Upload Support
- Role-based Access Control

## Default Login Credentials

- **Admin**: `admin` / `admin123`
- **Staff**: `staff` / `staff123`
- **Member**: `member` / `member123`

## API Documentation

See `backend/README.md` for detailed API documentation.

## Technologies

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- React Hook Form
- Zod

### Backend
- Node.js
- Express
- TypeScript
- MySQL
- JWT
- Winston
- bcrypt
- Multer

## License

ISC
