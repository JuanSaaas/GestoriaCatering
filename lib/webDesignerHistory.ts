import type { WebDocument, WebProject } from './webDesigner';

export type WebDraft = { name: string; document: WebDocument };
export type DraftHistory = { past: WebDraft[]; present: WebDraft; future: WebDraft[] };
const limit = 50;
export function draftOf(project: WebProject): WebDraft {
  return { name: project.name, document: project.document };
}
export function initialDraftHistory(present: WebDraft): DraftHistory {
  return { past: [], present, future: [] };
}
export function editDraft(history: DraftHistory, present: WebDraft): DraftHistory {
  if (JSON.stringify(history.present) === JSON.stringify(present)) return history;
  return { past: [...history.past, history.present].slice(-limit), present, future: [] };
}
export function undoDraft(history: DraftHistory): DraftHistory {
  if (!history.past.length) return history;
  return { past: history.past.slice(0, -1), present: history.past[history.past.length - 1], future: [history.present, ...history.future].slice(0, limit) };
}
export function redoDraft(history: DraftHistory): DraftHistory {
  if (!history.future.length) return history;
  return { past: [...history.past, history.present].slice(-limit), present: history.future[0], future: history.future.slice(1) };
}
