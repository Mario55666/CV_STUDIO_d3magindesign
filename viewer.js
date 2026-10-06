/* CV Studio — Visor animado de certificados (PDF / JPG / Google Drive)
   Al pulsar un hipervínculo de certificado, el documento «vuela» desde el enlace al centro con giro 3D,
   destello de luz y sello «CERTIFICADO». Incluye modo presentación, zoom, arrastre y pantalla completa. */
(function(){
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SLIDE_MS = 6000;
  const V = document.createElement("div");
  V.className = "viewer"; V.hidden = true; V.setAttribute("role","dialog"); V.setAttribute("aria-modal","true"); V.setAttribute("aria-label","Visor de certificados");
  V.innerHTML = `
    <div class="vw-backdrop"></div>
    <div class="vw-particles" aria-hidden="true"></div>
    <div class="vw-stage">
      <div class="vw-card">
        <div class="vw-shine" aria-hidden="true"></div>
        <header class="vw-head">
          <span class="vw-code"></span>
          <div class="vw-title"><b></b><small></small></div>
          <span class="vw-count"></span>
          <div class="vw-tools">
            <button class="vw-btn" data-act="zoomout" title="Alejar (−)">−</button>
            <button class="vw-btn" data-act="zoomfit" title="Ajustar (0)">⤢</button>
            <button class="vw-btn" data-act="zoomin" title="Acercar (+)">+</button>
            <button class="vw-btn vw-play" data-act="play" title="Presentación automática (espacio)">▶</button>
            <button class="vw-btn" data-act="full" title="Pantalla completa (F)">⛶</button>
            <a class="vw-btn" data-act="open" target="_blank" rel="noopener" title="Abrir en una pestaña nueva">↗</a>
            <button class="vw-btn vw-close" data-act="close" title="Cerrar (Esc)">✕</button>
          </div>
        </header>
        <div class="vw-body">
          <div class="vw-skel"><div class="vw-doc"><i></i><i></i><i></i><i></i></div><span>Cargando certificado…</span></div>
          <div class="vw-media"></div>
        </div>
        <div class="vw-stamp" aria-hidden="true">✔ CERTIFICADO</div>
        <div class="vw-progress"><i></i></div>
      </div>
      <button class="vw-nav vw-prev" data-act="prev" title="Anterior (←)">‹</button>
      <button class="vw-nav vw-next" data-act="next" title="Siguiente (→)">›</button>
      <div class="vw-dots"></div>
    </div>`;
  document.body.appendChild(V);
  const $v = s => V.querySelector(s);
  const card = $v(".vw-card"), media = $v(".vw-media"), skel = $v(".vw-skel"), stamp = $v(".vw-stamp"), bar = $v(".vw-progress i");
  let list = [], idx = 0, originEl = null, originPt = null, playing = false, playAnim = null, zoom = 1, pan = {x:0,y:0}, lastFocus = null, busy = false;

  /* Ejecuta fn una sola vez al terminar la animación, o tras un tiempo máximo
     (si el navegador pausa animaciones en segundo plano, el visor no se queda trabado). */
  function whenDone(anim, ms, fn){ let ok = false; const run = () => { if (!ok) { ok = true; fn(); } }; anim.onfinish = run; setTimeout(run, ms + 120); }

  /* ---------- Tipo de recurso ---------- */
  function resolve(href){
    const a = String(href || "");
    const m = a.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/);
    if (m) return { kind:"frame", src:`https://drive.google.com/file/d/${m[1]}/preview`, open:a, label:"Google Drive" };
    if (a.startsWith("blob:")) {
      const f = (typeof files !== "undefined") ? [...files.values()].find(x => x.url === a) : null, t = f ? f.file.type : "";
      return t.startsWith("image/") ? { kind:"img", src:a, open:a, label:"Archivo local · " + (f?.name||"") } : { kind:"frame", src:a, open:a, label:"Archivo local · " + (f?.name||"") };
    }
    if (/\.(jpe?g|png|gif|webp)([?#]|$)/i.test(a)) return { kind:"img", src:a, open:a, label:"Imagen" };
    if (/^https?:/i.test(a) && /\.pdf([?#]|$)/i.test(a)) return { kind:"frame", src:a, open:a, label:"PDF" };
    if (!/^https?:/i.test(a)) return { kind:"local", open:a, label:"Carpeta adjunta" };
    let host = a; try { host = new URL(a).hostname; } catch(_){}
    return { kind:"ext", open:a, label:host };
  }
  const isCert = a => { const h = a.getAttribute("href") || ""; return h && !/^(#|mailto:|tel:|javascript:)/i.test(h) && !/orcid\.org|doi\.org/i.test(h) && !a.classList.contains("soc") && !a.dataset.dupgo && !a.closest(".vw-card"); };
  function slideFrom(a){
    const row = a.closest("tr,.item,.row-card,.dup-item,dd");
    const txt = row ? row.textContent.replace(/\s+/g," ").trim() : a.textContent;
    return { href: a.getAttribute("href"), title: a.dataset.vt || txt.slice(0,110), sub: a.dataset.vs || "", code: a.dataset.vc || "", el: a };
  }
  function collect(root){
    const seen = new Set(), out = [];
    [...root.querySelectorAll("a[href]")].filter(isCert).forEach(a => { const h = a.getAttribute("href"); if (seen.has(h)) return; seen.add(h); out.push(slideFrom(a)); });
    return out;
  }

  /* ---------- Partículas de celebración ---------- */
  function burst(x, y){
    if (reduce) return;
    const P = $v(".vw-particles"), colors = ["#0f7c7c","#c9822b","#1f3a5f","#2e7d4f","#ffffff"];
    for (let i=0;i<26;i++){
      const d = document.createElement("i"), ang = Math.random()*Math.PI*2, dist = 120 + Math.random()*220, sz = 4 + Math.random()*7;
      d.style.cssText = `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${colors[i%colors.length]};border-radius:${Math.random()>.5?"50%":"2px"}`;
      P.appendChild(d);
      d.animate([{transform:"translate(-50%,-50%) scale(1)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(ang)*dist}px), calc(-50% + ${Math.sin(ang)*dist}px)) rotate(${Math.random()*540}deg) scale(.2)`,opacity:0}],
        {duration:900+Math.random()*500, easing:"cubic-bezier(.15,.7,.3,1)"}).onfinish = () => d.remove();
    }
  }

  /* ---------- Contenido ---------- */
  function setHeader(it){
    $v(".vw-code").textContent = it.code || "🔗";
    $v(".vw-title b").textContent = it.title;
    $v(".vw-title small").textContent = [it.sub, resolve(it.href).label].filter(Boolean).join(" · ");
    $v(".vw-count").textContent = list.length > 1 ? `${idx+1} / ${list.length}` : "";
    $v('[data-act="open"]').href = resolve(it.href).open;
    V.querySelectorAll(".vw-nav").forEach(b => b.hidden = list.length < 2);
    $v(".vw-play").hidden = list.length < 2;
    $v(".vw-dots").innerHTML = list.length > 1 && list.length <= 40 ? list.map((_,i)=>`<button class="${i===idx?"on":""}" data-go="${i}" title="${i+1}"></button>`).join("") : "";
  }
  function loadMedia(it){
    const r = resolve(it.href); zoom = 1; pan = {x:0,y:0};
    V.dataset.kind = r.kind;
    skel.hidden = false; skel.style.opacity = 1; stamp.style.opacity = 0;
    media.innerHTML = "";
    const reveal = () => {
      whenDone(skel.animate([{opacity:1},{opacity:0}],{duration:250,fill:"forwards"}), 250, () => skel.hidden = true);
      const m = media.firstElementChild;
      if (m && !reduce) m.animate([{opacity:0,transform:"scale(.94)",filter:"blur(10px)"},{opacity:1,transform:"scale(1)",filter:"blur(0)"}],{duration:520,easing:"cubic-bezier(.2,.8,.2,1)"});
      stampIn();
    };
    if (r.kind === "img") {
      const img = new Image(); img.alt = it.title; img.className = "vw-img"; img.draggable = false;
      img.onload = reveal; img.onerror = () => fallback(it, r, "No se pudo cargar la imagen."); img.src = r.src; media.appendChild(img);
    } else if (r.kind === "frame") {
      const f = document.createElement("iframe"); f.className = "vw-frame"; f.title = it.title; f.allow = "fullscreen"; f.referrerPolicy = "no-referrer";
      let done = false; const fin = () => { if (!done) { done = true; reveal(); } };
      f.onload = fin; setTimeout(fin, 4500); f.src = r.src; media.appendChild(f);
    } else fallback(it, r);
  }
  function fallback(it, r, msg){
    const local = r.kind === "local";
    media.innerHTML = `<div class="vw-fb"><div class="vw-fb-ic">${local ? "📁" : "🌐"}</div>
      <h3>${local ? "El certificado está en la carpeta adjunta" : "Este sitio no permite mostrarse dentro del visor"}</h3>
      <p>${msg || (local ? `Ruta: <code>${r.open.replace(/</g,"&lt;")}</code><br>Agrega el enlace de Google Drive en el editor (columna «Enlace del certificado») o carga la carpeta en el Paso 5 para verlo aquí.` : `Se abrirá en una pestaña nueva: <b>${r.label}</b>`)}</p>
      <a class="btn btn-doc" href="${r.open.replace(/"/g,"&quot;")}" target="_blank" rel="noopener">Abrir ↗</a></div>`;
    skel.hidden = true; stampIn(true);
  }
  function stampIn(soft){
    if (reduce) { stamp.style.opacity = soft ? 0 : 1; return; }
    if (soft) return;
    stamp.animate([{opacity:0,transform:"rotate(-28deg) scale(3)"},{opacity:1,transform:"rotate(-10deg) scale(.92)",offset:.7},{opacity:1,transform:"rotate(-12deg) scale(1)"}],
      {duration:520,easing:"cubic-bezier(.3,1.5,.5,1)",fill:"forwards"});
    card.animate([{transform:"translate(0,0)"},{transform:"translate(-3px,2px)"},{transform:"translate(2px,-2px)"},{transform:"translate(0,0)"}],{duration:220,delay:360});
  }
  function shine(){
    if (reduce) return;
    $v(".vw-shine").animate([{transform:"translateX(-130%) skewX(-18deg)",opacity:0},{opacity:.9,offset:.3},{transform:"translateX(130%) skewX(-18deg)",opacity:0}],{duration:1100,delay:500,easing:"ease-in-out"});
  }

  /* ---------- Abrir / cerrar con FLIP 3D ---------- */
  function open(items, start, origin, autoplay){
    if (!items.length) return;
    list = items; idx = Math.max(0, start); originEl = origin || null; lastFocus = document.activeElement;
    const or = originEl ? originEl.getBoundingClientRect() : {left:innerWidth/2,top:innerHeight/2,width:10,height:10};
    originPt = { x: or.left + or.width/2, y: or.top + or.height/2 };
    V.hidden = false; document.documentElement.classList.add("vw-lock");
    setHeader(list[idx]); loadMedia(list[idx]);
    const bd = $v(".vw-backdrop"), cr = card.getBoundingClientRect();
    if (reduce) { V.animate([{opacity:0},{opacity:1}],{duration:200}); }
    else {
      bd.animate([{clipPath:`circle(0px at ${originPt.x}px ${originPt.y}px)`},{clipPath:`circle(${Math.hypot(innerWidth,innerHeight)}px at ${originPt.x}px ${originPt.y}px)`}],{duration:700,easing:"cubic-bezier(.6,0,.2,1)"});
      const dx = originPt.x - (cr.left + cr.width/2), dy = originPt.y - (cr.top + cr.height/2), s = Math.max(.04, Math.min(or.width / cr.width, .2));
      card.animate([
        {transform:`translate(${dx}px,${dy}px) scale(${s}) rotateY(-70deg) rotateX(25deg)`, opacity:.2, borderRadius:"40px"},
        {transform:"translate(0,0) scale(1.04) rotateY(6deg) rotateX(-2deg)", opacity:1, offset:.72},
        {transform:"none", opacity:1, borderRadius:"18px"}],
        {duration:820, easing:"cubic-bezier(.16,1,.3,1)"});
      V.querySelectorAll(".vw-nav,.vw-dots").forEach(n => n.animate([{opacity:0},{opacity:1}],{duration:400,delay:500,fill:"backwards"}));
      setTimeout(() => burst(innerWidth/2, innerHeight/2), 560);
      shine();
    }
    setTimeout(() => $v(".vw-close").focus({preventScroll:true}), 50);
    if (autoplay) setTimeout(() => togglePlay(true), 900);
  }
  function close(){
    if (V.hidden || busy) return;
    togglePlay(false);
    const done = () => { V.hidden = true; media.innerHTML = ""; document.documentElement.classList.remove("vw-lock"); if (document.fullscreenElement) document.exitFullscreen().catch(()=>{}); lastFocus?.focus?.({preventScroll:true}); };
    if (reduce) return done();
    busy = true;
    const el = list[idx]?.el && document.contains(list[idx].el) ? list[idx].el : originEl;
    const or = el ? el.getBoundingClientRect() : {left:innerWidth/2,top:innerHeight/2,width:10,height:10};
    const cr = card.getBoundingClientRect(), p = {x: or.left+or.width/2, y: or.top+or.height/2};
    card.animate([{transform:"none",opacity:1},{transform:`translate(${p.x-(cr.left+cr.width/2)}px,${p.y-(cr.top+cr.height/2)}px) scale(.05) rotateY(60deg)`,opacity:0}],{duration:480,easing:"cubic-bezier(.7,0,.84,0)",fill:"forwards"});
    const fade = [...V.querySelectorAll(".vw-nav,.vw-dots,.vw-particles")].map(n => n.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards"}));
    whenDone($v(".vw-backdrop").animate([{clipPath:`circle(${Math.hypot(innerWidth,innerHeight)}px at ${p.x}px ${p.y}px)`},{clipPath:`circle(0px at ${p.x}px ${p.y}px)`}],{duration:520,easing:"cubic-bezier(.6,0,.2,1)",fill:"forwards"}), 520,
      () => { card.getAnimations().forEach(a=>a.cancel()); $v(".vw-backdrop").getAnimations().forEach(a=>a.cancel()); fade.forEach(a=>a.cancel()); busy = false; done(); });
  }

  /* ---------- Navegación: giro de página 3D ---------- */
  function go(to, dir){
    if (busy || list.length < 2) return;
    const n = (to + list.length) % list.length; if (n === idx) return;
    dir = dir || (n > idx ? 1 : -1);
    if (reduce) { idx = n; setHeader(list[idx]); loadMedia(list[idx]); return; }
    busy = true;
    whenDone(card.animate([{transform:"none",opacity:1},{transform:`translateX(${-dir*45}%) rotateY(${dir*75}deg) scale(.85)`,opacity:0}],{duration:340,easing:"cubic-bezier(.5,0,.75,0)",fill:"forwards"}), 340, () => {
        idx = n; setHeader(list[idx]); loadMedia(list[idx]);
        card.getAnimations().forEach(a=>a.cancel());
        whenDone(card.animate([{transform:`translateX(${dir*45}%) rotateY(${-dir*75}deg) scale(.85)`,opacity:0},{transform:`rotateY(${-dir*4}deg) scale(1.02)`,opacity:1,offset:.75},{transform:"none",opacity:1}],{duration:560,easing:"cubic-bezier(.16,1,.3,1)"}),
          560, () => { busy = false; });
        shine();
        if (playing) startBar();
      });
  }

  /* ---------- Presentación automática ---------- */
  function startBar(){
    playAnim?.cancel();
    playAnim = bar.animate([{transform:"scaleX(0)"},{transform:"scaleX(1)"}],{duration:SLIDE_MS,easing:"linear"});
    const mine = playAnim;
    whenDone(playAnim, SLIDE_MS, () => { if (playing && playAnim === mine) { if (idx === list.length-1) togglePlay(false); else go(idx+1, 1); } });
  }
  function togglePlay(on){
    playing = on === undefined ? !playing : on;
    $v(".vw-play").textContent = playing ? "❚❚" : "▶"; $v(".vw-play").classList.toggle("on", playing);
    V.classList.toggle("playing", playing);
    if (playing) startBar(); else { playAnim?.cancel(); playAnim = null; }
  }

  /* ---------- Zoom y arrastre (imágenes) ---------- */
  function applyZoom(){ const img = media.querySelector(".vw-img"); if (img) img.style.transform = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`; V.classList.toggle("zoomed", zoom > 1); }
  function setZoom(z){
    const f = media.querySelector(".vw-frame");
    if (f) { f.style.transform = `scale(${Math.max(1, z)})`; f.style.transformOrigin = "top center"; zoom = Math.max(1, Math.min(3, z)); return; }
    zoom = Math.max(1, Math.min(5, z)); if (zoom === 1) pan = {x:0,y:0}; applyZoom();
  }
  let drag = null;
  media.addEventListener("pointerdown", e => { if (zoom <= 1 || !e.target.classList.contains("vw-img")) return; drag = {x:e.clientX-pan.x, y:e.clientY-pan.y}; e.target.setPointerCapture(e.pointerId); });
  media.addEventListener("pointermove", e => { if (!drag) return; pan = {x:e.clientX-drag.x, y:e.clientY-drag.y}; applyZoom(); });
  media.addEventListener("pointerup", () => drag = null);
  media.addEventListener("wheel", e => { if (!media.querySelector(".vw-img")) return; e.preventDefault(); setZoom(zoom * (e.deltaY < 0 ? 1.15 : 1/1.15)); }, {passive:false});
  media.addEventListener("dblclick", e => { if (e.target.classList.contains("vw-img")) setZoom(zoom > 1 ? 1 : 2.2); });

  /* ---------- Eventos ---------- */
  V.addEventListener("click", e => {
    const b = e.target.closest("[data-act],[data-go]");
    if (!b) { if (e.target.classList.contains("vw-stage") || e.target.classList.contains("vw-backdrop")) close(); return; }
    if (b.dataset.go !== undefined) return go(+b.dataset.go);
    const act = b.dataset.act;
    if (act === "open") { togglePlay(false); return; }
    e.preventDefault();
    if (act === "close") close(); else if (act === "prev") { togglePlay(false); go(idx-1,-1); } else if (act === "next") { togglePlay(false); go(idx+1,1); }
    else if (act === "play") togglePlay(); else if (act === "zoomin") setZoom(zoom*1.25); else if (act === "zoomout") setZoom(zoom/1.25); else if (act === "zoomfit") setZoom(1);
    else if (act === "full") { if (document.fullscreenElement) document.exitFullscreen(); else V.requestFullscreen?.().catch(()=>{}); }
  });
  document.addEventListener("keydown", e => {
    if (V.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowRight") { togglePlay(false); go(idx+1,1); }
    else if (e.key === "ArrowLeft") { togglePlay(false); go(idx-1,-1); }
    else if (e.key === " " && list.length > 1) { e.preventDefault(); togglePlay(); }
    else if (e.key === "+" || e.key === "=") setZoom(zoom*1.25);
    else if (e.key === "-") setZoom(zoom/1.25);
    else if (e.key === "0") setZoom(1);
    else if (e.key.toLowerCase() === "f") $v('[data-act="full"]').click();
    else if (e.key === "Tab") { const f = [...V.querySelectorAll("button:not([hidden]),a[href]")].filter(x=>x.offsetParent); if (!f.length) return;
      const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length-1].focus(); } else if (!e.shiftKey && i === f.length-1) { e.preventDefault(); f[0].focus(); } }
  });
  /* Intercepta los hipervínculos de certificados en la hoja del CV, el editor, las evidencias y los datos personales */
  document.addEventListener("click", e => {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]"); if (!a || !isCert(a)) return;
    const root = a.closest("#sheet,#edPanel,#evBody"); if (!root) return;
    e.preventDefault();
    const items = collect(root), h = a.getAttribute("href");
    open(items, items.findIndex(x => x.href === h), a);
  }, true);

  /* API pública: presentación de todos los certificados de la hoja del CV */
  window.CertViewer = {
    open, close,
    present(btn){
      const items = collect(document.getElementById("sheet")).filter(x => ["frame","img"].includes(resolve(x.href).kind));
      if (!items.length) { alert("No hay certificados en línea en la selección actual. Agrega enlaces en el editor o cambia los filtros."); return; }
      open(items, 0, btn, true);
    },
    count(){ return collect(document.getElementById("sheet")).filter(x => ["frame","img"].includes(resolve(x.href).kind)).length; }
  };
})();
