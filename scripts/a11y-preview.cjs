// Local accessibility test harness. Does not change production HTML or send
// reports anywhere. Start Next on 3130, then this proxy on 3131; see audit report.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const target = 'http://127.0.0.1:3130';
const axe = path.resolve('tmp/wcag-tools/node_modules/axe-core/axe.min.js');
const injection = `<aside id="a11y-tools" aria-label="Herramientas de auditoría local" style="padding:16px;background:white;color:black;border:2px solid black"><button type="button" id="a11y-run" style="padding:12px;border:2px solid black">Ejecutar auditoría local</button></aside><script src="/__a11y__/axe.js"></script><script>
(() => {
  const run = async () => {
    if (!window.axe) return;
    const result = await axe.run({exclude: [['nextjs-portal'],['#a11y-tools']]});
    let output = document.getElementById('a11y-audit');
    if (!output) { output = document.createElement('script'); output.type='application/json'; output.id='a11y-audit'; document.body.append(output); }
    output.textContent = JSON.stringify({url:location.pathname, date:new Date().toISOString(), viewport:{width:innerWidth,height:innerHeight}, version:axe.version,
      violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,help:v.help,helpUrl:v.helpUrl,tags:v.tags,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),
      passes:result.passes.map(p=>p.id), incomplete:result.incomplete.map(p=>({id:p.id,nodes:p.nodes.length, review:p.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  };
  window.addEventListener('load',()=>setTimeout(run,2000),{once:true});
  document.getElementById('a11y-run').addEventListener('click',run);
  document.addEventListener('a11y:run',run);
  document.addEventListener('keydown',event=>{if(event.ctrlKey && event.shiftKey && event.key.toLowerCase()==='a'){event.preventDefault();run();}});
})();</script>`;

http.createServer(async (request, response) => {
  if (request.url === '/__a11y__/axe.js') {
    response.writeHead(200, {'Content-Type':'text/javascript'});
    fs.createReadStream(axe).pipe(response); return;
  }
  // This button only reruns a local read-only audit, useful after opening a
  // dialog or changing a tab. Reports remain in this document's script node.
  if (request.url === '/__a11y__/rerun.js') {
    response.writeHead(200, {'Content-Type':'text/javascript'});
    response.end("document.dispatchEvent(new Event('a11y:run'));"); return;
  }
  try {
    const chunks=[]; for await (const chunk of request) chunks.push(chunk);
    const headers={...request.headers}; delete headers.connection; delete headers['accept-encoding'];
    const upstream=await fetch(target+request.url,{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:Buffer.concat(chunks),redirect:'manual'});
    const outgoing=Object.fromEntries(upstream.headers);
    delete outgoing['content-encoding'];delete outgoing['content-length'];delete outgoing['transfer-encoding'];
    let bytes=Buffer.from(await upstream.arrayBuffer());
    if ((outgoing['content-type']||'').includes('text/html')) {
      const html=bytes.toString('utf8');
      const mode=new URL(request.url,target).searchParams.get('a11y');
      const spacing=mode==='text-spacing' ? '<style id="a11y-spacing">*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}</style>' : mode==='text-200' ? '<style id="a11y-text-200">html{font-size:200%!important}</style>' : '';
      bytes=Buffer.from(html.replace('</head>',spacing+'</head>').replace('</body>',injection+'</body>'));
    }
    response.writeHead(upstream.status,outgoing); response.end(bytes);
  } catch { response.writeHead(502,{'Content-Type':'text/plain'});response.end('El servidor local de pruebas no está disponible.'); }
}).listen(3131,'127.0.0.1',()=>console.log('Accessibility preview: http://127.0.0.1:3131 (reports stay local)'));
