-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "roles" "Role"[] DEFAULT ARRAY['EMPLOYEE']::"Role"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charge_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charge_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_charge_code_access" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "charge_code_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_charge_code_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "charge_code_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hours" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "charge_codes_code_key" ON "charge_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employee_charge_code_access_user_id_charge_code_id_key" ON "employee_charge_code_access"("user_id", "charge_code_id");

-- CreateIndex
CREATE INDEX "time_entries_user_id_date_idx" ON "time_entries"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "time_entries_user_id_charge_code_id_date_key" ON "time_entries"("user_id", "charge_code_id", "date");

-- AddForeignKey
ALTER TABLE "employee_charge_code_access" ADD CONSTRAINT "employee_charge_code_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_charge_code_access" ADD CONSTRAINT "employee_charge_code_access_charge_code_id_fkey" FOREIGN KEY ("charge_code_id") REFERENCES "charge_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_charge_code_id_fkey" FOREIGN KEY ("charge_code_id") REFERENCES "charge_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
