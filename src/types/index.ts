// Role type matching Prisma schema
type Role = "EMPLOYEE" | "ADMIN";

// Extend the User type for auth
export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    roles: Role[];
}

// Login types
export type LoginType = "employee" | "admin";

export interface LoginCredentials {
    email: string;
    password: string;
    loginType: LoginType;
}

// Time Entry types
export interface TimeEntryInput {
    chargeCodeId: string;
    date: string; // ISO date string
    hours: number; // 1-7
}

export interface TimeEntryWithChargeCode {
    id: string;
    userId: string;
    chargeCodeId: string;
    date: Date;
    hours: number;
    chargeCode: {
        id: string;
        code: string;
        description: string;
    };
}

// Charge Code types
export interface ChargeCodeOption {
    id: string;
    code: string;
    description: string;
    isActive?: boolean;
}

// Grid types for the 2-week view
export interface GridCell {
    chargeCodeId: string;
    date: string;
    hours: number | null;
    entryId?: string;
}

export interface GridRow {
    chargeCode: ChargeCodeOption;
    cells: Record<string, GridCell>; // keyed by date string
}

// Period for 2-week view
export interface TimesheetPeriod {
    startDate: Date;
    endDate: Date;
}

// Admin dashboard metrics
export interface DashboardMetrics {
    completeTimesheetCount: number;
    incompleteOldTimesheets: {
        userId: string;
        userEmail: string;
        userName: string | null;
        periodStart: string;
        periodEnd: string;
        hoursLogged: number;
        expectedHours: number;
    }[];
    averageHoursPerEmployee: number;
    totalEmployees: number;
}

// View modes for the employee interface
export type ViewMode = "month" | "two-week" | "day";

// Date status for calendar heatmap
export type DateStatus = "complete" | "partial" | "empty";

export interface CalendarDay {
    date: Date;
    status: DateStatus;
    totalHours: number;
}
