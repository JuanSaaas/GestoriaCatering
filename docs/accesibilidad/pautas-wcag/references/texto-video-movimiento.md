# Texto, vídeo y movimiento

## Contenido
1. Tipografía legible (también con dislexia)
2. Lenguaje claro
3. Vídeo y audio
4. Animaciones y movimiento

## 1. Tipografía legible
Recomendaciones de la British Dyslexia Association, coincidentes con Apple y Google.

| Recomendación | Valor |
|---|---|
| Tamaño del texto | **16 a 19 px** (mínimo 16 px) |
| Interlineado | **1,5** |
| Alineación | **a la izquierda**, nunca justificado |
| Para destacar | **negrita**; no cursiva, subrayado ni MAYÚSCULAS |
| Fuente | sin serifa (system-ui, Arial, Verdana…) |
| Longitud de línea | ≈ 45–75 caracteres (`max-width: 70ch`) |

```css
body { font: 1rem/1.5 system-ui, "Segoe UI", Arial, sans-serif; text-align: left; }
p, li { max-width: 70ch; }
```
- Párrafos cortos, listas con viñetas, encabezados descriptivos; evitar bloques densos.
- Espaciado ajustable: la página no debe romperse si el usuario aumenta interlineado (1,5), espacio entre párrafos (2×), letras (0,12 em) y palabras (0,16 em).
- Permitir cambiar contraste fondo/texto (modo oscuro / alto contraste). Respetar `prefers-color-scheme` y `prefers-contrast`.
- Apoyar el texto con imágenes y diagramas; ofrecer otros formatos (audio/vídeo) para contenido largo.

## 2. Lenguaje claro
Ayuda a todos: también a quien va con prisa o lee en otro idioma. Para contenido importante existe la **lectura fácil** (logotipo propio, validada por personas con discapacidad intelectual).

Principios: **frases cortas con una sola idea · las palabras que usa la persona en su trabajo · decir qué pasa y qué tiene que hacer.** Sin regionalismos ni expresiones idiomáticas (sordas, autismo, otros idiomas).

| Habitual | Lenguaje claro |
|---|---|
| Se ha producido un error en la validación de los datos introducidos. | Falta el NIF del cliente. |
| No se puede completar la operación por restricciones de integridad referencial. | No se puede borrar este cliente porque tiene 12 pedidos. |
| Proceda a cumplimentar la totalidad de los campos obligatorios. | Rellena los campos marcados como obligatorios. |
| Su sesión ha caducado por inactividad prolongada. | Has estado 20 minutos sin usar la aplicación. Vuelve a entrar para seguir. |

- Mensajes de error: **qué pasó + qué hacer**, sin códigos internos ni culpar.
- Explicar **qué ocurrirá después** de una acción y los plazos (ansiedad); permitir **revisar antes de enviar**.
- Abreviaturas y siglas explicadas la primera vez (`<abbr title="…">`).
- Mismo vocabulario y mismos elementos en el mismo sitio en toda la app (navegación consistente).

## 3. Vídeo y audio
Un videotutorial sin subtítulos deja fuera a las personas sordas y a quien está en un sitio con ruido.
- **Subtítulos** (activables) + **transcripción completa** en texto («Ver la transcripción»).
- Vídeo sin voz: descripción en texto o audiodescripción (WCAG AA exige audiodescripción en vídeo pregrabado cuando la imagen aporta información no dicha).
- Subtítulos automáticos de YouTube: **revisarlos**, fallan con nombres de producto y cifras.
- Sin **autoplay con sonido**; controles accesibles por teclado (play/pausa, volumen, subtítulos).
- **Avisos visuales además de sonoros** (un pitido de error necesita también mensaje visible).
- No ofrecer el **teléfono como única vía** de contacto: añadir chat, correo o formulario; permitir elegir la vía de comunicación preferida.

```html
<video controls preload="metadata">
  <source src="tutorial.mp4" type="video/mp4">
  <track kind="captions" src="tutorial.es.vtt" srclang="es" label="Español" default>
</video>
<details><summary>Ver la transcripción</summary><p>Pulsa Confirmar para emitir la factura…</p></details>
```

## 4. Animaciones y movimiento
Las animaciones pueden marear (trastornos vestibulares) y los destellos provocar crisis epilépticas.
- Respetar el ajuste del sistema **reducir movimiento** (macOS, Windows, Android, iOS) con `prefers-reduced-motion`.
- **Nada que destelle más de 3 veces por segundo.**
- **Carruseles, autoscroll y vídeos de fondo con botón de pausa** (si se mueven más de 5 s).
- Animaciones cortas que acompañen la acción, no que distraigan (TDAH, autismo). Sin parallax agresivo.
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
```
