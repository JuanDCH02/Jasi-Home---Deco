/*
  Warnings:

  - The `material` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Material" AS ENUM ('ALAMO', 'PINO');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "material",
ADD COLUMN     "material" "Material";
