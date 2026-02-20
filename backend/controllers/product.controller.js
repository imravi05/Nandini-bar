import * as productService from "../services/product.service.js";

export const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};