# Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL** (v8.0 or higher)
3. **npm** or **yarn**

## Step-by-Step Setup

### 1. Database Setup

1. Start MySQL server
2. Create a database (or use existing):
```sql
CREATE DATABASE matrix_gym;
```

### 2. Backend Setup

```bash
cd backend
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=matrix_gym
```

5. Run database migrations:
```bash
npm run migrate
```

6. Seed the database:
```bash
npm run seed
```

7. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` if needed:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

4. Start frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:8080`

## Default Login Credentials

After seeding the database:
- **Admin**: `admin` / `admin123`
- **Staff**: `staff` / `staff123`
- **Member**: `member` / `member123`

## Project Structure

```
Gym_final/
├── backend/
│   ├── src/
│   │   ├── config/        # Database, JWT config
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth, error handling
│   │   ├── models/        # Data models (if needed)
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utilities (logger)
│   │   └── server.ts      # Main server file
│   ├── database/
│   │   ├── migrations/    # SQL migrations
│   │   └── seed.ts       # Seed script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   ├── lib/          # Utilities (API client)
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript types
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Members
- `GET /api/v1/members` - Get all members
- `GET /api/v1/members/:id` - Get member by ID
- `GET /api/v1/members/search/:registrationNo` - Search by registration
- `POST /api/v1/members` - Create member
- `PUT /api/v1/members/:id` - Update member
- `DELETE /api/v1/members/:id` - Deactivate member

### Attendance
- `POST /api/v1/attendance` - Mark attendance
- `GET /api/v1/attendance` - Get attendance list
- `GET /api/v1/attendance/today` - Get today's count

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard statistics

### Logo
- `POST /api/v1/logo` - Upload logo (Admin only)
- `GET /api/v1/logo` - Get active logo

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### Port Already in Use
- Change `PORT` in backend `.env`
- Change port in `vite.config.ts` for frontend

### CORS Issues
- Update `CORS_ORIGIN` in backend `.env` to match frontend URL

## Development Tips

1. Backend logs are in `backend/logs/`
2. Use `npm run dev` for hot reload in development
3. Check browser console for frontend errors
4. Check backend logs for API errors

