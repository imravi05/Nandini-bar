import prisma from "../config/prisma.js";

export const getInventory = async () => {
  return prisma.shopInventory.findMany({
    include: { product: true },
    orderBy: { lastUpdated: "desc" },
  });
};

/* ---------------- RESTOCK INVENTORY (Action-Based) ---------------- */
/**
 * Increments stock and logs a RESTOCK event.
 */
export const restockInventory = async (
  productId,
  quantity,
  costPrice,
  reason = "Supplier Restock",
) => {
  if (quantity <= 0) throw new Error("Restock quantity must be positive");

  // Check Daily Closing status
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const closing = await prisma.dailyClosing.findUnique({
    where: { date: today },
  });
  if (closing?.status === "CLOSED") {
    throw new Error("Cannot restock after daily closing.");
  }

  return prisma.$transaction(async (tx) => {
    // Get old inventory snapshot for audit log
    const oldInventory = await tx.shopInventory.findUnique({
      where: { productId },
      include: { product: true },
    });

    // 1. Update or Create Inventory (Upsert prevents "not found" errors)
    const inventory = await tx.shopInventory.upsert({
      where: { productId },
      update: {
        quantity: { increment: quantity },
        costPrice: costPrice || undefined, // Update cost price if provided
        lastUpdated: new Date(),
      },
      create: {
        productId,
        quantity,
        costPrice: costPrice || 0,
      },
      include: { product: true },
    });

    // 2. Create Audit Trail
    await tx.stockAdjustment.create({
      data: {
        productId,
        changeQty: quantity,
        type: "RESTOCK",
        reason,
        costPrice: costPrice || 0,
      },
    });

    // --- Create Audit Log for restock ---
    await tx.auditLog.create({
      data: {
        entityType: "Inventory",
        entityId: inventory.id,
        action: "RESTOCK_INVENTORY",
        oldData: oldInventory ? JSON.stringify(oldInventory) : null,
        newData: JSON.stringify(inventory),
      },
    });

    return inventory;
  });
};

/* ---------------- ADJUST INVENTORY (Manual Correction) ---------------- */
/**
 * Used for damages, losses, or manual fixes.
 * Allows negative changeQty for stock reduction.
 */
export const adjustInventory = async (productId, changeQty, reason) => {
  if (changeQty === 0) throw new Error("Adjustment cannot be zero");

  return prisma.$transaction(async (tx) => {
    const inventory = await tx.shopInventory.findUnique({
      where: { productId },
      include: { product: true },
    });
    if (!inventory) throw new Error("Inventory record not found");

    if (inventory.quantity + changeQty < 0) {
      throw new Error("Stock cannot fall below zero");
    }

    await tx.stockAdjustment.create({
      data: {
        productId,
        changeQty,
        type: "MANUAL_ADJUSTMENT",
        reason,
      },
    });

    const updatedInventory = await tx.shopInventory.update({
      where: { productId },
      data: { quantity: { increment: changeQty } },
      include: { product: true },
    });

    // --- Create Audit Log for manual adjustment ---
    await tx.auditLog.create({
      data: {
        entityType: "Inventory",
        entityId: inventory.id,
        action: "ADJUST_INVENTORY",
        oldData: JSON.stringify(inventory),
        newData: JSON.stringify(updatedInventory),
      },
    });

    return updatedInventory;
  });
};

/* ---------------- GET STOCK HISTORY ---------------- */
export const getStockAdjustments = async (productId) => {
  return prisma.stockAdjustment.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
};
