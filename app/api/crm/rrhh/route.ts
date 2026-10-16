import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { applyHrAction, validateSigner, type HrFile } from '@/lib/hr';
import { getHr, updateHr, HR_DIR } from '@/lib/hrStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
function authorized(request: NextRequest) {
  return request.cookies.get('lmp_crm_session')?.value === (process.env.CRM_SESSION_TOKEN || 'lmp-crm-session-v1');
}
function denied() { return NextResponse.json({ error: 'Inicia sesión para acceder a RRHH.' }, { status: 401 }); }

export async function GET(request: NextRequest) {
  if (!authorized(request)) return denied();
  return NextResponse.json(await getHr(), { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: NextRequest) {
  if (!authorized(request)) return denied();
  try {
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      if (Number(request.headers.get('content-length')) > 6 * 1024 * 1024) throw new Error('El archivo supera los 5 MB.');
      const form = await request.formData();
      const file = form.get('file'); const kind = String(form.get('kind')); const ownerId = String(form.get('ownerId'));
      if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024) throw new Error('Selecciona un archivo de hasta 5 MB.');
      const bytes = Buffer.from(await file.arrayBuffer());
      const isPdf = bytes.subarray(0, 5).toString() === '%PDF-';
      const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const isJpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      if (kind === 'photo' ? !isPng && !isJpeg : !isPdf) throw new Error(kind === 'photo' ? 'La foto debe ser PNG o JPG.' : 'El documento debe ser un PDF.');
      if (kind !== 'photo' && kind !== 'cv' && kind !== 'payroll') throw new Error('Tipo de archivo no válido.');
      if (isPdf) await PDFDocument.load(bytes);
      const state = await updateHr(async (state) => {
        if (kind === 'cv' && form.get('createCandidate') === 'true') {
          applyHrAction(state, { type: 'candidate', name: form.get('name'), email: form.get('email'), role: form.get('role'), department: form.get('department') });
        }
        const owner = kind === 'cv' ? (form.get('createCandidate') === 'true' ? state.candidates[0] : state.candidates.find((c) => c.id === ownerId)) : state.employees.find((e) => e.id === ownerId);
        if (!owner) throw new Error('No se encontró la ficha.');
        const record: HrFile = { id: crypto.randomUUID(), name: file.name.slice(0, 200), mime: kind === 'photo' ? (isPng ? 'image/png' : 'image/jpeg') : 'application/pdf', kind, createdAt: new Date().toISOString(), ...(kind === 'payroll' ? { employeeId: ownerId } : {}) };
        await writeFile(path.join(HR_DIR, record.id), bytes);
        state.files.push(record);
        if (kind === 'photo' && 'checklist' in owner) owner.photoId = record.id;
        if (kind === 'cv' && 'stage' in owner) owner.cvId = record.id;
      });
      return NextResponse.json(state);
    }
    const action = await request.json();
    if (!action || typeof action !== 'object' || Array.isArray(action)) throw new Error('Solicitud no válida.');
    const state = await updateHr(async (state) => {
      if (action.type !== 'sign') return applyHrAction(state, action);
      const file = state.files.find((f) => f.id === action.id && f.kind === 'payroll');
      const employee = state.employees.find((e) => e.id === file?.employeeId);
      if (!file || !employee || file.signedAt) throw new Error('Documento no disponible para firmar.');
      const signer = validateSigner(action.signer, action.accepted);
      const pdf = await PDFDocument.load(await readFile(path.join(HR_DIR, file.id)));
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const page = pdf.addPage([595, 842]);
      const signedAt = new Date().toISOString();
      const lines = ['La Mesa Perfecta | Recursos humanos', 'Registro de conformidad', `Empleado: ${employee.name}`, `Firmante: ${signer}`, `Fecha: ${new Date(signedAt).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`, `Documento: ${file.name}`, `Referencia: ${file.id}`, 'Conformidad registrada en el simulador de CRM.', 'Firma de simulacion. Sin certificado digital.'];
      let y = 780;
      for (const line of lines) {
        const words = line.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '?').split(' ');
        let row = '';
        for (const word of words) {
          if (font.widthOfTextAtSize(`${row} ${word}`, 12) > 480) { page.drawText(row, { x: 50, y, size: 12, font, color: rgb(0.1, 0.15, 0.2) }); y -= 20; row = ''; }
          row += `${row ? ' ' : ''}${word}`;
        }
        page.drawText(row, { x: 50, y, size: 12, font }); y -= 35;
      }
      const signedId = crypto.randomUUID();
      await writeFile(path.join(HR_DIR, signedId), await pdf.save());
      Object.assign(file, { signedId, signedAt, signer });
    });
    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo guardar el cambio.' }, { status: 400 });
  }
}
