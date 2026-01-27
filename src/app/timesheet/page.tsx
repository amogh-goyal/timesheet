"use client";

import { useState } from "react";
import { startOfWeek, format } from "date-fns";
import { ViewSwitcher } from "@/components/timesheet/view-switcher";
import { PeriodPicker } from "@/components/timesheet/period-picker";
import { TimesheetGrid } from "@/components/timesheet/timesheet-grid";
import { MonthCalendar } from "@/components/timesheet/month-calendar";
import { DayEntries } from "@/components/timesheet/day-entries";
import { ViewMode } from "@/types";

export default function TimesheetPage() {
    // View state
    const [currentView, setCurrentView] = useState<ViewMode>("two-week");

    // Date states for different views
    const [twoWeekStart, setTwoWeekStart] = useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());

    const handleViewChange = (view: ViewMode) => {
        setCurrentView(view);
    };

    const handleDateClick = (date: Date) => {
        setSelectedDay(date);
        setCurrentView("day");
    };

    const handleDayChange = (date: Date) => {
        setSelectedDay(date);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Timesheet</h1>
                        <p className="text-slate-400 mt-1">
                            {currentView === "month" && format(currentMonth, "MMMM yyyy")}
                            {currentView === "two-week" &&
                                `${format(twoWeekStart, "MMM d")} - ${format(
                                    new Date(twoWeekStart.getTime() + 13 * 24 * 60 * 60 * 1000),
                                    "MMM d, yyyy"
                                )}`}
                            {currentView === "day" && format(selectedDay, "EEEE, MMMM d, yyyy")}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentView === "two-week" && (
                            <PeriodPicker
                                startDate={twoWeekStart}
                                onPeriodChange={setTwoWeekStart}
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
                    <TimesheetGrid startDate={twoWeekStart} />
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
