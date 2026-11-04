import type { Carrier, Product, Shipment } from "../types/models";

const MAX_PRODUCT_WEIGHT_KG = 100;
const MAX_DIMENSION_CM = 200;
const MIN_ON_TIME_RATE = 0;
const MAX_ON_TIME_RATE = 100;

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function validateProduct(
  product: Product
): { valid: boolean; errors: string[] } {
  if (!product) {
    return { valid: false, errors: ["El objeto de producto es requerido."] };
  }

  const errors: string[] = [];

  if (typeof product.sku !== "string" || product.sku.trim().length === 0) {
    errors.push("El SKU del producto no debe estar vacío.");
  }

  if (
    !isValidNumber(product.weightKg) ||
    product.weightKg <= 0 ||
    product.weightKg > MAX_PRODUCT_WEIGHT_KG
  ) {
    errors.push(
      `El peso (weightKg) debe ser mayor a 0 y menor o igual a ${MAX_PRODUCT_WEIGHT_KG}.`
    );
  }

  if (
    !product.dimensions ||
    !isValidNumber(product.dimensions.lengthCm) ||
    !isValidNumber(product.dimensions.widthCm) ||
    !isValidNumber(product.dimensions.heightCm) ||
    product.dimensions.lengthCm <= 0 ||
    product.dimensions.lengthCm > MAX_DIMENSION_CM ||
    product.dimensions.widthCm <= 0 ||
    product.dimensions.widthCm > MAX_DIMENSION_CM ||
    product.dimensions.heightCm <= 0 ||
    product.dimensions.heightCm > MAX_DIMENSION_CM
  ) {
    errors.push(
      `Todas las dimensiones (lengthCm, widthCm, heightCm) deben ser mayores a 0 y menores o iguales a ${MAX_DIMENSION_CM}.`
    );
  }

  if (!isValidNumber(product.stockQuantity) || product.stockQuantity < 0) {
    errors.push("La cantidad en stock (stockQuantity) debe ser mayor o igual a 0.");
  }

  if (
    !isValidNumber(product.minStockThreshold) ||
    product.minStockThreshold < 0
  ) {
    errors.push(
      "El umbral mínimo de stock (minStockThreshold) debe ser mayor o igual a 0."
    );
  }

  if (!isValidNumber(product.unitCostUSD) || product.unitCostUSD <= 0) {
    errors.push("El costo unitario (unitCostUSD) debe ser mayor a 0.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateShipment(
  shipment: Shipment
): { valid: boolean; errors: string[] } {
  if (!shipment) {
    return { valid: false, errors: ["El objeto de envío es requerido."] };
  }

  const errors: string[] = [];

  if (!isValidNumber(shipment.quantity) || shipment.quantity <= 0) {
    errors.push("La cantidad de unidades (quantity) debe ser mayor a 0.");
  }

  if (
    !isValidNumber(shipment.declaredValueUSD) ||
    shipment.declaredValueUSD <= 0
  ) {
    errors.push("El valor declarado (declaredValueUSD) debe ser mayor a 0.");
  }

  if (
    !shipment.destination ||
    !isValidNumber(shipment.destination.distanceKm) ||
    shipment.destination.distanceKm < 0
  ) {
    errors.push("La distancia de entrega (distanceKm) debe ser mayor o igual a 0.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateCarrier(
  carrier: Carrier
): { valid: boolean; errors: string[] } {
  if (!carrier) {
    return { valid: false, errors: ["El objeto de transportista es requerido."] };
  }

  const errors: string[] = [];

  if (
    !isValidNumber(carrier.baseRateUSD) ||
    carrier.baseRateUSD < 0 ||
    !isValidNumber(carrier.ratePerKgUSD) ||
    carrier.ratePerKgUSD < 0 ||
    !isValidNumber(carrier.ratePerKmUSD) ||
    carrier.ratePerKmUSD < 0
  ) {
    errors.push(
      "Las tarifas (baseRateUSD, ratePerKgUSD, ratePerKmUSD) deben ser mayores o iguales a 0."
    );
  }

  if (!isValidNumber(carrier.avgDeliveryDays) || carrier.avgDeliveryDays <= 0) {
    errors.push("El tiempo promedio de entrega (avgDeliveryDays) debe ser mayor a 0.");
  }

  if (
    !isValidNumber(carrier.onTimeRate) ||
    carrier.onTimeRate < MIN_ON_TIME_RATE ||
    carrier.onTimeRate > MAX_ON_TIME_RATE
  ) {
    errors.push(
      `La tasa de entrega a tiempo (onTimeRate) debe estar entre ${MIN_ON_TIME_RATE} y ${MAX_ON_TIME_RATE}.`
    );
  }

  if (!isValidNumber(carrier.maxWeightKg) || carrier.maxWeightKg <= 0) {
    errors.push("El peso máximo soportado (maxWeightKg) debe ser mayor a 0.");
  }

  if (!Array.isArray(carrier.operatesIn) || carrier.operatesIn.length < 1) {
    errors.push(
      "El transportista debe operar en al menos 1 país (operatesIn)."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}