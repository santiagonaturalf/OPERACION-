/**
 * @OnlyCurrentDoc
 * Script para sincronizar datos desde el libro de "Operación" al libro de "Analítica".
 * Versión Corregida.
 */

// ID del libro de origen "Operación"
const ID_LIBRO_OPERACION = "1hPyDsDHo6Sll6mYY_4YGcPJ4I9FPpG1kQINcidMM-s4";

/**
 * Crea un menú personalizado en la UI de Google Sheets al abrir el libro.
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('🔥 Analítica Pro')
      .addItem('Sincronizar Datos de Operación', 'sincronizarDatos')
      .addToUi();
}

/**
 * Sincroniza los datos desde el libro "Operación" a este libro "Analítica".
 * Reemplaza la necesidad de usar múltiples fórmulas IMPORTRANGE.
 */
function sincronizarDatos() {
  const libroAnalitica = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // Abrir el libro de origen (Operacion) por su ID
  let libroOperacion;
  try {
    libroOperacion = SpreadsheetApp.openById(ID_LIBRO_OPERACION);
  } catch (e) {
    Logger.log("Error al abrir el libro de Operación. Verifica el ID y los permisos: " + e.toString());
    ui.alert("Error Crítico: No se pudo acceder al libro de 'Operación'. Verifica que el ID sea correcto y que tengas permisos de acceso.");
    return;
  }

  // Mapeo corregido de hojas: [Nombre Hoja Origen, Nombre Hoja Destino en este libro]
  const mapeoHojas = [
    ["Orders", "Data_Ventas"],
    ["CostosVenta", "Data_Costos"],
    ["Historico Adquisiciones", "Data_Precios_Historicos"]
  ];

  Logger.log("Iniciando sincronización con la configuración corregida...");

  mapeoHojas.forEach(function(par) {
    const nombreHojaOrigen = par[0];
    const nombreHojaDestino = par[1];

    const hojaOrigen = libroOperacion.getSheetByName(nombreHojaOrigen);
    let hojaDestino = libroAnalitica.getSheetByName(nombreHojaDestino);

    // Si la hoja de destino no existe, la crea.
    if (!hojaDestino) {
      hojaDestino = libroAnalitica.insertSheet(nombreHojaDestino);
      Logger.log(`Hoja de destino '${nombreHojaDestino}' no encontrada, ha sido creada.`);
    }

    if (hojaOrigen) {
      const rangoOrigen = hojaOrigen.getDataRange();
      const datos = rangoOrigen.getValues();

      // Limpia la hoja de destino antes de pegar los nuevos datos
      hojaDestino.clearContents();

      // Pega los datos en la hoja de destino
      if (datos.length > 0 && datos[0].length > 0) {
        hojaDestino.getRange(1, 1, datos.length, datos[0].length).setValues(datos);
        Logger.log(`'${nombreHojaOrigen}' sincronizada con '${nombreHojaDestino}' exitosamente.`);
      } else {
        Logger.log(`La hoja de origen '${nombreHojaOrigen}' está vacía. No se copiaron datos.`);
      }
    } else {
      Logger.log(`ERROR: No se encontró la hoja de origen: '${nombreHojaOrigen}' en el libro de Operación.`);
      ui.alert(`Alerta: No se pudo encontrar la hoja '${nombreHojaOrigen}' en el libro de Operación. Esta pestaña no fue sincronizada.`);
    }
  });

  Logger.log("Sincronización finalizada.");
  ui.alert('¡Sincronización completada exitosamente!');
}
