"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ViewSwitcher } from "@/components/timesheet/view-switcher";
import { PeriodPicker, getCurrentPeriod } from "@/components/timesheet/period-picker";
import { TimesheetGrid } from "@/components/timesheet/timesheet-grid";
import { MonthCalendar } from "@/components/timesheet/month-calendar";
import { DayEntries } from "@/components/timesheet/day-entries";
import { ViewMode } from "@/types";

export default function TimesheetPage() {
    // View state
    const [currentView, setCurrentView] = useState<ViewMode>("two-week");

    // Initialize with current semi-monthly period
    const initialPeriod = useMemo(() => getCurrentPeriod(new Date()), []);
    const [periodStart, setPeriodStart] = useState(initialPeriod.start);
    const [periodEnd, setPeriodEnd] = useState(initialPeriod.end);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());

    const handleViewChange = (view: ViewMode) => {
        setCurrentView(view);
    };

    const handlePeriodChange = (start: Date, end: Date) => {
        setPeriodStart(start);
        setPeriodEnd(end);
    };

    const handleDateClick = (date: Date) => {
        setSelectedDay(date);
        setCurrentView("day");
    };

    const handleDayChange = (date: Date) => {
        setSelectedDay(date);
    };

    // Period label for display
    const periodLabel = periodStart.getDate() === 1
        ? `${format(periodStart, "MMM")} 1-15, ${format(periodStart, "yyyy")}`
        : `${format(periodStart, "MMM")} 16-${format(periodEnd, "d")}, ${format(periodEnd, "yyyy")}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Timesheet</h1>
                        <p className="text-gray-500 mt-1">
                            {currentView === "month" && format(currentMonth, "MMMM yyyy")}
                            {currentView === "two-week" && periodLabel}
                            {currentView === "day" && format(selectedDay, "EEEE, MMMM d, yyyy")}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentView === "two-week" && (
                            <PeriodPicker
                                startDate={periodStart}
                                onPeriodChange={handlePeriodChange}
                            />
                        )}
                        <ViewSwitcher
                            currentView={currentView}
                            onViewChange={handleViewChange}
                        />
                    </div>
                </div>

                {/* Content based on view */}
                {currentView === "month" && (
                    <MonthCalendar
                        currentMonth={currentMonth}
                        onMonthChange={setCurrentMonth}
                        onDateClick={handleDateClick}
                    />
                )}

                {currentView === "two-week" && (
                    <TimesheetGrid startDate={periodStart} endDate={periodEnd} />
                )}

                {currentView === "day" && (
                    <DayEntries
                        selectedDate={selectedDay}
                        onDateChange={handleDayChange}
                    />
                )}
            </div>
        </div>
    );
}
