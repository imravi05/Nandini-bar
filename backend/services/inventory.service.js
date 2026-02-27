import prisma from "../config/prisma.js";

/* ---------------- GET INVENTORY ---------------- */

export const getInventory = async () => {
  return prisma.shopInventory.findMany({
    include: { product: true },
    orderBy: { lastUpdated: "desc" },
  });
};

/* ---------------- CREATE INVENTORY (Initial Stock) ---------------- */

export const createInventory = async (productId, quantity) => {
  if (quantity < 0) {
    throw new Error("Quantity cannot be negative");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const existing = await prisma.shopInventory.findUnique({
    where: { productId },
  });

  if (existing) {
    throw new Error("Inventory already exists for this product");
  }

  return prisma.shopInventory.create({
    data: {
      productId,
      quantity,
    },
  });
};

/* ---------------- ADJUST INVENTORY (Increment/Decrement) ---------------- */

export const adjustInventory = async (productId, changeQty, reason) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const closing = await prisma.dailyClosing.findUnique({
    where: { date: today },
  });

  if (closing && closing.status === "CLOSED") {
    throw new Error("Cannot modify inventory after day closing.");
  }

  return prisma.$transaction(async (tx) => {
    const inventory = await tx.shopInventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    const newQty = inventory.quantity + changeQty;

    if (newQty < 0) {
      throw new Error("Stock cannot be negative");
    }

    await tx.stockAdjustment.create({
      data: {
        productId,
        changeQty,
        reason,
      },
    });

    return tx.shopInventory.update({
      where: { id: inventory.id },
      data: { quantity: newQty },
    });
  });
};

/* ---------------- UPDATE INVENTORY (Set Exact Quantity) ---------------- */

export const updateInventory = async (id, quantity, reason) => {
  if (quantity < 0) {
    throw new Error("Quantity cannot be negative");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const closing = await prisma.dailyClosing.findUnique({
    where: { date: today },
  });

  if (closing && closing.status === "CLOSED") {
    throw new Error("Cannot modify inventory after day closing.");
  }

  return prisma.$transaction(async (tx) => {
    const inventory = await tx.shopInventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    const difference = quantity - inventory.quantity;

    await tx.stockAdjustment.create({
      data: {
        productId: inventory.productId,
        changeQty: difference,
        reason,
      },
    });

    return tx.shopInventory.update({
      where: { id },
      data: { quantity },
    });
  });
};

/* ---------------- DELETE INVENTORY ---------------- */

export const deleteInventory = async (id) => {
  const inventory = await prisma.shopInventory.findUnique({
    where: { id },
  });

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  if (inventory.quantity !== 0) {
    throw new Error("Cannot delete inventory with non-zero stock");
  }

  return prisma.shopInventory.delete({
    where: { id },
  });
};

/* ---------------- GET STOCK ADJUSTMENT HISTORY ---------------- */

export const getStockAdjustments = async (productId) => {
  return prisma.stockAdjustment.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
};
