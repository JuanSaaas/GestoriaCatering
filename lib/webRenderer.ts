import { contrast, safeUrl, type WebDocument, type Block, type BlockItem } from './webDesigner';
const escape = (s: string) => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const defaultLabels: Partial<Record<Block['type'], string[]>> = {
  services: ['Celebraciones privadas','Eventos de empresa','Catering a medida'],
  team: ['Cocina de temporada','Atención cercana','Organización integral'],
  columns: ['Una idea compartida','Una experiencia única'],
};
/** Columns per device for a given number of cards, so no card is left alone on a row. */
function columns(count: number) {
  const n = Math.max(1, count);
  const desktop = n <= 4 ? n : n % 4 === 0 ? 4 : 3;
  const tablet = n === 1 ? 1 : n % 3 === 0 && n !== 6 ? 3 : 2;
  return `--cols:${desktop};--cols-tablet:${tablet}`;
}
/**
 * Renders the structured document as an isolated HTML page.
 * All editable strings are escaped; the only script is authored here.
 * Every image sits inside a frame with a fixed aspect ratio per device (object-fit: cover),
 * so photos of any proportion keep rows aligned instead of stretching or overflowing.
 */
export function renderWebsite(d: WebDocument, options: { editable?: boolean; selected?: string; origin?: string } = {}) {
  const e=escape, s=d.styles;
  const imageUrl=(url:string)=> { if(!safeUrl(url,true)) return ''; return e(url.startsWith('/') && options.origin ? options.origin+url : url); };
  const media=(src:string,alt:string,kind:string,eager=false,fit:Block['fit']='cover')=>`<div class="media media-${kind}${fit==='contain'?' fit-contain':''}"><img src="${imageUrl(src)}" alt="${e(alt)}" loading="${eager?'eager':'lazy'}" decoding="async" referrerpolicy="no-referrer"></div>`;
  const cta=(b:Block,label='Organizar mi evento')=>`<a class="cta" href="${e(safeUrl(b.link)?b.link:'#contacto')}">${e(label)}</a>`;
  const items=(b:Block):BlockItem[]=>b.items || (defaultLabels[b.type] || []).map(title=>({title,text:b.text,image:b.image,alt:b.alt}));
  const cards=(b:Block)=>{const list=items(b);if(!list.length)return '';return `<div class="cards cards-${b.type}" style="${columns(list.length)}">${list.map((item,i)=>`<article class="card">${b.type==='team'?`<div class="monogram" aria-hidden="true">${e(item.title.trim().slice(0,1))}</div>`:b.type==='stats'?'':`<span class="number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>`}<h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('')}</div>`;};
  const firstHero=d.blocks.findIndex(b=>b.type==='hero');
  const firstForm=d.blocks.findIndex(b=>b.type==='form');
  const blocks=d.blocks.map((b,i)=>{
    const level=b.type==='hero' && i===firstHero?'1':'2';
    const title=`<h${level}>${e(b.title)}</h${level}>`;
    const text=`<p>${e(b.text).replace(/\n/g,'<br>')}</p>`;
    let body='';
    switch(b.type) {
      case 'hero': body=`<div class="hero-copy"><span class="eyebrow">La Mesa Perfecta · Eventos y catering</span>${title}${text}${cta(b)}</div>${media(b.image,b.alt,'hero',true,b.fit)}`; break;
      case 'section': body=`${media(b.image,b.alt,'section',false,b.fit)}<div class="section-copy">${title}${text}${cta(b,'Descubrir nuestra propuesta')}</div>`; break;
      case 'heading': body=title; break;
      case 'text': body=text; break;
      case 'image': body=`<figure>${media(b.image,b.alt,'wide',false,b.fit)}<figcaption>${e(b.title)}</figcaption></figure>`; break;
      case 'button': body=cta(b,b.title); break;
      case 'divider': body='<hr>'; break;
      case 'services': case 'team': case 'columns': body=`<div class="block-head">${title}</div>`+cards(b); break;
      case 'testimonial': body=`<div class="quote-wrap"><span class="quote" aria-hidden="true">“</span>${title}<blockquote>${text}</blockquote></div>`; break;
      case 'gallery': {const list=b.items || [{image:b.image,alt:b.alt,title:b.title,text:b.text}];body=`<div class="block-head">${title}</div><div class="photo-grid" style="${columns(list.length)}">${list.map(item=>`<figure>${media(item.image,item.alt,'photo',false,b.fit)}<figcaption><strong>${e(item.title)}</strong><span>${e(item.text)}</span></figcaption></figure>`).join('')}</div>`; break;}
      case 'stats': body=`<div class="block-head">${title}<p class="note">Valores de demostración; sustituye este contenido por tus cifras antes de publicar.</p></div>`+cards(b); break;
      case 'form': body=`<div class="form-intro">${title}<p>Vista previa del formulario. No se envían solicitudes.</p></div><form novalidate><label for="name-${b.id}">Nombre *</label><input id="name-${b.id}" autocomplete="name" required maxlength="200"><label for="email-${b.id}">Correo electrónico *</label><input id="email-${b.id}" type="email" autocomplete="email" required><label for="message-${b.id}">Cuéntanos tu evento *</label><textarea id="message-${b.id}" required maxlength="5000"></textarea><button class="cta" type="submit">Comprobar formulario</button><p role="status" class="form-result"></p></form>`; break;
    }
    const color=b.color || s.text, bg=b.background || s.background;
    const linkColor=contrast(s.primary,bg)>=4.5?s.primary:color;
    const classes=['block',`block-${b.type}`,`align-${b.align}`,!b.mobile?'hide-mobile':'',!b.tablet?'hide-tablet':'',options.selected===b.id?'selected':''].filter(Boolean).join(' ');
    const style=`--local-primary:${linkColor};color:${color};background:${bg};--size:${b.size/16}rem;--pad:${b.spacing/16}rem;${b.border?`border:${b.border}px solid currentColor;`:''}text-align:${b.align};${b.font?`font-family:${b.font};--heading-font:${b.font};`:''}`;
    return `<section id="${b.type==='form' && i===firstForm?'contacto':b.id}" data-block="${b.id}" class="${classes}" style="${style}">${options.editable?`<button class="edit-block" type="button" data-select="${b.id}">Editar bloque ${i+1}: ${e(b.title || b.type)}</button>`:''}<div class="wrap">${body}</div></section>`;
  }).join('');
  const buttonText=contrast('#ffffff',s.primary)>=4.5?'#ffffff':'#000000';
  const cardText=contrast(s.text,s.secondary)>=4.5?s.text:contrast('#111111',s.secondary)>=4.5?'#111111':'#ffffff';
  const r=s.radius;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: ${options.origin ? e(options.origin) : "'self'"}; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'none'; base-uri 'none'"><title>La Mesa Perfecta · Vista previa</title><style>
  *,*::before,*::after{box-sizing:border-box}
  html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
  body{margin:0;font:1rem/1.65 ${s.bodyFont};color:${s.text};background:${s.background};overflow-wrap:break-word;-webkit-font-smoothing:antialiased}
  h1,h2,h3{font-family:var(--heading-font,${s.headingFont});line-height:1.12;letter-spacing:-.025em;margin:0;text-wrap:balance}
  h1{font-size:clamp(2.25rem,3vw + 1.25rem,var(--size,3.5rem))}
  h2{font-size:clamp(1.6rem,1.6vw + 1rem,var(--size,2.5rem))}
  h3{font-size:1.2rem;line-height:1.3;letter-spacing:-.01em}
  p{max-width:62ch;margin:1rem 0 0}
  a{color:var(--local-primary,${s.primary});text-underline-offset:4px}
  img{display:block;max-width:100%}
  button,input,textarea{font:inherit;color:inherit}
  button{cursor:pointer}
  a,button,input,textarea{outline-offset:4px}
  :focus-visible{outline:3px solid #0566ff;box-shadow:0 0 0 6px #fff}
  .wrap{width:100%;max-width:1200px;margin-inline:auto}
  .skip{position:absolute;top:-100px;left:1rem}.skip:focus{top:1rem;z-index:50;background:#fff;color:#000;padding:1rem}
  /* Cabecera y pie */
  header,footer{padding-inline:clamp(1.25rem,5vw,4rem)}
  header .wrap{display:flex;align-items:center;justify-content:space-between;gap:.5rem 2rem;flex-wrap:wrap;min-height:5rem;padding-block:.75rem}
  header{border-bottom:1px solid color-mix(in srgb,currentColor 18%,transparent)}
  header.centered .wrap{flex-direction:column;justify-content:center;padding-block:1.25rem}
  .brand{font-family:Georgia,serif;font-size:1.4rem;font-weight:700;letter-spacing:-.01em}
  nav{display:flex;flex-wrap:wrap;gap:0 1.5rem}
  nav a{display:inline-flex;align-items:center;min-height:44px;color:inherit}
  footer{border-top:1px solid color-mix(in srgb,currentColor 18%,transparent);padding-block:2.5rem}
  footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:1rem 3rem}
  footer p{margin:.25rem 0}
  /* Bloques: un mismo contenedor y margen lateral para todo */
  .block{position:relative;padding:var(--pad,3rem) clamp(1.25rem,5vw,4rem)}
  .align-center p,.align-center .note{margin-inline:auto}
  .align-right p,.align-right .note{margin-inline:auto 0}
  .block-head{margin-bottom:2rem}
  .block-head .note{font-size:.95rem}
  /* Imágenes: marco con proporción fija y recorte centrado */
  .media{position:relative;overflow:hidden;border-radius:${r}px;background:${s.secondary};aspect-ratio:var(--ratio,4/3)}
  .media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}
  .fit-contain img{object-fit:contain}
  .media-hero{--ratio:1/1}.media-section{--ratio:3/2}.media-wide{--ratio:3/2}.media-photo{--ratio:4/3}
  /* Portada */
  .block-hero .wrap{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:clamp(2rem,5vw,4.5rem);align-items:center}
  .eyebrow{display:block;font-size:.9rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin-bottom:1.25rem}
  .hero-copy p{font-size:1.1rem}
  .hero-copy .cta{margin-top:2rem}
  /* Sección con imagen */
  .block-section .wrap{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(2rem,5vw,4.5rem);align-items:center}
  .section-copy .cta{margin-top:1.75rem}
  /* Botón */
  .cta{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:48px;padding:.75rem 1.5rem;border-radius:${Math.min(r,999)}px;border:2px solid ${s.button==='solid'?s.primary:'currentColor'};color:${s.button==='solid'?buttonText:'var(--local-primary)'};background:${s.button==='solid'?s.primary:'transparent'};font-weight:600;text-decoration:underline;text-underline-offset:3px;max-width:100%;text-align:center}
  /* Tarjetas: columnas según el número de elementos */
  .cards{display:grid;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));gap:1.5rem}
  .card{display:flex;flex-direction:column;gap:.5rem;padding:1.75rem;border:1px solid color-mix(in srgb,${cardText} 22%,transparent);border-radius:${r}px;background:${s.secondary};color:${cardText};text-align:left}
  .card p{margin:0}
  .number{font-size:.9rem;font-weight:700;letter-spacing:.08em}
  .monogram{display:grid;place-items:center;width:3.5rem;height:3.5rem;border-radius:50%;border:1px solid currentColor;font:1.6rem Georgia,serif;margin-bottom:.5rem}
  .cards-stats .card h3{font-size:clamp(1.4rem,1.2vw + 1rem,1.9rem)}
  /* Galería: misma proporción en todas las fotos */
  .photo-grid{display:grid;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));gap:1.5rem}
  .photo-grid figure,.block-image figure{margin:0}
  figcaption{margin-top:.875rem;display:flex;flex-direction:column;gap:.25rem}
  figcaption span{font-size:.95rem}
  /* Testimonio */
  .quote-wrap{max-width:52rem}
  .align-center .quote-wrap{margin-inline:auto}.align-right .quote-wrap{margin-inline:auto 0}
  .quote{display:block;font:5rem/1 Georgia,serif;height:3rem;color:var(--local-primary)}
  blockquote{margin:1.25rem 0 0;font-size:1.25rem}
  blockquote p{margin:0}
  /* Formulario */
  .block-form .wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:clamp(2rem,5vw,4.5rem);align-items:start}
  .block-form form{width:100%;text-align:left}
  .block-form label{display:block;margin:1.25rem 0 .5rem;font-weight:600}
  .block-form label:first-of-type{margin-top:0}
  .block-form input,.block-form textarea{display:block;width:100%;min-height:48px;padding:.75rem;border:1px solid currentColor;border-radius:${Math.min(r,12)}px;background:${s.background};color:${s.text}}
  .block-form textarea{min-height:140px;resize:vertical}
  .block-form button{margin-top:1.5rem}
  hr{border:0;border-top:1px solid currentColor;margin:0}
  /* Variantes de plantilla */
  body.corporate .block-hero .wrap{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)}
  body.corporate .media-hero{--ratio:4/5}
  body.corporate .card{border-top:4px solid var(--local-primary)}
  body.creative .block-hero .wrap,body.premium .block-hero .wrap{grid-template-columns:minmax(0,1fr)}
  body.creative .hero-copy{max-width:56rem}
  body.creative .block-hero h1{font-size:clamp(2.6rem,6vw + 1rem,var(--size,6rem))}
  body.creative .media-hero{--ratio:16/9}
  body.creative .card{border-width:0 0 2px;border-radius:0}
  body.premium header{border-bottom:0}
  body.premium .hero-copy{max-width:50rem}
  body.premium .align-left .hero-copy{margin-inline:0}
  body.premium .block-hero h1{font-size:clamp(2.6rem,6vw + 1rem,var(--size,6rem));font-weight:400}
  body.premium .media-hero{--ratio:16/9}
  body.premium .media-section{--ratio:4/5}
  body.premium .cards-services{--cols:1!important;--cols-tablet:1!important}
  body.premium .card{border:0;border-top:1px solid currentColor;border-radius:0;background:transparent;color:inherit;padding-inline:0}
  /* Editor */
  .edit-block{position:absolute;top:.5rem;right:.5rem;max-width:calc(100% - 1rem);z-index:2;min-height:44px;font-size:.875rem;background:#fff;color:#17395c;border:2px solid #17395c;padding:.4rem .9rem;border-radius:8px;opacity:.95}
  .block:has(.edit-block){padding-top:max(4.25rem,var(--pad,3rem))}
  .selected{outline:3px solid #17395c;outline-offset:-3px}
  .text>.wrap>p{font-size:var(--size)}
  /* Tablet */
  @media(min-width:601px) and (max-width:900px){
    .hide-tablet{display:none}
    .cards,.photo-grid{grid-template-columns:repeat(var(--cols-tablet,2),minmax(0,1fr));gap:1rem}
    .card{padding:1.25rem}
    .block-hero .wrap,.block-section .wrap,body.corporate .block-hero .wrap{gap:2rem}
    .media-hero{--ratio:4/5}
    body.creative .media-hero,body.premium .media-hero{--ratio:16/9}
    .block-form .wrap{grid-template-columns:minmax(0,1fr)}
  }
  /* Móvil */
  @media(max-width:600px){
    .hide-mobile{display:none}
    header .wrap{min-height:4rem}
    nav{gap:0 1.25rem}
    .block{padding-inline:1.25rem}
    .block-hero .wrap,.block-section .wrap,.block-form .wrap,body.corporate .block-hero .wrap{grid-template-columns:minmax(0,1fr);gap:2rem}
    .cards,.photo-grid{grid-template-columns:minmax(0,1fr)!important;gap:1rem}
    .media-hero,body.corporate .media-hero{--ratio:1/1}
    body.premium .media-section{--ratio:1/1}
    body.creative .media-hero,body.premium .media-hero{--ratio:4/3}
    .media-wide{--ratio:4/3}
    h1,body.creative .block-hero h1,body.premium .block-hero h1{font-size:clamp(2rem,9vw,min(var(--size,3rem),3rem))}
    h2{font-size:clamp(1.5rem,6.5vw,min(var(--size,2rem),2.25rem))}
    .cta{width:100%}
    .card{padding:1.25rem}
    footer .wrap{flex-direction:column}
  }
  @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
  @media(forced-colors:active){button,.cta,input,textarea,.card{border:2px solid ButtonText}}
  </style></head><body class="${d.template}"><a class="skip" href="#contenido">Saltar al contenido</a><header class="${s.header==='center'?'centered':''}"><div class="wrap"><span class="brand">La Mesa Perfecta</span><nav aria-label="Navegación de la web"><a href="#contenido">Nuestra propuesta</a><a href="#contacto">Contacto</a></nav></div></header><main id="contenido" tabindex="-1">${firstHero>=0?'':'<h1 class="wrap" style="padding:2rem clamp(1.25rem,5vw,4rem) 0">La Mesa Perfecta</h1>'}${blocks}</main><footer><div class="wrap"><div><span class="brand">La Mesa Perfecta</span>${s.footer==='expanded'?'<p>Eventos y catering · Zaragoza y alrededores</p>':''}</div><div>${s.footer==='expanded'?'<p><a href="mailto:hola@lamesaperfecta.es">hola@lamesaperfecta.es</a></p><p><a href="tel:976000000">976 000 000</a></p>':''}<p>Contenido de demostración · Vista previa privada</p></div></div></footer><script>
  document.addEventListener('submit',function(event){event.preventDefault();var form=event.target;var ok=form.checkValidity();if(!ok){form.reportValidity();}form.querySelector('.form-result').textContent=ok?'✓ Campos comprobados. Esta vista previa no envía solicitudes.':'⚠ Revisa los campos marcados con asterisco.'});
  window.addEventListener('message',function(event){if(event.source===parent && event.data && event.data.type==='lmp-restore-scroll')window.scrollTo(0,Number(event.data.y)||0)});
  window.addEventListener('scroll',function(){parent.postMessage({type:'lmp-scroll',y:window.scrollY},'*')});
  document.addEventListener('keydown',function(event){if(event.key==='Escape')parent.postMessage({type:'lmp-preview-escape'},'*')});
  ${options.editable?`document.addEventListener('click',function(event){var section=event.target.closest('[data-block]');if(section){event.preventDefault();parent.postMessage({type:'lmp-select-block',id:section.dataset.block},'*')}});`:''}
  </script></body></html>`;
}
