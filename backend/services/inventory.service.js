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