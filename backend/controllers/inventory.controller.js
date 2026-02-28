import * as inventoryService from "../services/inventory.service.js";

/**
 * @desc    Get all inventory items with product details
 * @route   GET /api/inventory
 */
export const getInventory = async (req, res) => {
  try {
    const inventory = await inventoryService.getInventory();
    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Restock a product (Increments existing stock)
 * @route   POST /api/inventory/restock
 */
export const restock = async (req, res) => {
  try {
    const { productId, quantity, costPrice, reason } = req.body;

    // Validation
    if (!productId || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID and quantity are required for restocking" 
      });
    }

    const result = await inventoryService.restockInventory(
      productId, 
      Number(quantity), 
      Number(costPrice) || 0, 
      reason
    );

    res.status(200).json({
      success: true,
      message: "Inventory restocked successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Manual stock adjustment (For damages, corrections, etc.)
 * @route   PATCH /api/inventory/adjust
 */
export const handleUpdate = async (req, res) => {
  try {
    const { productId, changeQty, reason } = req.body;

    if (!productId || changeQty === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID and change quantity are required" 
      });
    }

    const updated = await inventoryService.adjustInventory(
      productId, 
      Number(changeQty), 
      reason
    );

    res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get adjustment history for a specific product
 * @route   GET /api/inventory/history/:productId
 */
export const getHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const history = await inventoryService.getStockAdjustments(productId);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete an inventory record (only if quantity is 0)
 * @route   DELETE /api/inventory/:id
 */
export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    await inventoryService.deleteInventory(id);
    res.status(200).json({
      success: true,
      message: "Inventory record deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};