import prisma from "../config/prisma.js";

/* ---------------- CREATE PRODUCT ---------------- */

export const createProduct = async (data) => {
  return prisma.product.create({
    data
  });
};

/* ---------------- GET PRODUCTS (Pagination + Search) ---------------- */

export const getProducts = async (query) => {
  const page = Number.parseInt(query.page) || 1;
  const limit =Number.parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { brand: { contains: query.search, mode: "insensitive" } },
      { category: { contains: query.search, mode: "insensitive" } },
      { barcode: { contains: query.search, mode: "insensitive" } }
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.product.count({ where })
  ]);

  return {
    data: products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/* ---------------- GET PRODUCT BY ID ---------------- */

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) throw new Error("Product not found");

  return product;
};

/* ---------------- UPDATE PRODUCT ---------------- */

export const updateProduct = async (id, data) => {
  return prisma.product.update({
    where: { id },
    data
  });
};

/* ---------------- DELETE PRODUCT (SAFE) ---------------- */

export const deleteProduct = async (id) => {

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      inventory: true,
      saleItems: true
    }
  });

  if (!product) throw new Error("Product not found");

  // If inventory exists with quantity > 0
  const hasStock = product.inventory.some(inv => inv.quantity > 0);

  if (hasStock) {
    throw new Error("Cannot delete product with active inventory");
  }

  if (product.saleItems.length > 0) {
    throw new Error("Cannot delete product linked to sales history");
  }

  return prisma.product.delete({
    where: { id }
  });
};