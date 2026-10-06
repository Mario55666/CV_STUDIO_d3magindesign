/* CV Studio — Importar y exportar datos · © 2026 d3magindesign · Mg. Mario Quiroz Martínez
   ---------------------------------------------------------------------------
   Lee un currículum en Word (.docx), un texto pegado o un respaldo .json y
   PROPONE cómo llenar el formulario. Nada se aplica sin que la persona lo revise
   y confirme en pantalla.

   Todo el proceso ocurre en el navegador del usuario: el archivo no se envía a
   ningún servidor ni se guarda en el repositorio donde está publicada la página.
   --------------------------------------------------------------------------- */

/* Estado de los diálogos. Se declara arriba a propósito: app.js llama a
   bootImportar() al terminar, y para entonces estas variables ya deben existir
   (si se declararan al final del archivo, se accedería a ellas antes de tiempo). */
let dlgImp = null, propuesta = null;

/* ===================== 1. LECTURA DE ARCHIVOS ===================== */
const XESC = s => String(s || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&amp;/g, "&");
const emojiMap = txt => String(txt || "")
  .replace(/[\u{1F300}-\u{1FAFF}\u{2700}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu, " ")
  .replace(/[•▪◦●○►▶☐☑✔✓★☆]/g, " ").replace(/\s+/g, " ").trim();

/* --- ZIP: extrae una entrada del .docx con DecompressionStream("deflate-raw").
   Cada entrada empieza con su CABECERA LOCAL (no la de disco central):
   0 firma · 8 método · 14 CRC · 18 tamaño comprimido · 22 tamaño real · 26 largo del nombre · 28 largo del extra --- */
function zipRead(buf, wanted){
  const u8 = new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  if (u8.length < 34 || dv.getUint32(0, true) !== 0x04034b50) return null;
  const metodo = dv.getUint16(8, true), compLen = dv.getUint32(18, true), realLen = dv.getUint32(22, true);
  const nameLen = dv.getUint16(26, true), extraLen = dv.getUint16(28, true);
  const nombre = new TextDecoder().decode(u8.subarray(30, 30 + nameLen));
  if (nombre === wanted) {
    const inicio = 30 + nameLen + extraLen;
    if (metodo === 0) return Promise.resolve(u8.slice(inicio, inicio + realLen).buffer);        /* sin comprimir */
    if (metodo !== 8) return Promise.reject(new Error(`El .docx usa un método de compresión no soportado (${metodo}). Vuelve a guardarlo desde Word.`));
    if (typeof DecompressionStream !== "function") return Promise.reject(new Error("Este navegador no puede descomprimir .docx: usa «pegar texto»."));
    const data = u8.slice(inicio, inicio + compLen);
    return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer();
  }
  const siguiente = 30 + nameLen + extraLen + compLen;
  return siguiente > 30 && siguiente < u8.length ? zipRead(u8.slice(siguiente).buffer, wanted) : null;
}
/* --- DOCX → líneas de texto (párrafos y celdas de tabla, en orden) --- */
async function docxLines(buf){
  const xmlBuf = await zipRead(buf, "word/document.xml");
  if (!xmlBuf) throw new Error("El archivo no parece un .docx válido (falta word/document.xml). Si es un .doc antiguo, ábrelo en Word y guárdalo como .docx.");
  const xml = new TextDecoder().decode(xmlBuf);
  const out = [];
  /* Bloques en orden de aparición: cada <w:p> es un párrafo (o una celda) */
  for (const blk of xml.split(/<w:p[ >]/).slice(1)) {
    const t = [...blk.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map(m => XESC(m[1])).join("");
    const linea = emojiMap(t.replace(/\s+/g, " "));
    if (linea) out.push(linea);
  }
  return out;
}

/* ===================== 2. RECONOCIMIENTO DEL TEXTO ===================== */
const RX = {
  correo: /[\w.+-]+@[\w-]+\.[\w.]{2,}/,
  celular: /(?:\+?51[\s-]?)?(9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|\d{3}[\s.-]\d{3}[\s.-]\d{3})/,
  dni: /\b(?:DNI|documento(?:\s+de\s+identidad)?|d\.?\s?i\.?)\D{0,14}(\d{8})\b/i,
  anio: /\b(19|20)\d{2}\b/,
  horas: /(\d+(?:[.,]\d+)?)\s*(?:h\b|hrs?\b|horas?\b)/i,
  creditos: /(\d+(?:[.,]\d+)?)\s*cr[eé]d/i,
  rango: /\b((?:19|20)\d{2})\s*(?:[-–—/]|a|hasta)\s*((?:19|20)\d{2})?\b/i,
  fecha: /\b\d{1,2}[/-]\d{1,2}[/-](?:19|20)?\d{2}\b|\b\d{1,2}\s+de\s+[a-záéíóúñ]+\s+de\s+(?:19|20)\d{2}\b/i,
  doi: /10\.\d{4,9}\/[-._;()/:a-z0-9]+/i,
  url: /https?:\/\/[^\s,;)]+/i,
  nivelMc: /\b([ABC][12])\b/
};
/* El orden importa: «IDIOMAS» y «PRODUCCIÓN» deben evaluarse antes que las reglas
   generales de formación e informática, que contienen palabras parecidas. */
const SECCIONES_TXT = [
  ["idiomas",         /idiomas?/i],
  ["reconocimientos", /reconocimientos?|distinciones?|premios?|felicitaciones?|becas?|m[eé]ritos?/i],
  ["produccion",      /producci[oó]n(?:\s+gr[aá]fica)?|obras?|material(?:es)?\s+did[aá]ctic|portafolio/i],
  ["investigacion",   /proyectos?\s+de\s+investigaci[oó]n|fondos?\s+concursables/i],
  ["publicaciones",   /publicaciones?|investigaci[oó]n\s+(?:cient[ií]fica|publicada)|art[ií]culos?\s+cient[ií]ficos?|producci[oó]n\s+cient[ií]fica/i],
  ["capacitacion",    /capacitaci[oó]n|formaci[oó]n\s+continua|cursos?\s+y?\s*talleres|actualizaci[oó]n\s+profesional|especializaci[oó]n/i],
  ["ofimatica",       /inform[aá]tica|ofim[aá]tica|herramientas?\s+(?:digitales|inform[aá]ticas)|software|conocimientos?\s+de\s+c[oó]mputo/i],
  ["docente",         /experiencia\s+docente|docencia|actividad\s+docente/i],
  ["experiencia",     /experiencia\s+laboral|experiencia\s+profesional|trayectoria\s+laboral|antecedentes\s+laborales/i],
  ["calidad",         /gesti[oó]n|calidad|coordinaci[oó]n|cargos?\s+directivos?|acreditaci[oó]n/i],
  ["grados",          /formaci[oó]n\s+acad|grados?\s+y?\s*t[ií]tulos?|estudios\s+realizados|t[ií]tulos?\s+profesionales|formaci[oó]n\s+profesional/i],
  ["_perfil",         /perfil(?:\s+profesional)?|resumen(?:\s+profesional)?|presentaci[oó]n|sobre\s+m[ií]|objetivo(?:\s+profesional)?/i],
  ["_datos",          /datos?\s+(?:personales|generales)|informaci[oó]n\s+personal|identificaci[oó]n/i],
  ["_refs",           /referencias?(?:\s+(?:personales|laborales))?/i],
  ["_fin",            /declaraci[oó]n\s+jurada|firma|d3magindesign|cv\s+studio|nota:\s*este\s+documento/i]
];
const SECCION_TITULO = id => (D().sections.find(s => s.id === id) || {}).title || id;

/* Un encabezado de sección es una línea corta, sin dos puntos y en mayúsculas
   (o un rótulo breve de sección). Así no confundimos «Nacionalidad: Peruana»
   ni «CURRÍCULUM VITAE» con el título de una sección. */
function detectarSeccion(linea){
  const t = String(linea || "").trim();
  if (!t || t.length > 60 || /:/.test(t) || /^\d/.test(t)) return null;
  const esGrita = t === t.toUpperCase() && /[A-ZÁÉÍÓÚÑ]{3,}/.test(t);
  const esTitulo = /^[A-ZÁÉÍÓÚÑ]/.test(t) && t.split(/\s+/).length <= 5 && !/\d{4}/.test(t);
  if (!esGrita && !esTitulo) return null;
  for (const [id, re] of SECCIONES_TXT) if (re.test(t)) return id;
  return null;
}
/* Nombre: línea en mayúsculas, o 2–5 palabras capitalizadas seguidas de un dato de contacto */
function detectarNombre(lineas, correo){
  for (let i = 0; i < Math.min(lineas.length, 14); i++) {
    const t = lineas[i].replace(/curriculum vitae|currículum vitae|c\.?v\.?/gi, "").replace(/[|·•]/g, " ").trim();
    if (!t || /\d/.test(t) || correo.test(t) || t.length < 6 || t.length > 46 || /:/.test(t)) continue;
    const palabras = t.split(/\s+/).filter(Boolean);
    if (palabras.length < 2 || palabras.length > 5 || detectarSeccion(t)) continue;
    const mayus = t === t.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(t);
    const capita = palabras.filter(p => /^[A-ZÁÉÍÓÚÑ]/.test(p)).length;
    const sig = lineas[i + 1] || "";
    const esNombre = mayus || capita === palabras.length ||
      (capita >= 2 && (RX.correo.test(sig) || RX.celular.test(sig) || /licenciad|ingenier|bachiller|t[eé]cnic|mag[ií]ster|doctor|docente|especialista|correo|celular|dni/i.test(sig)));
    if (!esNombre) continue;
    return palabras.map(p => (/^[A-ZÁÉÍÓÚÑ]{2,}$/.test(p) ? p[0] + p.slice(1).toLowerCase() : p)).join(" ");
  }
  return "";
}
/* Titular: la primera frase descriptiva, saltando rótulos de datos personales */
function detectarTitular(lineas, nombre, cabeceras){
  const esCampo = /^(nacionalidad|estado\s+civil|dni|documento|domicilio|direcci[oó]n|tel[eé]fono|celular|correo|e-?mail|nacido|lugar\s+y\s+fecha|fecha\s+de\s+nac|ruc|colegiatura|registro|referencias)/i;
  for (let i = 0; i < Math.min(lineas.length, 16); i++) {
    const l = lineas[i];
    if (l === nombre || RX.correo.test(l) || RX.celular.test(l) || RX.dni.test(l)) continue;
    if (cabeceras.has(l) || detectarSeccion(l) || esCampo.test(l)) continue;
    if (/:/.test(l.slice(0, 22))) continue;
    if (l.length > 12 && l.length < 110 && /[a-záéíóúñ]{4}/.test(l) && !/^\d/.test(l)) return l;
  }
  return "";
}
const inicialesNombre = n => { const w = String(n || "").trim().split(/\s+/).filter(x => !/^(de|del|la|las|los|y)$/i.test(x)); return (w.length >= 3 ? [w[0], w[w.length - 2], w[w.length - 1]] : w).map(x => x[0] || "").join("").toUpperCase(); };

/* ===================== 3. CONSTRUCCIÓN DE LA PROPUESTA ===================== */
/* Devuelve { data, informe } sin tocar el estado actual. */
function analizarTexto(texto){
  const crudo = String(texto || "").replace(/\r/g, "\n").split("\n").flatMap(l => /[\t;|]{2,}/.test(l) && l.length > 120 ? l.split(/[\t;|]{2,}/) : [l])
    .map(l => emojiMap(l)).filter(Boolean);
  /* Quita la firma del aplicativo para no ensuciar la lectura */
  const lineas = crudo.filter(l => !/d3magindesign|cv\s*studio|kit de llenado/i.test(l));
  const texto2 = lineas.join("\n");

  const nuevo = JSON.parse(JSON.stringify(window.EMPTY_SECTIONS())).map(s => ({ ...s, rows:[] }));

  /* Índice de líneas que son encabezado de sección */
  const esSeccion = {}, cabeceras = new Set();
  lineas.forEach((l, i) => { const id = detectarSeccion(l); if (id) { esSeccion[i] = id; cabeceras.add(l); } });

  /* Reparte las líneas por sección */
  const cubos = { _intro:[] };
  let actual = "_intro";
  lineas.forEach((l, i) => {
    if (esSeccion[i]) { actual = esSeccion[i]; (cubos[actual] ||= []); return; }
    (cubos[actual] ||= []).push(l);
  });

  /* --- Datos personales --- */
  const porIdCampos = JSON.parse(JSON.stringify(window.DEFAULT_DATA.personal.campos));
  const setCampo = (clave, valor) => { const c = porIdCampos.find(x => x[0].toLowerCase().includes(clave)); if (c && valor) c[1] = valor; };
  const correo = (texto2.match(RX.correo) || [""])[0];
  const celular = (texto2.match(RX.celular) || [""])[0];
  const dni = (texto2.match(RX.dni) || [])[1] || "";
  const nombre = detectarNombre(lineas, RX.correo);
  setCampo("nombres", nombre ? nombre.split(/\s+/).slice(0, -2).join(" ") || nombre.split(/\s+/)[0] : "");
  setCampo("apellidos", nombre ? nombre.split(/\s+/).slice(-2).join(" ") : "");
  setCampo("correo", correo);
  setCampo("celular", celular);
  setCampo("documento", dni);
  const nac = lineas.find(l => /^(lugar\s+y\s+fecha\s+de\s+nac|fecha\s+de\s+nac|nacido)/i.test(l)) || "";
  if (nac) setCampo("nac", nac.replace(/^[^:]*:\s*/, ""));
  const nacio = lineas.find(l => /^nacionalidad/i.test(l)); if (nacio) setCampo("nacionalidad", nacio.replace(/^[^:]*:\s*/, ""));
  const domi = lineas.find(l => /^(domicilio|direcci[oó]n)/i.test(l)); if (domi) setCampo("domicilio", domi.replace(/^[^:]*:\s*/, ""));
  const redes = [];
  const vinc = lineas.filter(l => /(linkedin\.com|behance\.net|github\.com|orcid\.org|instagram\.com|researchgate\.net|scholar\.google|youtube\.com|x\.com)/i.test(l));
  const agregarRed = l => {
    const m = l.match(RX.url); const u = m ? m[0] : l.match(/[\w.-]+\.(?:com|net|org|pe|edu)[^\s]*/i)?.[0] || "";
    if (!u) return;
    const low = u.toLowerCase();
    const net = /linkedin/.test(low) ? "linkedin" : /behance/.test(low) ? "behance" : /github/.test(low) ? "github"
      : /orcid/.test(low) ? "orcid" : /instagram/.test(low) ? "instagram" : /researchgate/.test(low) ? "researchgate"
      : /scholar\.google/.test(low) ? "scholar" : /youtube/.test(low) ? "youtube" : /(^|\/\/|www\.)x\.com/.test(low) ? "x" : "web";
    if (!redes.some(r => r[1] === u)) redes.push([net, u]);
  };
  vinc.forEach(agregarRed);
  const urlSuelta = (texto2.match(RX.url) || [])[0];
  if (urlSuelta && !vinc.length) agregarRed(urlSuelta);

  /* --- Perfil --- */
  const perfilLineas = cubos._perfil || [];
  const perfil = perfilLineas.filter(l => l.length > 40).join(" ").slice(0, 900).trim();

  /* --- Secciones de filas --- */
  const horasDe = l => { const h = l.match(RX.horas); if (h) return `${h[1].replace(",", ".")} h`; const c = l.match(RX.creditos); if (c) return `${c[1].replace(",", ".")} créd.`; return ""; };
  const anioDe = l => { const r = l.match(RX.rango); if (r) return r[2] ? `${r[1]}–${r[2]}` : r[1]; const a = l.match(RX.anio); return a ? a[0] : ""; };
  const limpia = l => emojiMap(l.replace(RX.correo, " ").replace(RX.url, " ").replace(/\s{2,}/g, " ").replace(/^[\s:;,.\-–]+|[\s:;,.\-–]+$/g, ""));
  const nivelDe = l => { const m = l.match(RX.nivelMc); return m ? m[1] : (/avanzad/i.test(l) ? "Avanzado" : /intermedio/i.test(l) ? "Intermedio" : /b[aá]sic/i.test(l) ? "Básico" : ""); };
  const fechaDe = l => (l.match(RX.fecha) || [""])[0];

  for (const s of nuevo) {
    const cubo = cubos[s.id] || [];
    const filas = [];
    for (const l of cubo) {
      if (l.length < 6) continue;   /* descarta ruido de una o dos palabras */
      if (RX.url.test(l) && limpia(l.replace(RX.url, "")).length < 6) { if (filas.length) filas[filas.length - 1][4] = l.match(RX.url)[0]; continue; }
      if (s.id === "reconocimientos") {
        const partes = l.split(/\s*[|·–—]\s*|\s{2,}/).map(x => x.trim()).filter(Boolean);
        const anio = anioDe(l) || fechaDe(l);
        const resto = partes.filter((p, i) => !(i === 0 && /^\d{4}[–-]?\d{0,4}$/.test(p)) && p !== anio);
        filas.push([anio, resto[0] || partes[0] || l, resto.slice(1).join(" · "), anio, ""]);
        continue;
      }
      if (s.id === "publicaciones") {
        const doi = (l.match(RX.doi) || [""])[0];
        const anio = anioDe(l);
        const aut = (/^[A-ZÁÉÍÓÚÑ][^.]{2,80}\(\d{4}\)/.test(l)) ? l.split("(")[0].trim().replace(/,\s*$/, "") : "";
        let resto = l.replace(aut, "").replace(/\(\d{4}\)\.?/, "").replace(doi, "").replace(/https?:\/\/\S+/g, "").trim();
        const cita = resto.split(/\.\s+/);
        filas.push([anio, (cita[0] || resto).replace(/^\.\s*/, ""), (cita[1] || "").replace(/^\.\s*/, ""), /libro|cap[ií]tulo/i.test(l) ? "Libro" : /ponencia|congreso/i.test(l) ? "Ponencia / actas de congreso" : "Artículo científico",
          "", aut, doi, "", (cita.slice(2).join(". ") || "").slice(0, 120)]);
        continue;
      }
      const partes = l.split(/\s*[|·]\s*|\s+[–—]\s+|\s{2,}/).map(x => x.trim()).filter(Boolean);
      const a = anioDe(l);
      let b = "", c = "", d = "";
      if (s.kind === "exp") {
        b = partes[1] || "";
        c = partes.slice(2).join(" · ") || partes[1] || "";
        if (!b) { const guion = l.match(/^(.+?)\s*[:\-–]\s*(.+)$/); if (guion) { b = guion[1]; c = guion[2]; } }
        d = fechaDe(l) || (/a[ñn]os?|meses/i.test(l) ? (l.match(/\d+\s*(?:a[ñn]os?|meses)/i) || [""])[0] : "");
      } else {
        b = partes[1] || partes[0] || "";
        c = partes.slice(2).join(" · ") || partes[1] || "";
        d = s.id === "idiomas" ? nivelDe(l) : horasDe(l);
        if (s.id === "investigacion" && !d) d = horasDe(l);
        if (s.id === "produccion") d = /libro/i.test(l) ? "Libro impreso" : /manual|material/i.test(l) ? "Material didáctico" : /campa/i.test(l) ? "Campaña" : "Pieza gráfica";
      }
      filas.push([a || (!/\./.test(s.id) ? String(new Date().getFullYear()) : ""), b || limpia(l), c, d, ""]);
    }
    /* Quita filas basura (una sola palabra o solo números) */
    /* La primera parte suele ser el año: úsala como asunto solo si tiene texto propio */
    s.rows = filas.filter(f => {
      const asunto = String(f[1] || "");
      if (/^\d{1,2}\s*$/.test(asunto)) return false;
      return asunto.replace(/[^a-záéíóúñ]/gi, "").length >= 4;
    });
  }

  const conFilas = nuevo.filter(s => s.rows.length);
  const data = {
    personal: { nombre, titular:"", campos:porIdCampos, redes },
    perfil, perfilCustom: !!perfil, foto:null,
    research: { lines:"", skills:"" },
    sections: conFilas
  };
  const informe = {
    nombre, correo, celular, dni, titular:detectarTitular(lineas, nombre, cabeceras),
    secciones: conFilas.map(s => ({ id:s.id, title:s.title || SECCION_TITULO(s.id), n:s.rows.length })),
    lineas: lineas.length, perfil: perfil.length, redes: redes.length,
    avisos: []
  };
  if (informe.titular) data.personal.titular = informe.titular;
  if (!nombre) informe.avisos.push("No pude reconocer el nombre: búscalo en «Datos personales».");
  if (!conFilas.length) informe.avisos.push("No reconocí secciones con filas. Revisa que tu Word use títulos como «Experiencia laboral» o «Capacitación».");
  if (!correo) informe.avisos.push("No encontré un correo electrónico.");
  return { data, informe };
}

/* ===================== 4. RESPALDO .JSON ===================== */
function analizarJSON(obj){
  const S0 = obj && obj.data && obj.data.sections ? obj : (obj && obj.sections ? { data:obj } : null);
  if (!S0) throw new Error("El archivo no es un respaldo de CV Studio (falta «sections»).");
  const d = S0.data;
  const informe = {
    nombre: d.personal?.nombre || "", correo:"", celular:"", dni:"", titular: d.personal?.titular || "",
    secciones: (d.sections || []).map(s => ({ id:s.id, title:s.title, n:(s.rows || []).length })),
    lineas:0, perfil:(d.perfil || "").length, redes:(d.personal?.redes || []).length,
    avisos:["Este archivo es un respaldo completo: al aplicarlo se reemplazará todo el formulario, incluida la foto, el diseño y el nivel."],
    esRespaldo:true
  };
  return { data:d, informe, respaldoCompleto:S0 };
}

/* ===================== 5. AVISOS DE LA INTERFAZ ===================== */
function importAvail(){
  return typeof DecompressionStream === "function"
    ? "" : "Tu navegador no puede descomprimir .docx; usa «Pegar texto» (abre tu Word, copia todo y pégalo aquí).";
}

/* ===================== 6. DIÁLOGO «IMPORTAR DESDE WORD» ===================== */
function ensureImportDialog(){
  if (dlgImp) return;
  dlgImp = document.createElement("dialog");
  dlgImp.className = "g-dlg imp-dlg";
  dlgImp.id = "impDlg";
  dlgImp.addEventListener("click", e => {
    const t = e.target.closest("[data-imp]"); if (!t) return;
    const a = t.dataset.imp;
    if (a === "close") dlgImp.close();
    else if (a === "file") byId("impFile").click();
    else if (a === "analizar") analizarPegado();
    else if (a === "aplicar") aplicarPropuesta(false);
    else if (a === "json") descargarPropuesta();
  });
  dlgImp.addEventListener("change", e => { if (e.target.id === "impFile") leerArchivo(e.target.files[0]); });
  document.body.appendChild(dlgImp);
}
function showImport(){
  ensureImportDialog();
  propuesta = null;
  dlgImp.innerHTML = `<div class="dlg-h"><span class="gd-ic" style="background:var(--navy)">📄</span>
      <h3>Traer los datos de mi CV en Word<small>Se lee en tu navegador: el archivo no se envía a ningún servidor</small></h3>
      <button type="button" class="icon-btn" data-imp="close" aria-label="Cerrar">✕</button></div>
    <div class="dlg-b imp-body">
      <p class="imp-intro">Puedes llenar el formulario desde un <b>.docx</b> (Word) o pegando el texto de tu CV.
        Lo que se lea se te mostrará <b>antes</b> de aplicarlo, para que lo revises campo por campo.</p>
      <div class="imp-actions">
        <label class="btn btn-doc">⤒ Elegir archivo .docx<input type="file" id="impFile" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden></label>
        <button type="button" class="btn btn-ghost" data-imp="json">⤒ Restaurar un respaldo .json</button>
        <span class="imp-note" id="impNote">${esc_(importAvail())}</span>
      </div>
      <details class="imp-paste"><summary>…o pega aquí el texto de tu CV (Ctrl+V)</summary>
        <textarea id="impText" rows="8" placeholder="Pega todo el contenido de tu currículum. Los títulos de sección (EXPERIENCIA LABORAL, CAPACITACIÓN, IDIOMAS…) ayudan a clasificar cada línea."></textarea>
        <button type="button" class="btn btn-nodoc btn-sm" data-imp="analizar">🔎 Analizar el texto pegado</button></details>
      <div id="impResult"></div>
    </div>
    <div class="dlg-f"><button type="button" class="btn btn-ghost" data-imp="close">Cerrar</button></div>`;
  if (typeof dlgImp.showModal === "function") dlgImp.showModal(); else dlgImp.setAttribute("open", "");
}
async function leerArchivo(f){
  const res = byId("impResult"); if (!f) return;
  const esDocx = /\.docx$/i.test(f.name);
  const esJson = /\.json$/i.test(f.name);
  if (!esDocx && !esJson) { res.innerHTML = `<p class="imp-err">⚠ Solo puedo leer <b>.docx</b> o un respaldo <b>.json</b>. Si tu archivo es .doc (Word antiguo), ábrelo y guárdalo como .docx; si es .pdf, copia el texto y pégalo arriba.</p>`; return; }
  res.innerHTML = `<p class="imp-load">⏳ Leyendo «${esc_(f.name)}» en tu equipo…</p>`;
  try {
    if (esJson) {
      propuesta = analizarJSON(JSON.parse(await f.text()));
    } else {
      const lineas = await docxLines(await f.arrayBuffer());
      propuesta = analizarTexto(lineas.join("\n"));
      propuesta.informe.archivo = f.name;
    }
    pintarPropuesta();
  } catch (e) {
    res.innerHTML = `<p class="imp-err">⚠ ${esc_(e.message)}</p>`;
  }
}
function analizarPegado(){
  const txt = byId("impText")?.value || "";
  if (txt.trim().length < 30) { byId("impResult").innerHTML = `<p class="imp-err">⚠ Pega al menos unas líneas para poder analizarlas.</p>`; return; }
  try { propuesta = analizarTexto(txt); propuesta.informe.archivo = "texto pegado"; pintarPropuesta(); }
  catch (e) { byId("impResult").innerHTML = `<p class="imp-err">⚠ ${esc_(e.message)}</p>`; }
}
function pintarPropuesta(){
  const i = propuesta.informe, res = byId("impResult");
  const fila = (k, v) => v ? `<div class="imp-row"><span>${k}</span><b>${esc_(v)}</b></div>` : "";
  const chips = i.secciones.map(s => `<span class="imp-chip">${esc_(s.title)} <b>${s.n}</b></span>`).join("");
  res.innerHTML = `
    <div class="imp-res">
      <h4>✅ Esto es lo que encontré${i.archivo ? ` en «${esc_(i.archivo)}»` : ""}</h4>
      ${fila("Nombre", i.nombre)}${fila("Titular", i.titular)}${fila("Correo", i.correo)}${fila("Celular", i.celular)}${fila("Documento", i.dni)}
      ${i.perfil ? fila("Perfil", i.perfil + " caracteres de texto") : ""}${i.redes ? fila("Redes o enlaces", i.redes + " encontrados") : ""}
      <div class="imp-secs"><span class="imp-lab">Secciones detectadas:</span>${chips || "<i>ninguna</i>"}</div>
      ${i.avisos.length ? `<ul class="imp-warn">${i.avisos.map(a => `<li>${esc_(a)}</li>`).join("")}</ul>` : ""}
      <p class="imp-copy">Aplicar <b>reemplaza</b> el formulario actual. Si tenías algo escrito, guárdalo antes en tu biblioteca.</p>
      <div class="imp-go">
        <button type="button" class="btn btn-doc" data-imp="aplicar">✔ Aplicar al formulario</button>
        <button type="button" class="btn btn-ghost" data-imp="json" data-x="1">⤓ Guardar lo detectado en .json</button>
      </div>
    </div>`;
}
function aplicarPropuesta(){
  if (!propuesta) return;
  const i = propuesta.informe;
  if (i.esRespaldo && propuesta.respaldoCompleto && propuesta.respaldoCompleto.data) {
    S.data = JSON.parse(JSON.stringify(propuesta.respaldoCompleto.data));
    const st = propuesta.respaldoCompleto;
    if (st.tpl) S.tpl = st.tpl; if (st.level) S.level = st.level; if (st.acc) S.acc = st.acc;
    if (st.limit) S.limit = st.limit; if (typeof st.photo === "boolean") S.photo = st.photo;
    applyLinks(S.data); applyCol4Defaults(S.data); migrateResearch(S);
  } else {
    const d = propuesta.data;
    S.data = d;
    S.data.sections.forEach(s => { if (!s.folder) s.folder = (window.EMPTY_SECTIONS().find(x => x.id === s.id) || {}).folder || "99_Otros"; });
    applyCol4Defaults(S.data);
  }
  S.tab = "personal";
  booting = true; refreshAll(); booting = false;
  save();
  renderSheet();
  setStatus("dirty", `Datos importados (${i.secciones.reduce((a, s) => a + s.n, 0)} filas). Revisa el Paso 3 y pulsa 💾 Guardar.`);
  if (dlgImp) dlgImp.close();
  byId("editor")?.scrollIntoView({ behavior:"smooth" });
}
/* Guarda en .json solo lo que se detectó (útil para revisarlo con calma o reimportarlo) */
function descargarPropuesta(){
  if (!propuesta) { byId("impFile")?.click(); return; }
  const d = propuesta.data;
  const limpio = { personal:{ nombre:"", titular:"", campos:window.DEFAULT_DATA.personal.campos.map(c => [c[0], "", c[2], ""]), redes:[] },
    perfil:"", perfilCustom:false, foto:null, research:{ lines:"", skills:"" },
    sections: d.sections.map(s => ({ ...s, rows: s.rows.map(r => [...r]) })) };
  download(new Blob([JSON.stringify(limpio, null, 2)], { type:"application/json" }),
    `CV_datos_detectados_${new Date().toISOString().slice(0, 10)}.json`);
}

/* ===================== 7. ARRANQUE Y ATAJOS ===================== */
function bootImportar(){
  /* Si el documento todavía se está parseando, este archivo puede ser el último en
     cargarse: se espera al evento load para no tocar nada antes de tiempo. */
  if (document.readyState !== "complete") return addEventListener("load", bootImportar, { once:true });
  ensureImportDialog();
  /* Los botones llevan data-imp-open y se atienden aquí, en un solo lugar. */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-imp-open]");
    if (t) { e.preventDefault(); showImport(); }
  });
}

