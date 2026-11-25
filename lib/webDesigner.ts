export const templates = [
  { id: 'minimal', name: 'Moderno y minimalista', description: 'Luz, espacios abiertos y una presentación cercana.', tag: 'Esencial' },
  { id: 'corporate', name: 'Corporativo y empresarial', description: 'Confianza, equipo y servicios para empresas.', tag: 'Empresa' },
  { id: 'creative', name: 'Creativo y visual', description: 'Composiciones editoriales que dejan huella.', tag: 'Estudio' },
  { id: 'premium', name: 'Premium y elegante', description: 'Una experiencia gastronómica con carácter.', tag: 'Colección' },
] as const;
export type TemplateId = typeof templates[number]['id'];
export const blockTypes = { hero: 'Portada', section: 'Sección', heading: 'Título', text: 'Texto', image: 'Imagen', button: 'Botón', form: 'Formulario', gallery: 'Galería', columns: 'Columnas', testimonial: 'Testimonio', divider: 'Separador', services: 'Servicios', stats: 'Cifras', team: 'Equipo' } as const;
export type BlockType = keyof typeof blockTypes;
export type BlockItem = { title:string; text:string; image:string; alt:string };
export type Block = { id: string; type: BlockType; title: string; text: string; image: string; alt: string; link: string; color: string; background: string; font: string; size: number; spacing: number; border: number; align: 'left' | 'center' | 'right'; mobile: boolean; tablet: boolean; fit?: 'cover' | 'contain'; items?:BlockItem[] };
export type SiteStyles = { primary: string; secondary: string; background: string; text: string; headingFont: string; bodyFont: string; radius: number; spacing: number; button: 'solid' | 'outline'; header: 'split' | 'center'; footer: 'simple' | 'expanded' };
export type WebDocument = { schema: 1; template: TemplateId; styles: SiteStyles; blocks: Block[] };
export type WebProject = { id: string; name: string; document: WebDocument; revision: number; created_at: string; updated_at: string; status: 'draft' };
export const fonts = ['system-ui', 'Georgia', 'Arial', 'Verdana'] as const;
export const presets: Record<string, Pick<SiteStyles, 'primary' | 'secondary' | 'background' | 'text'>> = {
  Natural: { primary: '#315748', secondary: '#e7ede8', background: '#ffffff', text: '#18251e' },
  Corporativo: { primary: '#17395c', secondary: '#e8edf4', background: '#ffffff', text: '#182635' },
  Creativo: { primary: '#823b22', secondary: '#f4dfd2', background: '#fff9f0', text: '#292019' },
  Elegante: { primary: '#e3c58e', secondary: '#30332d', background: '#191d19', text: '#f5f1e9' },
};
export function newBlock(type: BlockType, id: string): Block {
  const labels:Partial<Record<BlockType,string[]>>={services:['Celebraciones privadas','Eventos de empresa','Catering a medida'],columns:['Una idea compartida','Una experiencia única'],team:['Cocina de temporada','Atención cercana','Organización integral'],gallery:['La mesa','El espacio','Los detalles'],stats:['3 formatos de evento','1 equipo dedicado','100 % a medida']};
  return { id, type, title: blockTypes[type] === 'Portada' ? 'Cada encuentro merece una mesa perfecta' : blockTypes[type], text: 'Cuidamos cada detalle para que disfrutes de tu evento. Gastronomía de temporada y una atención cercana en Zaragoza y alrededores.', image: '/hero-photo.jpg', alt: 'Presentación gastronómica de La Mesa Perfecta', link: '#contacto', color: '', background: '', font: '', size: type === 'hero' ? 56 : type==='text'?18:32, spacing: 48, border: 0, align: 'left', mobile: true, tablet: true, fit: 'cover', items:(labels[type] || []).map((title,i)=>({title,text:'Una propuesta cuidada para cada encuentro.',image:['/hero-photo.jpg','/salon-eventos.png','/hero-collage.jpg'][i%3],alt:title+' · La Mesa Perfecta'})) };
}
export function newDocument(template: TemplateId): WebDocument {
  const palette = presets[({minimal:'Natural',corporate:'Corporativo',creative:'Creativo',premium:'Elegante'})[template]];
  const structures: Record<TemplateId, BlockType[]> = { minimal: ['hero','services','testimonial','form'], corporate: ['hero','stats','section','services','team','form'], creative: ['hero','gallery','columns','testimonial','form'], premium: ['hero','section','image','services','testimonial','form'] };
  const blocks = structures[template].map((type,i) => newBlock(type, `block-${i}`));
  blocks[0].title = { minimal: 'Momentos que se comparten.', corporate: 'Tu evento, en buenas manos.', creative: 'Ponemos la mesa. Tú, la historia.', premium: 'El arte de celebrar.' }[template];
  blocks.forEach(b => { if (b.type === 'section') { b.title = 'La hospitalidad está en los detalles'; b.image = '/salon-eventos.png'; } if (b.type === 'form') b.title = 'Hablemos de tu próximo evento'; if (b.type === 'testimonial') { b.title = 'Una celebración para recordar'; b.text = '«Una propuesta cuidada, una mesa preciosa y un equipo pendiente de todo.» — Testimonio de demostración'; } if (b.type === 'services') b.title = 'Una propuesta para cada ocasión'; if (b.type === 'gallery') b.title = 'Historias alrededor de una mesa'; if (b.type === 'team') b.title = 'Personas que cuidan de personas'; if (b.type === 'columns') b.title = 'Nuestra forma de trabajar'; if (b.type === 'stats') b.title = 'La Mesa Perfecta en cifras'; if (b.type === 'image') { b.title = 'Cada detalle, preparado para tus invitados'; b.image = '/hero-collage.jpg'; b.alt = 'Mesa decorada y logotipo de La Mesa Perfecta'; } });
  const hero = blocks[0]; if (template === 'creative' || template === 'premium') { hero.image = '/salon-eventos.png'; hero.alt = 'Salón de La Mesa Perfecta preparado para un evento'; }
  if (template === 'premium') blocks.forEach(b => { if (b.type === 'section') { b.image = '/hero-photo.jpg'; b.alt = 'Mesa con flores blancas y copas preparada para una celebración'; } });
  return { schema: 1, template, styles: { ...palette, headingFont: template === 'premium' ? 'Georgia' : 'system-ui', bodyFont: 'system-ui', radius: template === 'premium' ? 0 : 16, spacing: 48, button: 'solid', header: template === 'creative' ? 'center' : 'split', footer: 'expanded' }, blocks };
}
export function safeUrl(value: string, image = false): boolean {
  if (!value) return !image;
  if (/[\s\\<>"'\u0000-\u001f]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  if (!image && (/^#[a-z][\w-]*$/i.test(value) || /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) || /^tel:\+?[\d-]+$/.test(value))) return true;
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
}
export function contrast(a: string, b: string) {
  const luminance = (hex: string) => { const v = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255).map(n => n <= .04045 ? n/12.92 : ((n+.055)/1.055)**2.4); return v[0]*.2126+v[1]*.7152+v[2]*.0722; };
  const x=luminance(a), y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export function validateDocument(value: unknown): WebDocument {
  const fail = (message: string): never => { throw new Error(message); };
  if (!value || typeof value !== 'object') return fail('No se pudo leer el diseño.');
  const d = value as WebDocument;
  if (d.schema !== 1 || !templates.some(t=>t.id===d.template) || !Array.isArray(d.blocks) || d.blocks.length > 100 || !d.styles) return fail('El diseño debe tener una plantilla válida y un máximo de 100 bloques.');
  const color = (v: unknown, optional=false) => typeof v === 'string' && ((optional && v==='') || /^#[a-f\d]{6}$/i.test(v));
  const number = (v: unknown, min:number,max:number) => typeof v === 'number' && Number.isFinite(v) && v>=min && v<=max;
  const s=d.styles;
  if (!['primary','secondary','background','text'].every(k=>color(s[k as keyof SiteStyles])) || !fonts.includes(s.headingFont as typeof fonts[number]) || !fonts.includes(s.bodyFont as typeof fonts[number]) || !number(s.radius,0,48) || !number(s.spacing,8,120) || !['solid','outline'].includes(s.button) || !['split','center'].includes(s.header) || !['simple','expanded'].includes(s.footer)) return fail('Revisa los colores, las fuentes y los espacios del sitio.');
  if (contrast(s.text,s.background)<4.5 || contrast(s.primary,s.background)<4.5) return fail('Aumenta el contraste del texto y del color principal sobre el fondo (mínimo 4,5:1).');
  const ids=new Set<string>();
  for (const b of d.blocks) {
    if (!b || !/^[\w-]{1,80}$/.test(b.id) || ids.has(b.id) || !Object.hasOwn(blockTypes,b.type)) return fail('Hay un bloque no válido o repetido.');
    ids.add(b.id);
    if (!['title','text','image','alt','link'].every(k=>typeof b[k as keyof Block]==='string' && (b[k as keyof Block] as string).length<=5000)) return fail('Los textos de cada bloque admiten hasta 5.000 caracteres.');
    if (!safeUrl(b.image,true) || !safeUrl(b.link) || !color(b.color,true) || !color(b.background,true) || !(b.font==='' || fonts.includes(b.font as typeof fonts[number])) || !number(b.size,16,96) || !number(b.spacing,0,120) || !number(b.border,0,8) || !['left','center','right'].includes(b.align) || typeof b.mobile!=='boolean' || typeof b.tablet!=='boolean' || !(b.fit===undefined || b.fit==='cover' || b.fit==='contain')) return fail(`Revisa las direcciones y los estilos del bloque «${b.title || blockTypes[b.type]}». Usa imágenes locales o direcciones HTTPS.`);
    if (contrast(b.color || s.text,b.background || s.background)<4.5) return fail(`El texto del bloque «${b.title}» necesita un contraste mínimo de 4,5:1.`);
    if (['image','hero','section','gallery'].includes(b.type) && !b.alt.trim()) return fail(`Describe la imagen del bloque «${b.title}».`);
    if (b.items!==undefined && (!Array.isArray(b.items) || b.items.length>12 || b.items.some(item=>!item || !['title','text','image','alt'].every(k=>typeof item[k as keyof BlockItem]==='string' && item[k as keyof BlockItem].length<=5000) || !safeUrl(item.image,true) || !item.alt.trim()))) return fail(`Revisa las tarjetas del bloque «${b.title}». Admite hasta 12 elementos con imagen y descripción.`);
  }
  // Keep only the supported schema: no arbitrary HTML, CSS or executable properties.
  const styles = Object.fromEntries(Object.keys(newDocument(d.template).styles).map(k=>[k,s[k as keyof SiteStyles]])) as SiteStyles;
  const keys=Object.keys(newBlock('text','x')) as (keyof Block)[];
  return { schema:1, template:d.template, styles, blocks:d.blocks.map(b=>({...Object.fromEntries(keys.filter(k=>k!=='items').map(k=>[k,b[k]])),...(b.items?{items:b.items.map(item=>({title:item.title,text:item.text,image:item.image,alt:item.alt}))}:{})}) as Block) };
}
