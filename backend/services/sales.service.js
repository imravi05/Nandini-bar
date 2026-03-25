import prisma from "../config/prisma.js";

/* ---------------- CREATE SALE ---------------- */

export const createSale = async (items) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const closing = await prisma.dailyClosing.findUnique({
    where: { date: today },
  });

  if (closing && closing.status === "CLOSED") {
    throw new Error("Sales not allowed. Day already closed.");
  }

  return prisma.$transaction(
    async (tx) => {
      const productIds = items.map((i) => i.productId);

      // 1. Bulk Fetch (Trips: 1)
      const [products, inventories] = await Promise.all([
        tx.product.findMany({ where: { id: { in: productIds } } }),
        tx.shopInventory.findMany({ where: { productId: { in: productIds } } }),
      ]);

      const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
      const inventoryMap = Object.fromEntries(
        inventories.map((inv) => [inv.productId, inv]),
      );

      // 2. Validation (In-memory - 0 trips)
      let totalAmount = 0;
      for (const item of items) {
        const product = productMap[item.productId];
        const inventory = inventoryMap[item.productId];

        if (!product) throw new Error("Product not found");
        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        totalAmount += item.quantity * product.basePrice;
      }

      // 3. Create Sale (Trip: 1)
      const sale = await tx.sale.create({
        data: {
          saleNumber: `SALE-${Date.now()}`,
          totalAmount,
          status: "OPEN",
        },
      });

      // 4. Batch Create Items (Trip: 1)
      const saleItemsData = items.map((item) => ({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: productMap[item.productId].basePrice,
        totalPrice: item.quantity * productMap[item.productId].basePrice,
      }));
      await tx.saleItem.createMany({ data: saleItemsData });

      // 5. Concurrent Stock Update (Trip: 1)
      await Promise.all(
        items.map((item) =>
          tx.shopInventory.update({
            where: { productId: item.productId },
            data: { quantity: { decrement: item.quantity } },
          }),
        ),
      );

      const createdSale = await tx.sale.findUnique({
        where: { id: sale.id },
        include: { items: { include: { product: true } } },
      });

      // --- Create Audit Log for the new sale ---
      await tx.auditLog.create({
        data: {
          entityType: "Sale",
          entityId: sale.id,
          action: "CREATE_SALE",
          newData: JSON.stringify(createdSale),
        },
      });

      return sale;
    },
    {
      timeout: 15000,
    },
  );
};

/* ---------------- GET ALL SALES ---------------- */

export const getSales = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filters = {};

  if (query.startDate && query.endDate) {
    filters.saleDate = {
      gte: new Date(query.startDate),
      lte: new Date(query.endDate),
    };
  }

  if (query.minAmount && query.maxAmount) {
    filters.totalAmount = {
      gte: parseFloat(query.minAmount),
      lte: parseFloat(query.maxAmount),
    };
  }

  if (query.productId) {
    filters.items = {
      some: {
        productId: query.productId,
      },
    };
  }

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where: filters,
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { saleDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.sale.count({ where: filters }),
  ]);

  return {
    data: sales,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* ---------------- GET SALE BY ID ---------------- */

export const getSaleById = async (id) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!sale) {
    throw new Error("Sale not found");
  }

  return sale;
};

/* ---------------- UPDATE SALE ---------------- */

export const updateSale = async (saleId, newItems) => {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { items: { include: { product: true } } },
  });

  if (!sale) throw new Error("Sale not found");

  const saleDate = new Date(sale.saleDate);
  saleDate.setHours(0, 0, 0, 0);

  const closing = await prisma.dailyClosing.findUnique({
    where: { date: saleDate },
  });

  if (closing && closing.status === "CLOSED") {
    throw new Error("Cannot modify sale. Day is closed.");
  }

  return prisma.$transaction(
    async (tx) => {
      // Restore previous stock
      for (const item of sale.items) {
        await tx.shopInventory.updateMany({
          where: { productId: item.productId },
          data: {
            quantity: { increment: item.quantity },
          },
        });
      }

      // Delete old items
      await tx.saleItem.deleteMany({
        where: { saleId },
      });

      let totalAmount = 0;

      // Create new items
      for (const item of newItems) {
        const inventory = await tx.shopInventory.findFirst({
          where: { productId: item.productId },
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error("Insufficient stock for update");
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        totalAmount += item.quantity * product.basePrice;

        await tx.saleItem.create({
          data: {
            saleId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.basePrice,
            totalPrice: item.quantity * product.basePrice,
          },
        });

        await tx.shopInventory.updateMany({
          where: { productId: item.productId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
      }

      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: { totalAmount },
        include: { items: { include: { product: true } } },
      });

      // --- Create Audit Log for updated sale ---
      await tx.auditLog.create({
        data: {
          entityType: "Sale",
          entityId: sale.id,
          action: "UPDATE_SALE",
          oldData: JSON.stringify(sale),
          newData: JSON.stringify(updatedSale),
        },
      });

      return updatedSale;
    },
    {
      timeout: 15000,
    },
  );
};

/* ---------------- DELETE SALE ---------------- */

export const deleteSale = async (saleId) => {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { items: { include: { product: true } } },
  });

  if (!sale) throw new Error("Sale not found");

  const saleDate = new Date(sale.saleDate);
  saleDate.setHours(0, 0, 0, 0);

  const closing = await prisma.dailyClosing.findUnique({
    where: { date: saleDate },
  });

  if (closing && closing.status === "CLOSED") {
    throw new Error("Cannot delete sale. Day is closed.");
  }

  return prisma.$transaction(
    async (tx) => {
      for (const item of sale.items) {
        await tx.shopInventory.updateMany({
          where: { productId: item.productId },
          data: {
            quantity: { increment: item.quantity },
          },
        });
      }

      await tx.saleItem.deleteMany({
        where: { saleId },
      });

      await tx.sale.delete({
        where: { id: saleId },
      });

      // --- Create Audit Log for voided sale ---
      await tx.auditLog.create({
        data: {
          entityType: "Sale",
          entityId: sale.id,
          action: "VOID_SALE",
          oldData: JSON.stringify(sale),
        },
      });

      return { message: "Sale deleted and stock restored" };
    },
    {
      timeout: 15000,
    },
  );
};

export const parcelSale = async (items) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const closing = await prisma.dailyClosing.findUnique({
    where: { date: today },
  });

  if (closing?.status === "CLOSED") {
    throw new Error("Sales not allowed. Day already closed.");
  }

  return prisma.$transaction(
    async (tx) => {
      const productIds = items.map((i) => i.productId);

      const [products, inventories] = await Promise.all([
        tx.product.findMany({ where: { id: { in: productIds } } }),
        tx.shopInventory.findMany({ where: { productId: { in: productIds } } }),
      ]);

      // Create maps for instant lookup in memory (no more DB queries!)
      const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
      const inventoryMap = Object.fromEntries(
        inventories.map((inv) => [inv.productId, inv]),
      );

      let totalAmount = 0;

      for (const item of items) {
        const inventory = inventoryMap[item.productId];
        const product = productMap[item.productId];

        if (!product) throw new Error("Product not found");
        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        totalAmount += item.quantity * product.basePrice;
      }

      // 3. Create Sale (Trip: 1)
      const sale = await tx.sale.create({
        data: {
          saleNumber: `PARCEL-${Date.now()}`,
          totalAmount,
          status: "OPEN",
        },
      });

      // 4. Batch Create Items (Trip: 1)
      const saleItemsData = items.map((item) => ({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: productMap[item.productId].basePrice,
        totalPrice: item.quantity * productMap[item.productId].basePrice,
      }));
      await tx.saleItem.createMany({ data: saleItemsData });

      // 5. Concurrent Stock Update (Trip: 1)
      await Promise.all(
        items.map((item) =>
          tx.shopInventory.update({
            where: { productId: item.productId },
            data: { quantity: { decrement: item.quantity } },
          }),
        ),
      );

      const createdSale = await tx.sale.findUnique({
        where: { id: sale.id },
        include: { items: { include: { product: true } } },
      });

      // --- Create Audit Log for the new sale ---
      await tx.auditLog.create({
        data: {
          entityType: "parcelSale",
          entityId: sale.id,
          action: "CREATE_PARCEL_SALE",
          newData: JSON.stringify(createdSale),
        },
      });

      return sale;
    },
    {
      timeout: 15000,
    },
  );
};
