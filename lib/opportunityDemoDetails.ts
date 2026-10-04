import type { FranjaHoraria, Oportunidad } from './types';

type EventDetails = {
  franja_horaria: FranjaHoraria;
  ubicacion_evento: string;
};

// Datos del simulador, limitados a las oportunidades de ejemplo existentes.
const DEMO_EVENT_DETAILS: Record<string, EventDetails> = {
  '96c24f79-bc2c-4ba3-a3a6-391a2fde18c1': { franja_horaria: 'tarde', ubicacion_evento: 'Espacio de eventos PJ, Madrid' },
  '49e3e2c3-7516-485f-a9c4-d349b44d1b8c': { franja_horaria: 'mediodia', ubicacion_evento: 'Restaurante Los Olivos, Madrid' },
  '2a65dc16-3f3c-4b36-b141-6c0b6ccba4df': { franja_horaria: 'tarde', ubicacion_evento: 'Salon de celebraciones El Jardin, Madrid' },
  '382f4907-518a-44bd-ac18-cab23b399679': { franja_horaria: 'todo_el_dia', ubicacion_evento: 'Finca Los Almendros, Toledo' },
  'f74ad79c-2135-4d0b-adda-52099772a5ba': { franja_horaria: 'mediodia', ubicacion_evento: 'Centro de negocios Castellana, Madrid' },
  'df059919-dce3-4482-b7a3-d1ea498efaec': { franja_horaria: 'tarde', ubicacion_evento: 'Salon Las Rosas, Getafe' },
  'd72dc7e3-c85b-4ccb-80f1-73198e2fdbae': { franja_horaria: 'todo_el_dia', ubicacion_evento: 'Centro de convenciones Norte, Madrid' },
  '9f7898c5-23af-4b27-8926-3c1b8292ff72': { franja_horaria: 'noche', ubicacion_evento: 'Restaurante La Terraza, Madrid' },
  '008ac72a-9047-414c-b980-198781b875de': { franja_horaria: 'tarde', ubicacion_evento: 'Espacio empresarial Las Tablas, Madrid' },
  'ddf17837-91d3-42c8-ab24-37bcdbc16cd1': { franja_horaria: 'mediodia', ubicacion_evento: 'Finca El Encinar, Alcobendas' },
  'a4d93565-3bde-4a30-8d9a-3673e1ace56c': { franja_horaria: 'tarde', ubicacion_evento: 'Auditorio empresarial Retiro, Madrid' },
  '5f5c2264-7129-4463-8c5e-e2a78a4ae8d9': { franja_horaria: 'noche', ubicacion_evento: 'Restaurante El Mirador, Madrid' },
  '46434043-90d7-4080-ac14-47b287337b43': { franja_horaria: 'mediodia', ubicacion_evento: 'Centro de negocios Pozuelo, Madrid' },
  '7ea6b3b8-c8c3-4a57-a7bd-2e1ea1ffd695': { franja_horaria: 'tarde', ubicacion_evento: 'Salon de eventos Alameda, Leganes' },
  'f93dd54c-fc8b-4926-a297-fdb98757a286': { franja_horaria: 'todo_el_dia', ubicacion_evento: 'Finca La Arboleda, Segovia' },
  '066557f2-80d1-4850-9270-44781514db8a': { franja_horaria: 'mediodia', ubicacion_evento: 'Sala de reuniones de Fernandez Asociados, Madrid' },
  '51d885e0-975b-4998-9072-caa31c8dc6b5': { franja_horaria: 'todo_el_dia', ubicacion_evento: 'Finca Las Encinas, Madrid' },
  '24c492cb-b2ca-475d-a839-065d67173373': { franja_horaria: 'tarde', ubicacion_evento: 'Showroom de Inmobiliaria Norte, Madrid' },
  '7adc40c3-e168-4a6f-b739-ebe0d4f4f534': { franja_horaria: 'mediodia', ubicacion_evento: 'Auditorio de TechSolutions, Madrid' },
  '77ceaef3-18c2-46ac-a9e0-5c7fb9cc0c3d': { franja_horaria: 'tarde', ubicacion_evento: 'Sala de eventos de Inditex, Madrid' },
  '5311b74d-978e-4763-8159-7395e2fb51ef': { franja_horaria: 'mediodia', ubicacion_evento: 'Restaurante El Soto, Madrid' },
  'a5cf70cd-658b-43e1-88b7-03791ac428da': { franja_horaria: 'noche', ubicacion_evento: 'Restaurante La Huerta, Madrid' },
  '2d2f4bf2-a119-481b-8877-bde67c564a6a': { franja_horaria: 'mediodia', ubicacion_evento: 'Sala de conferencias de GFT, Madrid' },
  '86d359f0-ad30-45e0-a920-5de95f7fb06d': { franja_horaria: 'tarde', ubicacion_evento: 'Oficinas de Alonso Marketing, Madrid' },
};

export function eventDetails(oportunidad: Oportunidad) {
  const demo = DEMO_EVENT_DETAILS[oportunidad.id];
  return {
    franja_horaria: oportunidad.franja_horaria || demo?.franja_horaria,
    ubicacion_evento: oportunidad.ubicacion_evento?.trim() || demo?.ubicacion_evento,
  };
}
