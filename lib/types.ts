export type TipoCliente = 'particular' | 'empresa';

export type TipoEvento = 'boda' | 'corporativo' | 'comunion' | 'cumpleanos' | 'otro';

export type EstadoOportunidad =
  | 'nuevo'
  | 'contactado'
  | 'presupuesto_enviado'
  | 'negociacion'
  | 'ganado'
  | 'perdido';

export interface Usuario {
  id: string;
  created_at: string;
  nombre: string;
  email: string;
  rol: string;
}

export interface Cliente {
  id: string;
  created_at: string;
  tipo_cliente: TipoCliente;
  nombre: string;
  empresa: string | null;
  email: string;
  telefono: string | null;
}

export interface Oportunidad {
  id: string;
  created_at: string;
  updated_at: string;
  cliente_id: string;
  comercial_id: string | null;
  tipo_evento: TipoEvento;
  tipo_evento_otro: string | null;
  fecha_evento: string | null;
  num_invitados: number | null;
  presupuesto_estimado: number | null;
  mensaje: string | null;
  estado: EstadoOportunidad;
  origen: string;
  // Viene de un JOIN (select('*, cliente:clientes(*)')), no es una columna propia
  cliente: Cliente;
}

export interface Tarea {
  id: string;
  created_at: string;
  oportunidad_id: string;
  usuario_id: string | null;
  titulo: string;
  fecha_limite: string | null;
  completada: boolean;
}

export interface Nota {
  id: string;
  created_at: string;
  oportunidad_id: string;
  contenido: string;
}

// Se rellena sola mediante un trigger en Supabase; no hay UI todavía
// para consultarla, pero el tipo queda listo para cuando se use
// (por ejemplo, una línea de tiempo o un gráfico de embudo).
export interface HistorialEstado {
  id: string;
  oportunidad_id: string;
  usuario_id: string | null;
  estado_anterior: EstadoOportunidad | null;
  estado_nuevo: EstadoOportunidad;
  changed_at: string;
}

export const ESTADOS: { key: EstadoOportunidad; label: string; color: string }[] = [
  { key: 'nuevo', label: 'Nuevo lead', color: '#B8873B' },
  { key: 'contactado', label: 'Contactado', color: '#8A6D3B' },
  { key: 'presupuesto_enviado', label: 'Presupuesto enviado', color: '#7A5C9E' },
  { key: 'negociacion', label: 'Negociación', color: '#7A1F2B' },
  { key: 'ganado', label: 'Ganado', color: '#4B5E45' },
  { key: 'perdido', label: 'Perdido', color: '#8A8178' },
];

export const TIPO_EVENTO_LABEL: Record<TipoEvento, string> = {
  boda: 'Boda',
  corporativo: 'Corporativo',
  comunion: 'Comunión',
  cumpleanos: 'Cumpleaños',
  otro: 'Otro',
};
