---
name: erp-ux-salesianos
description: Diseña y revisa interfaces de ERP/CRM (formularios, listas, fichas, paneles, menús, prototipos) siguiendo la guía de UX del profesor Álvaro Juan Ciriaco (Salesianos Zaragoza, 2.º DAM, SGE + DDI). Úsala siempre que el usuario pida crear, rehacer, revisar o auditar un CRM, ERP, formulario, pantalla de alta de cliente, pedido, factura, tabla, dashboard, wireframe o prototipo, o mencione "la presentación del profesor", "guía de UX", "checklist de UX", "práctica 1/2", "taller mecánico", Odoo o Figma, aunque no diga la palabra "skill". Aplica las 18 fichas de buenas prácticas y el checklist de 20 puntos, paso a paso.
---

# ERP/CRM profesional: guía de UX de la asignatura

Esta skill convierte la presentación "SGE + DDI · Bloques 1 y 2" en un método de trabajo. El criterio es el del profesor: la interfaz se evalúa **punto por punto con el checklist** (`references/checklist.md`). Todo lo que se cree o revise debe pasarlo.

Ejemplo de cliente de todo el curso: **taller mecánico**. Persona de referencia: **Marta, 42 años, recepcionista**, nivel técnico bajo, ordenador de mostrador con el teléfono en la mano. Objetivo: dar una cita en menos de un minuto. Salvo que el usuario indique otra empresa, usa estos datos de ejemplo (Talleres Pérez, F-0231, P-0458...).

## Cuándo leer cada archivo

- `references/guia-ux.md`: las 18 fichas (Así no / Así sí / Regla). Léelo antes de diseñar o revisar cualquier pantalla.
- `references/formularios-paso-a-paso.md`: receta ordenada para construir un formulario y un CRM completo. Léelo siempre que haya formularios.
- `references/checklist.md`: los 20 puntos de revisión. Léelo al final de todo trabajo.
- `references/contexto-curso.md`: ERP, CRM, módulos, modelo de datos, capas, roles, arquitectura de información y entregables de las prácticas. Léelo cuando haya que decidir módulos, tablas, menú o permisos.

## Flujo de trabajo (siempre en este orden)

1. **Entender**: empresa, usuario principal (persona) y tarea principal. Si falta, asume el taller mecánico y Marta, y dilo en una línea.
2. **Arquitectura de información**: menú lateral con las palabras del usuario (Clientes, Ventas, Inventario, Facturas, Ajustes), no con nombres de tabla.
3. **Elegir el patrón de pantalla**: Lista, Ficha, Formulario o Cuadro de mando. Reutiliza el mismo patrón en todos los módulos.
4. **Construir cada pantalla** siguiendo la receta de `formularios-paso-a-paso.md`.
5. **Revisar con el checklist** y corregir hasta que pase los 20 puntos.
6. **Informar**: qué se hizo, qué ficha de la guía justifica cada decisión importante y qué punto del checklist queda pendiente, si lo hay.

## Reglas que no se negocian

Estas son las reglas de la guía en una línea. El detalle está en `guia-ux.md`.

1. Un solo botón principal por pantalla, con verbo claro ("Guardar factura", nunca "Aceptar").
2. Etiqueta siempre visible encima del campo; el placeholder es solo ejemplo. Obligatorios con `*`. Ayuda breve debajo cuando haga falta.
3. Una columna, alineada a la izquierda, campos agrupados por tema. Formularios largos, por pasos con progreso visible ("Paso 1 de 3").
4. Errores junto al campo: qué pasó, dónde y cómo arreglarlo. Con icono, no solo color rojo. Validar mientras se escribe.
5. Acciones peligrosas: separadas, en rojo (el rojo solo para destructivas) y con confirmación que nombra el elemento y sus consecuencias.
6. Toda acción responde en menos de 1 s: botón "Guardando…" desactivado y aviso "✓ ... guardada" con Ver/Deshacer.
7. Pantallas vacías: explicación + acción ("Todavía no tienes clientes" + Añadir cliente + Importar Excel).
8. Datos en formato español: 08/10/2026, 1.234,50 €, importes a la derecha, estados con palabras.
9. Estados con texto + símbolo + color (✓ Pagada, Pendiente, ! Vencida). El color nunca es la única señal.
10. Más de diez opciones: buscador con sugerencias y opción de crear sin salir.
11. Valores por defecto (fecha de hoy, cantidad 1, IVA 21 %) y totales calculados.
12. Navegación: sección activa resaltada, migas de pan (Ventas › Pedidos › P-0458) y título del registro.
13. Lenguaje del usuario, sin términos técnicos (`res.partner`, `NULL value`, "Error 422").
14. Accesibilidad: contraste mínimo 4,5:1, botones de al menos 44 px, foco visible, uso completo con teclado.
15. Espaciados en múltiplos de 8 px (8, 16, 24, 32, 48, 64) y retícula de 12 columnas.
16. Paneles: pocos indicadores con comparación con el periodo anterior y un aviso que lleve a la acción.

## Cuando hay que revisar un CRM existente

Si el usuario pide "repasar todo el CRM", recorre cada pantalla (lista, ficha, formularios, dashboard, menú) y devuelve una tabla: **Pantalla | Problema | Ficha de la guía | Corrección**. Después aplica los cambios y vuelve a pasar el checklist. Si no tienes acceso al código o a las capturas del CRM, pídelos en vez de inventar su contenido.

## Formato de salida

- Si se construye una interfaz, entrégala como HTML autocontenido (o el stack que el usuario esté usando), con tokens CSS para color, espaciado (múltiplos de 8) y tipografía.
- Estilo visual de la presentación: tipografía Source Sans 3, color de acento rojo `#CA2D26` para la acción principal, texto `#1E2329`, texto secundario `#4A5562`. Úsalo salvo que el grupo tenga otra identidad.
- Responde en español.
