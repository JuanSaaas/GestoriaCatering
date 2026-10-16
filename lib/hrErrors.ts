export class HrStorageError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}

export function hrErrorMessage(error: unknown, fallback: string) {
  if (error instanceof HrStorageError) return error.message;
  const code = (error as NodeJS.ErrnoException)?.code;
  if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
    return 'No se puede guardar RRHH en el disco del servidor. Configura su almacenamiento persistente en Supabase.';
  }
  if (error instanceof SyntaxError) return 'No se pudieron leer los datos guardados de RRHH. Contacta con administración para revisarlos.';
  return fallback;
}
