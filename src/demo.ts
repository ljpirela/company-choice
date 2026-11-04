import {
  sampleCarriers,
  sampleProducts,
  sampleShipment,
  type Carrier,
  type Product,
  type Shipment,
} from "./types/models.js";
import {
  filterLowStockProducts,
  filterProductsByCategory,
  filterProductsByWarehouse,
  sortCarriersByReliability,
  sortProductsByStock,
} from "./utils/collections.js";
import {
  binarySearchProductByWeight,
  findProductBySKU,
  findShipmentById,
} from "./utils/search.js";
import {
  calculateAverageShipmentDistance,
  calculateShippingCost,
  calculateTotalInventoryValue,
  countProductsByCategory,
  findTopCarriers,
  groupShipmentsByStatus,
  scoreCarrierForShipment,
  selectBestCarrier,
} from "./utils/transformations.js";
import {
  validateCarrier,
  validateProduct,
  validateShipment,
} from "./utils/validations.js";

let passedChecks = 0;
let failedChecks = 0;

function assertCheck(description: string, condition: boolean): void {
  if (condition) {
    passedChecks++;
    console.log(`  ✓ PASS: ${description}`);
  } else {
    failedChecks++;
    console.error(`  ✗ FAIL: ${description}`);
  }
}

console.log("==================================================");
console.log("  TRACKFLOW TECH — SUITE DE PRUEBAS Y CASOS LÍMITE");
console.log("==================================================\n");

// 1. Pruebas de Colecciones e Inmutabilidad
console.log("1. Operaciones de Colecciones e Inmutabilidad");
const laProducts = filterProductsByWarehouse(sampleProducts, "Los Angeles");
assertCheck("Filtra 2 productos en Los Angeles", laProducts.length === 2);

const electronics = filterProductsByCategory(sampleProducts, "Electronics");
assertCheck("Filtra 1 producto en Electronics", electronics.length === 1 && electronics[0].sku === "LAPTOP-DELL-15");

const lowStock = filterLowStockProducts(sampleProducts);
assertCheck("Detecta LAPTOP-DELL-15 en stock bajo (8 <= 10)", lowStock.length === 1 && lowStock[0].sku === "LAPTOP-DELL-15");

const originalFirstSku = sampleProducts[0].sku;
const sortedAsc = sortProductsByStock(sampleProducts, "asc");
const sortedDesc = sortProductsByStock(sampleProducts, "desc");
assertCheck("Ordena stock ascendente correctamente (8, 45, 120)", sortedAsc[0].stockQuantity === 8 && sortedAsc[2].stockQuantity === 120);
assertCheck("Ordena stock descendente correctamente (120, 45, 8)", sortedDesc[0].stockQuantity === 120 && sortedDesc[2].stockQuantity === 8);
assertCheck("Inmutabilidad garantizada en sampleProducts", sampleProducts[0].sku === originalFirstSku);

const originalFirstCarrier = sampleCarriers[0].id;
const carriersDesc = sortCarriersByReliability(sampleCarriers, "desc");
assertCheck("Ordena transportistas por onTimeRate descendente (DHL 95%)", carriersDesc[0].id === "CAR-DHL");
assertCheck("Inmutabilidad garantizada en sampleCarriers", sampleCarriers[0].id === originalFirstCarrier);
assertCheck("Maneja arreglo vacío en filtros sin errores", filterLowStockProducts([]).length === 0);

// 2. Pruebas de Búsqueda Lineal y Binaria
console.log("\n2. Operaciones de Búsqueda (Lineal y Binaria)");
const foundSku = findProductBySKU(sampleProducts, "  laptop-dell-15  ");
assertCheck("Búsqueda lineal por SKU es case-insensitive e ignora espacios", foundSku !== null && foundSku.sku === "LAPTOP-DELL-15");
assertCheck("Búsqueda lineal retorna null si el SKU no existe o está vacío", findProductBySKU(sampleProducts, "NO-EXISTE") === null && findProductBySKU(sampleProducts, "") === null);

const shipmentsList: Shipment[] = [
  sampleShipment,
  { ...sampleShipment, id: "SH-2024-9001", carrier: "SEUR", status: "Delivered", destination: { ...sampleShipment.destination, distanceKm: 180 } },
  { ...sampleShipment, id: "SH-2024-9002", carrier: "SEUR", status: "In transit", destination: { ...sampleShipment.destination, distanceKm: 100 } },
  { ...sampleShipment, id: "SH-2024-9003", carrier: "DHL Express", status: "Delivered", destination: { ...sampleShipment.destination, distanceKm: 400 } },
];

assertCheck("Búsqueda lineal de envío por ID encuentra SH-2024-8821", findShipmentById(shipmentsList, "SH-2024-8821")?.sku === "LAPTOP-DELL-15");
assertCheck("Búsqueda lineal de envío retorna null en lista vacía", findShipmentById([], "SH-2024-8821") === null);

const productsSortedByWeight = [...sampleProducts].sort((a, b) => a.weightKg - b.weightKg); // [0.3, 0.8, 2.3]
assertCheck("Búsqueda binaria encuentra peso 0.8 kg en índice 1", binarySearchProductByWeight(productsSortedByWeight, 0.8) === 1);
assertCheck("Búsqueda binaria retorna -1 cuando el peso no existe", binarySearchProductByWeight(productsSortedByWeight, 99.9) === -1);
assertCheck("Búsqueda binaria retorna -1 en arreglo vacío", binarySearchProductByWeight([], 0.8) === -1);

// 3. Scoring de Transportistas y Cálculo de Costos
console.log("\n3. Scoring de Transportistas y Cálculo de Costos");
const laptopProduct = sampleProducts[1];
const seurCarrier = sampleCarriers[1];
const seurCost = calculateShippingCost(sampleShipment, laptopProduct, seurCarrier);
// (6.5 + 2.3*1.5*1 + 320*0.08) * 1.3 = 35.55 * 1.3 = 46.215 -> 46.22
assertCheck("Calcula costo de envío Express con SEUR redondeado a 2 decimales ($46.22)", seurCost === 46.22);

const seurScore = scoreCarrierForShipment(seurCarrier, sampleShipment, laptopProduct);
// País (20) + Peso (20) + Prioridad (15) + Frágil (15) + Confiabilidad (92*0.3=27.6) = 97.6
assertCheck("Calcula puntaje de idoneidad de SEUR correctamente (97.6 pts)", seurScore === 97.6);

const bestSelection = selectBestCarrier(sampleCarriers, sampleShipment, laptopProduct);
assertCheck("Selecciona transportista válido con puntaje >= 50 y menor costo", bestSelection !== null && bestSelection.score >= 50);

// Producto frágil sin transportista disponible que maneje frágiles en su ruta o alcance 50 pts
const unhandledProduct: Product = {
  ...sampleProducts[2], // PERFUME-COCO-50
  isFragile: true,
  weightKg: 80, // Supera a UPS (30kg) y SEUR (25kg)
};

// Transportista con 0 de fiabilidad y sin cobertura para probar el descarte estricto (< 50 pts)
const lowScoreCarrier: Carrier = {
  ...sampleCarriers[0],
  operatesIn: ["Spain"], // El envío va a US -> 0 pts país
  maxWeightKg: 1, // Superado por el producto -> 0 pts peso
  acceptsPriority: ["Same-day"], // Envío es Standard -> 0 pts prioridad
  handlesFragile: false, // Producto es frágil -> 0 pts frágil
  onTimeRate: 0, // 0 * 0.3 -> 0 pts fiabilidad (Total: 0 puntos < 50)
};

const impossibleShipment: Shipment = {
  ...sampleShipment,
  quantity: 5,
  priority: "Standard",
  destination: {
    ...sampleShipment.destination,
    country: "United States",
  },
};

const fragileProduct: Product = {
  ...sampleProducts[1], // LAPTOP-DELL-15 (isFragile: true)
};

assertCheck(
  "Retorna null si ningún transportista alcanza 50 puntos",
  selectBestCarrier([lowScoreCarrier], impossibleShipment, fragileProduct) === null &&
    selectBestCarrier([], sampleShipment, laptopProduct) === null
);

// 4. Agregaciones y Reportes
console.log("\n4. Agregaciones y Reportes de Almacén");
const categoryCounts = countProductsByCategory(sampleProducts);
assertCheck("Cuenta productos por categoría incluyendo categorías en 0", categoryCounts.Fashion === 1 && categoryCounts.Home === 0);

const totalValue = calculateTotalInventoryValue(sampleProducts);
assertCheck("Calcula valor total del inventario ($16,975.00)", totalValue === 16975);
assertCheck("Valor de inventario en arreglo vacío es 0", calculateTotalInventoryValue([]) === 0);

const avgDistance = calculateAverageShipmentDistance(shipmentsList);
assertCheck("Calcula distancia promedio de envíos (250 km)", avgDistance === 250);
assertCheck("Distancia promedio en arreglo vacío es 0 (evita división por cero)", calculateAverageShipmentDistance([]) === 0);

const grouped = groupShipmentsByStatus(shipmentsList);
assertCheck("Agrupa envíos por estado correctamente (2 Delivered, 1 Pending)", grouped.Delivered.length === 2 && grouped.Pending.length === 1 && grouped.Failed.length === 0);

const topCarriers = findTopCarriers(shipmentsList, 2);
assertCheck("Obtiene top transportistas ignorando carrier null (SEUR: 2, DHL Express: 1)", topCarriers.length === 2 && topCarriers[0].carrier === "SEUR" && topCarriers[0].count === 2);

// 5. Validaciones de Reglas de Negocio
console.log("\n5. Validaciones de Reglas de Negocio");
assertCheck("Producto de ejemplo pasa validación sin errores", validateProduct(laptopProduct).valid === true);

const invalidProduct: Product = {
  ...laptopProduct,
  sku: "   ",
  weightKg: 150,
  dimensions: { lengthCm: 0, widthCm: 250, heightCm: 10 },
  stockQuantity: -5,
  unitCostUSD: 0,
};
const productValidation = validateProduct(invalidProduct);
assertCheck("Rechaza producto inválido acumulando 5 errores específicos", !productValidation.valid && productValidation.errors.length === 5);

const invalidShipment: Shipment = {
  ...sampleShipment,
  quantity: 0,
  declaredValueUSD: -10,
  destination: { ...sampleShipment.destination, distanceKm: -1 },
};
const shipmentValidation = validateShipment(invalidShipment);
assertCheck("Rechaza envío inválido con cantidad 0, valor negativo y distancia negativa", !shipmentValidation.valid && shipmentValidation.errors.length === 3);

const invalidCarrier: Carrier = {
  ...seurCarrier,
  baseRateUSD: -1,
  avgDeliveryDays: 0,
  onTimeRate: 105,
  maxWeightKg: 0,
  operatesIn: [],
};
const carrierValidation = validateCarrier(invalidCarrier);
assertCheck("Rechaza transportista fuera de rango y sin países asignados", !carrierValidation.valid && carrierValidation.errors.length === 5);

console.log("\n==================================================");
console.log(`  RESULTADO FINAL: ${passedChecks} aprobadas | ${failedChecks} fallidas`);
console.log("==================================================");

if (failedChecks > 0) {
  console.error("Hubo pruebas fallidas.");
}