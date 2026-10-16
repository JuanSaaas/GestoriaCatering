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

Este almacenamiento se mantiene para el simulador local. Las consultas ya no
reescriben un estado existente. En Vercel se selecciona automáticamente el
almacenamiento persistente en Supabase; no se usa `/tmp` para guardar RRHH.

### Activar RRHH en Vercel

1. Ejecuta `supabase/migracion_rrhh.sql` en el SQL Editor del mismo proyecto
   Supabase usado por el CRM. Crea `rrhh_state` y el bucket privado `rrhh-private`.
   No borra ni modifica los datos comerciales.
2. En las variables de entorno de Vercel añade `HR_STORAGE=supabase` y
   `SUPABASE_SERVICE_ROLE_KEY` (o `SUPABASE_SECRET_KEY`) con la clave secreta del
   servidor de Supabase. Mantén `NEXT_PUBLIC_SUPABASE_URL` apuntando a ese proyecto.
   La clave secreta nunca debe tener prefijo `NEXT_PUBLIC_`, enviarse al navegador
   ni incluirse en Git. Comprueba que las variables se apliquen al entorno del despliegue.
3. Despliega la versión que contiene esta corrección. Comprueba un alta, su
   persistencia al recargar y la descarga de un documento. Sin la migración o
   la clave, la API responde JSON con estado 503 y no crea un almacenamiento temporal.

Los datos se guardan en un documento JSON de `rrhh_state` con una revisión.
Cada actualización comprueba esa revisión: si otra instancia ha guardado entre
la lectura y la escritura, se rechaza con 409 para no sobrescribir sus cambios.
Los documentos se guardan en Supabase Storage. Ni la tabla ni el bucket se
exponen con la clave pública; las API del CRM comprueban la sesión y acceden
desde el servidor con la clave secreta.

Los datos locales previos no se trasladan automáticamente: antes de cambiar el
backend, conserva una copia de `.data/rrhh/`. En un almacenamiento vacío se
crean los tres empleados ficticios de ejemplo. La migración SQL no sustituye
un estado remoto existente. Si una escritura de estado falla después de subir
un archivo, puede quedar un objeto sin referencia que necesita limpieza.

Para seguir usando archivos en tu ordenador, no definas `HR_STORAGE` o usa
`HR_STORAGE=local`. Para probar la integración remota usa `HR_STORAGE=supabase`.

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
