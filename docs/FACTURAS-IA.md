# Automatización de facturas · La Mesa Perfecta

## Estado de la conexión · 29/10/2026

Se ha aplicado `activar_facturas_ia` (versión `20261029103634`) en Supabase `GestoriaCatering`
(`odentjiuagcrdqozccva`), creando las cuatro tablas y cinco funciones del módulo.
Comprobado con consultas: RLS activo, acceso anónimo y authenticated revocado,
SELECT/INSERT/UPDATE y funciones disponibles para service_role. Las cuatro tablas
están vacías. La prueba de lectura y reintento inexistente con service_role fue
correcta y se ejecutó dentro de una transacción con rollback.

El análisis de seguridad solo señala que estas tablas tienen RLS sin políticas:
es intencionado porque el módulo se sirve exclusivamente desde el backend y no
se conceden privilegios al cliente público. No se han abierto las facturas al
navegador para evitar utilizar la clave privada.

**Pendiente:** guardar una clave privada existente del proyecto en
`SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY`. Para desarrollo, usar
`.env.local`; para la web publicada, configurar también la variable en el
proyecto Vercel correspondiente y volver a desplegar. La conexión administrativa
del asistente permite migraciones, pero no proporciona esa clave al servidor web.
La URL pública ya configurada se reutiliza sin cambiar de proyecto.

Verificación de solo lectura, sin mostrar claves ni contenido de facturas:

```powershell
node scripts/check-facturas-supabase.cjs
```

La conexión de la aplicación solo se dará por terminada cuando esa comprobación
y `/api/crm/facturas` respondan correctamente en el entorno configurado. El estado
descrito el 23/10/2026 más abajo es histórico; la migración ya está aplicada.

Implementación del 23/10/2026. La integración añade «Facturas» al CRM sin cambiar
las tablas ni las operaciones comerciales o de RRHH. Se ha seguido el flujo escrito
en la solicitud; no había una imagen de arquitectura adjunta que se pudiera contrastar.

```mermaid
flowchart LR
  A[Carpeta persistente: PDF e imágenes] --> B[Agente Python / LangChain]
  B --> C[Texto del PDF u OCR local + imagen]
  C --> D[Gemini 2.5 Flash en OpenRouter]
  D -->|429 / indisponibilidad tras reintentos limitados| E[Siguiente modelo compatible configurado]
  E -->|Alternativas agotadas| F[Cola con espera y reintento]
  D --> G[JSON estructurado / validación]
  E --> G
  G --> H[Herramienta guardar_factura]
  H --> I[Supabase PostgreSQL]
  I --> J[Facturas, documentos e incidencias en el CRM]
```

## Archivos y responsabilidades

| Archivo | Para qué sirve |
| --- | --- |
| `automation/__init__.py`, `automation/facturas/__init__.py`, `automation/facturas/tests/__init__.py` | Declaran los paquetes Python y permiten ejecutar el agente y descubrir sus pruebas |
| `automation/facturas/config.py` | Variables de entorno, límites, directorio y prioridad de modelos |
| `automation/facturas/documents.py` | Lectura de PDF, OCR de escaneados/imágenes y límites de tamaño |
| `automation/facturas/schema.py` | Prompt, JSON Schema, validación monetaria y avisos de datos ausentes |
| `automation/facturas/models.py` | Catálogo de OpenRouter, LangChain, clasificación de errores y respaldo |
| `automation/facturas/storage.py` | Cliente HTTPS PostgREST de Supabase y herramienta `guardar_factura` |
| `automation/facturas/worker.py` | Bucle secuencial de archivos, comprobación de copias en curso y recuperación |
| `automation/facturas/requirements.txt` | Dependencias Python acotadas por versión mayor |
| `automation/facturas/.env.example` | Configuración sin secretos; se copia a `.env` |
| `automation/facturas/facturas.service.example` | Ejemplo de servicio persistente para Linux |
| `automation/facturas/tests/test_agent.py` | Pruebas sin enviar documentos a una IA |
| `supabase/migracion_facturas_ia.sql` | Tablas, permisos, deduplicación y funciones transaccionales |
| `lib/invoices.ts` | Tipos compartidos, formatos y filtros de búsqueda |
| `lib/invoiceStore.ts` | Acceso a Supabase exclusivamente desde el servidor web |
| `app/api/crm/facturas/route.ts` | API autenticada de consulta y solicitud de reintento |
| `components/InvoiceModule.tsx` | Lista, ficha, cola, incidencias y modelos utilizados |
| `app/crm/facturas/page.tsx` | Ruta del nuevo apartado del CRM |
| `tests/invoices.test.cjs` | Pruebas de API, autenticación, filtros y formato monetario |
| `tests/invoices-sql.cjs` | Prueba de la migración con PostgreSQL embebido, sin tocar Supabase real |
| `docs/accesibilidad/facturas-configuracion.png` | Captura real del módulo con la configuración pendiente y el foco visible |

El único cambio de navegación es la entrada «Facturas» en `CrmShell`. Se reutilizan
sus controles, foco, sesión y estilos. El agente no utiliza memoria conversacional:
el estado necesario para recuperar procesos está en PostgreSQL.

## 1. Preparar Supabase

En el SQL Editor del proyecto de Supabase, revisa y ejecuta
`supabase/migracion_facturas_ia.sql`. No se ha ejecutado automáticamente contra
el proyecto real. Si ya existe una tabla `facturas` ajena a este repositorio, revisa
su compatibilidad antes de aplicar la migración. La transacción evita una aplicación parcial.

Se crean cuatro tablas:

- `facturas`: datos extraídos, impuestos, modelo, advertencias y documento de origen.
- `factura_documentos`: cola, SHA-256 único, intentos, próxima ejecución y bloqueo temporal.
- `factura_intentos`: modelo de cada intento, resultado, tipo de error y duración.
- `factura_agente`: última señal del proceso y mensaje de configuración/incidencia.

Todas tienen RLS activado y sin acceso para `anon` ni `authenticated`. La sesión
del CRM se valida en su API; únicamente el servidor y el agente usan la clave
secreta. Las funciones tampoco se conceden a roles públicos.

## 2. Instalar Python y OCR

Requiere Python 3.11 o posterior. Desde la raíz del repositorio, en PowerShell:

```powershell
python -m venv automation/facturas/.venv
.\automation\facturas\.venv\Scripts\python.exe -m pip install -r automation/facturas/requirements.txt
Copy-Item automation/facturas/.env.example automation/facturas/.env
```

En Linux:

```bash
python3 -m venv automation/facturas/.venv
automation/facturas/.venv/bin/python -m pip install -r automation/facturas/requirements.txt
cp automation/facturas/.env.example automation/facturas/.env
```

Instala también **Tesseract OCR**, con los idiomas español e inglés (`spa` y `eng`).
En Debian/Ubuntu: `sudo apt install tesseract-ocr tesseract-ocr-spa tesseract-ocr-eng`.
En Windows, usa una distribución de Tesseract indicada por el proyecto oficial y
configura `TESSERACT_CMD` con la ruta de `tesseract.exe` si no está en PATH.
Comprueba `tesseract --list-langs` antes de procesar escaneados. No se necesita
Poppler: pypdfium2 extrae texto y renderiza localmente los PDF.

En esta entrega se instaló un entorno Python aislado para las pruebas. No se
instaló Tesseract en el sistema; las pruebas OCR sustituyen la llamada a ese ejecutable.

## 3. Configurar las credenciales

Completa `automation/facturas/.env` en el servidor:

```dotenv
OPENROUTER_API_KEY=tu_clave_de_openrouter
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servidor
FACTURAS_INPUT_DIR=.data/facturas/entrada
FACTURAS_FALLBACK_MODELS=google/gemini-2.5-pro,anthropic/claude-sonnet-4.6,openai/gpt-4.1
```

En el entorno del **servidor web**, configura `SUPABASE_SERVICE_ROLE_KEY` (o
`SUPABASE_SECRET_KEY`) y `SUPABASE_URL` (o la URL pública ya utilizada por el proyecto).
La web no necesita la clave de OpenRouter. Nunca uses prefijos `NEXT_PUBLIC_` para
claves secretas. El archivo del agente y su entorno virtual están excluidos de Git.
Las variables del proceso tienen prioridad sobre `.env`.

No se han creado ni mostrado credenciales. En el entorno revisado faltaban la
clave de OpenRouter y la clave de servidor de Supabase; por eso no se ha activado
el procesamiento de documentos reales ni aplicado la migración a producción.

## 4. Ejecutar y alimentar la carpeta

Todos los comandos se ejecutan desde la raíz del repositorio:

```powershell
# Solo consulta el catálogo; no envía documentos ni consume inferencia.
.\automation\facturas\.venv\Scripts\python.exe -m automation.facturas.worker --check-models

# Una pasada; útil para comprobar instalación y permisos.
.\automation\facturas\.venv\Scripts\python.exe -m automation.facturas.worker --once

# Proceso continuo. Ctrl+C solicita una parada ordenada.
.\automation\facturas\.venv\Scripts\python.exe -m automation.facturas.worker
```

En Linux sustituye la ruta del ejecutable por `automation/facturas/.venv/bin/python`.
La carpeta de entrada se crea si no existe. Copia allí archivos como `FAC-0153.pdf`,
`luz-sept.pdf` o `taxi.jpg`. Lo más fiable es copiar con extensión temporal y renombrar
al terminar. El agente comprueba tamaño/fecha en dos lecturas separadas antes de
procesar, toma una instantánea de bytes y **no mueve ni elimina el original**.
Solo se recorre el primer nivel; no se siguen enlaces simbólicos.

Para mantenerlo ejecutándose en Linux, adapta las rutas y el usuario de
`facturas.service.example` y configúralo como servicio con acceso a la carpeta
persistente. En Windows puede ejecutarse en un terminal o mediante un servicio
administrado por el servidor. El bucle Python es el que automatiza las pasadas.

Si la web está en Vercel, ejecuta el agente en un servidor o contenedor con disco
persistente. Una función web efímera no sirve para un bucle continuo ni para
vigilar una carpeta local. Ambos procesos se comunican mediante Supabase.

## Modelos y política de errores

El catálogo público de OpenRouter se consultó el 23/10/2026 y confirmó estos
identificadores con imagen y `structured_outputs`/`response_format`:

1. `google/gemini-2.5-flash`, siempre primero.
2. `google/gemini-2.5-pro`, alternativa de la misma familia orientada a razonamiento.
3. `anthropic/claude-sonnet-4.6`, alternativa multimodal de otro proveedor.
4. `openai/gpt-4.1`, alternativa multimodal con JSON estructurado.

Este orden de respaldo es una decisión de integración, no una clasificación
universal de precisión. Puede cambiarse con `FACTURAS_FALLBACK_MODELS`; Gemini
2.5 Flash se antepone automáticamente incluso si aparece repetido. No se eligen
modelos desconocidos ni se cambia de modelo por ser más nuevo o más barato.

El catálogo se verifica de nuevo al ejecutar, con caché máxima de 15 minutos.
Los modelos retirados o sin las capacidades exigidas se omiten y se registra el
motivo. La disponibilidad del catálogo no garantiza la cuota de una clave.
Se exige un proveedor que admita los parámetros de JSON estructurado.

| Situación | Comportamiento |
| --- | --- |
| 429: límite de uso/cuota del proveedor | Reintento limitado del mismo modelo; después siguiente modelo |
| Timeout, errores de red, 408 o 5xx | Mismo mecanismo de respaldo limitado |
| Alternativas agotadas | Cola `reintento`, espera exponencial y otra pasada posterior |
| 402: saldo o presupuesto de la cuenta OpenRouter | Detiene la tanda y espera cinco minutos; no cambia de modelo para intentar eludir un saldo compartido |
| 401/403: autenticación o permisos | Detiene el proceso con estado de incidencia; corregir y reiniciar |
| 400/404/422: identificador/parámetros/configuración | No recorre alternativas indefinidamente; corregir y reiniciar |
| Contexto de entrada excedido | Revisión del documento; dividirlo, sin tratarlo como cuota agotada |
| Respuesta cortada por tokens de salida | Revisión diferenciada; no guardar un JSON parcial |
| JSON inválido o dato con formato imposible | Revisión del archivo; no insertar valores no validados |
| Documento dañado o ilegible | Marcar para revisión y continuar con el siguiente |
| OCR no instalado/idioma ausente | Incidencia de configuración y parada; no recorrer modelos |
| Fallo al confirmar Supabase | Conservar el original y el bloqueo; recuperarlo al caducar, sin marcarlo completado |

Cada archivo dispone de cinco intentos automáticos por ciclo por defecto. La espera es
exponencial, limitada a una hora. Si persiste un fallo recuperable al agotarlos,
se reinicia el contador tras una pausa de una hora y continúa automáticamente:
una cuota diaria agotada no deja la factura abandonada en revisión. Los errores
de contenido o formato sí requieren revisión. Desde el CRM,
«Reintentar documento» vuelve a ponerlo en cola tras comprobar el resultado de
la operación; sirve después de corregir una incidencia. No reprocesa documentos
completados ni modifica las facturas ya guardadas.

Los límites de tamaño, páginas, texto, salida, tiempo y reintentos están en el
archivo de ejemplo. El texto no se trunca para encajarlo a escondidas. Los
importes se validan con Decimal y tolerancia contable de 0,02; no se completa un
campo ausente ni se asume EUR si el documento no indica moneda.

## Persistencia y límites de la extracción

- El hash SHA-256 evita procesar dos veces el mismo contenido aunque cambie el nombre.
- Proveedor identificado + número de factura + año evitan insertar otra copia
  escaneada de la misma factura. Si falta alguno, solo se puede asegurar la
  deduplicación por contenido. El nombre de proveedor por sí solo no identifica
  una factura. Revisa coincidencias legítimas si un proveedor reutiliza números.
- PostgreSQL reserva el documento con un token y una caducidad. Una ejecución
  antigua no puede guardar con un bloqueo caducado. Otro agente puede retomarlo.
- Guardar los datos y completar la cola forman una sola transacción. Una respuesta
  perdida después del commit no genera otra fila ni otro procesamiento confirmado.
- Impuestos negativos permiten registrar retenciones y facturas rectificativas.
  Las diferencias aritméticas se guardan con advertencias y estado de revisión.
- «Datos extraídos» no equivale a aprobación contable. La IA puede cometer errores;
  el panel mantiene visible la necesidad de contrastar con el documento original.
- No se suben originales a almacenamiento público. La visión recibe únicamente
  las páginas escaneadas o imágenes necesarias mediante HTTPS a través de
  OpenRouter y sus proveedores configurados. La extracción digital usa texto.
- El contenido de una factura nunca da instrucciones al agente. La herramienta
  de guardado recibe los identificadores y el modelo desde el proceso, no desde
  el JSON propuesto por la IA. No hay herramientas para ejecutar órdenes ni abrir enlaces.
- Los registros guardan identificadores, modelos, categorías y mensajes controlados,
  sin guardar prompts, claves, OCR completo ni respuestas brutas. El tracing
  externo de LangChain se desactiva explícitamente durante la inferencia.

## Pruebas reproducibles

```powershell
.\automation\facturas\.venv\Scripts\python.exe -m unittest discover -s automation/facturas/tests -v
node --test tests/invoices.test.cjs
npx tsc --noEmit --incremental false
npm run build
```

La prueba adicional de PostgreSQL se instala fuera de las dependencias del CRM:

```powershell
npm install --prefix tmp/facturas-sql-tests --no-audit --no-fund @electric-sql/pglite
node tests/invoices-sql.cjs
```

Comprueba migración, bloqueos, token caducado, duplicado comercial, separación por
año, espera de reintentos, vuelta a la cola, rollback atómico y acceso anónimo
denegado. Python comprueba rutas de respaldo con modelos simulados, la integración
real instalada de LangChain, JSON/Decimal, PDF digital, OCR simulado y conservación
del original ante errores de guardado. No se ha pagado inferencia ni enviado una
factura real durante estas pruebas.

Resultado de esta entrega: 24 pruebas Python y 27 pruebas Node correctas;
comprobación adicional de PostgreSQL correcta; compilación de producción y
12 rutas del CRM verificadas. En navegador se revisaron el acceso, el aviso de
configuración pendiente, los filtros, el foco de teclado y el ancho de 320 px.
El estado vacío y los errores de la API se probaron con dobles de prueba. La
lista con facturas reales y la inferencia/OCR completos quedan pendientes de
configurar credenciales, aplicar la migración e instalar Tesseract.

## Fuentes técnicas consultadas

- [Catálogo oficial de OpenRouter](https://openrouter.ai/api/v1/models).
- [JSON estructurado en OpenRouter](https://openrouter.ai/docs/guides/features/structured-outputs).
- [Integración ChatOpenRouter de LangChain](https://docs.langchain.com/oss/python/integrations/chat/openrouter).
- [Referencia Python de pypdfium2](https://pypdfium2.readthedocs.io/en/stable/python_api.html).
- [pytesseract y requisitos de Tesseract](https://github.com/madmaze/pytesseract).
- [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [PostgreSQL embebido PGlite para pruebas](https://pglite.dev/docs/).
