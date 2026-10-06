# CV Studio · edición pública

**Guía didáctica para elaborar tu currículum vitae.** Aplicación web que enseña a llenar un CV
—con ejemplos completos por nivel profesional y una guía sección por sección— y lo exporta en
PDF, Word, Markdown y CSV.

No tiene servidor, no tiene base de datos y no requiere registro: es un conjunto de archivos
estáticos que se ejecutan en el navegador de quien la usa.

> **d3magindesign 2026 · Mg. Mario Quiroz Martínez**

---

## Índice

- [1. Qué resuelve](#1-qué-resuelve)
- [2. Cómo abrirlo](#2-cómo-abrirlo)
- [3. Los 6 ejemplos guiados](#3-los-6-ejemplos-guiados)
- [4. Los 5 niveles profesionales](#4-los-5-niveles-profesionales)
- [5. Cómo enseña: recursos didácticos](#5-cómo-enseña-recursos-didácticos)
- [6. Flujo de trabajo](#6-flujo-de-trabajo)
- [7. Traer un CV que ya existe en Word](#7-traer-un-cv-que-ya-existe-en-word)
- [8. Mi biblioteca: guardar, actualizar y llevar versiones](#8-mi-biblioteca-guardar-actualizar-y-llevar-versiones)
- [9. Privacidad: dónde viven los datos](#9-privacidad-dónde-viven-los-datos)
- [10. Estructura del proyecto](#10-estructura-del-proyecto)
- [11. Arquitectura interna](#11-arquitectura-interna)
- [12. Verificación automática](#12-verificación-automática)
- [13. Limitaciones conocidas](#13-limitaciones-conocidas)
- [14. Autoría y licencia](#14-autoría-y-licencia)

---

## 1. Qué resuelve

La mayoría de las personas no sabe **qué debe llevar** un currículum ni **cómo redactarlo**, y
menos aún cuánto debe medir según el puesto al que postula. Esta aplicación responde eso antes
de pedir un solo dato:

| Problema habitual | Cómo lo resuelve |
|---|---|
| «No sé por dónde empezar» | 6 ejemplos completos y ficticios, uno por nivel profesional |
| «No sé qué incluir ni qué omitir» | Modal **«¿Qué debe llevar?»** por nivel, con extensión y límite de cursos |
| «No sé cómo redactar mis logros» | Fórmula de redacción + ejemplo correcto + ejemplo incorrecto + error frecuente en cada sección |
| «No recuerdo cuántas horas de capacitación tengo» | Las cifras `{experiencia}`, `{docencia}`, `{horas}` y `{publicaciones}` se calculan solas |
| «Tengo mi CV en Word y no quiero reescribirlo» | Lector de `.docx` que propone cómo llenar el formulario |
| «Se me perdió la versión que envié» | Biblioteca local de versiones + descarga en `.json` |
| «¿Esto se sube a algún servidor?» | No. Todo ocurre en el navegador, con aviso explícito en pantalla |

**Formatos de salida (9):** PDF · Word `.docx` · Markdown `.md` · CSV · PDF de anexos foliados ·
presentación animada de certificados · respaldo `.json` · kit de llenado `.md` · prompt de
redacción para IA.

---

## 2. Cómo abrirlo

1. Descomprime la carpeta completa.
2. Abre **`index.html`** con doble clic (Chrome, Edge, Firefox o Safari).
3. No hay nada que instalar.

La primera vez necesita internet solo para las tipografías (Google Fonts) y las librerías de
PDF y Word (CDN). Después funciona sin conexión.

> **Si ves una versión antigua**, el navegador guardó el HTML en caché: recarga con
> **Ctrl + F5**. Todos los recursos van versionados (`?v=18`) y el `<head>` incluye
> `Cache-Control: no-cache` para evitarlo.

---

## 3. Los 6 ejemplos guiados

Cada botón del **Paso 0** carga un currículum completo y **ficticio** —personas, instituciones,
resoluciones, DOI y documentos inventados— para mostrar cómo se llena cada parte:

| Botón | Persona (ficticia) | Contenido | Diseño |
|---|---|---|---|
| **Técnico / Asistente** | Kevin Arturo Huamán Soto — mecatrónica | 15 filas · 6 secciones | Moderno · 1–2 págs. |
| **Profesional** | Lucía Andrea Fernández Ramos — ingeniería industrial | 16 filas · 7 secciones | Clásico · 2–3 págs. |
| **Especialista / Docente** | Carlos Eduardo Mendoza Quispe — diseño y docencia superior | 23 filas · 8 secciones | Creativo · 3–5 págs. |
| **Académico / Investigador** | Ana Sofía Paredes Villanueva — biología, doctorado | 18 filas · 7 secciones | Investigador · 3–6 págs. |
| **Gestión / Directivo** | Jorge Luis Salazar Córdova — dirección académica | 14 filas · 8 secciones | Ejecutivo · 2–3 págs. |
| **Diseño + Docencia (Mg.)** | Diana Lucero Chávez Bustamante — diseño gráfico, magíster | 23 filas · 8 secciones | Moderno · 3–5 págs. |

Al cargar un ejemplo, la hoja muestra la cinta **«EJEMPLO FICTICIO · DATOS INVENTADOS»** (no se
imprime) y aparece un aviso con tres salidas: **Kit de llenado**, **Usar como base** y
**✏️ Empezar mi CV**.

---

## 4. Los 5 niveles profesionales

Elegir el nivel define la extensión, el orden de las secciones, el titular sugerido, el perfil
de arranque y cuántos cursos se muestran.

| Nivel | Para qué sirve | Extensión | Cursos por sección |
|---|---|---|---|
| **Técnico / Asistente** | Producción gráfica y manejo de software | 1–2 págs. | hasta 6 |
| **Profesional** | Licenciado: diseño y educación en equilibrio | 2–3 págs. | hasta 8 |
| **Especialista / Docente** | Docencia superior y especialización | 3–5 págs. | todos |
| **Académico / Investigador** | Grados, investigación y producción | 3–6 págs. | todos |
| **Gestión / Directivo** | Cargos de coordinación y calidad | 2–3 págs. | hasta 5 |

Cada tarjeta de nivel ofrece **«📋 ¿Qué debe llevar?»** (modal con qué incluir, qué evitar, un
consejo y qué se aprende con su ejemplo) y **«🧪 Ver ejemplo»**.

---

## 5. Cómo enseña: recursos didácticos

| Recurso | Dónde está | Qué aporta |
|---|---|---|
| **Botones de ejemplo** | Paso 0 y tarjetas de nivel | Un CV completo del nivel al que se postula |
| **¿Qué debe llevar?** | Tarjetas de nivel (Paso 2) | Alcance, extensión, límite, qué incluir y qué evitar |
| **Guía por sección** | Dentro del editor (Paso 3) | 14 bloques con: qué va, fórmula, pasos, ejemplo correcto, ejemplo incorrecto, error frecuente y checklist |
| **Kit de llenado** | Botón 🗒 (barra, aviso y progreso) | Guía completa + plantilla con corchetes, para copiar o descargar en `.md` |
| **Progreso del CV** | Barra lateral del Paso 4 | Qué falta, con enlace directo a cada pendiente |
| **Notas 💡 sobre la hoja** | Paso 4 | Consejos de estudio que no se imprimen |
| **Recorrido guiado 🧭** | Botón en el inicio (se abre solo la primera visita) | 9 pasos que explican todo el flujo |
| **Tabla de niveles** | Sección «Niveles y guía» | Referencia rápida con las reglas comunes |

Las 14 secciones documentadas son: datos personales, perfil, formación académica, experiencia
profesional, experiencia docente, capacitación, producción gráfica, informática, idiomas,
publicaciones (APA 7), gestión y calidad, proyectos de investigación, reconocimientos y
secciones nuevas creadas por el usuario.

---

## 6. Flujo de trabajo

```
PASO 0  Mira un ejemplo          → Carga un CV ficticio del nivel al que postulas
PASO 1  Modalidad                → Documentado (con anexos) o No documentado (ligero)
PASO 2  Diseño, nivel y foto     → 6 formatos, 5 niveles, formas y marcos de foto,
                                    color de acento, marca o logo opcional
PASO 3  Datos                    → Editor por pestañas con guía didáctica en cada una
PASO 4  Vista previa             → La hoja A4 exactamente como se imprimirá
PASO 5  Evidencias               → Arrastra la carpeta: cada archivo se asocia a su fila
                                    por el código del nombre (04-03_2024_Instituto_Curso.pdf)
PASO 6  Exportar                 → PDF, Word, Markdown, CSV, anexos, presentación,
                                    respaldo .json, kit .md y prompt para IA
```

La firma **d3magindesign 2026 · Mg. Mario Quiroz Martínez** aparece en el pie de la web, al pie
de la hoja del CV, en el pie de página del Word y al final del Markdown y del kit de llenado.

---

## 7. Traer un CV que ya existe en Word

Desde **«📄 Abrir Word / pegar texto»** (barra del editor, atajo del inicio y tarjeta del Paso 6):

1. Se elige un archivo **`.docx`** —o se pega el texto del CV— y se lee **en el equipo**.
2. El aplicativo reconoce y clasifica:

   | Se reconoce | Detalle |
   |---|---|
   | Datos personales | Nombre, titular, correo, celular, documento, nacionalidad, domicilio, nacimiento |
   | Redes | LinkedIn, Behance, GitHub, ORCID, Google Académico, ResearchGate, Instagram, YouTube, X, web |
   | Perfil | El párrafo de presentación |
   | Filas por sección | Formación, experiencia, docencia, capacitación, producción, informática, idiomas, publicaciones, gestión, investigación, reconocimientos |
   | Dentro de cada fila | Años y rangos (`2019–2025`), horas (`120 h`), créditos, nivel MCER (`B2`), DOI y enlaces |

3. **Antes de aplicar nada**, se muestra un informe: qué encontró, cuántas filas por sección y
   qué no pudo reconocer.
4. **«Aplicar al formulario»** reemplaza el contenido actual (conviene guardar antes una versión
   en la biblioteca). También se puede **descargar lo detectado en `.json`**.

**Compatibilidad:** `.docx` comprimido (deflate) y sin comprimir; se lee `word/document.xml`
directamente, sin librerías externas. Un `.doc` antiguo debe guardarse como `.docx` desde Word;
un PDF se resuelve copiando el texto y usando la pestaña **«pegar texto»**.

---

## 8. Mi biblioteca: guardar, actualizar y llevar versiones

**«🗄 Mi biblioteca»** guarda versiones completas del CV (datos, foto, diseño y nivel) en el
almacenamiento del propio navegador.

| Acción | Para qué sirve |
|---|---|
| **💾 Guardar versión** | Congela el estado actual con nombre y nota («convocatoria A, sin foto») |
| **⤒ Abrir** | Recupera esa versión; permite traer también el diseño o conservar el actual |
| **⤓ Descargar `.json`** | Lleva la versión a la carpeta de descargas, para otro equipo o como respaldo |
| **✎ Renombrar · ⧉ Duplicar · 🗑 Eliminar** | Ordenar la biblioteca y crear variantes |
| **⤒ Importar un `.json`** | Devuelve a la biblioteca una versión descargada antes |
| **Vaciar biblioteca** | Borra todas las versiones guardadas en ese navegador |

Motor de almacenamiento: **IndexedDB**, con respaldo automático en **localStorage** y aviso
claro si el espacio no alcanza.

---

## 9. Privacidad: dónde viven los datos

- La página **no tiene servidor ni base de datos**: es HTML y JavaScript ejecutándose en el
  navegador de quien la usa.
- **Nada de lo que se escribe se guarda en el repositorio ni en el sitio donde está publicada
  la página.** No hay envío de datos por internet.
- La biblioteca vive **solo en ese navegador y ese equipo**. Si se borran los datos del
  navegador, se usa el modo incógnito o se cambia de computadora, **no viaja**. Para eso existe
  el **`.json`** de cada versión, que sí es un archivo del usuario.
- Las únicas consultas a internet son **opcionales y explícitas**: completar una publicación por
  **DOI** (Crossref), importar desde **ORCID**, las tipografías y las librerías de PDF/Word.
- El aviso está en tres lugares: barra fija bajo el menú, panel de la biblioteca y ayuda.

`biblioteca.js` no contiene ninguna llamada de red (ni `fetch`, ni `XMLHttpRequest`, ni
`sendBeacon`): hay una prueba automática que lo verifica.

---

## 10. Estructura del proyecto

```
index.html      Interfaz, estilos base y orden de carga de los scripts
ui.css          Barra superior, chip de estado, atajos, privacidad, diálogos
data.js         Plantilla vacía · guía didáctica (GUIDE, ANNOT) · niveles · 6 ejemplos
research.js     Redes e identificadores · publicaciones APA 7 (DOI/Crossref/ORCID)
guide.js        Capa didáctica: demos, modales, kit de llenado, progreso, recorrido
app.js          Motor: editor, hoja del CV, filtros, duplicados y exportaciones
importar.js     Lector de .docx (ZIP + OOXML), reconocimiento de datos y respaldo .json
biblioteca.js   Biblioteca local de versiones (IndexedDB/localStorage) y privacidad
viewer.js       Visor animado de certificados
README.md       Esta documentación
package.json    Scripts de prueba (npm test)
test/           check.mjs · smoke.mjs · docx.mjs
```

**Orden de carga obligatorio:**

```
data.js → research.js → guide.js → app.js → importar.js → biblioteca.js → viewer.js
```

`app.js` llama a `bootGuide()` al terminar su inicialización; `bootGuide()` dispara
`bootImportar()` y `bootBiblioteca()` en el evento `load`, cuando esos archivos ya se han
parseado. Cada módulo comprueba por su cuenta si puede iniciar.

---

## 11. Arquitectura interna

Scripts clásicos que comparten el ámbito global (sin módulos ES ni empaquetador). `app.js` es el
núcleo y expone el estado y las utilidades que consumen los demás:

| Símbolo global | Definido en | Papel |
|---|---|---|
| `S` | app.js | Estado completo: datos, diseño, nivel, modalidad, filtros y preferencias |
| `D()` | app.js | Atajo a `S.data` (persona, perfil, foto, secciones) |
| `refreshAll()` | app.js | Redibuja editor, toggles, evidencias y hoja |
| `renderSheet()` | app.js | Dibuja la hoja del CV; invoca `renderDemoBanner()`, `renderProgress()` y `renderStatusChip()` |
| `download(blob, nombre)` | app.js | Descarga de cualquier archivo exportado |
| `booting` | app.js | Evita que la inicialización marque el documento como «sin guardar» |
| `GUIDE`, `ANNOT`, `DEMOS`, `LEVEL_NOTES` | data.js | Guía didáctica, notas de la hoja, ejemplos y niveles |
| `annotHTML()`, `renderDemoBanner()`, `renderProgress()`, `kitText()` | guide.js | Lo que app.js invoca al dibujar |
| `docxLines()`, `analizarTexto()`, `analizarJSON()` | importar.js | Lectura de `.docx`, reconocimiento y respaldo |
| `bibAgregar()`, `bibCargarEnFormulario()`, `showBiblioteca()` | biblioteca.js | Biblioteca de versiones |
| `TEMPLATES`, `app.LEVELS` | app.js | 6 diseños y 5 niveles |

Persistencia en el navegador: `cvstudio.public.v1` (datos), `cvstudio.public.v1.draft`
(borrador protegido), `cvstudio.biblioteca.v1` (biblioteca en localStorage) y
`cvstudio.tourDone` (recorrido ya visto).

---

## 12. Verificación automática

Con Node.js instalado, dentro de la carpeta:

```bash
npm test                  # las tres suites
node test/check.mjs       # estructura
node test/smoke.mjs       # arranque real con DOM simulado
node test/docx.mjs        # lector de Word
```

| Suite | Qué comprueba |
|---|---|
| **check.mjs** | 81 identificadores usados por los scripts existen en el DOM · símbolos que app.js espera de cada módulo · orden de carga · columnas y secciones de los 6 ejemplos · guía completa de las 14 secciones · firma en los 4 entregables · avisos de privacidad · que `biblioteca.js` no use red · menú de 6 entradas · chip de estado discreto |
| **smoke.mjs** | Ejecuta `data → research → guide → app → importar → biblioteca` en un DOM simulado: arranque sin excepciones, plantilla vacía, 6 botones de demo, los 6 ejemplos (hoja, aviso, firma, kit, progreso), chip de estado, CV en blanco, Markdown firmado, secciones nuevas, importación desde texto y desde `.json`, y el ciclo completo de la biblioteca (guardar 2 versiones, limpiar, abrir, borrar, descargar) |
| **docx.mjs** | Construye un `.docx` real (ZIP + OOXML, comprimido y sin comprimir) y valida el lector: descompresión, acentos, rechazo de archivos inválidos, y el reconocimiento de nombre, contacto, documento, perfil y de las secciones con sus años, horas, niveles MCER y rangos |

Las tres terminan con `RESULTADO: 0 error(es), 0 aviso(s)`. La verificación es de arranque,
lógica y contenido; **no** sustituye a la revisión visual en un navegador real.

---

## 13. Limitaciones conocidas

- **`.doc` antiguo:** no se puede leer (es un formato binario). Debe guardarse como `.docx`.
- **PDF como entrada:** no se extrae texto; se resuelve copiando y pegando en «pegar texto».
- **PDF de salida:** se genera con el diálogo de impresión del navegador; hay que activar
  «Gráficos de fondo» para conservar los colores.
- **Dependencias de CDN:** tipografías, `pdf-lib` y `docx` se cargan de internet la primera vez.
- **Escaneo del texto:** el reconocimiento de `.docx` es heurístico. Un documento con estructura
  muy irregular puede requerir corregir filas a mano después de aplicar la propuesta.
- **Validación visual:** el entorno de desarrollo no dispone de navegador automatizado, así que
  el aspecto final (menú, chip de estado, hoja impresa) conviene revisarlo en pantalla.

---

## 14. Autoría y licencia

**© 2026 d3magindesign · Mg. Mario Quiroz Martínez.** Todos los derechos reservados.

Los 6 ejemplos son **ficticios**: personas, instituciones, resoluciones, DOI y documentos fueron
inventados con fines didácticos. Cualquier parecido con personas, instituciones o publicaciones
reales es coincidencia.

La plantilla arranca **vacía**: la aplicación no incluye ni distribuye datos de ninguna persona
real.
