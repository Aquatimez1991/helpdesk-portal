export const STATUSES = ['Nueva', 'En análisis', 'En espera', 'Resuelta', 'Cerrada'] as const;
export const PRIORITIES = ['Crítica', 'Alta', 'Media', 'Baja'] as const;
export const KINDS = ['Incidente', 'Solicitud'] as const;
export const CATEGORIES = ['Phishing', 'Identidad y accesos', 'Malware', 'Vulnerabilidades', 'Protección de datos', 'Redes y perímetro', 'Consultoría de seguridad'] as const;
export type TicketStatus = typeof STATUSES[number];
export type Priority = typeof PRIORITIES[number];
export type TicketKind = typeof KINDS[number];
export interface Analyst { id: string; name: string; initials: string; role: string; color: string; }
export interface TicketEvent { id: string; at: string; actor: string; action: string; detail: string; }
export interface Ticket {
  id: string; title: string; description: string; kind: TicketKind; category: string;
  priority: Priority; status: TicketStatus; assigneeId: string; requester: string;
  requesterEmail: string; asset: string; evidence: string; createdAt: string;
  updatedAt: string; dueAt: string; resolvedAt: string | null; events: TicketEvent[];
}
export interface TicketDraft {
  title: string; description: string; kind: TicketKind; category: string;
  priority: Priority; assigneeId: string; requester: string; requesterEmail: string;
  asset: string; evidence: string;
}
export interface TicketUpdate { status: TicketStatus; priority: Priority; assigneeId: string; note: string; }
export const ANALYSTS: Analyst[] = [
  { id: 'ana', name: 'Ana Torres', initials: 'AT', role: 'Analista de ciberseguridad', color: 'teal' },
  { id: 'diego', name: 'Diego Mendoza', initials: 'DM', role: 'Respuesta a incidentes', color: 'blue' },
  { id: 'lucia', name: 'Lucía Ramírez', initials: 'LR', role: 'Identidad y accesos', color: 'purple' },
  { id: 'carlos', name: 'Carlos Vega', initials: 'CV', role: 'Seguridad de infraestructura', color: 'amber' },
];
export const CURRENT_ANALYST = ANALYSTS[0];
export const PRIORITY_HOURS: Record<Priority, number> = { 'Crítica': 4, Alta: 12, Media: 24, Baja: 72 };
export const PRIORITY_ORDER: Record<Priority, number> = { 'Crítica': 0, Alta: 1, Media: 2, Baja: 3 };
export const isActive = (ticket: Ticket): boolean => !['Resuelta', 'Cerrada'].includes(ticket.status);
export function allowedStatuses(status: TicketStatus): readonly TicketStatus[] {
  const next: Record<TicketStatus, TicketStatus[]> = {
    Nueva: ['En análisis'],
    'En análisis': ['En espera', 'Resuelta'],
    'En espera': ['En análisis', 'Resuelta'],
    Resuelta: ['En análisis', 'Cerrada'],
    Cerrada: ['En análisis'],
  };
  return [status, ...next[status]];
}
export function validateDraft(draft: TicketDraft): string | null {
  if (draft.title.trim().length < 6 || draft.title.length > 140) return 'El asunto debe tener entre 6 y 140 caracteres.';
  if (draft.description.trim().length < 12 || draft.description.length > 5000) return 'Describe la solicitud o el incidente con entre 12 y 5000 caracteres.';
  if (!KINDS.includes(draft.kind) || !PRIORITIES.includes(draft.priority) || !CATEGORIES.includes(draft.category as typeof CATEGORIES[number])) return 'Selecciona un tipo, categoría y prioridad válidos.';
  if (draft.requester.trim().length < 2 || draft.requester.length > 100) return 'Indica el nombre del solicitante (2 a 100 caracteres).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.requesterEmail) || draft.requesterEmail.length > 254) return 'Ingresa un correo electrónico válido.';
  if (draft.assigneeId && !ANALYSTS.some(a => a.id === draft.assigneeId)) return 'Selecciona un responsable válido.';
  if (draft.asset.length > 200 || draft.evidence.length > 2000) return 'El activo o la evidencia supera el tamaño permitido.';
  return null;
}
export function slaLabel(ticket: Ticket, now: number): string {
  if (!isActive(ticket)) return 'Finalizado';
  const mins = Math.ceil((Date.parse(ticket.dueAt) - now) / 60000);
  const hours = Math.floor(Math.abs(mins) / 60);
  const remaining = Math.abs(mins) % 60;
  return mins <= 0 ? `Vencido · ${hours} h ${remaining} min` : hours >= 24 ? `${Math.floor(hours / 24)} d ${hours % 24} h` : `${hours} h ${remaining} min`;
}
export function slaState(ticket: Ticket, now: number): string {
  if (!isActive(ticket)) return 'done';
  const hours = (Date.parse(ticket.dueAt) - now) / 3600000;
  return hours <= 0 ? 'overdue' : hours <= 4 ? 'warning' : 'normal';
}
export function csvCell(value: string): string {
  const safe = /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
  return '"' + safe.replace(/"/g, '""') + '"';
}
