# Recursos humanos

El CRM incorpora el módulo en `/crm/rrhh`. Conserva el menú, los colores y los
controles del resto del panel. Incluye tres empleados ficticios de ejemplo.

## Navegación

La vista general tiene Empleados, Horarios, Vacaciones y Selección. Horarios
muestra solo el último registro del último día trabajado de cada empleado.
Vacaciones reúne todas las solicitudes y permite aceptarlas o denegarlas.

Al pulsar el nombre de un empleado se abre su ficha, con Horarios, Solicitud de
vacaciones, Tareas, Evaluaciones y Documentos. Sus solicitudes muestran los
estados Pendiente, Aceptada o Denegada. El botón Empleados vuelve al listado.

## Flujos

- **Empleados:** crear y editar nombre, puesto, departamento, fecha de alta y
  correo corporativo. Subir una fotografía PNG o JPG.
- **Horarios y vacaciones:** registrar entrada y salida con la hora del servidor,
  consultar el historial y solicitar, aprobar o rechazar vacaciones. No permite
  entradas duplicadas ni solicitudes de vacaciones solapadas.
  La ficha suma el tiempo trabajado de la semana actual (lunes a domingo) y del
  mes actual, incluyendo la jornada abierta y usando el calendario de Madrid.
- **Tareas del empleado:** marcar entrega de portátil, creación del correo, accesos al
  CRM, presentación al equipo y documentación.
- **Selección:** crear candidaturas con CV PDF, pasar por entrevista y oferta,
  contratar o descartar. Contratar exige CV y genera una ficha, un correo único y
  un checklist. No crea un buzón externo ni envía mensajes.
- **Evaluaciones:** nota de 1 a 5 con comentario y trimestre. Una evaluación por
  empleado y trimestre, con historial.
- **Documentos:** subir nóminas PDF, revisar el original, registrar conformidad
  con el nombre completo de quien firma y una casilla de conformidad obligatoria.
  La ficha y la copia PDF muestran el firmante, separado del empleado titular.
  Es una firma de simulación, sin certificado digital.
- **Informe PDF:** exportar los datos actuales de todas las secciones.

## Persistencia

Los datos se guardan en `.data/rrhh/state.json` y los archivos en `.data/rrhh/`.
La carpeta está excluida de Git. Se conservan al recargar y al reiniciar el
servidor local. Las rutas de datos, archivos e informe requieren la sesión del
CRM. El límite por archivo es de 5 MB; los PDFs se validan antes de guardarse.

Este almacenamiento está pensado para el simulador local. Para un despliegue
con varias instancias o un sistema de archivos efímero hay que sustituirlo por
una base de datos y almacenamiento persistente compartido.

## Verificación

Pruebas de las reglas de negocio:

```powershell
node --test tests/hr.test.cjs
```

Para las pruebas HTTP, inicia un servidor de desarrollo con datos aislados:

```powershell
$env:HR_DATA_DIR = Join-Path (Get-Location) '.data/rrhh-api-test'
npm run dev -- --port 3001
```

En otro terminal, con la misma variable:

```powershell
$env:HR_DATA_DIR = Join-Path (Get-Location) '.data/rrhh-api-test'
node tests/hr-api.test.cjs
```

Se generan exclusivamente datos ficticios de prueba y un informe en
`artifacts/rrhh/informe-verificacion.pdf`. Al terminar, reinicia el servidor sin
`HR_DATA_DIR` para volver a los datos normales.

## Enunciado de Odoo

El módulo implementa los flujos de RRHH en este CRM. No crea ni acredita una
instancia de Odoo Online. Si la entrega exige específicamente Odoo, hace falta
crear esa instancia y realizar allí los flujos; este informe no sustituye esa
evidencia.
