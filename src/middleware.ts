import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Public routes
    const publicRoutes = ["/login", "/api/auth"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    if (isPublicRoute) {
        // If logged in and trying to access login, redirect appropriately
        if (session && pathname === "/login") {
            if (session.user.roles.includes("ADMIN")) {
                return NextResponse.redirect(new URL("/admin/dashboard", request.url));
            }
            return NextResponse.redirect(new URL("/timesheet", request.url));
        }
        return NextResponse.next();
    }

    // Not logged in, redirect to login
    if (!session) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
        if (!session.user.roles.includes("ADMIN")) {
            return NextResponse.redirect(new URL("/timesheet", request.url));
        }
    }

    // Employee routes protection (timesheet, month, day)
    if (
        pathname.startsWith("/timesheet") ||
        pathname.startsWith("/month") ||
        pathname.startsWith("/day")
    ) {
        if (!session.user.roles.includes("EMPLOYEE")) {
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    ],
};
