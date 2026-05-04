// ============================================================
//  api.js — LI.DA.BOX · Comunicación con Google Apps Script
// ============================================================

export const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzrgLkNxj5g7BoXRDFRDgXLspiUmOtaHnSa1m6v3A4evrr5Do-bscC7VUsYTBNVgab0/exec";

async function get(action, params={}) {
  const query = new URLSearchParams({ action, ...params }).toString();
  const res   = await fetch(`${APPS_SCRIPT_URL}?${query}`, { redirect:"follow" });
  if(!res.ok) throw new Error(`Error HTTP ${res.status}`);
  return res.json();
}

async function post(body) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method:"POST", redirect:"follow",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify(body),
  });
  if(!res.ok) throw new Error(`Error HTTP ${res.status}`);
  return res.json();
}

export const fetchTabla      = ()  => get("getTabla");
export const fetchFixture    = ()  => get("getFixture");
export const fetchInscriptas = ()  => get("getInscriptas");
export const fetchEtapaInfo  = ()  => get("getEtapa");
export const fetchFechaData  = (n) => get("getFechaData", { fecha: n });
export const inscribirse     = (nombre) => post({ action:"inscribirse",  nombre });
export const desinscribir    = (nombre) => post({ action:"desinscribir", nombre });
