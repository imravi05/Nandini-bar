import * as salesService from "../services/sales.service.js";

export const createSale = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid sale items" });
    }

    const sale = await salesService.createSale(items);

    res.status(201).json(sale);
  } catch (error) {
    next(error);
  }
};