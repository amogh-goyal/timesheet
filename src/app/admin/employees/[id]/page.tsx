"use client";

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { startOfWeek, addDays, format, isWeekend, isToday } from "date-fns";
import { useTimeEntries } from "@/hooks/use-time-entries";
import { PeriodPicker } from "@/components/timesheet/period-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Employee {
    id: string;
    email: string;
    name: string | null;
    roles: string[];
}

async function fetchEmployee(id: string): Promise<Employee> {
    const response = await fetch(`/api/admin/employees?search=${id}`);
    if (!response.ok) throw new Error("Failed to fetch employee");
    const employees = await response.json();
    return employees.find((e: Employee) => e.id === id);
}

export default function EmployeeInspectionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [periodStart, setPeriodStart] = useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );

    const periodEnd = addDays(periodStart, 13);

    const { data: employee, isLoading: employeeLoading } = useQuery({
        queryKey: ["employee", id],
        queryFn: () => fetchEmployee(id),
    });

    const { data: entries, isLoading: entriesLoading } = useTimeEntries(
        periodStart,
        periodEnd,
        id
    );

    // Generate dates
    const dates = Array.from({ length: 14 }, (_, i) => addDays(periodStart, i));

    // Build entry map
    const entryMap = new Map<string, number>();
    entries?.forEach((entry) => {
        const key = `${entry.chargeCodeId}-${format(entry.date, "yyyy-MM-dd")}`;
        entryMap.set(key, entry.hours);
    });

    // Get unique charge codes from entries
    const chargeCodes = Array.from(
        new Map(
            entries?.map((e) => [
                e.chargeCodeId,
                { id: e.chargeCodeId, code: e.chargeCode.code, description: e.chargeCode.description },
            ]) || []
        ).values()
    );

    // Calculate totals
    const getRowTotal = (chargeCodeId: string) => {
        let total = 0;
        dates.forEach((date) => {
            const key = `${chargeCodeId}-${format(date, "yyyy-MM-dd")}`;
            total += entryMap.get(key) || 0;
        });
        return total;
    };

    const getColumnTotal = (date: Date) => {
        let total = 0;
        chargeCodes.forEach((code) => {
            const key = `${code.id}-${format(date, "yyyy-MM-dd")}`;
            total += entryMap.get(key) || 0;
        });
        return total;
    };

    const grandTotal = chargeCodes.reduce(
        (sum, code) => sum + getRowTotal(code.id),
        0
    );

    if (employeeLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="text-slate-400 hover:text-white"
                        >
                            <Link href="/admin/dashboard">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-white">
                            {employee?.name || employee?.email}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 ml-11">
                        <span className="text-slate-400">{employee?.email}</span>
                        {employee?.roles.map((role) => (
                            <Badge
                                key={role}
                                variant="outline"
                                className={
                                    role === "ADMIN"
                                        ? "border-purple-500/50 text-purple-400"
                                        : "border-blue-500/50 text-blue-400"
                                }
                            >
                                {role}
                            </Badge>
                        ))}
                    </div>
                </div>
                <PeriodPicker startDate={periodStart} onPeriodChange={setPeriodStart} />
            </div>

            {/* Timesheet grid (read-only) */}
            <div className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
                {entriesLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : chargeCodes.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-slate-500">
                        No time entries for this period
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="min-w-[900px]">
                            {/* Header */}
                            <div className="flex border-b border-slate-700 bg-slate-800/50">
                                <div className="w-48 shrink-0 p-3 font-medium text-slate-300 border-r border-slate-700">
                                    Charge Code
                                </div>
                                {dates.map((date) => (
                                    <div
                                        key={date.toISOString()}
                                        className={cn(
                                            "w-16 shrink-0 p-2 text-center border-r border-slate-700/50",
                                            isWeekend(date) && "bg-slate-700/30",
                                            isToday(date) && "bg-blue-600/20"
                                        )}
                                    >
                                        <div className="text-xs text-slate-500">
                                            {format(date, "EEE")}
                                        </div>
                                        <div
                                            className={cn(
                                                "text-sm font-medium",
                                                isToday(date) ? "text-blue-400" : "text-slate-300"
                                            )}
                                        >
                                            {format(date, "d")}
                                        </div>
                                    </div>
                                ))}
                                <div className="w-16 shrink-0 p-2 text-center bg-slate-700/30">
                                    <div className="text-xs text-slate-500">Total</div>
                                </div>
                            </div>

                            {/* Rows */}
                            {chargeCodes.map((code) => (
                                <div
                                    key={code.id}
                                    className="flex border-b border-slate-700/50"
                                >
                                    <div className="w-48 shrink-0 p-3 border-r border-slate-700">
                                        <p className="font-medium text-slate-200">{code.code}</p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {code.description}
                                        </p>
                                    </div>
                                    {dates.map((date) => {
                                        const key = `${code.id}-${format(date, "yyyy-MM-dd")}`;
                                        const hours = entryMap.get(key);
                                        return (
                                            <div
                                                key={date.toISOString()}
                                                className={cn(
                                                    "w-16 shrink-0 flex items-center justify-center border-r border-slate-700/30",
                                                    isWeekend(date) && "bg-slate-700/20"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "text-sm font-medium",
                                                        hours === 7
                                                            ? "text-emerald-400"
                                                            : hours
                                                                ? "text-blue-400"
                                                                : "text-slate-600"
                                                    )}
                                                >
                                                    {hours || "—"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div className="w-16 shrink-0 flex items-center justify-center bg-slate-700/20">
                                        <span
                                            className={cn(
                                                "text-sm font-medium",
                                                getRowTotal(code.id) > 0
                                                    ? "text-emerald-400"
                                                    : "text-slate-500"
                                            )}
                                        >
                                            {getRowTotal(code.id) || "—"}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Footer */}
                            <div className="flex bg-slate-800/50">
                                <div className="w-48 shrink-0 p-3 font-medium text-slate-300 border-r border-slate-700">
                                    Daily Total
                                </div>
                                {dates.map((date) => {
                                    const total = getColumnTotal(date);
                                    return (
                                        <div
                                            key={date.toISOString()}
                                            className={cn(
                                                "w-16 shrink-0 p-2 flex items-center justify-center border-r border-slate-700/30",
                                                isWeekend(date) && "bg-slate-700/30"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "text-sm font-medium",
                                                    total === 7
                                                        ? "text-emerald-400"
                                                        : total > 0
                                                            ? "text-amber-400"
                                                            : "text-slate-500"
                                                )}
                                            >
                                                {total || "—"}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div className="w-16 shrink-0 p-2 flex items-center justify-center bg-slate-700/30">
                                    <span className="text-sm font-bold text-blue-400">
                                        {grandTotal}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
