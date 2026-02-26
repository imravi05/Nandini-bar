import * as inventoryService from "../services/inventory.service.js";

/* GET ALL */
export const getInventory = async (req, res, next) => {
  try {
    const result = await inventoryService.getInventory();
    res.json({ success: true, message: "Inventory retrieved", data: result });
  } catch (error) {
    next(error);
  }
};

/* CREATE */
export const createInventory = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const result = await inventoryService.createInventory(
      productId,
      quantity
    );

    res.status(201).json({ success: true, message: "Inventory created", data: result });
  } catch (error) {
    next(error);
  }
};

/* ADJUST */
export const adjustInventory = async (req, res, next) => {
  try {
    const { productId, changeQty, reason } = req.body;

    const result = await inventoryService.adjustInventory(
      productId,
      changeQty,
      reason
    );

    res.json({ success: true, message: "Inventory adjusted", data: result });
  } catch (error) {
    next(error);
  }
};

/* UPDATE EXACT */
export const updateInventory = async (req, res, next) => {
  try {
    const { quantity, reason } = req.body;

    const result = await inventoryService.updateInventory(
      req.params.id,
      quantity,
      reason
    );

    res.json({ success: true, message: "Inventory updated", data: result });
  } catch (error) {
    next(error);
  }
};

/* DELETE */
export const deleteInventory = async (req, res, next) => {
  try {
    await inventoryService.deleteInventory(req.params.id);
    res.json({ success: true, message: "Inventory deleted" });
  } catch (error) {
    next(error);
  }
};

/* HISTORY */
export const getStockAdjustments = async (req, res, next) => {
  try {
    const result = await inventoryService.getStockAdjustments(
      req.params.productId
    );
    res.json({ success: true, message: "Stock adjustments retrieved", data: result });
  } catch (error) {
    next(error);
  }
};