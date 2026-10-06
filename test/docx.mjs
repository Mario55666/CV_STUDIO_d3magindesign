/* test/docx.mjs — prueba del lector de Word (.docx) y del reconocimiento de datos.
   Construye un .docx real (ZIP + OOXML) sin dependencias externas, lo pasa por el
   lector de importar.js y comprueba que reconozca nombre, contacto y secciones.
   Uso:  node test/docx.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = f => readFileSync(join(root, f), "utf8");
let fail = 0;
const ok = m => console.log("  ok   " + m);
const bad = m => { fail++; console.log("  FAIL " + m); };

/* ---------- 1. Constructor de ZIP (stored y deflate) ---------- */
const crcTab = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const crc32 = buf => { let c = -1; for (let i = 0; i < buf.length; i++) c = crcTab[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function makeZip(entries, comprimir){
  const enc = new TextEncoder(), locales = [], central = [];
  let offset = 0;
  for (const [name, texto] of Object.entries(entries)) {
    const datos = enc.encode(texto);
    const comp = comprimir ? new Uint8Array(zlib.deflateRawSync(datos)) : datos;
    const metodo = comprimir ? 8 : 0;
    const nm = enc.encode(name);
    const lh = new Uint8Array(30 + nm.length), dv = new DataView(lh.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0, true); dv.setUint16(8, metodo, true);
    dv.setUint32(14, crc32(datos), true); dv.setUint32(18, comp.length, true); dv.setUint32(22, datos.length, true);
    dv.setUint16(26, nm.length, true); lh.set(nm, 30);
    locales.push(lh, comp);
    const ch = new Uint8Array(46 + nm.length), dc = new DataView(ch.buffer);
    dc.setUint32(0, 0x02014b50, true); dc.setUint16(4, 20, true); dc.setUint16(6, 20, true); dc.setUint16(10, metodo, true);
    dc.setUint32(16, crc32(datos), true); dc.setUint32(20, comp.length, true); dc.setUint32(24, datos.length, true);
    dc.setUint16(28, nm.length, true); dc.setUint32(42, offset, true); ch.set(nm, 46);
    central.push(ch);
    offset += lh.length + comp.length;
  }
  const cdsize = central.reduce((a, c) => a + c.length, 0);
  const eocd = new Uint8Array(22), dv = new DataView(eocd.buffer);
  dv.setUint32(0, 0x06054b50, true); dv.setUint16(8, Object.keys(entries).length, true); dv.setUint16(10, Object.keys(entries).length, true);
  dv.setUint32(12, cdsize, true); dv.setUint32(16, offset, true);
  const partes = [...locales, ...central, eocd];
  const total = partes.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total); let p = 0;
  partes.forEach(x => { out.set(x, p); p += x.length; });
  return out;
}
/* ---------- 2. Documento de prueba (OOXML) ---------- */
const OOXML = {
  "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
  "_rels/.rels": `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
  "word/document.xml": `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>` +
    [ "CURRÍCULUM VITAE",
      "María Elena Torres Villalobos",
      "Licenciada en Administración · Gestión de proyectos sociales",
      "Correo: maria.torres@example.com · Celular: 999 111 222",
      "DNI 11223344",
      "Nacionalidad: Peruana",
      "PERFIL PROFESIONAL",
      "Administradora con 9 años de experiencia en gestión de proyectos sociales y cooperación internacional. Lideró la implementación de un sistema de seguimiento que redujo en 30 % los tiempos de reporte.",
      "FORMACIÓN ACADÉMICA",
      "2018 · Maestra en Gestión Pública · Universidad Nacional Demo, 20/07/2018 · registro SUNEDU",
      "2011 · Licenciada en Administración · Universidad Sur Demo, 15/03/2011 · registro SUNEDU",
      "EXPERIENCIA LABORAL",
      "2019–2025 | ONG Desarrollo Andino (ficticia) | Coordinadora de proyectos: gestionó 12 proyectos con presupuesto de S/ 2 000 000 y un equipo de 8 personas | 6 años",
      "2013–2019 | Municipalidad Demo | Especialista en presupuesto: implementó el seguimiento de metas de 40 unidades orgánicas | 6 años",
      "CAPACITACIÓN",
      "2023 · Diplomado en Monitoreo y Evaluación de Proyectos · Escuela de Posgrado Horizonte, 05/02 – 30/06/2023 · 180 h",
      "2021 · Curso de Presupuesto por Resultados · Plataforma Aprende+, 12/04/2021 · 40 h",
      "INFORMÁTICA",
      "2022 · Excel avanzado: tablas dinámicas y Power Query · Plataforma Aprende+, 10/10/2022 · 30 h",
      "IDIOMAS",
      "2020 · Inglés · Centro de Idiomas Babel, 20/11/2020 · B2",
      "RECONOCIMIENTOS",
      "2024 · ONG Desarrollo Andino (ficticia) · Reconocimiento por la gestión del proyecto «Agua segura» · 2024",
      "Referencias disponibles a solicitud."
    ].map(t => `<w:p><w:r><w:t>${t.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</w:t></w:r></w:p>`).join("") +
    `</w:body></w:document>`
};

/* ---------- 3. Contexto con el lector ---------- */
const doc = { createElement:() => ({ style:{}, setAttribute(){}, appendChild(){}, addEventListener(){}, classList:{ add(){}, remove(){}, toggle(){} } }),
  getElementById:() => null, querySelector:() => null, querySelectorAll:() => [], body:{ appendChild(){} }, addEventListener(){} };
const ctx = { console, document:doc, window:{}, setTimeout, clearTimeout, Blob, Response, TextDecoder, TextEncoder, DecompressionStream, localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} } };
ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(read("data.js"), ctx);
/* El lector usa D(), orderedSections() y demás utilidades de app.js: se aportan mínimos */
vm.runInContext(`
  function D(){ return { personal:{ nombre:"", campos:[] }, sections: window.EMPTY_SECTIONS() }; }
  globalThis.esc_ = t => String(t ?? "");
  globalThis.download = () => {};
  globalThis.byId = () => null;
  globalThis.EMPTY = window.EMPTY_SECTIONS;
`, ctx);
vm.runInContext(read("importar.js"), ctx);

console.log("\n[1] El .docx se descomprime y se convierte en líneas");
const zipDeflate = makeZip(OOXML, true);
const zipStored = makeZip(OOXML, false);
let lineas = null;
try { lineas = await ctx.docxLines(zipDeflate.buffer); } catch (e) { bad("docxLines (deflate) lanzó: " + e.message); }
if (lineas) {
  if (lineas.length >= 15) ok(`${lineas.length} líneas leídas de un .docx comprimido (deflate)`);
  else bad(`solo ${lineas.length} líneas leídas`);
  if (lineas[0] === "CURRÍCULUM VITAE") ok("la primera línea se lee correctamente (acentos incluidos)");
  else bad("primera línea inesperada: " + lineas[0]);
}
try { const l2 = await ctx.docxLines(zipStored.buffer); if (l2 && l2.length === lineas?.length) ok("también lee .docx con entradas sin comprimir"); else bad("falló la lectura de un .docx sin comprimir"); }
catch (e) { bad("docxLines (stored) lanzó: " + e.message); }
try { await ctx.docxLines(new Uint8Array([1, 2, 3, 4]).buffer); bad("un archivo que no es .docx debería dar error claro"); }
catch (e) { ok("archivo inválido rechazado con mensaje: «" + e.message.slice(0, 48) + "…»"); }

console.log("\n[2] Reconocimiento de datos personales");
const { data, informe } = ctx.analizarTexto(lineas.join("\n"));
const esperado = [
  ["nombre", informe.nombre, /María Elena Torres Villalobos/i],
  ["correo", informe.correo, /maria\.torres@example\.com/],
  ["celular", informe.celular.replace(/\s/g, ""), /999111222/],
  ["documento", informe.dni, /11223344/],
  ["titular", informe.titular, /Administraci|Gesti[oó]n de proyectos/i]
];
for (const [k, valor, re] of esperado) re.test(String(valor)) ? ok(`${k}: «${valor}»`) : bad(`${k} mal reconocido: «${valor}»`);
const campos = Object.fromEntries(data.personal.campos.map(c => [c[0], c[1]]));
if (/Peruana/i.test(campos["Nacionalidad"] || "")) ok("nacionalidad: «" + campos["Nacionalidad"] + "»"); else bad("no reconoció la nacionalidad");
if ((data.perfil || "").length > 80) ok(`perfil: ${data.perfil.length} caracteres`);
else bad("no reconoció el perfil profesional: «" + data.perfil + "»");

console.log("\n[3] Clasificación por secciones");
const porId = Object.fromEntries(data.sections.map(s => [s.id, s]));
const espera = { grados:2, experiencia:2, capacitacion:2, ofimatica:1, idiomas:1, reconocimientos:1 };
for (const [id, n] of Object.entries(espera)) {
  const s = porId[id];
  if (!s) { bad(`no creó la sección «${id}»`); continue; }
  if (s.rows.length === n) ok(`${id}: ${n} fila(s) · ej. «${String(s.rows[0][1]).slice(0, 52)}…»`);
  else bad(`${id}: se esperaban ${n} filas y hay ${s.rows.length}`);
}
const grados = porId.grados?.rows || [];
if (grados.every(r => /^\d{4}$/.test(String(r[0])))) ok("los años de los grados se extrajeron (2018, 2011)");
else bad("años de grados mal extraídos: " + JSON.stringify(grados.map(r => r[0])));
const cap = porId.capacitacion?.rows || [];
if (cap.some(r => /h$/.test(String(r[3])))) ok("las horas de capacitación se extrajeron: " + cap.map(r => r[3]).join(", "));
else bad("no extrajo horas: " + JSON.stringify(cap.map(r => r[3])));
if (String(porId.idiomas?.rows?.[0]?.[3] || "") === "B2") ok("el nivel de idioma usa el Marco Común Europeo (B2)");
else bad("nivel de idioma mal reconocido: " + JSON.stringify(porId.idiomas?.rows?.[0]?.[3]));
if (/S\/ 2 000 000/.test(JSON.stringify(porId.experiencia?.rows))) ok("conserva el logro con monto dentro de la función");
if (/^\d{4}[–-]\d{4}$/.test(String(porId.experiencia?.rows?.[0]?.[0] || ""))) ok("los rangos de año se conservan: " + porId.experiencia.rows[0][0]);

console.log("\n[4] Texto pegado sin ninguna sección reconocible");
const suelto = ctx.analizarTexto("Juan Pérez\njuan@example.com\n999 888 777\nTrabajé en varias empresas haciendo tareas administrativas.");
if (suelto.informe.avisos.length) ok("avisa cuando no reconoce secciones: «" + suelto.informe.avisos[0].slice(0, 60) + "…»");
else bad("no avisó de la falta de secciones");
if (/Juan Pérez/.test(suelto.informe.nombre)) ok("aun sin secciones reconoce el nombre: «" + suelto.informe.nombre + "»");
else bad("no reconoció el nombre en texto suelto: «" + suelto.informe.nombre + "»");

console.log("\n[5] Respaldo .json");
try {
  const r = ctx.analizarJSON({ data:{ personal:{ nombre:"Ana Demo", titular:"", campos:[], redes:[] }, perfil:"", sections:[{ id:"grados", title:"Formación académica y grados", kind:"edu", training:false, prefix:"01", folder:"01_Formacion_academica", rows:[["2020","Título Demo","Universidad Demo","",""]] }] } });
  if (r.informe.esRespaldo && r.data.sections.length === 1) ok("reconoce un respaldo .json y avisa que reemplaza todo");
  else bad("no reconoció el respaldo .json");
} catch (e) { bad("analizarJSON lanzó: " + e.message); }
try { ctx.analizarJSON({ hola:1 }); bad("un .json cualquiera debería dar error"); }
catch (e) { ok("json ajeno rechazado: «" + e.message.slice(0, 46) + "…»"); }

console.log(`\nRESULTADO: ${fail} error(es)\n`);
process.exit(fail ? 1 : 0);
