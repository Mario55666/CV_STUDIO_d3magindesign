/* CV Studio — Capa didáctica · © 2026 d3magindesign · Mg. Mario Quiroz Martínez
   ---------------------------------------------------------------------------
   Este archivo se carga ANTES de app.js y define lo que app.js invoca al dibujar
   (anotaciones, progreso, aviso de ejemplo). También registra sus propios eventos:
   botones de demo, modal «qué debe llevar», kit de llenado, progreso y recorrido.

   Regla de oro: NADA de lo que hay aquí se imprime. Son ayudas de aprendizaje.
   --------------------------------------------------------------------------- */

const BRAND = window.APP_BRAND || { linea:"d3magindesign 2026 · Mg. Mario Quiroz Martínez" };
const byId = id => document.getElementById(id);
const esc_ = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));

/* ===================== 1. BOTONES DE DEMO ===================== */
/* Cada botón carga un CV completo de una persona ficticia del nivel correspondiente. */
function demoButtonsHTML(cls){
  return (window.DEMO_ORDER || Object.keys(window.DEMOS)).map(k => {
    const d = window.DEMOS[k]; if (!d) return "";
    const on = (typeof S !== "undefined" && S.demo === k);
    return `<button type="button" class="demo-btn ${cls || ""} ${on ? "on" : ""}" data-demo="${k}"
        style="--dacc:${d.acc}" aria-pressed="${on}"
        title="Cargar el ejemplo de ${esc_(d.who)} — ${esc_(d.role)}">
      <span class="demo-av" style="background:${d.acc}">${esc_(initials(d.who))}</span>
      <span class="demo-tx"><b>${esc_(d.label)}</b><small>${esc_(d.nivel)}</small></span>
      <span class="demo-go">Ver ejemplo ›</span>
    </button>`;
  }).join("");
}
function renderDemoStrip(){
  const box = byId("demoStrip"); if (!box) return;
  box.innerHTML = `<div class="demo-grid">${demoButtonsHTML("big")}</div>
    <p class="demo-hint">🧪 Son <b>datos inventados</b> (personas, instituciones, resoluciones y DOI ficticios). Cárgalos para ver
    cómo se llena un CV completo en cada nivel; después pulsa <b>«✏️ Empezar mi CV»</b> y reescribe cada parte con tu información.</p>`;
}
function hasOwnData(){
  if (typeof S === "undefined" || !S.data) return false;
  if (S.demo) return false;
  return !!(D().personal.nombre || D().sections.some(s => s.rows.length));
}
function refreshAllSafe(){
  booting = true;
  if (typeof refreshAll === "function") refreshAll();
  if (typeof renderSheet === "function") renderSheet();
  booting = false;
}
/* Carga un ejemplo completo; si ya hay datos propios, pide confirmación. */
function loadDemo(key){
  const d = window.DEMOS[key]; if (!d) return;
  if (hasOwnData() && !confirm("Cargar el ejemplo reemplazará los datos que escribiste.\n\nAntes puedes usar «⤓ Respaldo .json».\n\n¿Continuar?")) return;
  const data = JSON.parse(JSON.stringify(d.data));
  data.foto = window.demoAvatar(initials(d.who), d.acc, "#c9822b");
  S.data = data;
  S.demo = key; S.level = (window.LEVEL_KEYS || []).includes(key) ? key : "especialista";
  S.tpl = d.tpl; S.acc = null; S.mode = "nodoc"; S.sensitive = false;
  S.disabled = []; S.hoursF = "all"; S.yearsF = "all"; S.tab = "personal";
  S.annot = true; S.photo = true; S.limit = "auto";
  try { localStorage.setItem("cvstudio.demoSeen", "1"); } catch(_) {}
  refreshAllSafe(); save();
  setStatus("dirty", `Ejemplo cargado: ${d.who} (ficticio). Explóralo y luego pulsa «✏️ Empezar mi CV».`);
  byId("vista")?.scrollIntoView({ behavior:"smooth" });
}
/* CV en blanco: conserva diseño y nivel, borra todo lo demás. */
function startBlank(fromDemo){
  if (!fromDemo && hasOwnData() && !confirm("¿Borrar todo y empezar un CV en blanco? (Descarga un respaldo antes si quieres conservar tus datos).")) return;
  const keep = { tpl:S.tpl, level:S.level };
  S = defaults(); S.tpl = keep.tpl; S.level = keep.level; migrate(S);
  refreshAllSafe(); save();
  setStatus("dirty", "Formulario limpio. Escribe tus datos en el Paso 3, o trae tu CV de Word con «📄 Abrir Word / pegar texto».");
  byId("editor")?.scrollIntoView({ behavior:"smooth" });
}
/* Usar el ejemplo como esqueleto: mantiene secciones y diseño, vacía los datos personales. */
function demoAsBase(){
  if (!confirm("Se mantienen el diseño, el nivel y las secciones del ejemplo, pero se vacían el nombre, el contacto, la foto y el perfil para que escribas los tuyos.\n\nLas filas de ejemplo quedan como molde para que las reemplaces.\n\n¿Continuar?")) return;
  const p = D().personal;
  p.nombre = ""; p.titular = ""; p.redes = [];
  p.campos.forEach(c => { c[1] = ""; c[3] = ""; });
  D().foto = null; D().perfilCustom = false; D().perfil = ""; S.demo = null;
  refreshAllSafe(); save();
  setStatus("dirty", "Listo: reemplaza las filas de ejemplo por las tuyas, sección por sección.");
  byId("editor")?.scrollIntoView({ behavior:"smooth" });
}

/* ===================== 2. AVISO DE EJEMPLO + FIRMA ===================== */
function renderDemoBanner(){
  document.querySelectorAll(".demo-banner").forEach(b => {
    if (!S.demo) { b.hidden = true; b.innerHTML = ""; return; }
    const d = window.DEMOS[S.demo] || {};
    b.hidden = false;
    b.innerHTML = `<span class="db-ic" aria-hidden="true">🧪</span>
      <div class="db-tx"><b>Estás viendo un ejemplo ficticio:</b> ${esc_(d.who)} · ${esc_(d.label)}.
      <small>Las personas, instituciones, resoluciones, DOI y documentos son inventados: sirven solo para aprender cómo se llena cada parte.</small></div>
      <div class="db-acts"><button type="button" class="btn btn-ghost btn-sm" data-g="kit">🗒 Kit de llenado</button>
      <button type="button" class="btn btn-ghost btn-sm" data-g="asbase">Usar como base</button>
      <button type="button" class="btn btn-doc btn-sm" data-g="blank">✏️ Empezar mi CV</button></div>`;
  });
  renderFakeRibbon();
}
/* Cinta «EJEMPLO FICTICIO» sobre la hoja (solo en pantalla) + firma del aplicativo.
   Las dos son marcas de aprendizaje: la cinta no se imprime y la firma va al pie,
   sin alterar la paginación del CV. */
function renderFakeRibbon(){
  const sheet = byId("sheet"); if (!sheet) return;
  /* 1. Quita las marcas de la pasada anterior (la cinta va al final del HTML y
        estorbaría al anclaje del pie que se hace en el paso 2). */
  let h = sheet.innerHTML.replace(/<div class="fake-ribbon[^"]*">[^<]*<\/div>/g, "");
  /* 2. Firma del aplicativo al pie del CV: el pie termina en «</span></div>». */
  if (!/<div class="cv-sig">/.test(h)) h = h.replace(/<\/span><\/div>\s*$/, `</span><div class="cv-sig">${esc_(BRAND.linea)}</div></div>`);
  /* 3. Cinta de aviso, solo si se está viendo un ejemplo ficticio. */
  if (S.demo) h += `<div class="fake-ribbon no-print">EJEMPLO FICTICIO · DATOS INVENTADOS</div>`;
  sheet.innerHTML = h;
}
/* Firma del aplicativo para los archivos exportados.
   app.js la usa al cerrar el Markdown y el pie de página de Word; se define aquí
   porque este archivo se carga primero. */
const BRAND_SIG = BRAND.linea;
function brandFileNote(name){
  return /\.md$/i.test(String(name)) ? `\n\n---\n\n_${BRAND_SIG}_\n` : "";
}

/* ===================== 3. NOTAS DIDÁCTICAS SOBRE LA HOJA ===================== */
function annotHTML(k){
  if (!S.annot || !window.ANNOT[k] || S.demo) return "";
  return `<aside class="annot no-print" role="note">💡 ${esc_(window.ANNOT[k])}</aside>`;
}
function emptySectionsHint(){
  if (!S.annot) return "";
  const empty = orderedSections().filter(s => !S.disabled.includes(s.id) && !s.rows.length);
  if (!empty.length) return "";
  return `<div class="annot empty-secs no-print">🗂 Todavía no tienen filas (no se imprimen): ${empty.map(s => `<a href="#editor" data-gotab="${s.id}">${esc_(s.title)}</a>`).join(" · ")}</div>`;
}

/* ===================== 4. GUÍA POR SECCIÓN DENTRO DEL EDITOR ===================== */
function guideBoxHTML(id){
  const g = window.GUIDE[id] || window.GUIDE._default;
  const tieneDatos = id === "personal" ? !!D().personal.nombre : !!D().sections.find(s => s.id === id)?.rows.length;
  const abierto = S.demo || !tieneDatos;
  const lista = (arr, cls) => (arr || []).map(x => `<li class="${cls || ""}">${esc_(x)}</li>`).join("");
  return `<details class="guide-box" ${abierto ? "open" : ""}>
    <summary>${g.icon} <b>¿Qué va aquí?</b> <span class="gb-que">${esc_(g.que)}</span></summary>
    <div class="gb-body">
      ${g.formula ? `<div class="gb-formula"><b>Fórmula:</b> <span>${esc_(g.formula)}</span></div>` : ""}
      <div class="gb-grid">
        <div class="gb-col"><h5>✅ Cómo llenarlo</h5><ol>${lista(g.pasos)}</ol></div>
        <div class="gb-col">
          ${g.bien ? `<div class="gb-ok"><h5>👍 Así sí</h5><p>${esc_(g.bien)}</p></div>` : ""}
          ${g.mal ? `<div class="gb-bad"><h5>👎 Así no</h5><p>${esc_(g.mal)}</p></div>` : ""}
          ${g.error ? `<div class="gb-err"><h5>⚠️ Error frecuente</h5><p>${esc_(g.error)}</p></div>` : ""}
        </div>
      </div>
      ${g.checklist ? `<div class="gb-check"><h5>Antes de pasar de sección, revisa:</h5><ul>${lista(g.checklist)}</ul></div>` : ""}
      <div class="gb-acts"><button type="button" class="btn btn-ghost btn-sm" data-g="kit">🗒 Ver mi kit de llenado completo</button>
        <button type="button" class="btn btn-ghost btn-sm" data-g="demo">🧪 Ver un ejemplo completo</button></div>
    </div></details>`;
}

/* ===================== 5. MODAL: QUÉ DEBE LLEVAR CADA NIVEL ===================== */
let dlgLevel = null;
function ensureDialogs(){
  if (dlgLevel) return;
  dlgLevel = document.createElement("dialog");
  dlgLevel.className = "g-dlg";
  dlgLevel.id = "lvlDlg";
  dlgLevel.addEventListener("click", e => {
    const t = e.target.closest("[data-g]"); if (!t) return;
    const g = t.dataset.g;
    if (g === "close") dlgLevel.close();
    else if (g === "thisdemo") { const k = t.dataset.demo; dlgLevel.close(); loadDemo(k); }
    else if (g === "blank") { dlgLevel.close(); startBlank(false); }
  });
  document.body.appendChild(dlgLevel);
}
function showLevelDialog(key){
  ensureDialogs();
  const n = window.LEVEL_NOTES[key], d = window.DEMOS[key];
  if (!n) return;
  const li = (arr, cls) => (arr || []).map(x => `<li class="${cls || ""}">${esc_(x)}</li>`).join("");
  dlgLevel.innerHTML = `
    <div class="dlg-h"><span class="gd-ic" style="background:${d ? d.acc : "var(--navy)"}">${d ? esc_(initials(d.who)) : "★"}</span>
      <h3>${esc_(d ? d.label : key)}<small>Qué debe llevar este CV y cuánto debe medir</small></h3>
      <button type="button" class="icon-btn" data-g="close" aria-label="Cerrar">✕</button></div>
    <div class="gd-body">
      <div class="gd-meta">
        <span><b>Extensión:</b> ${esc_(n.pages)}</span>
        <span><b>Límite:</b> ${esc_(n.limit)}</span>
        ${d ? `<span><b>Ejemplo:</b> ${esc_(d.who)}</span>` : ""}
      </div>
      <p class="gd-alcance">${esc_(n.alcance)}</p>
      <div class="gd-grid">
        <div><h4>✅ Sí debe llevar</h4><ul class="gd-yes">${li(n.lleva)}</ul></div>
        <div><h4>🚫 Mejor no incluir</h4><ul class="gd-no">${li(n.quita)}</ul></div>
      </div>
      ${d ? `<div class="gd-aprende"><h4>🎯 Qué vas a aprender con este ejemplo</h4><ul>${li(d.aprende)}</ul></div>` : ""}
      <div class="gd-tip"><b>💡 Consejo:</b> ${esc_(n.tip)}</div>
    </div>
    <div class="dlg-f">
      <button type="button" class="btn btn-ghost" data-g="close">Cerrar</button>
      <button type="button" class="btn btn-ghost" data-g="blank">✏️ Empezar mi CV</button>
      ${d ? `<button type="button" class="btn btn-doc" data-g="thisdemo" data-demo="${key}">▶ Cargar este ejemplo</button>` : ""}
    </div>`;
  if (typeof dlgLevel.showModal === "function") dlgLevel.showModal(); else dlgLevel.setAttribute("open", "");
}

/* ===================== 6. KIT DE LLENADO (texto para copiar o descargar) ===================== */
function kitText(soloSeccion){
  const p = D().personal, P = [];
  P.push(`KIT DE LLENADO DE CV · ${BRAND.producto}`);
  P.push(`Guía didáctica de ${BRAND.linea}`);
  P.push("=".repeat(74));
  P.push(`Nivel elegido: ${lvl().name} (${lvl().pages} páginas · ${lvl().limit === 0 ? "todos los cursos" : "hasta " + lvl().limit + " cursos por sección"})`);
  P.push("Todo lo que va entre [corchetes] debes reemplazarlo con tu información.");
  P.push("");
  const bloque = (id, titulo) => {
    const g = window.GUIDE[id] || window.GUIDE._default;
    P.push("-".repeat(74));
    P.push(`${g.icon} ${titulo}`);
    P.push("-".repeat(74));
    P.push(`QUÉ VA AQUÍ: ${g.que}`);
    if (g.formula) P.push(`FÓRMULA: ${g.formula}`);
    P.push("CÓMO LLENARLO:");
    (g.pasos || []).forEach((x, i) => P.push(`  ${i + 1}. ${x}`));
    if (g.bien) P.push(`EJEMPLO CORRECTO: ${g.bien}`);
    if (g.mal) P.push(`EJEMPLO INCORRECTO: ${g.mal}`);
    if (g.error) P.push(`ERROR FRECUENTE: ${g.error}`);
    if (g.checklist) { P.push("REVISA:"); g.checklist.forEach(x => P.push(`  [ ] ${x}`)); }
    P.push("");
  };
  if (soloSeccion && soloSeccion !== "personal") {
    const s = D().sections.find(x => x.id === soloSeccion);
    bloque(soloSeccion, s ? s.title : soloSeccion);
  } else {
    bloque("personal", "Datos personales y contacto");
    bloque("perfil", "Perfil profesional (el párrafo de presentación)");
    const orden = orderedSections();
    orden.forEach((s, i) => { if (i < 6) bloque(s.id, s.title); });
    if (orden.length > 6) P.push(`(Continúa con ${orden.length - 6} sección(es) más: ábrelas en el editor y usa su guía «¿Qué va aquí?».)\n`);
  }
  P.push("=".repeat(74));
  P.push("PLANTILLA PARA LLENAR (copia esto y reemplaza los corchetes)");
  P.push("=".repeat(74));
  P.push(`NOMBRE COMPLETO: ${p.nombre || "[Tus nombres y apellidos]"}${S.demo ? "   (proviene del ejemplo ficticio)" : ""}`);
  P.push(`TITULAR: ${p.titular || lvl().title}`);
  P.push("CONTACTO:");
  p.campos.forEach(c => { if (!c[2]) P.push(`  ${c[0]}: ${c[1] || "[completar]"}`); });
  P.push("  (Los campos sensibles —documento y domicilio— solo aparecen en el CV documentado.)");
  P.push("");
  P.push("PERFIL:");
  P.push(`  ${perfilRaw() || "[" + lvl().perfil + "]"}`);
  P.push("");
  orderedSections().forEach((s, i) => {
    if (i >= 6) return;
    const cols = colsOf(s), cols3 = cols.slice(0, show4(s) ? 4 : 3);
    P.push(`${s.title.toUpperCase()}  (${visibleRows(s).rows.length} fila(s))`);
    P.push(`  Columnas: ${cols3.join(" | ")}`);
    visibleRows(s).rows.forEach(r => P.push(`  - ${cols3.map((c, k) => r.cells[k] || "[completar]").join(" | ")}`));
    P.push("");
  });
  if (S.demo) { P.push("NOTA: este kit proviene de un EJEMPLO FICTICIO (persona e instituciones inventadas)."); P.push(""); }
  P.push(`Documento generado con ${BRAND.producto} · ${BRAND.linea}`);
  return P.join("\n");
}
let dlgKit = null;
function ensureKit(){
  if (dlgKit) return;
  dlgKit = document.createElement("dialog");
  dlgKit.className = "g-dlg kit-dlg";
  dlgKit.id = "kitDlg";
  dlgKit.addEventListener("click", e => {
    const t = e.target.closest("[data-g]"); if (!t) return;
    const g = t.dataset.g;
    if (g === "close") dlgKit.close();
    else if (g === "kitcopy") {
      const ta = byId("kitText"); if (!ta) return;
      ta.select();
      const done = () => { t.textContent = "✓ Copiado"; setTimeout(() => (t.textContent = "⧉ Copiar todo"), 1800); };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(ta.value).then(done, () => { try { document.execCommand("copy"); done(); } catch(_) {} });
      else { try { document.execCommand("copy"); done(); } catch(_) {} }
    }
    else if (g === "kitmd") download(new Blob([kitText()], { type:"text/markdown;charset=utf-8" }), `Kit_de_llenado_${new Date().toISOString().slice(0,10)}.md`);
  });
  document.body.appendChild(dlgKit);
}
function showKit(seccion){
  ensureKit();
  dlgKit.innerHTML = `<div class="dlg-h"><span class="gd-ic" style="background:var(--teal)">🗒</span>
      <h3>Kit de llenado<small>Cómo escribir cada parte, con ejemplos y lista de verificación</small></h3>
      <button type="button" class="icon-btn" data-g="close" aria-label="Cerrar">✕</button></div>
    <div class="dlg-b"><textarea id="kitText" spellcheck="false" readonly>${esc_(kitText(seccion))}</textarea></div>
    <div class="dlg-f"><button type="button" class="btn btn-ghost" data-g="close">Cerrar</button>
      <button type="button" class="btn btn-ghost" data-g="kitmd">⤓ Descargar .md</button>
      <button type="button" class="btn btn-nodoc" data-g="kitcopy">⧉ Copiar todo</button></div>`;
  if (typeof dlgKit.showModal === "function") dlgKit.showModal(); else dlgKit.setAttribute("open", "");
}

/* ===================== 7. PROGRESO DEL CV ===================== */
/* Chip de estado (abajo a la derecha): diseño · nivel arriba y modalidad debajo.
   Discreto: se aclara con el cursor encima. app.js lo llama al dibujar la hoja. */
function renderStatusChip(){
  const t = byId("pillTpl"), m = byId("modePill"), caja = byId("cvStatus");
  if (t) t.textContent = `${tpl().name.split(" ")[0]} · ${lvl().name.split(" ")[0]}`;
  if (m) m.textContent = S.mode === "doc" ? "Documentado" : "No documentado";
  if (caja) caja.classList.toggle("is-doc", S.mode === "doc");
}
function progressItems(){  const p = D().personal, val = l => (p.campos.find(c => c[0] === l) || [])[1];
  const rows = id => (D().sections.find(s => s.id === id)?.rows.filter(r => r[1]).length || 0);
  const perfilOk = !!perfil() && !/\[[^\]]+\]/.test(perfil());
  return [
    { k:"Nombre completo", ok:!!p.nombre, go:"personal" },
    { k:"Correo y celular", ok:!!val("Correo") && !!val("Celular"), go:"personal" },
    { k:"Titular profesional", ok:!!p.titular && !/\[[^\]]+\]/.test(p.titular), go:"#diseno" },
    { k:"Perfil sin [textos por completar]", ok:perfilOk, go:"#diseno" },
    { k:"Al menos un grado o título", ok:rows("grados") > 0, go:"grados" },
    { k:"Experiencia (profesional o docente)", ok:rows("experiencia") + rows("docente") > 0, go:"experiencia" },
    { k:"Capacitación con horas", ok:D().sections.filter(s => s.training).some(s => s.rows.some(r => hoursOf(r[3]) != null)), go:"capacitacion" },
    { k:"Foto (opcional)", ok:!!D().foto, go:"#diseno", opt:true },
    { k:"Enlaces de evidencia (opcional)", ok:D().sections.some(s => s.rows.some(r => r[4])), go:"grados", opt:true }
  ];
}
function renderProgress(){
  const box = byId("progressBox"); if (!box) return;
  const it = progressItems(), req = it.filter(x => !x.opt), done = req.filter(x => x.ok).length;
  const pct = Math.round(done / req.length * 100);
  const chip = byId("pgChip");
  if (S.demo) {
    /* Con un ejemplo cargado no se mide el avance: se explica. */
    box.innerHTML = `<div class="pg-demo"><b>🧪 Ejemplo abierto: ${esc_((window.DEMOS[S.demo] || {}).who || "")}</b>
      <p>Este medidor cuenta <b>tus</b> pasos. Aquí verás 0 % hasta que empieces tu propio CV con
      «✏️ Empezar mi CV» (a la derecha) y completes tus datos.</p>
      <button type="button" class="btn btn-ghost btn-sm" data-g="kit">🗒 Kit de llenado</button></div>`;
    if (chip) { chip.textContent = "Ejemplo"; chip.style.setProperty("--p", 0); chip.hidden = false; }
    return;
  }
  box.innerHTML = `<div class="pg-top"><b>Tu CV al ${pct} %</b><span>${done} de ${req.length} pasos esenciales</span></div>
    <div class="pg-bar"><i style="width:${pct}%"></i></div>
    <ul class="pg-list">${it.map(x => `<li class="${x.ok ? "ok" : ""}"><button type="button" data-pgo="${x.go}">${x.ok ? "✔" : "○"} ${esc_(x.k)}${x.opt ? " <small>(opcional)</small>" : ""}</button></li>`).join("")}</ul>
    ${pct === 0 ? `<p class="pg-note">Aún no hay datos: empieza por <b>Datos personales</b> o mira un ejemplo antes.</p>`
      : (pct < 100 ? `<p class="pg-note">Pulsa un punto pendiente para ir directo a completarlo.</p>` : `<p class="pg-note">¡Listo! Revisa la vista previa y exporta tu CV.</p>`)}`;
  if (chip) { chip.textContent = `${pct} %`; chip.style.setProperty("--p", pct); chip.hidden = false; }
}

/* ===================== 8. RECORRIDO GUIADO ===================== */
const TOUR = [
  { sel:"#demoStrip",         t:"1 · Mira un ejemplo", x:"Cada botón carga un CV completo, ficticio, de un nivel profesional. Son tu molde: mira cómo se redacta cada parte antes de escribir la tuya." },
  { sel:"#lvlGrid",           t:"2 · Elige tu nivel",  x:"El nivel decide la extensión, cuántos cursos se muestran y el orden de las secciones. Pulsa «¿Qué debe llevar?» en cualquier tarjeta." },
  { sel:".steps",             t:"3 · Los 6 pasos",     x:"Modalidad, diseño y nivel, datos, vista previa, evidencias y exportación. Puedes volver a cualquier paso cuando quieras." },
  { sel:"#tplGrid",           t:"4 · Elige el diseño", x:"El formato visual cambia la tipografía y la estructura, pero nunca tus datos. Cámbialo cuando quieras." },
  { sel:"#edTabs",            t:"5 · Llena tus datos", x:"Cada pestaña es una sección del CV. Arriba verás «¿Qué va aquí?» con la fórmula, un ejemplo correcto, uno incorrecto y el error más frecuente." },
  { sel:"#progressBox",       t:"6 · Tu progreso",     x:"Esta lista te dice qué falta y te lleva directo a completarlo. Si te trabas en una sección, abre el kit de llenado." },
  { sel:"#editor .toolbar",   t:"7 · Guardar y traer", x:"Aquí tienes «🗄 Mi biblioteca» para guardar versiones de tu CV y abrirlas después, «📄 Abrir Word» para llenar el formulario desde un documento, y «🧹 Limpiar formulario» para empezar de cero. Todo queda en tu navegador." },
  { sel:"#sheet",             t:"8 · Revisa la hoja",  x:"Así se verá tu CV. Las notas 💡 son consejos de estudio y no se imprimen. El botón «💡 Ejemplo» muestra u oculta las marcas didácticas." },
  { sel:"#exportar .ex-grid", t:"9 · Exporta",         x:"Descarga en PDF o Word, o genera un prompt para pulir la redacción con IA. Antes de cerrar, pulsa 💾 Guardar; para llevarte tus datos a otro equipo, descarga el .json." }
];
let tourI = -1, tourEl = null;
function ensureTour(){
  if (tourEl) return;
  tourEl = document.createElement("div");
  tourEl.className = "tour no-print"; tourEl.hidden = true;
  tourEl.innerHTML = `<div class="tour-spot"></div><div class="tour-pop" role="dialog" aria-live="polite"><div class="tour-step"></div><h4></h4><p></p>
    <div class="tour-nav"><button type="button" class="btn btn-ghost btn-sm" data-tour="skip">Salir</button><span></span>
    <button type="button" class="btn btn-ghost btn-sm" data-tour="prev">‹ Anterior</button>
    <button type="button" class="btn btn-doc btn-sm" data-tour="next">Siguiente ›</button></div></div>`;
  document.body.appendChild(tourEl);
  tourEl.addEventListener("click", e => {
    const b = e.target.closest("[data-tour]"); if (!b) return;
    const a = b.dataset.tour;
    if (a === "next") tourShow(tourI + 1); else if (a === "prev") tourShow(tourI - 1); else tourEnd();
  });
}
function tourShow(i){
  ensureTour();
  tourI = i;
  if (i < 0 || i >= TOUR.length) return tourEnd();
  const st = TOUR[i], el = document.querySelector(st.sel);
  if (!el) return tourShow(i + 1);
  tourEl.hidden = false;
  document.documentElement.classList.add("touring");
  el.scrollIntoView({ behavior:"smooth", block:"center" });
  setTimeout(() => {
    const spot = tourEl.querySelector(".tour-spot"), pop = tourEl.querySelector(".tour-pop");
    if (!spot || !pop) return;                       /* el globo no está montado: no interrumpas la navegación */
    const r = el.getBoundingClientRect(), pad = 8;
    const h = Math.min(r.height + pad * 2, innerHeight - 40);
    Object.assign(spot.style, { left:`${Math.max(4, r.left - pad)}px`, top:`${Math.max(8, r.top - pad)}px`, width:`${Math.min(r.width + pad * 2, innerWidth - 8)}px`, height:`${h}px` });
    const set = (sel, txt) => { const n = tourEl.querySelector(sel); if (n) n.textContent = txt; };
    set(".tour-step", `Paso ${i + 1} de ${TOUR.length}`);
    set("h4", st.t);
    set("p", st.x);
    const prev = tourEl.querySelector('[data-tour="prev"]'), next = tourEl.querySelector('[data-tour="next"]');
    if (prev) prev.disabled = i === 0;
    if (next) next.textContent = i === TOUR.length - 1 ? "¡Listo! ✔" : "Siguiente ›";
    const below = r.top + h + 230 < innerHeight, pw = Math.min(380, innerWidth - 24);
    pop.style.width = pw + "px";
    pop.style.left = `${Math.min(Math.max(12, r.left), innerWidth - pw - 12)}px`;
    pop.style.top = below ? `${Math.max(8, r.top - pad) + h + 12}px` : `${Math.max(12, r.top - pad - 12 - pop.offsetHeight)}px`;
    if (!below && r.top - pad - pop.offsetHeight < 12) pop.style.top = `${innerHeight - pop.offsetHeight - 16}px`;
    if (pop.animate) pop.animate([{ opacity:0, transform:"translateY(8px)" }, { opacity:1, transform:"none" }], { duration:260, easing:"ease-out" });
    if (next) next.focus({ preventScroll:true });
  }, 420);
}
function tourEnd(){
  if (tourEl) tourEl.hidden = true;
  tourI = -1;
  document.documentElement.classList.remove("touring");
  try { localStorage.setItem("cvstudio.tourDone", "1"); } catch(_) {}
}
document.addEventListener("keydown", e => {
  if (!tourEl || tourEl.hidden) return;
  if (e.key === "Escape") tourEnd();
  else if (e.key === "ArrowRight") tourShow(tourI + 1);
  else if (e.key === "ArrowLeft") tourShow(tourI - 1);
});
addEventListener("resize", () => { if (tourEl && !tourEl.hidden) tourShow(tourI); });

/* ===================== 9. FOTO DEL EJEMPLO: TRAER LA TUYA ===================== */
function askOwnPhoto(input){
  const go = () => {
    if (window.showOpenFilePicker) {
      window.showOpenFilePicker({ types:[{ description:"Imagen", accept:{ "image/*":[".jpg",".jpeg",".png",".webp"] } }] })
        .then(([fh]) => fh.getFile()).then(f => f && compressPhoto(f))
        .catch(() => input && input.click());
    } else if (input) input.click();
  };
  go();
}
function compressPhoto(f){
  if (!f || !/^image\//.test(f.type)) return;
  const img = new Image();
  img.onload = () => {
    const max = 480, sc = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    D().foto = c.toDataURL("image/jpeg", .86);
    S.photo = true;
    if (typeof renderDesign === "function") renderDesign();
    if (typeof renderSheet === "function") renderSheet();
    save();
    setStatus("dirty", "Foto cargada. Guarda para conservarla.");
  };
  img.src = URL.createObjectURL(f);
}

/* ===================== 10. EVENTOS ===================== */
const G_SEL = "[data-demo],[data-g],[data-pgo],[data-gotab],[data-askphoto],[data-lvlnote]";
document.addEventListener("click", e => {
  const t = e.target.closest(G_SEL);
  if (!t) return;
  const g = t.dataset.g;
  if (t.dataset.lvlnote) { e.preventDefault(); e.stopPropagation(); showLevelDialog(t.dataset.lvlnote); return; }
  if (t.dataset.demo && g !== "thisdemo") { e.preventDefault(); e.stopPropagation(); loadDemo(t.dataset.demo); return; }
  if (t.dataset.askphoto) { e.preventDefault(); askOwnPhoto(t.dataset.askphoto === "input" ? byId("photoInput") : null); return; }
  if (g === "blank") { e.preventDefault(); startBlank(true); return; }
  if (g === "blankAsk") { e.preventDefault(); startBlank(false); return; }
  if (g === "asbase") { e.preventDefault(); demoAsBase(); return; }
  if (g === "kit") { e.preventDefault(); showKit(); return; }
  if (g === "demo") { e.preventDefault(); showLevelDialog(S.demo || S.level); return; }
  if (g === "tour") { e.preventDefault(); tourShow(0); return; }
  if (g === "close") { const d = t.closest("dialog"); if (d) d.close(); return; }
  const go = t.dataset.pgo || t.dataset.gotab;
  if (go) {
    e.preventDefault();
    if (go.startsWith("#")) {
      document.querySelector(go)?.scrollIntoView({ behavior:"smooth" });
      if (go === "#diseno") setTimeout(() => byId("perfil")?.focus({ preventScroll:true }), 600);
    } else {
      S.tab = go;
      if (typeof renderEditor === "function") renderEditor();
      byId("editor")?.scrollIntoView({ behavior:"smooth" });
    }
  }
});
/* El botón «Ejemplo» enciende y apaga las marcas didácticas de la hoja */
function bindDemoToggle(){
  const b = byId("demoToggle");
  if (!b) return;
  b.classList.toggle("on", !!S.annot);
  b.setAttribute("aria-pressed", String(!!S.annot));
  b.onclick = () => { S.annot = !S.annot; b.classList.toggle("on", S.annot); b.setAttribute("aria-pressed", String(!!S.annot)); renderSheet(); save(); };
}
/* La primera visita abre el recorrido una sola vez */
function maybeAutoTour(){
  let done = true;
  try { done = !!localStorage.getItem("cvstudio.tourDone"); } catch(_) {}
  if (!done) setTimeout(() => tourShow(0), 900);
}

/* ===================== 11. ARRANQUE =====================
   guide.js se carga antes de app.js (que aporta S, D(), booting y los render).
   Por eso este archivo no arranca solo: app.js llama a bootGuide() al final de su
   propia inicialización, cuando ya existen todas las piezas. */
function bootGuide(){
  if (bootGuide.done) return;
  bootGuide.done = true;
  booting = true;
  try { refreshAll(); }
  catch (err) { console.error("[guía] error al refrescar:", err); }
  booting = false;
  try { renderDemoStrip(); bindDemoToggle(); ensureDialogs(); ensureKit(); maybeAutoTour(); }
  catch (err) { console.error("[guía] error al iniciar la capa didáctica:", err); }
  /* Módulos que se cargan DESPUÉS de app.js (importación desde Word y biblioteca):
     en el navegador, cuando bootGuide() corre al final de app.js esos archivos aún
     no se han parseado, así que se arrancan al terminar de cargar la página. Cada
     módulo comprueba por su cuenta si ya puede iniciar. */
  const arrancarModulos = () => {
    try { if (typeof bootImportar === "function") bootImportar(); } catch (e) { console.error("[importar] error al iniciar:", e); }
    try { if (typeof bootBiblioteca === "function") bootBiblioteca(); } catch (e) { console.error("[biblioteca] error al iniciar:", e); }
  };
  addEventListener("load", arrancarModulos, { once:true });
}
/* Respaldo por si app.js no llega a llamar a bootGuide() (versión antigua del archivo):
   se espera al evento load y, si el contexto ya está listo, se arranca enseguida. */
addEventListener("load", () => { if (!bootGuide.done && typeof refreshAll === "function") bootGuide(); });
