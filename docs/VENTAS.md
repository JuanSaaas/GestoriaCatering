# Ventas de La Mesa Perfecta

Ventas gestiona presupuestos, pedidos y clientes; Oportunidades conserva su apartado independiente.

- Presupuestos: alta por pasos, cliente, fecha, conceptos, cantidades, precios, IVA y notas; edición mientras están en borrador.
- Pedidos: confirmación del presupuesto, conservación de conceptos e importes y bloqueo de edición tras confirmar.
- Cancelación: confirmación y conservación del documento cancelado.
- Listados: búsqueda por cliente, paginación de 25 documentos y exportación CSV de la página visible.
- Clientes: directorio compartido y alta desde Ventas.

Persistencia en Supabase mediante `supabase/migrations/20261030095202_ventas_documentos.sql`, aplicada en GestoriaCatering. RLS activo, sin acceso anónimo; solo el servidor accede con su clave privada. Las revisiones comprueban versión y estado para impedir confirmaciones duplicadas y ediciones simultáneas. Los totales se recalculan en servidor en céntimos; el navegador no decide el importe guardado.

Comprobaciones: pruebas de cálculo y API en `tests/sales.test.cjs`; prueba PostgreSQL en `tests/sales-sql.cjs` (requiere el PGlite de pruebas indicado en FACTURAS-IA.md); recorrido en navegador con datos ficticios aislados: presupuesto de 1.000,00 EUR + 210,00 EUR IVA, guardado, confirmación y consulta del pedido por 1.210,00 EUR sin controles de edición. No se han creado documentos ficticios en la base real.

No se conecta ni sincroniza con la cuenta externa de Odoo. Las facturas de proveedores siguen en Facturas. No se incluyen cobros, inventario, emisión fiscal ni envío de correos en este módulo de presupuestos y pedidos.
