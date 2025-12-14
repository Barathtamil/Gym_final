# Matrix Gym Backend API

Backend API for Matrix Gym Management System built with Node.js, TypeScript, Express, and MySQL.

## Features

- JWT Authentication with Refresh Tokens
- Role-based Access Control (Admin, Staff, Member)
- Winston Logger
- MySQL Database
- RESTful API
- File Upload (Logo)
- Secure Password Hashing (bcrypt)
- Environment Variables (dotenv)

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials and other settings.

4. Run database migrations:
```bash
npm run migrate
```

5. Seed the database with initial data:
```bash
npm run seed
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Members
- `GET /api/v1/members` - Get all members
- `GET /api/v1/members/:id` - Get member by ID
- `GET /api/v1/members/search/:registrationNo` - Get member by registration number
- `POST /api/v1/members` - Create member (Admin/Staff only)
- `PUT /api/v1/members/:id` - Update member (Admin/Staff only)
- `DELETE /api/v1/members/:id` - Deactivate member (Admin only)

### Attendance
- `POST /api/v1/attendance` - Mark attendance
- `GET /api/v1/attendance` - Get attendance list (Admin/Staff only)
- `GET /api/v1/attendance/today` - Get today's attendance count

### Logo
- `POST /api/v1/logo` - Upload logo (Admin only)
- `GET /api/v1/logo` - Get active logo

## Database Schema

The database includes the following tables:
- users
- branches
- plans
- plan_branches
- members
- attendance
- payment_members
- expenses
- enquiries
- refresh_tokens
- logo_settings

## Default Credentials

After seeding:
- Admin: `admin` / `admin123`
- Staff: `staff` / `staff123`
- Member: `member` / `member123`

## Security

- JWT tokens with expiration
- Refresh token rotation
- Password hashing with bcrypt
- Rate limiting
- Helmet for security headers
- CORS configuration

## Logging

Logs are stored in the `logs/` directory:
- `app.log` - All logs
- `error.log` - Error logs only

## Environment Variables

See `.env.example` for all available environment variables.

