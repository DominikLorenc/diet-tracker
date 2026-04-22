/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `UserRecipe` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "UserRecipeIngredient" DROP CONSTRAINT "UserRecipeIngredient_userRecipeId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "UserRecipe_userId_name_key" ON "UserRecipe"("userId", "name");

-- AddForeignKey
ALTER TABLE "UserRecipeIngredient" ADD CONSTRAINT "UserRecipeIngredient_userRecipeId_fkey" FOREIGN KEY ("userRecipeId") REFERENCES "UserRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
