# Matrix Gym Frontend

React + TypeScript + Vite frontend application for Matrix Gym Management System.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── context/        # React context (Auth)
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities (API client, utils)
│   ├── pages/          # Page components
│   └── types/          # TypeScript types
├── public/             # Static assets
└── package.json
```

## Features

- Modern React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- JWT authentication with refresh tokens
- Role-based access control
- Responsive design

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

