import * as salesService from "../services/sales.service.js";

/* CREATE */
export const createSale = async (req, res, next) => {
  try {
    const sale = await salesService.createSale(req.body.items);
    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

/* GET ALL */
export const getSales = async (req, res, next) => {
  try {
    const result = await salesService.getSales(req.query);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/* GET BY ID */
export const getSaleById = async (req, res, next) => {
  try {
    const sale = await salesService.getSaleById(req.params.id);
    res.json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

/* UPDATE */
export const updateSale = async (req, res, next) => {
  try {
    const updated = await salesService.updateSale(
      req.params.id,
      req.body.items
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/* DELETE */
export const deleteSale = async (req, res, next) => {
  try {
    const result = await salesService.deleteSale(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const parcelSale = async (req, res, next) => {
  try {
    console.log("parcelSale items:", req.body.items, Array.isArray(req.body.items));
    const sale = await salesService.parcelSale(req.body.items); 
    res.status(201).json({ success: true, data: sale });
  } catch (error) {

    next(error);
  }
};