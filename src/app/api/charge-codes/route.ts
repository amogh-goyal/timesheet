import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createChargeCodeSchema = z.object({
    code: z.string().min(1).max(50),
    description: z.string().min(1).max(255),
});

const updateChargeCodeSchema = z.object({
    id: z.string(),
    code: z.string().min(1).max(50).optional(),
    description: z.string().min(1).max(255).optional(),
    isActive: z.boolean().optional(),
});

// GET: Fetch all active charge codes
// For now, all users have access to all active charge codes
// Future: Filter by EmployeeChargeCodeAccess
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const includeInactive = searchParams.get("includeInactive") === "true";

        const where = includeInactive ? {} : { isActive: true };

        const chargeCodes = await prisma.chargeCode.findMany({
            where,
            orderBy: { code: "asc" },
        });

        return NextResponse.json(chargeCodes);
    } catch (error) {
        console.error("Error fetching charge codes:", error);
        return NextResponse.json(
            { error: "Failed to fetch charge codes" },
            { status: 500 }
        );
    }
}

// POST: Create a new charge code (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!session.user.roles.includes("ADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validatedData = createChargeCodeSchema.parse(body);

        const chargeCode = await prisma.chargeCode.create({
            data: validatedData,
        });

        return NextResponse.json(chargeCode);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid data", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Error creating charge code:", error);
        return NextResponse.json(
            { error: "Failed to create charge code" },
            { status: 500 }
        );
    }
}

// PATCH: Update a charge code (admin only)
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!session.user.roles.includes("ADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { id, ...data } = updateChargeCodeSchema.parse(body);

        const chargeCode = await prisma.chargeCode.update({
            where: { id },
            data,
        });

        return NextResponse.json(chargeCode);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid data", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Error updating charge code:", error);
        return NextResponse.json(
            { error: "Failed to update charge code" },
            { status: 500 }
        );
    }
}
