# Diseñador Web · La Mesa Perfecta

Implementación y verificaciones realizadas el 16/11/2026; documentación cerrada el 17/11/2026.

Actualización del 25/11/2026: plantillas rediseñadas con contenedor común, imágenes en marcos de proporción fija (con opción de mostrar la imagen completa), columnas según el número de tarjetas y editor adaptable mediante consultas de contenedor. Detalle en `docs/accesibilidad/REVISION.md`.

Actualización del 24/11/2026: se añade historial Deshacer/Rehacer y se completan las auditorías automáticas pendientes de galería, plantilla creativa y plantilla premium.

## Acceso y funciones operativas

En el CRM, abre **Diseñador Web** (`/crm/disenador-web`). No sustituye la web pública actual.

1. Explora las cuatro plantillas: minimalista, corporativa, creativa y premium. Cada una tiene una composición y una secuencia de secciones distintas.
2. Abre la vista previa y alterna ordenador (1.200 px), tablet (768 px) y móvil (375 px). El lienzo se escala para caber en el espacio disponible; el documento conserva el ancho del dispositivo elegido.
3. Selecciona un diseño, introduce el nombre y crea un borrador privado.
4. En el editor, añade bloques desde la izquierda, selecciona uno en la estructura o en el lienzo y personalízalo desde la derecha.
5. Ordena los bloques arrastrándolos o con **Subir / Bajar**. Los cambios se anuncian con texto.
6. Personaliza textos, títulos, fotografías, su encuadre (rellenar el marco o mostrar la imagen completa) y sus descripciones, enlaces, fuentes, tamaños, espaciados, fondos, bordes, alineación y visibilidad en tablet/móvil. Las tarjetas de servicios, columnas, equipo, cifras y galería tienen elementos editables; cada bloque admite hasta doce.
7. En **Estilos del sitio**, aplica una paleta predefinida o cambia colores, tipografías, botones, esquinas, espaciado, cabecera y pie.
8. Guarda la página. El servidor devuelve la versión persistida antes de mostrar el éxito.
9. Desde **Mis páginas web**, busca, reabre, previsualiza, duplica o elimina un proyecto. El borrado requiere confirmación con nombre y consecuencias; la tarjeta solo desaparece después de confirmarlo el servidor.

El guardado es explícito. Se avisa al salir del editor con cambios pendientes y al cerrar/recargar el documento. Los errores de red o de versión conservan el contenido del editor. Ante un conflicto, compara con la versión guardada en otra pestaña antes de decidir cómo conservar tus cambios. No hay sobrescritura forzada automática.

**Deshacer/Rehacer** conserva hasta cincuenta cambios por sesión de edición: nombre, contenido, bloques, orden y estilos. Funciona también después de guardar, manteniendo la revisión más reciente del servidor para no provocar sobrescrituras. Una nueva edición después de deshacer descarta la rama de rehacer. No registra operaciones de servidor ni restaura páginas eliminadas. El historial se reinicia al abrir otro proyecto y no se conserva al recargar; guarda la página para conservar el resultado.

Las imágenes se añaden mediante rutas locales o direcciones HTTPS; no se ha añadido un gestor de subida de archivos. Los bloques son componentes estructurados, sin HTML o CSS libre. Los formularios son configuraciones de demostración con comprobación de campos; no reciben solicitudes reales.

## Arquitectura y permisos

Se reutilizan Next.js 14, React 18, TypeScript, Heroicons y Supabase del proyecto, sin nuevas dependencias. Se reutilizan `CrmShell`, los controles de `ui.tsx`, `ValidatedForm` y `useDialog`. El alta pide un único dato, por lo que no necesita pasos ni un selector con búsqueda. Los paneles de ajustes se agrupan con desplegables y los campos se muestran en una columna.

El CRM actual tiene una única identidad de administración, definida por `CRM_ADMIN_USER`, y una sesión compartida validada mediante la cookie HTTP-only `lmp_crm_session`. El diseñador sigue ese modelo: todos los integrantes que usan esa cuenta comparten sus proyectos. **No introduce usuarios independientes ni permisos individuales ficticios.** Para separar proyectos por comerciales será necesario integrar identidades verificables por usuario y asignaciones de acceso, tanto en el CRM como en el almacenamiento.

La API comprueba sesión en lecturas/escrituras y origen en escrituras. El propietario se calcula en el servidor; no se acepta desde el navegador. Cada consulta, modificación y borrado filtra por propietario. Cambiar `CRM_ADMIN_USER` cambia el ámbito de proyectos: una reasignación debe hacerse expresamente en una futura migración.

`public.web_projects` contiene UUID, propietario, nombre, documento JSON versionado, revisión, estado y fechas. La migración `20261116084403_disenador_web_privado.sql` se aplicó al proyecto Supabase existente. RLS está habilitado y se revocó acceso a `PUBLIC`, `anon` y `authenticated`; únicamente el servidor con clave privada puede operar. Se comprobó por SQL: RLS activo, lectura anónima y autenticada denegadas y lectura de `service_role` permitida. No se utiliza la clave privada en componentes de cliente.

El servidor necesita las variables ya empleadas por otros módulos:

- `SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_URL`.
- `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY`, exclusivamente en servidor.
- Las variables de sesión y administrador del CRM. Conserva las credenciales de producción configuradas, sin depender de los valores de desarrollo.

En otra base de datos, aplica la migración antes de usar el módulo. No se cambia a almacenamiento local o memoria si falla Supabase: se informa del problema y se conserva el editor.

Las actualizaciones y borrados comprueban UUID, propietario y revisión. Una revisión antigua produce 409 y conserva los datos guardados más recientes. El diseño admite cien bloques y una solicitud de hasta 1 MB. Se validan tamaños, enumeraciones, URLs, descripciones de imagen y contraste mínimo de texto; se descartan propiedades fuera del esquema. Las vistas previas se generan con texto escapado y se ejecutan en un iframe aislado, sin `allow-same-origin`, con política de contenido y sin envío de formularios. La comunicación del lienzo comprueba la ventana de origen y los identificadores existentes.

## Publicación pendiente de configurar

Las páginas solo se guardan como borrador. No hay botones que simulen publicar o despublicar. Para habilitar publicación se necesita:

1. Elegir hosting, dominio/subdominios y URL pública; definir quién está autorizado a publicar.
2. Crear una versión publicada independiente del borrador, su ruta de lectura pública, retirada de publicación y políticas correspondientes. No abrir la tabla privada de borradores al público.
3. Reutilizar el documento estructurado y el renderizador para el documento publicado, retirando los avisos de demostración y las herramientas del editor. Ajustar cabeceras y política de contenido del destino.
4. Conectar formularios a un receptor real con validación en servidor, consentimiento, protección frente a abuso y confirmación de recepción.
5. Revisar los textos, fotografías, cifras y testimonios de demostración, así como los datos legales y de privacidad, antes de publicar.

El renderizador y el almacenamiento están separados para permitir este paso. No se ha realizado ningún despliegue ni se ha cambiado el sitio público actual.

## Archivos de esta implementación

| Archivo | Función |
| --- | --- |
| `app/crm/disenador-web/page.tsx` | Ruta del módulo y título |
| `app/api/crm/disenador-web/route.ts` | API protegida y límites del cuerpo |
| `components/WebDesigner.tsx` | Galería, listado, editor, vistas y diálogos |
| `components/WebDesigner.module.css` | Estilos y adaptación del módulo |
| `components/CrmShell.tsx` | Entrada en el menú y navegación activa |
| `components/ui.tsx` | Icono de diseño, conservando los cambios anteriores |
| `lib/webDesigner.ts` | Modelo, plantillas, paletas y validación |
| `lib/webRenderer.ts` | Documento visual aislado y responsive |
| `lib/webDesignerHistory.ts` | Historial acotado de cambios del borrador, sin versiones de servidor |
| `lib/webProjectStore.ts` | Persistencia privada y control de versiones |
| `components/useDialog.ts` | Foco inicial y restauración solo tras retirar realmente el diálogo |
| `supabase/migrations/20261116084403_disenador_web_privado.sql` | Tabla, índice y permisos aplicados |
| `tests/web-designer.test.cjs` | Pruebas del modelo, seguridad, almacenamiento y API |
| `tests/web-designer-history.test.cjs` | Deshacer, rehacer, ramificación y límite del historial |
| `tests/web-designer.integration.cjs` | Prueba real contra servidor local y Supabase |
| `docs/accesibilidad/REVISION.md` | Evidencias, correcciones y pruebas manuales pendientes |
| `docs/DISENADOR_WEB.md` | Uso, arquitectura y configuración pendiente |

Se conservaron los cambios previos de Ventas, formularios, UI y revisión de accesibilidad. Los directorios `tmp/` y `.next-web-designer-*` contienen herramientas y resultados locales de verificación, sin dependencias añadidas al producto.

## Comprobaciones

- TypeScript sin errores y compilación de producción completada. La creación de procesos auxiliares de Next estaba bloqueada por el entorno: se completó la compilación usando `workerThreads` y dos CPU solo en el script local `tmp/build-web-designer.cjs`, sin cambiar `next.config.js`.
- Batería del proyecto: **56 pruebas aprobadas**, incluidas siete del diseñador. El ejecutable de RR. HH. se probó por separado con directorio y servidor aislados y pasó todo su flujo. Los fallos iniciales de subida de facturas desaparecieron al permitir la escritura de sus archivos temporales.
- Integración real: las cuatro plantillas se crearon, editaron, recuperaron y eliminaron; se comprobó duplicado, rechazo de revisiones antiguas, validación de URLs, sesión y origen. Se confirmó la limpieza de los cinco borradores creados por este ejecutable.
- Navegador: creación, edición de título, guardado confirmado y reapertura con el título persistido. Se probaron las vistas y el reflujo del editor a 320 px. Se corrigió la superposición de diálogos que podía dejar controles inertes y la participación del botón de edición en la retícula de portada.
- Axe 4.14: editor sin infracciones detectadas; plantilla minimalista a 1.280 px y corporativa a 320 px, sin infracciones ni comprobaciones incompletas. La auditoría inicial de la galería detectó cuatro nombres accesibles que no incluían el texto visible; se corrigieron. La repetición aislada de esa galería y las auditorías completas de las otras dos plantillas quedan pendientes tras interrumpirse la herramienta de navegador. Los iframes del editor se auditan por separado.
- Contraste medido con el script aportado y validado con el modelo: verde principal/blanco 8,12:1; dorado/fondo oscuro 10,27:1; borde de controles/blanco 4,15:1, suficiente como borde. El editor rechaza combinaciones de texto y fondo inferiores a 4,5:1; las paletas iniciales pasan su validación.

No se afirma conformidad WCAG completa. El informe de accesibilidad detalla las comprobaciones manuales pendientes y los límites.

### Verificación adicional del 24/11/2026

- 59 pruebas aprobadas, incluidas tres nuevas del historial. Prueba de integración contra Supabase repetida correctamente, con limpieza de sus cinco borradores.
- Comprobado en navegador: editar título, deshacer y rehacer, guardar el resultado y volver a usar el historial sin perder la revisión guardada; aviso al salir con cambios pendientes, cancelación mediante Escape y devolución del foco al botón de salida, sin elementos inertes residuales.
- Se corrigió un error de campo vacío que aparecía al abrir el alta en desarrollo: la simulación de efectos de React Strict Mode movía el foco durante su limpieza. Ahora el foco inicial se declara explícitamente y solo se restaura al retirar realmente el diálogo. Se verificó que el alta abre sin errores, con foco en el nombre, y que Escape la cierra y libera todos los controles.
- Axe 4.14: galería corregida sin infracciones; ocho comprobaciones de contraste incompletas por superposición de miniaturas, pendientes de contraste manual sobre cada fondo real. Plantilla creativa a 1280×720 y premium a 1280×720 y 320×850, sin infracciones ni incompletos. Premium sin desbordamiento a 320 px (scrollWidth 305).
- Continúan pendientes lector de pantalla, zoom real 200/400 %, alto contraste y simulaciones de visión. Las comprobaciones automáticas y de teclado realizadas cubren los recorridos descritos, no una auditoría de conformidad completa.

Para repetir las pruebas del diseñador:

```powershell
node --test tests/web-designer.test.cjs
$env:WEB_DESIGNER_TEST_URL='http://localhost:3158'
node tests/web-designer.integration.cjs
```

La prueba de integración exige un servidor local activo, usa la configuración de acceso del proyecto y elimina exclusivamente los borradores que ella misma crea.
