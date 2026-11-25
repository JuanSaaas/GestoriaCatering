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


## Ventas: ajuste al trabajo de catering · 01/11/2026

Revisión posterior solicitada por el usuario: la copia de estructura todavía
requería adaptar el trabajo diario al negocio. Cambios limitados a Ventas:

- Recuperación del lugar, franja e indicaciones alimentarias que el formulario
  público conserva en la sección «Datos del evento» del mensaje cuando faltan
  columnas. Se priorizan los campos explícitos; no se usan lugares simulados.
  Las indicaciones se muestran junto a la solicitud y se incorporan a las notas
  mediante una acción explícita, conservando las notas escritas.
- Acción por línea «Usar N comensales», sin modificar automáticamente cantidades
  de personal/equipamiento. Total medio por invitado con IVA cuando hay invitados.
- Pedidos abre en próximos eventos por fecha del evento, excluyendo cancelados;
  permanecen Todos y las vistas por fecha de confirmación. Estado visible también
  en pedidos, con símbolo y palabra; invitados visibles en el listado.
- Fases con lenguaje del negocio (Enviado al cliente / Evento confirmado).
- Se retira de Ventas el acceso a facturas de proveedores copiado de la referencia;
  se ofrece Ver presupuestos. No cambia el módulo de Facturas.

Criterios: 1.3.1 (datos y etiquetas), 1.4.1 (estados textuales), 2.1.1 y 2.5.8
(botones nativos de 48 px), 3.3.2/3.3.4 (instrucciones, revisión y copia explícita),
4.1.3 (se conservan avisos de resultado). No se añaden colores ni movimiento.
Once pruebas de Ventas/PostgreSQL superadas, incluidas compatibilidad del
formulario web y exclusión de cancelaciones en Próximos eventos. Se mantiene
el alcance pendiente de auditoría manual de la revisión anterior: NVDA, zoom
200 %, colores forzados y todos los estados con registros reales.
Compilación y TypeScript comprobados. Revisión visual del listado de Pedidos
en escritorio y respuesta real de su API (200) con Próximos eventos; sin crear
registros de prueba en la base real. Captura: output/ventas/pedidos-eventos.jpg.

## Ventas: adaptación de la referencia · 01/11/2026

Tras recibir acceso de demostración se inspeccionaron el menú Ventas, los
listados Presupuestos/Pedidos/Productos, el alta de presupuesto, una ficha
enviada con líneas/datos/fases y el formulario de producto. No se guardaron
cambios en la referencia. Esta revisión sustituye el bloqueo de acceso de la
primera fase descrita más abajo.

Menú definitivo: Presupuestos, Pedidos y Productos y servicios. Adaptación a La
Mesa Perfecta: evento, fecha, invitados, lugar y oportunidad del cliente;
catálogo por categorías de catering sin inventar tarifas. Se conservan las
rutas anteriores de clientes y los demás módulos.

| Página / barrera | Prioridad | WCAG | Corrección / evidencia | Estado |
| --- | --- | --- | --- | --- |
| Desplegable y orientación | Media | 1.3.1, 2.1.1, 2.4.4, 4.1.2 | Botón nativo con estado, enlaces activos y migas de pan; apertura con Enter y cierre del menú móvil con Escape | Probado a 320 px |
| Alta larga y errores | Alta | 3.3.1, 3.3.2, 3.3.3, 3.3.4 | FormSteps de una columna, ValidatedForm, SearchableSelect y useDialog; error de cliente obligatorio asociado; conservación al volver entre pasos; revisión previa con totales visibles | Recorrido en navegador sin guardar |
| Confirmación y archivo | Alta | 3.3.4, 4.1.3 | Diálogos con registro y consecuencias; resultado comprobado por id, mensajes de estado y versiones contra sobrescrituras | API y PostgreSQL probados |
| Fases y contraste | Media | 1.4.1, 1.4.3 | Texto, símbolo y fase numerada; blanco/#171717 17,93:1; #92400e/blanco 7,09:1; #b91c1c/blanco 6,47:1; blanco/#1d4ed8 6,70:1 | Fórmula WCAG medida con Node |
| Buscador comprimido en escritorio | Alta | 1.4.10 | Base de anchura para búsqueda y acciones en fila independiente; corregido tras inspección visual | Sin desbordamiento a 1280 px |
| Reflujo y foco de producto | Alta | 1.4.10, 2.4.7, 2.5.8 | Controles de 48 px, formulario de una columna y desplazamiento vertical del diálogo; Tab llega a Cerrar y Escape devuelve el foco a Crear producto | Probado a 320 × 800 |
| Compatibilidad de opciones | Alta | 3.3.1, 4.1.3 | La consulta inicial asumía ubicacion_evento en oportunidades, columna ausente en el esquema real; corregida para admitir campos opcionales | Error/reintento y recuperación comprobados |

Pruebas completadas: TypeScript, compilación de producción, siete pruebas de
cálculo/validación/API y prueba PostgreSQL de migración, conservación de registros,
envío, confirmación sin duplicados, versiones y archivo/restauración. En navegador
se recorrieron cliente/evento, condiciones, líneas, descuento y revisión. Ejemplo
sin guardar: 100 × 80 €, descuento 10 %, IVA 10 % → base 7.200 €, IVA 720 €,
total 7.920 €. No se crearon ventas ni tarifas ficticias en la base real.

Axe 4.14.0 en Chromium/IAB, 01/11/2026: Presupuestos vacío a 1280 × 720 y
320 × 800 sin infracciones; catálogo vacío y diálogo de producto a 320 × 800
sin infracciones. Axe dejó revisión manual de contraste para un enlace lateral
parcialmente oculto por el contenedor desplazable y para la marca del encabezado
móvil; no se afirma que sean comprobaciones superadas. Anchuras DOM medidas:
1280/1280 en escritorio y 305/320 en móvil (sin desbordamiento de página).
Captura final: output/ventas/presupuestos.jpg.

Base: migración 20261101114544 aplicada a GestoriaCatering, esquema verificado
por consulta. RLS activa y sin acceso anon/authenticated en ventas_productos;
solo servidor. El asesor devuelve el aviso informativo de tabla sin políticas,
intencionado para este modelo privado. El CLI no estaba disponible; se conservó
el SQL con el identificador de la migración remota.

La ejecución general dio 40 pruebas superadas y dos fallos ajenos a Ventas:
hr-api requiere un servidor y HR_DATA_DIR de pruebas; subida real de facturas
respondió 503 en el entorno restringido. No se alteraron esos módulos.

Límites funcionales: Marcar como enviado registra un envío ya realizado por el
equipo; no envía correos. Exportar recorre todos los documentos filtrados; los
importes del pie se etiquetan como importes de la página actual. No se simula
el filtro Míos porque la sesión compartida no identifica al comercial.

Pendientes: NVDA, simulaciones de daltonismo/visión borrosa, alto contraste,
zoom real 200 %, espaciado de texto y revisión de todos los estados con datos.
No aplica multimedia nueva. No se afirma conformidad WCAG completa; las cuatro
referencias ERP ausentes y las ilustraciones del PDF no incluido siguen sin
revisarse.

### Primera fase: menú desplegable · 01/11/2026

Alcance: acceso lateral a los apartados existentes Presupuestos, Pedidos y
Clientes, en escritorio y menú móvil. Se retiran las pestañas duplicadas.
No se modifican los datos, formularios ni los demás módulos. La reproducción
del contenido de la referencia queda pendiente: su URL de presupuestos
redirige a /auth/login y no se han podido inspeccionar sus pantallas privadas.

| Componente / barrera | Prioridad | Criterios | Cambio y evidencia | Estado |
| --- | --- | --- | --- | --- |
| Ventas no se desplegaba | Media | 2.1.1, 4.1.2 | Botón nativo, aria-expanded y aria-controls; lista oculta al cerrar; Escape cierra y devuelve el foco | Código revisado |
| Orientación dentro de Ventas | Media | 1.3.1, 1.4.1, 2.4.4 | Enlaces con nombre, aria-current, subrayado y negrita para el activo; apertura inicial en rutas de Ventas | Código revisado |
| Tamaño y contraste | Media | 1.4.3, 2.5.8 | Controles de 48 px; texto #525252 sobre blanco 7,81:1 y sobre #f5f5f5 7,17:1; negro sobre #f5f5f5 19,26:1; línea #737373 sobre blanco 4,74:1 | Fórmula WCAG medida con Node, Python no disponible |

Validación: TypeScript sin errores y las tres pruebas existentes de Ventas
superadas. Se heredan foco visible, reducción de movimiento y colores forzados
del CSS común. Pendientes: recorrido real de Tab/Shift+Tab/Enter/Espacio/Escape
en escritorio y móvil, lector NVDA, zoom 200 %, reflujo a 320 CSS px,
alto contraste, simulaciones visuales y axe/WAVE sobre el nuevo desplegable.
No se afirma conformidad completa. Las cuatro referencias ERP siguen ausentes;
no se ha pasado su checklist ni se han revisado ilustraciones del PDF no incluido.

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
# Resumen de revisión de formularios · 04/11/2026

Texto de confirmación de envío ajustado a petición del usuario (04/11/2026):
«Se enviará el presupuesto a [cliente] y quedará registrado como Enviado».
Frase breve, destinatario explícito y resultado descrito (3.3.2). El envío sigue
siendo ficticio; el aviso posterior conserva esa aclaración. Cambio solo de
texto, sin modificar lógica, foco o controles. Pendiente lectura con NVDA.

Envío ficticio de presupuestos (04/11/2026): «Enviar presupuesto» abre la
confirmación con referencia del documento y nombre del cliente. El texto aclara
que se simula el envío y se registra el estado Enviado sin correo real (3.3.2,
3.3.4). Durante la operación se muestra «Enviando…»; el aviso role=status
identifica el presupuesto y destinatario y confirma la simulación (4.1.3).
Se mantiene la operación existente con control de versión, restricción a
borradores y comprobación de respuesta antes de anunciar éxito. No se añade
servicio de correo ni se alteran datos remotos durante la implementación.
Pendiente: probar confirmación, cancelación, error y éxito por teclado y NVDA
en navegador. No se afirma conformidad WCAG completa.

Retirada de «Duplicar presupuesto» (04/11/2026): se elimina el botón de las
fichas de Ventas y su callback en SalesModule. Se conserva el orden DOM de las
acciones restantes (2.4.3), sin nuevos controles ni colores. Revisión de código;
pendiente comprobación visual y recorrido de teclado en la ficha.

Ajuste de barra de Ventas (04/11/2026): en escritorio, acciones con anchura
automática y margen izquierdo automático para compartir fila con ordenación
y búsqueda; filtros a la izquierda, acciones a la derecha. En pantallas
estrechas se conserva el salto de línea y el orden DOM/teclado (1.3.2, 2.4.3),
sin reducir los controles. Colores, nombres y foco se conservan.
Pendiente de comprobación visual a 320 CSS px, zoom 200 % y escritorio
(1.4.10); no se afirma conformidad completa por esta revisión de código.

Corrección posterior del listado y las fichas de Ventas (04/11/2026): se retiran
columna, filtro y datos visibles de Comercial, además de su columna del CSV,
sin borrar asignaciones guardadas. Encabezados y celdas mantienen su orden
(1.3.1). Pago vacío se describe como «Pendiente de acordar» y se unifica el
título de observaciones. Barrera media: «Invalid Date» en confirmaciones;
fmtDate ahora distingue fecha simple de fecha con hora, usa Europe/Madrid y
muestra «Sin fecha» para valores ausentes o ilegibles. No se sustituye una
confirmación ausente por la fecha del presupuesto (lenguaje comprensible).
Verificación: TypeScript sin errores, once pruebas de Ventas superadas,
incluyendo regresión para fechas simples, timestamps, cambio de día en Madrid,
horario de verano y fechas ausentes o ilegibles; diff sin errores de espacios.
Pendiente: inspección visual del listado, correspondencia de columnas con NVDA,
teclado, zoom y axe en navegador; no se afirma conformidad WCAG completa.

Ampliación en SalesEditor: se retira el selector Comercial del formulario
(se conserva la asignación existente o procedente de la solicitud). El paso
«Fechas y pago» permite escribir forma de pago, anticipo y plazos. Las notas
se identifican como observaciones del presupuesto y se explica su destino.
Ayudas asociadas mediante aria-describedby (3.3.2); observaciones vacías
omitidas del resumen. El selector de catálogo es una acción de incorporación,
no un dato del documento: se excluye de la revisión, manteniendo las líneas
añadidas con etiquetas que identifican su producto o servicio (1.3.1, 3.3.4).
Prioridad: media para la revisión engañosa del catálogo; baja para claridad
de los campos. Código de guardado revisado: condiciones y notas persisten
en ventas_documentos; confirmar el pedido conserva ambos campos.
Validación de esta ampliación: TypeScript sin errores y las diez pruebas
existentes de Ventas superadas (`node --test tests/sales.test.cjs`).
Pendiente: recorrido real con productos, pago y observaciones, guardado y
reapertura, teclado y NVDA. No se han modificado datos remotos.

Alcance: paso final compartido de `components/FormSteps.tsx` y estilos en
`components/FormSteps.module.css`.

| Barrera / recomendación | Prioridad | Criterios relacionados | Cambio y comprobación | Estado |
| --- | --- | --- | --- | --- |
| Etiquetas y valores con poca jerarquía visual | Baja | 1.3.1, 3.3.4 | Etiquetas en negrita, valores sangrados, filas separadas en una columna; se conserva la lista semántica dl/dt/dd y la revisión antes de enviar | Código revisado |
| Legibilidad del resumen | Baja | 1.4.3, 1.4.4, 1.4.10 | Texto de 1 rem, interlineado 1,5, sin alturas fijas y ruptura de cadenas largas; contraste #111827 sobre #f8fafc de 16,96:1 y ayuda #4a5562 sobre blanco de 7,59:1 | Contraste medido con fórmula WCAG en Node; Python no disponible |

Validación: `npx tsc --noEmit` y `git diff --check` sin errores. No se han
añadido controles ni cambiado la navegación, la captura de datos o el guardado.
Se conserva el foco en el encabezado al entrar en la revisión.

Pendiente en navegador: aspecto con datos reales, Tab/Shift+Tab, NVDA, zoom
200 %, reflujo a 320 CSS px, espaciado personalizado, colores forzados y axe.
No se afirma conformidad WCAG completa. Las cuatro referencias ERP siguen
ausentes; no se afirma haber pasado su checklist ni revisado ilustraciones
del PDF no incluido. No aplica multimedia ni movimiento nuevo.


## 14/11/2026 · Correcciones solicitadas en el PDF del CRM

Alcance: los nueve puntos de «Cosas que mejorar del proyecto.pdf», revisadas
sus dos páginas y sus capturas. Usuario: equipo comercial y de administración
de La Mesa Perfecta. Se conservan los cambios previos del espacio de trabajo.

| Pantalla / punto | Hallazgo y prioridad | Regla UX / WCAG relacionada | Corrección | Evidencia y estado |
| --- | --- | --- | --- | --- |
| Menú lateral | Texto «Gestión de eventos y equipo» innecesario; baja | UX 13, lenguaje de negocio | Retirado bajo la marca | Código revisado en CrmShell |
| Ruta de navegación | Separador desalineado respecto a enlaces de 44 px; baja | UX 12, 1.3.1 | Alineación vertical centrada; separadores decorativos siguen ocultos al lector | Código revisado; aspecto en navegador pendiente |
| Resumen | Listado mensual repetido encima del gráfico; baja | UX 16, 1.1.1 | Retirado de la presentación visual mediante sr-only; se conserva la alternativa textual del gráfico | Código revisado en Dashboard; lector y visual pendientes |
| Menú lateral | Orden distinto al solicitado; baja | UX 2, navegación coherente | Resumen, Oportunidades, Empresas, Clientes, Tareas, Cierres previstos, Ventas, Facturas, Recursos humanos; mismo componente en móvil | Código revisado; se conserva el desplegable de Ventas |
| Oportunidades | Botón «Todos» que se solicita retirar; baja | UX 1, 2.1.1, 4.1.2 | Eliminado; pulsar de nuevo un comercial activo desactiva ese filtro; aria-pressed y nombre completo; controles de 48 px | Código revisado; recorrido con teclado pendiente |
| Empresas y Clientes | Acciones separadas del buscador; baja | UX 3, 1.3.2, 1.4.10 | Buscador, exportación y alta en una fila flexible, con ajuste en pantallas estrechas; alta de clientes disponible también en su sección principal y en el vacío | Código revisado; se reutilizan botones, NewSalesRecord y ValidatedForm; reflujo pendiente |
| Facturas | Una copia repetida se comunicaba como subida correcta; media | UX 4 y 6, 3.3.1, 3.3.3, 4.1.3 | Respuesta 409 específica, tarjeta «⚠ Factura ya registrada» dentro del diálogo con nombre y explicación; sin contar duplicadas como altas ni reintentarlas | Cinco pruebas de subida pasan: mismo archivo, renombrado, originales antiguos y concurrencia, además de validaciones existentes |
| RR. HH., informe | Descargar desde una ficha incluía todos los empleados; alta funcional | UX 13, prevención de errores | Enlace con identificador del empleado; filtrado de todas las secciones en servidor; identificador inexistente o vacío devuelve 404; informe general sigue disponible | Pruebas de ruta con datos ajenos protegidos por getters, extracción de texto y render del PDF individual correctos |
| RR. HH., nómina | Nombre del firmante libre, distinto del titular; alta funcional | UX 11, 3.3.2, 3.3.4 | Nombre del titular precargado y de solo lectura, explicación antes de confirmar; servidor obtiene el nombre de la ficha y conserva la conformidad obligatoria | Prueba con nombre manipulado, rechazo sin conformidad y de firma repetida; PDF firmado revisado |

Archivos de implementación: components/CrmShell.tsx, components/Dashboard.tsx,
app/crm/oportunidades/page.tsx, app/crm/empresas/page.tsx,
app/crm/contactos/page.tsx, components/InvoiceUploadDialog.tsx,
lib/invoiceUploads.ts, app/api/crm/facturas/subir/route.ts,
components/HrModule.tsx, app/api/crm/rrhh/route.ts y
app/api/crm/rrhh/informe/route.ts. Los informes utilizan fechas españolas.
La detección inmediata de duplicados compara el contenido idéntico (SHA-256)
con originales conservados en la carpeta de entrada; no identifica como iguales
dos escaneos diferentes de la misma factura. El lector existente mantiene sus
comprobaciones de factura durante el procesamiento.

### Comprobaciones realizadas

- Compilación de producción en .next-mejoras-pdf-build completada; tipos comprobados.
- Batería completa: 50 pruebas pasan, incluido el flujo HTTP de RR. HH. con
  almacenamiento local temporal terminado en rrhh-api-test. No se han modificado
  datos remotos ni registros reales para las pruebas.
- git diff --check sin errores de espacios.
- Informe individual: texto extraído incluye a Marta López y excluye a Daniel
  Ruiz y Lucía Martín. La página de conformidad contiene «Firmante: Marta López»
  aunque la petición use otro nombre. PDF de prueba renderizados con Poppler y
  examinados: sin solapamientos ni texto recortado en los casos probados.
- Contraste calculado con pautas-wcag/scripts/contraste.py: aviso duplicado
  #78350f sobre #fffbeb = 8,75:1; borde #b45309 = 4,84:1. Error #7f1d1d
  sobre #fef2f2 = 9,16:1; borde #b91c1c = 5,91:1.

### Checklist de esta intervención y pruebas pendientes

Pasa en revisión de código: semántica de botones y enlaces; etiquetas de los
campos modificados; nombre accesible del informe que contiene «Informe PDF»;
resultado con texto y símbolo; aviso de duplicados con role=alert y progreso
con role=status; alternativa textual conservada para el gráfico. Contrastes
nuevos medidos. Se reutilizan useDialog, foco global y preferencias de movimiento
y colores forzados existentes. No hay gestos, multimedia ni animaciones nuevas.

No probado en navegador: orden y visibilidad real del foco con Tab/Shift+Tab,
Enter/Espacio y Escape, retorno de foco de los diálogos, NVDA, zoom al 200 %,
reflujo a 320 CSS px, espaciado de texto, colores forzados y simulación de
daltonismo. Pendiente axe/WAVE/Lighthouse sobre estas pantallas y comprobación
visual de alineación y estados vacío, carga, error y éxito. Procedimiento:
abrir Empresas y Clientes en escritorio y a 320 px, comprobar la barra de
acciones; recorrer el menú móvil; activar y desactivar un filtro de comercial;
subir una copia ya existente en un lote mixto; descargar desde dos fichas
empleadas distintas y revisar ambas salidas; abrir una nómina y revisar su titular.

Límite de la revisión visual: el navegador integrado devolvió
ERR_CONNECTION_TIMED_OUT al servidor local. Computer Use de Windows se detuvo
porque no pudo determinar con seguridad la URL activa de Chrome; no se continuó
con la automatización del navegador. Las pruebas HTTP y de PDF se completaron
por las herramientas de desarrollo. No se afirma conformidad WCAG completa ni
se marcan como pasadas las comprobaciones manuales pendientes.

Aplicadas ambas skills de accesibilidad, con prevalencia de Pautas_WCAG, y
consultados temario, anexo textual y checklist. Las cuatro referencias de la
skill ERP siguen ausentes: no se afirma haber pasado su checklist de 20 puntos.
No se han revisado las ilustraciones del PDF docente no incluido ni se han
editado las fuentes originales.


### 14/11/2026 · Ajuste de la barra de Oportunidades

A petición del usuario, se oculta visualmente «Buscar oportunidades» manteniendo
el label asociado mediante sr-only (excepción solicitada a la etiqueta visible
de la guía ERP). Botón y buscador comparten alineación por estiramiento en la
misma fila; la lupa se centra verticalmente en el campo. Se conserva el ajuste
en varias filas en pantallas estrechas, el filtrado, el foco y los controles
nativos. Archivo: app/crm/oportunidades/page.tsx. Criterios relacionados:
1.3.1, 1.4.10 y 4.1.2. Sin cambios de color ni movimiento.
Comprobado en código: asociación label/input y clases de alineación.
Pendiente de revisión visual en navegador, zoom al 200 %, ancho de 320 px,
teclado y anuncio del nombre con NVDA. No se afirma conformidad WCAG completa.


### 14/11/2026 · Encabezado de Oportunidades en una fila

Corrección del ajuste anterior: el título y el grupo de botón y buscador
comparten ahora la primera fila, centrados verticalmente. La descripción
ocupa una fila propia debajo; se elimina el ancho completo del grupo de
acciones desde sm para evitar que siempre salte de línea. En ventanas
estrechas se permite el salto para conservar el reflujo (1.4.10). Se mantiene
la etiqueta oculta asociada al buscador (1.3.1, 4.1.2). Revisión de código
y git diff --check realizados; comprobación visual, zoom y NVDA pendientes.

### 17/11/2026 · Diseñador Web (comprobaciones del 16/11/2026)

Alcance: `/crm/disenador-web`, galería y borradores, editor de bloques, diálogos,
vistas previas y cuatro plantillas. Se aplican las dos skills WCAG conservadas,
el temario textual, anexo y checklist de implementación. No se han revisado las
ilustraciones del PDF no incluido. Las cuatro referencias de la skill de UX
siguen ausentes: no se afirma haber pasado su checklist de veinte puntos.
Se conservan todas las revisiones anteriores de este archivo.

| Componente / barrera | Prioridad | Criterios | Cambio y evidencia | Estado |
| --- | --- | --- | --- | --- |
| Galería: el nombre accesible no contenía «Explorar diseño» | Alta | 2.5.3 | Axe detectó cuatro casos; el nombre ahora incluye el texto visible y el nombre de la plantilla | Corregido en código; repetición aislada pendiente |
| Vista previa y alta simultáneas podían dejar controles inertes al cerrar | Bloqueante | 2.1.1, 2.4.3 | Se evita apilar los dos diálogos; se reutiliza useDialog para foco, Escape y restauración. Se añade comunicación de Escape desde el iframe aislado | Corregido; falta recorrido manual completo |
| Botón de edición alteraba la retícula de la portada | Media | 1.3.2, 1.4.10 | Se sitúa fuera del flujo; el lienzo conserva el ancho de ordenador/tablet/móvil y se escala al panel | Corregido y comprobado visualmente |
| Arrastre como única opción de ordenar | Alta | 2.1.1, 2.5.7 | Botones Subir/Bajar con nombre por bloque y anuncio de posición; el arrastre es adicional | Implementado; pruebas manuales de todo el recorrido pendientes |
| Controles, etiquetas y resultados | Alta | 1.3.1, 3.3.1, 3.3.2, 4.1.2, 4.1.3 | Etiquetas asociadas, errores junto a URLs/imágenes, ValidatedForm en alta, avisos de guardado y error, confirmaciones con nombre | Axe del editor sin infracciones detectadas |
| Contraste | Alta | 1.4.3, 1.4.11 | Script aportado: #315748/blanco 8,12:1; #e3c58e/#191d19 10,27:1; #718077/blanco 4,15:1 para bordes. Se exige 4,5:1 en texto y fondo al guardar; estados incluyen texto y símbolo | Pares iniciales medidos; falta revisar todas las personalizaciones con personas |
| Reflujo del editor | Alta | 1.4.4, 1.4.10 | A 320×850 px: ancho interior 320 y scrollWidth 305, sin desbordamiento horizontal. Paneles en columna | Comprobado a 320 px; zoom real 200/400 % pendiente |
| Plantillas dentro de iframe | Media | 1.3.1, 4.1.2 | Título de iframe, documento lang=es, h1, navegación, alt y labels. Axe identifica que el iframe debe probarse por separado | Minimalista 1280×720 y corporativa 320×850: cero infracciones y cero incompletos |
| Movimiento y colores forzados | Media | 2.3.1, 2.3.3 (AAA), 1.4.11 | Sin carruseles automáticos ni destellos; prefers-reduced-motion y forced-colors en módulo y renderizador | Revisado en código; simulación manual pendiente |
| Formularios de plantilla | Media | 3.3.1, 3.3.2, 4.1.3 | Etiquetas, campos obligatorios y mensaje explícito de demostración; no se simula recepción de solicitudes | Implementado; receptor real pendiente de publicación |

Pruebas automáticas: TypeScript y compilación de producción; 56 pruebas de
regresión aprobadas, incluidas siete del diseñador. Integración real del diseñador
con cuatro plantillas: creación, edición, recuperación, duplicado, borrado,
conflictos de versión y rechazo de solicitudes sin sesión o con origen externo.
Prueba de RR. HH. aprobada por separado con almacenamiento de prueba aislado.

Navegador usado: navegador integrado (Chromium), escritorio y viewport de
320 CSS px. Axe 4.14 se ejecutó mediante una vista local de auditoría; esa
instrumentación no forma parte del producto. El editor devolvió cero
infracciones y una revisión incompleta de iframe; las dos plantillas indicadas
se comprobaron por separado. El último ajuste de Escape en iframe se comprobó
por revisión de código y TypeScript, sin recorrido manual posterior.

Pendiente: repetir axe en la galería corregida y en las plantillas creativa y
premium; Tab/Shift+Tab/Enter/Espacio por el flujo completo, Escape dentro y fuera
del iframe y recuperación de foco; lector NVDA/VoiceOver/TalkBack; zoom real
200/400 %, espaciado de texto, simulación de daltonismo/visión borrosa y alto
contraste. La herramienta de navegador dejó de estar disponible antes de cerrar
esas pruebas. No se interpreta una ausencia de errores automáticos como
conformidad WCAG completa.

No aplica en este módulo: vídeo, audio, subtítulos y transcripción. No se
introduce contenido que dependa de sonido, tiempo o gestos sin alternativa.
La sesión conserva la duración existente del CRM; no se ha auditado el sistema
completo de autenticación. Los proyectos se comparten bajo la única cuenta de
administración actual; el aislamiento por usuarios independientes requiere
identidades individuales, explicado en `docs/DISENADOR_WEB.md`.

### 24/11/2026 · Continuación del Diseñador Web

Se añade Deshacer/Rehacer para nombre, bloques, orden, contenido y estilos.
Historial acotado a cincuenta cambios por sesión de edición; una edición nueva
tras deshacer elimina la rama de rehacer. La revisión del servidor se mantiene
fuera del historial. Botones nativos, estado disponible/no disponible y avisos
con texto en la región de estado (2.1.1, 4.1.2, 4.1.3). Tres nuevas pruebas
verifican recuperación, ramificación, inmutabilidad y límite.

| Comprobación / barrera | Prioridad | Criterios | Evidencia y resultado |
| --- | --- | --- | --- |
| Galería corregida | Alta | 2.5.3 | Axe 4.14 a 1280×720: cero infracciones; ya no aparecen los cuatro nombres que omitían el texto visible |
| Contraste de galería | Media | 1.4.3 | Ocho incompletos de axe por superposición de miniaturas; falta verificar manualmente los pares sobre el fondo real. No se declara la comprobación completa |
| Creativa | Alta | 1.3.1, 1.4.3, 4.1.2 | Documento generado, auditado por separado a 1280×720: cero infracciones e incompletos |
| Premium | Alta | 1.3.1, 1.4.3, 1.4.10, 4.1.2 | Documento generado a 1280×720 y 320×850: cero infracciones e incompletos; a 320 px, scrollWidth 305 |
| Escape dentro del iframe | Alta | 2.1.1, 2.4.3 | Se enfocó un enlace dentro de la vista previa, Escape cerró el diálogo y devolvió el foco a Explorar diseño |
| Aviso al salir con cambios | Alta | 2.1.1, 2.4.3, 3.3.4 | Diálogo probado con Tab, Shift+Tab y Escape; se conservó el texto y el foco volvió a Mis páginas web, cero elementos inertes residuales |
| Error inicial antes de escribir | Media | 3.3.1, 3.3.2 | Detectado en el alta por la limpieza simulada de efectos de Strict Mode; useDialog restaura el foco solo al retirar el diálogo. Verificado: foco en el nombre, sin error prematuro, Escape cierra y libera todos los controles |
| Historial después de guardar | Media | 3.3.4, 4.1.3 | Título editado, deshecho, rehecho y guardado; historial usado después del éxito sin cambiar la revisión del servidor |

Navegador integrado Chromium. Las auditorías se ejecutan mediante herramientas
locales de prueba, excluidas del producto. La vista de auditoría es de lectura:
las escrituras se comprobaron directamente en el CRM, conservando la protección
de origen de su API. Batería: 59 pruebas aprobadas; integración real repetida
con cuatro plantillas y limpieza confirmada de sus cinco borradores.

Pendientes: lectores NVDA/VoiceOver/TalkBack, zoom real 200/400 %, espaciado de
texto, colores forzados y simulación de daltonismo/visión borrosa; los ocho
incompletos de contraste de la galería; recorrido completo por todas las
combinaciones de estilos y contenidos editables. No se afirma conformidad WCAG
completa. No se ha revisado el PDF no incluido ni el checklist UX ausente.

## Imágenes adaptables del Diseñador Web — 25/11/2026

| Barrera | Prioridad | Criterio WCAG | Corrección y prueba |
| --- | --- | --- | --- |
| Encuadres fijos y recortes en portadas, secciones, galerías y bloques de imagen | Alta | 1.4.10 (reflujo) | `lib/webRenderer.ts` conserva la proporción original. Edge comprobó 112 imágenes en 32 vistas de las cuatro plantillas, incluidas fotos verticales de prueba, a 320, 375, 600, 601, 768, 900, 1024 y 1200 px. Las imágenes se mantuvieron dentro del ancho disponible y las páginas no tuvieron desplazamiento horizontal. |
| Miniaturas con los laterales del lienzo fuera de la tarjeta | Media | 1.4.10 (reflujo) | `components/WebDesigner.tsx` y `components/WebDesigner.module.css` ajustan la escala al ancho medido. El componente se verificó de forma aislada en Edge con tarjetas de 228, 262, 320, 350, 460 y 600 px. |
| Alternativas de las imágenes informativas | Media | 1.1.1 (contenido no textual) | Se conservan las descripciones existentes. La comprobación de las plantillas en Edge confirmó que todas las imágenes de prueba tenían `alt` con texto. |

TypeScript y las 10 pruebas del diseñador pasaron. Esta revisión comprobó el
HTML generado y el componente de miniaturas en vistas locales de prueba.
Quedan pendientes la comprobación táctil en dispositivos físicos, el zoom
real al 200 % y 400 %, el recorrido completo por teclado y la prueba con lector
de pantalla. El reflujo medido equivale a comprobar el ancho, no el zoom del
navegador. Esta revisión no acredita conformidad WCAG completa.

### 25/11/2026 · Rediseño adaptable de las plantillas y del módulo

Esta intervención **sustituye** el criterio anterior de «conservar la proporción
original» de las fotos. Mezclar fotos verticales (576 × 636) y horizontales
(1536 × 1024) producía tarjetas, columnas y galerías de alturas distintas.

| Barrera | Prioridad | Criterio WCAG | Corrección y prueba |
| --- | --- | --- | --- |
| La galería compartía la clase `gallery` entre la sección y su rejilla: el título ocupaba una columna y las fotos quedaban diminutas | Alta | 1.4.10 (reflujo) | Los bloques usan clases con prefijo (`block-gallery`, `photo-grid`) y un contenedor común `.wrap` de 1.200 px |
| Imágenes de alturas desiguales y filas desalineadas | Alta | 1.4.10 (reflujo) | Marco con proporción fija por dispositivo y recorte centrado. Nueva opción **Encuadre de la imagen → Mostrar la imagen completa** para fotos que no deben recortarse |
| Bloque Cifras con márgenes laterales distintos; testimonio descentrado; tarjeta suelta en tablet | Media | 1.4.10 (reflujo) | Mismo margen lateral en todos los bloques; columnas calculadas según el número de tarjetas (3 → 3 en tablet, 4 → 2) |
| Miniaturas que cortaban la portada según el ancho de la tarjeta | Media | 1.4.10 (reflujo) | Miniatura del primer pantallazo de 1.280 px en un marco 16:10 |
| Editor apretado entre 1.200 y 1.450 px | Media | 1.4.10 (reflujo) | Consultas de contenedor: una columna, lienzo con dos paneles debajo y tres columnas desde 1.280 px de espacio útil |

Comprobado en Chrome con el HTML generado (vista local estática): las cuatro
plantillas y un documento con los catorce tipos de bloque a 320, 375, 768 y
1.200 px, **sin desplazamiento horizontal ni elementos fuera del ancho**, y con
las proporciones de imagen esperadas. TypeScript y las 10 pruebas del diseñador
pasaron.

Pendiente: no se pudo revisar en pantalla el módulo dentro del CRM (galería,
editor y diálogos) porque requiere iniciar sesión. Siguen pendientes axe sobre
el nuevo marcado, el teclado en el selector de dispositivo, el zoom real al
200 % y 400 % y el lector de pantalla. No se acredita conformidad WCAG completa.
