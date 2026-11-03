import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { salesLines, salesDetails } from '@/lib/sales';
export const dynamic = 'force-dynamic';
function authorized(r:NextRequest) { return r.cookies.get('lmp_crm_session')?.value === (process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1'); }
function db() { const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY; if(!url||!key)throw Error(); return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}); }
const uuid=/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
export async function GET(r:NextRequest) {
 if(!authorized(r))return NextResponse.json({error:'Inicia sesión para consultar Ventas.'},{status:401});
 const abort=new AbortController(); const timer=setTimeout(()=>abort.abort(),12000);
 try {
  const tipo=r.nextUrl.searchParams.get('tipo')==='pedido'?'pedido':'presupuesto';
  const raw=Number(r.nextUrl.searchParams.get('pagina')||1); const page=Number.isInteger(raw)&&raw>0?Math.min(raw,10000):1;
  const q=(r.nextUrl.searchParams.get('q')||'').slice(0,100).replace(/[,().%_*\\]/g,' ').trim();
  const client=db();
  let query=client.from('ventas_documentos').select('*',{count:'exact'}).eq('tipo',tipo);
  const id=r.nextUrl.searchParams.get('id');
  if(id){if(!uuid.test(id))return NextResponse.json({error:'Selecciona un documento válido.'},{status:400});query=query.eq('id',id);}
  if(q){const number=q.match(/(?:^|[- ])(\d+)$/)?.[1];query=query.or(`cliente_nombre.ilike.%${q}%,evento.ilike.%${q}%${number?`,numero.eq.${Number(number)}`:''}`);}
  const state=r.nextUrl.searchParams.get('estado');
  if(state==='abiertos')query=query.in('estado',['borrador','enviado']);
  else if(['borrador','enviado','cancelado'].includes(state||''))query=query.eq('estado',state!);
  const comercial=r.nextUrl.searchParams.get('comercial');
  if(comercial==='sin_asignar')query=query.is('comercial_id',null);else if(comercial&&uuid.test(comercial))query=query.eq('comercial_id',comercial);
  const period=r.nextUrl.searchParams.get('periodo');
  const today=new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Madrid'});
  if(period==='proximos')query=query.gte('fecha_evento',today).neq('estado','cancelado');
  else if(period==='mes'||period==='anterior') {
   const [y,m]=today.split('-').map(Number);const start=new Date(Date.UTC(y,m-1-(period==='anterior'?1:0),1)).toISOString().slice(0,10);const end=new Date(Date.UTC(y,m-(period==='anterior'?1:0),1)).toISOString().slice(0,10);
   query=query.gte('confirmado_en',start).lt('confirmado_en',end);
  } else if(['7','30','90'].includes(period||'')){const since=new Date(today);since.setUTCDate(since.getUTCDate()-Number(period));query=query.gte('fecha',since.toISOString().slice(0,10));}
  const order=r.nextUrl.searchParams.get('orden');query=query.order(order==='total'?'total':order==='validez'?'validez':order==='evento'?'fecha_evento':'creado_en',{ascending:order==='validez'||order==='evento',nullsFirst:false}).order('id').range((page-1)*25,page*25-1);
  const [docs,clients]=await Promise.all([query.abortSignal(abort.signal),db().from('clientes').select('id,nombre,email').order('nombre').abortSignal(abort.signal)]);
  if(docs.error||clients.error)throw Error();
  return NextResponse.json({documentos:docs.data,clientes:clients.data,total:docs.count||0,pagina:page},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'No se pudieron cargar las ventas. Vuelve a intentarlo.'},{status:503});}finally{clearTimeout(timer);}
}
export async function POST(r:NextRequest) {
 if(!authorized(r))return NextResponse.json({error:'Inicia sesión para gestionar Ventas.'},{status:401});
 if(r.headers.get('origin')!==r.nextUrl.origin)return NextResponse.json({error:'Realiza la acción desde el CRM.'},{status:403});
 let input;
 try{const text=await r.text();if(text.length>40000)throw Error();input=JSON.parse(text);}catch{return NextResponse.json({error:'No se pudieron leer los datos.'},{status:400});}
 if(!input||!uuid.test(input.id||'')||!['crear','guardar','enviar','confirmar','cancelar'].includes(input.accion))return NextResponse.json({error:'Selecciona una operación válida.'},{status:400});
 if(input.accion!=='crear'&&(!Number.isSafeInteger(input.version)||input.version<0))return NextResponse.json({error:'Actualiza el documento antes de guardar.'},{status:400});
 let patch:Record<string,unknown>={};
 if(['crear','guardar'].includes(input.accion)) {
  try {
   if(!uuid.test(input.cliente_id||''))throw Error('Selecciona un cliente.');
   if(typeof input.fecha!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(input.fecha)||!Number.isFinite(new Date(input.fecha).getTime())||new Date(input.fecha).toISOString().slice(0,10)!==input.fecha)throw Error('Introduce una fecha válida.');
   if(typeof input.notas!=='string'||input.notas.length>2000)throw Error('Las notas admiten hasta 2.000 caracteres.');
   patch={...salesLines(input.lineas),...salesDetails(input),cliente_id:input.cliente_id,fecha:input.fecha,notas:input.notas};
  } catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Revisa los campos.'},{status:400});}
 }
 const abort=new AbortController();const timer=setTimeout(()=>abort.abort(),12000);
 try {
  const client=db(); let result;
  if(['crear','guardar'].includes(input.accion)) {
   const customer=await client.from('clientes').select('id,nombre').eq('id',input.cliente_id).abortSignal(abort.signal).maybeSingle();
   if(customer.error||!customer.data)return NextResponse.json({error:'El cliente ya no está disponible.'},{status:409});
   patch.cliente_nombre=customer.data.nombre;
   if(patch.comercial_id){const member=await client.from('usuarios').select('nombre').eq('id',patch.comercial_id as string).abortSignal(abort.signal).maybeSingle();if(member.error||!member.data)return NextResponse.json({error:'El comercial ya no está disponible.'},{status:409});patch.comercial_nombre=member.data.nombre;}else patch.comercial_nombre='';
   if(patch.oportunidad_id){const opportunity=await client.from('oportunidades').select('cliente_id').eq('id',patch.oportunidad_id as string).abortSignal(abort.signal).maybeSingle();if(opportunity.error||!opportunity.data||opportunity.data.cliente_id!==input.cliente_id)return NextResponse.json({error:'Selecciona una oportunidad del cliente elegido.'},{status:409});}
  }
  if(input.accion==='crear') result=await client.from('ventas_documentos').insert({...patch,id:input.id}).select('*').abortSignal(abort.signal).single();
  else {
   patch={...patch,version:input.version+1,actualizado_en:new Date().toISOString()};
   if(input.accion==='confirmar')patch={...patch,tipo:'pedido',estado:'confirmado',confirmado_en:new Date().toISOString()};
   if(input.accion==='enviar')patch={...patch,estado:'enviado',enviado_en:new Date().toISOString()};
   if(input.accion==='cancelar')patch.estado='cancelado';
   let query=client.from('ventas_documentos').update(patch).eq('id',input.id).eq('version',input.version);
   if(input.accion==='cancelar')query=query.neq('estado','cancelado');else query=query.eq('tipo','presupuesto').in('estado',input.accion==='enviar'?['borrador']:['borrador','enviado']);
   result=await query.select('*').abortSignal(abort.signal).maybeSingle();
  }
  if(result.error?.code==='23505')return NextResponse.json({error:'El documento ya existe. Actualiza la lista antes de repetir.'},{status:409});
  if(result.error)throw Error();
  if(!result.data)return NextResponse.json({error:'El documento ha cambiado o ya se confirmó. Actualiza la lista; tus datos se conservan.'},{status:409});
  return NextResponse.json({ok:true,documento:result.data},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'No se pudo confirmar el guardado. Actualiza antes de repetir.'},{status:503});}finally{clearTimeout(timer);}
}
