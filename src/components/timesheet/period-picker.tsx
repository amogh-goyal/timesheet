"use client";

import { Button } from "@/components/ui/button";
import { format, endOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PeriodPickerProps {
    startDate: Date;
    onPeriodChange: (startDate: Date, endDate: Date) => void;
}

/**
 * Get the current semi-monthly period for a given date
 * Period 1: 1st to 15th
 * Period 2: 16th to end of month
 */
export function getCurrentPeriod(date: Date): { start: Date; end: Date } {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    if (day <= 15) {
        // First half: 1st to 15th
        return {
            start: new Date(year, month, 1),
            end: new Date(year, month, 15),
        };
    } else {
        // Second half: 16th to end of month
        return {
            start: new Date(year, month, 16),
            end: endOfMonth(new Date(year, month, 1)),
        };
    }
}

/**
 * Get the previous semi-monthly period
 */
export function getPreviousPeriod(currentStart: Date): { start: Date; end: Date } {
    const year = currentStart.getFullYear();
    const month = currentStart.getMonth();
    const day = currentStart.getDate();

    if (day === 1) {
        // Currently on 1st-15th, go to previous month's 16th-end
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        return {
            start: new Date(prevYear, prevMonth, 16),
            end: endOfMonth(new Date(prevYear, prevMonth, 1)),
        };
    } else {
        // Currently on 16th-end, go to same month's 1st-15th
        return {
            start: new Date(year, month, 1),
            end: new Date(year, month, 15),
        };
    }
}

/**
 * Get the next semi-monthly period
 */
export function getNextPeriod(currentStart: Date): { start: Date; end: Date } {
    const year = currentStart.getFullYear();
    const month = currentStart.getMonth();
    const day = currentStart.getDate();

    if (day === 1) {
        // Currently on 1st-15th, go to same month's 16th-end
        return {
            start: new Date(year, month, 16),
            end: endOfMonth(new Date(year, month, 1)),
        };
    } else {
        // Currently on 16th-end, go to next month's 1st-15th
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        return {
            start: new Date(nextYear, nextMonth, 1),
            end: new Date(nextYear, nextMonth, 15),
        };
    }
}

export function PeriodPicker({ startDate, onPeriodChange }: PeriodPickerProps) {
    const currentPeriod = getCurrentPeriod(startDate);
    const endDate = currentPeriod.end;

    const handlePrevious = () => {
        const prev = getPreviousPeriod(startDate);
        onPeriodChange(prev.start, prev.end);
    };

    const handleNext = () => {
        const next = getNextPeriod(startDate);
        onPeriodChange(next.start, next.end);
    };

    const handleCurrent = () => {
        const current = getCurrentPeriod(new Date());
        onPeriodChange(current.start, current.end);
    };

    // Determine period label (1st half or 2nd half)
    const periodLabel = startDate.getDate() === 1 ? "1st - 15th" : "16th - " + format(endDate, "d");

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="border-gray-200 hover:bg-gray-50 text-gray-600"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 min-w-[220px] text-center">
                <span className="text-gray-700 font-medium">
                    {format(startDate, "MMMM yyyy")} ({periodLabel})
                </span>
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="border-gray-200 hover:bg-gray-50 text-gray-600"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={handleCurrent}
                className="ml-2 border-gray-200 hover:bg-gray-50 text-gray-600"
            >
                Current
            </Button>
        </div>
    );
}
