import { Ticket, ANALYSTS, csvCell } from './ticket.model';
export function downloadTickets(tickets: Ticket[]): void {
  const header = ['ID', 'Asunto', 'Tipo', 'Categoría', 'Prioridad', 'Estado', 'Responsable', 'Solicitante', 'Correo', 'Activo', 'Descripción', 'Indicadores', 'Registrado (UTC)', 'Actualizado (UTC)', 'Objetivo (UTC)', 'Resuelto (UTC)', 'Historial local (JSON)'];
  const rows = tickets.map(t => [t.id, t.title, t.kind, t.category, t.priority, t.status, ANALYSTS.find(a => a.id === t.assigneeId)?.name ?? 'Sin asignar', t.requester, t.requesterEmail, t.asset, t.description, t.evidence, t.createdAt, t.updatedAt, t.dueAt, t.resolvedAt ?? '', JSON.stringify(t.events)]);
  const csv = '\uFEFF' + [header, ...rows].map(row => row.map(csvCell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const anchor = document.createElement('a');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  anchor.href = url; anchor.download = `cyberdesk-tickets-${today}.csv`;
  anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
