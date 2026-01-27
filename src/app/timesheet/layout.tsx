"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, LogOut, User, Shield } from "lucide-react";
import Link from "next/link";

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();

    const getUserInitials = () => {
        if (session?.user?.name) {
            return session.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        if (session?.user?.email) {
            return session.user.email.slice(0, 2).toUpperCase();
        }
        return "U";
    };

    const isAdmin = session?.user?.roles?.includes("ADMIN");

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Top navigation bar */}
            <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/timesheet" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-white text-lg">
                                Timesheet
                            </span>
                        </Link>

                        {/* User menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-10 rounded-full px-2 hover:bg-slate-700/50"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 bg-slate-800 border-slate-700"
                                align="end"
                            >
                                <DropdownMenuLabel className="text-slate-200">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">
                                            {session?.user?.name || "User"}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {session?.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/admin/dashboard"
                                            className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer"
                                        >
                                            <Shield className="mr-2 h-4 w-4" />
                                            Admin Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem
                                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </nav>

            {/* Page content */}
            <main>{children}</main>
        </div>
    );
}
