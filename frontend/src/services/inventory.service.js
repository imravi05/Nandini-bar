import api from "./api";

// GET /api/inventory — fetch all inventory items with product details
const getInventory = async () => {
  const response = await api.get("/inventory");
  return response.data;
};

// POST /api/inventory/restock — add new stock (upserts; creates if not exists)
// Takes: productId, quantity, costPrice (optional), reason (optional)
const restockInventory = async (
  productId,
  quantity,
  costPrice = 0,
  reason = "Supplier Restock",
) => {
  const response = await api.post("/inventory/restock", {
    productId,
    quantity,
    costPrice,
    reason,
  });
  return response.data;
};

// PATCH /api/inventory/adjust — manual correction (can be negative for damages)
// Takes: productId, changeQty, reason
const adjustInventory = async (productId, changeQty, reason) => {
  const response = await api.patch("/inventory/adjust", {
    productId,
    changeQty,
    reason,
  });
  return response.data;
};

// GET /api/inventory/history/:productId — get stock adjustment logs for a product
const getStockHistory = async (productId) => {
  const response = await api.get(`/inventory/history/${productId}`);
  return response.data;
};

// DELETE /api/inventory/delete — delete an inventory record (only if quantity = 0)
const deleteInventory = async (id) => {
  const response = await api.delete("/inventory/delete", { data: { id } });
  return response.data;
};

const inventoryService = {
  getInventory,
  restockInventory,
  adjustInventory,
  getStockHistory,
  deleteInventory,
};

export default inventoryService;
