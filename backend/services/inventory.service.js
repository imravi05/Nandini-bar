import prisma from "../config/prisma.js";

export const getInventory = async () => {
  return prisma.shopInventory.findMany({
    include: { product: true }
  });
};

export const adjustInventory = async (productId, quantity) => {
  const inventory = await prisma.shopInventory.findFirst({
    where: { productId }
  });

  if (!inventory) {
    return prisma.shopInventory.create({
      data: {
        productId,
        quantity
      }
    });
  }

  return prisma.shopInventory.update({
    where: { id: inventory.id },
    data: {
      quantity: inventory.quantity + quantity
    }
  });
};

export const updateInventory = async (id, quantity, reason) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const closing = await prisma.dailyClosing.findUnique({
    where: { date: today }
  });

  if (closing && closing.status === "CLOSED") {
    throw new Error("Cannot modify inventory after day closing.");
  }

  return prisma.$transaction(async (tx) => {
    const inventory = await tx.shopInventory.findUnique({
      where: { id }
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    const difference = quantity - inventory.quantity;

    await tx.stockAdjustment.create({
      data: {
        productId: inventory.productId,
        changeQty: difference,
        reason
      }
    });

    return tx.shopInventory.update({
      where: { id },
      data: { quantity }
    });
  });
};
export const deleteInventory = async (id) => {
  const inventory = await prisma.shopInventory.findUnique({
    where: { id }
  });

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  if (inventory.quantity !== 0) {
    throw new Error("Cannot delete inventory with non-zero stock");
  }

  return prisma.shopInventory.delete({
    where: { id }
  });
};