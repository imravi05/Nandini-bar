import prisma from "../config/prisma.js";

export const getAllProducts = async () => {
  return prisma.product.findMany({
    orderBy: { name: "asc" }
  });
};