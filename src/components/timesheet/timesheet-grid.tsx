"use client";

import { useMemo, useState } from "react";
import { format, addDays, isWeekend, isToday, differenceInDays } from "date-fns";
import { useTimeEntries, useUpsertTimeEntry, useDeleteTimeEntry } from "@/hooks/use-time-entries";
import { HourPicker } from "./hour-picker";
import { ChargeCodeModal } from "./charge-code-modal";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChargeCodeOption } from "@/types";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimesheetGridProps {
    startDate: Date;
    endDate?: Date;
}

export function TimesheetGrid({ startDate, endDate: propEndDate }: TimesheetGridProps) {
    // If endDate not provided, default to 14 days (for backwards compatibility)
    const endDate = propEndDate || addDays(startDate, 13);
    const { data: entries, isLoading } = useTimeEntries(startDate, endDate);
    const upsertMutation = useUpsertTimeEntry();
    const deleteMutation = useDeleteTimeEntry();

    // Track which charge codes the user has added to their grid
    const [selectedChargeCodes, setSelectedChargeCodes] = useState<
        ChargeCodeOption[]
    >([]);

    // State for deletion confirmation dialog
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        chargeCode: ChargeCodeOption | null;
        hoursToDelete: number;
    }>({ isOpen: false, chargeCode: null, hoursToDelete: 0 });

    // Generate dates for the period (dynamic based on start and end dates)
    const dates = useMemo(() => {
        const result: Date[] = [];
        const numDays = differenceInDays(endDate, startDate) + 1;
        for (let i = 0; i < numDays; i++) {
            result.push(addDays(startDate, i));
        }
        return result;
    }, [startDate, endDate]);

    // Build grid data from entries
    const gridData = useMemo(() => {
        const entryMap = new Map<string, number>();
        const entryIdMap = new Map<string, string>();
        const codeSet = new Set<string>();

        entries?.forEach((entry) => {
            const key = `${entry.chargeCodeId}-${format(entry.date, "yyyy-MM-dd")}`;
            entryMap.set(key, entry.hours);
            entryIdMap.set(key, entry.id);
            codeSet.add(entry.chargeCodeId);

            // Auto-add charge codes that have entries
            if (!selectedChargeCodes.find((c) => c.id === entry.chargeCodeId)) {
                setSelectedChargeCodes((prev) => {
                    if (prev.find((c) => c.id === entry.chargeCodeId)) return prev;
                    return [...prev, entry.chargeCode];
                });
            }
        });

        return { entryMap, entryIdMap };
    }, [entries, selectedChargeCodes]);

    // Calculate daily totals
    const getDailyTotal = (date: Date) => {
        let total = 0;
        selectedChargeCodes.forEach((code) => {
            const key = `${code.id}-${format(date, "yyyy-MM-dd")}`;
            total += gridData.entryMap.get(key) || 0;
        });
        return total;
    };

    const handleHourChange = (
        chargeCodeId: string,
        date: Date,
        hours: number | null
    ) => {
        const key = `${chargeCodeId}-${format(date, "yyyy-MM-dd")}`;
        const entryId = gridData.entryIdMap.get(key);

        if (hours === null) {
            // Delete the entry
            if (entryId) {
                deleteMutation.mutate({ id: entryId });
            }
            return;
        }

        upsertMutation.mutate({
            chargeCodeId,
            date: format(date, "yyyy-MM-dd"),
            hours,
        });
    };

    const handleAddChargeCode = (chargeCode: ChargeCodeOption) => {
        setSelectedChargeCodes((prev) => [...prev, chargeCode]);
    };

    const handleRemoveChargeCode = (chargeCodeId: string) => {
        const chargeCode = selectedChargeCodes.find((c) => c.id === chargeCodeId);
        if (!chargeCode) return;

        // Calculate hours for this charge code in the current period
        let hoursInPeriod = 0;
        dates.forEach((date) => {
            const key = `${chargeCodeId}-${format(date, "yyyy-MM-dd")}`;
            hoursInPeriod += gridData.entryMap.get(key) || 0;
        });

        if (hoursInPeriod > 0) {
            // Show confirmation dialog
            setDeleteConfirmation({
                isOpen: true,
                chargeCode,
                hoursToDelete: hoursInPeriod,
            });
        } else {
            // No data, just remove
            setSelectedChargeCodes((prev) =>
                prev.filter((c) => c.id !== chargeCodeId)
            );
        }
    };

    const confirmDeleteChargeCode = async () => {
        if (!deleteConfirmation.chargeCode) return;

        const chargeCodeId = deleteConfirmation.chargeCode.id;

        // Delete all entries for this charge code in the current period
        const entriesToDelete: string[] = [];
        dates.forEach((date) => {
            const key = `${chargeCodeId}-${format(date, "yyyy-MM-dd")}`;
            const entryId = gridData.entryIdMap.get(key);
            if (entryId) {
                entriesToDelete.push(entryId);
            }
        });

        // Delete each entry
        for (const entryId of entriesToDelete) {
            await deleteMutation.mutateAsync({ id: entryId });
        }

        // Remove from selected
        setSelectedChargeCodes((prev) =>
            prev.filter((c) => c.id !== chargeCodeId)
        );

        setDeleteConfirmation({ isOpen: false, chargeCode: null, hoursToDelete: 0 });
    };

    // Calculate row totals
    const getRowTotal = (chargeCodeId: string) => {
        let total = 0;
        dates.forEach((date) => {
            const key = `${chargeCodeId}-${format(date, "yyyy-MM-dd")}`;
            total += gridData.entryMap.get(key) || 0;
        });
        return total;
    };

    // Calculate column totals
    const getColumnTotal = (date: Date) => {
        return getDailyTotal(date);
    };

    // Calculate grand total
    const grandTotal = useMemo(() => {
        let total = 0;
        selectedChargeCodes.forEach((code) => {
            total += getRowTotal(code.id);
        });
        return total;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChargeCodes, gridData.entryMap]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <ScrollArea className="w-full">
                    <div className="min-w-[900px]">
                        {/* Header row with dates */}
                        <div className="flex border-b border-gray-200 bg-gray-50">
                            <div className="w-48 shrink-0 p-3 font-medium text-gray-700 border-r border-gray-200">
                                Charge Code
                            </div>
                            {dates.map((date) => (
                                <div
                                    key={date.toISOString()}
                                    className={cn(
                                        "w-16 shrink-0 p-2 text-center border-r border-gray-100 last:border-r-0",
                                        isWeekend(date) && "bg-gray-100",
                                        isToday(date) && "bg-blue-50"
                                    )}
                                >
                                    <div className={cn(
                                        "text-xs",
                                        isWeekend(date) ? "text-gray-400" : "text-gray-500"
                                    )}>
                                        {format(date, "EEE")}
                                    </div>
                                    <div
                                        className={cn(
                                            "text-sm font-medium",
                                            isToday(date) ? "text-blue-600" : "text-gray-700"
                                        )}
                                    >
                                        {format(date, "d")}
                                    </div>
                                </div>
                            ))}
                            <div className="w-16 shrink-0 p-2 text-center bg-gray-100">
                                <div className="text-xs text-gray-500">Total</div>
                                <div className="text-sm font-medium text-gray-700">Hrs</div>
                            </div>
                        </div>

                        {/* Charge code rows */}
                        {selectedChargeCodes.map((code) => (
                            <div
                                key={code.id}
                                className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-48 shrink-0 p-3 border-r border-gray-200 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {code.code}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {code.description}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                                        onClick={() => handleRemoveChargeCode(code.id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                                {dates.map((date) => {
                                    const key = `${code.id}-${format(date, "yyyy-MM-dd")}`;
                                    const hours = gridData.entryMap.get(key) ?? null;
                                    const isWeekendDay = isWeekend(date);
                                    const dailyTotal = getDailyTotal(date);
                                    const currentValue = hours || 0;
                                    const maxAllowed = 7 - dailyTotal + currentValue;

                                    return (
                                        <div
                                            key={date.toISOString()}
                                            className={cn(
                                                "w-16 shrink-0 flex items-center justify-center border-r border-gray-50 last:border-r-0",
                                                isWeekendDay && "bg-gray-100"
                                            )}
                                        >
                                            <HourPicker
                                                value={hours}
                                                onChange={(hrs) => handleHourChange(code.id, date, hrs)}
                                                disabled={upsertMutation.isPending || deleteMutation.isPending || isWeekendDay}
                                                maxHours={maxAllowed}
                                                isWeekend={isWeekendDay}
                                            />
                                        </div>
                                    );
                                })}
                                <div className="w-16 shrink-0 flex items-center justify-center bg-gray-50">
                                    <span
                                        className={cn(
                                            "text-sm font-medium",
                                            getRowTotal(code.id) > 0
                                                ? "text-gray-900"
                                                : "text-gray-400"
                                        )}
                                    >
                                        {getRowTotal(code.id) || "—"}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Add charge code row */}
                        <div className="p-3 border-b border-gray-100">
                            <ChargeCodeModal
                                selectedCodes={selectedChargeCodes.map((c) => c.id)}
                                onSelect={handleAddChargeCode}
                            />
                        </div>

                        {/* Footer row with column totals */}
                        <div className="flex bg-gray-50">
                            <div className="w-48 shrink-0 p-3 font-medium text-gray-700 border-r border-gray-200">
                                Daily Total
                            </div>
                            {dates.map((date) => {
                                const total = getColumnTotal(date);
                                const isWeekendDay = isWeekend(date);
                                return (
                                    <div
                                        key={date.toISOString()}
                                        className={cn(
                                            "w-16 shrink-0 p-2 flex items-center justify-center border-r border-gray-100",
                                            isWeekendDay && "bg-gray-100"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "text-sm font-medium",
                                                isWeekendDay
                                                    ? "text-gray-400"
                                                    : total === 7
                                                        ? "text-green-600"
                                                        : total > 0
                                                            ? "text-orange-500"
                                                            : "text-gray-400"
                                            )}
                                        >
                                            {isWeekendDay ? "—" : (total || "—")}
                                        </span>
                                    </div>
                                );
                            })}
                            <div className="w-16 shrink-0 p-2 flex items-center justify-center bg-gray-100">
                                <span className="text-sm font-bold text-blue-600">
                                    {grandTotal}
                                </span>
                            </div>
                        </div>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmation.isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteConfirmation({ isOpen: false, chargeCode: null, hoursToDelete: 0 });
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-gray-900">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Delete Charge Code?
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                            This charge code has <span className="font-semibold text-gray-900">{deleteConfirmation.hoursToDelete} hours</span> logged
                            in the current period. Removing it will delete all associated time entries.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmation({ isOpen: false, chargeCode: null, hoursToDelete: 0 })}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteChargeCode}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
