/*
  Warnings:

  - You are about to drop the column `mealId` on the `DiaryEntry` table. All the data in the column will be lost.
  - You are about to drop the column `mealType` on the `DiaryEntry` table. All the data in the column will be lost.
  - You are about to drop the `Meal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MealProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DiaryEntry" DROP CONSTRAINT "DiaryEntry_mealId_fkey";

-- DropForeignKey
ALTER TABLE "MealProduct" DROP CONSTRAINT "MealProduct_mealId_fkey";

-- DropForeignKey
ALTER TABLE "MealProduct" DROP CONSTRAINT "MealProduct_productId_fkey";

-- AlterTable
ALTER TABLE "DiaryEntry" DROP COLUMN "mealId",
DROP COLUMN "mealType";

-- DropTable
DROP TABLE "Meal";

-- DropTable
DROP TABLE "MealProduct";

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryEntryItem" (
    "id" TEXT NOT NULL,
    "diaryEntryId" TEXT NOT NULL,
    "productId" TEXT,
    "recipeId" TEXT,
    "mealType" "MealType" NOT NULL DEFAULT 'BREAKFAST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "DiaryEntryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_name_key" ON "Recipe"("name");

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntryItem" ADD CONSTRAINT "DiaryEntryItem_diaryEntryId_fkey" FOREIGN KEY ("diaryEntryId") REFERENCES "DiaryEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntryItem" ADD CONSTRAINT "DiaryEntryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntryItem" ADD CONSTRAINT "DiaryEntryItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
