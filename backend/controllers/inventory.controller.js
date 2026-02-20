import * as inventoryService from "../services/inventory.service.js";

export const getInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getInventory();
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

export const adjustInventory = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== "number") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const result = await inventoryService.adjustInventory(productId, quantity);
    res.json(result);
  } catch (error) {
    next(error);
  }
};