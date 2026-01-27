"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface HourPickerProps {
    value: number | null;
    onChange: (hours: number | null) => void;
    disabled?: boolean;
    className?: string;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7] as const;

export function HourPicker({
    value,
    onChange,
    disabled = false,
    className,
}: HourPickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (hours: number) => {
        onChange(hours);
        setOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setOpen(false);
    };

    const getDisplayValue = () => {
        if (value === null || value === undefined) return "—";
        return value.toString();
    };

    const getButtonStyle = () => {
        if (value === null || value === undefined) {
            return "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50";
        }
        if (value === 7) {
            return "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20";
        }
        if (value >= 4) {
            return "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20";
        }
        return "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20";
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    disabled={disabled}
                    className={cn(
                        "h-10 w-14 text-lg font-medium transition-all duration-200",
                        getButtonStyle(),
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                >
                    {getDisplayValue()}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-2 bg-slate-800 border-slate-700"
                align="center"
                sideOffset={4}
            >
                <div className="grid grid-cols-4 gap-1">
                    {HOURS.map((hour) => (
                        <Button
                            key={hour}
                            size="sm"
                            variant={value === hour ? "default" : "outline"}
                            className={cn(
                                "h-9 w-9 text-sm font-medium",
                                value === hour
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                            )}
                            onClick={() => handleSelect(hour)}
                        >
                            {hour}
                        </Button>
                    ))}
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-9 w-9 text-sm font-medium bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        onClick={handleClear}
                    >
                        ✕
                    </Button>
                </div>
                <p className="text-xs text-slate-500 text-center mt-2">
                    Select hours (1-7)
                </p>
            </PopoverContent>
        </Popover>
    );
}
