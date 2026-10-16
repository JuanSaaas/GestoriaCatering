# Aplicación de la skill de UX — 15/10/2026

Skill utilizada: [erp-ux-salesianos](../.agents/skills/SKILL.md).
Empresa: La Mesa Perfecta, eventos y catering. Usuarios: equipo comercial y
administración. Tarea principal: registrar una solicitud, asignar responsable y
organizar su seguimiento. Se conserva la identidad existente del catering y el
acento azul del CRM (la skill permite mantener la identidad del grupo).

## Pantallas revisadas

| Pantalla | Problema detectado | Regla de la skill | Corrección aplicada |
| --- | --- | --- | --- |
| Web pública | Formulario largo, campos en dos columnas, obligatorios sin señalar | 2, 3, 4, 6 | Tres pasos con progreso, columna única, etiquetas y validación junto al campo; envío y resultado accesibles |
| Cabecera pública | Navegación oculta en móvil | 12, 14 | Menú móvil desplegable con estado accesible y enlaces utilizables |
| Acceso al CRM | Validación solo nativa, controles pequeños | 2, 4, 14 | Validador compartido, obligatorios visibles y controles ampliados |
| Navegación del CRM | Buscador deshabilitado, falta acceso a tareas y migas de pan | 12, 13, 14 | Menú activo accesible, Resumen, Tareas, ruta, salto al contenido y menú móvil con foco contenido |
| Resumen | Sin comparación temporal ni aviso accionable | 8, 13, 16 | Comparación de solicitudes del mes con el mismo intervalo anterior; enlace a oportunidades; descripciones accesibles de gráficos |
| Empresas | Alta horizontal, etiquetas sin asociación, error en alert | 1, 2, 3, 4, 6, 7 | Alta vertical con acción Crear empresa, etiquetas asociadas, avisos de resultado y acción en vacío |
| Contactos | Buscador sin etiqueta visible y vacío sin siguiente paso | 2, 7 | Buscador etiquetado; limpiar filtros o crear oportunidad |
| Fichas de empresa y contacto, incluida ruta antigua de empleados | Etiquetas sin asociación, correo sin tipo, guardado sin aviso de éxito | 2, 3, 4, 6, 10 | Columna única, campos asociados, validación de correo, mensajes de guardado y búsqueda en catálogos largos |
| Nueva oportunidad | Alta larga y errores con instrucciones SQL | 3, 4, 13, 14 | Pasos Contacto / Evento / Asignación, mensajes de negocio y control del foco del diálogo |
| Asignación y alta rápida | Solo placeholders en altas y catálogos largos | 2, 10 | Etiquetas visibles, filtro de opciones y creación sin abandonar la ficha |
| Tablero de oportunidades | Tarjetas solo utilizables con ratón, errores de guardado ignorados | 4, 6, 7, 9, 14 | Apertura con Enter/Espacio, cambio de fase desde ficha, avisos, filtro sin responsable y vacío con acción |
| Ficha de oportunidad | Borrado genérico, actualizaciones sin comprobar error, tareas sin etiqueta | 2, 5, 6, 14 | Confirmación con nombre y consecuencias, actualización tras éxito, avisos y foco dentro del diálogo |
| Cierres previstos | Vacío sin siguiente paso; enlace no abría la ficha | 7, 12 | Acción para revisar fechas y apertura por identificador desde el tablero |
| Tareas | Sin carga/error, estado solo visual, sin acceso a la oportunidad | 6, 7, 9, 12 | Estados de carga y guardado, estado textual accesible, enlace a ficha y acción inicial |
| Recursos humanos | Formularios en columnas, feedback de validación desigual y estados por color | 2, 3, 4, 6, 9, 14 | Formularios verticales, validación compartida, símbolos de estado, etiquetas de obligatorios y diálogo con foco estable |
| Base visual | Controles de 32–40 px, foco y contraste secundarios desiguales | 8, 14, 15 | Tokens de espaciado, controles de 44–48 px, foco global, importes con céntimos, fechas numéricas y texto secundario más oscuro |

Los números anteriores corresponden a las **16 reglas incluidas en SKILL.md**,
no a números de fichas de la presentación: esas fichas no estaban disponibles.

## Verificación y límites

- Compilación de producción y comprobación de TypeScript.
- Nueve pruebas existentes de lógica de RRHH.
- Revisión de diferencias para errores de formato.
- La vista previa arrancó, pero el navegador integrado no pudo conectarse a
  localhost. Queda pendiente la comprobación visual e interacción completa en
  escritorio y móvil; no se afirma conformidad WCAG completa.
- No se han enviado solicitudes ficticias a Supabase ni modificado datos del
  usuario para probar el diseño.
- El objetivo comercial y las probabilidades existentes siguen siendo
  estimaciones orientativas, ahora identificadas como tales.

## Pendiente por material ausente

No estaban incluidos `references/guia-ux.md`,
`references/formularios-paso-a-paso.md`, `references/checklist.md` ni
`references/contexto-curso.md`. Se han aplicado las reglas disponibles, pero
no puede certificarse el checklist de 20 puntos ni las 18 fichas sin esos
archivos. Cuando se añadan, contrastar esta revisión con el material original.
