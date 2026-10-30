export type SalesLine = { concepto: string; cantidad: number; precio: number; impuesto: number; base: number; iva: number; total: number };
export type SalesDocument = { id: string; numero: number; tipo: 'presupuesto' | 'pedido'; estado: 'borrador' | 'confirmado' | 'cancelado'; cliente_id: string; cliente_nombre: string; fecha: string; lineas: SalesLine[]; base: number; iva: number; total: number; notas: string; version: number };
export function salesReference(doc: Pick<SalesDocument,'tipo'|'numero'|'fecha'>) { return `${doc.tipo === 'pedido' ? 'PV' : 'P'}-${doc.fecha.slice(0,4)}-${String(doc.numero).padStart(5,'0')}`; }
export function salesLines(input: unknown) {
 if (!Array.isArray(input) || !input.length || input.length > 50) throw new Error('Añade entre 1 y 50 conceptos.');
 function number(value: unknown, label: string, max: number, positive = false) {
  if (!['string','number'].includes(typeof value)) throw new Error(`Revisa ${label}.`);
  const raw = String(value).trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) throw new Error(`Escribe ${label} con hasta dos decimales.`);
  const n = Number(raw); if (!Number.isFinite(n) || n > max || n < 0 || (positive && n === 0)) throw new Error(`Revisa ${label}.`);
  return n;
 }
 let baseCents=0, taxCents=0;
 const lineas: SalesLine[] = input.map(line => {
  if (!line || typeof line !== 'object' || typeof line.concepto !== 'string' || !line.concepto.trim() || line.concepto.trim().length > 300) throw new Error('Escribe el concepto de cada línea (máximo 300 caracteres).');
  const cantidad = number(line.cantidad,'la cantidad',100000,true), precio = number(line.precio,'el precio',1000000), impuesto = number(line.impuesto,'el IVA',100);
  const base = Math.round(Math.round(cantidad*100)*Math.round(precio*100)/100);
  const iva = Math.round(base*Math.round(impuesto*100)/10000);
  baseCents+=base; taxCents+=iva;
  return { concepto:line.concepto.trim(),cantidad,precio,impuesto,base:base/100,iva:iva/100,total:(base+iva)/100 };
 });
 if (baseCents+taxCents > 999999999999) throw new Error('El importe supera el máximo permitido.');
 return { lineas, base:baseCents/100, iva:taxCents/100, total:(baseCents+taxCents)/100 };
}
