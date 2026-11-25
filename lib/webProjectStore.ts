import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { validateDocument, type WebProject } from './webDesigner';
export class WebStoreError extends Error { constructor(message:string,public status=503){super(message);} }
export function projectOwner() { return process.env.CRM_ADMIN_USER || 'admin'; }
function database(){
  const url=process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !key) throw new WebStoreError('Falta configurar el almacenamiento del Diseñador Web. Contacta con administración.');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,init)=>fetch(url,{...init,signal:AbortSignal.timeout(12000)})}});
}
function check(error:{code?:string}|null){if(error)throw new WebStoreError(['42P01','PGRST205'].includes(error.code || '')?'Falta activar la tabla del Diseñador Web en Supabase. Consulta docs/DISENADOR_WEB.md.':'No se pudo confirmar la operación. Tus cambios se conservan; vuelve a intentarlo.');}
export async function listWebProjects(){const result=await database().from('web_projects').select('id,name,document,revision,created_at,updated_at,status').eq('owner_id',projectOwner()).order('updated_at',{ascending:false});check(result.error);return result.data as WebProject[];}
export async function mutateWebProject(input:Record<string,unknown>){
  const db=database();
  const id=typeof input.id==='string'?input.id:'';
  if(!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))throw new WebStoreError('Selecciona una página válida.',400);
  if(!['create','save','delete'].includes(String(input.action)))throw new WebStoreError('Selecciona una operación válida.',400);
  if(input.action!=='create' && (!Number.isSafeInteger(input.revision) || Number(input.revision)<1))throw new WebStoreError('Actualiza la página antes de guardar.',400);
  if(input.action==='delete'){
    const result=await db.from('web_projects').delete().eq('id',id).eq('owner_id',projectOwner()).eq('revision',input.revision).select('id').maybeSingle();check(result.error);
    if(!result.data)throw new WebStoreError('La página ha cambiado o ya no está disponible. Actualiza la lista antes de eliminarla.',409);
    return {id};
  }
  const name=typeof input.name==='string'?input.name.trim():'';
  if(!name || name.length>120)throw new WebStoreError('Escribe un nombre de proyecto de entre 1 y 120 caracteres.',400);
  let document;
  try{document=validateDocument(input.document);}catch(error){throw new WebStoreError((error as Error).message,400);}
  const values={name,document,updated_at:new Date().toISOString()};
  const query=input.action==='create'?db.from('web_projects').insert({...values,id,owner_id:projectOwner()}):db.from('web_projects').update({...values,revision:Number(input.revision)+1}).eq('id',id).eq('owner_id',projectOwner()).eq('revision',input.revision);
  const result=await query.select('id,name,document,revision,created_at,updated_at,status').maybeSingle();
  if(result.error?.code==='23505')throw new WebStoreError('Esta página ya se ha creado. Actualiza la lista para abrirla.',409);
  check(result.error);
  if(!result.data)throw new WebStoreError('Otra sesión ha cambiado esta página. Tus cambios siguen en el editor. Abre la versión guardada en otra pestaña para compararlas.',409);
  return result.data as WebProject;
}
