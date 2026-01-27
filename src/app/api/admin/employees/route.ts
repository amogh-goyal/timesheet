import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: Fetch all employees for admin
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!session.user.roles.includes("ADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const employees = await prisma.user.findMany({
            where: {
                roles: { has: "EMPLOYEE" },
                OR: search
                    ? [
                        { email: { contains: search, mode: "insensitive" } },
                        { name: { contains: search, mode: "insensitive" } },
                    ]
                    : undefined,
            },
            select: {
                id: true,
                email: true,
                name: true,
                roles: true,
                createdAt: true,
                _count: {
                    select: { timeEntries: true },
                },
            },
            orderBy: { email: "asc" },
        });

        return NextResponse.json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        return NextResponse.json(
            { error: "Failed to fetch employees" },
            { status: 500 }
        );
    }
}
