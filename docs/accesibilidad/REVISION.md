# Accesibilidad de La Mesa Perfecta

## Tooltip simplificado · 29/10/2026

Por petición del usuario, el cuadro emergente de eventos se reduce a un rectángulo
compacto que muestra únicamente «Categoría: cantidad», por ejemplo «Boda: 3».
Su ancho se adapta al contenido; no incluye porcentajes, presupuestos ni párrafos.
Se conservan el foco visible, la apertura con teclado/tacto, aria-describedby,
Escape y el listado de datos alternativo. Este ajuste sustituye el diseño del
cuadro informativo ampliado descrito en la revisión anterior.
Compilación de producción correcta. Comprobado en navegador: «Boda: 3» en un
cuadro de aproximadamente 82×42 px, «Otro: 14» y cierre con Escape.
Captura actual: [tooltip sencillo](graficos-tooltip-simple-2026-10-29.png).

## Gráficos centrados y detalle de eventos · 29/10/2026

Los tres widgets superiores de Resumen mantienen su título arriba y centran el
gráfico en el espacio disponible. El gráfico de eventos presenta una barra por
categoría con nombre y cantidad, sin el listado duplicado encima. Cada fila
dispone de un botón nativo de 48 px: al pasar el puntero, enfocar con Tab o tocar,
aparece información específica con categoría, número de oportunidades abiertas,
porcentaje y presupuesto informado. «Otro» detalla los tipos registrados; los
tipos antiguos no reconocidos también se incluyen ahí para no perder solicitudes.
Los presupuestos ausentes no se convierten en un cero inventado.

El detalle usa role=tooltip y aria-describedby, permanece al mover el puntero
hacia él, se cierra con Escape y se recoloca junto a la barra dentro del viewport.
Su texto puede desplazarse si no cabe. «Ver todos los datos del gráfico» ofrece
la alternativa en texto con un control details/summary nativo. Las barras siguen
disponibles en colores forzados y no se requiere distinguir colores para leerlas.
Criterios relacionados: 1.1.1, 1.4.1, 1.4.3, 1.4.10, 1.4.13, 2.1.1 y 2.4.7.

Comprobado en navegador local: Boda y Corporativo muestran su detalle correcto;
Tab cambia de categoría y Escape cierra; el listado alternativo coincide con los
recuentos. A 320×800 px, documento de 305 px útiles sin desbordamiento, cinco
objetivos de 48 px y detalle de «Otro» dentro de x=16–304 e y=76–466. Texto blanco
sobre #0f172a: 17,85:1; barras #0072B2 sobre blanco: 5,19:1, colores ya usados en el CRM.
Dos pruebas de agregación cubren estados cerrados, tipos antiguos, recuentos
vacíos, descripciones repetidas y presupuestos ausentes. Compilación de producción
y 29 pruebas de regresión correctas. Falta recorrido con un
lector de pantalla real y comprobación del modo de colores forzados del sistema.
No se declara conformidad WCAG completa.

Captura: [detalle de las barras](graficos-detalle-2026-10-29.png).

## Ajuste de subrayados · 29/10/2026

A petición expresa del usuario, todos los enlaces, botones y controles summary
de la web y del CRM dejan de estar subrayados en reposo, incluidos los enlaces
dentro de texto, recuperación de errores, acceso y ayuda de facturas. Se han
retirado las clases locales que imponían un subrayado permanente. La regla común
muestra el subrayado al pasar el ratón y al recibir foco de teclado; conserva el
contorno de foco existente (WCAG 2.4.7). Esta petición amplía el ajuste inicial
que solo afectaba a navegación y controles con apariencia de botón.
Cambio limitado a estilos, sin modificar rutas, datos ni acciones del CRM.
Comprobación visual de hover y recorrido con teclado pendientes de navegador.

Actualización del 26/10/2026: [aplicación del nuevo ZIP Pautas_WCAG, resultados y
checklist](WCAG-2026-10-26.md). Incluye la fuente original verificada, auditoría
axe en 17 URL y 25 estados, capturas, contraste, reflujo, regresión y pendientes.
Esta actualización amplía la revisión histórica que sigue a continuación.

Revisión del 19/10/2026. Se aplica a la web pública, al acceso y a los componentes
compartidos por todos los módulos del CRM. Objetivo de diseño: WCAG 2.2 AA.
Este documento recoge evidencias y pendientes; no certifica conformidad completa.

## Skill conservada

`pautas-wcag/` contiene los archivos originales del paquete aportado por el usuario,
incluidos sus siete documentos de referencia y el script de contraste. `AGENTS.md`
los incorpora como criterio para futuras modificaciones. No se han adoptado como
instrucciones operativas las afirmaciones legales del documento.

La guía ERP original sigue aplicándose. Sus cuatro referencias siguen ausentes:
no se declara superado su checklist de 20 puntos.

## Pantallas revisadas y correcciones

| Pantalla o componente | Problema | Regla de la skill WCAG / guía ERP | Corrección |
| --- | --- | --- | --- |
| Web y acceso | No había salto directo al contenido | Teclado, §6 / navegación | Primer enlace con destino enfocable; cabecera y pie fuera del contenido público |
| Web: propuesta y servicios | Capas fijas y contenido recortado con ampliación | Zoom y reflow, §7 | Secciones consecutivas con altura según contenido |
| Web: apariciones | Texto invisible hasta disparar una animación | Movimiento / acceso al contenido | Texto disponible desde el HTML inicial |
| Servicios | Avance automático sin pausa; descripción oculta en móvil | Movimiento / controles | Inicio manual, pausa, parada al interactuar, preferencia de movimiento reducido y descripción visible |
| Menú público móvil | Faltaba cerrar con Escape | Teclado / navegación | Escape cierra y devuelve el foco al botón |
| Web y CRM | Tipografía pequeña, bordes poco visibles y foco sobre fondos distintos | Color, controles y texto / ficha 14 | Base de 16 px, controles de 44–48 px, bordes medidos, enlaces subrayados y foco doble |
| Formularios compartidos | Faltaba resumen de errores y leyenda en formularios cortos | Formularios, §2 / fichas 2–4 | Leyenda de obligatorios, errores junto al campo y resumen con enlaces; se conserva lo escrito |
| Solicitud web y alta de oportunidad | No había revisión final de respuestas | Perfiles cognitivos y ansiedad / altas por pasos | Paso final de revisión, vuelta atrás, fechas españolas e importes en euros |
| Cambios de ruta | Título y foco no seguían la nueva vista | Componentes dinámicos, §8 | Título a partir del h1 y foco al título de la nueva vista |
| Tablero de oportunidades | Tarjetas con rol de botón y disposición ancha en móvil | HTML semántico y gestos / navegación | Botones nativos; columnas apiladas en móvil; la ficha mantiene el selector de estado como alternativa al arrastre |
| Ficha de oportunidad | Selector sin etiqueta visible; añadir vacío solo desactivaba el botón | Formularios y controles / respuesta concreta | Etiqueta de estado; explicación al intentar añadir tarea o nota vacía |
| Asignación rápida | Obligatorios y errores sin asociación suficiente | Formularios / fichas 2–4 | Autocompletado, indicación obligatoria, aria-invalid y descripción del error |
| Diálogos del CRM | El fondo seguía disponible para tecnologías de asistencia | Componentes dinámicos, §8 / teclado | Fondo inert durante la apertura, Tab contenido, Escape y restauración del foco |
| Resumen comercial | Datos de barras solo en gráficos; animación de canvas | Gráficos y movimiento / paneles | Datos desplegables en texto, títulos h2, gráfico sin animación y leyenda adaptable |
| RRHH: empleados y jornadas | Tablas sin caption ni región de desplazamiento; faltaban scopes | Tablas, §4 | Caption, cabeceras con scope y regiones enfocables; panel de pestañas enfocable |

## Contraste medido

Resultados del script original `pautas-wcag/scripts/contraste.py`:

| Texto o borde | Fondo | Relación |
| --- | --- | --- |
| Azul de acción `#1d4ed8` | Blanco `#ffffff` | 6,70:1 |
| Borde `#767676` | Blanco | 4,54:1 |
| Texto secundario `#4a5562` | Blanco | 7,59:1 |
| Verde azulado `#0f766e` | Blanco | 5,47:1 |
| Ámbar oscuro `#92400e` | Blanco | 7,09:1 |
| Verde oscuro `#166534` | Blanco | 7,13:1 |
| Dorado de texto `#805b2e` | Papel `#f7f2ed` | 5,47:1 |
| Texto suave `#6b5f52` | Papel | 5,58:1 |
| Acento de portada `#715021` | Fondo de portada `#d9cbb7` | 4,59:1 |

Estas mediciones no sustituyen una auditoría de todas las combinaciones renderizadas,
opacidades y fotografías. Alto contraste de Windows y contraste aumentado tienen
reglas específicas; falta revisión visual con esos ajustes del sistema.

## Verificación funcional

- Compilación de producción de Next.js y comprobación de tipos correctas.
- 20 pruebas existentes correctas, incluida la prueba integral de API de RRHH:
  autenticación, fichas, foto, fichajes, vacaciones, incorporación, contratación,
  evaluación, documentos, PDF firmado, informe y persistencia.
- Web, acceso y 11 rutas de CRM respondieron HTTP 200. Se comprobó el destino
  del enlace de salto en el HTML servido, incluidas las fichas por identificador.
- La API se probó con `HR_STORAGE=local` y una carpeta nueva terminada en
  `rrhh-api-test`, sin emplear el almacén habitual de RRHH.
- En navegador: acceso al CRM, foco al h1 al navegar, apertura del alta de
  oportunidad, recorrido de Tab dentro del diálogo, Escape y vuelta al botón
  de apertura. No se crearon oportunidades ni solicitudes en la base comercial.
- Formulario público: error al continuar vacío, foco al campo, aria-invalid y
  aria-describedby, avance hasta revisión y conservación de respuestas. Se comprobó también el foco en las leyendas al avanzar,
  el foco en el título de revisión y la exclusión de campos condicionales ocultos.
- A 320 px, la web pública, oportunidades y la tabla de empleados no presentan desbordamiento horizontal del documento;
  el selector de servicios conserva su desplazamiento horizontal local.
- Menú público móvil: apertura, cierre con Escape y devolución del foco comprobados.

Las primeras pruebas dentro del entorno aislado no podían abrir el puerto local.
Se repitieron con el servidor de verificación autorizado fuera de ese aislamiento.
La primera compilación aislada falló por EPERM y se repitió correctamente.

## Checklist de 20 puntos de la skill WCAG

✓ = comprobado en código y/o en las muestras indicadas; ? = requiere ampliar la
prueba manual. Un ✓ no afirma que se hayan probado todos los estados de cada pantalla.

| Nº | Criterio | Estado y evidencia / pendiente |
| --- | --- | --- |
| 1 | Contraste | ? Tokens medidos; falta barrido de todos los estados y fondos |
| 2 | Información además del color | ✓ Estados con nombres; leyendas y datos de gráficos |
| 3 | Simulación de daltonismo | ? Pendiente en navegador |
| 4 | Enlaces identificables | ✓ Subrayado global |
| 5 | Datos de gráficos | ✓ Alternativas textuales y leyenda con valores |
| 6 | Forma de controles | ✓ Controles compartidos con relleno/borde; revisar todos en forced-colors |
| 7 | Foco visible | ✓ Regla global; foco de navegación, menú y diálogo probado |
| 8 | Tamaño y alternativa a gestos | ✓ Botones de 44 px; campos de 48 px; selector de estado alternativo |
| 9 | Nombres accesibles | ✓ Etiquetas e iconos revisados en componentes compartidos |
| 10 | Elementos semánticos | ✓ Tarjetas nativas y controles de acción; se explican entradas vacías |
| 11 | Teclado completo | ? Muestras verificadas; falta recorrer todas las fichas y estados |
| 12 | Salto al contenido | ✓ Web, acceso y shell del CRM |
| 13 | Títulos, regiones y tablas | ✓ Estructura pública, títulos de resumen y tablas RRHH corregidos |
| 14 | Imágenes con alt | ✓ Revisión de componentes; imágenes de servicio decorativas |
| 15 | Etiquetas y errores | ? Base y formulario público comprobados; faltan todos los errores de negocio |
| 16 | Texto legible y claro | ✓ Base 16 px y 1,5; se conserva la tipografía de marca en títulos |
| 17 | Zoom y reflow | ? Web a 320 px comprobada; falta zoom real 200/400 % y todos los módulos |
| 18 | Audio y vídeo | ✓ No hay audio/vídeo que requiera transcripción; avisos en texto |
| 19 | Movimiento | ✓ Carrusel manual, CSS reduced-motion y gráficos sin animación |
| 20 | Tiempo, revisión, idioma y título | ✓ Sin nuevos límites; revisión en altas por pasos; lang es y título por vista |

Captura de la revisión del formulario: [revision-formulario.png](revision-formulario.png).

## A probar a mano

1. Completar los flujos comerciales y administrativos con Tab, Mayús+Tab, Intro,
   Espacio, flechas y Escape, incluyendo errores de red y estados vacíos.
2. Probar zoom 200/400 %, espaciado de texto ampliado y todos los módulos a 320 px.
3. Recorrer con NVDA o Narrador: encabezados, errores, pestañas, tablas, cambios
   de ruta, formularios por pasos y diálogos.
4. Revisar daltonismo, movimiento reducido y alto contraste de Windows.
5. Ejecutar Lighthouse/WAVE y realizar pruebas con personas con discapacidad.
   Sus resultados complementan esta revisión; no certifican por sí solos WCAG AA.

No se ha cambiado el esquema de datos, las rutas de API ni la lógica de persistencia.
Se han conservado los cambios y carpetas que ya existían antes de esta intervención.

## Ampliación: Facturas con IA · 23/10/2026

Nuevo módulo en `/crm/facturas`. Esta ampliación incorpora tablas y funciones
propias mediante `supabase/migracion_facturas_ia.sql`, pendiente de aplicar a
Supabase real. Las conclusiones anteriores corresponden al 19/10/2026.

| Pantalla | Decisión de interfaz | Regla aplicada |
| --- | --- | --- |
| Facturas | Una acción principal «Actualizar facturas»; buscar y consultar como acciones secundarias | Guía ERP, fichas 1 y 6 |
| Facturas | Etiquetas visibles de búsqueda y estado; controles compartidos de 48 px | Guía ERP, fichas 2 y 14; WCAG controles |
| Facturas | Incidencia visible, aviso de carga y conservación de últimos datos ante error | Guía ERP, fichas 4, 6 y 7; WCAG estados |
| Lista | Tabla con caption, scope de columna/fila y región enfocada para desplazamiento | WCAG teclado y tablas |
| Ficha | Modal con foco, Escape y restauración; ausencias y advertencias en texto | WCAG componentes dinámicos; guía ERP, fichas 9 y 14 |
| Cola | Estado con símbolo y palabra; nombre del archivo y explicación del reintento | Guía ERP, fichas 9 y 13; WCAG lenguaje claro |
| Importes | Fecha española, importe a la derecha, moneda del documento y dos decimales | Guía ERP, ficha 8 |

Se reutilizan `CrmShell`, `ui.tsx` y `useDialog`. No hay altas manuales largas en
esta pantalla. Los originales no se borran ni se mueven desde la interfaz.

Comprobado:

- Compilación de producción de todas las rutas, incluida Facturas y su API.
- 27 pruebas Node correctas, incluida la API de RRHH con datos aislados.
- 24 pruebas Python correctas. Inferencia simulada y catálogo real verificado
  mediante petición pública sin enviar facturas.
- PostgreSQL embebido: migración, bloqueos, duplicados, rollback, espera,
  recuperación automática tras cuotas y permisos anónimos.
- Navegador autenticado: la ruta muestra un `role=alert` con la configuración
  de Supabase pendiente, sin inventar registros.
- A 320 px, ancho del documento 305 px: sin desbordamiento horizontal.
- Tab desde el buscador llega al filtro; foco visible de 3 px.
- La búsqueda se conserva al cambiar de estado y fallar la conexión.
- Contrastes sobre blanco, medidos: azul 6,70:1; texto oscuro 17,74:1;
  secundario 7,59:1; borde 4,54:1; ámbar oscuro 7,09:1.

Checklist WCAG de esta ampliación: 1 ✓ tokens / ? todos los estados; 2 ✓; 3 ?;
4 ✓; 5 no aplica; 6 ✓; 7 ✓; 8 ✓; 9 ✓; 10 ✓; 11 ? recorrido completo;
12 ✓ shell; 13 ✓ código / ? tabla con datos reales; 14 no hay imágenes nuevas;
15 ✓ filtros; 16 ✓; 17 ✓ 320 px / ? zoom real; 18 no aplica; 19 ✓ sin animación;
20 ✓ idioma, título y sin nuevos límites de tiempo en la interfaz.

Pendiente tras configurar el entorno: lista con datos reales, ficha, historial y
reintento contra Supabase; recorrido con NVDA/Narrador; zoom 200/400 %, daltonismo
y alto contraste. El OCR se ha probado con ejecutable simulado: falta instalar
y comprobar Tesseract. No se declara una auditoría WCAG completa ni se da por
superado el checklist ausente de la guía ERP.

Puesta en marcha: [FACTURAS-IA.md](../FACTURAS-IA.md).

## Facturas: revisión y persistencia · 30/10/2026

Alcance: `components/InvoiceModule.tsx`, API de Facturas y del original,
`lib/invoices.ts`, `lib/invoiceStore.ts`, sincronización Python y migración de
revisión. Se conservan La Mesa Perfecta, los datos comerciales y los cambios
previos. Consultadas ambas skills WCAG, el temario textual de 53 diapositivas,
anexo y checklist ampliado. No se ha revisado el PDF ausente ni se han editado
las fuentes originales. Las cuatro referencias de la skill ERP siguen ausentes;
no se declara superado su checklist de 20 puntos.

| Barrera | Prioridad | Criterio WCAG | Cambio y comprobación | Estado |
| --- | --- | --- | --- | --- |
| El listado quedaba bloqueado por columnas sin activar | Bloqueante funcional | No se atribuye un criterio automático | Migración aplicada, API autenticada HTTP 200 y estado vacío real | Corregido |
| La ficha no comunicaba el registro guardado a la lista y no compilaba | Alta | 4.1.3 | Callback de guardado, mensaje de éxito tras confirmación; guardar incompleta y validar después en navegador con datos ficticios | Corregido |
| Al desactivar el botón durante el guardado se perdía el foco | Alta | 2.4.3, 2.4.7 | Se devuelve al botón que lanzó la acción; comprobado dentro del diálogo tras guardar | Corregido |
| Las correcciones y la revisión no se distinguían en la lista | Media | 1.4.1, 4.1.2 | Estados con símbolo y texto, filtros nativos y recuentos | Corregido |
| Riesgo de perder datos ante errores o cambios simultáneos | Alta | 3.3.1, 3.3.3, 3.3.4 | Errores conservan campos; versiones en PostgreSQL, descarte recuperable; NIF vacío enfoca el campo con error asociado | Comprobado con tests y ficha ficticia |

Evidencias: navegador integrado Chromium, rutas locales `/crm/facturas` a
1280×720 y 320×800. La API real no contiene registros. Una pasarela local
aislada sirve `PRUEBA-001`, sin crear facturas de prueba en la base real.
Comprobados apertura de ficha, error NIF vacío, guardado incompleto, corrección,
validación posterior, recuentos/lista y cierre por Escape con retorno al botón.
Reflujo: ancho del documento 305 px en listado vacío y 320 px con tabla/ficha
para una ventana de 320 px; la tabla mantiene desplazamiento propio por teclado.
El guardado mantiene el foco dentro del diálogo.

Axe 4.14.0 mediante `scripts/a11y-preview.cjs`: cero infracciones y cero revisiones
incompletas en listado vacío de escritorio y listado con factura ficticia a 320 px.
Contrastes medidos con el script original: `#525252` sobre blanco 7,81:1;
`#737373` 4,74:1; rojo `#b91c1c` 6,47:1; verde `#14532d` 9,11:1.
Se reutilizan controles, foco y estilos de movimiento reducido del proyecto.

Checklist específico: semántica ✓; nombres de controles ✓; etiquetas y errores
asociados ✓; estados textuales ✓; teclado parcial ✓ (Escape/retorno y foco al
guardar); contraste de los pares indicados ✓; 320 px ✓. No aplica multimedia,
gráficos nuevos o gestos complejos. Pendientes NVDA/Narrador, recorrido completo
Tab/Shift+Tab y selector de fecha, zoom real 200/400 %, espaciado de texto,
daltonismo, colores forzados y lectura del original con documentos reales.
No se afirma conformidad WCAG completa ni equivalencia entre reflujo y zoom.

## Subida de facturas desde el CRM · 30/10/2026

Alcance: botón junto a Actualizar facturas, `InvoiceUploadDialog`, ruta
`/api/crm/facturas/subir` y `lib/invoiceUploads.ts`. Patrón de diálogo con
`useDialog`, controles de `ui.tsx` y `ValidatedForm`; selector nativo de archivos
con etiqueta visible, obligatorio y ayuda de formatos/tamaño. Mantiene la
identidad de La Mesa Perfecta. No se modifican las fuentes docentes originales.

| Barrera | Prioridad | Criterio | Corrección / prueba | Estado |
| --- | --- | --- | --- | --- |
| No se podían subir documentos desde Facturas | Bloqueante funcional | Sin asignación automática | Botón Subir facturas y guardado en carpeta, verificado con PDF desde navegador y comparación de bytes | Corregido |
| Riesgo de interpretar subida como lectura completada | Alta | 3.3.2, 4.1.3 | Mensajes distintos: guardada en carpeta y pendiente de lectura; progreso por archivo y resultado con símbolo/texto | Corregido |
| Falta de selección / formato / tamaño incorrecto | Alta | 3.3.1, 3.3.3 | Errores concretos junto al selector, asociados con aria-describedby; foco en el campo, selección conservada ante fallo | Implementado; vacío probado en navegador y servidor con tests |
| Diálogo y controles inaccesibles por teclado | Alta | 2.1.1, 2.4.3, 2.4.7, 4.1.2 | Nombre del diálogo, foco inicial, Escape/retorno al botón; foco permanece en Guardar tras terminar | Comprobación parcial correcta |

Navegador integrado Chromium a 1280×720 y 320×800. Selector nativo: flujo real
Elegir archivos → PDF ficticio → Guardar facturas → éxito; archivo confirmado en
carpeta temporal aislada. No se crean registros de prueba en Supabase. Alturas
medidas: Cerrar y Guardar 48 px; selector 56 px. A 320 px, documento 320 px y
diálogo 288 px. Escape devuelve el foco a Subir facturas.

Axe 4.14.0 en el diálogo vacío: cero infracciones; una revisión manual de contraste
del párrafo introductorio por detección de superposición. La captura muestra el
párrafo dentro del diálogo blanco, sin superposición de texto. Se comprobaron los
estilos reales: texto `rgb(17,24,39)` sobre diálogo `rgb(255,255,255)`; el script de
contraste original confirma que supera 4,5:1. Esta comprobación manual resuelve el
aviso para ese párrafo. Evidencia: [diálogo de subida](facturas-subida-2026-10-30.jpg).

Pendientes: recorrido completo con NVDA/Narrador y selector nativo del sistema,
zoom real 200/400 %, colores forzados y simulaciones de visión.
Sin multimedia ni animaciones nuevas. No se declara
conformidad WCAG completa ni se afirma haber superado el checklist ERP ausente.

## Contador tras lectura de factura · 30/10/2026

Se mantiene la diferencia entre subida y extracción confirmada, en vez de
incrementar el contador sin una factura guardada. Verificada la API real con
`Por revisar: 1` para la factura de práctica subida por el usuario. Se ha puesto
en marcha el lector y añadido su arranque con el CRM.

Actualización automática cada 10 segundos, con botón visible para pausar/reanudar
(WCAG 2.2.2). No se consulta con la página oculta ni durante la edición de una
ficha o una subida. Las recargas automáticas conservan el contenido, los filtros
y el foco; no desactivan controles ni anuncian «Cargando» en cada ciclo. Los
recuentos siguen en región de estado y los errores conservan los últimos datos
(4.1.3). Se reutilizan los controles de ui.tsx y los colores medidos previamente.
Pendientes: NVDA/Narrador con cambios de contador, recorrido completo por teclado,
zoom y colores forzados. No se afirma conformidad WCAG completa.

Verificado en el CRM de desarrollo: `Por revisar: 1`, fila PRACT-2026-001 con
base 1.000,00 EUR, IVA 210,00 EUR y total 1.210,00 EUR. Probados pausa y
reanudación de la actualización automática sin pérdida de la fila ni del foco.
Evidencia: [contador y factura leída](facturas-contador-2026-10-30.jpg).

## Acciones de revisión en cada fila · 30/10/2026

Se sustituye la columna Detalle / Ver factura por Acciones con botones ✓ Validar
y × Denegar. Los iconos tienen aria-label con acción, número y proveedor, título
al pasar el puntero y zona mínima de 48×48 px; no dependen solo del color
(1.4.1, 2.5.8, 4.1.2). Se reutiliza btnGhost y el foco visible del proyecto.
Contraste medido sobre blanco: verde #15803d 5,02:1; rojo #b91c1c 6,47:1.

Denegar pide confirmación nombrando la factura y explicando que conserva datos y
original. Se mantiene el estado anterior ante error y se actualizan fila y
recuentos solo tras confirmar la respuesta. Las operaciones usan la versión del
registro y los mismos permisos del servidor (3.3.4). El resultado se anuncia y los
errores quedan junto a la acción (3.3.1, 4.1.3). La recarga automática se pausa
durante el guardado. Si una fila sale del filtro, el foco vuelve al título de la
lista; en otro caso permanece en el grupo de acciones (2.4.3, 2.4.7).

Se conserva la corrección de datos pulsando el número de factura. La ficha pasa
a tener Guardar correcciones, con las decisiones de validar/denegar en la tabla.
Comprobado en navegador con una factura ficticia aislada: validación, denegación
confirmada, recuentos, edición conservada, estado vacío al validar bajo el filtro
Por revisar y retorno de foco a invoice-list-heading. Las facturas reales no se
han validado ni denegado durante estas pruebas. TypeScript y las pruebas de API
y PostgreSQL pasan. Pendientes: NVDA/Narrador, zoom 200/400 %, colores forzados y
auditoría automática específica de los nuevos controles. Las referencias ERP
siguen ausentes y no se declara conformidad WCAG completa.

Medición en ventana de 820 px: ambos botones 48×48 px, documento 805 px sin
desbordamiento de página. La tabla conserva anchura legible y desplazamiento
horizontal propio; encabezados y estados evitan partir palabras.
Evidencia: [acciones directas de la factura](facturas-acciones-2026-10-30.jpg).


### Tamaño de los iconos de revisión · 30/10/2026

Se sustituyen los caracteres ✓ y × por iconos SVG CheckIcon y XMarkIcon de
28×28 px y trazo 2,5 para evitar que hereden el texto pequeño del botón.
Se mantienen controles de 48×48 px, colores medidos, nombres accesibles y foco.
Los SVG son decorativos (aria-hidden); la acción se anuncia con el nombre del
botón. Comprobación de TypeScript; revisión visual y lector de pantalla pendientes.


### Tarjetas de contadores de Facturas · 30/10/2026

Resumen con tres tarjetas responsivas, etiquetas y cifras en dl/dt/dd, iconos
Heroicons ClockIcon, CheckIcon y XMarkIcon decorativos. Conserva anuncios de
estado, cifras tabulares y textos de apoyo; estados distinguibles sin color.
Una columna en móvil y tres desde sm. No son botones ni se añaden paradas de
teclado. TypeScript comprobado; revisión visual, zoom y lector pendientes.


### Retirada de la explicación de automatización · 30/10/2026

Por petición del usuario se elimina de Facturas el bloque completo de
Automatización de documentos, su estado y las instrucciones desplegables.
El lector y la carga de datos siguen funcionando. No se añaden controles ni
colores; se conserva la jerarquía de títulos del listado. TypeScript comprobado.


### Cabecera del listado de facturas · 30/10/2026

Se retira el texto explicativo del intervalo automático y se alinea el botón de
pausa/reanudación a la derecha del título Facturas de proveedores. La cabecera
permite salto de línea en pantallas estrechas; conserva el título h2, el nombre
dinámico del botón y su manejo por teclado. TypeScript comprobado.


### Contadores sin degradados · 30/10/2026

Tarjetas de resumen con fondo blanco plano y sin sombra; contenedores de iconos
con rellenos sólidos y background-image desactivado. Se conservan etiquetas,
Heroicons y los colores cuyos contrastes se midieron anteriormente.


### Iconos del resumen sin contenedor · 30/10/2026

Los tres Heroicons del resumen se presentan en azul uniforme (#2563eb),
sin recuadro, relleno ni sombra, siguiendo la referencia del usuario.
Tamaño 20 px y trazo 1,75; son decorativos y se conservan etiquetas y cifras.
No se modifican las acciones de validar/denegar. TypeScript comprobado;
contraste medido sobre blanco con el script de la skill.


### Decisiones confirmadas sin botones repetidos · 30/10/2026

Solo las facturas pendientes muestran Aceptar/Rechazar. Tras confirmar el
guardado se sustituyen por una etiqueta no interactiva Aceptada/Rechazada,
con Heroicon y texto blanco sobre verde #15803d o rojo #b91c1c sólidos.
Se elimina cualquier degradado, sombra o atenuación de color en estas acciones.
Contrastes previamente medidos: 5,02:1 y 6,47:1. Se conserva el retorno del foco
al grupo o al título si la fila sale del filtro y el aviso de resultado.
La corrección de datos sigue accesible por el número de factura.
TypeScript y pruebas de API comprobados; lector de pantalla pendiente.


### Estado de factura sin duplicación · 30/10/2026

Se unifican Revisión y Acciones en una sola columna Estado. Las pendientes
muestran Por revisar y sus acciones; las resueltas muestran una única etiqueta.
Aceptada usa verde claro #dcfce7 con texto #166534; Rechazada rojo claro #fee2e2
con texto #991b1b, sin degradados. Conserva Heroicons, texto y foco de acciones.
TypeScript y contraste comprobados; revisión con lector de pantalla pendiente.


### Retirada de paneles técnicos de Facturas · 30/10/2026

A petición del usuario se retiran Documentos y reintentos y Actividad de los
modelos de la pantalla comercial. Se elimina el controlador de reintento manual
que solo usaba ese panel. La cola, el historial y los reintentos automáticos del
lector se conservan en el backend. No se modifican registros ni permisos.
Se mantiene la jerarquía del listado y sus avisos de error/éxito. TypeScript
comprobado; no se añaden colores ni controles.


### Subida simplificada y aviso temporal · 30/10/2026

Se eliminan explicaciones técnicas y confirmaciones duplicadas del diálogo de
subida. Se conservan etiqueta, obligatoriedad nativa, formatos/límites, progreso,
resultado resumido y errores detallados persistentes con archivos pendientes.
El aviso verde del listado se oculta tras 3 segundos, según petición expresa del
usuario; la confirmación del diálogo y los datos guardados siguen disponibles.
Temporizador con limpieza al cambiar el aviso o desmontar. TypeScript comprobado;
prueba con lector de pantalla y percepción del aviso temporal pendientes.


### Confirmación breve al denegar · 30/10/2026

Por petición del usuario, el aviso se simplifica a «¿Seguro que deseas denegar
la factura [número]?». Mantiene identificación del registro y las opciones
nativas de aceptar/cancelar. No cambia el guardado ni la conservación del original.


### Confirmación integrada de denegación · 30/10/2026

Se sustituye window.confirm por diálogo de la página para eliminar el encabezado
del navegador. Reutiliza useDialog: nombre accesible, foco contenido, Escape,
fondo inerte y retorno al botón. Incluye Cancelar y Denegar factura, colores
planos y controles de 48 px. TypeScript comprobado; prueba manual con lector
de pantalla pendiente.


### Estilo común Aceptar/Rechazar · 30/10/2026

DecisionControl unifica vacaciones y facturas: blanco plano, borde de 2 px,
texto e icono Heroicons verdes o rojos (contrastes previos 5,02:1 y 6,47:1),
controles de 48 px con nombre accesible. Tras decidir se muestra una etiqueta
no interactiva Aceptada/Rechazada con el mismo estilo, sin repetir decisiones.
Se conserva la persistencia y confirmación existentes. TypeScript comprobado;
recorrido manual con lector de pantalla pendiente.


## Ventas: presupuestos y pedidos · 30/10/2026

Módulo independiente de Oportunidades, con navegación Presupuestos/Pedidos/Clientes,
formularios de una columna por pasos (FormSteps, ValidatedForm, SearchableSelect),
diálogos con useDialog y confirmaciones internas para confirmar/cancelar.
Revisión previa, totales calculados en servidor, versiones contra sobrescritura,
y errores que conservan campos (3.3.1, 3.3.3, 3.3.4). Mensajes de estado y tablas
con caption/th/scope y contenedor desplazable por teclado (1.3.1, 4.1.3).
Recorrido de prueba local: alta por pasos, guardado, confirmación y pedido de
solo lectura. No se han creado ventas ficticias en Supabase. Se reutilizan
colores y controles del proyecto; pendientes axe específico, NVDA, zoom, reflujo
y recorrido de teclado completo. No se afirma conformidad WCAG total ni se da
por revisado el checklist ERP ausente.
