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
import { Clock, LogOut, User } from "lucide-react";
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top navigation bar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/timesheet" className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900 text-lg">
                                Timesheet
                            </span>
                        </Link>

                        {/* User menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-10 rounded-full px-2 hover:bg-gray-100"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 bg-white border-gray-200"
                                align="end"
                            >
                                <DropdownMenuLabel className="text-gray-900">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">
                                            {session?.user?.name || "User"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {session?.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-100" />
                                <DropdownMenuItem className="text-gray-700 focus:bg-gray-100 focus:text-gray-900 cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-100" />
                                <DropdownMenuItem
                                    className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
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
