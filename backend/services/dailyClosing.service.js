import prisma from "../config/prisma.js";
import { generateDailyExcel } from "./excel.service.js";


export const closeDay = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already closed
  const existing = await prisma.dailyClosing.findUnique({
    where: { date: today }
  });

  if (existing) {
    console.log("Day already closed for date:", today);
    throw new Error("Day already closed");
  }

  return prisma.$transaction(async (tx) => {
    // Get today's sales
    const sales = await tx.sale.findMany({
      where: {
        saleDate: {
          gte: today
        }
      },
      include: {
        items: true
      }
    });

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
            saleAmount: 0
          };
        }

        productMap[item.productId].soldQuantity += item.quantity;
        productMap[item.productId].saleAmount += item.totalPrice;
      }
    }

    // Get inventory for closing stock
    const inventories = await tx.shopInventory.findMany({
      include: { product: true }
    });

    let totalClosingValue = 0;

    const closing = await tx.dailyClosing.create({
      data: {
        date: today,
        totalSalesAmount,
        totalSalesQuantity,
        totalClosingValue: 0,
        status: "CLOSED"
      }
    });

    for (const inv of inventories) {
      const soldData = productMap[inv.productId] || {
        soldQuantity: 0,
        saleAmount: 0
      };

      const closingValue = inv.quantity * inv.product.basePrice;
      totalClosingValue += closingValue;

      await tx.dailyProductSummary.create({
        data: {
          dailyClosingId: closing.id,
          productId: inv.productId,
          openingStock: inv.quantity + soldData.soldQuantity,
          receivedStock: 0,
          totalStock: inv.quantity + soldData.soldQuantity,
          soldQuantity: soldData.soldQuantity,
          saleAmount: soldData.saleAmount,
          closingStock: inv.quantity,
          closingValue
        }
      });
    }

    await tx.dailyClosing.update({
      where: { id: closing.id },
      data: { totalClosingValue }
    });

    const fullClosing = await tx.dailyClosing.findUnique({
        where: { id: closing.id },
        include: {
        summaries: {
        include: {
            product: true
        }
        }
    }
        });

// Generate Excel AFTER transaction
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
          product: true
        }
      }
    }
  });
};

export const reopenDay = async (date) => {
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  const closing = await prisma.dailyClosing.findUnique({
    where: { date: selectedDate }
  });

  if (!closing) {
    throw new Error("No closing found for this date");
  }

  if (closing.status === "REOPENED") {
    console.log("Day already reopened for date:", selectedDate);
    throw new Error("Day already reopened");
  }

  return prisma.dailyClosing.update({
    where: { date: selectedDate },
    data: {
      status: "REOPENED",
      revisionNumber: closing.revisionNumber + 1
    }
  });
};