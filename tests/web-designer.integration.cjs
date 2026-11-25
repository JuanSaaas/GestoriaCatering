// Runs against an explicitly chosen local CRM; creates and removes only its own drafts.
const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
require('@next/env').loadEnvConfig(process.cwd());
const model={};new Function('exports',ts.transpileModule(fs.readFileSync('lib/webDesigner.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(model);
async function main(){
 const base=process.env.WEB_DESIGNER_TEST_URL;if(!base || !/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base))throw Error('Define WEB_DESIGNER_TEST_URL con un servidor local de pruebas.');
 const route=base+'/api/crm/disenador-web',ids=new Map();
 assert.equal((await fetch(route)).status,401);
 const login=await fetch(base+'/api/crm/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usuario:process.env.CRM_ADMIN_USER || 'admin',contrasena:process.env.CRM_ADMIN_PASSWORD || '1234'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
 const headers={cookie,origin:base,'Content-Type':'application/json'};
 async function action(body,status=200){const response=await fetch(route,{method:'POST',headers,body:JSON.stringify(body)});const data=await response.json();assert.equal(response.status,status,JSON.stringify(data));return data.project;}
 try{
  const denied=await fetch(route,{method:'POST',headers:{...headers,origin:'https://other.invalid'},body:'{}'});assert.equal(denied.status,403);
  for(const t of model.templates){const id=crypto.randomUUID();let p=await action({action:'create',id,name:'Prueba automática del diseñador · '+t.id,document:model.newDocument(t.id)});ids.set(id,p.revision);p.document.blocks[0].title='Título persistido '+t.id;p=await action({action:'save',id,revision:p.revision,name:p.name,document:p.document});ids.set(id,p.revision);assert.equal(p.revision,2);await action({action:'save',id,revision:1,name:p.name,document:p.document},409);await action({action:'delete',id,revision:1},409);const bad=structuredClone(p.document);bad.blocks[0].link='javascript:alert(1)';await action({action:'save',id,revision:p.revision,name:p.name,document:bad},400);}
  const list=await (await fetch(route,{headers:{cookie}})).json();for(const [id,revision]of ids){const p=list.projects.find(x=>x.id===id);assert.equal(p.revision,revision);assert.match(p.document.blocks[0].title,/Título persistido/);}
  const original=list.projects.find(p=>ids.has(p.id)),copy=await action({action:'create',id:crypto.randomUUID(),name:original.name+' copia',document:original.document});ids.set(copy.id,copy.revision);assert.deepEqual(copy.document,original.document);
  console.log('OK: cuatro plantillas, creación, edición, recuperación, duplicado, conflictos, validación, sesión y origen.');
 }finally{for(const [id,revision]of ids)await action({action:'delete',id,revision});}
 const after=await(await fetch(route,{headers:{cookie}})).json();assert.ok(!after.projects.some(p=>ids.has(p.id)));console.log('OK: borrado confirmado y limpieza de todos los borradores de esta prueba.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
