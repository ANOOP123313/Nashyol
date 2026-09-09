export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  inStock?: boolean;
  badge?: string;
  brand?: string;
}

export const allProducts: Product[] = [];

// Helper function to get products by category
export const getProductsByCategory = (category: string): Product[] => {
  return allProducts.filter((product) => product.category === category);
};

// Helper function to get unique subcategories for a category
export const getSubcategoriesByCategory = (category: string): string[] => {
  const products = getProductsByCategory(category);
  const subcategories = products
    .map((p) => p.subcategory)
    .filter((s): s is string => s !== undefined);
  return [...new Set(subcategories)];
};

// Helper function to get unique brands for a category
export const getBrandsByCategory = (category: string): string[] => {
  const products = getProductsByCategory(category);
  const brands = products
    .map((p) => p.brand)
    .filter((b): b is string => b !== undefined);
  return [...new Set(brands)];
};
