import { MetricsCards } from "@/components/admin/metrics-cards";
import { EmployeeTable } from "@/components/admin/employee-table";

export default function AdminDashboardPage() {
    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">
                    Overview of employee timesheet status
                </p>
            </div>

            {/* Metrics */}
            <div className="mb-8">
                <MetricsCards />
            </div>

            {/* Employee table */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Employees</h2>
                <EmployeeTable />
            </div>
        </div>
    );
}
