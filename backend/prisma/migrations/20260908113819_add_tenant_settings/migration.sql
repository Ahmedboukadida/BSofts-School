/*
  Warnings:

  - The `currency` column on the `SaaSPlan` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('TND', 'EUR', 'USD');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('FR', 'EN', 'AR');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "Establishment" ALTER COLUMN "country" SET DEFAULT 'TN',
ALTER COLUMN "timezone" SET DEFAULT 'Africa/Tunis';

-- AlterTable
ALTER TABLE "SaaSPlan" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TND';

-- CreateTable
CREATE TABLE "TenantSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TND',
    "language" "Language" NOT NULL DEFAULT 'FR',
    "theme" "Theme" NOT NULL DEFAULT 'LIGHT',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Tunis',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantSettings_tenantId_key" ON "TenantSettings"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
