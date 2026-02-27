import * as productService from "../services/product.service.js";

/* CREATE */
export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.log("Error creating product:", error);
    // next(error);
  }
};

/* GET ALL */
export const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error fetching products:", error);
    //  next(error);
  }
};

/* GET ONE */
export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    console.log("Error fetching product by ID:", error);
    // next(error);
  }
};

/* UPDATE */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    //next(error);
  }
};

/* DELETE */
export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    // next(error);
  }
};
