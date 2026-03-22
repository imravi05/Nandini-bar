import prisma from "../config/prisma.js";

export const createParcelSale = async (data) => {
  const { items } = data;
  if (item.quantity <= 0) {
  throw new Error("Invalid quantity");
}
  let totalAmount = 0;

  items.forEach(item => {
    totalAmount += item.quantity * item.unitPrice;
  });

  return await prisma.$transaction(async (tx) => {

    // 1️⃣ Create Sale
    const sale = await tx.sale.create({
      data: {
        saleNumber: `PARCEL-${Date.now()}`,
        totalAmount,
        status: "COMPLETED"
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of items) {

      const totalPrice = item.quantity * item.unitPrice;

      
      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice
        }
      });


      await tx.shopInventory.update({
        where: { productId: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });

      // 4️⃣ Stock Adjustment
      await tx.stockAdjustment.create({
        data: {
          productId: item.productId,
          changeQty: -item.quantity,
          type: "SALE",
          reason: "PARCEL SALE"
        }
      });

      // 5️⃣ Update Daily Summary (parcel field 🔥)
      const dailyClosing = await tx.dailyClosing.findUnique({
        where: { date: today }
      });

      if (dailyClosing) {
        const summary = await tx.dailyProductSummary.findFirst({
          where: {
            dailyClosingId: dailyClosing.id,
            productId: item.productId
          }
        });

        if (summary) {
          await tx.dailyProductSummary.update({
            where: { id: summary.id },
            data: {
              parcel: {
                increment: item.quantity
              },
              soldQuantity: {
                increment: item.quantity
              },
              saleAmount: {
                increment: totalPrice
              }
            }
          });
        }
      }

      // 6️⃣ Audit Log
      await tx.auditLog.create({
        data: {
          entityType: "SALE",
          entityId: sale.id,
          action: "PARCEL_SALE",
          newData: JSON.stringify(item)
        }
      });
    }

    return sale;
  });
};