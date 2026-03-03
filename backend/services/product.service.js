import prisma from "../config/prisma.js";

/* ---------------- CREATE PRODUCT ---------------- */
export const createProduct = async (productData) => {
  const { stockQty, costPrice, ...details } = productData;

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: details,
    });

    await tx.shopInventory.create({
      data: {
        productId: product.id,
        quantity: Number(stockQty) || 0,
        costPrice: Number(costPrice) || 0,
      },
    });

    // --- Create Audit Log for new product ---
    await tx.auditLog.create({
      data: {
        entityType: "Product",
        entityId: product.id,
        action: "CREATE_PRODUCT",
        newData: JSON.stringify({
          ...product,
          initialStock: Number(stockQty) || 0,
        }),
      },
    });

    return product;
  });
};
/* ---------------- GET PRODUCTS (Pagination + Search) ---------------- */

export const getProducts = async (query) => {
  const page = Number.parseInt(query.page) || 1;
  const limit = Number.parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { brand: { contains: query.search, mode: "insensitive" } },
      { category: { contains: query.search, mode: "insensitive" } },
      { barcode: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: { inventory: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* ---------------- GET PRODUCT BY ID ---------------- */

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) throw new Error("Product not found");

  return product;
};

/* ---------------- UPDATE PRODUCT ---------------- */

export const updateProduct = async (id, data) => {
  return prisma.$transaction(async (tx) => {
    const oldProduct = await tx.product.findUnique({ where: { id } });
    if (!oldProduct) throw new Error("Product not found");

    const updatedProduct = await tx.product.update({
      where: { id },
      data,
    });

    // --- Create Audit Log for product update ---
    await tx.auditLog.create({
      data: {
        entityType: "Product",
        entityId: id,
        action: "UPDATE_PRODUCT",
        oldData: JSON.stringify(oldProduct),
        newData: JSON.stringify(updatedProduct),
      },
    });

    return updatedProduct;
  });
};

/* ---------------- DELETE PRODUCT (SAFE) ---------------- */
export const deleteProduct = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      inventory: true,
      saleItems: true,
    },
  });

  if (!product) throw new Error("Product not found");

  const totalStock = product.inventory.reduce(
    (sum, inv) => sum + inv.quantity,
    0,
  );
  if (totalStock > 0) {
    throw new Error("Cannot delete product with active inventory stock");
  }

  if (product.saleItems && product.saleItems.length > 0) {
    throw new Error(
      "Cannot delete product linked to sales history. Try archiving instead.",
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.shopInventory.deleteMany({ where: { productId: id } });
    const deletedProduct = await tx.product.delete({ where: { id } });

    // --- Create Audit Log for product deletion ---
    await tx.auditLog.create({
      data: {
        entityType: "Product",
        entityId: id,
        action: "DELETE_PRODUCT",
        oldData: JSON.stringify(product),
      },
    });

    return deletedProduct;
  });
};
