import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic='force-dynamic';
const uuid=/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
function authorized(r:NextRequest){return r.cookies.get('lmp_crm_session')?.value===(process.env.CRM_SESSION_TOKEN||'lmp-crm-session-v1');}
function db(){const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;if(!url||!key)throw Error();return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});}
export async function GET(r:NextRequest){
 if(!authorized(r))return NextResponse.json({error:'Inicia sesión para consultar el catálogo.'},{status:401});
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
 try{
  const client=db();const all=[];
  for(let page=0; ;page++){
   const result=await client.from('ventas_productos').select('*').order('nombre').order('id').range(page*1000,(page+1)*1000-1).abortSignal(controller.signal);
   if(result.error)throw Error();all.push(...(result.data||[]));if((result.data?.length||0)<1000)break;
  }
  return NextResponse.json({productos:all},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'No se pudo cargar el catálogo. Reintenta la carga.'},{status:503});}finally{clearTimeout(timer);}
}
export async function POST(r:NextRequest){
 if(!authorized(r))return NextResponse.json({error:'Inicia sesión para gestionar el catálogo.'},{status:401});
 if(r.headers.get('origin')!==r.nextUrl.origin)return NextResponse.json({error:'Guarda desde el CRM.'},{status:403});
 let input;try{const raw=await r.text();if(raw.length>8000)throw Error();input=JSON.parse(raw);}catch{return NextResponse.json({error:'No se pudieron leer los datos.'},{status:400});}
 if(!input||!uuid.test(input.id||'')||!['crear','guardar','archivar','restaurar'].includes(input.accion))return NextResponse.json({error:'Selecciona una operación válida.'},{status:400});
 if(input.accion!=='crear'&&(!Number.isSafeInteger(input.version)||input.version<0))return NextResponse.json({error:'Actualiza el producto antes de guardar.'},{status:400});
 let patch:Record<string,unknown>={};
 if(['crear','guardar'].includes(input.accion)){
  if(typeof input.nombre!=='string'||!input.nombre.trim()||input.nombre.length>200||!['servicio','producto'].includes(input.tipo)||typeof input.categoria!=='string'||input.categoria.length>100||typeof input.descripcion!=='string'||input.descripcion.length>1000)return NextResponse.json({error:'Revisa el nombre, tipo, categoría y descripción.'},{status:400});
  const raw=String(input.precio??'').trim().replace(',','.');const precio=Number(raw);const impuesto=Number(input.impuesto);
  if(!/^\d+(\.\d{1,2})?$/.test(raw)||precio>1000000||![0,4,10,21].includes(impuesto))return NextResponse.json({error:'Indica un precio entre 0 y 1.000.000 €, con hasta dos decimales, y un IVA válido.'},{status:400});
  patch={nombre:input.nombre.trim(),tipo:input.tipo,categoria:input.categoria.trim(),descripcion:input.descripcion.trim(),precio,impuesto};
 }
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
 try{
  const client=db();let result;
  if(input.accion==='crear')result=await client.from('ventas_productos').insert({...patch,id:input.id}).select('*').abortSignal(controller.signal).single();
  else{
   if(input.accion==='archivar'||input.accion==='restaurar')patch.archivado=input.accion==='archivar';
   result=await client.from('ventas_productos').update({...patch,version:input.version+1,actualizado_en:new Date().toISOString()}).eq('id',input.id).eq('version',input.version).select('*').abortSignal(controller.signal).maybeSingle();
  }
  if(result.error?.code==='23505'||(!result.error&&!result.data))return NextResponse.json({error:'El producto ya existe o ha cambiado. Actualiza antes de repetir; tus datos se conservan.'},{status:409});
  if(result.error)throw Error();return NextResponse.json({ok:true,producto:result.data},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'No se pudo confirmar el guardado. Actualiza antes de repetir; tus datos se conservan.'},{status:503});}finally{clearTimeout(timer);}
}
