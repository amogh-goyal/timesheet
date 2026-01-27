"use client";

import { Button } from "@/components/ui/button";
import { ViewMode } from "@/types";
import { Calendar, Grid3X3, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewSwitcherProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

const views: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: "month", label: "Month", icon: <Calendar className="h-4 w-4" /> },
    { id: "two-week", label: "2-Week", icon: <Grid3X3 className="h-4 w-4" /> },
    { id: "day", label: "Day", icon: <CalendarDays className="h-4 w-4" /> },
];

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
    return (
        <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg border border-slate-700">
            {views.map((view) => (
                <Button
                    key={view.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewChange(view.id)}
                    className={cn(
                        "gap-2 transition-all",
                        currentView === view.id
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                    )}
                >
                    {view.icon}
                    <span className="hidden sm:inline">{view.label}</span>
                </Button>
            ))}
        </div>
    );
}
