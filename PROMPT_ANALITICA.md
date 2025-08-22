# Prompt para Nuevo Trabajo: Desarrollo de Dashboard de Análisis de Negocio (Versión Corregida)

**Título del trabajo:** Desarrollo de un Dashboard de Análisis de Negocio en Google Sheets

**Descripción del Proyecto:**

Se requiere un especialista en Google Sheets para desarrollar un dashboard analítico integral. El objetivo es consolidar y analizar datos de ventas, costos y precios históricos para extraer insights clave sobre la rentabilidad, posicionamiento en el mercado y rendimiento histórico.

**Fuentes de Datos (Automatizadas con Google Apps Script):**

El libro de "Analítica" se alimenta de datos del libro "Operación" a través de un script de sincronización (`analitica.gs`). El script copia los datos de las siguientes hojas:

*   **Libro de Origen (Operación):** `https://docs.google.com/spreadsheets/d/1hPyDsDHo6Sll6mYY_4YGcPJ4I9FPpG1kQINcidMM-s4/`
    *   Hoja `Orders` -> se copia a -> `Data_Ventas` en este libro.
    *   Hoja `CostosVenta` -> se copia a -> `Data_Costos` en este libro.
    *   Hoja `Historico Adquisiciones` -> se copia a -> `Data_Precios_Historicos` en este libro.

*   **Libro de Destino (Analítica):** `https://docs.google.com/spreadsheets/d/1B9vLnEpd3lxD_uESDBCdHsfS84Y73ygpofj6m5cv93Q/`
    *   **Pestañas con datos brutos:** `Data_Ventas`, `Data_Costos`, `Data_Precios_Historicos`.

**Requisitos y Entregables:**

1.  **Pestaña "Análisis de Márgenes":**
    *   Crear una tabla que cruce la información de `Data_Ventas` y `Data_Costos`.
    *   Para cada producto, calcular:
        *   Ingresos Totales.
        *   Unidades Vendidas.
        *   Precio de Venta Promedio.
        *   Costo de Venta Unitario (de `Data_Costos`).
        *   Margen de Ganancia Bruta por Unidad y Porcentual.
    *   Utilizar funciones `QUERY`, `VLOOKUP`, `SUMIFS`, etc., para automatizar los cálculos.

2.  **Pestaña "Análisis de Precios":**
    *   Utilizar la hoja `Data_Precios_Historicos` para analizar la evolución de los precios de compra.
    *   Visualizar la fluctuación de precios por "Producto Base".
    *   Comparar precios entre diferentes proveedores a lo largo del tiempo.

3.  **Pestaña "Análisis de Ventas":**
    *   Basado en `Data_Ventas`, crear resúmenes de ventas por período (mes, trimestre).
    *   Identificar los productos más vendidos (Top 5) y los menos vendidos (Bottom 5).
    *   Analizar la distribución geográfica de las ventas (por `Shipping City`).

4.  **Pestaña "Dashboard Principal":**
    *   Crear un panel de control visual con los KPIs más importantes:
        *   Gráfico de líneas con la evolución de Ingresos vs. Costos.
        *   Gráfico de barras con el Margen de Ganancia por Producto/Categoría.
        *   Tabla resumen con KPIs generales: Ingresos Totales, Costo Total, Margen Bruto Total.
        *   Gráfico circular o de barras mostrando la contribución de cada producto a los ingresos.
    *   El dashboard debe ser 100% dinámico y actualizarse automáticamente cuando los datos en las pestañas `Data_*` cambien.

**Habilidades Requeridas:**
*   Nivel experto en Google Sheets.
*   Dominio de funciones avanzadas: `QUERY`, `VLOOKUP`, `SUMIFS`, `ARRAYFORMULA`.
*   Experiencia en la creación de tablas dinámicas y gráficos avanzados.
*   Conocimiento de análisis de datos de negocio (márgenes, precios, KPIs).
