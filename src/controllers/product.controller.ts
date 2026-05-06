import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { logger } from "../utils/logger";
import { SearchService } from "../services/search.service";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const products = category
      ? await ProductService.findByCategory(category as string)
      : await ProductService.findAll();
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    logger.error("Failed to fetch products", { error });
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query, category, minPrice, maxPrice } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "query param is required",
      });
    }

    const results = await SearchService.search({
      query: query as string,
      category: category as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    res.json({ success: true, ...results });
  } catch (error) {
    logger.error("Search failed", { error });
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await ProductService.findById(Number(req.params.id));
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    logger.error("Failed to fetch product", { error });
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch product" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, category } = req.body;
    if (!name || !price || stock === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "name, price, stock, and category are required",
      });
    }

    const result = await ProductService.create(req.body);

    // Warn if low stock
    if (result.lowStock) {
      logger.warn("Low stock on product creation", {
        id: result.product.id,
        stock: result.product.stock,
      });
    }

    res.status(201).json({ success: true, data: result.product });
  } catch (error) {
    logger.error("Failed to create product", { error });
    res
      .status(500)
      .json({ success: false, message: "Failed to create product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const result = await ProductService.update(Number(req.params.id), req.body);
    if (!result)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (result.lowStock) {
      logger.warn("Low stock after update", {
        id: result.product.id,
        stock: result.product.stock,
      });
    }

    res.json({ success: true, data: result.product });
  } catch (error) {
    logger.error("Failed to update product", { error });
    res
      .status(500)
      .json({ success: false, message: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const result = await ProductService.delete(Number(req.params.id));
    if (!result)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    logger.error("Failed to delete product", { error });
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product" });
  }
};
