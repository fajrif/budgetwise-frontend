# BudgetWise Frontend

Frontend aplikasi BudgetWise menggunakan Vite + React + Tailwind CSS

## Requirements

- Node.js >= 18
- Backend API (Golang + PostgreSQL) running di `http://localhost:8080`

## Installation & Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dan sesuaikan VITE_API_BASE_URL

# Run development server
npm run dev

# Build for production
npm run build
```

# BudgetWise - Budget Management System

Sistem manajemen anggaran dan monitoring proyek dengan Golang (Fiber) backend + PostgreSQL + React (Vite) frontend.

## 🚀 Tech Stack

### Backend
- **Golang** - Programming language
- **Fiber** - Web framework
- **PostgreSQL** - Database
- **GORM** - ORM
- **JWT** - Authentication

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Router** - Routing
- **Recharts** - Charts
- **date-fns** - Date utilities
- **Axios** - HTTP client

## 📋 Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:
- Go 1.21 atau lebih tinggi
- PostgreSQL 15 atau lebih tinggi
- Node.js 18 atau lebih tinggi
- npm atau yarn

## 🔧 Setup Backend

1. **Clone repository**
```bash
git clone <repository-url>
cd budgetwise-backend
```

### Default Credentials
Admin: admin@budgetwise.com / admin123
User: user@budgetwise.com / user123
