# Timesheet Application - Development Walkthrough

A responsive Timesheet Application with complex state management, role-based access, and unique UI constraints for time entry.

## Summary

Successfully built a complete Timesheet Application with Next.js 14+, TypeScript, Tailwind CSS, Shadcn UI, TanStack Query, PostgreSQL, Prisma, and NextAuth.js. The production build passes successfully.

## Tech Stack Implemented

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16+ with App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| State Management | TanStack Query |
| Database | PostgreSQL with Prisma ORM |
| Authentication | NextAuth.js |

---

## What Was Built

### 1. Database Schema (Prisma)

[schema.prisma](file:///c:/Users/ASUS/Desktop/Mckinsey/Timesheet%20website/timesheet-app/prisma/schema.prisma)

- **User** model with email, password hash, and roles array (EMPLOYEE, ADMIN)
- **ChargeCode** model with code, description, and isActive flag
- **EmployeeChargeCodeAccess** junction table for future access restrictions
- **TimeEntry** model linking users, charge codes, dates, and hours (1-7)

---

### 2. Authentication System

[NextAuth Config](file:///c:/Users/ASUS/Desktop/Mckinsey/Timesheet%20website/timesheet-app/src/lib/auth.ts)

- Credentials-based authentication with email/password
- Role-based login validation (Admin vs Employee)
- JWT session management with role information
- Protected route middleware at [middleware.ts](file:///c:/Users/ASUS/Desktop/Mckinsey/Timesheet%20website/timesheet-app/src/middleware.ts)

---

### 3. Login Page

[Login Page](file:///c:/Users/ASUS/Desktop/Mckinsey/Timesheet%20website/timesheet-app/src/app/login/page.tsx)

- Beautiful gradient dark theme design
- **"Login as Employee"** - prominent main button
- **"Admin Login"** - small corner button
- Role validation prevents non-admin users from accessing admin area

---

### 4. Employee Interface - 3 Zoom Levels

#### Level 1: Month View (Calendar Heatmap)
[MonthView.tsx](file:///c:/Users/ASUS/Desktop/Mckinsey/Timesheet%20website/timesheet-app/src/components/timesheet/MonthView.tsx)

- Full calendar grid with visual indicators
- Green circles = Complete (7 hours)
- Yellow circles = Partial (1-6 hours)
- Red circles = Empty (0 hours)
- Click any date to drill down to Day View

#### Level 2: 2-Week Grid (Default View)
[TwoWeekGrid.tsx](file:///c:/Users/ASUS/Desktop/Mckinsey/Timesheet%20website/timesheet-app/src/components/timesheet/TwoWeekGrid.tsx)

- Charge codes as rows, dates as columns
- Period picker at the top
- "+" button to add charge codes from modal
- Click any cell to open the hour picker

#### Level 3: Day View (Drill-In)
[DayView.tsx](file:///c:/Users/ASUS/Desktop/Mckinsey/Timesheet%20website/timesheet-app/src/components/timesheet/DayView.tsx)

- Detailed view of all entries for a single date
- Edit/delete capabilities
- Add new entries with charge code selection

---

### 5. No-Typing Hour Input

[HourPicker.tsx](file:///c:/Users/ASUS/Desktop/Mckinsey/Timesheet%20website/timesheet-app/src/components/timesheet/HourPicker.tsx)

- Popover with buttons 1-7
- **No manual typing allowed** - strict requirement
- Click button → saves value → closes popover
- Visual feedback with hover states

---

### 6. Admin Dashboard

[Admin Dashboard](file:///c:/Users/ASUS/Desktop/Mckinsey/Timesheet%20website/timesheet-app/src/app/admin/dashboard/page.tsx)

**Metrics Cards:**
- Complete Timesheets count (users with 7+ hours)
- Old Incomplete Timesheets (>2 weeks old)
- Average Hours per Employee

**Employee Inspection Table:**
[InspectionTable.tsx](file:///c:/Users/ASUS/Desktop/Mckinsey/Timesheet%20website/timesheet-app/src/components/admin/InspectionTable.tsx)
- Browse all employees
- View individual timesheet details
- Status badges (Complete/Incomplete)

---

### 7. API Routes

| Route | Description |
|-------|-------------|
| `/api/auth/[...nextauth]` | Authentication endpoints |
| `/api/time-entries` | CRUD for time entries |
| `/api/charge-codes` | Manage charge codes |
| `/api/admin/metrics` | Dashboard metrics |
| `/api/admin/employees` | Employee list with timesheet status |

---

## Verification

### Build Status: ✅ PASSED

```
> npm run build

✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Build completed successfully!
```

### Development Server

```
> npm run dev

▲ Next.js 16.1.5 (Turbopad)
- Local: http://localhost:3000
✓ Ready in 2.8s
```

---

## Getting Started

1. **Set up PostgreSQL** and create a database
2. **Configure environment variables** in [.env](file:///c:/Users/ASUS/Desktop/Mckinsey/Timesheet%20website/timesheet-app/.env):
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/timesheet"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```
3. **Run migrations**: `npx prisma db push`
4. **Seed data**: `npm run db:seed`
5. **Start dev server**: `npm run dev`

### Test Credentials
- **Employee/Admin**: `admin@company.com` / `password123`
- **Employee only**: `john@company.com` / `password123`
- **Employee only**: `jane@company.com` / `password123`

---

## Project Structure

```
timesheet-app/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── admin/         # Admin pages
│   │   ├── api/           # API routes
│   │   ├── login/         # Login page
│   │   └── timesheet/     # Employee timesheet
│   ├── components/
│   │   ├── admin/         # Admin components
│   │   ├── timesheet/     # Timesheet components
│   │   └── ui/            # Shadcn UI components
│   ├── hooks/             # TanStack Query hooks
│   ├── lib/               # Utilities and auth config
│   └── types/             # TypeScript types
```
