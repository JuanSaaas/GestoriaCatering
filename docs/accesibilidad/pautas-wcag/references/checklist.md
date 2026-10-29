# Checklist de accesibilidad (20 puntos)

Marca cada punto como ✓ cumple · ✗ incumple · ? sin comprobar. Se revisa **al terminar cualquier trabajo**. Un punto por cada elemento cumplido.

## Color
1. ☐ **Contraste 4,5:1** en texto normal (3:1 en texto grande, iconos, bordes de campo y foco) → `scripts/contraste.py`
2. ☐ **Nada solo con color**: estados con icono + palabra
3. ☐ **Paleta probada** con el simulador de daltonismo (Chrome → Rendering → Emulate vision deficiencies)
4. ☐ **Enlaces subrayados** (o 3:1 respecto al texto cercano)
5. ☐ **Gráficos con etiquetas** directas, valores y/o texturas

## Botones
6. ☐ **Parecen botones** (forma clara, borde ≥ 3:1)
7. ☐ **Foco visible** en todos los controles (`:focus-visible`, nunca `outline:none` sin alternativa)
8. ☐ **44 a 48 px y separados**; todo gesto con alternativa en botón
9. ☐ **Con nombre y verbo** («Borrar factura»); iconos con `aria-label`
10. ☐ **Botón o enlace correcto** (`<a>` navega, `<button>` actúa; nunca `div onclick`); sin botones desactivados mudos

## Teclado y lector
11. ☐ **Todo con teclado**, orden de Tab lógico, sin trampas
12. ☐ **Saltar al contenido** como primer elemento
13. ☐ **Títulos h1 y h2** reales + regiones (`header`, `nav`, `main`, `footer`); tablas con `th scope` y `caption`
14. ☐ **Imágenes con alt** (decorativas `alt=""`)
15. ☐ **Campos con etiqueta** visible, obligatorio en palabras, error unido con `aria-describedby`

## Contenido
16. ☐ **Lenguaje claro**: frases cortas, qué pasó y qué hacer; texto ≥ 16 px, interlineado 1,5, a la izquierda
17. ☐ **Texto al 200 %** (y 320 px / 400 % sin scroll horizontal); sin bloqueo de zoom
18. ☐ **Subtítulos** y transcripción; avisos visuales además de sonoros
19. ☐ **Animaciones que se apagan** (`prefers-reduced-motion`, sin destellos > 3/s, pausa en carruseles)
20. ☐ **Sin límites de tiempo** ni cuentas atrás; revisar antes de enviar; `lang="es"` y `<title>` por página

## Cómo comprobarlo (en este orden)
1. **Tab** por toda la app, sin ratón: ¿se ve el foco? ¿orden lógico? ¿se puede completar la tarea principal (p. ej. dar de alta un cliente)?
2. **Zoom 200 % y 400 %** y ventana de 320 px.
3. **Chrome → F12 → Rendering → Emulate vision deficiencies**: protanopía, deuteranopía, tritanopía, visión borrosa.
4. **Lighthouse** (F12 → Lighthouse → Accessibility): nota 0–100. Detecta solo problemas automáticos; 100 no significa accesible.
5. **WAVE** (wave.webaim.org o extensión): errores, contraste y avisos marcados sobre la página.
6. **Lector de pantalla** con los ojos cerrados:

| Lector | Dónde | Cómo se activa |
|---|---|---|
| VoiceOver | Mac | Comando + F5 |
| VoiceOver | iPhone | triple clic en el botón lateral (si está configurado) |
| TalkBack | Android | Ajustes → Accesibilidad → TalkBack |
| NVDA | Windows | gratuito, nvaccess.org |
| Narrador | Windows | Control + Windows + Intro |

Ejercicio final: dar de alta un cliente con los ojos cerrados y el lector encendido. **Lo que no se pueda hacer así, hay que arreglarlo.**

## Guías oficiales de referencia (gratuitas)
- Apple, Human Interface Guidelines → Accessibility: developer.apple.com/design/human-interface-guidelines/accessibility
- Google, Material Design → Accessibility: m3.material.io/foundations
- Microsoft, Inclusive Design: inclusive.microsoft.design
- W3C, WCAG 2.2: w3.org/WAI/standards-guidelines/wcag
- Carteles de accesibilidad, Home Office: github.com/UKHomeOffice/posters
