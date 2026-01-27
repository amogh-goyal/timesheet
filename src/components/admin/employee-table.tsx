"use client";

import { useState } from "react";
import { useEmployees } from "@/hooks/use-admin-metrics";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export function EmployeeTable() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { data: employees, isLoading } = useEmployees(debouncedSearch);

    const handleSearch = (value: string) => {
        setSearch(value);
        // Simple debounce
        setTimeout(() => {
            setDebouncedSearch(value);
        }, 300);
    };

    return (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
            {/* Search header */}
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="text-slate-400">Employee</TableHead>
                            <TableHead className="text-slate-400">Email</TableHead>
                            <TableHead className="text-slate-400">Roles</TableHead>
                            <TableHead className="text-slate-400">Total Entries</TableHead>
                            <TableHead className="text-slate-400">Joined</TableHead>
                            <TableHead className="text-slate-400 text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : employees?.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-12 text-slate-500"
                                >
                                    No employees found
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees?.map((employee) => (
                                <TableRow
                                    key={employee.id}
                                    className="border-slate-700/50 hover:bg-slate-700/20"
                                >
                                    <TableCell className="font-medium text-white">
                                        {employee.name || "—"}
                                    </TableCell>
                                    <TableCell className="text-slate-300">
                                        {employee.email}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {employee.roles.map((role) => (
                                                <Badge
                                                    key={role}
                                                    variant="outline"
                                                    className={
                                                        role === "ADMIN"
                                                            ? "border-purple-500/50 text-purple-400"
                                                            : "border-blue-500/50 text-blue-400"
                                                    }
                                                >
                                                    {role}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-300">
                                        {employee._count.timeEntries}
                                    </TableCell>
                                    <TableCell className="text-slate-400">
                                        {format(new Date(employee.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <Link href={`/admin/employees/${employee.id}`}>
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                View
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
