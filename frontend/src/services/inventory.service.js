import api from "./api";

const getInventory = async () => {
  const response = await api.get("/inventory");
  return response.data;
};

const createInventory = async (productId, quantity) => {
  const response = await api.post("/inventory", { productId, quantity });
  return response.data;
};

const adjustInventory = async (productId, changeQty, reason) => {
  const response = await api.post("/inventory/adjust", {
    productId,
    changeQty,
    reason,
  });
  return response.data;
};

const updateInventory = async (id, quantity, reason) => {
  const response = await api.put(`/inventory/${id}`, { quantity, reason });
  return response.data;
};

const deleteInventory = async (id) => {
  const response = await api.delete(`/inventory/${id}`);
  return response.data;
};

const getStockAdjustments = async (productId) => {
  const response = await api.get(`/inventory/adjustments/${productId}`);
  return response.data;
};

const inventoryService = {
  getInventory,
  createInventory,
  adjustInventory,
  updateInventory,
  deleteInventory,
  getStockAdjustments,
};

export default inventoryService;
