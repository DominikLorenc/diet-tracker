-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('BREAD', 'DAIRY', 'MEAT', 'VEGETABLES', 'FRUITS', 'BEVERAGES', 'DRY_GOODS', 'SPICES', 'OTHER');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" "ProductCategory" NOT NULL DEFAULT 'OTHER';
