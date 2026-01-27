"use client";

import { useMemo } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    addMonths,
    subMonths,
    getDay,
    isWeekend,
} from "date-fns";
import { useTimeEntries } from "@/hooks/use-time-entries";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DateStatus = "complete" | "partial" | "empty";

interface MonthCalendarProps {
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onDateClick: (date: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({
    currentMonth,
    onMonthChange,
    onDateClick,
}: MonthCalendarProps) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const { data: entries, isLoading } = useTimeEntries(monthStart, monthEnd);

    // Build a map of date -> total hours
    const hoursMap = useMemo(() => {
        const map = new Map<string, number>();
        entries?.forEach((entry) => {
            const dateKey = format(entry.date, "yyyy-MM-dd");
            map.set(dateKey, (map.get(dateKey) || 0) + entry.hours);
        });
        return map;
    }, [entries]);

    // Generate calendar days including padding from previous/next months
    const calendarDays = useMemo(() => {
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const startPadding = getDay(monthStart); // 0-6, Sunday = 0

        // Add padding days at the start
        const paddedDays: (Date | null)[] = [];
        for (let i = 0; i < startPadding; i++) {
            paddedDays.push(null);
        }

        return [...paddedDays, ...days];
    }, [monthStart, monthEnd]);

    const getDateStatus = (date: Date): DateStatus => {
        const dateKey = format(date, "yyyy-MM-dd");
        const hours = hoursMap.get(dateKey) || 0;

        if (hours === 7) return "complete";
        if (hours > 0) return "partial";
        return "empty";
    };

    const getStatusColor = (status: DateStatus, isWeekendDay: boolean) => {
        if (isWeekendDay) return "bg-gray-200";
        switch (status) {
            case "complete":
                return "bg-green-500";
            case "partial":
                return "bg-orange-400";
            case "empty":
                return "bg-gray-300";
        }
    };

    const handlePreviousMonth = () => {
        onMonthChange(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        onMonthChange(addMonths(currentMonth, 1));
    };

    const handleCurrentMonth = () => {
        onMonthChange(new Date());
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousMonth}
                    className="border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCurrentMonth}
                        className="border-gray-200 hover:bg-gray-50 text-gray-600"
                    >
                        Today
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextMonth}
                    className="border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">Complete (7 hrs)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-400" />
                    <span className="text-sm text-gray-600">Partial (1-6 hrs)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                    <span className="text-sm text-gray-600">Empty (0 hrs)</span>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day, index) => (
                    <div
                        key={day}
                        className={cn(
                            "text-center text-sm font-medium py-2",
                            index === 0 || index === 6 ? "text-gray-400" : "text-gray-600"
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                    if (!day) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const isWeekendDay = isWeekend(day);
                    const status = getDateStatus(day);
                    const hours = hoursMap.get(format(day, "yyyy-MM-dd")) || 0;

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => !isWeekendDay && onDateClick(day)}
                            disabled={isWeekendDay}
                            className={cn(
                                "aspect-square p-2 rounded-lg transition-all",
                                "flex flex-col items-center justify-center gap-1",
                                isWeekendDay
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                                !isSameMonth(day, currentMonth) && "opacity-30",
                                isToday(day) && !isWeekendDay && "ring-2 ring-blue-500"
                            )}
                        >
                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    isWeekendDay
                                        ? "text-gray-400"
                                        : isToday(day)
                                            ? "text-blue-600"
                                            : "text-gray-700"
                                )}
                            >
                                {format(day, "d")}
                            </span>
                            <div
                                className={cn(
                                    "h-3 w-3 rounded-full transition-all",
                                    getStatusColor(status, isWeekendDay)
                                )}
                                title={isWeekendDay ? "Weekend" : `${hours} hours`}
                            />
                            {!isWeekendDay && hours > 0 && (
                                <span className="text-xs text-gray-500">{hours}h</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
