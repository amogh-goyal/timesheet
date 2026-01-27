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
import { LayoutDashboard, Users, LogOut, Clock, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        href: "/admin/employees",
        label: "Employees",
        icon: Users,
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const pathname = usePathname();

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
        return "A";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900/80 backdrop-blur-lg border-r border-slate-700/50">
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700/50">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-white text-lg">Admin</span>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                                            isActive
                                                ? "bg-purple-600/20 text-purple-400"
                                                : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Employee timesheet link */}
                <div className="absolute bottom-20 left-0 right-0 px-3">
                    <Link
                        href="/timesheet"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-all"
                    >
                        <Clock className="h-5 w-5" />
                        My Timesheet
                    </Link>
                </div>

                {/* User section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-700/50 transition-all">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-white truncate">
                                        {session?.user?.name || "Admin"}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {session?.user?.email}
                                    </p>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56 bg-slate-800 border-slate-700"
                            align="end"
                        >
                            <DropdownMenuLabel className="text-slate-200">
                                Admin Account
                            </DropdownMenuLabel>
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
            </aside>

            {/* Main content */}
            <main className="ml-64">{children}</main>
        </div>
    );
}
