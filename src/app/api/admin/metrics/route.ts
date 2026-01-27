import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startOfWeek, subWeeks, format, eachDayOfInterval, isWeekend } from "date-fns";

// GET: Fetch admin dashboard metrics
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!session.user.roles.includes("ADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get current period (this 2-week period)
        const today = new Date();
        const currentPeriodStart = startOfWeek(today, { weekStartsOn: 1 });
        const currentPeriodEnd = new Date(currentPeriodStart);
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 13);

        // Get old period (2 weeks ago)
        const oldPeriodStart = subWeeks(currentPeriodStart, 2);
        const oldPeriodEnd = new Date(oldPeriodStart);
        oldPeriodEnd.setDate(oldPeriodEnd.getDate() + 13);

        // Calculate working days in current period
        const currentPeriodDays = eachDayOfInterval({
            start: currentPeriodStart,
            end: currentPeriodEnd,
        });
        const workingDaysInPeriod = currentPeriodDays.filter(
            (day) => !isWeekend(day)
        ).length;
        const expectedHoursPerPeriod = workingDaysInPeriod * 7;

        // Get all employees
        const employees = await prisma.user.findMany({
            where: {
                roles: { has: "EMPLOYEE" },
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        // Get hours per employee for current period
        const currentPeriodEntries = await prisma.timeEntry.groupBy({
            by: ["userId"],
            where: {
                date: {
                    gte: currentPeriodStart,
                    lte: currentPeriodEnd,
                },
            },
            _sum: {
                hours: true,
            },
        });

        // Get hours per employee for old period
        const oldPeriodEntries = await prisma.timeEntry.groupBy({
            by: ["userId"],
            where: {
                date: {
                    gte: oldPeriodStart,
                    lte: oldPeriodEnd,
                },
            },
            _sum: {
                hours: true,
            },
        });

        // Calculate complete timesheets count
        const completeTimesheetCount = currentPeriodEntries.filter(
            (entry) => (entry._sum.hours || 0) >= expectedHoursPerPeriod
        ).length;

        // Calculate incomplete old timesheets
        const oldHoursMap = new Map(
            oldPeriodEntries.map((e) => [e.userId, e._sum.hours || 0])
        );

        const incompleteOldTimesheets = employees
            .filter((emp) => {
                const hours = oldHoursMap.get(emp.id) || 0;
                return hours < expectedHoursPerPeriod;
            })
            .map((emp) => ({
                userId: emp.id,
                userEmail: emp.email,
                userName: emp.name,
                periodStart: format(oldPeriodStart, "yyyy-MM-dd"),
                periodEnd: format(oldPeriodEnd, "yyyy-MM-dd"),
                hoursLogged: oldHoursMap.get(emp.id) || 0,
                expectedHours: expectedHoursPerPeriod,
            }));

        // Calculate average hours per employee (current period)
        const totalHours = currentPeriodEntries.reduce(
            (sum, entry) => sum + (entry._sum.hours || 0),
            0
        );
        const averageHoursPerEmployee =
            employees.length > 0 ? Math.round(totalHours / employees.length) : 0;

        return NextResponse.json({
            completeTimesheetCount,
            incompleteOldTimesheets,
            averageHoursPerEmployee,
            totalEmployees: employees.length,
            currentPeriod: {
                start: format(currentPeriodStart, "yyyy-MM-dd"),
                end: format(currentPeriodEnd, "yyyy-MM-dd"),
                expectedHours: expectedHoursPerPeriod,
            },
        });
    } catch (error) {
        console.error("Error fetching admin metrics:", error);
        return NextResponse.json(
            { error: "Failed to fetch metrics" },
            { status: 500 }
        );
    }
}
