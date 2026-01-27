import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    // Create charge codes
    const chargeCodes = [
        { code: "PROJ-001", description: "Client Project Alpha - Development" },
        { code: "PROJ-002", description: "Client Project Beta - Design" },
        { code: "PROJ-003", description: "Internal Tools Development" },
        { code: "ADMIN-001", description: "Administrative Tasks" },
        { code: "TRAIN-001", description: "Training & Learning" },
        { code: "MTG-001", description: "Meetings & Collaboration" },
        { code: "SUPP-001", description: "Customer Support" },
        { code: "RND-001", description: "Research & Development" },
    ];

    console.log("📋 Creating charge codes...");
    for (const code of chargeCodes) {
        await prisma.chargeCode.upsert({
            where: { code: code.code },
            update: {},
            create: code,
        });
    }
    console.log(`✅ Created ${chargeCodes.length} charge codes`);

    // Create test users
    const passwordHash = await hash("password123", 12);

    console.log("👤 Creating test users...");

    // Employee only
    const employee = await prisma.user.upsert({
        where: { email: "employee@example.com" },
        update: {},
        create: {
            email: "employee@example.com",
            name: "John Employee",
            passwordHash,
            roles: ["EMPLOYEE"],
        },
    });
    console.log(`✅ Created employee: ${employee.email}`);

    // Admin only
    const admin = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            email: "admin@example.com",
            name: "Jane Admin",
            passwordHash,
            roles: ["ADMIN"],
        },
    });
    console.log(`✅ Created admin: ${admin.email}`);

    // Both Employee and Admin
    const superUser = await prisma.user.upsert({
        where: { email: "super@example.com" },
        update: {},
        create: {
            email: "super@example.com",
            name: "Super User",
            passwordHash,
            roles: ["EMPLOYEE", "ADMIN"],
        },
    });
    console.log(`✅ Created super user: ${superUser.email}`);

    // Create some sample time entries for the employee
    console.log("⏱️ Creating sample time entries...");
    const today = new Date();
    const codes = await prisma.chargeCode.findMany({ take: 3 });

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Skip weekends
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        await prisma.timeEntry.upsert({
            where: {
                userId_chargeCodeId_date: {
                    userId: employee.id,
                    chargeCodeId: codes[0].id,
                    date,
                },
            },
            update: {},
            create: {
                userId: employee.id,
                chargeCodeId: codes[0].id,
                date,
                hours: Math.floor(Math.random() * 4) + 4, // 4-7 hours
            },
        });

        if (Math.random() > 0.5) {
            await prisma.timeEntry.upsert({
                where: {
                    userId_chargeCodeId_date: {
                        userId: employee.id,
                        chargeCodeId: codes[1].id,
                        date,
                    },
                },
                update: {},
                create: {
                    userId: employee.id,
                    chargeCodeId: codes[1].id,
                    date,
                    hours: Math.floor(Math.random() * 3) + 1, // 1-3 hours
                },
            });
        }
    }
    console.log("✅ Created sample time entries");

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📝 Test credentials:");
    console.log("   Employee: employee@example.com / password123");
    console.log("   Admin: admin@example.com / password123");
    console.log("   Super User: super@example.com / password123");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
