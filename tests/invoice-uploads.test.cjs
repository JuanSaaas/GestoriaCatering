const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const fsp=require('node:fs/promises');
const path=require('node:path');
const ts=require('typescript');
const {NextRequest}=require('next/server');
const {PDFDocument}=require('pdf-lib');

function compile(file,requires={},env={}) {
  const exports={};
  new Function('exports','require','process',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2017,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(exports,name=>name in requires?requires[name]:require(name),{env,cwd:()=>process.cwd()});
  return exports;
}
const upload=compile('lib/invoiceUploads.ts',{'server-only':{}});
const cookie='lmp_crm_session=lmp-crm-session-v1';
const request=(body,headers={})=>new NextRequest('http://localhost/api/crm/facturas/subir',{method:'POST',headers:{cookie,origin:'http://localhost',...headers},body});

test('subida: rechaza vacío, exceso de tamaño y extensiones que no coinciden con el contenido',()=>{
  for(const [name,bytes] of [['x.pdf',Buffer.alloc(0)],['x.pdf',Buffer.from('not a pdf')],['x.exe',Buffer.from('%PDF-')],['x.jpg',Buffer.from('%PDF-')],['x.pdf',Buffer.alloc(20*1024*1024+1)]]) {
    assert.throws(()=>upload.validateInvoiceFile(name,bytes),upload.InvoiceUploadError);
  }
  assert.equal(upload.validateInvoiceFile('x.PNG',Buffer.from([137,80,78,71,13,10,26,10])),'.png');
});

test('subida real: guarda bytes en carpeta, confirma duplicados y no permite salir de ella',async()=>{
  const root=path.resolve('tmp');await fsp.mkdir(root,{recursive:true});
  const folder=await fsp.mkdtemp(path.join(root,'invoice-upload-tests-'));
  try {
    const store=compile('lib/invoiceUploads.ts',{'server-only':{}},{FACTURAS_INPUT_DIR:folder});
    const route=compile('app/api/crm/facturas/subir/route.ts',{'@/lib/invoiceUploads':store});
    const pdf=await PDFDocument.create();pdf.addPage();const bytes=Buffer.from(await pdf.save());
    const form=()=>{const body=new FormData();body.append('archivo',new Blob([bytes],{type:'application/pdf'}),'../../factura.pdf');return body;};
    const first=await route.POST(request(form()));assert.equal(first.status,200);
    const saved=await first.json();assert.equal(saved.ok,true);assert.equal(saved.duplicada,false);
    assert.equal(path.basename(saved.archivo),saved.archivo);
    assert.deepEqual(await fsp.readFile(path.join(folder,saved.archivo)),bytes);
    const again=await route.POST(request(form()));assert.equal((await again.json()).duplicada,true);
    assert.equal((await fsp.readdir(folder)).length,1,'no temporary file or repeated original remains');
  } finally {
    assert.ok(folder.startsWith(root+path.sep));
    await fsp.rm(folder,{recursive:true,force:true});
  }
});

test('subida API: protege sesión y origen y no escribe peticiones inválidas',async()=>{
  let writes=0;
  const route=compile('app/api/crm/facturas/subir/route.ts',{'@/lib/invoiceUploads':{...upload,saveInvoiceUpload:async()=>{writes++;}}});
  assert.equal((await route.POST(request('x',{cookie:''}))).status,401);
  assert.equal((await route.POST(request('x',{origin:'https://otro.invalid'}))).status,403);
  assert.equal((await route.POST(request('{}',{'content-type':'application/json'}))).status,400);
  assert.equal((await route.POST(request('x',{'content-type':'multipart/form-data; boundary=a','content-length':String(21*1024*1024)}))).status,413);
  assert.equal((await route.POST(request(new FormData()))).status,400);
  const form=new FormData();form.append('archivo','not a file');
  assert.equal((await route.POST(request(form))).status,400);
  assert.equal(writes,0);
});

test('subida API: limita el cuerpo también sin Content-Length',async()=>{
  const route=compile('app/api/crm/facturas/subir/route.ts',{'@/lib/invoiceUploads':upload});
  const response=await route.POST(request(Buffer.alloc(upload.MAX_INVOICE_BYTES+128*1024+1),{'content-type':'multipart/form-data; boundary=a'}));
  assert.equal(response.status,413);
});
