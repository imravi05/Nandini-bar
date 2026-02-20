-- CreateTable
CREATE TABLE "DailyClosing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "totalSalesAmount" REAL NOT NULL,
    "totalSalesQuantity" INTEGER NOT NULL,
    "totalClosingValue" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailyProductSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyClosingId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "openingStock" INTEGER NOT NULL,
    "receivedStock" INTEGER NOT NULL,
    "totalStock" INTEGER NOT NULL,
    "soldQuantity" INTEGER NOT NULL,
    "saleAmount" REAL NOT NULL,
    "closingStock" INTEGER NOT NULL,
    "closingValue" REAL NOT NULL,
    CONSTRAINT "DailyProductSummary_dailyClosingId_fkey" FOREIGN KEY ("dailyClosingId") REFERENCES "DailyClosing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyProductSummary_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyClosing_date_key" ON "DailyClosing"("date");

-- CreateIndex
CREATE INDEX "DailyProductSummary_productId_idx" ON "DailyProductSummary"("productId");
