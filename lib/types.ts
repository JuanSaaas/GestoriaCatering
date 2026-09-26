export type TipoCliente = 'particular' | 'empresa';

export type TipoEvento = 'boda' | 'corporativo' | 'comunion' | 'cumpleanos' | 'otro';

export type EstadoOportunidad =
  | 'nuevo'
  | 'contactado'
  | 'presupuesto_enviado'
  | 'negociacion'
  | 'ganado'
  | 'perdido';

// Empleado del equipo (tabla `usuarios`): es quien lleva cada oportunidad.
export interface Usuario {
  id: string;
  created_at: string;
  nombre: string;
  email: string;
  rol: string;
}

export type Empleado = Usuario;

export interface Empresa {
  id: string;
  created_at: string;
  nombre: string;
  cif: string | null;
  sector: string | null;
  ciudad: string | null;
  email: string | null;
  telefono: string | null;
  sitio_web: string | null;
  logo_url: string | null;
}

export interface Cliente {
  id: string;
  created_at: string;
  tipo_cliente: TipoCliente;
  nombre: string;
  empresa: string | null;
  empresa_id: string | null;
  cargo: string | null;
  email: string;
  telefono: string | null;
  empresa_rel?: Empresa | null;
}

export type FranjaHoraria = 'mediodia' | 'tarde' | 'noche' | 'todo_el_dia';

export interface Oportunidad {
  id: string;
  created_at: string;
  updated_at: string;
  cliente_id: string;
  comercial_id: string | null; // empleado responsable
  empresa_id: string | null; // empresa asociada
  tipo_evento: TipoEvento;
  tipo_evento_otro: string | null;
  fecha_evento: string | null;
  franja_horaria: FranjaHoraria | null;
  ubicacion_evento: string | null;
  num_invitados: number | null;
  presupuesto_estimado: number | null;
  restricciones: string | null;
  como_nos_conocio: string | null;
  mensaje: string | null;
  estado: EstadoOportunidad;
  origen: string;
  // Vienen de un JOIN (select('*, cliente:clientes(*), empresa:empresas(*), comercial:usuarios(*)')),
  // no son columnas propias de la tabla.
  cliente: Cliente;
  empresa: Empresa | null;
  comercial: Empleado | null;
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
  { key: 'nuevo', label: 'En espera', color: '#B3781A' },
  { key: 'contactado', label: 'Contactado', color: '#35618F' },
  { key: 'presupuesto_enviado', label: 'Presupuesto enviado', color: '#7A1F2B' },
  { key: 'negociacion', label: 'Negociación', color: '#8A5A1E' },
  { key: 'ganado', label: 'Ganado', color: '#2F7D4F' },
  { key: 'perdido', label: 'Perdido', color: '#737373' },
];

export const TIPO_EVENTO_LABEL: Record<TipoEvento, string> = {
  boda: 'Boda',
  corporativo: 'Corporativo',
  comunion: 'Comunión',
  cumpleanos: 'Cumpleaños',
  otro: 'Otro',
};

export const FRANJA_HORARIA_LABEL: Record<FranjaHoraria, string> = {
  mediodia: 'Mediodía',
  tarde: 'Tarde',
  noche: 'Noche',
  todo_el_dia: 'Todo el día',
};

export const ORIGEN_CONTACTO_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Buscador (Google)',
  recomendacion: 'Recomendación de alguien',
  evento_anterior: 'Ya nos conocía de otro evento',
  otro: 'Otro',
};

// Consulta estándar de oportunidades con su cliente, empresa y empleado asociados
export const OPORTUNIDAD_SELECT =
  '*, cliente:clientes(*), empresa:empresas(*), comercial:usuarios(*)';
