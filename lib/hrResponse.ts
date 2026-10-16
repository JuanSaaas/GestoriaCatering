import type { HrState } from './hr';

export async function readHrResponse(response: Response): Promise<HrState> {
  if (response.status === 401) throw new Error('Tu sesión ha caducado. Vuelve a iniciar sesión para acceder a Recursos humanos.');
  const fallback = 'No se pudo completar la petición de Recursos humanos. Vuelve a intentarlo en unos minutos.';
  const result = await response.json().catch(() => { throw new Error(fallback); });
  if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : fallback);
  const keys = ['employees', 'candidates', 'files', 'attendance', 'vacations', 'evaluations'];
  if (!result || !keys.every((key) => Array.isArray(result[key]))) throw new Error(fallback);
  return result as HrState;
}
