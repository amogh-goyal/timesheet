"use client";

import { useMemo, useState } from "react";
import { format, addDays, isWeekend, isToday } from "date-fns";
import { useTimeEntries, useUpsertTimeEntry } from "@/hooks/use-time-entries";
import { HourPicker } from "./hour-picker";
import { ChargeCodeModal } from "./charge-code-modal";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChargeCodeOption } from "@/types";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimesheetGridProps {
    startDate: Date;
}

export function TimesheetGrid({ startDate }: TimesheetGridProps) {
    const endDate = addDays(startDate, 13);
    const { data: entries, isLoading } = useTimeEntries(startDate, endDate);
    const upsertMutation = useUpsertTimeEntry();

    // Track which charge codes the user has added to their grid
    const [selectedChargeCodes, setSelectedChargeCodes] = useState<
        ChargeCodeOption[]
    >([]);

    // Generate dates for the 2-week period
    const dates = useMemo(() => {
        const result: Date[] = [];
        for (let i = 0; i < 14; i++) {
            result.push(addDays(startDate, i));
        }
        return result;
    }, [startDate]);

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

    const handleHourChange = (
        chargeCodeId: string,
        date: Date,
        hours: number | null
    ) => {
        if (hours === null) return; // TODO: Handle deletion

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
        setSelectedChargeCodes((prev) =>
            prev.filter((c) => c.id !== chargeCodeId)
        );
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
        let total = 0;
        selectedChargeCodes.forEach((code) => {
            const key = `${code.id}-${format(date, "yyyy-MM-dd")}`;
            total += gridData.entryMap.get(key) || 0;
        });
        return total;
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
            <ScrollArea className="w-full">
                <div className="min-w-[900px]">
                    {/* Header row with dates */}
                    <div className="flex border-b border-slate-700 bg-slate-800/50">
                        <div className="w-48 shrink-0 p-3 font-medium text-slate-300 border-r border-slate-700">
                            Charge Code
                        </div>
                        {dates.map((date) => (
                            <div
                                key={date.toISOString()}
                                className={cn(
                                    "w-16 shrink-0 p-2 text-center border-r border-slate-700/50 last:border-r-0",
                                    isWeekend(date) && "bg-slate-700/30",
                                    isToday(date) && "bg-blue-600/20"
                                )}
                            >
                                <div className="text-xs text-slate-500">
                                    {format(date, "EEE")}
                                </div>
                                <div
                                    className={cn(
                                        "text-sm font-medium",
                                        isToday(date) ? "text-blue-400" : "text-slate-300"
                                    )}
                                >
                                    {format(date, "d")}
                                </div>
                            </div>
                        ))}
                        <div className="w-16 shrink-0 p-2 text-center bg-slate-700/30">
                            <div className="text-xs text-slate-500">Total</div>
                            <div className="text-sm font-medium text-slate-300">Hrs</div>
                        </div>
                    </div>

                    {/* Charge code rows */}
                    {selectedChargeCodes.map((code) => (
                        <div
                            key={code.id}
                            className="flex border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                        >
                            <div className="w-48 shrink-0 p-3 border-r border-slate-700 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="font-medium text-slate-200 truncate">
                                        {code.code}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {code.description}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-slate-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                                    onClick={() => handleRemoveChargeCode(code.id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                            {dates.map((date) => {
                                const key = `${code.id}-${format(date, "yyyy-MM-dd")}`;
                                const hours = gridData.entryMap.get(key) ?? null;

                                return (
                                    <div
                                        key={date.toISOString()}
                                        className={cn(
                                            "w-16 shrink-0 flex items-center justify-center border-r border-slate-700/30 last:border-r-0",
                                            isWeekend(date) && "bg-slate-700/20"
                                        )}
                                    >
                                        <HourPicker
                                            value={hours}
                                            onChange={(hrs) => handleHourChange(code.id, date, hrs)}
                                            disabled={upsertMutation.isPending}
                                        />
                                    </div>
                                );
                            })}
                            <div className="w-16 shrink-0 flex items-center justify-center bg-slate-700/20">
                                <span
                                    className={cn(
                                        "text-sm font-medium",
                                        getRowTotal(code.id) > 0
                                            ? "text-emerald-400"
                                            : "text-slate-500"
                                    )}
                                >
                                    {getRowTotal(code.id) || "—"}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Add charge code row */}
                    <div className="p-3 border-b border-slate-700/50">
                        <ChargeCodeModal
                            selectedCodes={selectedChargeCodes.map((c) => c.id)}
                            onSelect={handleAddChargeCode}
                        />
                    </div>

                    {/* Footer row with column totals */}
                    <div className="flex bg-slate-800/50">
                        <div className="w-48 shrink-0 p-3 font-medium text-slate-300 border-r border-slate-700">
                            Daily Total
                        </div>
                        {dates.map((date) => {
                            const total = getColumnTotal(date);
                            return (
                                <div
                                    key={date.toISOString()}
                                    className={cn(
                                        "w-16 shrink-0 p-2 flex items-center justify-center border-r border-slate-700/30",
                                        isWeekend(date) && "bg-slate-700/30"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "text-sm font-medium",
                                            total === 7
                                                ? "text-emerald-400"
                                                : total > 0
                                                    ? "text-amber-400"
                                                    : "text-slate-500"
                                        )}
                                    >
                                        {total || "—"}
                                    </span>
                                </div>
                            );
                        })}
                        <div className="w-16 shrink-0 p-2 flex items-center justify-center bg-slate-700/30">
                            <span className="text-sm font-bold text-blue-400">
                                {grandTotal}
                            </span>
                        </div>
                    </div>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
