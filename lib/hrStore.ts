import 'server-only';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { initialHrState, type HrState } from './hr';

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
    const state = await readState();
    await change(state);
    await saveState(state);
    return state;
  });
  shared.crmHrQueue = result.catch(() => undefined);
  return result;
}
export function getHr() { return updateHr(() => undefined); }
