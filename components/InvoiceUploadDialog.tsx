'use client';

import { useRef, useState } from 'react';
import { useDialog } from './useDialog';
import { btnGhost, btnPrimary, inputCls, labelCls } from './ui';
import ValidatedForm from './ValidatedForm';

type Result = { nombre: string; mensaje: string; ok: boolean };
export default function InvoiceUploadDialog({ onClose, onUploaded }: { onClose: () => void; onUploaded: (count: number) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [progress, setProgress] = useState('');
  const pending = useRef(false);
  const picker = useRef<HTMLInputElement>(null);
  const dialog = useDialog<HTMLDivElement>(() => { if (!pending.current) onClose(); });

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setError('');
    if (!files.length) { setError('Selecciona al menos una factura.'); picker.current?.focus(); return; }
    if (files.length > 10) { setError('Selecciona un máximo de 10 facturas cada vez.'); picker.current?.focus(); return; }
    const invalid = files.find(file => !/\.(pdf|jpe?g|png|webp)$/i.test(file.name) || !file.size || file.size > 20 * 1024 * 1024);
    if (invalid) { setError(`«${invalid.name}» debe ser un PDF o una imagen JPG, PNG o WebP con contenido y un máximo de 20 MB.`); picker.current?.focus(); return; }
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pending.current = true; setBusy(true); setResults([]);
    const finished: Result[] = [];
    const failed: File[] = [];
    try {
      for (const [index, file] of files.entries()) {
        setProgress(`Subiendo ${index + 1} de ${files.length}: ${file.name}`);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 45000);
        try {
          const body = new FormData(); body.append('archivo', file);
          const response = await fetch('/api/crm/facturas/subir', { method: 'POST', body, signal: controller.signal });
          const result = await response.json().catch(() => { throw new Error(response.status === 413 ? 'El servidor no admite un archivo de este tamaño. Reduce su tamaño e inténtalo de nuevo.' : 'No se pudo confirmar la subida. Puedes reintentar sin sobrescribir el original.'); });
          if (!response.ok || result.ok !== true) throw new Error(result.error || 'No se pudo guardar el archivo.');
          finished.push({ nombre: file.name, ok: true, mensaje: result.duplicada ? '✓ Ya estaba guardada en la carpeta de entrada.' : '✓ Guardada en la carpeta de entrada. Pendiente de lectura.' });
        } catch (failure) {
          failed.push(file);
          finished.push({ nombre: file.name, ok: false, mensaje: `⚠ ${failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'No se pudo confirmar la subida a tiempo. Reintenta; se comprobará si ya está guardada.'}` });
        } finally { clearTimeout(timer); }
        setResults([...finished]);
      }
      setFiles(failed);
      if (!failed.length && picker.current) picker.current.value = '';
      if (failed.length) setError('No se pudieron guardar todas las facturas. Se conservan las pendientes para reintentarlas.');
      const count = finished.filter(result => result.ok).length;
      if (count) onUploaded(count);
      setProgress(failed.length ? `${count} de ${finished.length} facturas guardadas.` : `✓ ${count} ${count === 1 ? 'factura subida. Pendiente' : 'facturas subidas. Pendientes'} de lectura.`);
    } finally {
      pending.current = false; setBusy(false);
      requestAnimationFrame(() => { if (trigger?.isConnected && !dialog.current?.contains(document.activeElement)) trigger.focus(); });
    }
  }

  return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={event => { if (event.target === event.currentTarget && !pending.current) onClose(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="invoice-upload-title" tabIndex={-1} className="w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6"><h2 id="invoice-upload-title" className="text-xl font-semibold">Subir facturas</h2><button type="button" className={btnGhost} disabled={busy} onClick={onClose}>Cerrar</button></div>
      <ValidatedForm showRequiredHint={false} onSubmit={upload} className="space-y-4" aria-busy={busy}>
        <div><label htmlFor="invoice-files" className={labelCls}>Facturas *</label>
          <input ref={picker} id="invoice-files" type="file" required multiple accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={busy} className={inputCls} aria-invalid={!!error} aria-describedby={`invoice-upload-help${error ? ' invoice-upload-error' : ''}`} onChange={event => { setFiles(Array.from(event.target.files || [])); setResults([]); setError(''); setProgress(''); }} />
          <p id="invoice-upload-help" className="mt-2 text-neutral-600">PDF, JPG, PNG o WebP · Hasta 20 MB por archivo · Máximo 10 archivos.</p>
          {error && <p id="invoice-upload-error" role="alert" className="mt-2 text-red-700">⚠ {error}</p>}
        </div>
        <p role="status" className="text-neutral-700">{progress}</p>
        {results.some(result => !result.ok) && <ul aria-label="Resultado de la subida" className="space-y-3">{results.filter(result => !result.ok).map((result, index) => <li key={index} className="border border-neutral-400 rounded-lg p-4 break-words"><p className="font-medium">{result.nombre}</p><p className="mt-2">{result.mensaje}</p></li>)}</ul>}
        <button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Subiendo facturas…' : error && files.length ? 'Reintentar subida' : 'Guardar facturas'}</button>
      </ValidatedForm>
    </div>
  </div>;
}
