# Botones y controles accesibles

## Contenido
1. Un botón tiene que parecer un botón
2. Estados visibles
3. Mejor un botón que explica que uno desactivado
4. Tamaño, separación y gestos
5. Botón o enlace
6. Botones con nombre

## 1. Parecer un botón
Los botones planos sin borde ni fondo confunden a personas mayores y con discapacidad cognitiva: no saben qué se puede pulsar.
- Forma clara (relleno o borde), **borde con contraste ≥ 3:1**, texto con **verbo + objeto** («Guardar factura», no «Aceptar» ni «Guardar» suelto si hay varios).
- Jerarquía de importancia: uno principal (relleno), secundarios (borde), terciarios (texto subrayado).
- **Acción peligrosa separada** del resto («Borrar factura» lejos de «Guardar»), con confirmación que nombra el elemento.
- Botones descriptivos y predecibles (autismo, cognitiva): nada de «Pulsa aquí» ni etiquetas vagas.

## 2. Estados visibles
Cada estado cambia algo más que el tono de color: subrayado, anillo, desplazamiento, borde discontinuo.

| Estado | Cómo hacerlo |
|---|---|
| Normal | relleno o borde con contraste ≥ 3:1 |
| Ratón encima (`:hover`) | cambio de tono **y** subrayado o borde |
| **Foco** (`:focus-visible`) | anillo grueso de alto contraste |
| Pulsado (`:active`) | desplazamiento 1–2 px o borde distinto |
| Desactivado | ver apartado 3 (evitarlo) |

```css
button:focus-visible { outline: 3px solid #FFDD00; outline-offset: 3px; }
```
El foco es el estado más importante para quien usa teclado: debe verse **en cualquier fondo** (si el fondo puede ser claro u oscuro, usa anillo doble: claro + oscuro). Nunca `outline: none` sin sustituto.

## 3. Mejor un botón que explica que uno desactivado
Un botón gris desactivado: no se pulsa, casi no se lee (1,5:1), no recibe foco, no dice por qué y el lector dice «atenuado».

**Patrón recomendado:** el botón siempre se puede pulsar; si falta algo, se explica al lado y se enlaza con `aria-describedby`.
```html
<button type="submit" aria-describedby="falta-nif">Guardar factura</button>
<p id="falta-nif">Para guardar, falta el NIF del cliente.</p>
```
El lector dice: «Guardar factura, botón. Para guardar, falta el NIF del cliente.»
Al pulsar con datos incompletos: mostrar el error, mover el foco al primer campo con error y no perder lo escrito. Si hay un envío en curso, `aria-disabled="true"` + texto «Guardando…» (y `aria-live="polite"` para avisar al terminar).

## 4. Tamaño, separación y gestos
| Guía | Tamaño mínimo |
|---|---|
| Apple | 44 × 44 pt |
| Google | 48 × 48 dp |
| WCAG 2.2 AA | 24 × 24 px con separación suficiente |

**Regla práctica:** zona pulsable de **44–48 px** y separación entre objetivos. Un icono de 24 px puede mantenerse con `padding` hasta alcanzar la zona táctil.
```css
.btn-icono { min-width: 48px; min-height: 48px; display: inline-grid; place-items: center; }
```
- Una «×» de 16 px y un gesto oculto (deslizar para borrar) son imposibles con temblor o pulsador. **Todo gesto complicado** (deslizar, mantener pulsado, dos dedos, arrastrar) **necesita alternativa con botón** visible: icono + palabra («Eliminar»). El gesto queda como atajo.
- Arrastrar y soltar siempre con alternativa (botones «Subir/Bajar», selector).

## 5. Botón o enlace
| Si el elemento… | Usa | El lector dice |
|---|---|---|
| lleva a otra página | `<a href="/facturas">Ver facturas</a>` | «Ver facturas, enlace» |
| hace una acción (guardar, borrar, enviar) | `<button type="button">Guardar factura</button>` | «Guardar factura, botón» |
| es un `div` con `onclick` | **nada: no sirve** | «Guardar factura» (sin decir que se puede pulsar) |

Regla rápida: **si cambia de página, enlace; si hace algo en la página, botón.**
```html
<!-- MAL: no recibe foco con Tab, no se activa con Intro, el lector no sabe qué es -->
<div onclick="guardar()">Guardar</div>
<!-- BIEN: funciona con teclado, ratón, pulsador y voz sin más código -->
<button type="button" onclick="guardar()">Guardar</button>
```
Si un componente a medida es inevitable: `role`, `tabindex="0"`, `keydown` para Intro **y** Espacio, y estados ARIA. Antes, intentar con `<button>`.

## 6. Botones con nombre
Un botón solo con icono suena «Botón. Botón. Botón.» Sin nombre no se sabe cuál borra la factura.
```html
<button type="button" aria-label="Borrar factura"><svg aria-hidden="true" focusable="false">…</svg></button>
```
- Icono decorativo dentro de botón con texto: `aria-hidden="true"`.
- Si el botón ya tiene texto visible, **no hace falta `aria-label`** (el texto es el nombre). Si lo pones, que **contenga** el texto visible (para control por voz: «pulsa Guardar factura»).
- Nombres únicos en listas repetidas: «Eliminar pastillas de freno», no 20 «Eliminar» iguales (usa `aria-label` o texto oculto con `.sr-only`).
