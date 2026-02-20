import prisma from "../config/prisma.js";

export const createSale = async (items) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 🔒 Check if day is closed
  const closing = await prisma.dailyClosing.findUnique({
    where: { date: today }
  });

  if (closing && closing.status === "CLOSED") {
  throw new Error("Sales not allowed. Day already closed.");
}

  return prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    for (const item of items) {
      const inventory = await tx.shopInventory.findFirst({
        where: { productId: item.productId }
      });

      if (!inventory || inventory.quantity < item.quantity) {
        throw new Error("Insufficient stock");
      }

      totalAmount += item.quantity * item.unitPrice;
    }

    const sale = await tx.sale.create({
      data: {
        saleNumber: `SALE-${Date.now()}`,
        totalAmount,
        status: "OPEN"
      }
    });

    for (const item of items) {
      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        }
      });

      await tx.shopInventory.updateMany({
        where: { productId: item.productId },
        data: {
          quantity: { decrement: item.quantity }
        }
      });
    }

    return sale;
  });
};