/*
  Warnings:

  - You are about to drop the column `dailyCaloriesGoal` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dailyCarbsGoal` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dailyFatGoal` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dailyProteinGoal` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dailyCaloriesGoal",
DROP COLUMN "dailyCarbsGoal",
DROP COLUMN "dailyFatGoal",
DROP COLUMN "dailyProteinGoal",
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "UserGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyCaloriesGoal" INTEGER,
    "dailyProteinGoal" INTEGER,
    "dailyCarbsGoal" INTEGER,
    "dailyFatGoal" INTEGER,

    CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoal_userId_key" ON "UserGoal"("userId");

-- AddForeignKey
ALTER TABLE "UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
