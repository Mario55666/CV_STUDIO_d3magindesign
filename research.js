/* CV Studio — Redes sociales, publicaciones científicas (DOI, APA 7) e identificadores de investigador.
   Se carga antes de app.js: solo define funciones; usa las utilidades de app.js en tiempo de ejecución. */

/* ===================== REDES SOCIALES ===================== */
const NETS = {
  linkedin:     { label:"LinkedIn",              ab:"in", c:"#0a66c2", base:"https://www.linkedin.com/in/" },
  behance:      { label:"Behance",               ab:"Bē", c:"#1769ff", base:"https://www.behance.net/" },
  instagram:    { label:"Instagram",             ab:"IG", c:"#d6249f", base:"https://www.instagram.com/" },
  facebook:     { label:"Facebook",              ab:"f",  c:"#1877f2", base:"https://www.facebook.com/" },
  youtube:      { label:"YouTube",               ab:"▶",  c:"#ff0000", base:"https://www.youtube.com/@" },
  tiktok:       { label:"TikTok",                ab:"♪",  c:"#111111", base:"https://www.tiktok.com/@" },
  x:            { label:"X (Twitter)",           ab:"X",  c:"#111111", base:"https://x.com/" },
  github:       { label:"GitHub",                ab:"GH", c:"#24292f", base:"https://github.com/" },
  orcid:        { label:"ORCID",                 ab:"iD", c:"#a6ce39", base:"https://orcid.org/" },
  scholar:      { label:"Google Académico",      ab:"GS", c:"#4285f4", base:"" },
  researchgate: { label:"ResearchGate",          ab:"RG", c:"#00ccbb", base:"https://www.researchgate.net/profile/" },
  academia:     { label:"Academia.edu",          ab:"A",  c:"#41454a", base:"" },
  ctivitae:     { label:"CTI Vitae (CONCYTEC)",  ab:"CTI",c:"#c8102e", base:"" },
  web:          { label:"Sitio web / portafolio", ab:"🌐", c:"#0f7c7c", base:"" },
  otro:         { label:"Otra",                  ab:"🔗", c:"#5d6878", base:"" }
};
const socialList = () => (D().personal.redes ||= []);
function socialUrl(net, v){
  v = String(v||"").trim(); if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(v)) return "https://" + v;
  const b = NETS[net]?.base; return b ? b + v.replace(/^@/, "") : v;
}
const socialHandle = u => String(u||"").replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
const SOCIAL_MODES = { full:"Ícono + dirección", icons:"Solo íconos", off:"No mostrar" };
function socialHTML(where){
  const mode = S.socialMode || "full", list = socialList().filter(x => x[1]);
  if (mode === "off" || !list.length) return "";
  const items = list.map(([net, v]) => { const n = NETS[net] || NETS.otro, u = socialUrl(net, v);
    return `<a class="soc" href="${esc(u)}" target="_blank" rel="noopener" title="${esc(n.label)}"><span class="soc-ic" style="background:${n.c}">${esc(n.ab)}</span>${mode==="full" ? `<span class="soc-tx">${esc(socialHandle(u))}</span>` : ""}</a>`; }).join("");
  return where === "side" ? `<div class="side-block"><h3 class="cv-h">Redes y perfiles</h3><div class="cv-social v">${items}</div></div>` : `<div class="cv-social ${mode}">${items}</div>`;
}
function socialEditorHTML(){
  const list = socialList();
  return `<label class="fl">Redes sociales y perfiles profesionales</label>
    <div class="fields">${list.map(([net, v], i) => `<div class="soc-row">
      <span class="soc-ic" style="background:${(NETS[net]||NETS.otro).c}">${esc((NETS[net]||NETS.otro).ab)}</span>
      <select data-soc="${i}" data-sk="0">${Object.entries(NETS).map(([k,n])=>`<option value="${k}" ${k===net?"selected":""}>${n.label}</option>`).join("")}</select>
      <input data-soc="${i}" data-sk="1" value="${esc(v)}" placeholder="${NETS[net]?.base ? "usuario o URL completa" : "https://…"}">
      ${v ? `<a class="btn btn-ghost btn-sm" href="${esc(socialUrl(net, v))}" target="_blank" rel="noopener">Abrir ↗</a>` : ""}
      <button class="icon-btn" data-socdel="${i}" title="Quitar">✕</button></div>`).join("")}</div>
    <div class="toolbar"><button class="btn btn-ghost btn-sm" id="socAdd">＋ Agregar red o perfil</button>
      <span class="f-lab" style="min-width:0">Mostrar en el CV:</span>
      <div class="segs segs-sm">${Object.entries(SOCIAL_MODES).map(([k,l])=>`<button class="seg ${(S.socialMode||"full")===k?"on":""}" data-socmode="${k}">${l}</button>`).join("")}</div></div>`;
}

/* ===================== PUBLICACIONES ===================== */
const PUB_TYPES = ["Artículo científico","Artículo de revisión","Libro","Capítulo de libro","Ponencia / actas de congreso","Tesis de maestría","Tesis de doctorado","Informe técnico","Material didáctico","Otro"];
const INDEXES = ["Scopus","Web of Science","SciELO","Latindex Catálogo 2.0","DOAJ","Redalyc","Dialnet","ERIH PLUS","Google Scholar","Sin indexar"];
const doiNorm = v => { const m = String(v||"").trim().match(/10\.\d{4,9}\/[^\s"<>]+/i); return m ? m[0].replace(/[.,;]$/, "") : ""; };
const doiUrl = v => { const d = doiNorm(v); return d ? "https://doi.org/" + d : ""; };
const isBookish = t => /libro|tesis|informe|material/i.test(t||"") && !/cap[ií]tulo/i.test(t||"");
const pubSec = () => D().sections.find(s => s.kind === "pub");
function pubMetrics(){
  const s = pubSec(), rows = s ? s.rows.filter(r => r[1]) : [];
  return { total: rows.length, doi: rows.filter(r => doiNorm(r[6])).length,
    indexed: rows.filter(r => r[7] && !/sin indexar/i.test(r[7])).length,
    articles: rows.filter(r => /art[ií]culo/i.test(r[3]||"")).length,
    since: rows.length ? Math.min(...rows.map(r => yearKey(r[0])).filter(y => y > 0)) : null };
}
/* Apellidos del titular (dos últimas palabras del nombre) para resaltarlos en negrita en cada cita */
const myName = () => String(D().personal.nombre||"").trim().split(/\s+/).slice(-2).join(" ") || "§";
/* Cita APA 7: Autor, A. A. (Año). Título. Revista, vol(núm.), págs. https://doi.org/… */
function apaParts(r){
  const autor = r[5] || "", year = r[0] || "s. f.", title = r[1] || "", cont = r[2] || "", vol = r[8] || "", book = isBookish(r[3]);
  return { autor, year, title, cont, vol, book, doi: doiUrl(r[6]) };
}
function apaHTML(r){
  const p = apaParts(r), me = myName();
  const autor = esc(p.autor || D().personal.nombre).replace(new RegExp(me.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), m => `<b>${m}</b>`);
  return `${autor} (${esc(p.year)}). ${p.book ? `<i>${esc(p.title)}</i>` : esc(p.title)}. ${p.book ? esc(p.cont) : `<i>${esc(p.cont)}</i>`}${p.vol ? (p.book ? ` (${esc(p.vol)})` : `, ${esc(p.vol)}`) : ""}.${p.doi ? ` <a class="doi" href="${esc(p.doi)}" target="_blank" rel="noopener">${esc(p.doi)}</a>` : ""}`;
}
function apaText(r, md){
  const p = apaParts(r), it = s => md ? `*${s}*` : s;
  return `${p.autor || D().personal.nombre} (${p.year}). ${p.book ? it(p.title) : p.title}. ${p.book ? p.cont : it(p.cont)}${p.vol ? (p.book ? ` (${p.vol})` : `, ${p.vol}`) : ""}.${p.doi ? " " + (md ? `[${p.doi}](${p.doi})` : p.doi) : ""}`;
}
const chips = (txt, cls) => String(txt||"").split(/[;\n]/).map(x => x.trim()).filter(Boolean).map(x => `<span class="${cls}">${esc(x)}</span>`).join("");
function pubSectionHTML(s, n){
  const { rows } = visibleRows(s), R = D().research || {}, m = pubMetrics();
  let h = `<h3 class="cv-h">${n}. ${esc(s.title)}</h3>`;
  if (R.lines) h += `<div class="r-row"><b>Líneas de investigación:</b> ${chips(R.lines, "r-chip")}</div>`;
  if (R.skills) h += `<div class="r-row"><b>Habilidades de investigación:</b> ${chips(R.skills, "r-chip alt")}</div>`;
  h += `<div class="r-sum">${m.total} publicación(es) · ${m.articles} artículo(s) · ${m.doi} con DOI${m.indexed ? ` · ${m.indexed} indexada(s)` : ""}</div>`;
  h += `<ol class="pubs">` + rows.map(r => {
    const c = r.cells, tags = [c[3], ...(String(c[7]||"").split(/[;,]/).map(x=>x.trim()).filter(Boolean))].filter(Boolean);
    return `<li><span class="p-code">${S.codes ? r.code : ""}</span><div class="p-body"><div class="p-cite">${apaHTML(c)}</div>
      <div class="p-tags">${tags.map((t,i) => `<span class="p-tag ${i ? "idx" : ""}">${esc(t)}</span>`).join("")}${c[4] || S.mode==="doc" ? `<span class="ev">${evHTML(s, r)}</span>` : ""}</div></div></li>`;
  }).join("") + `</ol>`;
  return h;
}
/* Editor: tarjeta de publicación */
function pubCardHTML(s, r, i, cls, dupLine){
  const sel = (k, opts, ph) => `<input data-r="${i}" data-k="${k}" value="${esc(r[k]||"")}" list="dl-${k}" placeholder="${ph}">`;
  return `<div class="row-card pub-card ${cls}" id="row-${s.id}-${i}">${dupLine}
    <div class="rc-top"><span class="rc-code">${codeOf(s,i)}</span>
      <label class="rc-f rc-year">Año<input data-r="${i}" data-k="0" value="${esc(r[0]||"")}"></label>
      <label class="rc-f" style="width:220px">Tipo${sel(3, PUB_TYPES, "Artículo científico")}</label>
      <label class="rc-f" style="flex:1;min-width:220px">DOI<span class="rc-linkrow"><input data-r="${i}" data-k="6" value="${esc(r[6]||"")}" placeholder="10.xxxx/xxxxx">
        <button class="btn btn-ghost btn-sm" data-doifill="${i}" title="Completar título, autores, revista y páginas desde Crossref">🔎 Completar</button>
        ${doiUrl(r[6]) ? `<a class="btn btn-ghost btn-sm" href="${esc(doiUrl(r[6]))}" target="_blank" rel="noopener">doi ↗</a>` : ""}</span></label>
      <div class="acts"><button class="icon-btn" data-mv="${i}" data-d="-1" title="Subir">↑</button><button class="icon-btn" data-mv="${i}" data-d="1" title="Bajar">↓</button><button class="icon-btn" data-rdel="${i}" title="Eliminar">✕</button></div></div>
    <label class="rc-f">Título de la investigación<textarea data-r="${i}" data-k="1" rows="2">${esc(r[1]||"")}</textarea></label>
    <div class="rc-mid">
      <label class="rc-f">Autores (formato APA: Apellido, I. I., &amp; Apellido, I.)<input data-r="${i}" data-k="5" value="${esc(r[5]||"")}" placeholder="Quiroz Martínez, M. R."></label>
      <label class="rc-f">Revista / editorial / institución<input data-r="${i}" data-k="2" value="${esc(r[2]||"")}"></label>
      <label class="rc-f">Volumen(número), páginas<input data-r="${i}" data-k="8" value="${esc(r[8]||"")}" placeholder="9(2), 6339–6378"></label>
      <label class="rc-f">Indexación${sel(7, INDEXES, "Scopus; Latindex…")}</label>
    </div>
    <label class="rc-f rc-link ${r[4] ? "ok" : "none"}">🔗 Enlace al documento o certificado <span class="rc-hint">(PDF en Drive, repositorio, constancia)</span>
      <span class="rc-linkrow"><input type="url" data-r="${i}" data-k="4" value="${esc(r[4]||"")}" placeholder="https://…">${r[4] ? `<a class="btn btn-ghost btn-sm" href="${esc(r[4])}" target="_blank" rel="noopener" data-vt="${esc(r[1])}" data-vs="${esc(s.title+" · "+r[0])}" data-vc="${codeOf(s,i)}">👁 Ver</a>` : ""}</span></label>
    <div class="p-preview"><small>Cita APA 7:</small> ${apaHTML(r)}</div>
  </div>`;
}
function pubEditorExtras(){
  const R = (D().research ||= { lines:"", skills:"" }), orcid = (socialList().find(x => x[0]==="orcid")?.[1] || D().personal.campos.find(c => /orcid/i.test(c[0]))?.[1] || "");
  return `<datalist id="dl-3">${PUB_TYPES.map(t=>`<option value="${t}">`).join("")}</datalist><datalist id="dl-7">${INDEXES.map(t=>`<option value="${t}">`).join("")}</datalist>
    <div class="research-box">
      <label class="rc-f">Líneas de investigación <span class="rc-hint">(separadas por punto y coma)</span><textarea id="rLines" rows="2">${esc(R.lines)}</textarea></label>
      <label class="rc-f">Habilidades de investigación <span class="rc-hint">(métodos, software, normas)</span><textarea id="rSkills" rows="2">${esc(R.skills)}</textarea></label>
      <div class="row-inline"><button class="btn btn-nodoc btn-sm" id="orcidImport" data-orcid="${esc(orcid)}">⤓ Importar publicaciones desde ORCID</button>
        <small style="color:var(--muted)">${orcid ? `Usa ${esc(socialHandle(orcid))}. Solo agrega las que no estén en la lista.` : "Agrega tu ORCID en Datos personales o en Redes."}</small></div>
    </div>`;
}
/* Crossref: completar por DOI */
async function crossref(doi){
  const r = await fetch("https://api.crossref.org/works/" + encodeURIComponent(doi)); if (!r.ok) throw new Error("DOI no encontrado (" + r.status + ")");
  const m = (await r.json()).message, au = (m.author || []);
  const apa = au.map(a => `${a.family || a.name || ""}${a.given ? ", " + a.given.split(/[\s-]+/).filter(Boolean).filter(x=>!/^(mg|dr|lic|mtro)\.?$/i.test(x)).map(x => x[0].toUpperCase() + ".").join(" ") : ""}`);
  const autores = apa.length <= 1 ? apa.join("") : apa.length === 2 ? apa.join(", & ") : apa.slice(0,-1).join(", ") + ", & " + apa.slice(-1);
  const tmap = { "journal-article":"Artículo científico", "book":"Libro", "monograph":"Libro", "book-chapter":"Capítulo de libro", "proceedings-article":"Ponencia / actas de congreso", "dissertation":"Tesis de doctorado", "report":"Informe técnico" };
  const vol = m.volume ? `${m.volume}${m.issue ? `(${m.issue})` : ""}${m.page ? `, ${String(m.page).replace("-", "–")}` : ""}` : (m.page || "");
  return { year: String(m.issued?.["date-parts"]?.[0]?.[0] || ""), title: m.title?.[0] || "", cont: m["container-title"]?.[0] || m.publisher || "", type: tmap[m.type] || "Otro", autores, vol, doi: m.DOI || doi };
}
async function doiFill(i){
  const s = pubSec(), r = s.rows[i], d = doiNorm(r[6]);
  if (!d) { setStatus("error", "Escribe primero un DOI válido (10.xxxx/…)"); return; }
  setStatus("dirty", "Consultando Crossref…");
  try { const c = await crossref(d);
    r[0] = c.year || r[0]; r[1] = c.title || r[1]; r[2] = c.cont || r[2]; r[3] = r[3] || c.type; r[5] = c.autores || r[5]; r[8] = c.vol || r[8]; r[6] = c.doi;
    renderEditor(); soon(); setStatus("dirty", `✓ Datos completados desde Crossref · pulsa Guardar`);
  } catch(e) { setStatus("error", "⚠ " + e.message); }
}
/* ORCID: importar trabajos públicos */
async function orcidImport(id){
  const m = String(id||"").match(/\d{4}-\d{4}-\d{4}-\d{3}[\dX]/); if (!m) { alert("No encuentro un ORCID válido (0000-0000-0000-0000). Agrégalo en Datos personales."); return; }
  setStatus("dirty", "Consultando ORCID…");
  try {
    const r = await fetch(`https://pub.orcid.org/v3.0/${m[0]}/works`, { headers:{ Accept:"application/json" } }); if (!r.ok) throw new Error("ORCID respondió " + r.status);
    const s = pubSec(), low = t => String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]/g,"");
    const have = new Set(s.rows.flatMap(x => [low(x[1]), doiNorm(x[6]).toLowerCase()]).filter(Boolean)), add = [];
    for (const g of (await r.json()).group || []) {
      const w = g["work-summary"][0], t = w.title?.title?.value, doi = (w["external-ids"]?.["external-id"] || []).find(e => e["external-id-type"] === "doi")?.["external-id-value"] || "";
      if (!t || have.has(low(t)) || (doi && have.has(doiNorm(doi).toLowerCase()))) continue;
      /* títulos casi iguales (≥ 80 % de palabras en común) = la misma publicación */
      const tok = x => new Set(String(x||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").split(/[^a-z0-9]+/).filter(w => w.length > 2));
      const tt = tok(t); if ([...s.rows, ...add.map(a => [0, a[1]])].some(x => { const o = tok(x[1]), inter = [...tt].filter(w => o.has(w)).length; return inter / (tt.size + o.size - inter) >= .8; })) continue;
      have.add(low(t)); if (doi) have.add(doiNorm(doi).toLowerCase());
      const tmap = { "journal-article":"Artículo científico", "book":"Libro", "book-chapter":"Capítulo de libro", "conference-paper":"Ponencia / actas de congreso", "dissertation-thesis":"Tesis de maestría", "report":"Informe técnico" };
      add.push([w["publication-date"]?.year?.value || "", t, w["journal-title"]?.value || "", tmap[w.type] || "Otro", "", "", doi, "", ""]);
    }
    if (!add.length) { setStatus("saved", "ORCID: no hay publicaciones nuevas para agregar"); return; }
    if (!confirm(`ORCID tiene ${add.length} publicación(es) que no están en tu CV:\n\n${add.map(a => `• ${a[0]} — ${a[1].slice(0,80)}`).join("\n")}\n\n¿Agregarlas?`)) return;
    s.rows.push(...add); sortRows(s); renderEditor(); soon();
    setStatus("dirty", `✓ ${add.length} publicación(es) importadas · usa «🔎 Completar» para traer autores y páginas`);
  } catch(e) { setStatus("error", "⚠ No se pudo consultar ORCID: " + e.message); }
}
/* Migración: agrega la sección de publicaciones, la investigación y las redes si faltan */
function migrateResearch(st){
  const d = st.data;
  if (!d.sections.some(s => s.kind === "pub") && window.DEFAULT_PUBLICATIONS) d.sections.push(JSON.parse(JSON.stringify(window.DEFAULT_PUBLICATIONS)));
  if (!d.research) d.research = JSON.parse(JSON.stringify(window.DEFAULT_RESEARCH || { lines:"", skills:"" }));
  if (!d.personal.redes) d.personal.redes = JSON.parse(JSON.stringify(window.DEFAULT_SOCIAL || []));
  return st;
}
/* Eventos del editor (redes, investigación, DOI, ORCID) */
document.addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.soc !== undefined) { socialList()[+t.dataset.soc][+t.dataset.sk] = t.value; if (t.tagName === "SELECT") { const y = scrollY; renderEditor(); scrollTo(0, y); } soon(); }
  else if (t.id === "rLines") { (D().research ||= {}).lines = t.value; soon(); }
  else if (t.id === "rSkills") { (D().research ||= {}).skills = t.value; soon(); }
});
document.addEventListener("click", e => {
  const t = e.target.closest("#socAdd,[data-socdel],[data-socmode],[data-doifill],#orcidImport"); if (!t) return;
  if (t.id === "socAdd") { socialList().push(["linkedin", ""]); renderEditor(); soon(); }
  else if (t.dataset.socdel !== undefined) { socialList().splice(+t.dataset.socdel, 1); renderEditor(); soon(); }
  else if (t.dataset.socmode) { S.socialMode = t.dataset.socmode; renderEditor(); renderSheet(); save(); }
  else if (t.dataset.doifill !== undefined) doiFill(+t.dataset.doifill);
  else if (t.id === "orcidImport") orcidImport(t.dataset.orcid);
});
