const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const {NextRequest}=require('next/server');
function compile(file,requires={},env={}) {
  const exports={};
  new Function('exports','require','process',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(exports,name=>name in requires?requires[name]:require(name),{env});
  return exports;
}
const invoices=compile('lib/invoices.ts');
test('facturas: moneda ausente no se inventa, formatos españoles y crédito',()=>{
  assert.match(invoices.invoiceMoney(121,'EUR'),/121,00/);
  assert.match(invoices.invoiceMoney(121,null),/moneda sin indicar/);
  assert.equal(invoices.invoiceMoney(null,'EUR'),'Sin importe');
  assert.match(invoices.invoiceMoney(-121,'EUR'),/-121,00/);
});
test('facturas: filtros acotados y sin operadores PostgREST introducidos por la búsqueda',()=>{
  assert.equal(invoices.invoiceFilters(new URL('https://example.invalid?pagina=-4')).pagina,1);
  assert.equal(invoices.invoiceFilters(new URL('https://example.invalid?pagina=999999')).pagina,10000);
  assert.throws(()=>invoices.invoiceFilters(new URL('https://example.invalid?estado=desconocido')));
  const parsed=invoices.invoiceFilters(new URL('https://example.invalid?q=hello,(id.eq.x)*_%25'));
  assert.ok(!/[,().%_*]/.test(parsed.query));
});
class InvoiceStorageError extends Error {constructor(message,status=503){super(message);this.status=status;}}
function routes(overrides={}) {
  return compile('app/api/crm/facturas/route.ts',{'@/lib/invoices':invoices,'@/lib/invoiceStore':{InvoiceStorageError,getInvoices:async()=>({facturas:[],documentos:[],intentos:[],total:0,agente:null,pagina:1}),retryInvoiceDocument:async()=>{},...overrides}});
}
const session='lmp_crm_session=lmp-crm-session-v1';
test('facturas API: lectura y reintento exigen sesión',async()=>{
  const route=routes();
  assert.equal((await route.GET(new NextRequest('http://localhost/api/crm/facturas'))).status,401);
  assert.equal((await route.POST(new NextRequest('http://localhost/api/crm/facturas',{method:'POST'}))).status,401);
});
test('facturas API: estado vacío real y errores controlados sin secretos',async()=>{
  let route=routes();
  const request=new NextRequest('http://localhost/api/crm/facturas',{headers:{cookie:session}});
  const empty=await route.GET(request);assert.equal(empty.status,200);assert.deepEqual((await empty.json()).facturas,[]);
  route=routes({getInvoices:async()=>{throw Error('private credential path')}});
  const error=await route.GET(request);assert.equal(error.status,503);assert.ok(!(await error.text()).includes('private credential'));
});
test('facturas API: protege reintentos frente a origen externo y JSON inválido',async()=>{
  let calls=0;const route=routes({retryInvoiceDocument:async()=>{calls++;}});
  for(const origin of ['https://attacker.invalid',null]) {
    const headers={cookie:session,'content-type':'application/json'};if(origin)headers.origin=origin;
    const result=await route.POST(new NextRequest('http://localhost/api/crm/facturas',{method:'POST',headers,body:'{}'}));
    assert.equal(result.status,403);
  }
  const headers={cookie:session,origin:'http://localhost','content-type':'application/json'};
  assert.equal((await route.POST(new NextRequest('http://localhost/api/crm/facturas',{method:'POST',headers,body:'{bad'}))).status,400);
  assert.equal(calls,0);
});
test('facturas API: solo confirma reintento después de persistirlo',async()=>{
  const seen=[];const route=routes({retryInvoiceDocument:async id=>{seen.push(id);}});
  const request=new NextRequest('http://localhost/api/crm/facturas',{method:'POST',headers:{cookie:session,origin:'http://localhost','content-type':'application/json'},body:JSON.stringify({accion:'reintentar',documento_id:'9fa774b5-6e33-40b0-af3d-4e5ad826222f'})});
  const result=await route.POST(request);assert.equal(result.status,200);assert.equal((await result.json()).ok,true);assert.equal(seen.length,1);
});
test('facturas: falta de configuración produce mensaje útil sin usar el cliente público',async()=>{
  const store=compile('lib/invoiceStore.ts',{'server-only':{},'./invoices':invoices});
  await assert.rejects(store.getInvoices(new URL('https://example.invalid')),/Falta conectar Facturas/);
  await assert.rejects(store.retryInvoiceDocument('../invalid'),/documento válido/);
});

const invoiceId='9fa774b5-6e33-40b0-af3d-4e5ad826222f';
const reviewData={proveedor_nombre:'Proveedor de prueba',proveedor_identificacion:'B12345678',numero_factura:'FAC-001',fecha_emision:'2026-10-30',base_imponible:'100,00',iva_importe:'21,00',importe_total:'121,00',moneda:'EUR'};
test('facturas: revisión valida fecha real, importes, datos ausentes y campos permitidos',()=>{
  const input=invoices.invoiceReviewInput({factura_id:invoiceId,version:0,accion:'validar',datos:reviewData});
  assert.equal(input.datos.iva_importe,21);
  assert.throws(()=>invoices.invoiceReviewInput({...input,datos:{...reviewData,fecha_emision:'2026-02-30'}}),/fecha válida/);
  assert.throws(()=>invoices.invoiceReviewInput({...input,datos:{...reviewData,iva_importe:'21,005'}}),/dos decimales/);
  assert.throws(()=>invoices.invoiceReviewInput({...input,datos:{...reviewData,iva_importe:''}}),/Completa/);
  assert.throws(()=>invoices.invoiceReviewInput({...input,datos:{...reviewData,estado_revision:'validada'}}),/no permitidos/);
  assert.equal(invoices.invoiceReviewInput({...input,accion:'guardar',datos:{...reviewData,iva_importe:''}}).datos.iva_importe,null);
});
test('facturas API: devuelve la versión persistida y conserva conflictos como 409',async()=>{
  let seen;
  const saved={id:invoiceId,revision_version:2,estado_revision:'validada'};
  let route=routes({reviewInvoice:async input=>{seen=input;return saved;}});
  const request=()=>new NextRequest('http://localhost/api/crm/facturas',{method:'POST',headers:{cookie:session,origin:'http://localhost','content-type':'application/json'},body:JSON.stringify({factura_id:invoiceId,version:1,accion:'validar',datos:reviewData})});
  const response=await route.POST(request());assert.equal(response.status,200);
  assert.deepEqual((await response.json()).factura,saved);assert.equal(seen.datos.iva_importe,21);
  route=routes({reviewInvoice:async()=>{throw new InvoiceStorageError('La factura ha cambiado',409);}});
  const failed=await route.POST(request());assert.equal(failed.status,409);assert.equal((await failed.json()).ok,undefined);
});
