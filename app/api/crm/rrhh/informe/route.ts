import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getHr } from '@/lib/hrStore';
import { CANDIDATE_STAGES } from '@/lib/hr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (request.cookies.get('lmp_crm_session')?.value !== (process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1')) return new NextResponse('No autorizado', { status: 401 });
  const state = await getHr();
  const pdf = await PDFDocument.create();
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const clean = (s: string) => s.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, ' ');
  const stamp = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
  let page = pdf.addPage([595, 842]); let y = 748;
  function header() {
    page.drawRectangle({ x: 0, y: 790, width: 595, height: 52, color: rgb(0.145, 0.388, 0.922) });
    page.drawText('La Mesa Perfecta | Recursos humanos', { x: 42, y: 810, size: 14, font: bold, color: rgb(1, 1, 1) });
    page.drawText(`Informe de actividad - ${stamp}`, { x: 42, y: 768, size: 10, font: normal, color: rgb(0.4, 0.4, 0.4) });
  }
  header();
  function room(height: number) {
    if (y - height < 55) { page = pdf.addPage([595, 842]); y = 748; header(); }
  }
  function line(value: string, heading = false) {
    const font = heading ? bold : normal; const size = heading ? 12 : 10;
    const paragraphs = clean(value).split('\n');
    for (const paragraph of paragraphs) {
      let row = '';
      function draw() {
        if (y < 55) { page = pdf.addPage([595, 842]); y = 748; header(); }
        page.drawText(row, { x: 42, y, size, font, color: rgb(0.1, 0.13, 0.18) }); y -= heading ? 24 : 17;
      }
      for (const word of paragraph.split(' ')) {
        // Divide también cadenas largas como correos y nombres de archivos.
        for (const part of word.match(/.{1,65}/g) || ['']) {
          if (row && font.widthOfTextAtSize(`${row} ${part}`, size) > 510) { draw(); row = ''; }
          row += `${row ? ' ' : ''}${part}`;
        }
      }
      draw();
    }
  }
  function section(title: string) { room(80); y -= 16; line(title, true); }
  line('Proyecto de clase: módulo RRHH integrado en el CRM propio.');
  line('Este informe documenta el simulador. No acredita una instancia de Odoo Online.');
  section('1. Fichas de empleados');
  for (const e of state.employees) line(`${e.name} | ${e.role} | ${e.department} | ${e.email} | Alta: ${e.startDate} | Foto: ${e.photoId ? 'subida' : 'sin foto'}`);
  section('2. Horarios y vacaciones');
  if (!state.attendance.length) line('Sin fichajes registrados.');
  for (const a of state.attendance) line(`${state.employees.find((e) => e.id === a.employeeId)?.name} | Entrada: ${new Date(a.in).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })} | Salida: ${a.out ? new Date(a.out).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }) : 'jornada abierta'}`);
  if (!state.vacations.length) line('Sin solicitudes de vacaciones.');
  for (const v of state.vacations) line(`${state.employees.find((e) => e.id === v.employeeId)?.name} | ${v.start} a ${v.end} | ${v.status} | ${v.reason}`);
  section('3. Tareas de incorporación');
  for (const e of state.employees) { room(24 + e.checklist.length * 17); line(e.name, true); for (const c of e.checklist) line(`${c.done ? '[Completada]' : '[Pendiente]'} ${c.title}`); }
  section('4. Selección y contratación');
  if (!state.candidates.length) line('Sin candidaturas registradas.');
  for (const c of state.candidates) line(`${c.name} | ${c.role} | ${CANDIDATE_STAGES[c.stage]} | CV: ${c.cvId ? 'subido' : 'pendiente'}${c.employeeId ? ` | Ficha creada: ${state.employees.find((e) => e.id === c.employeeId)?.email}` : ''}`);
  line('El correo corporativo es un dato de la ficha; no se crea un buzón de correo externo.');
  section('5. Evaluaciones trimestrales');
  if (!state.evaluations.length) line('Sin evaluaciones registradas.');
  for (const e of state.evaluations) line(`${state.employees.find((x) => x.id === e.employeeId)?.name} | ${e.quarter} | Nota: ${e.score}/5 | ${e.comment}`);
  section('6. Nóminas PDF y firma');
  const files = state.files.filter((f) => f.kind === 'payroll');
  if (!files.length) line('Sin nóminas subidas.');
  for (const f of files) line(`${state.employees.find((e) => e.id === f.employeeId)?.name} | ${f.name} | ${f.signedAt ? `Conformidad de ${f.signer} el ${new Date(f.signedAt).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}` : 'Pendiente de firma'}`);
  line('Firma de simulación sin certificado digital. Se conserva el original y se genera una copia con el registro de conformidad.');
  for (const [i, p] of pdf.getPages().entries()) p.drawText(`${i + 1} / ${pdf.getPageCount()}`, { x: 520, y: 28, size: 9, font: normal, color: rgb(0.5, 0.5, 0.5) });
  return new NextResponse(new Uint8Array(await pdf.save()), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="informe-rrhh.pdf"', 'Cache-Control': 'private, no-store' } });
}
