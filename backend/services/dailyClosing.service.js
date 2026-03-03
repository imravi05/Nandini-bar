import prisma from "../config/prisma.js";
import { generateDailyExcel } from "./excel.service.js";

export const closeDay = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Only block if genuinely already CLOSED; REOPENED days can be re-closed
  const existing = await prisma.dailyClosing.findUnique({
    where: { date: today },
  });

  if (existing && existing.status === "CLOSED") {
    throw new Error("Day already closed");
  }

  return prisma.$transaction(async (tx) => {
    // Gather today's sales
    const sales = await tx.sale.findMany({
      where: { saleDate: { gte: today } },
      include: { items: true },
    });

    let totalSalesAmount = 0;
    let totalSalesQuantity = 0;
    const productMap = {};

    for (const sale of sales) {
      totalSalesAmount += sale.totalAmount;
      for (const item of sale.items) {
        totalSalesQuantity += item.quantity;
        if (!productMap[item.productId]) {
          productMap[item.productId] = { soldQuantity: 0, saleAmount: 0 };
        }
        productMap[item.productId].soldQuantity += item.quantity;
        productMap[item.productId].saleAmount += item.totalPrice;
      }
    }

    const inventories = await tx.shopInventory.findMany({
      include: { product: true },
    });

    let totalClosingValue = 0;
    let closingId;

    if (existing) {
      // REOPENED — wipe old summaries and update the record
      await tx.dailyProductSummary.deleteMany({
        where: { dailyClosingId: existing.id },
      });
      await tx.dailyClosing.update({
        where: { id: existing.id },
        data: {
          totalSalesAmount,
          totalSalesQuantity,
          totalClosingValue: 0,
          status: "CLOSED",
          revisionNumber: existing.revisionNumber + 1,
        },
      });
      closingId = existing.id;
    } else {
      // First close of the day
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

    for (const inv of inventories) {
      const soldData = productMap[inv.productId] || {
        soldQuantity: 0,
        saleAmount: 0,
      };
      const closingValue = inv.quantity * inv.product.basePrice;
      totalClosingValue += closingValue;

      await tx.dailyProductSummary.create({
        data: {
          dailyClosingId: closingId,
          productId: inv.productId,
          openingStock: inv.quantity + soldData.soldQuantity,
          receivedStock: inv.receivedQuantity, // Assuming receivedQuantity is tracked in shopInventory for the day
          totalStock: inv.quantity + soldData.soldQuantity,
          soldQuantity: soldData.soldQuantity,
          saleAmount: soldData.saleAmount,
          closingStock: inv.quantity,
          closingValue,
        },
      });
    }

    await tx.dailyClosing.update({
      where: { id: closingId },
      data: { totalClosingValue },
    });

    const fullClosing = await tx.dailyClosing.findUnique({
      where: { id: closingId },
      include: { summaries: { include: { product: true } } },
    });

    // --- Create Audit Log for daily closing ---
    await tx.auditLog.create({
      data: {
        entityType: "DailyClosing",
        entityId: fullClosing.id,
        action: "CLOSE_DAY",
        newData: JSON.stringify(fullClosing),
      },
    });

    setImmediate(async () => {
      await generateDailyExcel(fullClosing);
    });

    return fullClosing;
  });
};

export const getDailyReport = async (date) => {
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  return prisma.dailyClosing.findUnique({
    where: { date: selectedDate },
    include: {
      summaries: {
        include: {
          product: true,
        },
      },
    },
  });
};

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
      console.log("Day already reopened for date:", selectedDate);
      throw new Error("Day already reopened");
    }

    const updatedClosing = await tx.dailyClosing.update({
      where: { date: selectedDate },
      data: {
        status: "REOPENED",
        revisionNumber: closing.revisionNumber + 1,
      },
    });

    // --- Create Audit Log for reopening day ---
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
