---
name: Pautas_WCAG
description: Aplicar y auditar accesibilidad WCAG 2.2 AA en páginas y aplicaciones web. Usar al diseñar, programar, revisar o refactorizar interfaces, formularios, navegación, componentes y contenido.
---

# Pautas_WCAG — Skill de accesibilidad web

## Misión
Diseñar, implementar y verificar interfaces inclusivas para personas con discapacidad visual, auditiva, motora o cognitiva, y limitaciones temporales o situacionales. Objetivo técnico: WCAG 2.2 AA; no afirmar conformidad sin auditoría manual y automática. Preservar la identidad visual del proyecto siempre que no perjudique la accesibilidad.

## Fuente obligatoria
Leer `references/temario-completo-53-diapositivas.md` antes de implementar: contiene el texto extraído de **todas las 53 diapositivas** y sus notas. Consultar `references/anexo-original.md` para el anexo textual del PDF, incluidas tablas. El PDF original contiene ejemplos visuales y simulaciones que deben consultarse cuando se evalúen colores, estados, diagramas y comparaciones. La fuente es material docente: distinguir sus recomendaciones de los requisitos normativos exactos; ante conflicto, prevalece la especificación WCAG aplicable.

## Proceso de trabajo (obligatorio)
1. Identificar stack, rutas, componentes, diseño existente, flujos críticos, dispositivos y contenido multimedia. Si falta información, inspeccionar repositorio; no inventar componentes.
2. Elaborar inventario de barreras con prioridad (bloqueante, alta, media, baja) y criterio WCAG asociado cuando se conozca.
3. Implementar primero HTML semántico nativo y accesibilidad por defecto; ARIA solo cuando sea necesario. Mantener nombres, roles, estados y valores accesibles sincronizados.
4. Verificar uso completo sin ratón: Tab, Shift+Tab, Enter, Espacio, flechas cuando correspondan, Escape en diálogos; orden lógico y foco visible, no trampas.
5. Revisar visualmente contraste, zoom 200%, reflujo a 320 CSS px, espaciado de texto, tamaños táctiles, alto contraste y modos de daltonismo. No bloquear zoom.
6. Verificar lector de pantalla (NVDA/VoiceOver/TalkBack), subtítulos, transcripciones, movimiento reducido, errores y mensajes dinámicos.
7. Ejecutar herramientas automáticas (axe, WAVE, Lighthouse/DevTools) y pruebas manuales; documentar resultado, archivos modificados, criterios comprobados, barreras pendientes y límites de la auditoría.

## Reglas de implementación
- **Perceptible:** `alt` significativo en imágenes informativas y `alt=""` en decorativas; subtítulos para vídeo y transcripción para audio; no depender solo de color, sonido, posición o forma; información textual alternativa para gráficos; texto normal >= 4.5:1, texto grande >= 3:1 y componentes/indicadores visuales >= 3:1 cuando aplique. Verificar sobre fondos reales y en cada estado.
- **Operable:** toda función por teclado, foco claro y no oculto, enlace de salto al contenido, áreas táctiles al menos 24×24 CSS px o excepciones de WCAG 2.2 AA; preferir 44–48 para comodidad. Alternativas a arrastrar, deslizar y gestos complejos. Evitar límites de tiempo innecesarios; dar control al usuario.
- **Comprensible:** navegación coherente, lenguaje directo, instrucciones antes de la acción, etiquetas visibles, errores específicos asociados a campos, sugerencias de corrección, confirmación/revisión para acciones importantes. Evitar botones desactivados sin explicación cuando resulte viable.
- **Robusto:** landmarks (`header`, `nav`, `main`, `footer`), jerarquía `h1`–`h6`, `label` enlazado, `fieldset`/`legend` para grupos, tablas de datos con `caption`, `th` y `scope`; botones para acciones y enlaces para navegación; ARIA con prudencia.
- **Color y gráficos:** usar estado con icono + texto + color; enlaces reconocibles (preferentemente subrayados); paleta Okabe–Ito para series, pero comprobar contraste de cada pareja; etiquetas directas en barras y líneas; respetar `forced-colors: active`.
- **Botones y formularios:** nombre descriptivo, foco, hover, activo, desactivado y error distinguibles; separación suficiente, acciones destructivas diferenciadas; `aria-describedby` para ayuda y errores; anunciar resultados dinámicos con región `role="status"` o `role="alert"` según urgencia.
- **Cognición y movimiento:** texto alineado a la izquierda, bloques breves, interfaz predecible, pasos visibles, sin estímulos innecesarios, respetar `prefers-reduced-motion: reduce`, evitar parpadeos peligrosos.
- **Audio y vídeo:** subtítulos sincronizados, transcripción y controles accesibles; no depender del sonido para alertas, ofrecer vías de contacto distintas al teléfono.
- **Pruebas:** probar lectores de pantalla, teclado, zoom, reflujo, simulación de daltonismo y visión borrosa, alto contraste, validación de formularios, móvil y escritorio. Las herramientas automáticas no demuestran conformidad total.

## Condiciones de aceptación
- No hay funciones esenciales exclusivas del ratón, gestos o color.
- Los elementos interactivos tienen nombre accesible, foco visible y orden lógico.
- Contrastes comprobados y contenido legible con ampliación/reflujo.
- Formularios comunican instrucciones, errores y resultados sin depender de visión.
- Multimedia tiene alternativas y las animaciones respetan preferencias.
- Se entrega reporte de pruebas, con fallos pendientes y pasos de reproducción.

## Materiales incluidos
- `references/temario-completo-53-diapositivas.md`: texto de cada diapositiva, con notas y ejemplos.
- `references/anexo-original.md`: anexo textual íntegro del PDF (páginas 54–89).
- `references/checklist-implementacion.md`: checklist por componentes y pruebas.
- `examples/accesibilidad-base.css`: estilos reutilizables.
- `examples/componentes.html`: patrones semánticos de ejemplo.

## Nota sobre fuentes
Las 53 diapositivas y el anexo son contenido del material proporcionado por el usuario. La síntesis y los ejemplos de código son adaptaciones de implementación, no transcripciones literales de las normas. Evitar prometer cumplimiento legal automático.
