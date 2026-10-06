/* test/smoke.mjs — arranque real del aplicativo con un DOM simulado (sin navegador).
   Ejecuta data.js → research.js → guide.js → app.js en un contexto Node con un DOM
   mínimo, y comprueba que la hoja del CV, los botones de demo, el progreso y el kit
   de llenado se generen sin excepciones.
   Uso:  node test/smoke.mjs */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = f => readFileSync(join(root, f), "utf8");

let fail = 0, warn = 0;
const ok = m => console.log("  ok   " + m);
const bad = m => { fail++; console.log("  FAIL " + m); };
const soft = m => { warn++; console.log("  warn " + m); };
const erroresConsola = [];

/* ---------- DOM simulado ---------- */
class CList {
  constructor(el){ this.el = el; this.s = new Set(); }
  add(...c){ c.forEach(x => x && this.s.add(x)); this._sync(); }
  remove(...c){ c.forEach(x => this.s.delete(x)); this._sync(); }
  contains(c){ return this.s.has(c); }
  toggle(c, f){ const on = f === undefined ? !this.s.has(c) : !!f; on ? this.s.add(c) : this.s.delete(c); this._sync(); return on; }
  _sync(){ this.el._class = [...this.s].join(" "); }
}
function mkEl(tag){
  const el = {
    tagName:String(tag || "div").toUpperCase(), children:[], style:{ setProperty(){}, removeProperty(){} }, dataset:{},
    _class:"", _html:"", textContent:"", value:"", checked:false, hidden:false, disabled:false, files:[], options:[],
    className:"", id:"", type:"", name:"", placeholder:"", readOnly:false, rows:0,
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){}, hasAttribute(){ return false; },
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return true; }, focus(){}, blur(){}, select(){},
    appendChild(c){ this.children.push(c); return c; }, removeChild(){}, remove(){}, insertBefore(){}, replaceChildren(){},
    querySelector(sel){ return findIn(this, sel); }, querySelectorAll(sel){ return findAllIn(this, sel); },
    closest(){ return null; }, contains(){ return false; }, scrollIntoView(){}, animate(){ return { finished:Promise.resolve() }; },
    getBoundingClientRect(){ return { left:0, top:0, width:200, height:80, right:200, bottom:80 }; },
    toDataURL(){ return "data:image/jpeg;base64,AAAA"; }, toBlob(cb){ cb && cb({ arrayBuffer:() => Promise.resolve(new ArrayBuffer(8)) }); },
    getContext(){ return { drawImage(){}, fillRect(){}, beginPath(){}, ellipse(){}, roundRect(){}, rect(){}, clip(){}, save(){}, restore(){}, stroke(){}, fill(){}, moveTo(){}, lineTo(){}, createLinearGradient(){ return { addColorStop(){} }; }, set fillStyle(v){}, set strokeStyle(v){}, set lineWidth(v){} }; },
    offsetWidth:100, offsetHeight:80, naturalWidth:300, naturalHeight:380, width:300, height:380
  };
  el.classList = new CList(el);
  Object.defineProperty(el, "className", { get(){ return el._class; }, set(v){ el._class = String(v); el.classList.s = new Set(String(v).split(/\s+/).filter(Boolean)); }, configurable:true });
  /* innerHTML simulado: lo escrito más lo que se anexa por appendChild */
  Object.defineProperty(el, "innerHTML", {
    get(){ return el._html + el.children.map(c => c.tagName === "TEXT" ? c.textContent : c.outerHTML()).join(""); },
    set(v){ el._html = String(v); el.children = []; }, configurable:true });
  el.outerHTML = () => `<div class="${el._class}"${el.id ? ` id="${el.id}"` : ""}>${el._html}${el.children.map(c => c.outerHTML()).join("")}</div>`;
  return el;
}
/* Búsqueda por selector dentro del HTML simulado: #id y .clase sobre elementos anexados */
function findIn(root, sel){
  const m = /^([.#])([\w-]+)$/.exec(String(sel).trim());
  const hijos = root.children || [];
  for (const c of hijos) {
    if (c.tagName === "TEXT") continue;
    if (m && m[1] === "." && c._class.split(/\s+/).includes(m[2])) return c;
    if (m && m[1] === "#" && c.id === m[2]) return c;
  }
  /* Si el HTML contiene el marcador (p. ej. «cv-foot»), devuelve un contenedor vacío donde anexar */
  if (m && m[1] === "." && root._html && root._html.includes(`class="${m[2]}"`)) { const e = mkEl("div"); e._class = m[2]; e._virtual = true; root.children.push(e); return e; }
  if (m && m[1] === "." && root._html) return null;
  return null;
}
function findAllIn(root, sel){ const one = findIn(root, sel); return one ? [one] : []; }
const IDS = ["sheet","actionBar","abMsg","abSave","abUpdate","abSaveAs","abDiscard","saved","status","pillTpl","modePill",
  "optCodes","optSensitive","optPhoto","optLimit","titular","perfil","perfilInfo","perfilReset","photoPrev","photoInput",
  "tplGrid","lvlGrid","swatches","fan","photoOpts","brandBox","toggles","edTabs","edPanel","dupBtn","dupPanel","evBody",
  "evSummary","evExtra","exSummary","drop","folderInput","promptText","convText","convWrap","promptDlg","promptGoal",
  "demoStrip","progressBox","pgChip","demoToggle","tourBtn","tourBtn2","jsonExport","jsonExport2","jsonImport","csvImport",
  "resetData","pdfBtn","docxBtn","mdBtn","csvBtn","promptBtn","annexBtn","annexCard","presentBtn","presentBtn2","dupClose"];
const cache = new Map();
const doc = {
  documentElement:{ classList:new CList(mkEl("html")), style:{ setProperty(){} } },
  body:{ appendChild(){}, classList:new CList(mkEl("body")) },
  title:"", readyState:"loading",   /* el navegador dispara «load» al terminar de parsear los <script> */
  createElement:mkEl,
  getElementById(id){ if (!cache.has(id)) { const e = mkEl("div"); e.id = id; cache.set(id, e); } return cache.get(id); },
  querySelector(sel){ const m = /^#([\w-]+)$/.exec(sel); if (m) return this.getElementById(m[1]); return mkEl("div"); },
  querySelectorAll(sel){ if (sel === ".filters-box" || sel === ".demo-banner") return []; if (sel === "[data-go]" || sel === ".mode") return []; return []; },
  addEventListener(ev, f){ if (ev === "load" || ev === "DOMContentLoaded") { this._load = this._load || []; this._load.push(f); } },
  removeEventListener(){}, execCommand(){ return true; }
};
const dispararLoad = () => { doc.readyState = "complete"; (doc._load || []).forEach(f => { try { f(); } catch(e){ erroresConsola.push("load: " + e.message); } }); };
for (const id of IDS) doc.getElementById(id);
doc.getElementById("optSensitive").checked = false;
doc.getElementById("optCodes").checked = false;
doc.getElementById("optPhoto").checked = true;

const store = new Map();
const localStorage = {
  getItem:k => (store.has(k) ? store.get(k) : null),
  setItem:(k, v) => store.set(k, String(v)),
  removeItem:k => store.delete(k), clear:() => store.clear()
};
class Blob2 { constructor(parts, opt){ this.parts = parts; this.type = (opt && opt.type) || ""; this.size = String(parts).length; }
  text(){ return Promise.resolve(this.parts.map(p => String(p)).join("")); } }

/* ---------- IndexedDB simulado (para probar la biblioteca) ---------- */
const idbDatos = new Map();
const idbFake = {
  open(){
    const req = { result:{ objectStoreNames:{ contains:() => true }, createObjectStore(){}, transaction(name, modo){
        const store = {
          put(v){ idbDatos.set(v.id, JSON.parse(JSON.stringify(v))); return {}; },
          delete(k){ idbDatos.delete(k); return {}; },
          clear(){ idbDatos.clear(); return {}; },
          getAll(){ return { result:[...idbDatos.values()] }; },
          get(k){ return { result:idbDatos.get(k) }; }
        };
        return { objectStore:() => store, set oncomplete(f){ setTimeout(f, 0); }, set onerror(f){}, get error(){ return null; } };
      } } };
    setTimeout(() => req.onsuccess && req.onsuccess(), 0);
    return req;
  }
};

const ctx = {
  console:{ log:() => {}, warn:() => {}, error:(...a) => erroresConsola.push(a.join(" ")) },
  document:doc, localStorage, Blob:Blob2, URL:{ createObjectURL:() => "blob:x", revokeObjectURL(){} },
  indexedDB:idbFake,
  Image:class { set src(v){ this._src = v; if (this.onload) setTimeout(() => this.onload(), 0); } get src(){ return this._src; } },
  FileReader:class { readAsText(){ if (this.onload) this.onload(); } },
  /* Temporizadores simulados: se ejecutan en el siguiente turno (microtarea),
     para que las promesas de IndexedDB se resuelvan sin bloquear la prueba. */
  setTimeout:(f) => { const cb = () => { try { f(); } catch(e){ erroresConsola.push("setTimeout: " + e.message); } }; queueMicrotask(() => queueMicrotask(cb)); return 0; },
  clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
  confirm:() => true, alert:() => {}, prompt:() => "Versión de prueba", print(){},
  addEventListener(){}, removeEventListener(){}, scrollTo(){}, scrollY:0, innerWidth:1280, innerHeight:900,
  navigator:{ clipboard:{ writeText:() => Promise.resolve() } },
  fetch:() => Promise.reject(new Error("sin red en la prueba")),
  XMLHttpRequest:class {},
  performance:{ now:() => Date.now() },
  requestAnimationFrame:f => { try { f(0); } catch(e){ erroresConsola.push("rAF: " + e.message); } return 0; },
  matchMedia:() => ({ matches:false, addEventListener(){}, addListener(){} }),
  TextDecoder, TextEncoder, Response, DecompressionStream
};
ctx.window = ctx;
ctx.globalThis = ctx;
ctx.self = ctx;
vm.createContext(ctx);

console.log("\n[1] Carga de los scripts en el orden de index.html");
/* Los archivos comparten el mismo contexto global (en el navegador son <script>
   clásicos). guide.js y app.js se ejecutan como un solo cuerpo para que guide.js
   pueda usar los `const`/`function` de app.js, igual que en la página real. */
try { vm.runInContext(read("data.js") + "\n" + read("research.js"), ctx, { filename:"data+research.js" }); ok("data.js y research.js ejecutados sin excepciones"); }
catch (e) { bad("data.js/research.js lanzaron: " + e.message); }
let API = {};
try {
  const expuesto = read("guide.js") + "\n" + read("app.js") + "\n" + read("importar.js") + "\n" + read("biblioteca.js") + `
;if (typeof bootGuide === "function") bootGuide();
globalThis.__api = { get S(){ return S; }, D, metrics, perfil, perfilRaw, titular, lvl, tpl, acc, orderedSections, visibleRows,
  kitText, loadDemo, startBlank, demoAsBase, toMarkdown, renderSheet, renderProgress, renderDesign, renderEditor, renderTabs,
  hoursOf, codeOf, LEVELS, GUIDE, DEMOS, ANNOT, bootGuide, bootImportar, bootBiblioteca,
  analizarTexto, analizarJSON, docxLines, zipRead, showImport, showBiblioteca, bibAgregar, bibCargar, bibCargarEnFormulario,
  bibBorrar, bibDescargarUno, bibSnapshot, renderPrivacyNote, download };
globalThis.__bib = { get lista(){ return bibMem; }, get motor(){ return bibUsaIDB ? "IndexedDB" : "localStorage"; } };`;
  vm.runInContext(expuesto, ctx, { filename:"guide+app+importar+biblioteca.js" });
  API = ctx.__api || {};
  ok("guide.js, app.js, importar.js y biblioteca.js ejecutados sin excepciones");
  console.log("       (evento load simulado: se arrancan los módulos que van después de app.js)");
  dispararLoad();} catch (e) { bad("los scripts lanzaron: " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 8).join("\n")); }

console.log("\n[2] Estado inicial");
const S = API.S;
if (!S) bad("no se creó el estado S");
else {
  ok(`estado creado · modalidad=${S.mode} · diseño=${S.tpl} · nivel=${S.level} · demo=${S.demo}`);
  if (S.data.personal.nombre) bad("la plantilla pública arranca con un nombre precargado: " + S.data.personal.nombre);
  else ok("la plantilla arranca vacía (sin datos de ninguna persona)");
  const filas = S.data.sections.reduce((a, s) => a + s.rows.length, 0);
  if (filas) bad(`la plantilla arranca con ${filas} filas precargadas`);
  else ok(`plantilla vacía: ${S.data.sections.length} secciones, 0 filas`);
}

console.log("\n[3] Botones de demo y contenedores didácticos");
const chipTex = doc.getElementById("pillTpl").textContent, chipMod = doc.getElementById("modePill").textContent;
if (/·/.test(chipTex) && /Moderno|Clásico|Ejecutivo|Académico|Investigador|Creativo/.test(chipTex)) ok(`chip de estado: diseño y nivel = «${chipTex}»`);
else bad(`el chip de estado no muestra diseño · nivel: «${chipTex}»`);
if (/documentado/i.test(chipMod)) ok(`chip de estado: modalidad = «${chipMod}»`);
else bad("el chip de estado no muestra la modalidad: «" + chipMod + "»");
API.loadDemo("investigador");
const chip2 = doc.getElementById("pillTpl").textContent;
if (/Investigador/.test(chip2) && chip2 !== chipTex) ok(`el chip se actualiza al cambiar de ejemplo: «${chip2}»`);
else bad("el chip no se actualizó al cargar el ejemplo de investigador: «" + chip2 + "»");
API.startBlank(true);
const strip = doc.getElementById("demoStrip").innerHTML;
const botones = [...strip.matchAll(/data-demo="([\w]+)"/g)].map(m => m[1]);
if (botones.length === 6) ok(`se generaron ${botones.length} botones de ejemplo: ${botones.join(", ")}`);
else bad(`se esperaban 6 botones de ejemplo y hay ${botones.length}`);
for (const k of ["tecnico","profesional","especialista","investigador","directivo","diseno"])
  if (!botones.includes(k)) bad(`falta el botón del ejemplo «${k}»`);
if (!/datos inventados/i.test(strip)) soft("la tira de ejemplos no advierte que son datos inventados");
const lvl = doc.getElementById("lvlGrid").innerHTML;
if ((lvl.match(/data-lvlnote=/g) || []).length === 5) ok("cada una de las 5 tarjetas de nivel tiene «¿Qué debe llevar?»");
else bad("las tarjetas de nivel no tienen el botón de guía");
if ((lvl.match(/data-demo=/g) || []).length === 5) ok("cada tarjeta de nivel ofrece su ejemplo");
else bad("a las tarjetas de nivel les falta el botón de ejemplo");

console.log("\n[4] Carga de cada ejemplo (hoja del CV + progreso + kit)");
const EXIGE = {
  tecnico:["Técnico profesional","PLC","Instituto Tecnológico Aurora"],
  profesional:["Ingeniera Industrial","ISO 9001","registro SUNEDU"],
  especialista:["Docente de Educación Superior","Behance","Producción gráfica y de contenidos"],
  investigador:["Doctora en Ciencias Biológicas","10.5555/demo.2024.001","ORCID"],
  directivo:["Director académico","ISO 21001","Gestión, calidad y coordinación"],
  diseno:["Diseñadora Gráfica","Adobe InDesign","Magíster en Diseño"]
};
for (const k of ["tecnico","profesional","especialista","investigador","directivo","diseno"]) {
  const antes = erroresConsola.length;
  try { API.loadDemo(k); } catch (e) { bad(`loadDemo("${k}") lanzó: ${e.message}`); continue; }
  const hoja = doc.getElementById("sheet").innerHTML;
  const hijos = doc.getElementById("sheet").children.map(c => (c._class || "") + (c._virtual ? "(v)" : ""));
  const faltan = EXIGE[k].filter(t => !hoja.includes(t));
  const errs = [];
  const sheetEl = doc.getElementById("sheet");
  if (process.env.SMOKE_DEBUG) console.log(`      >> ${k} len=${hoja.length} ribbon=${/fake-ribbon/.test(hoja)} sig=${/cv-sig/.test(hoja)} firma=${hoja.includes("d3magindesign 2026")} kids=${sheetEl.children.length}\n         fin="${hoja.slice(-260).replace(/\n/g, " ")}"`);
  if (faltan.length) errs.push("la hoja no muestra: " + faltan.join(", "));
  if (!/class="fake-ribbon/.test(hoja) || !/EJEMPLO FICTICIO/.test(hoja)) errs.push("sin cinta de «ejemplo ficticio»");
  if (!/cv-sig/.test(hoja) || !hoja.includes("d3magindesign 2026")) errs.push("la hoja no lleva la firma d3magindesign");
  if (!hoja.includes(API.S.data.personal.nombre)) errs.push("la hoja no muestra el nombre");
  if (!hoja.includes("cv-h")) errs.push("la hoja no tiene secciones");
  if (/\[[^\]]{3,}\]/.test(hoja.replace(/<[^>]+>/g, "").replace(/\[completar\]/g, "")) && k !== "tecnico") soft(`${k}: quedan textos entre corchetes en el ejemplo`);
  const prog = doc.getElementById("progressBox").innerHTML;
  if (!/Ejemplo abierto/.test(prog)) errs.push("el panel lateral no indica que hay un ejemplo abierto");
  if (!doc.getElementById("pgChip").textContent) errs.push("el chip de progreso está vacío");
  else if (doc.getElementById("pgChip").textContent !== "Ejemplo") errs.push("durante un ejemplo el chip debería decir «Ejemplo», dice «" + doc.getElementById("pgChip").textContent + "»");
  const kit = API.kitText();
  if (!kit.includes("KIT DE LLENADO")) errs.push("el kit de llenado no se generó");
  if (!kit.includes("d3magindesign 2026")) errs.push("el kit no lleva la firma");
  if (kit.length < 2500) errs.push("el kit es demasiado corto: " + kit.length + " caracteres");
  if (erroresConsola.length > antes) errs.push("errores en consola: " + erroresConsola.slice(antes).join(" | "));
  if (errs.length) bad(`${k}: ${errs.join(" · ")}`);
  else ok(`${k.padEnd(13)} hoja ${String(hoja.length).padStart(6)} car. · kit ${String(kit.length).padStart(5)} car. · aviso de ejemplo correcto`);
}

console.log("\n[5] Vuelta a un CV propio en blanco");
try {
  API.startBlank(true);
  const hoja = doc.getElementById("sheet").innerHTML;
  if (API.S.data.personal.nombre) bad("startBlank conservó el nombre del ejemplo");
  else if (API.S.data.sections.some(s => s.rows.length)) bad("startBlank conservó filas del ejemplo");
  else if (!hoja.includes("Tu nombre completo")) bad("la hoja en blanco no muestra el marcador de nombre");
  else ok(`CV en blanco listo (diseño «${API.S.tpl}», nivel «${API.S.level}») y hoja regenerada`);
} catch (e) { bad("startBlank lanzó: " + e.message); }

console.log("\n[6] Kit de llenado en texto");
try {
  const kit = API.kitText();
  const bloques = ["QUÉ VA AQUÍ","FÓRMULA","CÓMO LLENARLO","EJEMPLO CORRECTO","EJEMPLO INCORRECTO","ERROR FRECUENTE","REVISA:","PLANTILLA PARA LLENAR"];
  const faltan = bloques.filter(b => !kit.includes(b));
  if (faltan.length) bad("al kit le falta: " + faltan.join(", "));
  else ok(`kit completo (${kit.length} caracteres, ${kit.split("\n").length} líneas)`);
  if (/\[Tus nombres y apellidos\]/.test(kit)) ok("incluye marcadores [entre corchetes] para reemplazar");
} catch (e) { bad("kitText lanzó: " + e.message); }

console.log("\n[7] Exportaciones de texto (Markdown y CSV)");
try {
  const md = API.toMarkdown();
  if (!md.includes("d3magindesign 2026")) bad("el Markdown no lleva la firma d3magindesign");
  else ok(`Markdown generado (${md.length} car.) y firmado`);
} catch (e) { bad("toMarkdown lanzó: " + e.message); }

console.log("\n[8] Regresiones: secciones nuevas, editor y métricas del perfil");
try {
  const base = API.D().sections.length;
  API.S.tab = "__new"; API.renderEditor();
  const html = doc.getElementById("edPanel").innerHTML;
  if (!/nsTitle/.test(html)) bad("el editor no ofrece crear secciones nuevas");
  else ok("editor de secciones nuevas disponible (título, columnas, prefijo, carpeta)");
  API.D().sections.push({ id:"sX", title:"Voluntariado y proyectos", kind:"exp", prefix:"12", folder:"12_Voluntariado", training:false, rows:[["2024","Voluntariado Demo (ficticio)","Coordinó la campaña de reciclaje del barrio","6 meses",""]] });
  API.S.tab = "personal"; API.renderEditor(); API.renderSheet();
  const hoja = doc.getElementById("sheet").innerHTML;
  if (!hoja.includes("Voluntariado y proyectos")) bad("una sección creada por el usuario no aparece en la hoja");
  else ok(`sección nueva integrada en la hoja (${base} → ${API.D().sections.length} secciones)`);
  const m = API.metrics();
  if (typeof m.experiencia !== "number" && m.experiencia !== null) bad("metrics() no devuelve años de experiencia");
  else ok(`metrics(): experiencia=${m.experiencia} años · horas=${m.horas} h`);
  const perfilTxt = API.perfil();
  if (!perfilTxt || /\{[a-z]+\}/i.test(perfilTxt)) bad("el perfil no reemplazó las cifras automáticas: " + perfilTxt);
  else ok("las cifras {experiencia} y {horas} del perfil se calculan solas");
} catch (e) { bad("regresión detectada: " + e.message); }

console.log("\n[9] Importar propuestas desde texto y desde respaldo .json");
try {
  const prop = API.analizarTexto(`CURRÍCULUM VITAE
Pedro Antonio Ríos Campos
Ingeniero de sistemas · Infraestructura y ciberseguridad
pedro.rios@example.com · 999 444 555
DNI 44556677
PERFIL PROFESIONAL
Ingeniero de sistemas con 10 años de experiencia en infraestructura de redes y seguridad de la información, con certificaciones internacionales y liderazgo de equipos técnicos.
EXPERIENCIA LABORAL
2018–2025 | Banco Demo (ficticio) | Jefe de infraestructura: migró 40 servidores a la nube y redujo incidentes en 45 % | 7 años
CAPACITACIÓN
2023 · Curso de Seguridad Ofensiva y Pentesting · Plataforma Aprende+, 10/03/2023 · 60 h
IDIOMAS
2021 · Inglés · Centro de Idiomas Babel, 12/12/2021 · B1
RECONOCIMIENTOS
2024 · Banco Demo (ficticio) · Reconocimiento por continuidad operativa · 2024`);
  const n = prop.informe.nombre;
  const ids = prop.data.sections.map(s => s.id);
  const filas = prop.data.sections.reduce((a, s) => a + s.rows.length, 0);
  if (/Pedro Antonio Ríos Campos/.test(n)) ok(`reconoce el nombre: «${n}»`);
  else bad("no reconoció el nombre del texto pegado: «" + n + "»");
  if (prop.informe.correo && prop.informe.celular) ok(`contacto: ${prop.informe.correo} · ${prop.informe.celular}`);
  else bad("no reconoció el contacto");
  if (["experiencia","capacitacion","idiomas","reconocimientos"].every(x => ids.includes(x))) ok(`secciones detectadas: ${ids.join(", ")} (${filas} filas)`);
  else bad("faltan secciones: " + ids.join(", "));
  if ((prop.data.perfil || "").length > 60) ok(`perfil reconocido (${prop.data.perfil.length} caracteres)`);
  else bad("no reconoció el perfil");
  const backup = API.analizarJSON({ data:{ personal:{ nombre:"Ana Demo", titular:"", campos:[], redes:[] }, perfil:"", sections:[{ id:"grados", title:"Formación académica y grados", kind:"edu", training:false, prefix:"01", folder:"01_Formacion_academica", rows:[["2020","Título Demo","Universidad Demo","",""]] }] } });
  if (backup.informe.esRespaldo) ok("reconoce un respaldo .json y avisa que reemplaza todo el formulario");
  else bad("no reconoció el respaldo .json");
} catch (e) { bad("la importación falló: " + e.message); }

console.log("\n[10] Biblioteca local de currículums");
try {
  API.loadDemo("profesional");
  const e1 = await API.bibAgregar("Versión para la convocatoria A", "sin foto");
  const e2 = await API.bibAgregar("Versión B — con curso nuevo");
  if (e1 && e2 && ctx.__bib.lista.length >= 2) ok(`se guardaron 2 versiones (motor: ${ctx.__bib.motor}) · «${e1.nombre}» y «${e2.nombre}»`);
  else bad(`no se guardaron las versiones (biblioteca: ${ctx.__bib.lista.length})`);
  if (e1 && e1.resumen.filas > 10 && e1.data.personal.nombre) ok(`cada versión guarda el CV completo: ${e1.resumen.filas} ítems de ${e1.resumen.persona}, diseño ${e1.resumen.diseno}/${e1.resumen.nivel}`);
  else bad("la versión guardada no tiene los datos esperados: " + JSON.stringify(e1 && e1.resumen));
  API.startBlank(true);
  if (!API.S.data.personal.nombre) ok("el formulario se limpió antes de restaurar la versión");
  await API.bibCargarEnFormulario(e1.id);
  if (API.S.data.personal.nombre === e1.data.personal.nombre) ok(`la versión se abrió correctamente: «${API.S.data.personal.nombre}» (${API.S.data.sections.reduce((a, s) => a + s.rows.length, 0)} ítems)`);
  else bad("al abrir la versión no se recuperó el nombre: " + API.S.data.personal.nombre);
  if (ctx.__bib.lista.some(x => x.id === e1.id)) ok("la biblioteca conserva las versiones después de abrir una");
  const antes = ctx.__bib.lista.length;
  await API.bibBorrar(e2.id);
  if (ctx.__bib.lista.length === antes - 1) ok(`borrar una versión funciona (${antes} → ${ctx.__bib.lista.length})`);
  else bad("borrar una versión no la quitó de la lista");
  if (typeof API.bibDescargarUno === "function") ok("cada versión se puede descargar como .json");
  const snap = API.bibSnapshot("Prueba", "");
  if (snap.estado && snap.data && snap.resumen) ok("la instantánea guarda datos + diseño + nivel, para poder actualizarla después");
  else bad("la instantánea está incompleta");
} catch (e) { bad("la biblioteca falló: " + e.message); }

if (erroresConsola.length) { console.log("\n[11] Errores registrados en consola"); erroresConsola.slice(0, 12).forEach(e => bad(e)); }
console.log(`\nRESULTADO: ${fail} error(es), ${warn} aviso(s)\n`);
process.exit(fail ? 1 : 0);
