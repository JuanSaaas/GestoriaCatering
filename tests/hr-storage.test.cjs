const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
function compile(file,requires={},env={}){const exports={};new Function('exports','require','process',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(exports,name=>{if(name in requires)return requires[name];return require(name)}, {env,cwd:()=>process.cwd()});return exports;}
const {readHrResponse}=compile('lib/hrResponse.ts');const errors=compile('lib/hrErrors.ts');const hr=compile('lib/hr.ts');
test('respuesta vacía o HTML: mensaje legible, sin error de JSON',async()=>{
 for(const body of ['', '<html>Fallo del servidor</html>'])await assert.rejects(readHrResponse(new Response(body,{status:500})),/No se pudo completar/);
});
test('sesión expirada, fallo configurado y estructura inesperada',async()=>{
 await assert.rejects(readHrResponse(new Response('',{status:401})),/sesión ha caducado/);
 await assert.rejects(readHrResponse(Response.json({error:'Falta configurar el almacenamiento'},{status:503})),/Falta configurar/);
 await assert.rejects(readHrResponse(Response.json({})),/No se pudo completar/);
 const state=hr.initialHrState();assert.deepEqual(await readHrResponse(Response.json(state)),state);
});
function remoteStore(){let row=null,uploads=new Map();const db={
 from(){let action='read',values,rev;const query={select(){return query},eq(key,value){if(key==='revision')rev=value;return query},maybeSingle(){return execute()},single(){return execute()},upsert(v){action='seed';values=v;return query},update(v){action='update';values=v;return query},then(resolve,reject){return execute().then(resolve,reject)}};
 async function execute(){if(action==='seed'){row??=structuredClone(values);return {data:null,error:null}}if(action==='update'){if(row.revision!==rev)return {data:null,error:null};Object.assign(row,structuredClone(values));return {data:{id:'main'},error:null}}return {data:structuredClone(row),error:null}}return query},
 storage:{from(bucket){assert.equal(bucket,'rrhh-private');return {async upload(id,bytes){uploads.set(id,Buffer.from(bytes));return {error:null}},async download(id){return {data:new Blob([uploads.get(id)]),error:null}}}}}
 };
 const store=compile('lib/hrStore.ts',{'server-only':{},'./hr':hr,'./hrErrors':errors,'@supabase/supabase-js':{createClient:()=>db},'node:fs/promises':new Proxy({}, {get(){return ()=>{throw Error('No se debe usar el disco en Vercel')}}})},{VERCEL:'1',NEXT_PUBLIC_SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'test-only'});
 return {...store, snapshot:()=>structuredClone(row), externalChange:()=>{row.revision++;row.payload.employees[0].name="Otra instancia"}};
}
test('Vercel: carga, modifica y recupera documentos sin escribir en disco',async()=>{
 const store=remoteStore();const before=await store.getHr();assert.equal(before.employees.length,3);
 await store.updateHr(s=>{s.employees[0].name='Nombre actualizado'});
 assert.equal((await store.getHr()).employees[0].name,'Nombre actualizado');assert.equal(store.snapshot().revision,1);
 await store.writeHrFile('photo-id',Buffer.from('photo'),'image/png');assert.equal((await store.readHrFile('photo-id')).toString(),'photo');
});
test('guardados concurrentes: evita sobrescribir el cambio de otra instancia',async()=>{
 const store=remoteStore();await store.getHr();let release;const ready=new Promise(r=>release=r);
 const write=store.updateHr(async state=>{await ready;state.employees[0].name='No debe sobrescribir'});
 await new Promise(r=>setTimeout(r,10));store.externalChange();release();
 await assert.rejects(write,/Otro usuario ha actualizado/);
 assert.equal((await store.getHr()).employees[0].name,'Otra instancia');
});


test('API GET: un fallo de almacenamiento siempre devuelve JSON controlado',async()=>{
 const next=require('next/server');
 const route=compile('app/api/crm/rrhh/route.ts',{'@/lib/hr':hr,'@/lib/hrErrors':errors,'@/lib/hrStore':{getHr:async()=>{throw Object.assign(Error('private path'),{code:'EROFS'})}}},{});
 const req=new next.NextRequest('http://localhost/api/crm/rrhh',{headers:{cookie:'lmp_crm_session=lmp-crm-session-v1'}});
 const result=await route.GET(req);assert.equal(result.status,503);assert.match(result.headers.get('content-type'),/json/);const body=await result.json();assert.match(body.error,/almacenamiento persistente/);assert.ok(!body.error.includes('private path'));
});
test('Vercel sin clave: error explícito, sin retroceder a archivos locales',async()=>{
 const store=compile('lib/hrStore.ts',{'server-only':{},'./hr':hr,'./hrErrors':errors},{VERCEL:'1'});
 await assert.rejects(store.getHr(),/almacenamiento.*no está configurado/);
});
