# Timesheet Application

A responsive Timesheet Application built with Next.js 14+, featuring complex state management, role-based access control, and a unique "no-typing" UI for time entry.

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: TanStack Query (React Query)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Auth.js v5)

## Features

### Employee Interface
- **3-Level Zoom Views**:
  - **Month View**: Calendar heatmap with color-coded status
  - **2-Week Grid**: Default view with charge codes × dates
  - **Day View**: Detailed single-day entry management

- **No-Typing Hour Input**: Click-based popover with buttons 1-7

### Admin Interface
- **Dashboard Metrics**:
  - Complete timesheet count
  - Old incomplete timesheets (flagged)
  - Average hours per employee
- **Employee Inspection**: Browse and view individual timesheets

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL) or a PostgreSQL database

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Database

Using Docker:
```bash
docker-compose up -d
```

Or connect to an existing PostgreSQL database by updating `.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### 3. Set Up the Database

```bash
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@example.com | password123 |
| Admin | admin@example.com | password123 |
| Both | super@example.com | password123 |

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/        # Login page
│   ├── admin/               # Admin dashboard & employee inspection
│   ├── timesheet/           # Employee timesheet views
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── timesheet/           # Timesheet-specific components
│   └── admin/               # Admin-specific components
├── hooks/                   # TanStack Query hooks
├── lib/                     # Utilities (auth, prisma, utils)
├── providers/               # React context providers
└── types/                   # TypeScript types
```

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run type-check` | TypeScript type checking |
| `npm run lint` | Run ESLint |

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/timesheet_db"

# NextAuth
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secure AUTH_SECRET:
```bash
openssl rand -base64 32
```

## License

MIT
