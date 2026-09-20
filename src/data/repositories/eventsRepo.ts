import { db } from '@/data/db';
import { UrgeEvent } from '@/data/types';
import { generateId } from '@/utils/id';

function rowToEvent(row: any): UrgeEvent {
  return {
    id: row.id,
    behaviorId: row.behaviorId,
    startedAt: row.startedAt,
    endedAt: row.endedAt ?? null,
    intensity: row.intensity ?? null,
    intensityAfter: row.intensityAfter ?? null,
    mood: row.mood ?? null,
    triggers: safeParse(row.contextTags),
    location: row.location ?? null,
    company: row.company ?? null,
    note: row.note ?? null,
    outcome: row.outcome ?? null,
    outcomeUpdatedAt: row.outcomeUpdatedAt ?? null,
    delaySeconds: row.delaySeconds ?? null,
    helpedByPlan: row.helpedByPlan ?? null,
    source: row.source ?? 'app',
  };
}

function safeParse(raw: unknown): string[] {
  if (typeof raw !== 'string') return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export const eventsRepo = {
  list(): UrgeEvent[] {
    const rows = db.getAllSync('SELECT * FROM events ORDER BY startedAt DESC;');
    return rows.map(rowToEvent);
  },

  listForBehavior(behaviorId: string): UrgeEvent[] {
    const rows = db.getAllSync('SELECT * FROM events WHERE behaviorId = ? ORDER BY startedAt DESC;', [behaviorId]);
    return rows.map(rowToEvent);
  },

  get(id: string): UrgeEvent | null {
    const row = db.getFirstSync('SELECT * FROM events WHERE id = ?;', [id]);
    return row ? rowToEvent(row) : null;
  },

  create(input: Omit<UrgeEvent, 'id'>): UrgeEvent {
    const event: UrgeEvent = { ...input, id: generateId() };
    db.runSync(
      `INSERT INTO events (id, behaviorId, kind, startedAt, endedAt, intensity, intensityAfter, mood, contextTags, location, company, note, outcome, outcomeUpdatedAt, delaySeconds, helpedByPlan, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        event.id,
        event.behaviorId,
        'urge',
        event.startedAt,
        event.endedAt,
        event.intensity,
        event.intensityAfter,
        event.mood,
        JSON.stringify(event.triggers ?? []),
        event.location,
        event.company,
        event.note,
        event.outcome,
        event.outcomeUpdatedAt,
        event.delaySeconds,
        event.helpedByPlan,
        event.source,
      ]
    );
    return event;
  },

  update(id: string, patch: Partial<UrgeEvent>): UrgeEvent | null {
    const existing = eventsRepo.get(id);
    if (!existing) return null;
    const next = { ...existing, ...patch };
    db.runSync(
      `UPDATE events SET endedAt=?, intensity=?, intensityAfter=?, mood=?, contextTags=?, location=?, company=?, note=?, outcome=?, outcomeUpdatedAt=?, delaySeconds=?, helpedByPlan=?, source=? WHERE id=?;`,
      [
        next.endedAt,
        next.intensity,
        next.intensityAfter,
        next.mood,
        JSON.stringify(next.triggers ?? []),
        next.location,
        next.company,
        next.note,
        next.outcome,
        next.outcomeUpdatedAt,
        next.delaySeconds,
        next.helpedByPlan,
        next.source,
        id,
      ]
    );
    return next;
  },

  remove(id: string): void {
    db.runSync('DELETE FROM events WHERE id = ?;', [id]);
  },
};
