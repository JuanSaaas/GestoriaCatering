# Criterios de interfaz del proyecto

Aplica `.agents/skills/SKILL.md` al crear o modificar interfaces de este proyecto.
La empresa es La Mesa Perfecta (eventos y catering); conserva su identidad y sus
datos de negocio. El usuario principal del CRM es el equipo comercial y de
administración, que necesita registrar solicitudes y organizar eventos con rapidez.

- Reutiliza los controles de `components/ui.tsx`, `ValidatedForm`, `FormSteps`,
  `SearchableSelect` y `useDialog` cuando corresponda.
- Etiquetas visibles y asociadas, obligatorios con asterisco, mensajes concretos
  junto al campo y formularios en una columna. Divide las altas largas en pasos.
- Una acción principal por contexto, controles de al menos 44 px, foco visible,
  teclado, estados con texto y símbolo, y avisos accesibles al guardar.
- Confirma los borrados nombrando el registro y sus consecuencias. Comprueba el
  resultado de la operación antes de quitar datos de la pantalla.
- Usa lenguaje de negocio, fechas españolas e importes en euros con dos decimales.
- Comprueba estados vacíos, carga, error y éxito, y conserva los cambios previos.

La skill menciona cuatro archivos bajo `references/` que no estaban presentes al
realizar esta revisión. No inventes su contenido ni afirmes que se ha pasado su
checklist de 20 puntos. Si se incorporan, léelos y completa la revisión.

## Accesibilidad de la web y del CRM

Aplica también `docs/accesibilidad/pautas-wcag/SKILL.md` y sus referencias al
crear o modificar interfaces públicas y del CRM. Es la skill aportada por el
usuario, conservada con sus archivos originales. Mantén navegación por teclado,
foco visible, etiquetas y errores asociados, contraste medido, reducción de
movimiento y contenido legible al ampliar. Documenta las comprobaciones y las
pruebas manuales pendientes en `docs/accesibilidad/REVISION.md`; no afirmes
conformidad WCAG completa basándote solo en pruebas automáticas.

La versión ampliada aportada el 26/10/2026 está en
`docs/accesibilidad/Pautas_WCAG/SKILL.md`. Aplica también su temario completo,
anexo y checklist; esta versión prevalece cuando amplía o precisa la anterior.
Mantén las fuentes originales sin editar y documenta barreras, prioridad,
criterios WCAG, pruebas y límites de la auditoría. No copies ejemplos negativos
del material docente ni afirmes haber revisado ilustraciones del PDF no incluido.
