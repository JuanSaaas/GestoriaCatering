import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile, link, unlink, stat } from 'node:fs/promises';
import path from 'node:path';

export const MAX_INVOICE_BYTES = 20 * 1024 * 1024;
export class InvoiceUploadError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function validateInvoiceFile(name: string, bytes: Buffer) {
  if (!bytes.length) throw new InvoiceUploadError('El archivo está vacío. Selecciona una factura con contenido.');
  if (bytes.length > MAX_INVOICE_BYTES) throw new InvoiceUploadError('La factura supera los 20 MB. Reduce su tamaño e inténtalo de nuevo.', 413);
  const extension = path.extname(name).toLowerCase();
  const valid = extension === '.pdf' ? bytes.subarray(0, 5).toString() === '%PDF-'
    : ['.jpg', '.jpeg'].includes(extension) ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : extension === '.png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : extension === '.webp' ? bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP'
    : false;
  if (!valid) throw new InvoiceUploadError('Selecciona un PDF o una imagen JPG, PNG o WebP válida. La extensión debe coincidir con su contenido.');
  return extension;
}

export async function saveInvoiceUpload(name: string, bytes: Buffer) {
  const extension = validateInvoiceFile(name, bytes);
  const sha = createHash('sha256').update(bytes).digest('hex');
  const original = name.replace(/\\/g, '/').split('/').pop() || 'factura';
  const stem = path.basename(original, path.extname(original)).normalize('NFKC').replace(/[^\p{L}\p{N}_-]+/gu, '-').slice(0, 80).replace(/^-+|-+$/g, '') || 'factura';
  const directory = path.resolve(process.env.FACTURAS_INPUT_DIR || '.data/facturas/entrada');
  const filename = `${stem}-${sha}${extension}`;
  const destination = path.join(directory, filename);
  const temporary = path.join(directory, `.subida-${randomUUID()}.part`);
  try {
    await mkdir(directory, { recursive: true });
    await writeFile(temporary, bytes, { flag: 'wx', mode: 0o600 });
    let duplicate = false;
    try { await link(temporary, destination); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      duplicate = true;
    }
    const saved = await stat(destination);
    if (!saved.isFile() || saved.size !== bytes.length) throw new Error('No se pudo confirmar el archivo.');
    return { nombre: original, archivo: filename, bytes: saved.size, duplicada: duplicate };
  } catch {
    throw new InvoiceUploadError('No se pudo guardar la factura en la carpeta de entrada. Comprueba el espacio y los permisos e inténtalo de nuevo.', 503);
  } finally {
    await unlink(temporary).catch(() => {});
  }
}
