"use client";

import { useMemo } from "react";
import { format, startOfDay, endOfDay, isWeekend } from "date-fns";
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
    const isWeekendDay = isWeekend(selectedDate);

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
        if (hours === null) {
            // Find entry and delete it
            const entry = entries?.find((e) => e.chargeCodeId === chargeCodeId);
            if (entry) {
                deleteMutation.mutate({ id: entry.id });
            }
            return;
        }

        upsertMutation.mutate({
            chargeCodeId,
            date: format(selectedDate, "yyyy-MM-dd"),
            hours,
        });
    };

    const handleDelete = (entryId: string) => {
        deleteMutation.mutate({ id: entryId });
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

    // Calculate max allowed hours for hour picker
    const getMaxHoursForEntry = (currentHours: number) => {
        return 7 - totalHours + currentHours;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                    className="border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {isWeekendDay ? (
                            <span className="text-gray-400">Weekend - No entries allowed</span>
                        ) : (
                            <>
                                Total: {totalHours} hour{totalHours !== 1 ? "s" : ""}
                                {totalHours === 7 && (
                                    <span className="ml-2 text-green-600">✓ Complete</span>
                                )}
                            </>
                        )}
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextDay}
                    className="border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Weekend message or entries */}
            {isWeekendDay ? (
                <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <p>Time entries are not allowed on weekends</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Entries list */}
                    <div className="space-y-3">
                        {entries?.length === 0 ? (
                            <Card className="bg-white border-gray-200">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <p className="mb-4">No time entries for this day</p>
                                </CardContent>
                            </Card>
                        ) : (
                            entries?.map((entry) => (
                                <Card
                                    key={entry.id}
                                    className="bg-white border-gray-200 hover:shadow-sm transition-shadow"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg text-gray-900">
                                                    {entry.chargeCode.code}
                                                </CardTitle>
                                                <CardDescription className="text-gray-500">
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
                                                    maxHours={getMaxHoursForEntry(entry.hours)}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50"
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
                                    className="w-full border-dashed border-gray-300 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 py-6"
                                    disabled={totalHours >= 7}
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    {totalHours >= 7 ? "Daily limit reached" : "Add Time Entry"}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white border-gray-200">
                                <DialogHeader>
                                    <DialogTitle className="text-gray-900">
                                        Add Time Entry for {format(selectedDate, "MMM d")}
                                    </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[400px] pr-4">
                                    {availableChargeCodes.length === 0 ? (
                                        <p className="text-center text-gray-400 py-8">
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
                                                        "bg-gray-50 hover:bg-gray-100 border border-gray-200",
                                                        "focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    )}
                                                >
                                                    <p className="font-medium text-gray-900">{code.code}</p>
                                                    <p className="text-sm text-gray-500 mt-0.5">
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
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Daily Progress</span>
                            <span className="text-sm font-medium text-gray-700">
                                {totalHours}/7 hours
                            </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all duration-300",
                                    totalHours === 7
                                        ? "bg-green-500"
                                        : totalHours > 0
                                            ? "bg-orange-400"
                                            : "bg-gray-300"
                                )}
                                style={{ width: `${Math.min((totalHours / 7) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
