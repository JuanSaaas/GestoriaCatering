# Código base accesible (copiar y adaptar)

## Contenido
1. HTML esqueleto
2. CSS base
3. Formulario accesible
4. Tabla accesible
5. Aviso de estado y modal

## 1. HTML esqueleto
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- nunca user-scalable=no -->
  <title>Facturas · Mi aplicación</title>
  <link rel="stylesheet" href="base.css">
</head>
<body>
  <a href="#contenido" class="saltar">Saltar al contenido principal</a>
  <header>…</header>
  <nav aria-label="Principal">…</nav>
  <main id="contenido" tabindex="-1">
    <h1>Facturas</h1>
  </main>
  <footer>…</footer>
</body>
</html>
```

## 2. CSS base
Colores medidos con `scripts/contraste.py`: texto `#1A1A1A` sobre blanco 17,4:1; enlace `#0B57D0` sobre blanco 6,4:1; gris de apoyo `#595959` sobre blanco 7,0:1. Revalida si cambias cualquier valor.

```css
:root {
  color-scheme: light dark;
  --fondo: #ffffff;
  --texto: #1a1a1a;
  --apoyo: #595959;       /* texto secundario, ≥ 4,5:1 */
  --enlace: #0b57d0;
  --borde: #767676;       /* bordes de campos y botones, ≥ 3:1 */
  --foco: #ffdd00;
  --foco-borde: #000000;
  --ok: #006b4f;  --aviso: #8a4b00;  --error: #b3261e;   /* siempre con icono y palabra */
}
@media (prefers-color-scheme: dark) {
  :root { --fondo: #121212; --texto: #f2f2f2; --apoyo: #c4c4c4; --enlace: #8ab4f8;
          --borde: #8c8c8c; --ok: #5fd3a6; --aviso: #ffb454; --error: #ff8a80; }
}

html { font-size: 100%; scroll-padding-top: 5rem; }   /* respeta el tamaño del sistema */
body { margin: 0; background: var(--fondo); color: var(--texto);
       font: 1rem/1.5 system-ui, "Segoe UI", Arial, sans-serif; text-align: left; }
p, li { max-width: 70ch; }
img, video, svg { max-width: 100%; height: auto; }
main:focus { outline: none; }  /* solo el destino del enlace "saltar"; main no es interactivo */

/* Enlaces: subrayados siempre */
a { color: var(--enlace); text-decoration: underline; text-underline-offset: 0.15em; }
a:hover { text-decoration-thickness: 0.2em; }

/* Foco visible: anillo doble que se ve sobre cualquier fondo */
:focus-visible { outline: 3px solid var(--foco); outline-offset: 3px; box-shadow: 0 0 0 6px var(--foco-borde); }

/* Saltar al contenido: oculto hasta recibir el foco */
.saltar { position: absolute; left: 0.5rem; top: -4rem; padding: 0.75rem 1rem;
          background: var(--foco); color: #000; font-weight: 700; z-index: 1000; }
.saltar:focus { top: 0.5rem; }

/* Solo para lectores de pantalla */
.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden;
           clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

/* Botones */
button, .boton { min-height: 48px; min-width: 48px; padding: 0.5rem 1.25rem; font: inherit; font-weight: 600;
  color: var(--texto); background: var(--fondo); border: 2px solid var(--borde); border-radius: 0.5rem; cursor: pointer; }
.boton-principal { background: var(--enlace); color: #fff; border-color: transparent; }
@media (prefers-color-scheme: dark) { .boton-principal { color: #000; } }
button:hover { text-decoration: underline; }
button:active { transform: translateY(1px); }
button[aria-disabled="true"] { border-style: dashed; cursor: not-allowed; }

/* Campos */
label { display: block; font-weight: 600; margin-block: 1rem 0.25rem; }
input, select, textarea { font: inherit; min-height: 48px; padding: 0.5rem 0.75rem; width: 100%; max-width: 32rem;
  color: var(--texto); background: var(--fondo); border: 2px solid var(--borde); border-radius: 0.375rem; }
[aria-invalid="true"] { border-color: var(--error); border-style: solid; }
.error { color: var(--error); font-weight: 600; }

/* Tablas anchas con scroll accesible */
.tabla-scroll { overflow-x: auto; }
th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid var(--borde); }
td.num { text-align: right; font-variant-numeric: tabular-nums; }

/* Alto contraste de Windows: los botones conservan borde */
@media (forced-colors: active) { button, .boton, input { border: 2px solid ButtonText; } }

/* Reducir movimiento */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
/* Más contraste si el usuario lo pide */
@media (prefers-contrast: more) { :root { --apoyo: var(--texto); --borde: currentColor; } }
```
> Comprueba con el script los contrastes de `--ok`, `--aviso`, `--error` y del texto del botón principal en tu paleta; si cambias la marca, vuelve a medir.

## 3. Formulario accesible
```html
<form novalidate aria-labelledby="titulo-form">
  <h2 id="titulo-form">Nuevo cliente</h2>
  <p>Los campos marcados como <strong>(obligatorio)</strong> hay que rellenarlos.</p>

  <div id="resumen-errores" role="alert" tabindex="-1" hidden>
    <h3>Hay 1 error en el formulario</h3>
    <ul><li><a href="#nif">NIF del cliente: faltan caracteres</a></li></ul>
  </div>

  <label for="nombre">Nombre o razón social (obligatorio)</label>
  <input id="nombre" name="nombre" required autocomplete="organization">

  <label for="nif">NIF del cliente (obligatorio)</label>
  <input id="nif" name="nif" required aria-describedby="nif-ayuda nif-error" aria-invalid="true">
  <p id="nif-ayuda">9 caracteres, por ejemplo 12345678Z.</p>
  <p id="nif-error" class="error"><span aria-hidden="true">⚠ </span>Faltan caracteres: el NIF tiene 9.</p>

  <fieldset>
    <legend>¿Cómo prefiere que le contactemos?</legend>
    <label><input type="radio" name="via" value="correo"> Correo electrónico</label>
    <label><input type="radio" name="via" value="chat"> Chat</label>
    <label><input type="radio" name="via" value="telefono"> Teléfono</label>
  </fieldset>

  <button type="submit" class="boton-principal">Guardar cliente</button>
  <button type="button">Cancelar</button>
</form>
```
(En los `label` de radio/checkbox, usa `display: inline` y separación mínima de 48 px de zona pulsable.)

## 4. Tabla accesible
Ver ejemplo completo en `teclado-lector-pantalla.md` §4. Envuélvela así si es ancha:
```html
<div class="tabla-scroll" role="region" aria-label="Tabla de facturas" tabindex="0">
  <table>…</table>
</div>
```

## 5. Aviso de estado y modal
```html
<!-- Aviso no intrusivo: el lector lo anuncia sin mover el foco -->
<div role="status" aria-live="polite" id="aviso"></div>
<script>document.getElementById('aviso').textContent = '✓ Factura F-0231 guardada';</script>

<!-- Modal con <dialog> nativo -->
<dialog id="confirmar" aria-labelledby="t-confirmar">
  <h2 id="t-confirmar">¿Borrar la factura F-0231?</h2>
  <p>Se borrarán sus 3 líneas. No se puede deshacer.</p>
  <button type="button" id="cancelar">Cancelar</button>
  <button type="button" id="borrar">Borrar factura</button>
</dialog>
<script>
  const dlg = document.getElementById('confirmar');
  let origen;
  function abrir(btn){ origen = btn; dlg.showModal(); dlg.querySelector('#cancelar').focus(); }
  dlg.addEventListener('close', () => origen && origen.focus()); // Esc cierra; el foco vuelve
  document.getElementById('cancelar').onclick = () => dlg.close();
</script>
```
