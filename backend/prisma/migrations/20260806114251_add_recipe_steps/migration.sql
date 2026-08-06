-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "steps" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "UserRecipe" ADD COLUMN     "steps" TEXT[] DEFAULT ARRAY[]::TEXT[];
