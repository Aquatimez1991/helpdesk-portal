import { Injectable } from '@angular/core';
import { Ticket, TicketDraft, STATUSES, PRIORITIES, KINDS, ANALYSTS, CATEGORIES, validateDraft } from './ticket.model';

export const STORAGE_KEY = 'cyberdesk.demo.v1';
interface Snapshot { version: 1; tickets: Ticket[]; }
export function isSnapshot(value: unknown): value is Snapshot {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  if (s['version'] !== 1 || !Array.isArray(s['tickets']) || s['tickets'].length > 500) return false;
  const ids = new Set<string>();
  return s['tickets'].every((t: unknown) => {
    if (!t || typeof t !== 'object') return false;
    const row = t as Record<string, unknown>;
    const strings = ['id', 'title', 'description', 'category', 'kind', 'priority', 'status', 'assigneeId', 'requester', 'requesterEmail', 'asset', 'evidence'];
    if (!strings.every(key => typeof row[key] === 'string' && (row[key] as string).length <= 5000)) return false;
    if (!/^CYB-\d{4,}$/.test(row['id'] as string) || ids.has(row['id'] as string)) return false;
    ids.add(row['id'] as string);
    if (!STATUSES.some(v => v === row['status']) || !PRIORITIES.some(v => v === row['priority']) || !KINDS.some(v => v === row['kind']) || !CATEGORIES.some(v => v === row['category'])) return false;
    if (row['assigneeId'] !== '' && !ANALYSTS.some(v => v.id === row['assigneeId'])) return false;
    if (validateDraft(row as unknown as TicketDraft)) return false;
    if (!['createdAt', 'updatedAt', 'dueAt'].every(key => typeof row[key] === 'string' && Number.isFinite(Date.parse(row[key] as string)))) return false;
    if (row['resolvedAt'] !== null && (typeof row['resolvedAt'] !== 'string' || !Number.isFinite(Date.parse(row['resolvedAt'])))) return false;
    if (['Resuelta', 'Cerrada'].includes(row['status'] as string) !== (row['resolvedAt'] !== null)) return false;
    if (!Array.isArray(row['events']) || row['events'].length === 0 || row['events'].length > 1000) return false;
    return row['events'].every((event: unknown) => {
      if (!event || typeof event !== 'object') return false;
      const e = event as Record<string, unknown>;
      return ['id', 'actor', 'action', 'detail'].every(k => typeof e[k] === 'string' && (e[k] as string).length <= 5000)
        && typeof e['at'] === 'string' && Number.isFinite(Date.parse(e['at']));
    });
  });
}

@Injectable({ providedIn: 'root' })
export class TicketRepository {
  read(): Ticket[] | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isSnapshot(parsed)) throw new Error('El formato de los datos locales no es compatible.');
    return parsed.tickets;
  }
  save(tickets: Ticket[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tickets }));
  }
}
