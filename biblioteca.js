/* CV Studio — Biblioteca local de currículums · © 2026 d3magindesign · Mg. Mario Quiroz Martínez
   ---------------------------------------------------------------------------
   Guarda VERSIONES de tus datos en el almacenamiento del propio navegador
   (IndexedDB; si no está disponible, localStorage) para que puedas volver a
   abrirlas y actualizarlas cuando quieras.

   Importante y explícito: estos datos viven SOLO en este equipo y en este
   navegador. No se envían a ningún servidor y no quedan guardados en el
   repositorio ni en el sitio donde está publicada esta página. Si borras los
   datos del navegador o cambias de equipo, la biblioteca se pierde: por eso cada
   guardado ofrece también un archivo .json en tu carpeta de descargas.
   --------------------------------------------------------------------------- */

const BIB_KEY = "cvstudio.biblioteca.v1";
const BIB_DB = "cvstudio", BIB_STORE = "biblioteca";
/* Estado del módulo: se declara arriba porque app.js llama a bootBiblioteca()
   al terminar su inicialización. */
let bibListo = false, bibMem = [], bibUsaIDB = false, dlgBib = null;

/* ===================== 1. ALMACENAMIENTO ===================== */
function idbOpen(){
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error("sin IndexedDB"));
    const r = indexedDB.open(BIB_DB, 1);
    r.onupgradeneeded = () => { const db = r.result; if (!db.objectStoreNames.contains(BIB_STORE)) db.createObjectStore(BIB_STORE, { keyPath:"id" }); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error || new Error("IndexedDB bloqueado"));
    setTimeout(() => rej(new Error("IndexedDB no responde")), 3000);
  });
}
const idbTx = (db, modo, fn) => new Promise((res, rej) => {
  const tx = db.transaction(BIB_STORE, modo), st = tx.objectStore(BIB_STORE);
  const out = fn(st);
  tx.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
  tx.onerror = () => rej(tx.error);
});
function bibLeerLS(){ try { return JSON.parse(localStorage.getItem(BIB_KEY) || "[]"); } catch(_) { return []; } }
function bibEscribirLS(lista){ localStorage.setItem(BIB_KEY, JSON.stringify(lista)); }

async function bibCargar(){
  if (bibListo) return bibMem;
  try {
    const db = await idbOpen();
    bibUsaIDB = true;
    bibMem = (await idbTx(db, "readonly", st => st.getAll())) || [];
    db.close();
  } catch(_) {
    bibUsaIDB = false;
    bibMem = bibLeerLS();
  }
  bibMem.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  bibListo = true;
  return bibMem;
}
async function bibGuardarLista(){
  if (bibUsaIDB) {
    try {
      const db = await idbOpen();
      await idbTx(db, "readwrite", st => { bibMem.forEach(x => st.put(x)); });
      db.close();
      return { ok:true, motor:"IndexedDB" };
    } catch(e) { bibUsaIDB = false; }
  }
  try { bibEscribirLS(bibMem); return { ok:true, motor:"localStorage" }; }
  catch(e) { return { ok:false, error:"Sin espacio en el navegador para la foto o los datos. Descarga el respaldo .json." }; }
}
const bibMotor = () => bibUsaIDB ? "almacenamiento interno del navegador (IndexedDB)" : "almacenamiento del navegador (localStorage)";

/* ===================== 2. ENTRADAS ===================== */
function bibSnapshot(nombre, nota){
  const d = JSON.parse(JSON.stringify(D()));
  return {
    id: "cv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    nombre, nota: nota || "",
    fecha: new Date().toISOString(),
    resumen: {
      persona: d.personal.nombre || "(sin nombre)",
      filas: d.sections.reduce((a, s) => a + s.rows.length, 0),
      secciones: d.sections.filter(s => s.rows.length).length,
      foto: !!d.foto,
      diseno: S.tpl, nivel: S.level, modalidad: S.mode
    },
    estado: { tpl:S.tpl, level:S.level, acc:S.acc || null, limit:S.limit, photo:S.photo, mode:S.mode, sensitive:S.sensitive, socialMode:S.socialMode || null },
    data: d
  };
}
const bibFecha = iso => { try { return new Date(iso).toLocaleString("es-PE", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }); } catch(_) { return iso; } };

async function bibAgregar(nombre, nota){
  await bibCargar();
  const e = bibSnapshot(nombre || `CV de ${D().personal.nombre || "sin nombre"}`, nota);
  bibMem.unshift(e);
  const r = await bibGuardarLista();
  bibRender();
  if (!r.ok) { setStatus("error", "⚠ " + r.error); return null; }
  setStatus("saved", `«${e.nombre}» guardado en la biblioteca de este navegador (${bibMem.length} currículum(s)).`);
  return e;
}
async function bibBorrar(id){
  await bibCargar();
  const e = bibMem.find(x => x.id === id); if (!e) return;
  if (!confirm(`¿Eliminar «${e.nombre}» de la biblioteca?\n\nEsta acción solo afecta a este navegador y no se puede deshacer.`)) return;
  bibMem = bibMem.filter(x => x.id !== id);
  if (bibUsaIDB) { try { const db = await idbOpen(); await idbTx(db, "readwrite", st => st.delete(id)); db.close(); } catch(_) {} }
  await bibGuardarLista();
  bibRender();
  setStatus("saved", "Versión eliminada de la biblioteca.");
}
async function bibRenombrar(id){
  await bibCargar();
  const e = bibMem.find(x => x.id === id); if (!e) return;
  const n = prompt("Nuevo nombre para esta versión:", e.nombre);
  if (n === null || !n.trim()) return;
  e.nombre = n.trim();
  await bibGuardarLista(); bibRender();
}
async function bibCargarEnFormulario(id){
  await bibCargar();
  const e = bibMem.find(x => x.id === id); if (!e) return;
  const conDiseno = confirm(`Vas a abrir «${e.nombre}» (${bibFecha(e.fecha)}).\n\nAceptar = recuperar los datos Y el diseño (${e.resumen.diseno}, ${e.resumen.nivel}).\nCancelar = recuperar solo los datos, manteniendo tu diseño actual.`);
  S.data = JSON.parse(JSON.stringify(e.data));
  if (conDiseno && e.estado) {
    S.tpl = e.estado.tpl || S.tpl; S.level = e.estado.level || S.level;
    S.acc = e.estado.acc || null; S.limit = e.estado.limit || "auto";
    S.photo = e.estado.photo !== false; S.mode = e.estado.mode || S.mode;
    S.sensitive = !!e.estado.sensitive; S.socialMode = e.estado.socialMode || S.socialMode;
  }
  S.demo = null; S.tab = "personal"; S.disabled = [];
  applyCol4Defaults(S.data); migrateResearch(S);
  booting = true; refreshAll(); booting = false;
  save(); renderSheet();
  setStatus("dirty", `Abierto «${e.nombre}». Edítalo y pulsa 💾 Guardar (o guárdalo como versión nueva).`);
  byId("editor")?.scrollIntoView({ behavior:"smooth" });
}
function bibDescargarUno(id){
  const e = bibMem.find(x => x.id === id); if (!e) return;
  const slug = (e.nombre || "cv").normalize("NFD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_").slice(0, 40);
  download(new Blob([JSON.stringify({ cvstudio:1, exportado:new Date().toISOString(), estado:e.estado, data:e.data }, null, 2)],
    { type:"application/json" }), `${slug}.json`);
  setStatus("saved", "Archivo .json descargado en tu equipo.");
}
async function bibDuplicar(id){
  await bibCargar();
  const e = bibMem.find(x => x.id === id); if (!e) return;
  const copia = JSON.parse(JSON.stringify(e));
  copia.id = "cv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  copia.nombre = e.nombre + " (copia)"; copia.fecha = new Date().toISOString();
  bibMem.unshift(copia); await bibGuardarLista(); bibRender();
}

/* ===================== 3. INTERFAZ ===================== */
function ensureBib(){
  if (dlgBib) return;
  dlgBib = document.createElement("dialog");
  dlgBib.className = "g-dlg bib-dlg";
  dlgBib.id = "bibDlg";
  dlgBib.addEventListener("click", async e => {
    const t = e.target.closest("[data-bib]"); if (!t) return;
    const a = t.dataset.bib, id = t.dataset.id;
    if (a === "close") dlgBib.close();
    else if (a === "guardar") {
      const n = byId("bibNombre")?.value.trim();
      await bibAgregar(n || undefined, byId("bibNota")?.value.trim());
      byId("bibNombre").value = "";
      if (byId("bibNota")) byId("bibNota").value = "";
    }
    else if (a === "cargar") bibCargarEnFormulario(id);
    else if (a === "borrar") bibBorrar(id);
    else if (a === "renombrar") bibRenombrar(id);
    else if (a === "duplicar") bibDuplicar(id);
    else if (a === "descargar") bibDescargarUno(id);
    else if (a === "importar") byId("bibImport").click();
    else if (a === "vaciar") {
      if (!confirm("¿Vaciar toda la biblioteca de este navegador? Descarga antes los .json que quieras conservar.")) return;
      bibMem = [];
      if (bibUsaIDB) { try { const db = await idbOpen(); await idbTx(db, "readwrite", st => st.clear()); db.close(); } catch(_) {} }
      bibEscribirLS([]); bibRender();
      setStatus("saved", "Biblioteca vaciada.");
    }
  });
  dlgBib.addEventListener("change", async e => {
    if (e.target.id !== "bibImport") return;
    const f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    try {
      const o = JSON.parse(await f.text());
      const fuente = o.data ? o : (o.cvstudio || o.estado ? { data:o.data, estado:o.estado } : null);
      if (!fuente || !fuente.data || !fuente.data.sections) throw new Error("El archivo no contiene un currículum de CV Studio.");
      await bibCargar();
      const e2 = {
        id:"cv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        nombre: (f.name || "importado").replace(/\.json$/i, ""),
        nota: "Importado desde archivo",
        fecha: new Date().toISOString(),
        resumen: { persona: fuente.data.personal?.nombre || "(sin nombre)", filas: fuente.data.sections.reduce((a, s) => a + (s.rows || []).length, 0),
          secciones: fuente.data.sections.filter(s => s.rows?.length).length, foto: !!fuente.data.foto,
          diseno: fuente.estado?.tpl || S.tpl, nivel: fuente.estado?.level || S.level, modalidad: fuente.estado?.mode || "nodoc" },
        estado: fuente.estado || {},
        data: fuente.data
      };
      bibMem.unshift(e2);
      const r = await bibGuardarLista();
      bibRender();
      setStatus(r.ok ? "saved" : "error", r.ok ? `«${e2.nombre}» agregado a la biblioteca.` : "⚠ " + r.error);
    } catch (err) { alert("No se pudo importar: " + err.message); }
  });
  document.body.appendChild(dlgBib);
}
function bibRender(){
  if (!dlgBib) return;
  const lista = bibMem, caja = byId("bibLista");
  if (!caja) return;
  caja.innerHTML = lista.length ? lista.map(e => `
    <article class="bib-item">
      <div class="bib-dot" style="background:${(window.TEMPLATES?.[e.resumen.diseno] || {}).acc || "var(--teal)"}"></div>
      <div class="bib-tx">
        <b>${esc_(e.nombre)}</b>
        <small>${esc_(e.resumen.persona)} · ${e.resumen.filas} ítem(s) · ${e.resumen.secciones} sección(es)${e.resumen.foto ? " · con foto" : ""}</small>
        <small class="bib-meta">${esc_(bibFecha(e.fecha))} · ${esc_(e.resumen.diseno)} · ${esc_(e.resumen.nivel)} · ${esc_(e.resumen.modalidad === "doc" ? "documentado" : "no documentado")}</small>
        ${e.nota ? `<small class="bib-nota">${esc_(e.nota)}</small>` : ""}
      </div>
      <div class="bib-acts">
        <button type="button" class="btn btn-doc btn-sm" data-bib="cargar" data-id="${e.id}">⤒ Abrir</button>
        <button type="button" class="btn btn-ghost btn-sm" data-bib="descargar" data-id="${e.id}" title="Descargar esta versión como .json">⤓</button>
        <button type="button" class="btn btn-ghost btn-sm" data-bib="renombrar" data-id="${e.id}" title="Renombrar">✎</button>
        <button type="button" class="btn btn-ghost btn-sm" data-bib="duplicar" data-id="${e.id}" title="Duplicar">⧉</button>
        <button type="button" class="btn btn-ghost btn-sm bib-del" data-bib="borrar" data-id="${e.id}" title="Eliminar de la biblioteca">🗑</button>
      </div>
    </article>`).join("")
    : `<p class="bib-vacia">Todavía no has guardado ninguna versión. Escribe el nombre y pulsa <b>«💾 Guardar versión»</b>.</p>`;
  const n = byId("bibCount"); if (n) n.textContent = String(lista.length);
}
async function showBiblioteca(){
  ensureBib();
  await bibCargar();
  const sugerido = `CV de ${D().personal.nombre || "sin nombre"} — ${new Date().toLocaleDateString("es-PE")}`;
  dlgBib.innerHTML = `
    <div class="dlg-h"><span class="gd-ic" style="background:var(--teal)">🗄</span>
      <h3>Mi biblioteca de currículums<small><b id="bibCount">0</b> versión(es) guardadas · ${esc_(bibMotor())}</small></h3>
      <button type="button" class="icon-btn" data-bib="close" aria-label="Cerrar">✕</button></div>
    <div class="dlg-b bib-body">
      <div class="bib-privacy" role="note">
        <b>🔒 Tus datos son solo tuyos.</b>
        <p>Esta página no tiene servidor ni base de datos: <b>nada de lo que escribes se guarda en el repositorio ni en el sitio donde está publicada</b>.
        La biblioteca vive únicamente en <b>este navegador y este equipo</b>. Si borras los datos del navegador, usas el modo incógnito o cambias de computadora,
        la biblioteca no viaja contigo: para eso descarga el <b>.json</b> de cada versión (vive en tu carpeta de descargas y puedes volver a importarlo).</p>
      </div>
      <div class="bib-nueva">
        <label class="fl" style="margin-top:0">Nombre de esta versión</label>
        <input id="bibNombre" placeholder="${esc_(sugerido)}" value="${esc_(sugerido)}">
        <label class="fl">Nota (opcional)</label>
        <input id="bibNota" placeholder="Ej.: versión para la convocatoria del MINEDU, sin la foto">
        <div class="row-inline" style="margin-top:12px">
          <button type="button" class="btn btn-doc" data-bib="guardar">💾 Guardar versión</button>
          <button type="button" class="btn btn-ghost" data-bib="importar">⤒ Importar un .json a la biblioteca</button>
          ${bibMem.length ? `<button type="button" class="btn btn-ghost btn-sm bib-del" data-bib="vaciar">Vaciar biblioteca</button>` : ""}
        </div>
      </div>
      <h4 class="bib-h">Versiones guardadas</h4>
      <div id="bibLista" class="bib-lista"></div>
    </div>
    <div class="dlg-f"><button type="button" class="btn btn-ghost" data-bib="close">Cerrar</button></div>`;
  bibRender();
  if (typeof dlgBib.showModal === "function") dlgBib.showModal(); else dlgBib.setAttribute("open", "");
}
/* Guardado rápido desde la barra de herramientas: guarda y ofrece el .json */
async function bibGuardarRapido(){
  await bibCargar();
  const n = prompt("Nombre de esta versión en tu biblioteca:", `CV de ${D().personal.nombre || "sin nombre"} — ${new Date().toLocaleDateString("es-PE")}`);
  if (n === null) return;
  const e = await bibAgregar(n.trim() || undefined, "");
  if (!e) return;
  const quiere = confirm(`«${e.nombre}» quedó guardado en la biblioteca de ESTE navegador.\n\n¿Quieres además descargar un archivo .json en tu equipo?\n(Es la única forma de llevarte tus datos a otra computadora o conservarlos si borras los datos del navegador).`);
  if (quiere) bibDescargarUno(e.id);
}

/* ===================== 4. AVISO FIJO DE PRIVACIDAD ===================== */
function renderPrivacyNote(){
  document.querySelectorAll("[data-privacy]").forEach(el => {
    el.innerHTML = `<b>🔒 Todo queda en tu navegador.</b> Esta página no envía ni almacena tus datos en ningún servidor:
      lo que escribes vive solo en tu equipo, y si cierras sin guardar puedes perderlo.
      Usa <b>💾 Guardar</b> para conservarlo en este navegador y <b>🗄 Mi biblioteca</b> para guardar versiones o llevarte un <b>.json</b>.`;
  });
}

/* ===================== 5. ARRANQUE ===================== */
function bootBiblioteca(){
  /* Si el documento aún se está parseando, se espera al evento load */
  if (document.readyState !== "complete") return addEventListener("load", bootBiblioteca, { once:true });
  try {
    ensureBib();
    bibCargar();
    renderPrivacyNote();
    /* Atajos: cualquier botón con data-bib-open abre la biblioteca */
    document.addEventListener("click", e => {
      const t = e.target.closest("[data-bib-open]");
      if (t) { e.preventDefault(); showBiblioteca(); }
    });
  } catch (e) { console.error("[biblioteca] error al iniciar:", e); }
}
