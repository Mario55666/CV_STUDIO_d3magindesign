# CV Studio · edición pública — Guía didáctica para elaborar tu currículum

Aplicativo web (HTML + JavaScript, sin servidor y sin registro) que **enseña** a
elaborar un currículum vitae y luego lo exporta en PDF, Word, Markdown y CSV.

Firma: **d3magindesign 2026 · Mg. Mario Quiroz Martínez**

---

## 1. Cómo abrirlo

1. Descomprime la carpeta completa.
2. Abre **`index.html`** con doble clic (Chrome, Edge, Firefox o Safari).
3. No requiere instalación. La primera vez necesita internet solo para las
   tipografías y para las librerías de PDF/Word; después funciona sin conexión.
4. Los datos se guardan **en tu navegador** (localStorage). Para pasar tu CV a
   otra computadora usa **⤓ Respaldo .json** y **⤒ Importar .json**.

---

## 2. Los 6 ejemplos guiados (botones de demo)

En el **Paso 0 · Ejemplos** hay un botón por cada nivel profesional. Cada botón
carga un CV completo y **ficticio** (personas, instituciones, resoluciones, DOI y
documentos inventados) para que veas cómo se llena cada parte:

| Botón | Ejemplo | Nivel y extensión |
|---|---|---|
| Técnico / Asistente | Kevin Arturo Huamán Soto — técnico en mantenimiento | 1–2 págs. · hasta 6 cursos/sección |
| Profesional | Lucía Andrea Fernández Ramos — ingeniera industrial | 2–3 págs. · hasta 8 cursos/sección |
| Especialista / Docente | Carlos Eduardo Mendoza Quispe — diseño y docencia superior | 3–5 págs. · todos los cursos |
| Académico / Investigador | Ana Sofía Paredes Villanueva — bióloga, doctora | 3–6 págs. · todos los cursos |
| Gestión / Directivo | Jorge Luis Salazar Córdova — director académico | 2–3 págs. · hasta 5 cursos/sección |
| Diseño + Docencia (Mg.) | Diana Lucero Chávez Bustamante — diseño gráfico, magíster | 3–5 págs. · todos los cursos |

Al cargar un ejemplo la hoja muestra la cinta **«EJEMPLO FICTICIO»** (no se
imprime) y aparece el aviso con tres acciones: *Kit de llenado*, *Usar como base*
y *✏️ Empezar mi CV*.

---

## 3. Cómo enseña el aplicativo

| Recurso | Dónde está | Para qué sirve |
|---|---|---|
| **Botones de ejemplo** | Paso 0 y tarjetas de nivel | Ver un CV completo del nivel al que postulas |
| **¿Qué debe llevar?** | Tarjetas de nivel (Paso 2) | Alcance, extensión, límite de cursos, qué incluir, qué evitar y un consejo |
| **Guía por sección** | Dentro del editor (Paso 3) | Fórmula de redacción, pasos, ejemplo correcto, ejemplo incorrecto, error frecuente y checklist |
| **Kit de llenado** | Botón en la barra superior y en el aviso | Guía completa + plantilla con corchetes, para copiar o descargar en `.md` |
| **Progreso del CV** | Barra lateral de la vista previa | Qué falta, con enlace directo a cada pendiente |
| **Notas 💡 sobre la hoja** | Paso 4 | Consejos de estudio; se ocultan con el botón **💡 Ejemplo** y no se imprimen |
| **Recorrido guiado** | Botón 🧭 (se abre solo la primera visita) | 8 pasos que explican todo el flujo |

---

## 4. Los 6 pasos de trabajo

0. **Mira un ejemplo** (Paso 0).
1. **Modalidad** — *Documentado* (con anexos foliados, para concursos) o
   *No documentado* (ligero, para correo y portales).
2. **Diseño, nivel profesional y foto** — 6 formatos visuales, 5 niveles,
   formas y marcos de foto, color de acento y marca/logo opcional.
3. **Datos** — editor por pestañas, con la guía didáctica en cada una.
4. **Vista previa** — la hoja A4 exactamente como se imprimirá.
5. **Evidencias** — arrastra tu carpeta: cada archivo se asocia a su fila por el
   código del nombre (por ejemplo `04-03_2024_Instituto_Curso.pdf`).
6. **Exportar** — PDF, Word (.docx), Markdown, CSV, PDF de anexos, presentación
   animada de certificados, respaldo `.json` y prompt de redacción para IA.

La firma **d3magindesign 2026 · Mg. Mario Quiroz Martínez** aparece en el pie de
la web, al pie de la hoja del CV, en el pie de página del Word y al final del
Markdown y del kit de llenado.

---

## 5. Traer un CV que ya existe en Word

En **«📄 Abrir Word / pegar texto»** (barra de herramientas del Paso 3, atajo del
inicio y tarjeta del Paso 6):

1. Elige tu archivo **.docx** —o pega el texto de tu CV— y se lee **en tu equipo**.
2. El aplicativo reconoce nombre, titular, correo, celular, documento, perfil y
   clasifica las filas por sección (formación, experiencia, capacitación,
   informática, idiomas, reconocimientos…), extrayendo años, horas y niveles A1–C2.
3. Antes de aplicar nada, se muestra **qué encontró** y cuántas filas por sección.
4. Al pulsar **«Aplicar al formulario»** se reemplaza el contenido actual
   (por eso conviene guardar antes una versión en la biblioteca).
5. También puedes **descargar lo detectado en .json** para revisarlo con calma.

Nunca se aplica nada sin tu confirmación, y el archivo no se sube a ningún sitio.
Si tu CV está en **.doc** antiguo, ábrelo en Word y guárdalo como **.docx**; si
está en PDF, copia el texto y usa la pestaña *«pegar texto»*.

---

## 6. Mi biblioteca: guardar, actualizar y llevar tus versiones

**«🗄 Mi biblioteca»** guarda **versiones completas** de tu CV (datos, foto,
diseño y nivel) en el almacenamiento del propio navegador:

| Acción | Para qué sirve |
|---|---|
| 💾 Guardar versión | Congela el estado actual con un nombre y una nota («versión para la convocatoria A, sin foto») |
| ⤒ Abrir | Recupera esa versión; puedes traer también el diseño o conservar el actual |
| ⤓ Descargar .json | Se lleva la versión a **tu carpeta de descargas**, para otro equipo o como copia de seguridad |
| ✎ Renombrar · ⧉ Duplicar · 🗑 Eliminar | Mantener el orden; «Duplicar» sirve para crear una variante y editarla |
| ⤒ Importar un .json | Devuelve a la biblioteca una versión descargada antes |

### Dónde viven tus datos (importante)

- Esta página **no tiene servidor ni base de datos**: es un archivo HTML que se
  ejecuta en tu navegador.
- **Nada de lo que escribes se guarda en el repositorio ni en el sitio donde está
  publicada la página.** No hay envío de datos por internet.
- La biblioteca vive **solo en este navegador y este equipo**. Si borras los datos
  del navegador, usas el modo incógnito o cambias de computadora, **no viaja
  contigo**. Para eso existe el **.json** de cada versión, que sí es un archivo tuyo.
- En el modo **no documentado** nada sale del equipo. Las únicas consultas a
  internet son opcionales: completar una publicación por **DOI** (Crossref),
  importar desde **ORCID**, las tipografías y las librerías de PDF/Word.

---

## 7. Estructura de archivos

```
index.html     Interfaz, estilos base y orden de carga de los scripts
ui.css         Barra superior, atajos, privacidad, diálogos de importación y biblioteca
data.js        Plantilla vacía · guía didáctica (GUIDE, ANNOT) · niveles · 6 ejemplos ficticios
research.js    Redes e identificadores · publicaciones APA 7 (DOI/Crossref/ORCID)
guide.js       Capa didáctica: botones de demo, modales, kit de llenado, progreso y recorrido
app.js         Motor: editor, hoja del CV, filtros, detección de repeticiones y exportaciones
importar.js    Lector de .docx (ZIP + OOXML) y reconocimiento de datos; respaldo .json
biblioteca.js  Biblioteca local de versiones (IndexedDB/localStorage) y aviso de privacidad
viewer.js      Visor animado de certificados
test/          Verificación automática (ver abajo)
```

**Orden de carga obligatorio:** `data.js` → `research.js` → `guide.js` → `app.js`
→ `importar.js` → `biblioteca.js` → `viewer.js`. `app.js` llama a `bootGuide()` al
terminar su inicialización y este arranca los módulos que van después.

---

## 8. Verificación automática

Con Node.js instalado, dentro de la carpeta:

```bash
node test/check.mjs    # estructura: ids del DOM, símbolos, orden de carga, datos de los ejemplos, firma, privacidad y menú
node test/smoke.mjs    # arranque real con DOM simulado: los 6 ejemplos, la hoja, el progreso, el kit, la importación y la biblioteca
node test/docx.mjs     # lector de Word: descomprime un .docx real y comprueba el reconocimiento de datos y secciones
```

Las tres pruebas deben terminar con `RESULTADO: 0 error(es), 0 aviso(s)`.

También puedes ejecutarlas todas juntas con el `package.json` incluido:

```bash
npm test
```

---

## 9. Privacidad

Todo se procesa en el equipo del usuario (el navegador). No hay servidor, no hay
base de datos y no se envía nada a internet, salvo las consultas opcionales ya
descritas (DOI en Crossref, importación desde ORCID) y las librerías y tipografías
de CDN.

> **Aviso didáctico:** los 6 ejemplos son ficticios. Cualquier parecido con
> personas, instituciones o publicaciones reales es coincidencia.

© 2026 d3magindesign · Mg. Mario Quiroz Martínez
