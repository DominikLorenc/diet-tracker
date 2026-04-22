-- AlterTable
ALTER TABLE "DiaryEntryItem" ADD COLUMN     "userRecipeId" TEXT;

-- AddForeignKey
ALTER TABLE "DiaryEntryItem" ADD CONSTRAINT "DiaryEntryItem_userRecipeId_fkey" FOREIGN KEY ("userRecipeId") REFERENCES "UserRecipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
