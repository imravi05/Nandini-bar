/*
  Warnings:

  - Added the required column `type` to the `StockAdjustment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ShopInventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "costPrice" DECIMAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL,
    CONSTRAINT "ShopInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ShopInventory" ("id", "lastUpdated", "productId", "quantity") SELECT "id", "lastUpdated", "productId", "quantity" FROM "ShopInventory";
DROP TABLE "ShopInventory";
ALTER TABLE "new_ShopInventory" RENAME TO "ShopInventory";
CREATE UNIQUE INDEX "ShopInventory_productId_key" ON "ShopInventory"("productId");
CREATE TABLE "new_StockAdjustment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "changeQty" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "costPrice" DECIMAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockAdjustment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StockAdjustment" ("changeQty", "createdAt", "id", "productId", "reason") SELECT "changeQty", "createdAt", "id", "productId", "reason" FROM "StockAdjustment";
DROP TABLE "StockAdjustment";
ALTER TABLE "new_StockAdjustment" RENAME TO "StockAdjustment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
