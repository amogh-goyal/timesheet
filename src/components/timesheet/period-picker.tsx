"use client";

import { Button } from "@/components/ui/button";
import { format, addDays, subDays, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PeriodPickerProps {
    startDate: Date;
    onPeriodChange: (startDate: Date) => void;
}

export function PeriodPicker({ startDate, onPeriodChange }: PeriodPickerProps) {
    const endDate = addDays(startDate, 13); // 2-week period

    const handlePrevious = () => {
        onPeriodChange(subDays(startDate, 14));
    };

    const handleNext = () => {
        onPeriodChange(addDays(startDate, 14));
    };

    const handleCurrent = () => {
        // Go to current 2-week period (starting Monday)
        const today = new Date();
        const monday = startOfWeek(today, { weekStartsOn: 1 });
        onPeriodChange(monday);
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-300"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="px-4 py-2 bg-slate-700/30 rounded-lg border border-slate-600 min-w-[220px] text-center">
                <span className="text-slate-200 font-medium">
                    {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                </span>
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-300"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={handleCurrent}
                className="ml-2 bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-300"
            >
                Current
            </Button>
        </div>
    );
}
