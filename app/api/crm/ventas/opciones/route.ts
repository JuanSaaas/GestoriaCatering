import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic='force-dynamic';
export async function GET(r:NextRequest){
 if(r.cookies.get('lmp_crm_session')?.value!==(process.env.CRM_SESSION_TOKEN||'lmp-crm-session-v1'))return NextResponse.json({error:'Inicia sesión para consultar Ventas.'},{status:401});
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
 try{
  const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;if(!url||!key)throw Error();const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  async function all(table:string,select:string){const records=[];for(let page=0;;page++){const result=await db.from(table).select(select).order('id').range(page*1000,(page+1)*1000-1).abortSignal(controller.signal);if(result.error)throw Error();records.push(...(result.data||[]));if((result.data?.length||0)<1000)break;}return records;}
  // Event fields vary across existing installations; optional location data
  // must not prevent the editor from loading on the current CRM schema.
  const [clientes,comerciales,oportunidades,productos]=await Promise.all([all('clientes','id,nombre,email,tipo_cliente'),all('usuarios','id,nombre'),all('oportunidades','*'),all('ventas_productos','*')]);
  return NextResponse.json({clientes,comerciales,oportunidades,productos},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'No se pudieron cargar clientes, eventos y catálogo. Reintenta la carga.'},{status:503});}finally{clearTimeout(timer);}
}
