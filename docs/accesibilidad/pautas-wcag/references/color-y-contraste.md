# Color accesible

## Contenido
1. El color nunca como única pista
2. Contraste en cifras
3. Paleta Okabe-Ito
4. Combinaciones a evitar
5. Gráficos, enlaces y alto contraste
6. Cómo comprobar

## 1. El color nunca como única pista
Con deuteranopía, un aviso de éxito (verde) y uno de error (rojo) se vuelven casi iguales. Si el mensaje no lo dice con **palabra o icono**, no hay forma de distinguirlos.

| Mal | Bien |
|---|---|
| Fila verde / ámbar / roja sin más | `✓ Pagada` · `Pendiente` · `! Vencida` (icono + palabra + color) |

Con color + icono + palabra el estado se entiende con daltonismo, impreso en blanco y negro o con lector de pantalla. GitHub lo resuelve igual: «Abierta» y «Cerrada» tienen icono y palabra propios.

## 2. Contraste en cifras (WCAG 2.2)
| Elemento | AA (obligatorio) | AAA |
|---|---|---|
| Texto normal | **4,5 : 1** | 7 : 1 |
| Texto grande (≥ 24 px, o ≥ 19 px en negrita) | **3 : 1** | 4,5 : 1 |
| Iconos, bordes de campos, gráficos y foco | **3 : 1** | 3 : 1 |

La escala va de 1:1 (sin contraste) a 21:1 (negro sobre blanco).

Ejemplos medidos: gris `#767676` sobre blanco 4,5:1 (**aprueba**, es el gris más claro permitido para texto normal) · gris `#999999` 2,8:1 (**suspende**) · blanco sobre verde típico 3,3:1 (**solo texto grande**; hay que oscurecer el verde) · verde GOV.UK 6,2:1 · rojo salesiano 5,4:1 · foco GOV.UK 11,7:1 · gris claro sobre blanco 2,0:1 (**suspende**) frente a texto oscuro 15,8:1.

Los placeholders, textos de ayuda, pies de tabla y textos deshabilitados que aporten información **también** deben cumplir 4,5:1. Valida cada pareja con `python scripts/contraste.py "#fondo" "#texto"`.

## 3. Paleta Okabe-Ito (segura para cualquier daltonismo)
Diseñada (Okabe e Ito, 2008) para que sus ocho colores se distingan con deuteranopía, protanopía y tritanopía. Referencia en gráficos científicos.

```css
:root {
  --negro: #000000;
  --naranja: #E69F00;
  --celeste: #56B4E9;
  --verde: #009E73;
  --amarillo: #F0E442;
  --azul: #0072B2;
  --bermellon: #D55E00;
  --rosa: #CC79A7;
}
```
Úsala para series de gráficos y categorías. **Ojo:** que sea segura para daltonismo no la hace segura de contraste; el amarillo y el celeste no sirven como texto sobre blanco. Mide siempre.

## 4. Combinaciones
**Evitar como única diferencia:** rojo y verde · verde y marrón · azul y morado · verde y azul.
**Mejores opciones:** azul y naranja · azul y bermellón · negro y amarillo · oscuro y blanco.
Si dos cosas deben distinguirse por color, que sea azul frente a naranja, no rojo frente a verde, y **aun así con texto o icono**.
Las personas con autismo prefieren colores simples y suaves: evitar colores brillantes muy contrastados en grandes superficies.

## 5. Gráficos, enlaces y alto contraste

**Gráficos:** etiquetas directas sobre cada barra/línea, valor escrito y texturas o formas distintas; la leyenda solo por color obliga a emparejar colores. Dar también una tabla o un resumen en texto (`<figure>` + `<figcaption>`, o `alt`/`aria-label` descriptivo con los datos clave).

**Enlaces:** el subrayado es la forma más segura. Si no se subraya, el color del enlace necesita **3:1** de contraste con el texto de alrededor (además de 4,5:1 con el fondo).

**Alto contraste de Windows (`forced-colors`):** el sistema quita los fondos. Un botón que solo es un fondo de color queda como texto suelto. Truco: borde de 2 px transparente, que se vuelve visible en ese modo.
```css
.boton { border: 2px solid transparent; }
@media (forced-colors: active) { .boton { border: 2px solid ButtonText; } }
```

**Baja visión:** no depender de texto gris claro; con la vista borrosa solo se lee el texto oscuro. Permitir modo oscuro / cambio de contraste (ayuda también a la dislexia).

## 6. Cómo comprobar
- `scripts/contraste.py` para cada pareja de colores.
- Chrome: F12 → Rendering → **Emulate vision deficiencies** (protanopía, deuteranopía, tritanopía, visión borrosa, acromatopsia).
- Imprimir o ver en blanco y negro: ¿siguen distinguiéndose los estados?
