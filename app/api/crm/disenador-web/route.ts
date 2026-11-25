import { NextRequest, NextResponse } from 'next/server';
import { listWebProjects, mutateWebProject, WebStoreError } from '@/lib/webProjectStore';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
function guard(r:NextRequest,write=false){
  if(r.cookies.get('lmp_crm_session')?.value!==(process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1'))return reply({error:'Tu sesión ha caducado. Vuelve a entrar al CRM; conserva tus cambios.'},401);
  if(write && r.headers.get('origin')!==r.nextUrl.origin)return reply({error:'Realiza esta operación desde el CRM.'},403);
}
function failure(error:unknown){return reply({error:error instanceof WebStoreError?error.message:'No se pudo acceder al diseñador. Tus cambios se conservan. Comprueba la conexión y vuelve a intentarlo.'},error instanceof WebStoreError?error.status:503);}
export async function GET(r:NextRequest){const denied=guard(r);if(denied)return denied;try{return reply({projects:await listWebProjects()});}catch(error){return failure(error);}}
export async function POST(r:NextRequest){
  const denied=guard(r,true);if(denied)return denied;
  try{
    if(Number(r.headers.get('content-length'))>1_000_000)return reply({error:'El diseño supera el tamaño máximo de 1 MB.'},413);
    const reader=r.body?.getReader();if(!reader)return reply({error:'Faltan los datos del proyecto.'},400);
    const parts:Uint8Array[]=[];let size=0;
    while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>1_000_000){await reader.cancel();return reply({error:'El diseño supera el tamaño máximo de 1 MB.'},413);}parts.push(part.value);}
    let input;try{input=JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{return reply({error:'No se pudieron leer los datos del proyecto.'},400);}
    if(!input || typeof input!=='object' || Array.isArray(input))return reply({error:'Revisa los datos del proyecto.'},400);
    return reply({project:await mutateWebProject(input)});
  }catch(error){return failure(error);}
}
