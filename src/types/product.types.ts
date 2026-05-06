export interface ProductAttributes {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
}

export interface SearchProductDTO {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
