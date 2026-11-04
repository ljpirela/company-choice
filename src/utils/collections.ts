import type {
  Carrier,
  Product,
  ProductCategory,
  WarehouseLocation,
} from "../types/models";

export function filterProductsByWarehouse(
  products: Product[],
  warehouse: WarehouseLocation
): Product[] {
  if (!Array.isArray(products)) {
    return [];
  }
  return products.filter((product) => product.warehouse === warehouse);
}

export function filterProductsByCategory(
  products: Product[],
  category: ProductCategory
): Product[] {
  if (!Array.isArray(products)) {
    return [];
  }
  return products.filter((product) => product.category === category);
}

export function filterLowStockProducts(products: Product[]): Product[] {
  if (!Array.isArray(products)) {
    return [];
  }
  return products.filter(
    (product) => product.stockQuantity <= product.minStockThreshold
  );
}

export function sortProductsByStock(
  products: Product[],
  order: "asc" | "desc"
): Product[] {
  if (!Array.isArray(products)) {
    return [];
  }
  return [...products].sort((a, b) =>
    order === "asc"
      ? a.stockQuantity - b.stockQuantity
      : b.stockQuantity - a.stockQuantity
  );
}

export function sortCarriersByReliability(
  carriers: Carrier[],
  order: "asc" | "desc"
): Carrier[] {
  if (!Array.isArray(carriers)) {
    return [];
  }
  return [...carriers].sort((a, b) =>
    order === "asc" ? a.onTimeRate - b.onTimeRate : b.onTimeRate - a.onTimeRate
  );
}