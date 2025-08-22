# Documentación del Sistema "Operación"

## 1. Resumen General

El libro de Google Sheets "Operación" es una aplicación integral para la gestión de un negocio de delivery de productos. Centraliza la toma de pedidos, la gestión de inventario (SKU), la planificación de adquisiciones, la logística de rutas de entrega y un módulo financiero completo para la conciliación de pagos. El sistema está automatizado mediante un extenso Google Apps Script y utiliza múltiples diálogos HTML personalizados para ofrecer una experiencia de usuario interactiva y guiada.

---

## 2. Estructura de Datos: Hojas del Libro

El sistema se basa en un modelo de datos distribuido en varias hojas. La función `setupProjectSheets()` se encarga de crear y mantener esta estructura.

| Nombre de la Hoja        | Columnas Principales                                                                                                                                                                                            | Propósito                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Orders**               | `Order #`, `Nombre y apellido`, `Email`, `Phone`, `Shipping Address`, `Shipping City`, `Estado del pago`, `Item Name`, `Item SKU`, `Item Quantity`, `Item Price`, `Importe total del pedido`, `Payment Method`      | Contiene todos los pedidos importados. Es la fuente principal de datos para la demanda de productos.                                      |
| **SKU**                  | `Nombre Producto`, `Producto Base`, `Formato Compra`, `Cantidad Compra`, `Unidad Compra`, `Categoría`, `Cantidad Venta`, `Unidad Venta`, `Proveedor`                                                               | Catálogo maestro de productos. Define cómo se venden los productos y cómo se compran sus insumos (productos base).                     |
| **Proveedores**          | `Nombre`, `Teléfono`                                                                                                                                                                                            | Lista de proveedores y su información de contacto.                                                                                      |
| **MovimientosBancarios** | `MONTO`, `DESCRIPCIÓN MOVIMIENTO`, `FECHA`, `SALDO`, `N° DOCUMENTO`, `CARGO/ABONO`, `Asignado a Pedido`                                                                                                          | Registro de todos los movimientos importados desde el banco. Utilizado para la conciliación de pagos.                                   |
| **AsignacionesHistoricas** | `ID_Pago`, `ID_Pedido`, `Nombre_Banco`, `Nombre_Pedido`, `Monto`, `Fecha_Asignacion`                                                                                                                            | Un log histórico de todas las conciliaciones de pago-pedido realizadas, para auditoría y consulta.                                        |
| **ClientBankData**       | `PaymentIdentifier`, `CustomerRUT`, `CustomerName`, `LastSeen`                                                                                                                                                  | Almacena la relación entre el nombre extraído de una transferencia y el RUT de un cliente para futuras conciliaciones automáticas.      |
| **Lista de Envasado**    | `Cantidad`, `Inventario`, `Nombre Producto`                                                                                                                                                                     | Hoja generada dinámicamente que lista los productos a envasar, agrupados por categoría, basándose en los pedidos actuales.                |
| **Lista de Adquisiciones** | `Producto Base`, `Cantidad a Comprar`, `Formato de Compra`, `Inventario Actual`, `Necesidad de Venta`, `Inventario al Finalizar`, `Precio Adq. HOY`, `Proveedor`                                                   | Plan de compras sugerido. Calcula qué insumos (productos base) se necesitan comprar para satisfacer la demanda de los pedidos.          |
| **Historico Adquisiciones** | `ID`, `Fecha de Registro`, `Producto Base`, `Formato de Compra Real`, `Cantidad Real`, `Precio Unitario`, `Costo Total Real`, `Proveedor`                                                                        | Base de datos histórica de todas las compras realizadas, utilizada para análisis de precios.                                            |
| **CostosVenta**          | `Fecha`, `Nombre Producto`, `Costo Adquisicion`                                                                                                                                                                 | Registro del costo de adquisición calculado para cada producto final vendido en una fecha específica.                                   |
| **Anomalías de Precios** | `Fecha`, `Nombre Producto`, `Costo de Hoy`, `Costo Promedio Histórico`, `Desviación Estándar`, `Mensaje`                                                                                                           | Log de las veces que el costo de adquisición de un producto se desvió significativamente de su promedio histórico.                    |
| **Ruta Optimizada**      | *(Copia de la estructura de `Orders`)*                                                                                                                                                                          | Hoja generada que contiene los pedidos ordenados según la optimización de RouteXL.                                                      |
| **Orden de Envasado (Ruta)** | `Orden Ruta`, `Nº Pedido`, `Producto`, `Cantidad`                                                                                                                                                               | Lista de productos a envasar, pero ordenada según la secuencia de la ruta de entrega.                                                   |
| **Orden de Carga (Ruta)** | `Orden Carga`, `Nº Pedido`, `Cliente`, `Dirección Completa`, `Comuna`, `Furgón`                                                                                                                                   | Hoja de ruta para el transportista, indicando el orden de carga y entrega de los paquetes.                                              |

---

## 3. Funcionalidades y Flujos de Trabajo

El código está organizado en módulos lógicos, accesibles principalmente desde los menús "Gestión de Operaciones" y "Módulo de Finanzas".

### Módulo de Finanzas

Este módulo se centra en la importación y conciliación de transacciones financieras.

- **Importar Movimientos (`showImportMovementsDialog`, `importBankMovements`)**: Permite al usuario pegar datos de movimientos bancarios desde el portapapeles. El script los procesa, **evitando duplicados** al comparar el monto, la descripción y la fecha con los registros existentes.
- **Conciliación de Ingresos (`showConciliationDialog`, `getReconciliationData`, `approveMatch`)**:
    1.  **UI Compleja**: Abre un diálogo (`SalesReconciliationDialog.html`) que presenta varias listas:
        - **Sugerencias Históricas**: Pagos que coinciden con clientes que ya han pagado desde esa cuenta antes (usando `ClientBankData`).
        - **Sugerencias de Alta Confianza**: Sugerencias basadas en un algoritmo de puntuación que considera la similitud del monto, la cercanía de la fecha y la similitud del nombre entre el pago y el pedido.
        - **Sugerencias Poco Probables**: Coincidencias con una puntuación más baja.
        - **Listas Manuales**: Permite enlazar manualmente cualquier pago no asignado con cualquier pedido pendiente.
    2.  **Lógica de Aprobación (`approveMatch`)**: Al aprobar una coincidencia, el script actualiza el estado del pedido en la hoja `Orders`, marca el movimiento como "asignado" en `MovimientosBancarios` y registra la transacción en `AsignacionesHistoricas` y `ClientBankData`.
- **Análisis de Precios (`runPriceAnalysis`, `getAnalysisData`, `commitPriceData`)**:
    1.  Procesa la hoja `Reporte Adquisiciones` para mover las compras confirmadas a `Historico Adquisiciones`.
    2.  Calcula el costo de venta de cada producto basándose en las compras del día.
    3.  **Detección de Anomalías**: Compara el costo de hoy con el promedio histórico y la desviación estándar de la hoja `CostosVenta`. Si un precio se desvía más de un umbral (ej. 2.5 desviaciones estándar), se marca como una anomalía.
    4.  Muestra un panel de aprobación (`PriceApprovalDialog.html`) donde el usuario puede revisar, ajustar y confirmar los costos del día, que se guardan en `CostosVenta` y `Anomalías de Precios`.

### Gestión de Operaciones

Este módulo cubre el flujo de trabajo diario desde la preparación de pedidos hasta la entrega.

- **Dashboard de Operaciones (`showDashboard`, `getDashboardMetrics`)**: Es el punto de entrada principal. Muestra KPIs clave como Venta Total, Nº de Pedidos, Costo Total y Margen. Desde aquí se inician los principales flujos de trabajo.
- **Limpieza de Datos (`startDashboardRefresh`)**: Antes de operar, el sistema ofrece limpiar los datos, buscando **pedidos duplicados** por cliente y **proveedores nuevos** en `SKU` que no tienen teléfono en `Proveedores`, mostrando diálogos para resolver estas inconsistencias.
- **Comanda Rutas (`showComandaRutasDialog`, `getOrdersForRouting`, `saveRouteChanges`, `processRouteXLData`)**:
    1.  Abre un panel (`ComandaRutasDialog.html`) para gestionar la logística.
    2.  Permite editar direcciones y **asignar pedidos a furgones** específicos.
    3.  Genera listas de direcciones formateadas para ser pegadas en la herramienta externa **RouteXL**.
    4.  Una vez optimizada la ruta en RouteXL, el usuario pega el resultado de vuelta en el diálogo. El script procesa este texto, reordena los pedidos y crea la hoja `Ruta Optimizada`.
    5.  Finalmente, genera las hojas `Orden de Envasado (Ruta)` y `Orden de Carga (Ruta)` listas para imprimir.
- **Flujo de Envasado (`startPackagingProcess`, `generatePackagingSheet`)**:
    1.  Primero, detecta si hay productos en `Orders` que no existen en `SKU` y muestra un diálogo para añadirlos.
    2.  Luego, permite al usuario seleccionar categorías de productos para generar la `Lista de Envasado`.
- **Flujo de Adquisiciones (`updateAcquisitionListAutomated`, `showAcquisitionEditor`, `saveAcquisitions`)**:
    1.  El sistema calcula automáticamente las necesidades de "productos base" sumando los requisitos de todos los productos finales en los pedidos.
    2.  Sugiere la mejor opción de compra (formato y cantidad) para minimizar el desperdicio.
    3.  Muestra estos resultados en la `Lista de Adquisiciones` y permite la edición a través de un diálogo avanzado (`AcquisitionEditorDialog.html`).
- **Notificación a Proveedores (`startNotificationProcess`, `getOrdersForSupplier`)**:
    1.  Abre un diálogo (`NotificationDialog.html`) que lista los proveedores a los que se les debe comprar según la `Lista de Adquisiciones`.
    2.  Al seleccionar un proveedor, muestra su pedido y genera un **enlace directo a WhatsApp** con un mensaje pre-redactado, listo para ser enviado.

---

## 4. Disparadores Automáticos (Triggers)

- **`onOpen()`**: Se ejecuta cada vez que un usuario abre el libro. Es responsable de crear los menús personalizados en la interfaz.
- **`onEdit(e)`**: Se ejecuta cada vez que un usuario edita una celda. El código actual lo utiliza para recalcular automáticamente el "Inventario al Finalizar" en la `Lista de Adquisiciones` cuando se modifica la cantidad a comprar o el formato.
