/* CV Studio — Edición pública · © 2026 d3magindesign · Mg. Mario Quiroz Martínez
   ---------------------------------------------------------------------------
   Este archivo NO contiene datos de ninguna persona real: la plantilla nace
   vacía y los 6 ejemplos («demos») son personas, instituciones, resoluciones,
   DOI y documentos INVENTADOS, escritos solo con fines didácticos.

   Estructura de una fila: [0 año, 1 tema/empresa/título, 2 institución/función/revista,
   3 horas/tiempo/tipo, 4 enlace, (publicaciones: 5 autores, 6 DOI, 7 indexación, 8 volumen/páginas)]
   --------------------------------------------------------------------------- */

/* ===================== 1. PLANTILLA VACÍA ===================== */
window.EMPTY_SECTIONS = () => ([
  { id:"grados",          title:"Formación académica y grados",        prefix:"01", folder:"01_Formacion_academica",     kind:"edu", training:false, col4:{hide:true}, rows:[] },
  { id:"experiencia",     title:"Experiencia profesional",             prefix:"02", folder:"02_Experiencia_profesional", kind:"exp", training:false, rows:[] },
  { id:"docente",         title:"Experiencia docente",                 prefix:"03", folder:"03_Experiencia_docente",     kind:"exp", training:false, rows:[] },
  { id:"capacitacion",    title:"Capacitación y cursos",               prefix:"04", folder:"04_Capacitacion",            kind:"edu", training:true,  rows:[] },
  { id:"produccion",      title:"Producción gráfica y de contenidos",  prefix:"05", folder:"05_Produccion",             kind:"edu", training:false, col4:{label:"Formato"}, rows:[] },
  { id:"ofimatica",       title:"Informática y herramientas digitales", prefix:"06", folder:"06_Informatica",           kind:"edu", training:true,  rows:[] },
  { id:"idiomas",         title:"Idiomas",                             prefix:"07", folder:"07_Idiomas",                kind:"edu", training:false, col4:{label:"Nivel"}, rows:[] },
  { id:"publicaciones",   title:"Publicaciones e investigación",       prefix:"08", folder:"08_Publicaciones",          kind:"pub", training:false, rows:[] },
  { id:"calidad",         title:"Gestión, calidad y coordinación",     prefix:"09", folder:"09_Gestion_y_calidad",      kind:"exp", training:false, rows:[] },
  { id:"investigacion",   title:"Proyectos de investigación",          prefix:"10", folder:"10_Proyectos_investigacion", kind:"edu", training:false, rows:[] },
  { id:"reconocimientos", title:"Reconocimientos y distinciones",      prefix:"11", folder:"11_Reconocimientos",        kind:"exp", training:false, col4:{label:"Periodo"}, rows:[] }
]);

window.DEFAULT_DATA = {
  personal: {
    nombre: "", titular: "",
    campos: [
      ["Nombres", "", false, ""],
      ["Apellidos", "", false, ""],
      ["Lugar y fecha de nac.", "", false, ""],
      ["Nacionalidad", "", false, ""],
      ["Domicilio", "", true, ""],
      ["Documento de identidad", "", true, ""],
      ["Celular", "", false, ""],
      ["Correo", "", false, ""]
    ],
    redes: []
  },
  perfil: "", perfilCustom: false, foto: null,
  research: { lines:"", skills:"" },
  sections: window.EMPTY_SECTIONS()
};
/* Edición pública: sin enlaces, filas ni marcas precargadas */
window.DEFAULT_LINKS = {}; window.DEFAULT_EXTRA_ROWS = {}; window.DEFAULT_FIELD_LINKS = {}; window.SHARED_LINK_WARN = [];
window.DEFAULT_PUBLICATIONS = { id:"publicaciones", title:"Publicaciones e investigación", prefix:"08", folder:"08_Publicaciones", kind:"pub", training:false, rows:[] };
window.DEFAULT_RESEARCH = { lines:"", skills:"" };
window.DEFAULT_SOCIAL = [];

/* ===================== 2. FIRMA DEL APLICATIVO ===================== */
window.APP_BRAND = {
  producto: "CV Studio",
  autor:    "Mg. Mario Quiroz Martínez",
  estudio:  "d3magindesign",
  year:     "2026",
  linea:    "d3magindesign 2026 · Mg. Mario Quiroz Martínez"
};

/* ===================== 3. NIVELES PROFESIONALES (didáctico) =====================
   Cada nivel define: alcance (para qué sirve), extensión (páginas), tope de cursos,
   el orden de secciones sugerido, el titular y el perfil de arranque. */
window.LEVEL_KEYS = ["tecnico","profesional","especialista","investigador","directivo"];

window.LEVEL_NOTES = {
  tecnico: {
    alcance: "Para puestos de producción, soporte técnico, asistencia administrativa y manejo de software o equipos. Se evalúa lo que sabes HACER.",
    pages:"1–2 páginas", limit:"hasta 6 cursos por sección",
    lleva:["Tus títulos técnicos y la secundaria completa (si es tu grado más alto).","Experiencia con verbos de acción y, si puedes, un resultado medible: «redujo 20 % las paradas».","Solo los cursos que se usan en el puesto: software, seguridad, equipos.","Herramientas digitales con su nivel (básico, intermedio, avanzado)."],
    quita:["Cursos y talleres que no tengan relación con el puesto.","Deportes, hobbies y datos familiares.","Fotos informales o de vacaciones."],
    tip:"Si nunca has trabajado, pon primero tus prácticas, tus talleres del instituto y tus proyectos personales. Cuentan como experiencia."
  },
  profesional: {
    alcance: "Para puestos profesionales que exigen título universitario o licenciatura: analistas, coordinadores, jefaturas iniciales, docentes de aula.",
    pages:"2–3 páginas", limit:"hasta 8 cursos por sección",
    lleva:["Título profesional, colegiatura y bachiller con fecha y registro (SUNEDU si aplica).","Experiencia con logros medibles: porcentajes, montos, personas a cargo.","Especialización reciente (diplomados, certificaciones internacionales).","Idiomas con nivel del Marco Común Europeo (A1–C2)."],
    quita:["La práctica preprofesional si ya tienes 3 años o más de experiencia.","Cursos introductorios de ofimática básica.","Repetir la misma función en tres instituciones distintas: resúmelo."],
    tip:"Dos páginas bien llenas valen más que tres páginas con relleno. Si dudas, deja fuera lo que no puedas sustentar en una entrevista."
  },
  especialista: {
    alcance: "Para docencia superior, especialización técnica de alto nivel y consultoría. Se evalúa el dominio experto y la capacidad de formar a otros.",
    pages:"3–5 páginas", limit:"todos los cursos",
    lleva:["Grados de maestría y especializaciones, con su registro.","Experiencia docente: institución, curso, horas y documento que la acredita (RD, contrato, orden de servicio).","Producción propia: materiales, manuales, libros, tutoriales, piezas gráficas.","Cursos completos, agrupados por tema, con horas y créditos."],
    quita:["Experiencias laborales sin relación con la especialidad.","Cursos de menos de 8 horas (salvo que sean obligatorios por norma)."],
    tip:"Ordena los cursos por afinidad temática, no solo por año: el evaluador busca coherencia con la especialidad, no una lista larga."
  },
  investigador: {
    alcance: "Para grados académicos, investigación, docencia universitaria y fondos concursables (CONCYTEC, SUNEDU, universidades).",
    pages:"3–6 páginas", limit:"todos los cursos",
    lleva:["Grados académicos completos: bachiller, licenciatura, maestría, doctorado, con fecha y registro.","Investigación en normas APA 7, con DOI, indexación (Scopus, SciELO, Latindex…) y enlace al documento.","Proyectos con financiamiento: monto, entidad, rol y periodo.","Identificadores: ORCID, Google Académico, ResearchGate, CTI Vitae.","Métricas de producción: publicaciones, artículos con DOI, años de docencia, horas de capacitación."],
    quita:["Cursos y talleres que no aporten a la línea de investigación.","Congresos sin ponencia ni publicación (salvo que hayas sido organizador)."],
    tip:"En investigación la trazabilidad es todo: si consignas un DOI o una indexación, el evaluador la verificará en línea. Nunca inventes una."
  },
  directivo: {
    alcance: "Para dirección, coordinación académica, jefatura de calidad y cargos de confianza. Se evalúa la gestión: qué condujiste y con qué resultado.",
    pages:"2–3 páginas", limit:"hasta 5 cursos por sección",
    lleva:["Cargos de dirección, coordinación o calidad con el número de personas y de procesos a cargo.","Procesos conducidos con resultado: licenciamiento, acreditación, certificación ISO, tasa de titulación.","Formación en gestión, liderazgo, auditoría y normativa vigente.","Resoluciones y reconocimientos que respalden los cargos."],
    quita:["Detalle excesivo de tareas operativas.","Experiencia docente si no aporta al cargo al que postulas (o resúmela en una línea)."],
    tip:"Un gestor se lee por resultados. Encabeza cada cargo con el logro: «Condujo el licenciamiento institucional…», no «Responsable de…»."
  }
};

/* ===================== 4. GUÍA DIDÁCTICA POR SECCIÓN =====================
   que     → qué se escribe aquí
   formula → la fórmula para redactarlo bien
   pasos   → cómo llenarlo, en orden
   bien    → ejemplo correcto (ficticio)
   mal     → ejemplo incorrecto (ficticio) y por qué está mal
   error   → el error más frecuente
   checklist → qué revisar antes de pasar a la siguiente sección */
window.GUIDE = {
  personal: {
    icon:"👤", que:"Tus datos de identificación y de contacto.",
    formula:"Nombre completo tal como figura en tu documento · correo profesional · celular activo · ciudad.",
    pasos:["Escribe tu nombre completo: dos nombres y dos apellidos. Sin apodos ni abreviaturas.",
      "Usa un correo formal: nombre.apellido@dominio. Revisa que esté activo.",
      "Marca como «sensible» el domicilio y el documento de identidad: solo aparecerán en el CV documentado, nunca en el que publicas en internet.",
      "Agrega una red profesional (LinkedIn, Behance, GitHub, ORCID) si está actualizada."],
    bien:"Nombres: Lucía Andrea · Correo: lucia.fernandez@example.com · Celular: 999 000 222 · LinkedIn con foto y titular.",
    mal:"Correo «lu.fernandez2000@hotmail.com» con el domicilio y el DNI visibles en un CV que subes a un portal público.",
    error:"Publicar datos sensibles (DNI, domicilio, estado civil, fotos familiares) en un CV que circulará por internet.",
    checklist:["Mi nombre está completo y bien escrito.","Mi correo es formal y lo reviso a diario.","Mi celular tiene el formato 999 000 111.","DNI y domicilio están marcados como sensibles."]
  },
  perfil: {
    icon:"✍️", que:"Un párrafo de 3 a 5 líneas que resume quién eres profesionalmente.",
    formula:"[Profesión + nivel] + [años de experiencia] + [especialidad o logros medibles] + [qué aportas al puesto].",
    pasos:["Escribe la profesión tal como la acredita tu título; agrega el grado si lo tienes (técnico, licenciada, magíster, doctor).",
      "Pulsa los botones de cifras ({experiencia}, {docencia}, {horas}, {publicaciones}): se calculan solas con tus datos y se actualizan cuando cambies algo.",
      "Menciona un logro con número: «redujo los reclamos en 35 %», «formó a más de 600 estudiantes».",
      "Cierra con lo que aportas: qué problema resuelves mejor que otros.",
      "Reemplaza TODOS los textos entre [corchetes] antes de exportar: la hoja los resalta en amarillo."],
    bien:"Ingeniera industrial colegiada, con 8 años de experiencia en gestión de la calidad y mejora continua en la industria alimentaria. Lideró la certificación ISO 9001 de dos plantas y suma 424 horas de especialización. Aporta sistemas de calidad que reducen reclamos y costos de no conformidad.",
    mal:"«Soy una persona proactiva, responsable y con muchas ganas de aprender, con experiencia en diversas áreas.»",
    error:"Escribir «proactivo, responsable, trabajo en equipo»: son adjetivos que todos ponen y que ningún evaluador puede verificar.",
    checklist:["Mi perfil tiene entre 3 y 5 líneas.","No queda ningún texto entre [corchetes].","Incluye al menos un resultado medible.","Está escrito en tercera persona o en impersonal, no con «yo»."]
  },
  grados: {
    icon:"🎓", que:"Tus grados y títulos: técnico, bachiller, licenciatura, maestría, doctorado. Aquí NO van los cursos cortos.",
    formula:"Año · Nombre exacto del grado · Institución + fecha de expedición + registro (SUNEDU, colegiatura).",
    pasos:["Una fila por grado, del más reciente al más antiguo.",
      "Copia el nombre del grado tal como aparece en el diploma: «Licenciado en Educación, especialidad Arte y Diseño».",
      "En «Institución y fecha» agrega la fecha de expedición y, si corresponde, «registro SUNEDU» o el número de colegiatura.",
      "Pega en el enlace la consulta de SUNEDU o el diploma escaneado: eso es tu sustento.",
      "Si tu grado más alto es la secundaria o un título técnico, inclúyelo: nunca dejes esta sección vacía."],
    bien:"2012 · Licenciado en Educación, especialidad Arte y Diseño · Universidad Sur Pacífico, 05/04/2012 · registro SUNEDU",
    mal:"2023 · Curso de Diseño Gráfico Avanzado · Instituto Aurora (es un curso, no un grado: va en Capacitación).",
    error:"Mezclar cursos cortos con grados académicos. Un evaluador de concurso público separa grados de capacitación y resta puntaje si están confundidos.",
    checklist:["Cada grado tiene año, nombre exacto e institución.","Consta la fecha de expedición o el registro.","Ningún curso corto está en esta sección."]
  },
  experiencia: {
    icon:"💼", que:"Los trabajos, servicios y encargos que realizaste, en el sector público o privado.",
    formula:"Año o rango (2019–2023) · Empresa o institución · Verbo en pasado + qué hiciste + resultado medible · Tiempo de servicio.",
    pasos:["Empieza la función con un verbo de acción: Coordinó, Diseñó, Redujo, Implementó, Supervisó.",
      "Agrega el resultado siempre que puedas: porcentaje, número de personas, monto, tiempo ahorrado.",
      "Usa rangos de año «2019–2023»; el sistema ordena por el año más reciente.",
      "Indica el tiempo de servicio (años y meses) porque muchas convocatorias lo puntúan.",
      "Si el puesto lo exige, agrega el documento: contrato, orden de servicio o resolución."],
    bien:"2021–2025 · Corporación Andina de Alimentos · Jefa de Calidad: lideró la certificación ISO 9001:2015 y redujo los reclamos en 35 % (12 personas a cargo) · 4 años",
    mal:"«2019–2023 · Empresa X · Responsable de varias funciones administrativas.»",
    error:"Describir el puesto en lugar de tus logros. El evaluador ya sabe qué hace un asistente; quiere saber qué lograste tú.",
    checklist:["Cada fila empieza con un verbo de acción.","Al menos una fila tiene un resultado con número.","Los tiempos de servicio están completos.","No hay vacíos de años sin explicar."]
  },
  docente: {
    icon:"🧑‍🏫", que:"Tu experiencia enseñando: institutos, universidades, colegios, capacitaciones internas.",
    formula:"Año o rango · Institución · Cursos o unidades didácticas dictadas + documento (RD, contrato, OS) · Tiempo.",
    pasos:["Nombra los cursos o unidades didácticas que dictaste: es lo que se puntúa.",
      "Consigna el documento que lo acredita: RD, contrato, orden de servicio o constancia.",
      "Si tienes muchas asignaturas, agrupa por área: «Cursos de diseño: Identidad Visual, Diseño Editorial y Tipografía».",
      "Agrega el nivel (técnico, pregrado, posgrado) y la modalidad si es relevante."],
    bien:"2023–2025 · Instituto Tecnológico Aurora · Docente nombrado de Diseño Publicitario (RD 0456-2023) · 3 años",
    mal:"«Docente en varias instituciones educativas durante varios años.»",
    error:"No decir qué cursos dictaste ni con qué documento se acredita: sin eso, la experiencia docente no puntúa en un concurso.",
    checklist:["Están los cursos o áreas dictadas.","Cada fila cita su documento (RD / contrato / OS).","El nivel de enseñanza está indicado."]
  },
  capacitacion: {
    icon:"📚", que:"Cursos, diplomados, talleres y programas de actualización que hayas completado.",
    formula:"Año · Nombre del curso (con nivel si aplica) · Institución y fechas · Horas o créditos.",
    pasos:["Copia el nombre tal como figura en el certificado; agrega el nivel (básico, intermedio, avanzado).",
      "Escribe las horas como «120 h» o los créditos como «4 créd.»: 1 crédito equivale a 16 horas lectivas.",
      "Agrupa por tema si tienes muchos: diseño, pedagogía, ofimática, idiomas.",
      "Los filtros «100 h o más» y «60 h o más» usan esta columna: un curso sin horas queda fuera cuando se filtra.",
      "Ordena del más reciente al más antiguo dentro de cada grupo temático."],
    bien:"2023 · Diplomado en Gamificación y aprendizaje activo · Escuela de Posgrado Horizonte, 01/04 – 30/08/2023 · 200 h",
    mal:"«2023 · Curso de computación.» (sin institución, sin fechas, sin horas).",
    error:"Omitir las horas. Es el dato que las convocatorias puntúan y el que permite filtrar por duración.",
    checklist:["Cada curso tiene año, institución y fechas.","Cada curso tiene horas o créditos.","Hay una columna de enlace con el certificado.","Están agrupados por tema."]
  },
  produccion: {
    icon:"🎨", que:"Lo que has producido: piezas gráficas, publicaciones, manuales, materiales didácticos, libros, tutoriales.",
    formula:"Año · Nombre de la pieza o material · Cliente, editorial o institución · Formato o rol.",
    pasos:["Escribe el nombre real de la pieza: «Manual de identidad visual», «Libro de Arte 3.º de secundaria».",
      "Indica quién lo publicó o lo encargó: editorial, institución, cliente.",
      "En la cuarta columna pon el formato o tu rol: libro impreso, e-book, campaña, diagramación, ilustración.",
      "Agrega el enlace a la pieza o a la constancia de publicación."],
    bien:"2019 · «Códigos visuales andinos» · Editorial Kallpa Ediciones · Libro impreso (autor de textos e ilustraciones)",
    mal:"«Diseñé muchas cosas para distintas empresas.»",
    error:"No nombrar la pieza. Un portafolio se evalúa por obras concretas, no por la cantidad de trabajos afirmados.",
    checklist:["Cada pieza tiene nombre propio.","Consta quién la publicó o encargó.","Al menos una pieza tiene enlace verificable."]
  },
  ofimatica: {
    icon:"💻", que:"Programas y herramientas digitales que dominas, con su certificado.",
    formula:"Año · Programa + nivel y alcance · Plataforma o institución · Horas.",
    pasos:["Nombra el programa y su nivel: «Excel avanzado: tablas dinámicas y Power Query».",
      "Evita «manejo de Office»: no dice nada. Detalla qué haces con cada herramienta.",
      "Incluye herramientas de tu especialidad: Adobe, Figma, AutoCAD, Power BI, R, Python, PLC.",
      "Consigna las horas y el enlace al certificado."],
    bien:"2021 · Excel avanzado: tablas dinámicas y Power Query · Plataforma Aprende+, 20/02/2021 · 24 h",
    mal:"«Microsoft Office a nivel usuario.»",
    error:"Poner «computación básica» como única herramienta digital: resta valor a un perfil técnico o profesional.",
    checklist:["Cada herramienta tiene nivel y alcance.","Las horas están escritas.","Cada fila tiene su enlace."]
  },
  idiomas: {
    icon:"🌍", que:"Idiomas distintos a tu lengua materna.",
    formula:"Año · Idioma · Centro y fecha · Nivel del Marco Común Europeo (A1–C2).",
    pasos:["Usa siempre la escala del Marco Común Europeo: A1, A2, B1, B2, C1, C2.",
      "Indica si el nivel está certificado y por quién (instituto, examen internacional).",
      "Si el idioma es requisito del puesto, agrégalo también en tu perfil.",
      "No exageres el nivel: en la entrevista pueden probarlo."],
    bien:"2022 · Inglés · Centro de Idiomas Babel, 20/12/2022 · B2 (certificado)",
    mal:"«Inglés intermedio-avanzado.» (no es una escala verificable).",
    error:"Poner «inglés básico» cuando el puesto exige B2: es el motivo más frecuente de descarte automático.",
    checklist:["El nivel usa la escala A1–C2.","Consta el centro y la fecha.","El nivel coincide con lo que puedes sostener en una entrevista."]
  },
  publicaciones: {
    icon:"🔬", que:"Artículos, libros, capítulos, ponencias, tesis e informes técnicos.",
    formula:"APA 7: Autor, A. A. (Año). Título. Revista, vol(núm.), páginas. https://doi.org/…",
    pasos:["Pega el DOI y pulsa «🔎 Completar»: Crossref llena solos el título, los autores, la revista y las páginas.",
      "Si tienes ORCID, usa «Importar publicaciones desde ORCID» para no escribir todo a mano.",
      "Declara la indexación real: Scopus, Web of Science, SciELO, Latindex 2.0, DOAJ…",
      "Para libros y tesis no hay DOI: deja la columna vacía y agrega el enlace al repositorio.",
      "Agrega líneas y habilidades de investigación: orientan al evaluador sobre tu especialidad."],
    bien:"Paredes Villanueva, A. S., Rojas, L. M., & Torres, J. (2024). Bacterias degradadoras de hidrocarburos aisladas de suelos altoandinos. Revista Andina de Biociencias, 12(3), 145–162. https://doi.org/10.5555/demo.2024.001",
    mal:"«Artículo sobre bacterias publicado en una revista internacional.»",
    error:"Inventar indexaciones o DOI. Son datos verificables en línea: una sola invención invalida todo el expediente.",
    checklist:["Cada cita está en formato APA 7.","Los DOI son válidos y enlazan.","La indexación declarada es la real.","La sección está numerada y ordenada por año."]
  },
  calidad: {
    icon:"🏅", que:"Cargos de gestión, coordinación, calidad y acreditación: qué condujiste y con qué resultado.",
    formula:"Año o rango · Institución · Cargo: qué proceso condujiste y qué resultado obtuviste (con número) · Tiempo.",
    pasos:["Empieza por el resultado, no por la tarea: «Condujo el licenciamiento institucional de 3 programas…».",
      "Cuantifica: número de programas, de personas a cargo, de sedes, porcentaje de mejora.",
      "Nombra el modelo o la norma: ISO 9001, ISO 21001, modelo de acreditación, licenciamiento SUNEDU.",
      "Cita el documento que respalda el cargo: resolución de designación, RD, contrato."],
    bien:"2021–2025 · Instituto Tecnológico Aurora · Director académico: condujo el licenciamiento institucional y la acreditación de 3 programas (45 docentes a cargo) · 4 años",
    mal:"«Encargado de coordinar actividades académicas y administrativas.»",
    error:"Describir el cargo sin el resultado. En gestión, lo que se evalúa es el impacto de tu conducción.",
    checklist:["Cada cargo tiene un resultado con número.","Consta la norma o el modelo aplicado.","Hay documento que respalda el cargo."]
  },
  investigacion: {
    icon:"🧪", que:"Proyectos de investigación en los que participaste o dirigiste.",
    formula:"Año o rango · Nombre del proyecto · Entidad financiadora o institución + rol + monto · Horas o duración.",
    pasos:["Escribe el título del proyecto y la entidad que lo financió (fondo concursable, universidad, cooperación).",
      "Indica tu rol: investigador principal, coinvestigador, asistente de investigación.",
      "Consigna el monto adjudicado si lo hubo: es un indicador de confianza competitiva.",
      "Agrega el producto del proyecto: publicación, informe, protocolo, registro."],
    bien:"2020–2024 · «Suelos limpios»: biorremediación de suelos contaminados · Fondo Nacional de Ciencia (ficticio), investigadora principal (S/ 400 000) · 1 200 h",
    mal:"«Participé en proyectos de investigación de la universidad.»",
    error:"No indicar el rol ni el financiamiento: sin eso, el evaluador no puede medir tu aporte real.",
    checklist:["Cada proyecto tiene título y entidad.","Consta tu rol y el monto (si lo hubo).","Se nombra el producto entregado."]
  },
  reconocimientos: {
    icon:"🏆", que:"Premios, felicitaciones, resoluciones de reconocimiento, becas y distinciones.",
    formula:"Año · Institución que otorga · Motivo + número de documento · Periodo.",
    pasos:["Escribe el motivo concreto: «Resolución de felicitación por el proyecto de reciclaje escolar».",
      "Consigna el número de resolución o documento: es lo que lo hace verificable.",
      "No incluyas reconocimientos sin sustento: en el CV documentado cada fila exige su anexo.",
      "Máximo 5 o 6 filas: si tienes muchos, elige los de mayor jerarquía."],
    bien:"2023 · Municipalidad Distrital (ficticia) · Resolución de felicitación 0123-2023 por el proyecto «Colegio recicla» · 2023",
    mal:"«Reconocido por mi buen desempeño en varias oportunidades.»",
    error:"Incluir reconocimientos sin documento que los respalde: en un concurso público no puntúan.",
    checklist:["Cada reconocimiento cita su documento.","Consta quién lo otorga.","No hay más de 6 filas."]
  },
  _default: {
    icon:"📌", que:"Registros de esta sección (la creaste tú).",
    formula:"Año · Qué es · Quién lo emitió o dónde · Dato adicional (horas, periodo, formato).",
    pasos:["Una fila por registro, del más reciente al más antiguo.","Mantén el mismo criterio de columnas que las demás secciones.","Agrega el enlace del documento que lo sustenta."],
    bien:"2024 · Registro de ponente · Congreso Nacional (ficticio) · 2024",
    mal:"Filas sin año ni documento que las respalde.",
    error:"Crear secciones que duplican información ya registrada en otra sección.",
    checklist:["La sección tiene un propósito distinto a las demás.","Cada fila tiene año y respaldo."]
  }
};

/* Notas que aparecen sobre la hoja del CV mientras el modo guía está activo */
window.ANNOT = {
  head:    "El encabezado debe leerse en 3 segundos: nombre, titular y contacto. Es lo primero que mira el evaluador.",
  perfil:  "Perfil: 3–5 líneas con años de experiencia, especialidad y un logro medible. Las cifras entre llaves se calculan solas.",
  datos:   "Solo los datos necesarios. DNI y domicilio, únicamente en el CV documentado; nunca en el que publicas en línea.",
  seccion: "De lo más reciente a lo más antiguo. Cada fila debe poder sustentarse con su certificado, resolución o enlace."
};

/* ===================== 5. AVATARES DE LOS DEMOS =====================
   Son ilustraciones generadas (iniciales sobre degradado), NO fotos de personas reales. */
window.demoAvatar = (ini, c1, c2) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect width="300" height="380" fill="url(#g)"/><circle cx="150" cy="150" r="70" fill="#fff" opacity=".85"/><path d="M40 380c8-80 60-120 110-120s102 40 110 120z" fill="#fff" opacity=".85"/>
  <text x="150" y="168" text-anchor="middle" font-family="Arial" font-weight="700" font-size="52" fill="${c1}">${ini}</text></svg>`);

/* ===================== 6. LOS 6 EJEMPLOS (DEMOS) =====================
   Un ejemplo completo por nivel profesional + uno de diseño y docencia.
   Todo es ficticio: personas, instituciones, resoluciones, DOI y documentos. */
window.DEMO_ORDER = ["tecnico","profesional","especialista","investigador","directivo","diseno"];

const S_ = () => window.EMPTY_SECTIONS();
const fill = rowsById => S_().map(s => ({ ...s, rows:(rowsById[s.id] || []).map(r => { const x = [...r]; while (x.length < 5) x.push(""); return x; }) }));

window.DEMOS = {
  /* ---------------------------------------------------------------- 1 */
  tecnico: {
    label:"Técnico / Asistente", short:"Técnico",
    who:"Kevin Arturo Huamán Soto", role:"Técnico en mantenimiento y automatización industrial",
    nivel:"Técnico profesional titulado · 6 años de experiencia",
    tpl:"moderno", acc:"#0f7c7c",
    aprende:["Cómo presentar un perfil técnico en 1–2 páginas.","Cómo redactar funciones con resultado («redujo 20 % las paradas»).","Cómo acotar los cursos a los 6 más útiles para el puesto."],
    data: {
      personal: { nombre:"Kevin Arturo Huamán Soto", titular:"Técnico profesional en Mecatrónica Industrial · Mantenimiento y automatización",
        campos:[["Nombres","Kevin Arturo",false,""],["Apellidos","Huamán Soto",false,""],["Lugar y fecha de nac.","Huancayo, 14 de mayo de 1998 (ficticio)",false,""],["Nacionalidad","Peruana",false,""],
          ["Domicilio","Av. Los Pinos 123, Lima (ficticio)",true,""],["Documento de identidad","12345678 (ficticio)",true,""],["Celular","999 000 111 (ficticio)",false,""],["Correo","kevin.huaman@example.com",false,"mailto:kevin.huaman@example.com"]],
        redes:[["linkedin","kevin-huaman-demo"]] },
      perfilCustom:true,
      perfil:"Técnico profesional en Mecatrónica Industrial con {experiencia} años de experiencia en mantenimiento preventivo y correctivo de líneas de producción. Programa PLC Siemens S7-1200 y Allen-Bradley, aplica bloqueo y etiquetado (LOTO) y suma {horas} horas de capacitación técnica. Redujo en 20 % las paradas no programadas de una línea de envasado.",
      foto:null, research:{lines:"",skills:""},
      sections: fill({
        grados:[["2019","Profesional Técnico en Mecatrónica Industrial","Instituto Tecnológico Aurora (ficticio), expedido 20/12/2019"],
                ["2015","Educación secundaria completa","I.E. San Martín (ficticia), Huancayo"]],
        experiencia:[["2022–2025","Industrias Metálicas Rímac S.A.C. (ficticia)","Técnico de mantenimiento: redujo en 20 % las paradas no programadas de la línea de envasado y programó 4 PLC Siemens S7-1200","3 años 4 meses"],
          ["2020–2022","Corporación Andina de Alimentos (ficticia)","Asistente de mantenimiento eléctrico y neumático de 6 líneas de producción","2 años"],
          ["2019","Talleres Precisión E.I.R.L. (ficticio)","Practicante de automatización: montaje y cableado de tableros de control","6 meses"]],
        capacitacion:[["2024","Programación de PLC Siemens S7-1200 (nivel avanzado)","Centro Técnico Horizonte (ficticio), 05/02 – 30/04/2024","120 h"],
          ["2023","Seguridad eléctrica y bloqueo/etiquetado (LOTO)","Asociación de Seguridad Industrial (ficticia), 12/09/2023","16 h"],
          ["2022","Neumática y electroneumática industrial","Instituto Tecnológico Aurora (ficticio), 01/03 – 15/05/2022","80 h"],
          ["2021","Mantenimiento predictivo con análisis de vibraciones","Plataforma Aprende+ (ficticia), 20/11/2021","40 h"],
          ["2020","Lectura e interpretación de planos eléctricos","Plataforma Aprende+ (ficticia), 14/07/2020","30 h"],
          ["2019","Soldadura eléctrica por electrodo revestido (nivel básico)","SENATI Demo (ficticio), 10/02 – 28/03/2019","42 h"]],
        ofimatica:[["2023","AutoCAD Electrical: planos y esquemas de control","Plataforma Aprende+ (ficticia), 10/06/2023","30 h"],
          ["2021","Excel intermedio para reportes de mantenimiento","Plataforma Aprende+ (ficticia), 15/04/2021","20 h"]],
        idiomas:[["2021","Inglés técnico","Centro de Idiomas Babel (ficticio), 18/12/2021","A2"]],
        reconocimientos:[["2024","Industrias Metálicas Rímac S.A.C. (ficticia)","Reconocimiento «Colaborador del año» en el área de mantenimiento","2024"]]
      })
    }
  },

  /* ---------------------------------------------------------------- 2 */
  profesional: {
    label:"Profesional", short:"Profesional",
    who:"Lucía Andrea Fernández Ramos", role:"Ingeniera industrial · Gestión de la calidad",
    nivel:"Titulada y colegiada · 9 años de experiencia",
    tpl:"clasico", acc:"#1f3a5f",
    aprende:["Cómo equilibrar experiencia y formación en 2–3 páginas.","Cómo transformar responsabilidades en logros con porcentajes.","Cómo declarar colegiatura y registro SUNEDU."],
    data: {
      personal: { nombre:"Lucía Andrea Fernández Ramos", titular:"Ingeniera Industrial · Gestión de la calidad y mejora de procesos",
        campos:[["Nombres","Lucía Andrea",false,""],["Apellidos","Fernández Ramos",false,""],["Lugar y fecha de nac.","Arequipa, 3 de agosto de 1991 (ficticio)",false,""],["Nacionalidad","Peruana",false,""],
          ["Domicilio","Jr. Las Begonias 456, Lima (ficticio)",true,""],["Documento de identidad","87654321 (ficticio)",true,""],["Celular","999 000 222 (ficticio)",false,""],["Correo","lucia.fernandez@example.com",false,"mailto:lucia.fernandez@example.com"]],
        redes:[["linkedin","lucia-fernandez-demo"]] },
      perfilCustom:true,
      perfil:"Ingeniera industrial colegiada, con {experiencia} años de experiencia en gestión de la calidad y mejora continua en la industria alimentaria. Lideró la certificación ISO 9001:2015 de dos plantas y la implementación de Lean Six Sigma, con una reducción del 35 % en reclamos de clientes. Suma {horas} horas de especialización y {docencia} años de docencia universitaria en Gestión de Operaciones.",
      foto:null, research:{lines:"",skills:""},
      sections: fill({
        grados:[["2021","Maestra en Gestión de Operaciones","Universidad Nova de Lima (ficticia), 15/03/2021 · registro SUNEDU"],
          ["2016","Ingeniera Industrial (título profesional)","Universidad Sur Pacífico (ficticia), 10/06/2016 · registro SUNEDU"],
          ["2014","Bachiller en Ingeniería Industrial","Universidad Sur Pacífico (ficticia), 20/12/2014 · registro SUNEDU"]],
        experiencia:[["2021–2025","Corporación Andina de Alimentos (ficticia)","Jefa de Calidad: lideró la certificación ISO 9001:2015 de dos plantas y redujo los reclamos en 35 % (12 personas a cargo)","4 años"],
          ["2017–2021","Lácteos del Valle S.A. (ficticia)","Analista de procesos: implementó 5S y mantenimiento autónomo en 3 líneas de producción","4 años 3 meses"],
          ["2016","Consultora Mejora+ (ficticia)","Asistente de proyectos de mejora continua en 5 mypes agroindustriales","10 meses"]],
        docente:[["2023–2025","Universidad Nova de Lima (ficticia)","Docente a tiempo parcial del curso Gestión de Operaciones (pregrado)","2 años"]],
        capacitacion:[["2024","Diplomado en Analítica de Datos para la toma de decisiones","Escuela de Posgrado Horizonte (ficticia), 03/02 – 30/06/2024","240 h"],
          ["2022","Certificación Lean Six Sigma Green Belt","Instituto de Excelencia Operacional (ficticio), 10/10/2022","120 h"],
          ["2021","Auditor interno ISO 9001:2015","Asociación Peruana de Calidad (ficticia), 15/03 – 20/04/2021","40 h"],
          ["2019","Costos industriales y presupuestos","Universidad Sur Pacífico (ficticia), 12/05/2019","24 h"]],
        ofimatica:[["2023","Power BI: modelado y visualización de indicadores","Plataforma Aprende+ (ficticia), 12/08/2023","30 h"],
          ["2021","Excel avanzado: tablas dinámicas y Power Query","Plataforma Aprende+ (ficticia), 20/02/2021","24 h"]],
        idiomas:[["2022","Inglés","Centro de Idiomas Babel (ficticio), 20/12/2022","B2"],["2018","Portugués","Centro de Idiomas Babel (ficticio), 15/11/2018","A2"]],
        reconocimientos:[["2023","Corporación Andina de Alimentos (ficticia)","Premio a la innovación por el proyecto «Cero reclamos»","2023"]]
      })
    }
  },

  /* ---------------------------------------------------------------- 3 */
  especialista: {
    label:"Especialista / Docente", short:"Especialista",
    who:"Carlos Eduardo Mendoza Quispe", role:"Diseñador gráfico y docente de educación superior",
    nivel:"Licenciado en Educación + Maestría en Docencia Universitaria · 18 años",
    tpl:"creativo", acc:"#c9822b",
    aprende:["Cómo organizar 3–5 páginas sin perder al lector.","Cómo demostrar producción propia (materiales, manuales, libros).","Cómo citar resoluciones y contratos de la carrera docente."],
    data: {
      personal: { nombre:"Carlos Eduardo Mendoza Quispe", titular:"Docente de Educación Superior · Especialista en Diseño Gráfico y Publicidad",
        campos:[["Nombres","Carlos Eduardo",false,""],["Apellidos","Mendoza Quispe",false,""],["Lugar y fecha de nac.","Cusco, 22 de enero de 1985 (ficticio)",false,""],["Nacionalidad","Peruana",false,""],
          ["Domicilio","Calle Los Olivos 789, Lima (ficticio)",true,""],["Documento de identidad","11223344 (ficticio)",true,""],["Celular","999 000 333 (ficticio)",false,""],["Correo","carlos.mendoza@example.com",false,"mailto:carlos.mendoza@example.com"]],
        redes:[["behance","carlos-mendoza-demo"],["linkedin","carlos-mendoza-demo"],["instagram","carlos.disena.demo"]] },
      perfilCustom:true,
      perfil:"Diseñador gráfico y licenciado en Educación con {experiencia} años de experiencia en agencias y editoriales, y {docencia} años como docente de educación superior. Especialista en identidad visual, diseño editorial y publicidad digital; ha formado a más de 600 estudiantes y suma {horas} horas de actualización en diseño, pedagogía y herramientas digitales.",
      foto:null, research:{lines:"",skills:""},
      sections: fill({
        grados:[["2020","Maestro en Docencia Universitaria","Escuela de Posgrado Horizonte (ficticia), 12/09/2020 · registro SUNEDU"],
          ["2012","Licenciado en Educación, especialidad Arte y Diseño","Universidad Sur Pacífico (ficticia), 05/04/2012 · registro SUNEDU"],
          ["2007","Profesional Técnico en Diseño Gráfico","Instituto Tecnológico Aurora (ficticio), 18/12/2007"]],
        experiencia:[["2015–2022","Agencia Creativa Pixel Andino (ficticia)","Director de arte: condujo 24 campañas para marcas de consumo masivo y dirigió un equipo de 5 diseñadores","7 años"],
          ["2010–2015","Editorial Kallpa Ediciones (ficticia)","Diseñador editorial: diagramó 40 libros escolares y 3 colecciones de literatura infantil","5 años"],
          ["2008–2010","Imprenta Gráfica Sol (ficticia)","Diseñador de preprensa: preparó archivos para offset y controló pruebas de color","2 años"]],
        docente:[["2023–2025","Instituto Tecnológico Aurora (ficticio)","Docente nombrado de Diseño Publicitario (RD 0456-2023) · 22 estudiantes por ciclo","3 años"],
          ["2016–2023","Universidad Sur Pacífico (ficticia)","Docente a tiempo parcial: Identidad Visual, Diseño Editorial y Tipografía","7 años"]],
        capacitacion:[["2024","Inteligencia artificial generativa aplicada al diseño","Plataforma Aprende+ (ficticia), 10/05/2024","40 h"],
          ["2023","Diplomado en Gamificación y aprendizaje activo","Escuela de Posgrado Horizonte (ficticia), 01/04 – 30/08/2023","200 h"],
          ["2022","Diseño UX/UI para productos digitales","Plataforma Aprende+ (ficticia), 15/09/2022","60 h"],
          ["2021","Evaluación por competencias en educación superior","Instituto Tecnológico Aurora (ficticio), 10/02/2021","100 h"],
          ["2020","Accesibilidad web y diseño inclusivo (WCAG 2.1)","Plataforma Aprende+ (ficticia), 20/11/2020","30 h"],
          ["2019","Tipografía avanzada: jerarquías y retículas","Escuela de Diseño Demo (ficticia), 20/07/2019","24 h"]],
        produccion:[["2019","«Códigos visuales andinos» (libro de arte)","Editorial Kallpa Ediciones (ficticia)","Libro impreso · autor de textos e ilustraciones"],
          ["2018","«Manual de identidad visual»","Agencia Creativa Pixel Andino (ficticia)","Manual de marca · dirección de arte"],
          ["2016","«Antología escolar Kallpa» (3 volúmenes)","Editorial Kallpa Ediciones (ficticia)","Diagramación y portadas"]],
        ofimatica:[["2023","Adobe InDesign: publicaciones interactivas y EPUB","Plataforma Aprende+ (ficticia), 14/02/2023","24 h"],
          ["2022","Figma: prototipado y sistemas de diseño","Plataforma Aprende+ (ficticia), 10/10/2022","30 h"],
          ["2021","Adobe Illustrator avanzado: ilustración vectorial","Escuela de Diseño Demo (ficticia), 12/07/2021","40 h"]],
        idiomas:[["2017","Inglés","Centro de Idiomas Babel (ficticio), 12/12/2017","B1"]],
        reconocimientos:[["2022","Festival de Diseño Andino (ficticio)","Primer puesto, categoría Identidad Visual, por la campaña «Raíces»","2022"],
          ["2021","Instituto Tecnológico Aurora (ficticio)","Resolución de felicitación 0089-2021 por innovación docente","2021"]]
      })
    }
  },

  /* ---------------------------------------------------------------- 4 */
  investigador: {
    label:"Académico / Investigador", short:"Investigador",
    who:"Ana Sofía Paredes Villanueva", role:"Bióloga · Investigadora en biotecnología ambiental",
    nivel:"Doctora en Ciencias Biológicas · 18 años de docencia",
    tpl:"investigador", acc:"#3d3474",
    aprende:["Cómo citar en APA 7 con DOI e indexación verificable.","Cómo usar identificadores (ORCID, Google Académico).","Cómo leer las métricas de producción científica que resume la franja superior."],
    data: {
      personal: { nombre:"Ana Sofía Paredes Villanueva", titular:"Doctora en Ciencias Biológicas · Investigadora en biotecnología ambiental",
        campos:[["Nombres","Ana Sofía",false,""],["Apellidos","Paredes Villanueva",false,""],["Lugar y fecha de nac.","Trujillo, 9 de noviembre de 1982 (ficticio)",false,""],["Nacionalidad","Peruana",false,""],
          ["Domicilio","Av. Universitaria 1010, Lima (ficticio)",true,""],["Documento de identidad","44332211 (ficticio)",true,""],["Celular","999 000 444 (ficticio)",false,""],["Correo","ana.paredes@example.com",false,"mailto:ana.paredes@example.com"]],
        redes:[["orcid","0000-0002-1825-0097"],["scholar","https://scholar.google.com/citations?user=DEMO"],["researchgate","Ana-Paredes-Demo"]] },
      perfilCustom:true,
      perfil:"Doctora en Ciencias Biológicas e investigadora en biotecnología ambiental: {publicaciones} publicaciones científicas, {docencia} años de docencia universitaria y dirección de proyectos con financiamiento concursable. Sus líneas de investigación son la biorremediación de suelos contaminados y la microbiología de ambientes altoandinos.",
      foto:null,
      research:{ lines:"Biorremediación de suelos contaminados; Microbiología de ambientes altoandinos; Bioprospección de enzimas",
                 skills:"Diseño experimental; Análisis estadístico en R; Secuenciación de nueva generación; Revisión sistemática PRISMA; Redacción científica en inglés" },
      sections: fill({
        grados:[["2018","Doctora en Ciencias Biológicas","Universidad Nova de Lima (ficticia), 22/11/2018 · registro SUNEDU"],
          ["2011","Maestra en Microbiología","Universidad Sur Pacífico (ficticia), 14/07/2011 · registro SUNEDU"],
          ["2007","Licenciada en Biología","Universidad Sur Pacífico (ficticia), 30/03/2007 · registro SUNEDU"]],
        publicaciones:[
          ["2024","Bacterias degradadoras de hidrocarburos aisladas de suelos altoandinos: potencial para biorremediación","Revista Andina de Biociencias (ficticia)","Artículo científico","","Paredes Villanueva, A. S., Rojas, L. M., & Torres, J.","10.5555/demo.2024.001","Scopus; SciELO","12(3), 145–162"],
          ["2023","Enzimas termoestables de microorganismos de lagunas andinas: una revisión sistemática","Journal of Environmental Microbiology Demo","Artículo de revisión","","Paredes Villanueva, A. S., & Gómez, R.","10.5555/demo.2023.014","Web of Science","8(1), 33–58"],
          ["2022","Microbiología ambiental aplicada","Editorial Universitaria Nova (ficticia)","Libro","","Paredes Villanueva, A. S.","","","312 pp."],
          ["2021","Biorremediación in situ en zonas mineras: lecciones de tres estudios de caso","Congreso Latinoamericano de Biotecnología (ficticio)","Ponencia / actas de congreso","","Paredes Villanueva, A. S., & Quispe, D.","","Latindex Catálogo 2.0","pp. 211–219"]],
        docente:[["2019–2025","Universidad Nova de Lima (ficticia)","Docente principal: Microbiología Ambiental y Metodología de la Investigación (pregrado y posgrado)","6 años"],
          ["2012–2019","Universidad Sur Pacífico (ficticia)","Docente contratada: Biología Celular y Microbiología General","7 años"]],
        investigacion:[["2020–2024","«Suelos limpios»: biorremediación de suelos contaminados por hidrocarburos","Fondo Nacional de Ciencia (ficticio) · investigadora principal (S/ 400 000)","1 200 h"],
          ["2016–2019","Bioprospección de enzimas en lagunas altoandinas","Laboratorio BioAndes (ficticio) · coinvestigadora","800 h"],
          ["2013–2014","Inventario microbiano de suelos agrícolas del valle","Universidad Sur Pacífico (ficticia) · asistente de investigación","400 h"]],
        capacitacion:[["2023","Análisis de datos ómicos con R y Bioconductor","Escuela de Posgrado Horizonte (ficticia), 05/06 – 30/08/2023","120 h"],
          ["2021","Redacción de artículos científicos de alto impacto","Plataforma Aprende+ (ficticia), 12/03/2021","40 h"],
          ["2019","Bioseguridad en laboratorios de nivel 2","Instituto de Salud Demo (ficticio), 20/09/2019","24 h"]],
        idiomas:[["2016","Inglés","Centro de Idiomas Babel (ficticio), 10/10/2016","C1"]],
        reconocimientos:[["2024","Sociedad de Biotecnología (ficticia)","Premio a la mejor investigación joven en biotecnología ambiental","2024"],
          ["2020","Universidad Nova de Lima (ficticia)","Resolución de reconocimiento por producción científica 2019","2020"]]
      })
    }
  },

  /* ---------------------------------------------------------------- 5 */
  directivo: {
    label:"Gestión / Directivo", short:"Gestión",
    who:"Jorge Luis Salazar Córdova", role:"Director académico · Calidad y acreditación",
    nivel:"Magíster en Gestión Educativa · 15 años en cargos directivos",
    tpl:"ejecutivo", acc:"#22303f",
    aprende:["Cómo encabezar cada cargo con el resultado, no con la tarea.","Cómo cuantificar la gestión: programas, personas, procesos, metas.","Cómo resumir en 2–3 páginas una carrera larga."],
    data: {
      personal: { nombre:"Jorge Luis Salazar Córdova", titular:"Director académico · Gestión de la calidad educativa y acreditación",
        campos:[["Nombres","Jorge Luis",false,""],["Apellidos","Salazar Córdova",false,""],["Lugar y fecha de nac.","Piura, 30 de junio de 1976 (ficticio)",false,""],["Nacionalidad","Peruana",false,""],
          ["Domicilio","Av. Central 2020, Lima (ficticio)",true,""],["Documento de identidad","55667788 (ficticio)",true,""],["Celular","999 000 555 (ficticio)",false,""],["Correo","jorge.salazar@example.com",false,"mailto:jorge.salazar@example.com"]],
        redes:[["linkedin","jorge-salazar-demo"]] },
      perfilCustom:true,
      perfil:"Gestor educativo con {experiencia} años en cargos directivos y {docencia} años de docencia en educación superior. Condujo dos procesos de licenciamiento institucional y uno de acreditación, implementó un sistema de gestión de la calidad y elevó la tasa de titulación en 18 puntos porcentuales. Cuenta con {horas} horas de formación en gestión y liderazgo.",
      foto:null, research:{lines:"",skills:""},
      sections: fill({
        grados:[["2014","Maestro en Gestión Educativa","Escuela de Posgrado Horizonte (ficticia), 20/08/2014 · registro SUNEDU"],
          ["2002","Licenciado en Educación","Universidad Sur Pacífico (ficticia), 15/02/2002 · registro SUNEDU"]],
        experiencia:[["2021–2025","Instituto Tecnológico Aurora (ficticio)","Director académico: condujo el licenciamiento institucional y la acreditación de 3 programas (45 docentes a cargo)","4 años"]],
        calidad:[["2016–2021","Instituto Tecnológico Aurora (ficticio)","Coordinador del Área de Calidad: implementó el sistema de gestión ISO 21001:2018 y elevó la tasa de titulación en 18 puntos","5 años"],
          ["2010–2016","Colegio Integral del Norte (ficticio)","Subdirector de formación general: rediseñó el plan de tutoría de 900 estudiantes","6 años"]],
        docente:[["2005–2016","Universidad Sur Pacífico (ficticia)","Docente de Gestión Educativa y Planificación Curricular (pregrado)","11 años"]],
        capacitacion:[["2024","Programa de Alta Dirección en Instituciones Educativas","Escuela de Posgrado Horizonte (ficticia), 01/03 – 30/11/2024","300 h"],
          ["2022","Auditor líder ISO 21001:2018","Asociación Peruana de Calidad (ficticia), 15/06/2022","40 h"],
          ["2020","Liderazgo y gestión del cambio organizacional","Plataforma Aprende+ (ficticia), 12/10/2020","60 h"],
          ["2018","Modelo de acreditación para la educación superior","Agencia de Acreditación Demo (ficticia), 20/04/2018","100 h"]],
        ofimatica:[["2021","Power BI para tableros de gestión académica","Plataforma Aprende+ (ficticia), 10/08/2021","24 h"]],
        idiomas:[["2015","Inglés","Centro de Idiomas Babel (ficticio), 18/12/2015","B1"]],
        reconocimientos:[["2023","Gobierno Regional (ficticio)","Reconocimiento por la acreditación institucional de 3 programas","2023"],
          ["2019","Instituto Tecnológico Aurora (ficticio)","Resolución de felicitación 0044-2019 por la gestión de la calidad","2019"]]
      })
    }
  },

  /* ---------------------------------------------------------------- 6 */
  diseno: {
    label:"Diseño + Docencia (Mg.)", short:"Diseño · Mg.",
    who:"Diana Lucero Chávez Bustamante", role:"Diseñadora gráfica, magíster y docente",
    nivel:"Magíster en Diseño · 13 años de experiencia y 7 de docencia",
    tpl:"moderno", acc:"#8b2f3c",
    aprende:["Cómo mostrar producción gráfica verificable (piezas y libros).","Cómo declarar herramientas Adobe con nivel y horas.","Cómo equilibrar producción gráfica y docencia en un mismo CV."],
    data: {
      personal: { nombre:"Diana Lucero Chávez Bustamante", titular:"Diseñadora Gráfica · Magíster en Diseño · Docente de educación superior",
        campos:[["Nombres","Diana Lucero",false,""],["Apellidos","Chávez Bustamante",false,""],["Lugar y fecha de nac.","Lima, 17 de marzo de 1988 (ficticio)",false,""],["Nacionalidad","Peruana",false,""],
          ["Domicilio","Calle Las Camelias 321, Lima (ficticio)",true,""],["Documento de identidad","66554433 (ficticio)",true,""],["Celular","999 000 666 (ficticio)",false,""],["Correo","diana.chavez@example.com",false,"mailto:diana.chavez@example.com"]],
        redes:[["behance","diana-chavez-demo"],["linkedin","diana-chavez-demo"],["web","https://www.dianachavez-demo.example.com"]] },
      perfilCustom:true,
      perfil:"Diseñadora gráfica con grado de magíster, {experiencia} años de experiencia en producción gráfica y editorial, y {docencia} años como docente de educación superior. Especialista en identidad visual, diseño editorial y preprensa; conduce proyectos de marca de principio a fin y suma {horas} horas de capacitación en diseño, producción y pedagogía.",
      foto:null, research:{lines:"",skills:""},
      sections: fill({
        grados:[["2018","Magíster en Diseño Estratégico e Innovación","Escuela de Posgrado Horizonte (ficticia), 30/11/2018 · registro SUNEDU"],
          ["2011","Licenciada en Diseño Gráfico Profesional","Universidad Sur Pacífico (ficticia), 22/06/2011 · registro SUNEDU"],
          ["2007","Profesional Técnico en Diseño Publicitario","Instituto Tecnológico Aurora (ficticio), 18/12/2007"]],
        experiencia:[["2019–2025","Estudio Gráfico Trazo & Tinta (ficticio)","Directora de arte: dirigió 18 proyectos de identidad visual y coordinó un equipo de 4 diseñadores","6 años"],
          ["2013–2019","Imprenta Offset del Centro (ficticia)","Diseñadora y supervisora de preprensa: controló 120 publicaciones anuales sin reprocesos","6 años"],
          ["2008–2013","Agencia Creativa Pixel Andino (ficticia)","Diseñadora gráfica: piezas para campañas y packaging","5 años"]],
        docente:[["2018–2025","Instituto Tecnológico Aurora (ficticio)","Docente de Diseño Editorial y Producción Gráfica (RD 0312-2018)","7 años"]],
        capacitacion:[["2024","Diplomado en Dirección de Arte y Gestión de Proyectos Creativos","Escuela de Posgrado Horizonte (ficticia), 04/03 – 28/06/2024","180 h"],
          ["2023","Adobe InDesign avanzado: libros, revistas y EPUB","Centro de Certificación Adobe Demo (ficticio), 10/07 – 20/09/2023","60 h"],
          ["2022","Preprensa digital y gestión de color (ICC)","Imprenta Offset del Centro (ficticia), 15/08/2022","24 h"],
          ["2021","Metodologías activas para la enseñanza del diseño","Instituto Tecnológico Aurora (ficticio), 10/01 – 28/02/2021","80 h"],
          ["2020","Tipografía y retículas editoriales","Escuela de Diseño Demo (ficticia), 20/07/2020","40 h"],
          ["2019","Adobe Illustrator avanzado: ilustración vectorial","Centro de Certificación Adobe Demo (ficticio), 12/05/2019","30 h"]],
        produccion:[["2023","«Cuaderno de taller: retículas y color»","Instituto Tecnológico Aurora (ficticio)","Material didáctico · autora y diagramación"],
          ["2021","«Identidad visual para la Feria del Libro»","Estudio Gráfico Trazo & Tinta (ficticio)","Campaña integral · dirección de arte"],
          ["2017","«Antología ilustrada del Centro»","Imprenta Offset del Centro (ficticia)","Libro impreso · diseño y preprensa"]],
        ofimatica:[["2024","Adobe Photoshop: retoque para impresión","Centro de Certificación Adobe Demo (ficticio), 18/03/2024","24 h"],
          ["2022","Figma: sistemas de diseño y prototipos","Plataforma Aprende+ (ficticia), 05/09/2022","30 h"],
          ["2021","Excel intermedio para presupuestos de producción","Plataforma Aprende+ (ficticia), 22/02/2021","20 h"]],
        idiomas:[["2019","Inglés","Centro de Idiomas Babel (ficticio), 14/11/2019","B2"],["2015","Portugués","Centro de Idiomas Babel (ficticio), 20/10/2015","A2"]],
        reconocimientos:[["2022","Cámara de Industrias Gráficas (ficticia)","Segundo puesto en el Concurso Nacional de Diseño Editorial","2022"],
          ["2020","Instituto Tecnológico Aurora (ficticio)","Resolución de felicitación 0117-2020 por el material didáctico del taller","2020"]]
      })
    }
  }
};

/* Metadatos de nivel de cada demo (se muestran en los botones y en las tarjetas) */
Object.entries(window.DEMOS).forEach(([k, d]) => {
  const n = window.LEVEL_NOTES[k === "diseno" ? "especialista" : k];
  d.key = k; d.pages = n ? n.pages : ""; d.limit = n ? n.limit : ""; d.alcance = n ? n.alcance : "";
});
