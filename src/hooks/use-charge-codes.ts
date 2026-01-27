import { useQuery } from "@tanstack/react-query";
import { ChargeCodeOption } from "@/types";

async function fetchChargeCodes(
    includeInactive = false
): Promise<ChargeCodeOption[]> {
    const params = new URLSearchParams();
    if (includeInactive) {
        params.append("includeInactive", "true");
    }

    const response = await fetch(`/api/charge-codes?${params}`);
    if (!response.ok) {
        throw new Error("Failed to fetch charge codes");
    }
    return response.json();
}

export function useChargeCodes(includeInactive = false) {
    return useQuery({
        queryKey: ["chargeCodes", includeInactive],
        queryFn: () => fetchChargeCodes(includeInactive),
        staleTime: 5 * 60 * 1000, // 5 minutes - charge codes don't change often
    });
}
