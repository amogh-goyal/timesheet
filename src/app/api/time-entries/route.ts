import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const timeEntrySchema = z.object({
    chargeCodeId: z.string(),
    date: z.string(), // ISO date string
    hours: z.number().int().min(1).max(7),
});

const deleteSchema = z.object({
    id: z.string(),
});

// GET: Fetch time entries for the current user
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const userId = searchParams.get("userId"); // For admin inspection

        // Determine which user's entries to fetch
        let targetUserId = session.user.id;

        // Allow admins to view other users' entries
        if (userId && session.user.roles.includes("ADMIN")) {
            targetUserId = userId;
        }

        const where: {
            userId: string;
            date?: { gte?: Date; lte?: Date };
        } = {
            userId: targetUserId,
        };

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const entries = await prisma.timeEntry.findMany({
            where,
            include: {
                chargeCode: {
                    select: {
                        id: true,
                        code: true,
                        description: true,
                    },
                },
            },
            orderBy: [{ date: "asc" }, { chargeCode: { code: "asc" } }],
        });

        return NextResponse.json(entries);
    } catch (error) {
        console.error("Error fetching time entries:", error);
        return NextResponse.json(
            { error: "Failed to fetch time entries" },
            { status: 500 }
        );
    }
}

// POST: Create or update a time entry (upsert)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = timeEntrySchema.parse(body);

        const entry = await prisma.timeEntry.upsert({
            where: {
                userId_chargeCodeId_date: {
                    userId: session.user.id,
                    chargeCodeId: validatedData.chargeCodeId,
                    date: new Date(validatedData.date),
                },
            },
            update: {
                hours: validatedData.hours,
            },
            create: {
                userId: session.user.id,
                chargeCodeId: validatedData.chargeCodeId,
                date: new Date(validatedData.date),
                hours: validatedData.hours,
            },
            include: {
                chargeCode: {
                    select: {
                        id: true,
                        code: true,
                        description: true,
                    },
                },
            },
        });

        return NextResponse.json(entry);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid data", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Error creating/updating time entry:", error);
        return NextResponse.json(
            { error: "Failed to save time entry" },
            { status: 500 }
        );
    }
}

// DELETE: Remove a time entry
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id } = deleteSchema.parse(body);

        // Verify the entry belongs to the user
        const entry = await prisma.timeEntry.findUnique({
            where: { id },
        });

        if (!entry) {
            return NextResponse.json(
                { error: "Time entry not found" },
                { status: 404 }
            );
        }

        if (entry.userId !== session.user.id && !session.user.roles.includes("ADMIN")) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        await prisma.timeEntry.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid data", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Error deleting time entry:", error);
        return NextResponse.json(
            { error: "Failed to delete time entry" },
            { status: 500 }
        );
    }
}
