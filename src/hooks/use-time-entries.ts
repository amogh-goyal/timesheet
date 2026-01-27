import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TimeEntryInput, TimeEntryWithChargeCode } from "@/types";
import { format } from "date-fns";

async function fetchTimeEntries(
    startDate: Date,
    endDate: Date,
    userId?: string
): Promise<TimeEntryWithChargeCode[]> {
    const params = new URLSearchParams({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
    });

    if (userId) {
        params.append("userId", userId);
    }

    const response = await fetch(`/api/time-entries?${params}`);
    if (!response.ok) {
        throw new Error("Failed to fetch time entries");
    }
    return response.json();
}

async function upsertTimeEntry(data: TimeEntryInput): Promise<TimeEntryWithChargeCode> {
    const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to save time entry");
    }
    return response.json();
}

async function deleteTimeEntry({ id }: { id: string }): Promise<void> {
    const response = await fetch("/api/time-entries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });
    if (!response.ok) {
        throw new Error("Failed to delete time entry");
    }
}

export function useTimeEntries(startDate: Date, endDate: Date, userId?: string) {
    return useQuery({
        queryKey: ["timeEntries", format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd"), userId],
        queryFn: () => fetchTimeEntries(startDate, endDate, userId),
    });
}

export function useUpsertTimeEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: upsertTimeEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
        },
    });
}

export function useDeleteTimeEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTimeEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
        },
    });
}
