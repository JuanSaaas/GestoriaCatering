---
name: pautas-wcag
description: Diseña, programa y revisa páginas web y aplicaciones web accesibles (WCAG 2.2 nivel AA) para personas con discapacidad visual (ceguera, baja visión, daltonismo), auditiva, motora y cognitiva (dislexia, TDAH, autismo, ansiedad). Úsala SIEMPRE que se cree, modifique o revise cualquier HTML, CSS, JS, React, formulario, tabla, botón, menú, paleta de colores, gráfico, modal, vídeo, landing, dashboard, ERP/CRM o prototipo web, aunque el usuario no mencione accesibilidad. También cuando mencione WCAG, a11y, daltonismo, contraste, lector de pantalla, teclado, foco, aria, alt, subtítulos, "pautas WCAG", "accesible", "discapacidad", Lighthouse o WAVE. Aplica los 4 principios (perceptible, operable, comprensible, robusto) y el checklist de accesibilidad paso a paso.
---

# Pautas-WCAG: webs y aplicaciones accesibles para todas las personas

Esta skill convierte la presentación «Interfaces accesibles para todas las personas» (Álvaro Juan Ciriaco, Desarrollo de Interfaces, 2.º DAM, Salesianos Zaragoza) en un método de trabajo. Objetivo: que cualquier página o aplicación web sea usable por personas con discapacidad visual, auditiva, motora o cognitiva. **El nivel mínimo exigido es WCAG 2.2 AA** (lo que piden el Real Decreto 1112/2018, la Ley 11/2023 y la norma EN 301 549).

La accesibilidad no es un extra: se aplica **mientras se escribe el código**, no al final. Todo lo que se cree o revise debe pasar el checklist de `references/checklist.md`.

## Cuándo leer cada archivo

- `references/principios-y-perfiles.md`: los 4 principios WCAG, niveles A/AA/AAA, ley y los 7 perfiles de usuario con sus «Sí / No». Léelo al empezar un diseño o cuando el usuario pregunte «para quién» o «por qué».
- `references/color-y-contraste.md`: contrastes, paleta Okabe-Ito, estados, gráficos, enlaces, alto contraste. Léelo siempre que se elijan colores, estados o gráficos.
- `references/botones-y-controles.md`: forma, estados, tamaño, desactivados, botón vs. enlace, nombres. Léelo siempre que haya botones, iconos o gestos.
- `references/teclado-lector-pantalla.md`: imágenes, formularios, títulos, tablas, foco, «saltar al contenido», zoom. Léelo siempre que se escriba HTML o componentes.
- `references/texto-video-movimiento.md`: tipografía, lenguaje claro, vídeo, animaciones. Léelo cuando haya texto, mensajes, vídeo o animaciones.
- `references/codigo-base.md`: CSS y HTML listos para copiar (variables, foco, saltar, sr-only, alto contraste, reduced-motion, formulario, tabla). Úsalo como punto de partida de cualquier proyecto nuevo.
- `references/checklist.md`: checklist de 20 puntos + cómo comprobarlos. Léelo **al final de todo trabajo**.
- `scripts/contraste.py`: calcula la relación de contraste entre dos colores hex según WCAG. Úsalo para validar cualquier pareja de colores en vez de adivinar.

## Flujo de trabajo (siempre en este orden)

1. **Entender**: qué se construye y quién lo usará. Si no se sabe, asume que lo usarán personas con perfiles diversos (también mayores, con prisa o en móvil al sol).
2. **Partir de `codigo-base.md`** en proyectos nuevos: variables de color seguras, foco visible, enlace «Saltar al contenido», `prefers-reduced-motion`, `forced-colors`.
3. **Construir con HTML semántico primero**: `<button>`, `<a>`, `<label>`, `<table>`, `<main>`, `<nav>`, `h1`–`h6`. ARIA solo cuando HTML no baste.
4. **Elegir colores con el script** `scripts/contraste.py`; nunca dar un color por válido sin medirlo.
5. **Revisar con el checklist** y corregir hasta cumplir los 20 puntos.
6. **Informar**: qué se hizo, qué regla justifica las decisiones importantes y qué punto queda pendiente de probar a mano (lector de pantalla, zoom, Tab).

## Reglas que no se negocian

1. **El color nunca es la única pista.** Estado = color + icono + palabra (✓ Pagada, Pendiente, ! Vencida). Enlaces subrayados. Gráficos con etiquetas directas.
2. **Contraste mínimo (AA):** texto normal 4,5:1; texto grande (≥24 px, o ≥19 px en negrita) 3:1; iconos, bordes de campos, gráficos y foco 3:1.
3. **Todo se maneja con teclado**, con orden lógico de Tab y **foco siempre visible**. Nunca `outline: none` sin alternativa.
4. **Elemento correcto para cada cosa:** si cambia de página → `<a href>`; si hace una acción → `<button type="button">`. Nunca `<div onclick>`.
5. **Todo control tiene nombre:** botones con verbo y objeto («Borrar factura»), iconos con `aria-label`, campos con `<label for>` visible (el `placeholder` no es etiqueta).
6. **Imágenes con `alt`** que describe la información; decorativas con `alt=""`.
7. **Títulos reales** (`h1` único, `h2`, `h3` en orden) y regiones (`header`, `nav`, `main`, `footer`). Tablas de datos con `<table>`, `<caption>`, `<th scope>`; nunca tablas para maquetar.
8. **Zonas pulsables ≥ 44–48 px** y separadas. Todo gesto (deslizar, mantener) tiene alternativa con botón.
9. **Zoom hasta 200 % (y reflow a 320 px / 400 %) sin romper nada.** Medidas en `rem`, sin alturas fijas, nunca bloquear el zoom en `<meta viewport>`.
10. **Errores claros junto al campo:** qué pasó y cómo arreglarlo, con icono, unidos con `aria-describedby`. Sin límites de tiempo ni cuentas atrás; permitir revisar antes de enviar.
11. **Preferir botones que explican a botones desactivados:** el botón siempre se puede pulsar y, si falta algo, lo dice al lado.
12. **Movimiento:** respetar `prefers-reduced-motion`, nada que destelle más de 3 veces por segundo, pausa en carruseles y vídeos.
13. **Vídeo/audio:** subtítulos y transcripción; avisos visuales además de sonoros; nunca el teléfono como único contacto.
14. **Lenguaje claro:** frases cortas, palabras de uso diario, sin regionalismos ni expresiones idiomáticas; texto ≥16 px, interlineado 1,5, alineado a la izquierda, sin mayúsculas ni cursivas para destacar.

## Formato de la respuesta cuando se genera código

- Entrega el código ya accesible, sin pedir permiso para aplicar las reglas.
- Añade al final una sección breve **«Accesibilidad aplicada»** con 3–8 puntos (qué regla y por qué) y **«A probar a mano»** (Tab por toda la página, zoom 200 %, lector de pantalla, simulador de daltonismo de Chrome).
- Si el usuario pide algo que rompe una regla (p. ej. gris claro sobre blanco, `outline: none`), explica en una línea el problema y ofrece la alternativa accesible equivalente en lugar de limitarte a negarte.

## Formato de la respuesta cuando se audita código existente

Para cada problema: **dónde** → **qué regla incumple** → **a quién afecta** → **cómo se arregla** (con código). Ordena de más a menos grave y termina con el checklist marcado (✓ / ✗ / sin comprobar).

## Límites honestos

Las herramientas automáticas (Lighthouse, WAVE) solo detectan una parte de los problemas. Nunca afirmes que una web «es 100 % accesible»: di qué se ha comprobado y qué falta probar con teclado, lector de pantalla y personas reales.
