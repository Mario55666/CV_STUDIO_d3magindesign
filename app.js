/* CV Studio — lógica de la landing */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const COLS = { edu:["Año","Tema / grado","Institución y fecha","Horas"], exp:["Año","Empresa o institución","Función","Tiempo"], pub:["Año","Título","Revista / editorial","Tipo"] };
/* Cuarta columna configurable por sección: s.col4 = { label:"Periodo", hide:true } */
const colsOf = s => { const c = COLS[s.kind].slice(); if (s.col4 && s.col4.label) c[3] = s.col4.label; return c; };
const show4 = s => !(s.col4 && s.col4.hide);
/* Reglas por defecto (se aplican una vez, también a secciones creadas por el usuario) */
const COL4_V = 1;
function applyCol4Defaults(data){
  for (const s of data.sections) {
    if (s.col4) continue;
    if (s.id === "grados" || /grados|formaci[oó]n acad[eé]mica/i.test(s.title)) s.col4 = { hide:true };
    else if (/ponencia/i.test(s.title)) s.col4 = { hide:true };
    else if (/felicitaci|reconocimiento/i.test(s.title)) s.col4 = { label:"Periodo" };
  }
  return data;
}

/* ===================== DISEÑOS Y NIVELES ===================== */
const TEMPLATES = {
  clasico:   { name:"Clásico formal", desc:"Serif, tablas con bordes y foto tipo carné. Para concursos públicos y legajos.", acc:"#1f3a5f", photo:"rect", photoIn:"head", rows:"table", docFont:"Georgia",
               hint:"Diseño clásico formal: tipografía serif, encabezado con nombre en mayúsculas y foto tipo carné a la izquierda, secciones en versalitas y tablas con bordes completos. Tono sobrio, impersonal y preciso, propio de un expediente para concurso público." },
  moderno:   { name:"Moderno con barra lateral", desc:"Columna lateral con foto circular y contacto; cuerpo limpio en sans-serif.", acc:"#0f7c7c", photo:"circle", photoIn:"side", rows:"table", docFont:"Calibri",
               hint:"Diseño moderno a dos columnas: barra lateral con foto circular, datos de contacto e idiomas; columna principal con perfil, experiencia y formación. Tipografía sans-serif y un solo color de acento. Frases breves y fáciles de escanear." },
  ejecutivo: { name:"Ejecutivo", desc:"Banda superior de color, perfil destacado y listas compactas. Para cargos de gestión.", acc:"#22303f", photo:"square", photoIn:"head", rows:"list", docFont:"Calibri",
               hint:"Diseño ejecutivo: banda superior de color con nombre, titular y foto; perfil destacado en un recuadro; secciones en listas compactas (año, cargo o curso en negrita y la institución debajo). Prioriza logros, responsabilidades y resultados medibles." },
  academico: { name:"Académico (CTI Vitae)", desc:"Estructura tipo CTI Vitae / SUNEDU con códigos, tablas completas y Arial.", acc:"#2b4a6f", photo:"rect", photoIn:"head", rows:"table", docFont:"Arial",
               hint:"Diseño académico en el estilo de CTI Vitae (CONCYTEC) y SUNEDU: título «CURRÍCULUM VITAE» centrado, recuadro de identificación con foto, secciones con fondo gris y tablas con bordes, todas con código de ítem. Lenguaje técnico y normativo; consigna resoluciones, registros y horas." },
  investigador: { name:"Investigador científico", desc:"Identificadores (ORCID, Scholar), métricas de producción y publicaciones en APA 7 con DOI.", acc:"#3d3474", photo:"rect", photoIn:"head", rows:"table", docFont:"Cambria",
               hint:"Diseño de investigador científico: encabezado con nombre en serif, identificadores académicos (ORCID, Google Académico, ResearchGate) como insignias, franja de métricas (publicaciones, artículos con DOI, años de docencia, horas de capacitación), líneas y habilidades de investigación como etiquetas, y publicaciones numeradas en formato APA 7 con DOI enlazado. Tono académico y preciso." },
  creativo:  { name:"Creativo / Portafolio", desc:"Nombre en display, línea de tiempo y foto circular destacada. Para diseño y publicidad.", acc:"#c9822b", photo:"circle", photoIn:"head", rows:"list", docFont:"Calibri",
               hint:"Diseño creativo de portafolio: nombre grande en tipografía display, foto circular con aro de color, títulos de sección en píldoras de color y una línea de tiempo vertical. Voz cercana y segura, centrada en proyectos, clientes y herramientas." }
};
const LEVELS = {
  tecnico:      { name:"Técnico / Asistente", desc:"Producción gráfica y manejo de software.", limit:6, pages:"1–2",
    scope:"Para puestos de producción, soporte técnico u operativo: se evalúa lo que sabes hacer.",
    title:"Técnico(a) profesional en [tu especialidad]",
    order:["experiencia","grados","capacitacion","ofimatica","idiomas","reconocimientos","docente","publicaciones"],
    perfil:"Técnico(a) profesional en [tu especialidad] con {experiencia} años de experiencia en [área o tipo de trabajo]. Domina [herramientas, equipos o procesos clave] y cuenta con {horas} horas de capacitación. Destaca por [un logro o fortaleza concreta]." },
  profesional:  { name:"Profesional", desc:"Licenciado: diseño y educación en equilibrio.", limit:8, pages:"2–3",
    scope:"Para puestos que exigen título universitario o licenciatura, con experiencia y formación en equilibrio.",
    title:"[Profesión] · [Área de especialización]",
    order:["grados","experiencia","capacitacion","docente","ofimatica","idiomas","reconocimientos","publicaciones"],
    perfil:"[Profesión] con {experiencia} años de experiencia en [sector o área]. Ha [logro principal con un resultado medible] y suma {horas} horas de especialización en [temas]. Aporta [qué valor ofreces al puesto]." },
  especialista: { name:"Especialista / Docente", desc:"Docencia superior y especialización.", limit:0, pages:"3–5",
    scope:"Para docencia superior, especialización de alto nivel y consultoría: se evalúa el dominio experto.",
    title:"Docente de educación superior · Especialista en [tu área]",
    order:["grados","docente","experiencia","publicaciones","capacitacion","ofimatica","idiomas","reconocimientos"],
    perfil:"Especialista en [tu área] con {experiencia} años de experiencia profesional y {docencia} años como docente de educación superior. Ha formado a [número] estudiantes en [cursos o programas] y suma {horas} horas de actualización en [temas pedagógicos y técnicos]." },
  investigador: { name:"Académico / Investigador", desc:"Grados, investigación y producción.", limit:0, pages:"3–6",
    scope:"Para grados académicos, investigación, docencia universitaria y fondos concursables.",
    title:"Investigador(a) · [Disciplina o línea de investigación]",
    order:["grados","publicaciones","docente","experiencia","capacitacion","idiomas","reconocimientos","ofimatica"],
    perfil:"[Grado más alto] e investigador(a) en [disciplina], con {publicaciones} publicaciones científicas y {docencia} años de docencia universitaria. Sus líneas de investigación son [línea 1] y [línea 2]; ha participado en [proyectos o fondos concursables]." },
  directivo:    { name:"Gestión / Directivo", desc:"Cargos de coordinación y calidad.", limit:5, pages:"2–3",
    scope:"Para dirección, coordinación académica, jefatura de calidad y cargos de confianza: se evalúa la gestión.",
    title:"[Cargo directivo] · Gestión de [área]",
    order:["experiencia","calidad","grados","docente","capacitacion","reconocimientos","idiomas","ofimatica"],
    perfil:"Gestor(a) con {experiencia} años en cargos de [dirección o coordinación] en [sector]. Condujo [proceso o proyecto clave] con [resultado medible] y cuenta con {horas} horas de formación en gestión y liderazgo." }
};
const SWATCHES = ["#1f3a5f","#0f7c7c","#22303f","#2b4a6f","#c9822b","#8b2f3c","#4b3f8f","#2e6b3f"];

/* ===================== ESTADO + PERSISTENCIA ===================== */
const KEY = "cvstudio.public.v1";                     // edición pública: no comparte datos con versiones anteriores
const defaults = () => ({ data: clone(window.DEFAULT_DATA), mode:"nodoc", tpl:"moderno", level:"profesional", acc:null, limit:"auto",
  photo:true, sensitive:false, codes:false, disabled:[], tab:"personal", sec:"grados",
  photoShape:"auto", photoFrame:"auto", annot:true, demo:null,
  brand:{ type:"none", logo:null, title:"Profesional colegiado(a)", sub:"Reg. N.° 00000", pos:"tr", size:"m", opacity:10, repeat:true } });
/* Incorpora los hipervínculos recuperados del PDF original y las filas faltantes, sin pisar lo que el usuario ya editó. */
const LINKS_V = 1;
function applyLinks(data){
  const low = s => String(s||"").toLowerCase();
  const extra = window.DEFAULT_EXTRA_ROWS || {}, links = window.DEFAULT_LINKS || {}, fl = window.DEFAULT_FIELD_LINKS || {};
  for (const s of data.sections) {
    const add = (extra[s.id] || []).filter(r => !s.rows.some(x => low(x[1]) === low(r[1])));
    if (add.length) { s.rows.push(...add.map(r=>[...r])); s.rows.sort((a,b)=> (parseInt(String(b[0]).slice(-4))||0) - (parseInt(String(a[0]).slice(-4))||0)); }
    for (const r of s.rows) {
      while (r.length < 5) r.push("");
      if (r[4]) continue;
      for (const [k,u] of Object.entries(links)) {
        const [sid, start, yr] = k.split("|");
        if (sid === s.id && low(r[1]).startsWith(low(start)) && (!yr || String(r[0]).includes(yr))) { r[4] = u; break; }
      }
    }
  }
  for (const c of data.personal.campos) { while (c.length < 4) c.push(""); if (!c[3] && fl[c[0]]) c[3] = fl[c[0]]; }
  return data;
}
let S = defaults(); applyLinks(S.data); S.linksV = LINKS_V;
try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved && saved.data) { S = Object.assign(defaults(), saved); if (S.linksV !== LINKS_V) { applyLinks(S.data); S.linksV = LINKS_V; } } } catch(e) {}
function migrate(st){ if (st.col4V !== COL4_V) { applyCol4Defaults(st.data); st.col4V = COL4_V; } migrateResearch(st); return st; }
migrate(S);
const isShared = u => (window.SHARED_LINK_WARN||[]).some(id => String(u).includes(id));
const linkTo = (url, text) => url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${text}</a>` : text;
const files = new Map(); let extra = [];
/* Guardado explícito: los cambios quedan como «borrador» (protegido contra cierres accidentales)
   hasta que se pulsa «Guardar». El botón «Actualizar documento» vuelve a generar la hoja del CV. */
const DRAFT = KEY + ".draft";
let saveT, dirty = false, booting = true, fileHandle = null;
const hhmm = () => new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
function setStatus(state, msg){
  const bar = $("#actionBar"); if (!bar) return;
  bar.dataset.state = state; $("#abMsg").textContent = msg;
  $("#saved").textContent = state === "dirty" ? "● Cambios sin guardar" : msg;
}
function save(){
  if (booting) return;
  dirty = true; setStatus("dirty", "Cambios sin guardar");
  clearTimeout(saveT);
  saveT = setTimeout(()=>{ try { localStorage.setItem(DRAFT, JSON.stringify(S)); } catch(e){} }, 400);
}
async function saveNow(){
  try { localStorage.setItem(KEY, JSON.stringify(S)); localStorage.removeItem(DRAFT); }
  catch(e){ setStatus("error", "⚠ No se pudo guardar en el navegador (¿la foto es muy pesada o el almacenamiento está lleno?). Descarga el respaldo .json o usa 🗄 Mi biblioteca."); return false; }
  let extraMsg = "";
  if (fileHandle) {
    try { const w = await fileHandle.createWritable(); await w.write(JSON.stringify(S,null,2)); await w.close(); extraMsg = ` · también en «${fileHandle.name}»`; }
    catch(e){ extraMsg = " · no se pudo escribir el archivo vinculado"; }
  }
  dirty = false; setStatus("saved", `✓ Guardado a las ${hhmm()}${extraMsg}`);
  return true;
}
async function saveAsFile(){
  const name = `CV_datos_${new Date().toISOString().slice(0,10)}.json`;
  if (window.showSaveFilePicker) {
    try { fileHandle = await showSaveFilePicker({suggestedName:name, types:[{description:"Datos de CV Studio", accept:{"application/json":[".json"]}}]}); }
    catch(e){ return; }
    await saveNow(); return;
  }
  backup(); await saveNow();
}
function updateDoc(){
  renderDesign(); renderToggles(); renderEvidence(); renderSheet();
  $("#vista").scrollIntoView({behavior:"smooth"});
  const sh = $("#sheet"); sh.classList.remove("flash"); void sh.offsetWidth; sh.classList.add("flash");
  setStatus(dirty ? "dirty" : "saved", dirty ? `Documento actualizado a las ${hhmm()} · falta guardar` : `Documento actualizado a las ${hhmm()}`);
}
window.addEventListener("beforeunload", e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
document.addEventListener("keydown", e => { if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="s") { e.preventDefault(); saveNow(); } });
let renderT;
const soon = () => { clearTimeout(renderT); renderT = setTimeout(()=>{ renderSheet(); renderEvidence(); renderToggles(); refreshDups(); renderPerfilInfo(); }, 150); save(); };

/* ===================== DERIVADOS ===================== */
const D = () => S.data;
const tpl = () => TEMPLATES[S.tpl];
const lvl = () => LEVELS[S.level];
const acc = () => S.acc || tpl().acc;
const titular = () => D().personal.titular || lvl().title;
/* ----- Métricas del perfil: SIEMPRE sobre el registro completo de datos (no dependen de los filtros) ----- */
const REF_YEAR = new Date().getFullYear();
const CRED_H = 16;                                       // 1 crédito académico ≈ 16 horas lectivas
const startYear = v => { const ys = String(v||"").match(/\d{4}/g); return ys ? Math.min(...ys.map(Number)) : null; };
function hoursOf(v){
  const s = String(v||""), c = s.match(/(\d+(?:[.,]\d+)?)\s*cr[eé]d/i);
  if (c) return parseFloat(c[1].replace(",", ".")) * CRED_H;
  const h = s.match(/(\d+(?:[.,]\d+)?)\s*h(?![a-z])/i), m = s.match(/(\d+)\s*min/i);
  if (!h && !m) return null;
  return (h ? parseFloat(h[1].replace(",", ".")) : 0) + (m ? +m[1]/60 : 0);
}
function metrics(){
  const sec = id => D().sections.find(s=>s.id===id);
  const firstOf = (s, f=()=>true) => { const ys = (s ? s.rows.filter(f).map(r=>startYear(r[0])).filter(Boolean) : []); return ys.length ? Math.min(...ys) : null; };
  const notExp = s => /reconoc|felicit|premio|distinc|voluntar/i.test(s.title) || s.id === "reconocimientos";
  const expDoc = D().sections.filter(s=>s.kind==="exp" && /docen/i.test(s.title)), expDis = D().sections.filter(s=>s.kind==="exp" && !/docen/i.test(s.title) && !notExp(s));
  const minOf = arr => { const ys = arr.map(s=>firstOf(s)).filter(Boolean); return ys.length ? Math.min(...ys) : null; };
  const dDoc = minOf(expDoc), dDis = minOf(expDis), dTit = firstOf(sec("grados"), r => !/primaria|secundaria/i.test(r[1]));
  const horas = Math.round(D().sections.filter(s=>s.training).flatMap(s=>s.rows.map(r=>hoursOf(r[3])||0)).reduce((a,b)=>a+b,0));
  const exp = dDis ? REF_YEAR-dDis : null;
  return { docencia: dDoc ? REF_YEAR-dDoc : null, docenciaDesde: dDoc, experiencia: exp, experienciaDesde: dDis, diseno: exp, disenoDesde: dDis,
           titulado: dTit ? REF_YEAR-dTit : null, tituladoDesde: dTit, horas, ref: REF_YEAR };
}
const fmtN = n => String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, " ");   // 2 912 (norma RAE)
function fillPerfil(t){
  const m = metrics();
  m.publicaciones = pubMetrics().total;
  return String(t||"").replace(/\{(docencia|experiencia|diseno|diseño|titulado|horas|publicaciones)\}/gi, (_,k) => { k = k.toLowerCase().replace("ñ","n"); return m[k]==null ? "[completar]" : fmtN(m[k]); });
}
/* En la hoja, los textos entre corchetes del perfil sugerido se resaltan para que la persona los reemplace */
const perfilHTML = () => esc(perfil()).replace(/\[[^\]]+\]/g, m => `<mark class="todo" title="Reemplaza este texto en el Paso 2 → Perfil profesional">${m}</mark>`);
const perfilRaw = () => D().perfilCustom ? D().perfil : lvl().perfil;
const perfil = () => fillPerfil(perfilRaw());
const limitN = () => S.mode === "doc" ? 0 : (S.limit === "auto" ? lvl().limit : +S.limit);
const codeOf = (s,i) => `${s.prefix}-${String(i+1).padStart(2,"0")}`;
function orderedSections(){
  const ord = lvl().order, secs = D().sections;
  return [...secs].sort((a,b)=> (ord.indexOf(a.id)+1 || 99) - (ord.indexOf(b.id)+1 || 99));
}
/* ----- Filtros de contenido -----
   Horas: solo secciones de capacitación (s.training); las filas sin horas registradas quedan fuera cuando hay filtro.
   Años:  todas las secciones salvo «Formación académica y grados»; cuenta el año más reciente de la fila (desde REF_YEAR − N). */
const HOURS_F = { all:{label:"Todas las horas"}, "60":{label:"60 h o más", min:60}, "100":{label:"100 h o más", min:100} };
const YEARS_F = { all:{label:"Todos los años"}, "5":{label:"Últimos 5 años", n:5}, "10":{label:"Últimos 10 años", n:10}, "15":{label:"Últimos 15 años", n:15} };
const yearsExempt = s => s.id === "grados";
function passHours(s, cells){ const f = HOURS_F[S.hoursF||"all"]; if (!f.min || !s.training) return true; const h = hoursOf(cells[3]); return h != null && h >= f.min; }
function passYears(s, cells){ const f = YEARS_F[S.yearsF||"all"]; if (!f.n || yearsExempt(s)) return true; return yearKey(cells[0]) >= REF_YEAR - f.n; }
const passAll = (s, cells) => passHours(s, cells) && passYears(s, cells);
function visibleRows(s){
  const all = s.rows.map((cells,i)=>({cells, code:codeOf(s,i), i}));
  const kept = all.filter(r => passAll(s, r.cells)), filtered = all.length - kept.length;
  const n = limitN();
  return s.training && n > 0 ? { rows: kept.slice(0,n), hidden: Math.max(0, kept.length-n), filtered } : { rows: kept, hidden: 0, filtered };
}
const activeSections = () => orderedSections().filter(s => !S.disabled.includes(s.id) && visibleRows(s).rows.length);
const slug = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/ñ/gi,"n").replace(/[«»"“”().,:;'/]/g," ")
  .trim().split(/\s+/).slice(0,5).join("-").replace(/[^A-Za-z0-9-]/g,"");
const suggested = (s,r) => `${r.code}_${String(r.cells[0]).slice(0,4)}_${slug(String(r.cells[2]).split(",")[0]).split("-").slice(0,3).join("-")}_${slug(s.kind==="exp" ? r.cells[2] : r.cells[1])}.pdf`;
const relPath = (s,r) => `../${s.folder}/${files.get(r.code)?.name || suggested(s,r)}`;
const userIni = () => { const n = String(D().personal.nombre||"").trim(); return n ? initials(n) : "CV"; };
const userSlug = () => { const w = String(D().personal.nombre||"").trim().split(/\s+/).filter(Boolean); if (!w.length) return "MiNombre";
  const ap = w.length >= 3 ? w.slice(-2).join("") : w.slice(-1).join(""); return slug(ap).replace(/-/g,"") + "_" + slug(w[0]); };
const evRoot = () => `CV_${userIni()}_${new Date().getFullYear()}`;
const stamp = () => { const d=new Date(); return `${userIni()}-${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; };
/* Campos personales visibles; si una red social ya muestra la misma dirección (p. ej. ORCID), no se repite aquí */
const personalFields = () => {
  const showSoc = (S.socialMode || "full") !== "off", key = u => String(u||"").toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const socs = showSoc ? new Set(socialList().filter(x=>x[1]).map(([n,v]) => key(socialUrl(n,v)))) : new Set();
  return D().personal.campos.filter(c => (!c[2] || S.sensitive) && !(socs.has(key(c[3])) || socs.has(key(c[1]))));
};
const outName = ext => `CV_${userSlug()}_${new Date().getFullYear()}_${S.mode}_${S.tpl}.${ext}`;
const say = t => $("#status").textContent = t;

/* ===================== HOJA DEL CV ===================== */
/* ===================== FOTO: FORMA Y MARCO ===================== */
const PHOTO_SHAPES = { auto:"Según diseño", rect:"Carné 3×4", rounded:"Carné redondeado", square:"Cuadrada", circle:"Circular", oval:"Ovalada" };
const PHOTO_FRAMES = { auto:"Según diseño", none:"Sin marco", thin:"Línea fina", double:"Doble línea", shadow:"Sombra", polaroid:"Polaroid", ring:"Anillo", gradient:"Degradado", corners:"Esquinas" };
const photoShape = () => S.photoShape && S.photoShape !== "auto" ? S.photoShape : tpl().photo;
function photoHTML(){
  if (!S.photo || !D().foto) return "";
  return `<div class="cv-photo ph-${photoShape()} fr-${S.photoFrame||"auto"}"><img src="${D().foto}" alt="Foto"></div>`;
}

/* ===================== MARCA / LOGO / DISTINTIVO PROFESIONAL ===================== */
const BRAND_TYPES = { none:"Ninguna", logo:"Logo propio", monogram:"Monograma", badge:"Distintivo" };
const BRAND_POS = { tl:"Arriba izquierda", tc:"Arriba centro", tr:"Arriba derecha", bl:"Abajo izquierda", bc:"Abajo centro", br:"Abajo derecha", name:"Junto al nombre", wm:"Marca de agua" };
const BRAND_SIZE = { s:"Pequeño", m:"Mediano", l:"Grande" };
const B = () => (S.brand ||= defaults().brand);
const initials = n => { const w = String(n||"").trim().split(/\s+/).filter(x => !/^(de|del|la|las|los|y)$/i.test(x)); if (!w.length) return "CV";
  return (w.length >= 3 ? [w[0], w[w.length-2], w[w.length-1]] : w).map(x => x[0]).join("").toUpperCase(); };
const xml = s => String(s||"").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function monogramSVG(){
  const a = acc(), ini = initials(D().personal.nombre), sub = (B().sub || "PROFESIONAL").toUpperCase().slice(0, 34);
  const fs = ini.length > 2 ? 34 : 42;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <defs><path id="arc" d="M 26 80 A 54 54 0 0 0 134 80"/></defs>
    <circle cx="80" cy="80" r="78" fill="${a}"/><circle cx="80" cy="80" r="70" fill="none" stroke="#fff" stroke-width="1.5" opacity=".9"/>
    <circle cx="80" cy="80" r="46" fill="none" stroke="#fff" stroke-width="1" opacity=".55"/>
    <text x="80" y="${80 + fs*0.34}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="700" font-size="${fs}" fill="#fff" letter-spacing="1">${xml(ini)}</text>
    <text font-family="Arial,Helvetica,sans-serif" font-size="9.5" font-weight="700" fill="#fff" letter-spacing="2"><textPath href="#arc" startOffset="50%" text-anchor="middle">${xml(sub)}</textPath></text>
    <text x="80" y="36" text-anchor="middle" font-size="11" fill="#fff">✦</text></svg>`;
}
function badgeSVG(){
  const a = acc(), t = B().title || "Profesional", s = B().sub || "";
  const w = Math.max(150, Math.round(Math.max(t.length * 8.4, s.length * 6.2)) + 74), h = s ? 62 : 46;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <rect x="1.5" y="1.5" width="${w-3}" height="${h-3}" rx="${h/2-2}" fill="#fff" stroke="${a}" stroke-width="3"/>
    <circle cx="${h/2}" cy="${h/2}" r="${h/2-8}" fill="${a}"/>
    <text x="${h/2}" y="${h/2+6}" text-anchor="middle" font-size="17" fill="#fff" font-family="Arial">✔</text>
    <text x="${h-2}" y="${s ? 27 : h/2+5}" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="14" fill="${a}">${xml(t)}</text>
    ${s ? `<text x="${h-2}" y="45" font-family="Arial,Helvetica,sans-serif" font-size="10.5" fill="#5d6878">${xml(s)}</text>` : ""}</svg>`;
}
function brandInner(){
  const b = B();
  if (b.type === "logo") return b.logo ? `<img src="${b.logo}" alt="Logo">` : "";
  if (b.type === "monogram") return monogramSVG();
  if (b.type === "badge") return badgeSVG();
  return "";
}
function brandHTML(){
  const b = B(), inner = brandInner(); if (!inner) return "";
  return `<div class="cv-brand pos-${b.pos} sz-${b.size} bt-${b.type} ${b.repeat && b.pos !== "name" ? "rep" : ""}" style="--bop:${(b.opacity||10)/100}" aria-hidden="true">${inner}</div>`;
}
/* Rasterización para Word (PNG) */
function svgToPng(svg, w, h, scale = 3){
  return new Promise((res, rej) => { const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = w*scale; c.height = h*scale;
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); c.toBlob(b => b ? b.arrayBuffer().then(x => res(new Uint8Array(x))) : rej(), "image/png"); };
    img.onerror = rej; img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); });
}
const dataUrlBytes = u => Uint8Array.from(atob(u.split(",")[1]), c => c.charCodeAt(0));
const imgDims = src => new Promise(r => { const i = new Image(); i.onload = () => r({w:i.naturalWidth, h:i.naturalHeight}); i.onerror = () => r({w:1, h:1}); i.src = src; });
async function brandPng(){
  const b = B(); if (b.type === "none") return null;
  const target = {s:46, m:68, l:96}[b.size] || 68;
  if (b.type === "logo") { if (!b.logo) return null; const d = await imgDims(b.logo); return { bytes: dataUrlBytes(b.logo), w: Math.round(target * d.w / d.h), h: target }; }
  const svg = b.type === "monogram" ? monogramSVG() : badgeSVG(), m = svg.match(/width="(\d+)" height="(\d+)"/), w = +m[1], h = +m[2];
  return { bytes: await svgToPng(svg, w, h), w: Math.round(target * w / h), h: target };
}
async function framedPhotoPng(){
  const src = D().foto; if (!src) return null;
  const shape = photoShape(), fr = S.photoFrame || "auto", d = await imgDims(src);
  const W = shape === "circle" || shape === "square" ? 400 : 330, H = shape === "circle" || shape === "square" ? 400 : 420;
  const pad = ["polaroid","double","gradient","corners"].includes(fr) ? 16 : 0, padB = fr === "polaroid" ? 60 : pad;
  const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
  const path = (x, y, w, h) => { g.beginPath();
    if (shape === "circle" || shape === "oval") g.ellipse(x+w/2, y+h/2, w/2, h/2, 0, 0, Math.PI*2);
    else { const r = shape === "rounded" ? 34 : shape === "square" ? 40 : 4; g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); } };
  if (fr === "polaroid") { g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); }
  if (fr === "gradient") { const gr = g.createLinearGradient(0,0,W,H); gr.addColorStop(0, acc()); gr.addColorStop(1, "#c9822b"); g.fillStyle = gr; path(0,0,W,H); g.fill(); }
  const ix = pad, iy = pad, iw = W - pad*2, ih = H - pad - padB;
  g.save(); path(ix, iy, iw, ih); g.clip();
  const sc = Math.max(iw/d.w, ih/d.h), img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  g.drawImage(img, ix + (iw - d.w*sc)/2, iy + (ih - d.h*sc)/2, d.w*sc, d.h*sc); g.restore();
  g.strokeStyle = acc();
  if (fr === "thin" || fr === "ring") { g.lineWidth = fr === "ring" ? 14 : 8; path(ix + g.lineWidth/2, iy + g.lineWidth/2, iw - g.lineWidth, ih - g.lineWidth); g.stroke(); }
  if (fr === "double") { g.lineWidth = 4; path(2, 2, W-4, H-4); g.stroke(); path(10, 10, W-20, H-20); g.stroke(); }
  if (fr === "corners") { g.lineWidth = 8; const L = 54; [[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]].forEach(([x,y,sx,sy]) => { g.beginPath(); g.moveTo(x+4*sx, y+L*sy); g.lineTo(x+4*sx, y+4*sy); g.lineTo(x+L*sx, y+4*sy); g.stroke(); }); }
  const bytes = await new Promise(r => c.toBlob(b => b.arrayBuffer().then(x => r(new Uint8Array(x))), "image/png"));
  const tw = shape === "circle" || shape === "square" ? 110 : 96;
  return { bytes, w: tw, h: Math.round(tw * H / W) };
}
const urlOf = r => r.cells[4] || "";
function evHTML(s,r){
  const u = urlOf(r), btn = `<button class="add-link" data-addlink="${s.id}|${r.i}" title="${u?"Cambiar el enlace del certificado":"Insertar el enlace del certificado"}">${u?"✎":"＋ enlace"}</button>`;
  return evCore(s,r,u) + " " + btn;
}
/* Atributos para el visor animado: título, código y sección de cada certificado */
const certAttrs = (s, cells, code) => `class="cert" data-vt="${esc(s.kind==="exp" ? `${cells[1]} — ${cells[2]}` : cells[1])}" data-vs="${esc(`${s.title} · ${cells[0]}${cells[3]&&cells[3]!=="—"?" · "+cells[3]:""}`)}" data-vc="${esc(code)}"`;
function evCore(s,r,u){
  const at = certAttrs(s, r.cells, r.code);
  if (S.mode === "nodoc") return `<a href="${esc(u || relPath(s,r))}" target="_blank" rel="noopener" ${at}>(Ver certificado)</a>`;
  const f = files.get(r.code);
  const anexo = f ? `<span class="dot g"></span><a href="${f.url}" target="_blank" ${at}>Anexo ${r.code}</a>` : `<span class="dot ${files.size?"r":"y"}"></span>Anexo ${r.code}`;
  return anexo + (u ? ` · <a href="${esc(u)}" target="_blank" rel="noopener" ${at}>en línea</a>` : "");
}
/* Franja de métricas del diseño «Investigador científico» (registro completo, no depende de filtros) */
function metricsStrip(){
  const p = pubMetrics(), m = metrics();
  const box = (v, l) => `<div class="mt-box"><b>${v}</b><span>${l}</span></div>`;
  return `<div class="cv-metrics">${box(p.total, "publicaciones")}${box(p.doi, "con DOI")}${p.indexed ? box(p.indexed, "indexadas") : box(p.articles, "artículos")}${m.docencia!=null ? box(m.docencia, "años de docencia") : ""}${box(fmtN(m.horas), "h de capacitación")}</div>`;
}
function sectionHTML(s, n){
  if (s.kind === "pub") return pubSectionHTML(s, n) + (n === 2 || n === 3 ? annotHTML("seccion") : "");
  return sectionHTMLCore(s, n).replace("</h3>", "</h3>" + (n === 2 || n === 3 ? annotHTML("seccion") : ""));
}
function sectionHTMLCore(s, n){
  const t = tpl(), {rows, hidden} = visibleRows(s), cols = colsOf(s), c4 = show4(s);
  let h = `<h3 class="cv-h">${n}. ${esc(s.title)}</h3>`;
  if (t.rows === "list") {
    h += `<div class="items">` + rows.map(r => {
      const [a,b,c] = r.cells, d = c4 ? r.cells[3] : "";
      const main = s.kind==="exp" ? c : b, sub = s.kind==="exp" ? `${b}${d&&d!=="—"?" · "+d:""}` : `${c}${d&&d!=="—"?" · "+d:""}`;
      return `<div class="item"><div class="yr">${esc(a)}${S.codes?`<br><small style="color:#8a94a3;font-weight:500">${r.code}</small>`:""}</div><div><b>${esc(main)}</b><span>${esc(sub)}</span><span class="ev">${evHTML(s,r)}</span></div></div>`;
    }).join("") + `</div>`;
  } else {
    h += `<table><thead><tr>${S.codes?"<th>Cód.</th>":""}${cols.slice(0, c4?4:3).map(c=>`<th>${esc(c)}</th>`).join("")}<th>${S.mode==="doc"?"Sustento":"Evidencia"}</th></tr></thead><tbody>`
      + rows.map(r=>`<tr>${S.codes?`<td class="nw">${r.code}</td>`:""}<td class="nw">${esc(r.cells[0])}</td><td>${esc(r.cells[1])}</td><td>${esc(r.cells[2])}</td>${c4?`<td class="nw">${esc(r.cells[3])}</td>`:""}<td class="ev">${evHTML(s,r)}</td></tr>`).join("")
      + `</tbody></table>`;
  }
  if (hidden) h += `<div class="more">+ ${hidden} ítem(s) adicionales disponibles en la carpeta de evidencias.</div>`;
  return h;
}
function renderSheet(){
  const t = tpl(), doc = S.mode === "doc", sheet = $("#sheet");
  const bp = B().type !== "none" && brandInner() ? B().pos : "";
  sheet.className = `sheet cv t-${S.tpl}${bp ? ` brand-${bp[0]==="t" ? "top" : bp[0]==="b" ? "bottom" : bp} brand-${B().size}` : ""}`;
  sheet.style.setProperty("--acc", acc());
  const dp = `<dl class="dp">${personalFields().map(c=>`<dt>${esc(c[0])}</dt><dd>${linkTo(c[3], esc(c[1]))}</dd>`).join("")}</dl>`;
  const head = `<div class="cv-head">${t.photoIn==="head"?photoHTML():""}<div class="who"><h1 class="cv-name">${D().personal.nombre ? esc(D().personal.nombre) : `<span class="ph-text">Tu nombre completo</span>`}</h1><p class="cv-role">${esc(titular())}</p>${t.photoIn==="side" ? "" : socialHTML("head")}</div>${bp==="name" ? brandHTML() : ""}<span class="cv-tag">${doc?"DOCUMENTADO":"NO DOCUMENTADO"}</span></div>`;
  const per = (S.tpl==="investigador" ? metricsStrip() : "") + (perfil() ? `<h3 class="cv-h">${t.photoIn==="side"?"Perfil":"Perfil profesional"}</h3>${annotHTML("perfil")}<p class="cv-perfil">${perfilHTML()}</p>` : "");
  let n = 1, body = "";
  if (t.photoIn === "side") {
    body = `<div class="cv-body"><aside class="cv-side">${photoHTML()}<div class="side-block"><h3 class="cv-h">Datos personales</h3>${annotHTML("datos")}${dp}</div>${socialHTML("side")}</aside><main class="cv-main">${per}${activeSections().map(s=>sectionHTML(s, n++)).join("")}${emptySectionsHint()}</main></div>`;
  } else {
    body = `${per}<h3 class="cv-h">${n++}. Datos personales</h3>${annotHTML("datos")}${dp}${activeSections().map(s=>sectionHTML(s, n++)).join("")}${emptySectionsHint()}`;
  }
  sheet.innerHTML = (bp && bp !== "name" ? brandHTML() : "") + (S.tpl==="academico" ? `<div class="cv-top">CURRÍCULUM VITAE</div>` : "") + annotHTML("head") + head + body +
    (filterNote() ? `<p class="more" style="margin-top:18px">${esc(filterNote())}</p>` : "") +
    `<div class="cv-foot"><span>${stamp()}</span><span>${doc?"Los sustentos se presentan en el PDF de anexos, foliados en el orden de este documento.":`Las evidencias están en la carpeta adjunta ${evRoot()}.`}</span></div>`;
  renderDemoBanner(); renderProgress();
  $("#exSummary").textContent = `${t.name} · ${lvl().name} · ${doc?"Documentado":"No documentado"}${S.photo&&D().foto?" · con foto":""}${filterLabel()?" · "+filterLabel():""}`;
  renderFilters();
  /* Estado del CV: se dibuja en el chip discreto de abajo a la derecha (guide.js) */
  renderStatusChip();
}

/* ===================== PASO 1 · MODALIDAD ===================== */
function setMode(m, scroll){
  S.mode = m; S.sensitive = m === "doc"; $("#optSensitive").checked = S.sensitive;
  $$(".mode").forEach(el=>el.classList.toggle("active", el.dataset.mode===m));
  const p = $("#modePill"); p.textContent = m==="doc"?"Documentado":"No documentado"; p.classList.toggle("nodoc", m!=="doc");
  $("#annexCard").classList.toggle("dim", m!=="doc"); $("#annexBtn").disabled = m!=="doc";
  $("#optLimit").disabled = m === "doc";
  renderSheet(); save();
  if (scroll) $("#diseno").scrollIntoView();
}

/* ===================== PASO 2 · DISEÑO / NIVEL / FOTO ===================== */
function thumb(key){
  const t = TEMPLATES[key], a = t.acc, bars = (x,y,w,n,g=9) => Array.from({length:n},(_,i)=>`<div class="th-bar" style="left:${x}%;top:${y+i*g}px;width:${w-(i%3)*8}%"></div>`).join("");
  const ph = (x,y,w,h,r) => `<div style="position:absolute;left:${x}%;top:${y}px;width:${w}px;height:${h}px;border-radius:${r};background:#cfd6df"></div>`;
  const hd = (x,y,w,c=a) => `<div class="th-bar" style="left:${x}%;top:${y}px;width:${w}%;height:7px;background:${c}"></div>`;
  switch(key){
    case "clasico": return ph(8,12,26,33,"2px")+hd(36,16,50)+bars(36,30,44,1)+`<div style="position:absolute;left:8%;right:8%;top:52px;border-top:3px double ${a}"></div>`+hd(8,64,30)+bars(8,78,84,3)+hd(8,112,30)+bars(8,126,84,4)+hd(8,168,30)+bars(8,182,84,3);
    case "moderno": return `<div style="position:absolute;left:0;top:0;bottom:0;width:36%;background:${a}22"></div>`+ph(8,12,30,30,"50%")+bars(6,52,26,6)+hd(42,14,48)+bars(42,28,40,1)+hd(42,48,24)+bars(42,62,50,3)+hd(42,96,24)+bars(42,110,50,5)+hd(42,160,24)+bars(42,174,50,3);
    case "ejecutivo": return `<div style="position:absolute;left:0;right:0;top:0;height:48px;background:${a}"></div>`+ph(8,10,28,28,"6px")+hd(36,16,46,"#fff")+`<div style="position:absolute;left:8%;right:8%;top:60px;height:22px;border-left:3px solid ${a};background:${a}11"></div>`+hd(8,94,30)+bars(8,108,80,4)+hd(8,150,30)+bars(8,164,80,4);
    case "academico": return `<div class="th-bar" style="left:30%;top:8px;width:40%;background:${a}"></div><div style="position:absolute;left:8%;right:8%;top:20px;height:38px;border:1px solid #cfd6df"></div>`+ph(11,24,20,30,"2px")+hd(32,30,40,"#555")+bars(32,42,40,1)+`<div style="position:absolute;left:8%;right:8%;top:66px;height:8px;background:${a}22"></div>`+bars(8,80,84,3)+`<div style="position:absolute;left:8%;right:8%;top:112px;height:8px;background:${a}22"></div>`+bars(8,126,84,4)+`<div style="position:absolute;left:8%;right:8%;top:166px;height:8px;background:${a}22"></div>`+bars(8,180,84,3);
    case "investigador": return ph(8,12,22,28,"2px")+`<div class="th-bar" style="left:34%;top:14px;width:54%;height:9px;background:${a}"></div>`+`<div class="th-bar" style="left:34%;top:28px;width:12%;height:6px;background:#a6ce39"></div><div class="th-bar" style="left:48%;top:28px;width:12%;height:6px;background:#4285f4"></div><div class="th-bar" style="left:62%;top:28px;width:12%;height:6px;background:#00ccbb"></div>`
      +[0,1,2,3].map(i=>`<div style="position:absolute;left:${8+i*21.5}%;top:50px;width:19%;height:16px;border-radius:3px;background:${a}22;border-top:2px solid ${a}"></div>`).join("")+hd(8,80,34)+bars(8,94,84,2)+hd(8,118,34)+[0,1,2].map(i=>`<div class="th-bar" style="left:8%;top:${132+i*16}px;width:5%;height:6px;background:${a}"></div><div class="th-bar" style="left:16%;top:${132+i*16}px;width:${72-i*8}%"></div>`).join("");
    case "creativo": return ph(64,12,34,34,"50%")+`<div class="th-bar" style="left:8%;top:16px;width:46%;height:12px;background:${a}"></div><div class="th-bar" style="left:8%;top:32px;width:38%;height:10px;background:#555"></div>`+`<div class="th-bar" style="left:8%;top:66px;width:26%;height:9px;border-radius:9px;background:${a}"></div><div style="position:absolute;left:10%;top:80px;bottom:20px;border-left:2px solid ${a}55"></div>`+bars(14,84,76,4)+`<div class="th-bar" style="left:8%;top:130px;width:26%;height:9px;border-radius:9px;background:${a}"></div>`+bars(14,146,76,4);
  }
}
function renderDesign(){
  $("#tplGrid").innerHTML = Object.entries(TEMPLATES).map(([k,t])=>`<div class="card tpl ${S.tpl===k?"active":""}" data-tpl="${k}" tabindex="0"><div class="check">✓</div><div class="thumb">${thumb(k)}</div><h4>${t.name}</h4><p>${t.desc}</p></div>`).join("");
  /* Cada tarjeta de nivel explica el alcance y ofrece su ejemplo y su guía */
  $("#lvlGrid").innerHTML = Object.entries(LEVELS).map(([k,l])=>{ const d = (window.DEMOS||{})[k];
    return `<div class="card lvl ${S.level===k?"active":""}" data-lvl="${k}" tabindex="0" role="button" aria-pressed="${S.level===k}"><div class="check">✓</div>
      <div class="lvl-tx"><h4>${l.name}</h4>
      <p>${l.desc}<br><b>${l.pages} págs.</b> · ${l.limit?`hasta ${l.limit} cursos/sección`:"todos los cursos"}</p>
      ${d ? `<p style="color:var(--muted);font-size:.72rem">Ejemplo: ${esc(d.who)}</p>` : ""}</div>
      <div class="lvl-actions">
        <button type="button" class="lvl-note" data-lvlnote="${k}" title="Qué debe llevar este CV, qué evitar y cuánto debe medir">📋 ¿Qué debe llevar?</button>
        ${d ? `<button type="button" class="lvl-demo" data-demo="${k}" title="Cargar el ejemplo de ${esc(d.who)}">🧪 Ver ejemplo</button>` : ""}
      </div></div>`; }).join("");
  $("#swatches").innerHTML = SWATCHES.map(c=>`<div class="sw ${acc()===c?"active":""}" data-c="${c}" style="background:${c}" title="${c}"></div>`).join("") + `<input type="color" id="accPick" value="${acc()}" style="width:36px;height:30px;padding:0;border-radius:6px" title="Color personalizado">`;
  $("#photoPrev").innerHTML = D().foto ? `<img src="${D().foto}" alt="">` : "👤";
  $("#optPhoto").checked = S.photo;
  renderPhotoOpts(); renderBrandBox();
  $("#optLimit").value = S.limit;
  $("#titular").value = D().personal.titular; $("#titular").placeholder = lvl().title;
  $("#perfil").value = perfilRaw(); renderPerfilInfo();
  $("#fan").innerHTML = ["clasico","moderno","creativo"].map((k,i)=>`<div class="mini" style="left:${8+i*24}%;top:${30-i*10}px;transform:rotate(${-8+i*8}deg);z-index:${i}">${thumb(k)}</div>`).join("");
}
document.addEventListener("click", e => {
  const tp = e.target.closest("[data-tpl]"); if (tp) { S.tpl = tp.dataset.tpl; S.acc = null; renderDesign(); renderSheet(); save(); }
  const lv = e.target.closest("[data-lvl]"); if (lv) { S.level = lv.dataset.lvl; renderDesign(); soon(); }
  const sw = e.target.closest(".sw"); if (sw) { S.acc = sw.dataset.c; renderDesign(); renderSheet(); save(); }
});
document.addEventListener("keydown", e => { if ((e.key==="Enter"||e.key===" ") && e.target.matches("[data-tpl],[data-lvl],.mode")) { e.preventDefault(); e.target.click(); } });
document.addEventListener("input", e => { if (e.target.id === "accPick") { S.acc = e.target.value; renderSheet(); save(); } });
$("#optLimit").onchange = e => { S.limit = e.target.value; soon(); };
$("#optPhoto").onchange = e => { S.photo = e.target.checked; renderSheet(); save(); };
$("#titular").oninput = e => { D().personal.titular = e.target.value; soon(); };
$("#perfil").oninput = e => { D().perfil = e.target.value; D().perfilCustom = true; renderPerfilInfo(); soon(); };
$("#perfilReset").onclick = () => { D().perfilCustom = false; D().perfil = ""; $("#perfil").value = perfilRaw(); renderPerfilInfo(); soon(); };

/* Panel de métricas del perfil + inserción de marcadores {docencia} {diseno} {titulado} {horas} */
function renderPerfilInfo(){
  const m = metrics(), box = $("#perfilInfo"); if (!box) return;
  const chip = (k, txt) => `<button class="mchip" data-ph="${k}" title="Insertar {${k}} en el perfil">${txt}</button>`;
  box.innerHTML = `<div class="m-title">📊 Según tu registro completo (al ${m.ref}) — no cambia con los filtros:</div>
    <div class="m-chips">${m.docencia!=null?chip("docencia",`<b>${m.docencia}</b> años en docencia superior <small>(desde ${m.docenciaDesde})</small>`):""}
    ${m.experiencia!=null?chip("experiencia",`<b>${m.experiencia}</b> años de experiencia <small>(desde ${m.experienciaDesde})</small>`):""}
    ${chip("publicaciones",`<b>${pubMetrics().total}</b> publicaciones`)}
    ${m.titulado!=null?chip("titulado",`<b>${m.titulado}</b> años desde el título <small>(${m.tituladoDesde})</small>`):""}
    ${chip("horas",`<b>${fmtN(m.horas)}</b> h de capacitación`)}</div>
    <div class="m-help">Pulsa una cifra para insertarla en el perfil; se actualiza sola si agregas o cambias datos.</div>
    <div class="m-prev"><b>Así se lee:</b> ${esc(perfil())}</div>`;
}
document.addEventListener("click", e => {
  const c = e.target.closest("[data-ph]"); if (!c) return;
  const ta = $("#perfil"), ph = `{${c.dataset.ph}}`, a = ta.selectionStart ?? ta.value.length, b = ta.selectionEnd ?? a;
  ta.value = ta.value.slice(0,a) + ph + ta.value.slice(b); ta.focus(); ta.selectionStart = ta.selectionEnd = a + ph.length;
  ta.dispatchEvent(new Event("input", {bubbles:true}));
});

/* Botones de filtro: horas de capacitación y antigüedad */
function filterLabel(){ const p=[]; if ((S.hoursF||"all")!=="all") p.push(HOURS_F[S.hoursF].label); if ((S.yearsF||"all")!=="all") p.push(`${YEARS_F[S.yearsF].label} (desde ${REF_YEAR-YEARS_F[S.yearsF].n})`); return p.join(" · "); }
function filterNote(){
  if (!filterLabel()) return "";
  const tot = D().sections.filter(s=>!S.disabled.includes(s.id)).reduce((a,s)=>a+s.rows.length,0), shown = activeSections().reduce((a,s)=>a+visibleRows(s).rows.length,0);
  return `Selección: ${filterLabel()}. Se presentan ${shown} de ${tot} registros; el detalle completo está disponible a solicitud.`;
}
function countWith(key, val){
  const prev = S[key]; S[key] = val;
  const n = D().sections.filter(s=>!S.disabled.includes(s.id)).reduce((a,s)=>a+s.rows.filter(c=>passAll(s,c)).length,0);
  S[key] = prev; return n;
}
function renderFilters(){
  const boxes = $$(".filters-box"); if (!boxes.length) return;
  const seg = (key, defs) => Object.entries(defs).map(([k,d])=>`<button class="seg ${(S[key]||"all")===k?"on":""}" data-filter="${key}" data-val="${k}">${d.label}${d.n?` <small>desde ${REF_YEAR-d.n}</small>`:""}<span class="seg-n">${countWith(key,k)}</span></button>`).join("");
  const html = `<div class="f-group"><span class="f-lab">⏱ Horas de capacitación</span><div class="segs">${seg("hoursF", {"100":HOURS_F["100"], "60":HOURS_F["60"], all:HOURS_F.all})}</div></div>
    <div class="f-group"><span class="f-lab">📅 Antigüedad</span><div class="segs">${seg("yearsF", {"5":YEARS_F["5"], "10":YEARS_F["10"], "15":YEARS_F["15"], all:YEARS_F.all})}</div></div>
    <div class="f-note">${filterLabel() ? `Mostrando ${activeSections().reduce((a,s)=>a+visibleRows(s).rows.length,0)} registros. El filtro de horas aplica a cursos y capacitaciones (los cursos sin horas registradas quedan fuera; 1 crédito = ${CRED_H} h). El de años no afecta a los grados académicos. <b>Los años del perfil se calculan siempre con el registro completo.</b>` : "Sin filtros: se muestran todos los registros."}</div>`;
  boxes.forEach(b => b.innerHTML = html);
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-filter]"); if (!b) return;
  S[b.dataset.filter] = b.dataset.val; renderToggles(); renderSheet(); save();
});
$("#photoInput").onchange = e => { const f = e.target.files[0]; e.target.value = ""; if (f) compressPhoto(f); };
/* ----- Controles de forma/marco de la foto ----- */
function renderPhotoOpts(){
  const box = $("#photoOpts"); if (!box) return;
  const cur = S.photoFrame || "auto", sh = S.photoShape || "auto", ph = D().foto ? `<img src="${D().foto}" alt="">` : "";
  const ds = sh === "auto" ? photoShape() : sh, dm = ds === "circle" || ds === "oval" ? "round" : ds === "rect" ? "rect" : "soft";
  box.innerHTML = `<label class="fl">Forma</label><div class="segs segs-sm">${Object.entries(PHOTO_SHAPES).map(([k,l])=>`<button class="seg ${sh===k?"on":""}" data-pshape="${k}">${l}</button>`).join("")}</div>
    <label class="fl">Tipo de marco</label><div class="frames">${Object.entries(PHOTO_FRAMES).map(([k,l])=>`<button class="frame-opt ${cur===k?"on":""}" data-pframe="${k}" title="${l}">
      <span class="fr-demo-wrap" style="--acc:${acc()}"><span class="cv-photo fr-demo dm-${dm} fr-${k}">${ph || "<i>👤</i>"}</span></span><small>${l}</small></button>`).join("")}</div>`;
}
/* ----- Controles de la marca profesional ----- */
function renderBrandBox(){
  const box = $("#brandBox"); if (!box) return; const b = B();
  const grid = ["tl","tc","tr","bl","bc","br"].map(k=>`<button class="pos-cell ${b.pos===k?"on":""}" data-bpos="${k}" title="${BRAND_POS[k]}"><i></i></button>`).join("");
  box.innerHTML = `
    <div class="brand-grid">
      <div>
        <label class="fl" style="margin-top:0">Tipo</label>
        <div class="segs segs-sm">${Object.entries(BRAND_TYPES).map(([k,l])=>`<button class="seg ${b.type===k?"on":""}" data-btype="${k}">${l}</button>`).join("")}</div>
        ${b.type==="logo" ? `<label class="fl">Imagen del logo (PNG con fondo transparente recomendado)</label>
          <div class="row-inline"><label class="btn btn-ghost btn-sm">⤒ Subir logo<input type="file" id="logoInput" accept="image/*" hidden></label>${b.logo?`<img src="${b.logo}" alt="" style="height:38px;border:1px solid var(--line);border-radius:6px;background:#fff;padding:2px"><button class="btn btn-ghost btn-sm" id="logoDel">Quitar</button>`:`<small style="color:var(--muted)">Logo institucional, de colegio profesional o tu marca personal.</small>`}</div>` : ""}
        ${b.type==="monogram" || b.type==="badge" ? `<label class="fl">${b.type==="badge"?"Título del distintivo":"Iniciales"}</label>
          ${b.type==="badge" ? `<input id="bTitle" value="${esc(b.title)}" placeholder="Docente nombrado">` : `<input value="${esc(initials(D().personal.nombre))}" disabled title="Se generan a partir de tu nombre">`}
          <label class="fl">${b.type==="badge"?"Subtítulo":"Texto en el borde"}</label><input id="bSub" value="${esc(b.sub)}" placeholder="Reg. N.° 00000 · Especialidad · Institución" data-x="STP DyC">` : ""}
        ${b.type!=="none" ? `<div class="brand-prev" style="--acc:${acc()}">${brandInner() || "<small>Sube un logo para verlo aquí</small>"}</div>` : ""}
      </div>
      <div ${b.type==="none"?'class="dim-box"':""}>
        <label class="fl" style="margin-top:0">Posición en la hoja</label>
        <div class="pos-pick"><div class="pos-page">${grid}<span class="pos-name ${b.pos==="name"?"on":""}" data-bpos="name" title="${BRAND_POS.name}">Nombre ▸ ●</span><span class="pos-wm ${b.pos==="wm"?"on":""}" data-bpos="wm" title="${BRAND_POS.wm}">◎</span></div>
          <div class="pos-list">${Object.entries(BRAND_POS).map(([k,l])=>`<button class="pos-chip ${b.pos===k?"on":""}" data-bpos="${k}">${l}</button>`).join("")}</div></div>
        <label class="fl">Tamaño</label><div class="segs segs-sm">${Object.entries(BRAND_SIZE).map(([k,l])=>`<button class="seg ${b.size===k?"on":""}" data-bsize="${k}">${l}</button>`).join("")}</div>
        ${b.pos==="wm" ? `<label class="fl">Intensidad de la marca de agua: <b id="bOpVal">${b.opacity}%</b></label><input type="range" id="bOpacity" min="4" max="30" value="${b.opacity}" style="padding:0">` : ""}
        ${b.pos!=="name" ? `<label class="toggle" style="border:0"><input type="checkbox" id="bRepeat" ${b.repeat?"checked":""}> Repetir en cada página al imprimir o guardar como PDF</label>` : ""}
      </div>
    </div>`;
}
const brandChanged = () => { renderBrandBox(); renderSheet(); save(); };
document.addEventListener("click", e => {
  const t = e.target.closest("[data-pshape],[data-pframe],[data-btype],[data-bpos],[data-bsize],#logoDel"); if (!t) return;
  if (t.dataset.pshape) { S.photoShape = t.dataset.pshape; renderPhotoOpts(); renderSheet(); save(); }
  else if (t.dataset.pframe) { S.photoFrame = t.dataset.pframe; renderPhotoOpts(); renderSheet(); save(); }
  else if (t.dataset.btype) { B().type = t.dataset.btype; brandChanged(); }
  else if (t.dataset.bpos) { B().pos = t.dataset.bpos; brandChanged(); }
  else if (t.dataset.bsize) { B().size = t.dataset.bsize; brandChanged(); }
  else if (t.id === "logoDel") { B().logo = null; brandChanged(); }
});
document.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "bTitle") { B().title = t.value; renderSheet(); save(); const p = $(".brand-prev"); if (p) p.innerHTML = brandInner(); }
  else if (t.id === "bSub") { B().sub = t.value; renderSheet(); save(); const p = $(".brand-prev"); if (p) p.innerHTML = brandInner(); }
  else if (t.id === "bOpacity") { B().opacity = +t.value; $("#bOpVal").textContent = t.value + "%"; renderSheet(); save(); }
  else if (t.id === "bRepeat") { B().repeat = t.checked; renderSheet(); save(); }
});
document.addEventListener("change", e => {
  if (e.target.id !== "logoInput") return;
  const f = e.target.files[0]; if (!f) return;
  const img = new Image(); img.onload = () => {
    const max = 600, sc = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
    c.width = Math.round(img.width*sc); c.height = Math.round(img.height*sc); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    B().logo = c.toDataURL("image/png"); URL.revokeObjectURL(img.src); brandChanged();
  }; img.src = URL.createObjectURL(f);
});
$("#photoDel").onclick =() => { D().foto = null; renderDesign(); renderSheet(); save(); };

/* ===================== PASO 3 · EDITOR ===================== */
function renderTabs(){
  const tabs = [["personal","👤 Datos personales"], ...orderedSections().map(s=>[s.id, s.title.replace("Formación continua — ","Formación · ").replace(" en el sector productivo (Diseño)"," productiva").replace(" en educación superior","")]), ["__new","＋ Nueva sección"]];
  const perSec = {}; DUPS.filter(g=>!g.ignored).forEach(g=>new Set(g.members.map(x=>x.s.id)).forEach(id=>{ const sev = DUP_TYPES[g.type].sev; perSec[id] = perSec[id]==="err" ? "err" : sev; }));
  $("#edTabs").innerHTML = tabs.map(([k,l])=>`<button class="ed-tab ${S.tab===k?"active":""}" data-tab="${k}">${esc(l)}${perSec[k]?` <span class="tab-dot ${perSec[k]}" title="Tiene posibles repeticiones"></span>`:""}</button>`).join("");
}
function renderEditor(){
  refreshDups(); renderTabs();
  const P = $("#edPanel");
  if (S.tab === "personal") {
    const p = D().personal;
    P.innerHTML = `<label class="fl" style="margin-top:0">Nombre completo (encabezado)</label><input data-p="nombre" value="${esc(p.nombre)}">
      <label class="fl">Campos <span style="font-weight:400">(etiqueta · valor · enlace opcional: mailto:, https://…)</span></label><div class="fields">${p.campos.map((c,i)=>`<div class="field-row"><input data-f="${i}" data-k="0" value="${esc(c[0])}" placeholder="Etiqueta"><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><input data-f="${i}" data-k="1" value="${esc(c[1])}" placeholder="Valor"><input data-f="${i}" data-k="3" value="${esc(c[3]||"")}" placeholder="Enlace (opcional)"></div><label><input type="checkbox" data-f="${i}" data-k="2" ${c[2]?"checked":""}> sensible</label><button class="icon-btn" data-fdel="${i}" title="Eliminar">✕</button></div>`).join("")}</div>
      <div class="toolbar"><button class="btn btn-ghost btn-sm" id="fieldAdd">＋ Agregar campo</button><small style="color:var(--muted)">Los campos «sensibles» solo aparecen si activas «Incluir DNI y domicilio».</small></div>
      ${socialEditorHTML()}`;
    return;
  }
  if (S.tab === "__new") {
    P.innerHTML = `<div class="sec-head"><div><label class="fl" style="margin-top:0">Título de la sección</label><input id="nsTitle" placeholder="Ej. Publicaciones y proyectos"></div><div><label class="fl" style="margin-top:0">Tipo de columnas</label><select id="nsKind"><option value="edu">Formación (Año · Tema · Institución · Horas)</option><option value="exp">Experiencia (Año · Empresa · Función · Tiempo)</option><option value="pub">Publicaciones (APA 7 · DOI · indexación)</option></select></div><div><label class="fl" style="margin-top:0">Prefijo</label><input id="nsPrefix" placeholder="07"></div><div><label class="fl" style="margin-top:0">Carpeta</label><input id="nsFolder" placeholder="07_Publicaciones"></div><div><label class="fl" style="margin-top:0">¿Es de cursos?</label><select id="nsTraining"><option value="0">No</option><option value="1">Sí (aplica límite)</option></select></div><div><button class="btn btn-doc" id="nsCreate">Crear</button></div></div>`;
    return;
  }
  const s = D().sections.find(x=>x.id===S.tab); if (!s) { S.tab="personal"; return renderEditor(); }
  const cols = colsOf(s), c4 = show4(s), flags = dupFlags();
  const dupLine = (r) => { const gs = flags.get(r); if (!gs) return "";
    return gs.map(g => { const others = g.members.filter(x=>x.ref!==r), t = DUP_TYPES[g.type];
      return `<div class="rc-dup ${t.sev}">⚠ <b>${t.label}</b> con ${others.map(x=>`<a href="#" data-dupgo="${x.s.id}|${x.i}">${x.code}${x.s.id!==s.id?` (${esc(x.s.title.replace("Formación continua — ","").slice(0,28))})`:""}</a>`).join(", ")}
        ${t.sev==="warn" ? `<button class="btn btn-ghost btn-sm" data-dupok="${esc(g.key)}">✓ Es válido</button>` : ""}</div>`; }).join(""); };
  P.innerHTML = `<div class="sec-head">
      <div style="grid-column:span 2"><label class="fl" style="margin-top:0">Título de la sección</label><input data-s="title" value="${esc(s.title)}"></div>
      <div><label class="fl" style="margin-top:0">Prefijo</label><input data-s="prefix" value="${esc(s.prefix)}"></div>
      <div><label class="fl" style="margin-top:0">Carpeta de evidencias</label><input data-s="folder" value="${esc(s.folder)}"></div>
      <div><label class="fl" style="margin-top:0">Cursos</label><select data-s="training"><option value="0" ${s.training?"":"selected"}>No</option><option value="1" ${s.training?"selected":""}>Sí (aplica límite)</option></select></div>
      <div><button class="btn btn-ghost btn-sm" id="secDel" style="color:var(--rose)">🗑 Eliminar sección</button></div></div>
    ${s.kind === "pub" ? pubEditorExtras() : ""}
    <div class="col4-cfg" ${s.kind === "pub" ? "hidden" : ""}><span class="f-lab">4.ª columna de la tabla</span>
      <label class="toggle" style="border:0;padding:0"><input type="checkbox" id="c4Show" ${c4?"checked":""}> Mostrar</label>
      <input id="c4Label" list="c4Opts" value="${esc(cols[3])}" ${c4?"":"disabled"} style="max-width:200px" aria-label="Nombre de la 4.ª columna">
      <datalist id="c4Opts"><option value="Horas"><option value="Tiempo"><option value="Periodo"><option value="Duración"><option value="Créditos"><option value="Lugar"><option value="Modalidad"><option value="Rol"></datalist>
      <small style="color:var(--muted)">${c4 ? "Elige o escribe el nombre del encabezado." : "Oculta en la hoja del CV, Word y Markdown (los datos se conservan)."}</small></div>
    <div class="toolbar"><button class="btn btn-doc btn-sm" id="rowAdd">＋ Agregar fila</button><button class="btn btn-ghost btn-sm" id="rowSort">⇅ Ordenar por año (reciente primero)</button><small style="color:var(--muted)">${s.rows.length} filas · 🔗 ${s.rows.filter(r=>r[4]).length} con enlace · los códigos se recalculan según la posición</small></div>
    <div class="row-cards">${s.rows.map((r,i)=>{ const u = r[4]||"", st = !u ? "none" : isShared(u) ? "warn" : "ok";
      if (s.kind === "pub") return pubCardHTML(s, r, i, flags.get(r)?(flags.get(r).some(g=>DUP_TYPES[g.type].sev==="err")?"dup-err":"dup-warn"):"", dupLine(r));
      return `<div class="row-card ${flags.get(r)?(flags.get(r).some(g=>DUP_TYPES[g.type].sev==="err")?"dup-err":"dup-warn"):""}" id="row-${s.id}-${i}">${dupLine(r)}
        <div class="rc-top"><span class="rc-code">${codeOf(s,i)}</span>
          <label class="rc-f rc-year">${cols[0]}<input data-r="${i}" data-k="0" value="${esc(r[0])}"></label>
          ${c4 ? `<label class="rc-f rc-hrs">${esc(cols[3])}<input data-r="${i}" data-k="3" value="${esc(r[3])}"></label>` : ""}
          <div class="acts"><button class="icon-btn" data-mv="${i}" data-d="-1" title="Subir">↑</button><button class="icon-btn" data-mv="${i}" data-d="1" title="Bajar">↓</button><button class="icon-btn" data-rdel="${i}" title="Eliminar fila">✕</button></div></div>
        <div class="rc-mid"><label class="rc-f">${cols[1]}<textarea data-r="${i}" data-k="1" rows="2">${esc(r[1])}</textarea></label>
          <label class="rc-f">${cols[2]}<textarea data-r="${i}" data-k="2" rows="2">${esc(r[2])}</textarea></label></div>
        <label class="rc-f rc-link ${st}">🔗 Enlace del certificado <span class="rc-hint">(pega aquí la URL de Google Drive, SUNEDU, etc.)</span>
          <span class="rc-linkrow"><input type="url" data-r="${i}" data-k="4" value="${esc(u)}" placeholder="https://drive.google.com/file/d/…">
          ${u?`<a class="btn btn-ghost btn-sm" href="${esc(u)}" target="_blank" rel="noopener" data-vt="${esc(s.kind==="exp"?r[1]+" — "+r[2]:r[1])}" data-vs="${esc(s.title+" · "+r[0])}" data-vc="${codeOf(s,i)}">👁 Ver</a>`:""}</span>
          ${st==="warn"?`<span class="rc-warn">⚠ En el PDF original este mismo enlace se usa para otro curso: verifica que sea el certificado correcto.</span>`:""}</label>
      </div>`; }).join("")}</div>`;
}
const curSec = () => D().sections.find(x=>x.id===S.tab);
$("#edTabs").onclick = e => { const b = e.target.closest("[data-tab]"); if (b) { S.tab = b.dataset.tab; renderEditor(); save(); } };
$("#edPanel").addEventListener("input", e => {
  const t = e.target, d = t.dataset;
  if (t.id === "c4Label") { const s = curSec(); s.col4 = { ...(s.col4||{}), label: t.value.trim() }; soon(); return; }
  if (t.id === "c4Show") { const s = curSec(); s.col4 = { ...(s.col4||{}), hide: !t.checked }; const y = scrollY; renderEditor(); scrollTo(0,y); soon(); return; }
  if (d.p) D().personal[d.p] = t.value;
  else if (d.f !== undefined) D().personal.campos[+d.f][+d.k] = t.type==="checkbox" ? t.checked : t.value;
  else if (d.s) { const s = curSec(); s[d.s] = d.s==="training" ? t.value==="1" : t.value; if (d.s==="title") renderTabs(); }
  else if (d.r !== undefined) curSec().rows[+d.r][+d.k] = t.value;
  else return;
  soon();
});
/* ----- Reubicación automática por año -----
   Clave de orden: el año más reciente que aparezca en el campo («2011–2016» → 2016). Orden estable: los empates conservan su posición. */
const yearKey = v => { const ys = String(v||"").match(/\d{4}/g); return ys ? Math.max(...ys.map(Number)) : -1; };
function sortRows(s){ s.rows.sort((a,b)=> yearKey(b[0]) - yearKey(a[0])); }
/* ----- Detección de repeticiones -----
   exacto    (rojo):    mismo tema + misma institución + mismo año  (experiencia: empresa + función + año)
   documento (rojo):    el mismo número de resolución / orden de servicio en dos filas
   enlace    (naranja): el mismo URL de certificado en filas distintas
   titulo    (naranja): mismo título con distinto año o institución (puede ser válido: «Es válido» lo descarta)
   parecido  (naranja): títulos casi iguales (≥ 80 % de palabras en común)                                        */
const DUP_TYPES = {
  exacto:    { sev:"err",  label:"Duplicado exacto",        tip:"Misma fila repetida: elimina una de ellas." },
  doi:       { sev:"err",  label:"Mismo DOI",               tip:"Dos publicaciones con el mismo DOI: probablemente es la misma investigación registrada dos veces." },
  documento: { sev:"err",  label:"Mismo documento",         tip:"El mismo número de resolución u orden de servicio aparece en dos filas." },
  enlace:    { sev:"warn", label:"Mismo enlace",            tip:"Dos filas apuntan al mismo certificado: verifica que cada una tenga el suyo." },
  titulo:    { sev:"warn", label:"Mismo título",            tip:"Mismo curso con distinto año o institución. Si son certificados distintos, márcalo como válido." },
  parecido:  { sev:"warn", label:"Títulos muy parecidos",   tip:"Podría ser el mismo curso escrito de dos formas." }
};
const normT = t => String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")
  .replace(/certificado del curso( virtual)?:?|curso( virtual)?( de)?|taller( de)?|capacitacion tematica( docente)?( sobre)?|programa( de)?/g," ")
  .replace(/[^a-z0-9]+/g," ").trim();
const instKey = t => normT(String(t||"").split(/,|\d{2}\/\d{2}/)[0]);
const docCodes = t => (String(t||"").match(/\b(?:RDR|RD|RJ|OS|PE|N[º°o]\.?)\s*[\d][\d-]{3,}(?:-[A-Z]+)*/gi) || []).map(c=>c.toUpperCase().replace(/\s+/g," "));
function findDuplicates(){
  const items = D().sections.flatMap(s => s.rows.map((r,i)=>({ s, i, ref:r, code:codeOf(s,i), exp:s.kind==="exp",
    title: normT(s.kind==="exp" ? r[2] : r[1]), who: s.kind==="exp" ? normT(r[1]) : instKey(r[2]), year: yearKey(r[0]), url:String(r[4]||"").trim() })))
    .filter(x => x.title);
  const groups = [], seen = new Set();
  const push = (type, members) => {
    const key = type + ":" + members.map(m=>m.title+"@"+m.year).sort().join("|");
    if (members.length < 2 || seen.has(key)) return; seen.add(key);
    groups.push({ type, key, members, ignored: (S.dupIgnore||[]).includes(key) });
  };
  const bucket = f => { const m = {}; items.forEach(x=>{ const k=f(x); if (k) (m[k] ??= []).push(x); }); return Object.values(m).filter(g=>g.length>1); };
  const exact = bucket(x => `${x.exp?"E":"F"}|${x.title}|${x.who}|${x.year}`);
  exact.forEach(g => push("exacto", g));
  const inExact = new Set(exact.flat().map(x=>x.ref));
  const docs = {}; items.forEach(x => docCodes(x.ref[2]+" "+x.ref[1]).forEach(c => (docs[c] ??= new Set()).add(x)));
  Object.values(docs).forEach(set => { const g=[...set]; if (g.length>1 && !g.every(x=>inExact.has(x.ref))) push("documento", g); });
  bucket(x => x.s.kind === "pub" && doiNorm(x.ref[6]).toLowerCase()).forEach(g => push("doi", g));
  const portal = u => /^https?:\/\/[^/]+\/?$/i.test(u);                 // p. ej. enlinea.sunedu.gob.pe: consulta general, no es un certificado
  bucket(x => x.url && !portal(x.url) && x.url).forEach(g => { if (!g.every(x=>inExact.has(x.ref))) push("enlace", g); });
  bucket(x => !x.exp && x.title).forEach(g => { if (!g.every(x=>inExact.has(x.ref))) push("titulo", g); });
  const tok = s => new Set(s.split(" ").filter(w=>w.length>2)), edu = items.filter(x=>!x.exp);
  for (let a=0; a<edu.length; a++) for (let b=a+1; b<edu.length; b++) {
    const A=edu[a], B=edu[b]; if (A.title===B.title) continue;
    const x=tok(A.title), y=tok(B.title); if (x.size<3 || y.size<3) continue;
    const inter=[...x].filter(w=>y.has(w)).length, j=inter/(x.size+y.size-inter);
    if (j >= .8) push("parecido", [A,B]);
  }
  const order = {exacto:0,doi:1,documento:2,enlace:3,titulo:4,parecido:5};
  return groups.sort((a,b)=> a.ignored-b.ignored || order[a.type]-order[b.type]);
}
let DUPS = [];
function dupFlags(){ const m = new Map(); DUPS.filter(g=>!g.ignored).forEach(g=>g.members.forEach(x=>{ (m.get(x.ref) || m.set(x.ref,[]).get(x.ref)).push(g); })); return m; }
function refreshDups(){
  DUPS = findDuplicates();
  const act = DUPS.filter(g=>!g.ignored), err = act.filter(g=>DUP_TYPES[g.type].sev==="err").length;
  const btn = $("#dupBtn"); if (btn) { btn.innerHTML = act.length ? `🔍 Repeticiones <span class="dup-count ${err?"err":"warn"}">${act.length}</span>` : "🔍 Repeticiones <span class=\"dup-count ok\">0</span>"; }
  if ($("#dupPanel") && !$("#dupPanel").hidden) renderDupPanel();
}
function renderDupPanel(){
  const P = $("#dupPanel"), act = DUPS.filter(g=>!g.ignored), ign = DUPS.filter(g=>g.ignored);
  const secName = s => s.title.replace("Formación continua — ","Formación · ");
  const grp = g => { const t = DUP_TYPES[g.type];
    return `<div class="dup-group ${t.sev} ${g.ignored?"ignored":""}"><div class="dup-h"><span class="dup-badge ${t.sev}">${t.label}</span><small>${t.tip}</small>
      ${g.ignored ? `<button class="btn btn-ghost btn-sm" data-dupunok="${esc(g.key)}">Volver a revisar</button>` : (t.sev==="warn" ? `<button class="btn btn-ghost btn-sm" data-dupok="${esc(g.key)}">✓ Es válido</button>` : "")}</div>
      ${g.members.map(x=>`<div class="dup-item"><code>${x.code}</code><span class="dup-sec">${esc(secName(x.s))}</span><span class="dup-txt"><b>${esc(x.ref[0])}</b> · ${esc(x.exp ? x.ref[1]+" — "+x.ref[2] : x.ref[1])} <span style="color:var(--muted)">· ${esc(x.exp ? x.ref[3] : x.ref[2])}</span></span>
        <button class="btn btn-ghost btn-sm" data-dupgo="${x.s.id}|${x.i}">Ir ›</button><button class="icon-btn" data-dupdel="${x.s.id}|${x.i}" title="Eliminar esta fila">🗑</button></div>`).join("")}</div>`; };
  P.innerHTML = `<div class="dup-top"><h4 style="margin:0">Revisión de repeticiones</h4><button class="icon-btn" id="dupClose" title="Cerrar">✕</button></div>`
    + (act.length ? act.map(grp).join("") : `<p class="dup-none">✅ No se encontraron repeticiones pendientes en ${D().sections.reduce((a,s)=>a+s.rows.length,0)} filas.</p>`)
    + (ign.length ? `<details class="dup-ign"><summary>${ign.length} marcada(s) como válida(s)</summary>${ign.map(grp).join("")}</details>` : "");
}
function jumpToRow(sid, i){
  S.tab = sid; renderEditor();
  const el = document.getElementById(`row-${sid}-${i}`);
  if (el) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); el.scrollIntoView({behavior:"smooth", block:"center"}); }
}
document.addEventListener("click", e => {
  const t = e.target.closest("[data-dupgo],[data-dupdel],[data-dupok],[data-dupunok],#dupBtn,#dupClose"); if (!t) return;
  if (t.id === "dupBtn") { const P=$("#dupPanel"); P.hidden = !P.hidden; if (!P.hidden) { refreshDups(); renderDupPanel(); P.scrollIntoView({behavior:"smooth",block:"nearest"}); } return; }
  if (t.id === "dupClose") { $("#dupPanel").hidden = true; return; }
  if (t.dataset.dupgo) { e.preventDefault(); const [sid,i] = t.dataset.dupgo.split("|"); jumpToRow(sid, +i); return; }
  if (t.dataset.dupdel) { const [sid,i] = t.dataset.dupdel.split("|"), s = D().sections.find(x=>x.id===sid), r = s && s.rows[+i];
    if (r && confirm(`¿Eliminar la fila ${codeOf(s,+i)}?\n«${s.kind==="exp" ? r[1]+" — "+r[2] : r[1]}» (${r[0]})`)) { s.rows.splice(+i,1); renderEditor(); soon(); refreshDups(); renderDupPanel(); setStatus("dirty","Fila eliminada · pulsa Guardar"); } return; }
  if (t.dataset.dupok) { S.dupIgnore = [...(S.dupIgnore||[]), t.dataset.dupok]; save(); refreshDups(); renderDupPanel(); renderEditor(); return; }
  if (t.dataset.dupunok) { S.dupIgnore = (S.dupIgnore||[]).filter(k=>k!==t.dataset.dupunok); save(); refreshDups(); renderDupPanel(); renderEditor(); return; }
});
let focusRow = null;   // {sid, ref, year}
$("#edPanel").addEventListener("focusin", e => {
  const card = e.target.closest(".row-card"); if (!card) return;
  const s = curSec(), i = +card.id.split("-").pop(), ref = s && s.rows[i];
  if (!ref || (focusRow && focusRow.ref === ref)) return;
  focusRow = { sid:s.id, ref, snap: JSON.stringify(ref) };
});
$("#edPanel").addEventListener("focusout", e => {
  const card = e.target.closest(".row-card"); if (!card || !focusRow) return;
  if (e.relatedTarget && card.contains(e.relatedTarget)) return;      // sigue llenando la misma fila
  const { sid, ref, snap } = focusRow; focusRow = null;
  const s = D().sections.find(x=>x.id===sid); if (!s || !s.rows.includes(ref)) return;
  if (JSON.stringify(ref) === snap) return;                            // la fila no cambió
  const before = s.rows.indexOf(ref);
  sortRows(s);
  const after = s.rows.indexOf(ref);
  const next = e.relatedTarget, nextCard = next && next.closest && next.closest(".row-card"), nextField = next && next.dataset && next.dataset.k;
  const nextRef = nextCard ? s.rows[+nextCard.id.split("-").pop()] : null;  // fila a la que iba el usuario (antes de reordenar)
  setTimeout(()=>{
    const y = scrollY; renderEditor(); soon(); scrollTo(0, y);
    const el = document.getElementById(`row-${sid}-${after}`);
    if (before !== after && el) {
      el.classList.add("flash");
      el.scrollIntoView({behavior:"smooth", block:"center"});
      setStatus("dirty", `Fila reubicada por año: ${codeOf(s,before)} → ${codeOf(s,after)}`);
    } else if (nextRef && nextField) {                                 // devolver el foco donde iba
      const j = s.rows.indexOf(nextRef);
      document.querySelector(`#row-${sid}-${j} [data-k="${nextField}"]`)?.focus({preventScroll:true});
    }
    const gs = dupFlags().get(ref);                                    // ¿la fila recién llenada repite otra?
    if (gs) { const g = gs[0], o = g.members.find(x=>x.ref!==ref);
      setStatus("dirty", `⚠ ${DUP_TYPES[g.type].label}: la fila ${codeOf(s,after)} coincide con ${o.code}`); }
  }, 0);
});
$("#edPanel").addEventListener("change", e => {
  if (e.target.dataset.f !== undefined && e.target.type==="checkbox") soon();
});
/* Insertar / cambiar el enlace directamente desde la vista previa */
$("#sheet").addEventListener("click", e => {
  const b = e.target.closest("[data-addlink]"); if (!b) return;
  e.preventDefault();
  const [sid, i] = b.dataset.addlink.split("|"), s = D().sections.find(x=>x.id===sid), row = s && s.rows[+i]; if (!row) return;
  const v = prompt(`Enlace del certificado para:\n«${row[1]}»\n\nPega la URL (Google Drive, SUNEDU, etc.). Déjalo vacío para quitarlo.`, row[4] || "");
  if (v === null) return;
  row[4] = v.trim(); if (S.tab === sid) renderEditor(); soon();
  say(row[4] ? `Enlace guardado para «${row[1]}».` : `Enlace eliminado de «${row[1]}».`);
});
$("#edPanel").addEventListener("click", e => {
  const t = e.target, s = curSec();
  if (t.id === "fieldAdd") { D().personal.campos.push(["Nuevo campo","",false,""]); renderEditor(); soon(); }
  else if (t.dataset.fdel !== undefined) { D().personal.campos.splice(+t.dataset.fdel,1); renderEditor(); soon(); }
  else if (t.id === "rowAdd") { s.rows.unshift(s.kind==="pub" ? [String(new Date().getFullYear()),"","","Artículo científico","","","","",""] : [String(new Date().getFullYear()),"","","",""]); renderEditor(); soon(); $("#edPanel textarea")?.focus(); }
  else if (t.id === "rowSort") { sortRows(s); renderEditor(); soon(); }
  else if (t.dataset.rdel !== undefined) { if (confirm("¿Eliminar esta fila?")) { s.rows.splice(+t.dataset.rdel,1); renderEditor(); soon(); } }
  else if (t.dataset.mv !== undefined) { const i=+t.dataset.mv, j=i+(+t.dataset.d); if (j>=0 && j<s.rows.length) { [s.rows[i],s.rows[j]]=[s.rows[j],s.rows[i]]; renderEditor(); soon(); } }
  else if (t.id === "secDel") { if (confirm(`¿Eliminar la sección «${s.title}» y sus ${s.rows.length} filas?`)) { D().sections = D().sections.filter(x=>x!==s); S.tab="personal"; renderEditor(); soon(); } }
  else if (t.id === "nsCreate") {
    const title = $("#nsTitle").value.trim(); if (!title) return $("#nsTitle").focus();
    const id = "s" + Date.now().toString(36), n = D().sections.length + 1;
    D().sections.push({ id, title, kind:$("#nsKind").value, prefix:$("#nsPrefix").value.trim() || String(n).padStart(2,"0"), folder:$("#nsFolder").value.trim() || `${String(n).padStart(2,"0")}_${slug(title)}`, training:$("#nsTraining").value==="1", rows:[[String(new Date().getFullYear()),"","","",""]] });
    applyCol4Defaults(D()); S.tab = id; renderEditor(); soon();
  }
});
function backup(){ download(new Blob([JSON.stringify(S,null,2)],{type:"application/json"}), `CVStudio_respaldo_${new Date().toISOString().slice(0,10)}.json`); }
$("#jsonExport").onclick = backup; $("#jsonExport2").onclick = backup;
$("#jsonImport").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try { const o = JSON.parse(await f.text()); if (o.data && o.data.sections) S = Object.assign(defaults(), o); else if (o.sections) S.data = o; else throw 0; applyLinks(S.data); S.linksV = LINKS_V; refreshAll(); say("Respaldo importado."); }
  catch(_) { alert("El archivo no es un respaldo válido de CV Studio."); }
  e.target.value = "";
};
$("#csvImport").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  const rows = parseCSV(await f.text()); const head = rows.shift().map(h=>h.trim().toLowerCase());
  const ix = k => head.indexOf(k), need = ["seccion","año","tema","institucion","horas"];
  if (need.some(k=>ix(k)<0)) { alert("El CSV debe tener las columnas: " + need.join(", ") + " (usa el CSV que exporta CV Studio)."); return; }
  const by = {}; rows.filter(r=>r.length>1).forEach(r=>{ (by[r[ix("seccion")]] ??= []).push([r[ix("año")],r[ix("tema")],r[ix("institucion")],r[ix("horas")], ...["enlace","autores","doi","indexacion","volumen_paginas"].map(k => ix(k)>=0 ? (r[ix(k)]||"") : "")]); });
  let n = 0;
  for (const [title, rs] of Object.entries(by)) {
    let s = D().sections.find(x=>x.title===title);
    if (!s) { const k = D().sections.length+1; s = { id:"s"+Date.now().toString(36)+k, title, kind:"edu", prefix:String(k).padStart(2,"0"), folder:`${String(k).padStart(2,"0")}_${slug(title)}`, training:false, rows:[] }; D().sections.push(s); }
    s.rows = rs; n += rs.length;
  }
  refreshAll(); say(`CSV importado: ${n} filas en ${Object.keys(by).length} secciones.`); e.target.value = "";
};
$("#resetData").onclick = () => { if (confirm("¿Restablecer todos los datos originales? Se perderán tus cambios (descarga antes un respaldo .json).")) { S.data = applyLinks(clone(window.DEFAULT_DATA)); refreshAll(); save(); } };
function parseCSV(txt){
  txt = txt.replace(/^﻿/,""); const sep = (txt.split("\n")[0].match(/;/g)||[]).length >= (txt.split("\n")[0].match(/,/g)||[]).length ? ";" : ",";
  const out=[]; let row=[], cell="", q=false;
  for (let i=0;i<txt.length;i++){ const c=txt[i];
    if (q) { if (c==='"') { if (txt[i+1]==='"') { cell+='"'; i++; } else q=false; } else cell+=c; }
    else if (c==='"') q=true; else if (c===sep) { row.push(cell); cell=""; } else if (c==="\n") { row.push(cell.replace(/\r$/,"")); out.push(row); row=[]; cell=""; } else cell+=c; }
  if (cell || row.length) { row.push(cell); out.push(row); }
  return out;
}

/* ===================== PASO 4 · TOGGLES ===================== */
function renderToggles(){
  $("#toggles").innerHTML = orderedSections().map(s=>`<label class="toggle"><input type="checkbox" data-sec="${s.id}" ${S.disabled.includes(s.id)?"":"checked"}> ${esc(s.title.replace("Formación continua — ","Formación · ").replace(" en el sector productivo (Diseño)"," productiva"))}<span class="n">${visibleRows(s).rows.length}/${s.rows.length}</span></label>`).join("");
}
$("#toggles").onchange = e => { const id = e.target.dataset.sec; S.disabled = e.target.checked ? S.disabled.filter(x=>x!==id) : [...S.disabled, id]; renderSheet(); save(); };
$("#optSensitive").onchange = e => { S.sensitive = e.target.checked; renderSheet(); save(); };
$("#optCodes").onchange = e => { S.codes = e.target.checked; renderSheet(); save(); };

/* ===================== PASO 5 · EVIDENCIAS ===================== */
const NAME_RE = /^(\d{2}[a-z]?-\d{2})_\d{4}(-\d{2}-\d{2})?_[A-Za-z0-9-]+_[A-Za-z0-9-]+\.(pdf|jpe?g|png)$/i;
const CODE_RE = /^([0-9a-z]{2,3}-\d{2})(?=[_.\s-])/i;
function allItems(){ return D().sections.flatMap(s => s.rows.map((cells,i)=>({s, code:codeOf(s,i), cells}))); }
function ingest(list){
  files.forEach(f=>URL.revokeObjectURL(f.url)); files.clear(); extra = [];
  const codes = new Set(allItems().map(x=>x.code));
  for (const file of list) {
    if (!/\.(pdf|jpe?g|png)$/i.test(file.name)) continue;
    const m = file.name.match(CODE_RE), code = m && m[1].toLowerCase();
    if (code && codes.has(code) && !files.has(code)) files.set(code, {name:file.name, file, url:URL.createObjectURL(file), ok:NAME_RE.test(file.name)});
    else extra.push(file.name);
  }
  renderEvidence(); renderSheet();
}
function renderEvidence(){
  let g=0,y=0,r=0,web=0, html="";
  for (const it of allItems()) {
    const f = files.get(it.code); let st; if (f&&f.ok){g++;st="g"} else if (f){y++;st="y"} else {r++;st="r"}
    const lab = it.s.kind==="exp" ? it.cells[2] : it.cells[1], u = it.cells[4]; if (u) web++;
    html += `<tr><td><span class="dot ${st}"></span><code>${it.code}</code></td><td>${esc(String(lab).length>56?String(lab).slice(0,54)+"…":lab)}${u?` <a href="${esc(u)}" target="_blank" rel="noopener" title="Ver certificado" data-vt="${esc(lab)}" data-vs="${esc(it.s.title+" · "+it.cells[0])}" data-vc="${it.code}">🔗</a>`:""}</td><td>${f?esc(f.name)+(f.ok?"":" <i style='color:var(--amber)'>· nombre no estándar</i>"):`<span style="color:var(--muted)">sugerido: <code>${esc(suggested(it.s,it))}</code></span>`}</td></tr>`;
  }
  $("#evBody").innerHTML = html;
  $("#evSummary").innerHTML = (files.size||extra.length ? `<span><span class="dot g"></span>${g} archivos enlazados</span><span><span class="dot y"></span>${y} nombre no estándar</span><span><span class="dot r"></span>${r} faltantes</span>` : `<span><span class="dot r"></span>Sin carpeta cargada · ${r} ítems esperan archivo</span>`)
    + `<span>🔗 ${web} de ${allItems().length} con certificado en línea</span>`;
  $("#evExtra").innerHTML = extra.length ? `<p style="margin-top:12px;font-size:.82rem"><b>${extra.length} archivo(s) sin código reconocido:</b> ${extra.slice(0,12).map(n=>`<code>${esc(n)}</code>`).join(" ")}${extra.length>12?" …":""}</p>` : "";
}
async function readEntries(entry, out){
  if (entry.isFile) return new Promise(res=>entry.file(f=>{out.push(f);res()},res));
  if (entry.isDirectory) { const rd = entry.createReader(); let b; do { b = await new Promise(res=>rd.readEntries(res,()=>res([]))); for (const x of b) await readEntries(x,out); } while (b.length); }
}
const drop = $("#drop");
["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("over")}));
["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("over")}));
drop.addEventListener("drop", async e => { const out=[]; const its=[...e.dataTransfer.items].map(i=>i.webkitGetAsEntry&&i.webkitGetAsEntry()).filter(Boolean); if (its.length) { for (const it of its) await readEntries(it,out); } else out.push(...e.dataTransfer.files); ingest(out); });
$("#folderInput").onchange = e => ingest(e.target.files);

/* ===================== PASO 6 · EXPORTAR ===================== */
function download(blob,name){ const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }

$("#pdfBtn").onclick = () => { say("Elige «Guardar como PDF», tamaño A4, y activa «Gráficos de fondo» para conservar los colores del diseño."); const t=document.title; document.title = outName("pdf").replace(".pdf",""); window.print(); document.title = t; };

function toMarkdown(){
  const doc = S.mode==="doc"; let md = `# ${D().personal.nombre}\n\n**${titular()}**  \n_Currículum Vitae · ${doc?"Documentado":"No documentado"} · ${tpl().name} · ${stamp()}_\n\n`;
  if (S.photo && D().foto) md += `![Foto](foto.jpg)\n\n`;
  if (perfil()) md += `## Perfil profesional\n\n${perfil()}\n\n`;
  md += `## Datos personales\n\n` + personalFields().map(c=>`- **${c[0]}:** ${c[3] ? `[${c[1]}](${c[3]})` : c[1]}`).join("\n") + "\n";
  const soc = socialList().filter(x=>x[1]);
  if (soc.length && (S.socialMode||"full") !== "off") md += soc.map(([n,v])=>`- **${(NETS[n]||NETS.otro).label}:** [${socialHandle(socialUrl(n,v))}](${socialUrl(n,v)})`).join("\n") + "\n";
  md += "\n";
  for (const s of activeSections()) {
    if (s.kind === "pub") {
      const R = D().research || {}, { rows } = visibleRows(s);
      md += `## ${s.title}\n\n` + (R.lines ? `**Líneas de investigación:** ${R.lines}\n\n` : "") + (R.skills ? `**Habilidades de investigación:** ${R.skills}\n\n` : "");
      md += rows.map((r,i)=>`${i+1}. ${apaText(r.cells, true)}${r.cells[3] ? ` — _${r.cells[3]}${r.cells[7] ? "; " + r.cells[7] : ""}_` : ""}${S.codes ? ` \`${r.code}\`` : ""}`).join("\n") + "\n\n";
      continue;
    }
    const {rows, hidden} = visibleRows(s), nc = show4(s) ? 4 : 3, cols = colsOf(s).slice(0, nc);
    md += `## ${s.title}\n\n| ${S.codes?"Cód. | ":""}${cols.join(" | ")} | ${doc?"Sustento":"Evidencia"} |\n|${S.codes?"---|":""}${cols.map(()=>"---").join("|")}|---|\n`;
    md += rows.map(r=>`| ${S.codes?r.code+" | ":""}${r.cells.slice(0,nc).map(c=>String(c).replace(/\|/g,"/")).join(" | ")} | ${doc ? `Anexo ${r.code}${urlOf(r)?` · [en línea](${urlOf(r)})`:""}` : `[Ver certificado](${urlOf(r) || encodeURI(relPath(s,r))})`} |`).join("\n") + "\n";
    if (hidden) md += `\n_+ ${hidden} ítem(s) adicionales en la carpeta de evidencias._\n`;
    md += "\n";
  }
  if (filterNote()) md += `> ${filterNote()}\n`;
  md += brandFileNote("x.md");   /* firma del aplicativo: d3magindesign 2026 · Mg. Mario Quiroz Martínez */
  return md;
}
$("#mdBtn").onclick = () => { download(new Blob([toMarkdown()],{type:"text/markdown"}), outName("md")); say("Markdown generado." + (S.photo&&D().foto?" La foto se referencia como foto.jpg: guárdala junto al .md.":"")); };

$("#csvBtn").onclick = () => {
  const q = v => `"${String(v??"").replace(/"/g,'""')}"`;
  const lines = [["codigo","seccion","tipo","año","tema","institucion","horas","enlace","carpeta","archivo_sugerido","autores","doi","indexacion","volumen_paginas"].join(";")];
  for (const s of orderedSections()) s.rows.forEach((cells,i)=>{ const r={code:codeOf(s,i),cells}; lines.push([r.code,s.title,s.kind,...cells.slice(0,4),cells[4]||"",s.folder,suggested(s,r),cells[5]||"",cells[6]||"",cells[7]||"",cells[8]||""].map(q).join(";")); });
  download(new Blob(["﻿"+lines.join("\r\n")],{type:"text/csv"}), outName("csv"));
  say("CSV generado con todas las filas. Puedes editarlo en Excel y reimportarlo en el editor (Paso 3).");
};

$("#docxBtn").onclick = async () => {
  if (!window.docx) return say("No se pudo cargar la librería de Word (se necesita internet la primera vez).");
  const X = window.docx, doc = S.mode==="doc", t = tpl(), A = acc().replace("#",""), F = t.docFont;
  const run = (text,o={}) => new X.TextRun({text:String(text??""),font:F,size:o.size||19,bold:o.bold,italics:o.it,color:o.color});
  const para = (runs,o={}) => new X.Paragraph({children:runs,spacing:{after:o.after??60,before:o.before??0},alignment:o.align,heading:o.heading,border:o.border,shading:o.shading,indent:o.indent});
  const H = (text) => para([run(t.rows==="list"&&S.tpl==="creativo"?` ${text} `:text,{bold:true,size:22,color:S.tpl==="creativo"?"FFFFFF":A})],{heading:X.HeadingLevel.HEADING_1,before:260,after:100,
    border: S.tpl==="creativo"?undefined:{bottom:{style:S.tpl==="clasico"?X.BorderStyle.DOUBLE:X.BorderStyle.SINGLE,size:6,color:A,space:2}},
    shading: S.tpl==="creativo"?{fill:A,type:X.ShadingType.CLEAR,color:"auto"}:(S.tpl==="academico"?{fill:"E8EDF3",type:X.ShadingType.CLEAR,color:"auto"}:undefined)});
  const kids = [];
  if (S.tpl==="academico") kids.push(para([run("CURRÍCULUM VITAE",{bold:true,size:26,color:A})],{align:X.AlignmentType.CENTER,after:200}));
  if (S.photo && D().foto) {
    const ph = await framedPhotoPng();                                 // foto con la forma y el marco elegidos
    if (ph) kids.push(para([new X.ImageRun({data:ph.bytes,transformation:{width:ph.w,height:ph.h}})],{align:S.tpl==="clasico"?X.AlignmentType.RIGHT:X.AlignmentType.LEFT,after:100}));
  }
  /* Marca profesional: arriba → encabezado; abajo → pie; marca de agua → encabezado centrado; junto al nombre → cuerpo */
  const bpng = await brandPng().catch(()=>null), bpos = B().pos;
  const bAlign = p => p.endsWith("l") ? X.AlignmentType.LEFT : p.endsWith("r") ? X.AlignmentType.RIGHT : X.AlignmentType.CENTER;
  const bImg = () => new X.ImageRun({data:bpng.bytes, transformation: bpos==="wm" ? {width:bpng.w*2, height:bpng.h*2} : {width:bpng.w, height:bpng.h}});
  kids.push(para([run(S.tpl==="clasico"?D().personal.nombre.toUpperCase():D().personal.nombre,{bold:true,size:S.tpl==="creativo"?52:40,color:S.tpl==="academico"?"1B2430":A})],{heading:X.HeadingLevel.TITLE,after:40}));
  if (bpng && bpos==="name") kids.push(para([bImg()],{after:60}));
  kids.push(para([run(titular(),{size:22,color:"5D6878"}), run(`   ·   ${doc?"DOCUMENTADO":"NO DOCUMENTADO"}`,{size:16,bold:true,color:A})],{after:200}));
  if (perfil()) { kids.push(H("Perfil profesional")); kids.push(para([run(perfil(),{size:20})],{align:X.AlignmentType.JUSTIFIED,after:120,
    border:S.tpl==="ejecutivo"?{left:{style:X.BorderStyle.SINGLE,size:24,color:A,space:8}}:undefined, indent:S.tpl==="ejecutivo"?{left:200}:undefined})); }
  let n = 1;
  kids.push(H(`${n++}. Datos personales`));
  personalFields().forEach(c=>kids.push(para([run(c[0]+": ",{bold:true,color:A}), c[3] ? new X.ExternalHyperlink({link:c[3],children:[new X.TextRun({text:c[1],style:"Hyperlink",font:F,size:19})]}) : run(c[1])],{after:30})));
  /* Redes sociales y perfiles */
  const socs = socialList().filter(x=>x[1]);
  if (socs.length && (S.socialMode||"full") !== "off") kids.push(para([run("Redes y perfiles: ",{bold:true,color:A}),
    ...socs.flatMap(([nt,v],i)=>{ const nn = NETS[nt]||NETS.otro, u = socialUrl(nt,v);
      return [...(i?[run("  ·  ",{color:"9AA6B6"})]:[]), run(nn.label+" ",{size:17,bold:true}), new X.ExternalHyperlink({link:u,children:[new X.TextRun({text:socialHandle(u),style:"Hyperlink",font:F,size:17})]})]; })],{after:60}));
  const borders = S.tpl==="clasico"||S.tpl==="academico" ? undefined : {top:{style:X.BorderStyle.NONE},left:{style:X.BorderStyle.NONE},right:{style:X.BorderStyle.NONE},insideVertical:{style:X.BorderStyle.NONE},bottom:{style:X.BorderStyle.SINGLE,size:4,color:"E3E7EC"},insideHorizontal:{style:X.BorderStyle.SINGLE,size:4,color:"E3E7EC"}};
  for (const s of activeSections()) {
    kids.push(H(`${n++}. ${s.title}`));
    if (s.kind === "pub") {                                            // publicaciones en APA 7 con DOI enlazado
      const R = D().research || {}, pm = pubMetrics();
      if (R.lines) kids.push(para([run("Líneas de investigación: ",{bold:true,color:A}), run(R.lines.replace(/\s*;\s*/g," · "))],{after:40}));
      if (R.skills) kids.push(para([run("Habilidades de investigación: ",{bold:true,color:A}), run(R.skills.replace(/\s*;\s*/g," · "))],{after:40}));
      kids.push(para([run(`${pm.total} publicación(es) · ${pm.articles} artículo(s) · ${pm.doi} con DOI${pm.indexed?` · ${pm.indexed} indexada(s)`:""}`,{it:true,size:17,color:"5D6878"})],{after:80}));
      visibleRows(s).rows.forEach((r,i)=>{ const p = apaParts(r.cells), me = myName();
        const au = p.autor || D().personal.nombre, k = au.toLowerCase().indexOf(String(me).toLowerCase());
        const auRuns = k >= 0 ? [run(au.slice(0,k)), run(au.slice(k, k+me.length),{bold:true}), run(au.slice(k+me.length))] : [run(au)];
        kids.push(new X.Paragraph({spacing:{after:80}, indent:{left:440, hanging:440}, children:[
          run(`${i+1}.  `,{bold:true,color:A}), ...auRuns, run(` (${p.year}). `), run(p.title + ". ",{it:p.book}), run(p.cont,{it:!p.book}),
          run(p.vol ? (p.book ? ` (${p.vol}).` : `, ${p.vol}.`) : "."),
          ...(p.doi ? [run(" "), new X.ExternalHyperlink({link:p.doi,children:[new X.TextRun({text:p.doi,style:"Hyperlink",font:F,size:19})]})] : []),
          run(`   [${[r.cells[3], r.cells[7]].filter(Boolean).join(" · ")}${S.codes?" · "+r.code:""}]`,{size:15,color:"5D6878"})]}));
      });
      continue;
    }
    const {rows, hidden} = visibleRows(s), nc = show4(s) ? 4 : 3, cols = colsOf(s).slice(0, nc);
    const hl = (link,text) => new X.ExternalHyperlink({link,children:[new X.TextRun({text,style:"Hyperlink",font:F,size:16})]});
    const evRuns = r => doc ? [run(`Anexo ${r.code}`,{size:16}), ...(urlOf(r)?[run(" · ",{size:16}), hl(urlOf(r),"en línea")]:[])] : [hl(urlOf(r) || relPath(s,r), "(Ver certificado)")];
    if (t.rows === "list") {
      rows.forEach(r=>{ const [a,b,c]=r.cells, d = nc===4 ? r.cells[3] : "", main = s.kind==="exp"?c:b, sub = s.kind==="exp"?`${b}${d&&d!=="—"?" · "+d:""}`:`${c}${d&&d!=="—"?" · "+d:""}`;
        kids.push(para([run(`${a}${S.codes?"  ["+r.code+"]":""}   `,{bold:true,color:A}),run(main,{bold:true})],{after:0,before:80}));
        kids.push(new X.Paragraph({children:[run(sub+"   ",{size:17,color:"5D6878"}),...evRuns(r)],indent:{left:360},spacing:{after:40}})); });
    } else {
      const hdr = [...(S.codes?["Cód."]:[]), ...cols, doc?"Sustento":"Evidencia"];
      const W = nc===4 ? (S.codes?[7,8,30,33,10,12]:[9,32,35,11,13]) : (S.codes?[7,8,36,35,14]:[9,40,37,14]);
      const cell = (children,w,head) => new X.TableCell({children,width:{size:w,type:X.WidthType.PERCENTAGE},shading:head?{fill:S.tpl==="academico"?"F1F3F6":"EDF1F6",type:X.ShadingType.CLEAR,color:"auto"}:undefined,margins:{top:50,bottom:50,left:70,right:70}});
      const trs = [new X.TableRow({tableHeader:true,children:hdr.map((h,i)=>cell([para([run(h,{bold:true,size:16,color:S.tpl==="academico"?"1B2430":A})],{after:0})],W[i],true))})];
      rows.forEach(r=>{ const vals=[...(S.codes?[r.code]:[]),...r.cells.slice(0,nc)];
        trs.push(new X.TableRow({cantSplit:true,children:[...vals.map((v,i)=>cell([para([run(v,{size:17})],{after:0})],W[i])), cell([new X.Paragraph({children:evRuns(r)})],W[W.length-1])]})); });
      kids.push(new X.Table({width:{size:100,type:X.WidthType.PERCENTAGE},rows:trs,borders}));
    }
    if (hidden) kids.push(para([run(`+ ${hidden} ítem(s) adicionales en la carpeta de evidencias.`,{it:true,size:16,color:"5D6878"})],{before:60}));
  }
  const pageNo = new X.Paragraph({tabStops:[{type:X.TabStopType.RIGHT,position:9026}],children:[
    new X.TextRun({text:BRAND_SIG,font:F,size:13,italics:true,color:"5D6878"}),
    new X.TextRun({text:"\t\t",font:F,size:13,color:"5D6878"}),
    run(`${stamp()} · Pág. `,{size:15,color:"5D6878"}),new X.TextRun({children:[X.PageNumber.CURRENT],font:F,size:15,color:"5D6878"})]});
  const inBottom = bpng && bpos[0]==="b", inTop = bpng && (bpos[0]==="t" || bpos==="wm");
  const footer = new X.Footer({children: inBottom ? [new X.Paragraph({alignment:bAlign(bpos),children:[bImg()]}), pageNo] : [pageNo]});
  const header = inTop ? new X.Header({children:[new X.Paragraph({alignment: bpos==="wm" ? X.AlignmentType.CENTER : bAlign(bpos), children:[bImg()]})]}) : undefined;
  const docx = new X.Document({creator:D().personal.nombre,title:"Currículum Vitae",styles:{default:{document:{run:{font:F}}}},
    sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1250,right:1250}}},footers:{default:footer},...(header?{headers:{default:header}}:{}),children:kids}]});
  download(await X.Packer.toBlob(docx), outName("docx"));
  say(`Word generado con el diseño «${t.name}»: ${outName("docx")}`);
};

/* ----- Prompt de redacción ----- */
function buildPrompt(goal){
  const t = tpl(), l = lvl(), doc = S.mode==="doc", n = limitN();
  const goals = {
    full: "Redacta el currículum vitae completo, listo para maquetar, a partir de los datos de abajo.",
    perfil: "Redacta solo: (1) tres opciones de titular profesional de 6 a 12 palabras y (2) tres versiones del perfil profesional de 60 a 90 palabras cada una. No reescribas las tablas.",
    logros: "Reescribe cada fila de las secciones de experiencia como 1 o 2 viñetas de logro (verbo de acción en pasado + qué + para quién + resultado o alcance). No inventes cifras: si falta un dato, márcalo como [completar].",
    adaptar: "Adapta el currículum a la convocatoria que aparece al final: prioriza y reordena los ítems pertinentes, ajusta el titular y el perfil a los requisitos y lista al final los requisitos que el CV no acredita."
  };
  let p = `# Rol\nActúa como redactor profesional de currículums para el mercado peruano (sector público y educación superior), experto en formatos SERVIR, CTI Vitae y concursos docentes del MINEDU.\n\n`;
  p += `# Tarea\n${goals[goal]}\n\n`;
  p += `# Parámetros de diseño\n- **Formato elegido:** ${t.name}. ${t.hint}\n- **Nivel profesional:** ${l.name}. Extensión objetivo: ${l.pages} páginas A4.\n- **Titular base:** ${titular()}\n- **Modalidad:** ${doc ? "Documentado: conserva TODOS los ítems y el código de cada uno (p. ej. 03b-05), porque remiten a anexos foliados. No resumas ni fusiones filas." : `No documentado: ${n?`muestra como máximo ${n} ítems por sección de cursos (los más recientes y pertinentes al nivel)`:"puedes mostrar todos los ítems"}. Cada fila termina con «(Ver certificado)».`}\n- **Foto:** ${S.photo && D().foto ? `sí, ubicada según el diseño (${t.photo==="circle"?"circular":t.photo==="square"?"cuadrada":"tipo carné 3×4"}).` : "no incluir."}\n- **Color de acento:** ${acc()}.\n- **Filtros de contenido:** ${filterLabel() || "ninguno (todos los registros)"}. Los datos de abajo ya vienen filtrados; no agregues registros excluidos.\n- **Años de experiencia (registro completo, úsalos tal cual en el perfil):** ${(()=>{const m=metrics();return `${m.docencia} años en docencia superior (desde ${m.docenciaDesde}); ${m.diseno} años de experiencia profesional (desde ${m.experienciaDesde}); ${m.titulado} años desde el primer título (${m.tituladoDesde}); ${fmtN(m.horas)} h de capacitación acumuladas.`})()}\n- **Datos sensibles (DNI, domicilio):** ${S.sensitive ? "incluir." : "omitir."}\n\n`;
  p += `# Estructura y orden de secciones\n0. Encabezado (nombre, titular${S.photo&&D().foto?", foto":""})\n0. Perfil profesional\n1. Datos personales\n` + activeSections().map((s,i)=>`${i+2}. ${s.title}`).join("\n") + "\n\n";
  p += `# Reglas de redacción\n- Español formal de Perú, tercera persona implícita (sin «yo»), sin adjetivos vacíos («proactivo», «apasionado»).\n- Orden cronológico descendente dentro de cada sección.\n- Fechas en formato dd/mm/aaaa; horas como «120 h»; créditos como «25 créd.».\n- Nombres oficiales de instituciones; las siglas se desarrollan la primera vez (p. ej. IESTP = Instituto de Educación Superior Tecnológico Público).\n- Corrige erratas de origen sin alterar datos (resoluciones, códigos, registros).\n- ${t.rows==="list" ? "Las secciones van en LISTA: año en negrita, cargo o curso en negrita y la institución, fecha y horas en una segunda línea." : "Las secciones van en TABLAS de 4 columnas: " + COLS.edu.join(" · ") + " (formación) o " + COLS.exp.join(" · ") + " (experiencia)."}\n- Publicaciones científicas: cita cada una en APA 7 (Autor, A. A. (Año). Título. *Revista*, vol(núm.), págs. https://doi.org/…), con el DOI como enlace, e indica el tipo y la indexación. Destaca las líneas y habilidades de investigación. No inventes DOI, indexaciones ni coautores.\n- Conserva TODOS los hipervínculos de los datos (certificados en Google Drive, registro SUNEDU, ORCID, correo) como enlaces activos sobre el texto «(Ver certificado)» o el dato correspondiente.\n- No inventes información. Lo que falte va como [completar].\n\n`;
  p += `# Formato de salida\nEntrega el resultado en Markdown (encabezados ## por sección y tablas o listas según el diseño), listo para pegar en Word o en CV Studio. Al final añade una lista breve de «Sugerencias de mejora» (máx. 5).\n\n`;
  p += `# Datos del candidato\n\n${toMarkdown()}`;
  if (goal === "adaptar") p += `\n# Convocatoria\n${$("#convText").value.trim() || "[Pega aquí el texto de la convocatoria]"}\n`;
  return p;
}
const dlg = $("#promptDlg");
const refreshPrompt = () => { $("#convWrap").style.display = $("#promptGoal").value==="adaptar" ? "block" : "none"; $("#promptText").value = buildPrompt($("#promptGoal").value); };
$("#promptBtn").onclick = () => { refreshPrompt(); dlg.showModal(); };
$("#convText").oninput = refreshPrompt;
$("#dlgClose").onclick = () => dlg.close();
$("#promptCopy").onclick = async () => { try { await navigator.clipboard.writeText($("#promptText").value); $("#promptCopy").textContent = "✓ Copiado"; } catch(_) { $("#promptText").select(); document.execCommand("copy"); $("#promptCopy").textContent = "✓ Copiado"; } setTimeout(()=>$("#promptCopy").textContent="⧉ Copiar prompt",1800); };
$("#promptMd").onclick = () => download(new Blob([$("#promptText").value],{type:"text/markdown"}), `Prompt_CV_${S.tpl}_${S.level}_${$("#promptGoal").value}.md`);

/* ----- Anexos (documentado) ----- */
$("#annexBtn").onclick = async () => {
  if (!window.PDFLib) return say("No se pudo cargar pdf-lib (se necesita internet la primera vez).");
  if (!files.size) return say("Primero adjunta la carpeta de evidencias (Paso 5).");
  const {PDFDocument,StandardFonts,rgb} = PDFLib; say("Compilando anexos…");
  const out = await PDFDocument.create(), font = await out.embedFont(StandardFonts.Helvetica), bold = await out.embedFont(StandardFonts.HelveticaBold);
  const A4=[595.28,841.89], skipped=[], hx = acc().match(/\w\w/g).map(h=>parseInt(h,16)/255), C = rgb(...hx);
  let k = 1;
  for (const s of activeSections()) {
    const items = visibleRows(s).rows.filter(r=>files.has(r.code)); k++; if (!items.length) continue;
    const sep = out.addPage(A4); sep.drawRectangle({x:0,y:0,width:A4[0],height:A4[1],color:C});
    sep.drawText(`ANEXO ${k}`,{x:60,y:470,size:16,font:bold,color:rgb(1,1,1),opacity:.75});
    wrap(clean(s.title),30).forEach((ln,i)=>sep.drawText(ln,{x:60,y:430-i*34,size:28,font:bold,color:rgb(1,1,1)}));
    sep.drawText(clean(`${items.length} documento(s) · ${D().personal.nombre}`),{x:60,y:330,size:11,font,color:rgb(1,1,1),opacity:.85});
    for (const r of items) {
      const f = files.get(r.code), bytes = await f.file.arrayBuffer(), first = out.getPageCount();
      try {
        if (/\.pdf$/i.test(f.name)) { const src = await PDFDocument.load(bytes,{ignoreEncryption:true}); (await out.copyPages(src,src.getPageIndices())).forEach(p=>out.addPage(p)); }
        else { const img = /\.png$/i.test(f.name) ? await out.embedPng(bytes) : await out.embedJpg(bytes); const pg = out.addPage(A4), sc = Math.min((A4[0]-60)/img.width,(A4[1]-90)/img.height);
          pg.drawImage(img,{x:(A4[0]-img.width*sc)/2,y:(A4[1]-img.height*sc)/2,width:img.width*sc,height:img.height*sc}); }
        const p = out.getPage(first), {width,height} = p.getSize();
        p.drawRectangle({x:width-112,y:height-34,width:96,height:20,color:rgb(1,1,1),opacity:.85});
        p.drawText("Anexo "+r.code,{x:width-104,y:height-28,size:10,font:bold,color:C});
      } catch(_) { skipped.push(f.name); }
    }
  }
  const N = out.getPageCount();
  out.getPages().forEach((p,i)=>{ const {width}=p.getSize(), t=`Folio ${String(i+1).padStart(3,"0")} de ${N}`; p.drawText(t,{x:width-font.widthOfTextAtSize(t,9)-24,y:16,size:9,font,color:rgb(.35,.4,.47)}); });
  download(new Blob([await out.save()],{type:"application/pdf"}), `Anexos_${userSlug()}_${new Date().getFullYear()}.pdf`);
  say(`Anexos compilados: ${N} folios.` + (skipped.length?` No se pudieron leer: ${skipped.join(", ")}`:""));
};
const clean = s => String(s).replace(/[«»]/g,'"').replace(/[–—]/g,"-").replace(/[^\x00-\xFF]/g,"");
function wrap(t,max){ const w=t.split(" "),o=[]; let l=""; for (const x of w){ if ((l+" "+x).trim().length>max){o.push(l);l=x} else l=(l+" "+x).trim(); } if (l) o.push(l); return o; }

/* ===================== INIT ===================== */
function refreshAll(){
  applyCol4Defaults(S.data); migrateResearch(S);
  $("#optCodes").checked = S.codes;
  renderDesign(); renderEditor(); renderToggles(); renderEvidence(); setMode(S.mode); $("#optSensitive").checked = S.sensitive;
}
$$("[data-go]").forEach(b=>b.onclick=()=>setMode(b.dataset.go,true));
$$(".mode").forEach(el=>el.onclick=()=>setMode(el.dataset.mode));
$("#abSave").onclick = saveNow;
$("#abUpdate").onclick = updateDoc;
$("#abSaveAs").onclick = saveAsFile;
$("#abDiscard").onclick = () => {
  if (!dirty) return setStatus("saved", "No hay cambios por descartar");
  if (!confirm("¿Descartar los cambios sin guardar y volver a la última versión guardada?")) return;
  try { const saved = JSON.parse(localStorage.getItem(KEY)); S = saved && saved.data ? Object.assign(defaults(), saved) : defaults(); } catch(_) { S = defaults(); }
  if (S.linksV !== LINKS_V) { applyLinks(S.data); S.linksV = LINKS_V; }
  localStorage.removeItem(DRAFT); booting = true; refreshAll(); booting = false; dirty = false; setStatus("saved", "Cambios descartados");
};
(function init(){
  let recovered = false;
  try {
    const d = localStorage.getItem(DRAFT);
    if (d && d !== localStorage.getItem(KEY) && confirm("Hay cambios sin guardar de tu sesión anterior. ¿Quieres recuperarlos?")) { S = Object.assign(defaults(), JSON.parse(d)); recovered = true; }
    else if (d) localStorage.removeItem(DRAFT);
  } catch(_) {}
  const sens = S.sensitive; refreshAll(); S.sensitive = sens; $("#optSensitive").checked = sens; renderSheet();
  /* Capa didáctica (guide.js): tira de ejemplos, progreso, modales y recorrido guiado */
  if (typeof bootGuide === "function") bootGuide();
  booting = false;
  if (recovered) { dirty = true; setStatus("dirty", "Cambios recuperados: pulsa Guardar"); }
  else setStatus("saved", localStorage.getItem(KEY) ? "Todo guardado en este navegador" : "Datos iniciales · pulsa 💾 Guardar para conservarlos en este navegador");
})();
