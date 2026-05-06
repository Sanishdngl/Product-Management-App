export const CacheKeys = {
  allProducts: () => "products:all",
  productById: (id: number) => `products:${id}`,
  productsByCategory: (category: string) => `products:category:${category}`,
};
