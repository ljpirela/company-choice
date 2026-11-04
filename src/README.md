# TrackFlow — Modelos de Dominio y Utilidades en TypeScript (`src/`)

Capa lógica de procesamiento de inventario, envíos, reportes agregados, scoring de transportistas y validaciones de negocio para **TrackFlow Tech** (Los Ángeles y Zaragoza).

## Estructura

- `types/models.ts`: Interfaces (`Product`, `Shipment`, `Carrier`, `InventoryMovement`, `Dimensions`, `Destination`) y datasets de prueba.
- `utils/collections.ts`: Filtrado de inventario y ordenamiento inmutable de productos y transportistas.
- `utils/search.ts`: Búsqueda lineal (`findProductBySKU`, `findShipmentById`) y búsqueda binaria (`binarySearchProductByWeight`).
- `utils/transformations.ts`: Cálculo de tarifas de envío, scoring/selección de transportistas y reportes agregados.
- `utils/validations.ts`: Validaciones estrictas de reglas de negocio.
- `demo.ts`: Suite ejecutable de pruebas funcionales y casos límite.
- `index.html`: Consola interactiva con Tailwind CSS para pruebas manuales en navegador.

## Comandos de Validación y Ejecución

1. **Verificar tipado estático sin errores:**
   ```bash
   npm run typecheck
   # equivalente a: npx tsc --noEmit