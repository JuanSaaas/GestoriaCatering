# CRM privado — La Mesa Perfecta

## Acceso
- URL: `/crm/login`
- Usuario: `admin`
- Contraseña: `1234`

Las credenciales se validan en servidor mediante `/api/crm/login`; no están expuestas en el JavaScript del navegador. La sesión usa una cookie HTTP-only y las rutas `/crm/*` quedan protegidas por `middleware.ts`.

## Supabase
La web pública ya crea clientes, empresas y oportunidades directamente en Supabase. El CRM lee y modifica esas mismas tablas y escucha cambios Realtime.

Ejecuta `supabase/migracion_crm_profesional.sql` en **Supabase > SQL Editor** para activar Realtime también en clientes, empresas y usuarios.

## Producción
Antes de publicar cambia en `.env.local`:
- `CRM_ADMIN_USER`
- `CRM_ADMIN_PASSWORD`
- `CRM_SESSION_TOKEN` (usa una cadena larga y aleatoria)

Para un proyecto real multiusuario, el siguiente paso recomendado es sustituir el login simple por Supabase Auth y endurecer las políticas RLS. El esquema actual mantiene políticas permisivas porque la web pública escribe con la clave publishable/anon.

## Ejecutar
```bash
npm install
npm run dev
```
