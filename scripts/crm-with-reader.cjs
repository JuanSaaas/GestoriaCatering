// Run the web and its local document reader together. No shell interpolation.
const {spawn,spawnSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const mode=process.argv[2];
if (!['dev','start'].includes(mode)) throw new Error('Usa dev o start para iniciar el CRM.');
require('@next/env').loadEnvConfig(process.cwd());
const children=[];
let stopping=false;
function stop(code=0) {
  if(stopping)return;
  stopping=true;
  for(const child of children) if(child.exitCode===null && child.pid) {
    if(process.platform==='win32')spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});
    else child.kill('SIGTERM');
  }
  process.exitCode=code;
}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
process.on('exit',()=>stop(process.exitCode||0));
if(process.env.FACTURAS_READER_MODE!=='external') {
  const python=process.env.FACTURAS_PYTHON||path.resolve('automation/facturas/.venv',process.platform==='win32'?'Scripts/python.exe':'bin/python');
  if(fs.existsSync(python)) {
    const reader=spawn(python,['-m','automation.facturas.worker','--env-file','.env.local'],{stdio:'inherit',windowsHide:true});
    children.push(reader);
    reader.on('error',()=>console.error('No se pudo iniciar el lector de facturas. Revisa Python y su configuración.'));
    reader.on('exit',code=>{if(code && !stopping)console.error('El lector de facturas necesita atención. Consulta su incidencia en Facturas.');});
  } else console.error('Falta el entorno Python del lector. Las subidas se conservan, pero no se leerán hasta configurarlo.');
}
const web=spawn(process.execPath,[require.resolve('next/dist/bin/next'),mode,...process.argv.slice(3)],{stdio:'inherit',windowsHide:true});
children.push(web);
web.on('error',()=>{console.error('No se pudo iniciar el CRM.');stop(1);});
web.on('exit',code=>stop(code||0));
