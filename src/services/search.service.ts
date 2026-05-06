import esClient from "../config/elasticsearch";
import { logger } from "../utils/logger";
import { SearchProductDTO } from "../types/product.types";

const INDEX = process.env.ES_INDEX || "products";

export type ProductDocument = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
};

export class SearchService {
  static async indexProduct(product: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    category: string;
    createdAt?: Date;
  }) {
    try {
      await esClient.index({
        index: INDEX,
        id: String(product.id),
        document: {
          id: product.id,
          name: product.name,
          description: product.description || "",
          price: product.price,
          stock: product.stock,
          category: product.category,
          createdAt: product.createdAt || new Date(),
        },
      });

      logger.debug("Product indexed in ES", { id: product.id });
    } catch (error) {
      logger.error("Failed to index product in ES", { error });
    }
  }

  static async removeProduct(id: number) {
    try {
      await esClient.delete({
        index: INDEX,
        id: String(id),
      });

      logger.debug("Product removed from ES index", { id });
    } catch (error) {
      logger.error("Failed to remove product from ES", { error });
    }
  }

  static async search(params: SearchProductDTO) {
    const { query, category, minPrice, maxPrice } = params;

    type ESFilter = Record<string, unknown>;
    const filters: ESFilter[] = [];

    if (category) {
      filters.push({ term: { category } });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.push({
        range: {
          price: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        },
      });
    }

    const esQuery = {
      index: INDEX,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ["name^3", "description", "category"],
                fuzziness: "AUTO",
              },
            },
          ],
          filter: filters,
        },
      },
      highlight: {
        fields: {
          name: {},
          description: {},
        },
      },
    };

    const result = await esClient.search<ProductDocument>(esQuery);

    const hits = result.hits.hits.map((hit) => ({
      ...(hit._source ?? {}),
      score: hit._score ?? 0,
      highlights: hit.highlight ?? {},
    }));

    logger.info("ES search completed", {
      query,
      total: result.hits.total,
      hits: hits.length,
    });

    return {
      total:
        typeof result.hits.total === "number"
          ? result.hits.total
          : result.hits.total?.value || 0,
      results: hits,
    };
  }

  static async syncAllProducts(
    products: {
      id: number;
      name: string;
      description: string | null;
      price: number;
      stock: number;
      category: string;
      createdAt?: Date;
    }[],
  ) {
    if (products.length === 0) return;

    const operations = products.flatMap((p) => [
      { index: { _index: INDEX, _id: String(p.id) } },
      {
        id: p.id,
        name: p.name,
        description: p.description || "",
        price: p.price,
        stock: p.stock,
        category: p.category,
        createdAt: p.createdAt || new Date(),
      },
    ]);

    const result = await esClient.bulk({ operations });

    logger.info("ES bulk sync completed", {
      count: products.length,
      errors: result.errors,
    });
  }
}
