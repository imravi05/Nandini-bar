import prisma from "../config/prisma.js";
import { generateDailyExcel } from "./excel.service.js";

export const closeDay = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Check existing closing (outside transaction)
  const existing = await prisma.dailyClosing.findUnique({
    where: { date: today },
  });
  if (existing?.status === "CLOSED") {
    throw new Error("Day already closed");
  }

  // Fetch sales and inventory outside transaction
  const sales = await prisma.sale.findMany({
    where: {
      saleDate: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: { items: true },
  });
  const inventories = await prisma.shopInventory.findMany({
    include: { product: true },
  });

  // Calculate sales/productMap
  let totalSalesAmount = 0;
  let totalSalesQuantity = 0;
  const productMap = {};
  for (const sale of sales) {
    totalSalesAmount += sale.totalAmount;
    for (const item of sale.items) {
      totalSalesQuantity += item.quantity;
      if (!productMap[item.productId]) {
        productMap[item.productId] = {
          soldQuantity: 0,
          saleAmount: 0,
          parcelQty: 0,
        };
      }
      if (sale.saleNumber?.startsWith("PARCEL-")) {
        productMap[item.productId].parcelQty += item.quantity;
      }
      productMap[item.productId].soldQuantity += item.quantity;
      productMap[item.productId].saleAmount += item.totalPrice;
    }
  }

  // Prepare product summaries for bulk create
  let totalClosingValue = 0;
  const productSummaries = [];
  for (const inv of inventories) {
    if (!inv.product) {
      console.warn("Skipping inventory without product:", inv.productId);
      continue;
    }
    const soldData = productMap[inv.productId] || {
      soldQuantity: 0,
      saleAmount: 0,
      parcelQty: 0,
    };
    const closingValue = inv.quantity * inv.product.basePrice;
    totalClosingValue += closingValue;
    productSummaries.push({
      productId: inv.productId,
      openingStock: inv.quantity + soldData.soldQuantity,
      receivedStock: 0,
      totalStock: inv.quantity + soldData.soldQuantity,
      parcel: soldData.parcelQty || 0,
      soldQuantity: soldData.soldQuantity,
      saleAmount: soldData.saleAmount,
      closingStock: inv.quantity,
      closingValue,
    });
  }

  // Transaction: create/update closing, delete summaries, bulk create summaries, update closing value, audit log
  const fullClosing = await prisma.$transaction(async (tx) => {
    let closingId;
    if (existing) {
      await tx.dailyProductSummary.deleteMany({ where: { dailyClosingId: existing.id } });
      const updated = await tx.dailyClosing.update({
        where: { id: existing.id },
        data: {
          totalSalesAmount,
          totalSalesQuantity,
          totalClosingValue: 0,
          status: "CLOSED",
          revisionNumber: existing.revisionNumber + 1,
        },
      });
      closingId = updated.id;
    } else {
      const closing = await tx.dailyClosing.create({
        data: {
          date: today,
          totalSalesAmount,
          totalSalesQuantity,
          totalClosingValue: 0,
          status: "CLOSED",
        },
      });
      closingId = closing.id;
    }

    // Bulk create product summaries
    if (productSummaries.length > 0) {
      await tx.dailyProductSummary.createMany({
        data: productSummaries.map((summary) => ({
          ...summary,
          dailyClosingId: closingId,
        })),
      });
    }

    await tx.dailyClosing.update({
      where: { id: closingId },
      data: { totalClosingValue },
    });

    const fullClosing = await tx.dailyClosing.findUnique({
      where: { id: closingId },
      include: {
        summaries: {
          include: { product: true },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        entityType: "DailyClosing",
        entityId: fullClosing.id,
        action: "CLOSE_DAY",
        newData: JSON.stringify(fullClosing),
      },
    });

    return fullClosing;
  });

  // Generate Excel outside transaction
  setImmediate(async () => {
    await generateDailyExcel(fullClosing);
  });
  return fullClosing;
};

/* ------------------------------------------------ */
/* GET DAILY REPORT */
/* ------------------------------------------------ */

export const getDailyReport = async (date) => {
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  return prisma.dailyClosing.findUnique({
    where: { date: selectedDate },
    include: {
      summaries: {
        include: { product: true },
      },
    },
  });
};

/* ------------------------------------------------ */
/* REOPEN DAY */
/* ------------------------------------------------ */

export const reopenDay = async (date) => {
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  return prisma.$transaction(async (tx) => {
    const closing = await tx.dailyClosing.findUnique({
      where: { date: selectedDate },
    });

    if (!closing) {
      throw new Error("No closing found for this date");
    }

    if (closing.status === "REOPENED") {
      throw new Error("Day already reopened");
    }

    const updatedClosing = await tx.dailyClosing.update({
      where: { date: selectedDate },
      data: {
        status: "REOPENED",
        revisionNumber: closing.revisionNumber + 1,
      },
    });

    await tx.auditLog.create({
      data: {
        entityType: "DailyClosing",
        entityId: updatedClosing.id,
        action: "REOPEN_DAY",
        oldData: JSON.stringify(closing),
        newData: JSON.stringify(updatedClosing),
      },
    });

    return updatedClosing;
  });
};
