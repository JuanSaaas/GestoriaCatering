type DatabaseError = { code?: string; message: string };
type Payload = Record<string, unknown>;

const EVENT_FIELDS: Record<string, string> = {
  franja_horaria: 'Franja horaria',
  ubicacion_evento: 'Ubicación del evento',
  restricciones: 'Restricciones alimentarias o alergias',
  como_nos_conocio: 'Cómo nos conoció',
};
const LABELS: Record<string, string> = {
  mediodia: 'Mediodía', tarde: 'Tarde', noche: 'Noche', todo_el_dia: 'Todo el día',
  instagram: 'Instagram', facebook: 'Facebook', google: 'Buscador (Google)',
  recomendacion: 'Recomendación de alguien', evento_anterior: 'Ya nos conocía de otro evento', otro: 'Otro',
};

/** Retry only a rejected missing-column request; keep event answers in the CRM message. */
export async function saveFormRecord<T>(
  table: 'clientes' | 'oportunidades',
  original: Payload,
  write: (payload: Payload) => PromiseLike<{ data: T | null; error: DatabaseError | null }>,
) {
  let payload = { ...original };
  const omitted = new Set<string>();
  for (;;) {
    const result = await write(payload);
    if (!result.error) return result;
    const { code, message } = result.error;
    if (code !== '42703' && code !== 'PGRST204') return result;
    const column = code === 'PGRST204'
      ? message.match(/Could not find the ['"]([^'"]+)['"] column/)?.[1]
      : message.match(/column (?:[\w]+\.)?["']?([\w]+)["']? does not exist/)?.[1];
    const allowed = table === 'clientes' ? column === 'empresa_id' : !!column && column in EVENT_FIELDS;
    if (!column || !allowed || omitted.has(column) || !(column in payload)) return result;
    omitted.add(column);
    delete payload[column];
    if (table === 'oportunidades') {
      const details = Object.entries(EVENT_FIELDS)
        .filter(([key]) => omitted.has(key) && original[key] !== null && original[key] !== '')
        .map(([key, label]) => `${label}: ${LABELS[String(original[key])] || String(original[key])}`);
      payload.mensaje = [original.mensaje, details.length ? `Datos del evento:\n${details.join('\n')}` : ''].filter(Boolean).join('\n\n');
    }
    // clientes.empresa preserves the company name even on schemas without empresa_id.
  }
}
