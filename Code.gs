// ============================================================
//  PADEL BOX - LIGA DE DAMAS  |  Google Apps Script API
//  Pegar este código en: Extensions → Apps Script
//  Luego: Deploy → New Deployment → Web App → Anyone
// ============================================================

const SHEET_CLASIFICACION = "DAMAS SABADOS CLASIFICACION";
const SHEET_INSCRIPCIONES  = "INSCRIPCIONES";   // se crea automáticamente
const SHEET_FIXTURE        = "FIXTURE";          // se crea automáticamente

const COL_NUM    = 1;   // B  - número jugadora
const COL_NOMBRE = 2;   // C  - nombre
const COL_FAVOR  = 92;  // CQ - games a favor
const COL_CONTRA = 94;  // CS - games en contra
const COL_CLASIF = 102; // CW - clasificación final
const FILA_INICIO = 3;  // primera fila de datos (0-indexed)

// ─────────────────────────────────────────────
//  CORS helper
// ─────────────────────────────────────────────
function corsResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ─────────────────────────────────────────────
//  GET  dispatcher
// ─────────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action || "getTabla";
  try {
    switch (action) {
      case "getTabla":       return corsResponse(getTabla());
      case "getFixture":     return corsResponse(getFixture());
      case "getInscriptas":  return corsResponse(getInscriptas());
      case "getEtapa":       return corsResponse(getEtapaInfo());
      default:               return corsResponse({ error: "Acción no reconocida" });
    }
  } catch(err) {
    return corsResponse({ error: err.message });
  }
}

// ─────────────────────────────────────────────
//  POST  dispatcher
// ─────────────────────────────────────────────
function doPost(e) {
  const body   = JSON.parse(e.postData.contents);
  const action = body.action;
  try {
    switch (action) {
      case "inscribirse":   return corsResponse(toggleInscripcion(body.nombre, true));
      case "desinscribir":  return corsResponse(toggleInscripcion(body.nombre, false));
      default:              return corsResponse({ error: "Acción no reconocida" });
    }
  } catch(err) {
    return corsResponse({ error: err.message });
  }
}

// ─────────────────────────────────────────────
//  1. TABLA DE POSICIONES
// ─────────────────────────────────────────────
function getTabla() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_CLASIFICACION);
  if (!sheet) throw new Error("Hoja '" + SHEET_CLASIFICACION + "' no encontrada");

  const lastRow = sheet.getLastRow();
  const data    = sheet.getDataRange().getValues();
  const players = [];

  for (let i = FILA_INICIO; i < data.length; i++) {
    const row    = data[i];
    const nombre = row[COL_NOMBRE];
    const favor  = row[COL_FAVOR];
    const contra = row[COL_CONTRA];
    const clasif = row[COL_CLASIF];

    // Saltar filas vacías
    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") continue;
    if (favor === "" && contra === "") continue;

    players.push({
      posicion: players.length + 1,
      nombre:   nombre.trim(),
      favor:    Number(favor)  || 0,
      contra:   Number(contra) || 0,
      clasif:   Math.round((Number(clasif) || 0) * 100) / 100,
    });
  }

  // Ordenar por clasificación descendente
  players.sort((a, b) => b.clasif - a.clasif);
  players.forEach((p, i) => p.posicion = i + 1);

  return { ok: true, jugadoras: players, total: players.length };
}

// ─────────────────────────────────────────────
//  2. FIXTURE
//  La hoja FIXTURE debe tener columnas:
//  A=Fecha  B=Cancha  C=Pareja1  D=Pareja2  E=Hora
// ─────────────────────────────────────────────
function getFixture() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(SHEET_FIXTURE);

  // Si no existe la hoja, devolver ejemplo vacío
  if (!sheet) {
    return { ok: true, partidos: [], mensaje: "Crea la hoja FIXTURE con columnas: Fecha, Cancha, Pareja1, Pareja2, Hora" };
  }

  const data    = sheet.getDataRange().getValues();
  const partidos = [];

  for (let i = 1; i < data.length; i++) {   // fila 0 = encabezados
    const [fecha, cancha, pareja1, pareja2, hora] = data[i];
    if (!cancha) continue;
    partidos.push({
      fecha:   Number(fecha),
      cancha:  String(cancha),
      pareja1: String(pareja1),
      pareja2: String(pareja2),
      hora:    String(hora),
    });
  }

  return { ok: true, partidos };
}

// ─────────────────────────────────────────────
//  3. INSCRIPCIONES
//  Lee/escribe en hoja INSCRIPCIONES
//  Columnas: A=Fecha  B=Nombre  C=Timestamp
// ─────────────────────────────────────────────
function getInscriptas() {
  const sheet  = getOrCreateInscripcionesSheet();
  const data   = sheet.getDataRange().getValues();
  const fechaActual = getFechaActual();
  const inscriptas  = [];

  for (let i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === fechaActual && data[i][1]) {
      inscriptas.push(String(data[i][1]).trim());
    }
  }

  return { ok: true, inscriptas, fecha: fechaActual };
}

function toggleInscripcion(nombre, inscribir) {
  if (!nombre) throw new Error("Nombre requerido");
  const sheet       = getOrCreateInscripcionesSheet();
  const data        = sheet.getDataRange().getValues();
  const fechaActual = getFechaActual();
  const nombreNorm  = nombre.trim();

  // Buscar si ya existe
  let filaExistente = -1;
  for (let i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === fechaActual &&
        String(data[i][1]).trim().toLowerCase() === nombreNorm.toLowerCase()) {
      filaExistente = i + 1; // 1-indexed
      break;
    }
  }

  if (inscribir) {
    if (filaExistente === -1) {
      sheet.appendRow([fechaActual, nombreNorm, new Date().toISOString()]);
    }
    return { ok: true, accion: "inscripta", nombre: nombreNorm };
  } else {
    if (filaExistente !== -1) {
      sheet.deleteRow(filaExistente);
    }
    return { ok: true, accion: "desinscripta", nombre: nombreNorm };
  }
}

// ─────────────────────────────────────────────
//  4. INFO ETAPA
// ─────────────────────────────────────────────
function getEtapaInfo() {
  // Podés editar estos valores manualmente o leerlos de otra hoja
  return {
    ok:     true,
    etapa:  "Primera Etapa",
    fecha:  getFechaActual(),
    nombre: "Liga de Damas · Padel Box",
    temporada: "Otoño 2026",
  };
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function getFechaActual() {
  // Cambiá este número manualmente cada semana (1, 2, 3...)
  const FECHA_ACTUAL = 3;
  return FECHA_ACTUAL;
}

function getOrCreateInscripcionesSheet() {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  let sheet  = ss.getSheetByName(SHEET_INSCRIPCIONES);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_INSCRIPCIONES);
    sheet.appendRow(["Fecha", "Nombre", "Timestamp"]);
    sheet.getRange("1:1").setFontWeight("bold");
  }
  return sheet;
}

// ─────────────────────────────────────────────
//  TEST desde el editor (ejecutar manualmente)
// ─────────────────────────────────────────────
function testGetTabla() {
  const result = getTabla();
  Logger.log(JSON.stringify(result, null, 2));
}
