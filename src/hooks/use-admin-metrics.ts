import { useQuery } from "@tanstack/react-query";
import { DashboardMetrics } from "@/types";

interface Employee {
    id: string;
    email: string;
    name: string | null;
    roles: string[];
    createdAt: string;
    _count: {
        timeEntries: number;
    };
}

async function fetchMetrics(): Promise<DashboardMetrics> {
    const response = await fetch("/api/admin/metrics");
    if (!response.ok) {
        throw new Error("Failed to fetch metrics");
    }
    return response.json();
}

async function fetchEmployees(search?: string): Promise<Employee[]> {
    const params = new URLSearchParams();
    if (search) {
        params.append("search", search);
    }
    const response = await fetch(`/api/admin/employees?${params}`);
    if (!response.ok) {
        throw new Error("Failed to fetch employees");
    }
    return response.json();
}

export function useAdminMetrics() {
    return useQuery({
        queryKey: ["adminMetrics"],
        queryFn: fetchMetrics,
        refetchInterval: 60000, // Refresh every minute
    });
}

export function useEmployees(search?: string) {
    return useQuery({
        queryKey: ["employees", search],
        queryFn: () => fetchEmployees(search),
    });
}
