import type { Product, Shipment } from "../types/models";

export function findProductBySKU(
  products: Product[],
  sku: string
): Product | null {
  if (!Array.isArray(products) || typeof sku !== "string" || sku.trim() === "") {
    return null;
  }

  const normalizedTargetSku = sku.trim().toLowerCase();

  for (let i = 0; i < products.length; i++) {
    if (products[i].sku.toLowerCase() === normalizedTargetSku) {
      return products[i];
    }
  }

  return null;
}

export function findShipmentById(
  shipments: Shipment[],
  id: string
): Shipment | null {
  if (!Array.isArray(shipments) || typeof id !== "string" || id.trim() === "") {
    return null;
  }

  for (let i = 0; i < shipments.length; i++) {
    if (shipments[i].id === id) {
      return shipments[i];
    }
  }

  return null;
}

export function binarySearchProductByWeight(
  sortedProducts: Product[],
  targetWeight: number
): number {
  if (
    !Array.isArray(sortedProducts) ||
    sortedProducts.length === 0 ||
    typeof targetWeight !== "number" ||
    Number.isNaN(targetWeight)
  ) {
    return -1;
  }

  let low = 0;
  let high = sortedProducts.length - 1;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    const currentWeight = sortedProducts[mid].weightKg;

    if (currentWeight === targetWeight) {
      return mid;
    } else if (currentWeight < targetWeight) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}