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
