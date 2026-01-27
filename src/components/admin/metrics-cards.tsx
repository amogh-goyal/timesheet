"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminMetrics } from "@/hooks/use-admin-metrics";
import { Users, CheckCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricsCards() {
    const { data: metrics, isLoading } = useAdminMetrics();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="bg-slate-800/30 border-slate-700">
                        <CardContent className="flex items-center justify-center h-32">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: "Total Employees",
            value: metrics?.totalEmployees || 0,
            icon: Users,
            color: "text-blue-400",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Complete Timesheets",
            value: metrics?.completeTimesheetCount || 0,
            subtitle: "This period",
            icon: CheckCircle,
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10",
        },
        {
            title: "Old Incomplete",
            value: metrics?.incompleteOldTimesheets?.length || 0,
            subtitle: "Needs attention",
            icon: AlertTriangle,
            color: "text-amber-400",
            bgColor: "bg-amber-500/10",
            warning: (metrics?.incompleteOldTimesheets?.length || 0) > 0,
        },
        {
            title: "Avg Hours/Employee",
            value: metrics?.averageHoursPerEmployee || 0,
            subtitle: "This period",
            icon: Clock,
            color: "text-purple-400",
            bgColor: "bg-purple-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <Card
                    key={card.title}
                    className={cn(
                        "bg-slate-800/30 border-slate-700 transition-all hover:bg-slate-800/50",
                        card.warning && "border-amber-500/50"
                    )}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            {card.title}
                        </CardTitle>
                        <div className={cn("p-2 rounded-lg", card.bgColor)}>
                            <card.icon className={cn("h-4 w-4", card.color)} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-bold", card.color)}>
                            {card.value}
                        </div>
                        {card.subtitle && (
                            <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
