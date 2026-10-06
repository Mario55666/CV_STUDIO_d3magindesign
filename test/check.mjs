/* test/check.mjs — verificación estructural del aplicativo (sin navegador).
   Comprueba: (1) que cada id usado por los scripts exista (en el HTML o generado en runtime),
               (2) que guide.js/data.js exporten lo que app.js y research.js esperan,
               (3) el orden de carga de los scripts,
               (4) que los 6 ejemplos sean coherentes con las columnas de su sección,
               (5) que la guía didáctica esté completa,
               (6) la firma d3magindesign en la web, la hoja y los archivos exportados.
   Uso:  node test/check.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = f => readFileSync(join(root, f), "utf8");
const html = read("index.html");
const ui = read("ui.css");
const js = { "data.js":read("data.js"), "guide.js":read("guide.js"), "app.js":read("app.js"), "importar.js":read("importar.js"), "biblioteca.js":read("biblioteca.js"), "research.js":read("research.js"), "viewer.js":read("viewer.js") };
const all = Object.values(js).join("\n") + html + ui;
const FIRMA = "d3magindesign 2026 · Mg. Mario Quiroz Martínez";
let fail = 0, warn = 0;
const ok   = m => console.log("  ok   " + m);
const bad  = m => { fail++; console.log("  FAIL " + m); };
const soft = m => { warn++; console.log("  warn " + m); };

console.log("\n[1] Ids usados por los scripts vs. el DOM");
const used = new Set();
for (const src of Object.values(js)) {
  for (const re of [/\$\("#([A-Za-z0-9_-]+)"\)/g, /byId\("([A-Za-z0-9_-]+)"\)/g, /getElementById\("([A-Za-z0-9_-]+)"\)/g])
    for (const m of src.matchAll(re)) used.add(m[1]);
}
const declared = new Set([...html.matchAll(/\bid="([A-Za-z0-9_-]+)"/g)].map(m => m[1]));
const runtime = new Set([...all.matchAll(/\bid="([A-Za-z0-9_-]+)"/gi)].map(m => m[1]));
const missing = [...used].filter(id => !declared.has(id) && !runtime.has(id)).sort();
if (missing.length) bad("ids sin destino: " + missing.join(", "));
else ok(`${used.size} ids referenciados; existen en el HTML (${declared.size} declarados) o se generan al vuelo`);

console.log("\n[2] Lo que app.js y research.js esperan de data.js y guide.js");
const esperados = {
  "data.js": ["EMPTY_SECTIONS","DEFAULT_DATA","DEFAULT_LINKS","DEFAULT_EXTRA_ROWS","DEFAULT_FIELD_LINKS","SHARED_LINK_WARN","DEFAULT_PUBLICATIONS","DEFAULT_RESEARCH","DEFAULT_SOCIAL","GUIDE","ANNOT","DEMOS","DEMO_ORDER","LEVEL_NOTES","LEVEL_KEYS","APP_BRAND","demoAvatar"],
  "guide.js":["annotHTML","emptySectionsHint","renderDemoBanner","renderProgress","progressItems","demoButtonsHTML","guideBoxHTML","loadDemo","startBlank","demoAsBase","showKit","showLevelDialog","tourShow","compressPhoto","brandFileNote","BRAND_SIG","renderDemoStrip"],
  "importar.js":["docxLines","zipRead","analizarTexto","analizarJSON","showImport","ensureImportDialog","leerArchivo","pintarPropuesta","aplicarPropuesta","descargarPropuesta","bootImportar"],
  "biblioteca.js":["bibCargar","bibAgregar","bibBorrar","bibRenombrar","bibCargarEnFormulario","bibDescargarUno","bibDuplicar","bibSnapshot","showBiblioteca","bibRender","renderPrivacyNote","bootBiblioteca"]
};
for (const [file, names] of Object.entries(esperados)) {
  const faltan = names.filter(n => !new RegExp(`window\\.${n}\\s*[=(]|(?:function|const|let|var)\\s+${n}\\b`).test(js[file]));
  if (faltan.length) bad(`${file} no define: ${faltan.join(", ")}`);
  else ok(`${file}: ${names.length} símbolos que app.js invoca al dibujar`);
}
for (const n of ["annotHTML","emptySectionsHint","renderDemoBanner","renderProgress"])
  if (!new RegExp(`function\\s+${n}\\b`).test(js["guide.js"])) bad(`app.js invoca ${n}() y guide.js no la define`);
/* Cada sección con guía debe tener su bloque en GUIDE */
const guiadasEnHtml = [...js["data.js"].matchAll(/^\s{2}([a-z_]+):\s*\{\s*$/gm)].map(m => m[1]);

console.log("\n[3] Orden de carga de los scripts");
const orden = [...html.matchAll(/<script src="(data|research|guide|app|importar|biblioteca|viewer)\.js/g)].map(m => m[1]);
if (JSON.stringify(orden) === JSON.stringify(["data","research","guide","app","importar","biblioteca","viewer"])) ok("orden correcto: " + orden.join(" → "));
else bad("orden de carga incorrecto: " + orden.join(" → "));
if (/<link rel="stylesheet" href="ui\.css/.test(html)) ok("index.html carga ui.css (barra superior y diálogos nuevos)");
else bad("index.html no carga ui.css");

console.log("\n[4] Los 6 ejemplos: secciones, columnas y contenido");
const ctx = { window:{}, console, document:{ querySelector:()=>null, querySelectorAll:()=>[], createElement:()=>({ style:{}, setAttribute(){}, appendChild(){}, classList:{ add(){}, remove(){}, toggle(){} } }) }, localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} } };
ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(js["data.js"], ctx);
const W = ctx.window;
const { DEMOS, DEMO_ORDER, LEVEL_NOTES, EMPTY_SECTIONS, GUIDE } = W;
/* Secciones que cada nivel debe mostrar sí o sí en su ejemplo */
const CLAVE = {
  tecnico:["grados","experiencia","capacitacion","ofimatica"],
  profesional:["grados","experiencia","capacitacion","docente"],
  especialista:["grados","docente","experiencia","produccion","capacitacion"],
  investigador:["grados","publicaciones","investigacion","docente"],
  directivo:["grados","experiencia","calidad","docente"],
  diseno:["grados","experiencia","docente","produccion","ofimatica"]
};
const base = EMPTY_SECTIONS(), idsBase = new Set(base.map(s => s.id));
for (const k of DEMO_ORDER) {
  const d = DEMOS[k];
  if (!d) { bad(`falta el demo «${k}»`); continue; }
  const errs = [];
  if (!d.who || !d.role || !d.nivel) errs.push("sin who/role/nivel");
  if (!d.tpl || !d.acc.trim()) errs.push("sin diseño o color");
  if (!Array.isArray(d.aprende) || d.aprende.length < 2) errs.push("sin objetivos de aprendizaje");
  if (!d.data.personal.nombre || !d.data.personal.titular) errs.push("sin nombre o titular");
  if (!/example\.com/.test(JSON.stringify(d.data.personal.campos))) errs.push("sin correo de ejemplo (example.com)");
  if (!d.data.perfilCustom || !d.data.perfil.includes("{")) errs.push("el perfil no usa cifras automáticas {…}");
  const idsUsados = new Set(); let filas = 0;
  for (const s of d.data.sections) {
    if (idsUsados.has(s.id)) errs.push(`sección duplicada: ${s.id}`);
    idsUsados.add(s.id);
    if (!idsBase.has(s.id)) errs.push(`sección desconocida: ${s.id}`);
    if (!s.folder) errs.push(`sección sin carpeta: ${s.id}`);
    if (!GUIDE[s.id]) errs.push(`sin guía didáctica: ${s.id}`);
    const max = s.kind === "pub" ? 9 : 5;
    s.rows.forEach((r, i) => {
      filas++;
      if (r.length > max) errs.push(`${s.id}[${i + 1}]: ${r.length} columnas (máx ${max})`);
      if (!r[0] || !r[1]) errs.push(`${s.id}[${i + 1}]: sin año o sin tema`);
      if (r[4] && !/^https?:\/\//.test(r[4]) && !/^\.\.\//.test(r[4])) errs.push(`${s.id}[${i + 1}]: enlace inválido`);
    });
  }
  for (const id of CLAVE[k]) if (!idsUsados.has(id)) errs.push(`el ejemplo no muestra la sección clave «${id}»`);
  const n = LEVEL_NOTES[k === "diseno" ? "especialista" : k];
  if (!n || !n.pages || !n.limit || !n.lleva?.length || !n.quita?.length || !n.tip) errs.push("sin metadatos de nivel completos");
  if (!/fictici/i.test(JSON.stringify(d.data))) errs.push("no se advierte que las instituciones son ficticias");
  if (errs.length) bad(`${k}: ${errs.join(" · ")}`);
  else ok(`${k.padEnd(13)} ${d.who.padEnd(30)} ${String(filas).padStart(2)} filas · ${d.data.sections.filter(s => s.rows.length).length} secciones · ${d.pages} · ${d.limit}`);
}
const huerfanas = [...idsBase].filter(id => !Object.values(DEMOS).some(d => d.data.sections.some(s => s.id === id && s.rows.length)));
if (huerfanas.length) soft("secciones base que ningún ejemplo usa: " + huerfanas.join(", "));

console.log("\n[5] Guía didáctica por sección");
const incompletas = Object.entries(GUIDE).filter(([, g]) => !g.que || !g.formula || !g.pasos?.length || !g.bien || !g.mal || !g.error || !g.checklist?.length).map(([k]) => k);
if (incompletas.length) bad("bloques incompletos: " + incompletas.join(", "));
else ok(`${Object.keys(GUIDE).length} secciones con qué, fórmula, pasos, ejemplo correcto, incorrecto, error frecuente y checklist`);
const sinGuia = [...idsBase].filter(id => !GUIDE[id]);
if (sinGuia.length) bad("secciones de la plantilla sin guía: " + sinGuia.join(", "));
else ok("todas las secciones de la plantilla vacía tienen guía");

console.log("\n[6] Firma del aplicativo en todos los entregables");
if (html.includes(FIRMA)) ok("index.html: pie de la web");
else bad("index.html: falta la firma en el pie");
if (js["data.js"].includes(FIRMA)) ok("data.js: APP_BRAND.linea");
else bad("data.js: falta APP_BRAND.linea");
if (/brandFileNote/.test(js["app.js"])) ok("app.js: firma en Markdown (brandFileNote)");
else bad("app.js: el Markdown no lleva la firma");
if (/BRAND_SIG/.test(js["app.js"])) ok("app.js: firma en el pie de página de Word (BRAND_SIG)");
else bad("app.js: el .docx no lleva la firma");
if (/cv-sig/.test(js["guide.js"])) ok("guide.js: firma al pie de la hoja del CV");
else bad("guide.js: la hoja no lleva la firma");
if (/ORCID 0000-0001-6266-7132/.test(html)) bad("quedan datos personales del autor en el pie de la web");
else ok("sin datos personales del autor en el pie de la web");

console.log("\n[7] Privacidad: aviso explícito y sin envío de datos");
const avisos = [/data-privacy/, /no envía ni almacena tus datos/i, /nada de lo que escribes se guarda en el repositorio/i, /este navegador y este equipo/i];
const faltanAvisos = avisos.filter(re => !re.test(all));
if (faltanAvisos.length) bad("faltan avisos de privacidad (" + faltanAvisos.length + " de " + avisos.length + ")");
else ok("aviso de privacidad en la barra, en la hoja de ayuda y en la biblioteca");
if (/fetch\(|XMLHttpRequest|navigator\.sendBeacon/.test(js["biblioteca.js"])) bad("biblioteca.js no debe enviar datos a ningún servidor");
else ok("biblioteca.js no usa red: guarda solo en el navegador (IndexedDB/localStorage)");
if (/localStorage|indexedDB/.test(js["biblioteca.js"])) ok("biblioteca.js persiste localmente (IndexedDB con respaldo en localStorage)");
else bad("biblioteca.js no persiste nada");

console.log("\n[8] Interfaz: menú ordenado, limpiar formulario e importación");
const menu = [...html.matchAll(/<li><a href="#([\w-]+)">([^<]+)<\/a><\/li>/g)].map(m => m[1]);
if (menu.length <= 6) ok(`menú con ${menu.length} entradas (antes: 8): ${menu.join(", ")}`);
else bad(`el menú sigue teniendo ${menu.length} entradas`);
for (const [que, re] of [["botón Limpiar formulario", /id="clearBtn"[^>]*data-g="blankAsk"/], ["botón Limpiar en el hero", /id="clearBtnTop"[^>]*data-g="blankAsk"/],
  ["botón Mi biblioteca", /data-bib-open/], ["botón Abrir Word", /data-imp-open/], ["contenedor de progreso", /id="progressBox"/]]) {
  re.test(html) ? ok(que + ": presente") : bad(que + ": no está en index.html");
}
if (/nav class="top appbar/.test(html) && /nav\.top\.appbar/.test(ui)) ok("barra superior con diseño propio en ui.css");
else bad("la barra superior no tiene los estilos nuevos");
if (/<div class="pills no-print" aria-hidden="true"><\/div>/.test(html) && /nav\.top \.pills\{display:none\}/.test(ui))
  ok("la barra superior ya no muestra píldoras de estado (se movieron abajo a la derecha)");
else bad("las píldoras siguen en la barra superior");
if (/class="cv-status[^"]*" id="cvStatus"/.test(html) && /id="pgChip"/.test(html) && /id="pillTpl"/.test(html) && /id="modePill"/.test(html))
  ok("chip de estado presente con anillo de avance + diseño/nivel + modalidad");
else bad("falta el chip de estado inferior");
if (/\.cv-status\{position:fixed;right:18px;bottom:74px/.test(ui) && /opacity:\.6/.test(ui))
  ok("el chip es discreto: fijo abajo a la derecha, al 60 % de opacidad y con realce al pasar el cursor");
else bad("el chip no tiene los estilos discretos esperados");
if (/\.cv-status\{display:none !important\}/.test(ui)) ok("el chip no se imprime");
else bad("el chip se imprimiría en el PDF");

console.log(`\nRESULTADO: ${fail} error(es), ${warn} aviso(s)\n`);
process.exit(fail ? 1 : 0);
