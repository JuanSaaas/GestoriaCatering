# Teclado y lector de pantalla

## Contenido
1. Imágenes
2. Formularios
3. Títulos y regiones
4. Tablas de datos
5. Foco visible y orden de Tab
6. Saltar al contenido
7. Zoom y reflow
8. Componentes dinámicos (modales, avisos, menús)

## 1. Imágenes
Sin `alt`, la persona ciega oye el nombre del archivo («grafico-ventas-final-2 punto png»).
```html
<img src="grafico.png" alt="Gráfico: ventas de octubre, 12.430 euros, un 8 % más que en septiembre">
<img src="adorno.svg" alt="">   <!-- decorativa: alt vacío, el lector la salta -->
```
- El `alt` describe **la información**, no el dibujo. Sin «imagen de…».
- Imagen dentro de enlace/botón: el `alt` describe el **destino/acción**.
- Texto dentro de una imagen: repetirlo en el `alt` (o mejor, usar texto real).
- Gráficos complejos: `alt` breve + descripción o tabla de datos cercana.
- Nunca información solo en imagen o vídeo.

## 2. Formularios
Mal: `<input placeholder="NIF">` → el lector dice «campo de texto, editar»; la etiqueta desaparece al escribir.
```html
<label for="nif">NIF del cliente <span class="req">(obligatorio)</span></label>
<input id="nif" name="nif" required autocomplete="off"
       aria-describedby="nif-ayuda nif-error" aria-invalid="true">
<p id="nif-ayuda">9 caracteres, por ejemplo 12345678Z.</p>
<p id="nif-error" class="error"><span aria-hidden="true">⚠</span> Faltan caracteres: el NIF tiene 9.</p>
```
- `<label for>` **siempre visible** (encima del campo); `placeholder` solo como ejemplo, nunca como etiqueta.
- Obligatorio **con palabras** («obligatorio»), no solo con `*` rojo. Si usas `*`, explica la leyenda al inicio.
- **Error**: qué pasó + cómo arreglarlo, junto al campo, con icono (no solo rojo), unido con `aria-describedby`. Marcar `aria-invalid="true"`. Al enviar con errores: resumen arriba con enlaces a cada campo y mover el foco al resumen o al primer error.
- Agrupar con `<fieldset><legend>` (radios, casillas, direcciones).
- `autocomplete` correcto (`name`, `email`, `tel`, `street-address`…) para no obligar a reescribir datos.
- No exigir ortografía perfecta ni recordar datos de pasos anteriores; ofrecer sugerencias y autocorrector.
- Formularios largos por **pasos con progreso visible** («Paso 2 de 4») y pantalla final para **revisar antes de enviar**.
- Un campo por cada dato, con **separación** suficiente entre campos (motora).
- No pedir de nuevo lo ya introducido (WCAG 2.2: entrada redundante).
- Autenticación: permitir pegar contraseñas y gestores; no exigir pruebas cognitivas (puzzles, transcribir) sin alternativa.

## 3. Títulos y regiones
Con títulos solo en negrita, el lector dice «No hay títulos en esta página». Con h1/h2 reales, la persona salta a la sección que busca.
```html
<header>…</header>
<nav aria-label="Principal">…</nav>
<main id="contenido">
  <h1>Facturas</h1>
  <h2>Pendientes de cobro</h2>
  <h2>Cobradas este mes</h2>
</main>
<footer>…</footer>
```
- **Un solo `h1`**; sin saltar niveles (h1 → h2 → h3). El nivel es estructura, no tamaño: ajusta el tamaño con CSS.
- Varias `nav` → `aria-label` distinto. `lang="es"` en `<html>` (y `lang` en fragmentos en otro idioma). `<title>` único y descriptivo por página.
- Enlaces descriptivos: «Descargar PDF de la factura F-0231», no «Pulsa aquí» ni «Más».

## 4. Tablas de datos
Hechas con `div`, el lector lee celdas sueltas sin decir a qué columna pertenecen. En un ERP casi todo son tablas: importante.
```html
<table>
  <caption>Facturas</caption>
  <thead><tr><th scope="col">Cliente</th><th scope="col">Importe</th><th scope="col">Estado</th></tr></thead>
  <tbody>
    <tr><th scope="row">Talleres Pérez</th><td class="num">1.234,50 €</td><td>✓ Pagada</td></tr>
  </tbody>
</table>
```
- `<table>`, `<caption>`, `<th scope="col|row">`. **Tablas solo para datos, nunca para maquetar.**
- Estados con palabra e icono, no solo color de fila. Importes alineados a la derecha.
- Tablas anchas: contenedor con `overflow-x: auto`, `tabindex="0"`, `role="region"` y `aria-label` para poder desplazarlas con teclado.
- Ordenación: botón dentro del `<th>` con `aria-sort`.

## 5. Foco visible y orden de Tab
- Probar con **Tab** por toda la app: el foco debe **verse siempre** y avanzar en **orden lógico** (el del DOM; evitar `tabindex` positivo).
- Nunca `outline: none` sin alternativa. Usa `:focus-visible` con anillo ≥ 3 px y contraste ≥ 3:1 (ej. GOV.UK: fondo amarillo, texto negro, línea inferior; 11,7:1).
- WCAG 2.2: el elemento enfocado no debe quedar tapado por cabeceras/banners fijos (`scroll-padding-top`).
- Sin trampas de teclado: se entra y se sale de todo componente con teclado (Esc cierra).
- Atajos de una sola tecla: permitir desactivarlos o remapearlos.

## 6. Saltar al contenido
Sin atajo, hay que pulsar Tab muchas veces (p. ej. 10) en cada página para llegar al formulario. El **primer elemento** del `<body>` es un enlace oculto que aparece al recibir el foco:
```html
<a href="#contenido" class="saltar">Saltar al contenido principal</a>
```
(CSS en `codigo-base.md`.) El destino `#contenido` debe poder recibir el foco (`<main id="contenido" tabindex="-1">`).

## 7. Zoom y reflow
- El texto debe poder crecer al **200 %** sin pérdida de contenido; la página debe poder leerse a **320 px de ancho** (zoom 400 %) en **una columna, sin scroll horizontal**.
- Claves: tamaños en `rem`/`em`, **sin alturas fijas** (`min-height` mejor que `height`), `flex-wrap`/grid responsive, imágenes `max-width: 100%`.
- **Nunca** `user-scalable=no` ni `maximum-scale=1` en `<meta name="viewport">`. Correcto: `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Respetar el tamaño de letra del sistema (Dynamic Type / Tamaño de fuente de Android).

## 8. Componentes dinámicos
- **Avisos de estado** (guardado, error de carga): `role="status"` (educado) o `role="alert"` (urgente) para que el lector los anuncie sin mover el foco.
- **Modal**: `<dialog>` o `role="dialog" aria-modal="true" aria-labelledby`; al abrir, foco dentro; Tab atrapado dentro mientras esté abierto; **Esc** cierra; al cerrar, el foco vuelve al botón que lo abrió.
- **Desplegables/acordeones**: `<button aria-expanded="true|false" aria-controls="id">`.
- **Pestañas, menús, comboboxes**: seguir los patrones del WAI-ARIA Authoring Practices; si no, usar HTML nativo (`<details>`, `<select>`).
- **SPA / cambio de ruta**: actualizar `document.title`, mover el foco al `h1` de la nueva vista y anunciar el cambio.
- **Contenido que se actualiza solo**: `aria-live="polite"`, y permitir pausar.
- **Tiempos**: sin límites o con aviso y opción de ampliar; nada de cuentas atrás que metan prisa.
- Regla ARIA: **la primera regla de ARIA es no usar ARIA** si hay un elemento HTML nativo. Un rol mal puesto es peor que ninguno.
