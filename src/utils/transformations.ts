import type {
  Carrier,
  Product,
  ProductCategory,
  Shipment,
  ShipmentPriority,
  ShipmentStatus,
} from "../types/models";

const PRIORITY_SURCHARGE_MULTIPLIERS: Record<ShipmentPriority, number> = {
  Standard: 1.0,
  Express: 1.3,
  "Same-day": 1.6,
};

const MIN_SUITABLE_CARRIER_SCORE = 50;

function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateShippingCost(
  shipment: Shipment,
  product: Product,
  carrier: Carrier
): number {
  const baseCost = carrier.baseRateUSD;
  const weightCost =
    product.weightKg * carrier.ratePerKgUSD * shipment.quantity;
  const distanceCost = shipment.destination.distanceKm * carrier.ratePerKmUSD;

  const subtotal = baseCost + weightCost + distanceCost;
  const priorityMultiplier =
    PRIORITY_SURCHARGE_MULTIPLIERS[shipment.priority] ?? 1.0;

  return roundToTwoDecimals(subtotal * priorityMultiplier);
}

export function scoreCarrierForShipment(
  carrier: Carrier,
  shipment: Shipment,
  product: Product
): number {
  const countryPoints = carrier.operatesIn.includes(
    shipment.destination.country
  )
    ? 20
    : 0;

  const totalWeightKg = product.weightKg * shipment.quantity;
  const weightPoints = totalWeightKg <= carrier.maxWeightKg ? 20 : 0;

  const priorityPoints = carrier.acceptsPriority.includes(shipment.priority)
    ? 15
    : 0;

  const fragilePoints = !product.isFragile || carrier.handlesFragile ? 15 : 0;

  const reliabilityPoints = carrier.onTimeRate * 0.3;

  const totalScore =
    countryPoints +
    weightPoints +
    priorityPoints +
    fragilePoints +
    reliabilityPoints;

  return roundToTwoDecimals(totalScore);
}

export function selectBestCarrier(
  carriers: Carrier[],
  shipment: Shipment,
  product: Product
): { carrier: Carrier; score: number; cost: number } | null {
  if (!Array.isArray(carriers) || carriers.length === 0) {
    return null;
  }

  const suitableCarriers = carriers
    .map((carrier) => ({
      carrier,
      score: scoreCarrierForShipment(carrier, shipment, product),
      cost: calculateShippingCost(shipment, product, carrier),
    }))
    .filter((candidate) => candidate.score >= MIN_SUITABLE_CARRIER_SCORE);

  if (suitableCarriers.length === 0) {
    return null;
  }

  return suitableCarriers.reduce((best, current) => {
    if (current.cost < best.cost) {
      return current;
    }
    if (current.cost === best.cost && current.score > best.score) {
      return current;
    }
    return best;
  });
}

export function countProductsByCategory(
  products: Product[]
): Record<ProductCategory, number> {
  const initialCounts: Record<ProductCategory, number> = {
    Fashion: 0,
    Electronics: 0,
    Cosmetics: 0,
    Home: 0,
    Other: 0,
  };

  if (!Array.isArray(products)) {
    return initialCounts;
  }

  return products.reduce((counts, product) => {
    counts[product.category] = (counts[product.category] ?? 0) + 1;
    return counts;
  }, initialCounts);
}

export function calculateTotalInventoryValue(products: Product[]): number {
  if (!Array.isArray(products) || products.length === 0) {
    return 0;
  }

  const totalValue = products.reduce(
    (sum, product) => sum + product.stockQuantity * product.unitCostUSD,
    0
  );

  return roundToTwoDecimals(totalValue);
}

export function calculateAverageShipmentDistance(
  shipments: Shipment[]
): number {
  if (!Array.isArray(shipments) || shipments.length === 0) {
    return 0;
  }

  const totalDistance = shipments.reduce(
    (sum, shipment) => sum + shipment.destination.distanceKm,
    0
  );

  return roundToTwoDecimals(totalDistance / shipments.length);
}

export function groupShipmentsByStatus(
  shipments: Shipment[]
): Record<ShipmentStatus, Shipment[]> {
  const initialGroups: Record<ShipmentStatus, Shipment[]> = {
    Pending: [],
    Assigned: [],
    "In transit": [],
    Delivered: [],
    Failed: [],
  };

  if (!Array.isArray(shipments)) {
    return initialGroups;
  }

  return shipments.reduce((groups, shipment) => {
    groups[shipment.status] = [...groups[shipment.status], shipment];
    return groups;
  }, initialGroups);
}

export function findTopCarriers(
  shipments: Shipment[],
  topN: number
): Array<{ carrier: string; count: number }> {
  if (
    !Array.isArray(shipments) ||
    shipments.length === 0 ||
    typeof topN !== "number" ||
    topN <= 0
  ) {
    return [];
  }

  const usageCounts = shipments.reduce<Record<string, number>>(
    (counts, shipment) => {
      if (shipment.carrier !== null && shipment.carrier.trim() !== "") {
        counts[shipment.carrier] = (counts[shipment.carrier] ?? 0) + 1;
      }
      return counts;
    },
    {}
  );

  return Object.entries(usageCounts)
    .map(([carrier, count]) => ({ carrier, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}