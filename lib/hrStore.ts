import 'server-only';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HrStorageError } from './hrErrors';
import { initialHrState, type HrState } from './hr';

const remote = process.env.HR_STORAGE === 'supabase' || (!!process.env.VERCEL && process.env.HR_STORAGE !== 'local');
let admin: SupabaseClient | undefined;
function database() {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !key) throw new HrStorageError('El almacenamiento de Recursos humanos no está configurado. Contacta con administración para activarlo.');
  admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}
function storageFailure(error: { code?: string; message?: string }): never {
  console.error('RRHH storage:', error.code || 'unavailable');
  if (error.code === '42P01' || error.code === 'PGRST205') throw new HrStorageError('Falta activar el almacenamiento de Recursos humanos. Contacta con administración para completar la configuración.');
  throw new HrStorageError('No se pudo acceder al almacenamiento de Recursos humanos. Revisa la conexión y la configuración de Supabase.');
}
async function readRemote() {
  const db = database();
  let result = await db.from('rrhh_state').select('payload,revision').eq('id', 'main').maybeSingle();
  if (result.error) storageFailure(result.error);
  if (!result.data) {
    const seed = await db.from('rrhh_state').upsert({ id: 'main', payload: initialHrState(), revision: 0 }, { onConflict: 'id', ignoreDuplicates: true });
    if (seed.error) storageFailure(seed.error);
    result = await db.from('rrhh_state').select('payload,revision').eq('id', 'main').single();
    if (result.error) storageFailure(result.error);
  }
  if (!result.data || !['employees', 'candidates', 'files', 'attendance', 'vacations', 'evaluations'].every((key) => Array.isArray(result.data!.payload?.[key]))) throw new HrStorageError('Los datos de RRHH necesitan una revisión. No se han sobrescrito.');
  return { state: result.data.payload as HrState, revision: result.data.revision as number };
}

export const HR_DIR = process.env.HR_DATA_DIR || path.join(process.cwd(), '.data', 'rrhh');
const statePath = path.join(HR_DIR, 'state.json');
// Comparte la cola entre las rutas y las recargas del servidor de desarrollo.
const shared = globalThis as typeof globalThis & { crmHrQueue?: Promise<unknown> };

async function readState(): Promise<HrState> {
  try { return JSON.parse(await readFile(statePath, 'utf8')); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    const state = initialHrState();
    await saveState(state);
    return state;
  }
}
async function saveState(state: HrState) {
  await mkdir(HR_DIR, { recursive: true });
  const temporary = `${statePath}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(state, null, 2));
  await rename(temporary, statePath);
}
export function updateHr(change: (state: HrState) => void | Promise<void>) {
  const result = (shared.crmHrQueue || Promise.resolve()).then(async () => {
    if (remote) {
      const { state, revision } = await readRemote();
      await change(state);
      const result = await database().from('rrhh_state').update({ payload: state, revision: revision + 1 }).eq('id', 'main').eq('revision', revision).select('id').maybeSingle();
      if (result.error) storageFailure(result.error);
      if (!result.data) throw new HrStorageError('Otro usuario ha actualizado RRHH. Recarga los datos y vuelve a guardar tus cambios.', 409);
      return state;
    }
    const state = await readState();
    await change(state);
    await saveState(state);
    return state;
  });
  shared.crmHrQueue = result.catch(() => undefined);
  return result;
}
export async function getHr() {
  await shared.crmHrQueue;
  return remote ? (await readRemote()).state : readState();
}

export async function writeHrFile(id: string, bytes: Uint8Array, mime = 'application/pdf') {
  if (remote) {
    const { error } = await database().storage.from('rrhh-private').upload(id, bytes, { contentType: mime, upsert: false });
    if (error) throw new HrStorageError('No se pudo guardar el documento de Recursos humanos. Contacta con administración para revisar el almacenamiento.');
    return;
  }
  await mkdir(HR_DIR, { recursive: true });
  await writeFile(path.join(HR_DIR, id), bytes);
}
export async function readHrFile(id: string) {
  if (remote) {
    const { data, error } = await database().storage.from('rrhh-private').download(id);
    if (error || !data) throw new HrStorageError('No se pudo recuperar el documento de Recursos humanos.', 404);
    return Buffer.from(await data.arrayBuffer());
  }
  return readFile(path.join(HR_DIR, id));
}
