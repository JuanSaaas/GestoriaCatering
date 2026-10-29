import { TIPO_EVENTO_LABEL, type Oportunidad, type TipoEvento } from './types';

export type EventTypeSummary = {
  key: TipoEvento;
  label: string;
  n: number;
  estimatedAmount: number | null;
  descriptions: string[];
};

/** Every open opportunity belongs to one category, including legacy event types. */
export function summarizeEventTypes(opportunities: Oportunidad[]): EventTypeSummary[] {
  const groups: EventTypeSummary[] = (Object.keys(TIPO_EVENTO_LABEL) as TipoEvento[]).map((key) => ({
    key, label: TIPO_EVENTO_LABEL[key], n: 0, estimatedAmount: null, descriptions: [],
  }));
  for (const opportunity of opportunities) {
    if (['ganado', 'perdido'].includes(opportunity.estado)) continue;
    const group = groups.find((item) => item.key === opportunity.tipo_evento) || groups.find((item) => item.key === 'otro')!;
    group.n += 1;
    const amount = Number(opportunity.presupuesto_estimado);
    if (opportunity.presupuesto_estimado != null && Number.isFinite(amount)) group.estimatedAmount = (group.estimatedAmount ?? 0) + amount;
    if (group.key === 'otro') {
      const description = opportunity.tipo_evento_otro?.trim() ||
        (opportunity.tipo_evento && opportunity.tipo_evento !== 'otro' ? String(opportunity.tipo_evento).replace(/_/g, ' ') : '');
      if (description && !group.descriptions.includes(description)) group.descriptions.push(description);
    }
  }
  return groups;
}
