"use client";

import { useMemo } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import {
    useTimeEntries,
    useUpsertTimeEntry,
    useDeleteTimeEntry,
} from "@/hooks/use-time-entries";
import { useChargeCodes } from "@/hooks/use-charge-codes";
import { HourPicker } from "./hour-picker";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, subDays } from "date-fns";
import { useState } from "react";
import { ChargeCodeOption } from "@/types";

interface DayEntriesProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export function DayEntries({ selectedDate, onDateChange }: DayEntriesProps) {
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

    const { data: entries, isLoading } = useTimeEntries(start, end);
    const { data: chargeCodes } = useChargeCodes();
    const upsertMutation = useUpsertTimeEntry();
    const deleteMutation = useDeleteTimeEntry();

    const [addDialogOpen, setAddDialogOpen] = useState(false);

    // Calculate total hours
    const totalHours = useMemo(() => {
        return entries?.reduce((sum, entry) => sum + entry.hours, 0) || 0;
    }, [entries]);

    // Get charge codes that haven't been used yet
    const availableChargeCodes = useMemo(() => {
        const usedIds = new Set(entries?.map((e) => e.chargeCodeId) || []);
        return chargeCodes?.filter((c) => !usedIds.has(c.id)) || [];
    }, [chargeCodes, entries]);

    const handleHourChange = (chargeCodeId: string, hours: number | null) => {
        if (hours === null) return;

        upsertMutation.mutate({
            chargeCodeId,
            date: format(selectedDate, "yyyy-MM-dd"),
            hours,
        });
    };

    const handleDelete = (entryId: string) => {
        deleteMutation.mutate(entryId);
    };

    const handleAddEntry = (chargeCode: ChargeCodeOption) => {
        upsertMutation.mutate({
            chargeCodeId: chargeCode.id,
            date: format(selectedDate, "yyyy-MM-dd"),
            hours: 1, // Default to 1 hour
        });
        setAddDialogOpen(false);
    };

    const handlePreviousDay = () => {
        onDateChange(subDays(selectedDate, 1));
    };

    const handleNextDay = () => {
        onDateChange(addDays(selectedDate, 1));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Date navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousDay}
                    className="bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-300"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white">
                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Total: {totalHours} hour{totalHours !== 1 ? "s" : ""}
                        {totalHours >= 7 && (
                            <span className="ml-2 text-emerald-400">✓ Complete</span>
                        )}
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextDay}
                    className="bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-300"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Entries list */}
            <div className="space-y-3">
                {entries?.length === 0 ? (
                    <Card className="bg-slate-800/30 border-slate-700">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <p className="mb-4">No time entries for this day</p>
                        </CardContent>
                    </Card>
                ) : (
                    entries?.map((entry) => (
                        <Card
                            key={entry.id}
                            className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-colors"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg text-white">
                                            {entry.chargeCode.code}
                                        </CardTitle>
                                        <CardDescription className="text-slate-400">
                                            {entry.chargeCode.description}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HourPicker
                                            value={entry.hours}
                                            onChange={(hrs) =>
                                                handleHourChange(entry.chargeCodeId, hrs)
                                            }
                                            disabled={upsertMutation.isPending}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => handleDelete(entry.id)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))
                )}

                {/* Add entry button */}
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full border-dashed border-slate-600 bg-slate-800/30 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 py-6"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Time Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                Add Time Entry for {format(selectedDate, "MMM d")}
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[400px] pr-4">
                            {availableChargeCodes.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">
                                    All charge codes have been used for this day
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {availableChargeCodes.map((code) => (
                                        <button
                                            key={code.id}
                                            onClick={() => handleAddEntry(code)}
                                            className={cn(
                                                "w-full p-3 rounded-lg text-left transition-all",
                                                "bg-slate-700/30 hover:bg-slate-700/60 border border-slate-600/50",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            )}
                                        >
                                            <p className="font-medium text-white">{code.code}</p>
                                            <p className="text-sm text-slate-400 mt-0.5">
                                                {code.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Progress indicator */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Daily Progress</span>
                    <span className="text-sm font-medium text-slate-300">
                        {totalHours}/7 hours
                    </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full transition-all duration-300",
                            totalHours >= 7
                                ? "bg-emerald-500"
                                : totalHours >= 4
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                        )}
                        style={{ width: `${Math.min((totalHours / 7) * 100, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
