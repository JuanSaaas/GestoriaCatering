export type SalesLine = { concepto: string; cantidad: number; precio: number; impuesto: number; descuento?: number; base: number; iva: number; total: number };
export type SalesDocument = { id: string; numero: number; tipo: 'presupuesto' | 'pedido'; estado: 'borrador' | 'enviado' | 'confirmado' | 'cancelado'; cliente_id: string; cliente_nombre: string; fecha: string; lineas: SalesLine[]; base: number; iva: number; total: number; notas: string; version: number; evento?: string; fecha_evento?: string | null; invitados?: number | null; ubicacion?: string; comercial_id?: string | null; comercial_nombre?: string; oportunidad_id?: string | null; validez?: string | null; condiciones?: string; enviado_en?: string | null; confirmado_en?: string | null };
export type SalesProduct = {id:string;nombre:string;tipo:'servicio'|'producto';categoria:string;descripcion:string;precio:number;impuesto:number;archivado:boolean;version:number};
export const SALES_CATEGORIES = ['Menús y catering','Bebidas','Personal de servicio','Equipamiento','Decoración','Organización de eventos','Transporte'];
export const salesStatus = (doc: SalesDocument) => doc.estado === 'cancelado' ? '× Cancelado' : doc.tipo === 'pedido' ? '✓ Pedido de venta' : doc.estado === 'enviado' ? '↗ Enviado' : '◷ Presupuesto';
export function validSalesDate(value: unknown): value is string { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(value).getTime()) && new Date(value).toISOString().slice(0,10) === value; }
export function salesDetails(input: Record<string, unknown>) {
 const text=(key:string,max:number)=>{const value=input[key]??'';if(typeof value!=='string'||value.length>max)throw Error(`Revisa ${key} (máximo ${max} caracteres).`);return value.trim();};
 const date=(key:string)=>{const value=input[key];if(value==null||value==='')return null;if(!validSalesDate(value))throw Error('Introduce una fecha válida.');return value;};
 const validez=date('validez');if(validez&&typeof input.fecha==='string'&&validez<input.fecha)throw Error('La validez debe ser igual o posterior a la fecha del presupuesto.');
 const invitados=input.invitados==null||input.invitados===''?null:Number(input.invitados);if(invitados!==null&&(!Number.isInteger(invitados)||invitados<1||invitados>100000))throw Error('Indica entre 1 y 100.000 invitados.');
 const uuid=/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
 const id=(key:string)=>{const value=input[key];if(!value)return null;if(typeof value!=='string'||!uuid.test(value))throw Error('Selecciona un registro válido.');return value;};
 return {evento:text('evento',200),ubicacion:text('ubicacion',300),fecha_evento:date('fecha_evento'),invitados,comercial_id:id('comercial_id'),oportunidad_id:id('oportunidad_id'),validez,condiciones:text('condiciones',300)};
}
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
  const descuento = number(line.descuento ?? 0,'el descuento',100);
  const base = Math.round(Math.round(cantidad*100)*Math.round(precio*100)*(10000-Math.round(descuento*100))/1000000);
  const iva = Math.round(base*Math.round(impuesto*100)/10000);
  baseCents+=base; taxCents+=iva;
  return { concepto:line.concepto.trim(),cantidad,precio,impuesto,descuento,base:base/100,iva:iva/100,total:(base+iva)/100 };
 });
 if (baseCents+taxCents > 999999999999) throw new Error('El importe supera el máximo permitido.');
 return { lineas, base:baseCents/100, iva:taxCents/100, total:(baseCents+taxCents)/100 };
}
