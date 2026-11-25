const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const {NextRequest}=require('next/server');
function compile(file,deps={},env={}){const exports={};new Function('exports','require','process',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(exports,name=>name in deps?deps[name]:require(name),{env});return exports;}
const model=compile('lib/webDesigner.ts');
const renderer=compile('lib/webRenderer.ts',{'./webDesigner':model});
test('las cuatro plantillas tienen estructuras distintas y contenido editable válido',()=>{
 const structures=new Set();for(const t of model.templates){const d=model.newDocument(t.id);assert.deepEqual(model.validateDocument(d),d);structures.add(d.blocks.map(b=>b.type).join(','));assert.match(renderer.renderWebsite(d),/lang="es"/);}assert.equal(structures.size,4);
});
test('URLs: rechaza protocolos ejecutables, credenciales y rutas ambiguas',()=>{
 for(const url of ['javascript:alert(1)','data:image/svg+xml,test','//example.com','https://a:b@example.com','/\\example.com','https://example.com/"'])assert.equal(model.safeUrl(url,true),false,url);
 for(const url of ['/hero-photo.jpg','https://images.example.com/photo.jpg'])assert.equal(model.safeUrl(url,true),true);
 for(const url of ['#contacto','mailto:hola@lamesaperfecta.es','tel:976000000'])assert.equal(model.safeUrl(url),true);
});
test('valida contraste, límites, campos, IDs y alternativas de imagen',()=>{
 const bad=change=>{const d=model.newDocument('minimal');change(d);assert.throws(()=>model.validateDocument(d));};
 bad(d=>d.styles.text='#ffffff');bad(d=>d.styles.radius=999);bad(d=>d.blocks[0].size=NaN);bad(d=>d.blocks[0].image='javascript:alert(1)');bad(d=>d.blocks[0].alt='');bad(d=>d.blocks.push(d.blocks[0]));bad(d=>d.blocks[0].background='#18251e');bad(d=>d.blocks[0].mobile='yes');
 const d=model.newDocument('minimal');d.html='<script>bad</script>';d.blocks[0].html='bad';assert.equal(model.validateDocument(d).html,undefined);assert.equal(model.validateDocument(d).blocks[0].html,undefined);
});
test('render seguro: escapa HTML, conserva responsive y no envía formularios',()=>{
 const d=model.newDocument('creative');d.blocks[0].title='<script>alert("x")</script>';const html=renderer.renderWebsite(d,{editable:true,origin:'http://localhost:3158'});assert.ok(!html.includes('<script>alert'));assert.match(html,/&lt;script&gt;/);assert.match(html,/prefers-reduced-motion/);assert.match(html,/forced-colors/);assert.match(html,/max-width:600px/);assert.match(html,/form-action 'none'/);assert.match(html,/event.preventDefault/);assert.match(html,/lmp-select-block/);
});
function storage(){let rows=[];const db={from(table){assert.equal(table,'web_projects');let op='read',values,filters=[];const q={select(){return q},eq(k,v){filters.push([k,v]);return q},order(){return q},insert(v){op='insert';values=v;return q},update(v){op='update';values=v;return q},delete(){op='delete';return q},maybeSingle(){return exec(true)},then(a,b){return exec().then(a,b)}};async function exec(single=false){const matches=rows.filter(r=>filters.every(([k,v])=>r[k]===v));if(op==='insert'){if(rows.some(r=>r.id===values.id))return{error:{code:'23505'}};const r={revision:1,status:'draft',created_at:new Date().toISOString(),...structuredClone(values)};rows.push(r);return{data:structuredClone(r),error:null};}if(op==='update')matches.forEach(r=>Object.assign(r,structuredClone(values)));if(op==='delete')rows=rows.filter(r=>!matches.includes(r));return{data:structuredClone(single?matches[0]||null:matches),error:null};}return q;}};const store=compile('lib/webProjectStore.ts',{'server-only':{},'@supabase/supabase-js':{createClient:()=>db},'./webDesigner':model},{SUPABASE_URL:'https://example.test',SUPABASE_SECRET_KEY:'test',CRM_ADMIN_USER:'admin'});return{store,seed:r=>rows.push(r)};}
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
test('almacenamiento: crear, recuperar, editar y borrar con revisión confirmada',async()=>{
 const {store}=storage();const document=model.newDocument('premium');const created=await store.mutateWebProject({action:'create',id,name:'Gala',document});assert.equal(created.revision,1);assert.equal((await store.listWebProjects())[0].name,'Gala');document.blocks[0].title='Nueva gala';const saved=await store.mutateWebProject({action:'save',id,revision:1,name:'Gala 2',document});assert.equal(saved.revision,2);assert.equal((await store.listWebProjects())[0].document.blocks[0].title,'Nueva gala');await assert.rejects(store.mutateWebProject({action:'delete',id,revision:1}),/cambiado/);await store.mutateWebProject({action:'delete',id,revision:2});assert.equal((await store.listWebProjects()).length,0);
});
test('conflictos: no sobrescribe cambios ni permite leer/modificar proyectos de otro propietario',async()=>{
 const {store,seed}=storage();const document=model.newDocument('minimal');await store.mutateWebProject({action:'create',id,name:'Web',document});await store.mutateWebProject({action:'save',id,revision:1,name:'Actualizada',document});await assert.rejects(store.mutateWebProject({action:'save',id,revision:1,name:'Antigua',document}),/Otra sesión/);assert.equal((await store.listWebProjects())[0].name,'Actualizada');const other='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';seed({id:other,owner_id:'other',revision:1,name:'Privada',document});assert.equal((await store.listWebProjects()).length,1);await assert.rejects(store.mutateWebProject({action:'save',id:other,revision:1,name:'Ataque',document}),/Otra sesión/);await assert.rejects(store.mutateWebProject({action:'delete',id:other,revision:1}),/no está disponible/);
});
test('API: sesión, origen, JSON, tamaño y errores de almacenamiento',async()=>{
 let calls=0;const store=storage().store;const route=compile('app/api/crm/disenador-web/route.ts',{'@/lib/webProjectStore':{...store,listWebProjects:async()=>{calls++;throw Error('secret connection');}}});
 const request=(body,headers={})=>new NextRequest('http://localhost/api/crm/disenador-web',{method:'POST',headers,body});const auth={cookie:'lmp_crm_session=lmp-crm-session-v1',origin:'http://localhost'};
 assert.equal((await route.GET(new NextRequest('http://localhost/api/crm/disenador-web'))).status,401);assert.equal(calls,0);
 assert.equal((await route.POST(request('{}',{...auth,origin:'http://evil.test'}))).status,403);
 assert.equal((await route.POST(request('{',auth))).status,400);assert.equal((await route.POST(request('null',auth))).status,400);
 assert.equal((await route.POST(request('x'.repeat(1_000_001),auth))).status,413);
 const failed=await route.GET(new NextRequest('http://localhost/api/crm/disenador-web',{headers:auth}));assert.equal(failed.status,503);assert.ok(!(await failed.text()).includes('secret connection'));
 const response=await route.POST(request(JSON.stringify({action:'create',id,name:'Web',document:model.newDocument('minimal')}),auth));assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
});
