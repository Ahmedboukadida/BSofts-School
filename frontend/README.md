# BSofts School - Frontend

A modern school management system built with Next.js 16, React 19, and Tailwind CSS.

## Features

- **Landing Page**: Features, pricing, and call-to-action
- **Authentication**: Login and registration
- **Dashboard**: Statistics and quick actions
- **Student Management**: CRUD operations with search
- **Teacher Management**: CRUD operations with search
- **Class Management**: Grid view with details
- **Attendance Tracking**: Daily attendance with statistics
- **Exam Management**: Create and manage exams
- **Payment Management**: Track student payments
- **Reports**: Charts and analytics
- **Settings**: User profile and preferences

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=BSofts School
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Available Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (dashboard)/     # Dashboard pages
│   └── page.tsx         # Landing page
├── components/
│   ├── charts/          # Chart components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── api.ts           # Axios instance
│   └── hooks.ts         # Custom hooks
└── store/
    └── auth-store.ts    # Auth state management
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login page |
| `/register` | Registration page |
| `/dashboard` | Dashboard with statistics |
| `/students` | Student management |
| `/teachers` | Teacher management |
| `/classes` | Class management |
| `/attendance` | Attendance tracking |
| `/exams` | Exam management |
| `/payments` | Payment management |
| `/reports` | Reports and analytics |
| `/settings` | User settings |

## Backend API

This frontend connects to a NestJS backend running on `http://localhost:3001/api`.

See the backend README for API documentation.
