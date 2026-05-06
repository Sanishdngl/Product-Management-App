import Product from "../models/product.model";
import { cache } from "../utils/cache";
import { CacheKeys } from "../utils/cacheKeys";
import { logger } from "../utils/logger";
import { CreateProductDTO, UpdateProductDTO } from "../types/product.types";
import { SearchService } from "./search.service";
import { publishStockAlert } from "../jobs/stockProducer";

const LOW_STOCK_THRESHOLD = 10;

export class ProductService {
  static async findAll() {
    const cacheKey = CacheKeys.allProducts();
    const cached = await cache.get<Product[]>(cacheKey);
    if (cached) return cached;

    const products = await Product.findAll({ order: [["createdAt", "DESC"]] });
    await cache.set(cacheKey, products);
    logger.info("Products fetched from DB", { count: products.length });
    return products;
  }

  static async findById(id: number) {
    const cacheKey = CacheKeys.productById(id);
    const cached = await cache.get<Product>(cacheKey);
    if (cached) return cached;

    const product = await Product.findByPk(id);
    if (product) await cache.set(cacheKey, product);
    return product;
  }

  static async findByCategory(category: string) {
    const cacheKey = CacheKeys.productsByCategory(category);
    const cached = await cache.get<Product[]>(cacheKey);
    if (cached) return cached;

    const products = await Product.findAll({
      where: { category },
      order: [["createdAt", "DESC"]],
    });
    await cache.set(cacheKey, products);
    return products;
  }

  static async create(data: CreateProductDTO) {
    const product = await Product.create(data);

    await cache.delPattern("products:*");
    await SearchService.indexProduct(product.toJSON());
    logger.info("Product created", { id: product.id, name: product.name });

    if (product.stock <= LOW_STOCK_THRESHOLD) {
      await publishStockAlert({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        threshold: LOW_STOCK_THRESHOLD,
        timestamp: new Date(),
      });
      return { product, lowStock: true };
    }

    return { product, lowStock: false };
  }

  static async update(id: number, data: UpdateProductDTO) {
    const product = await Product.findByPk(id);
    if (!product) return null;

    await product.update(data);

    await cache.del(CacheKeys.productById(id));
    await cache.delPattern("products:*");
    await SearchService.indexProduct(product.toJSON());
    logger.info("Product updated", { id, changes: Object.keys(data) });

    if (data.stock !== undefined && data.stock <= LOW_STOCK_THRESHOLD) {
      await publishStockAlert({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        threshold: LOW_STOCK_THRESHOLD,
        timestamp: new Date(),
      });
      return { product, lowStock: true };
    }

    return { product, lowStock: false };
  }

  static async delete(id: number) {
    const product = await Product.findByPk(id);
    if (!product) return null;

    await product.destroy();

    await cache.del(CacheKeys.productById(id));
    await cache.delPattern("products:*");
    await SearchService.removeProduct(id);
    logger.info("Product deleted", { id });
    return true;
  }
}
