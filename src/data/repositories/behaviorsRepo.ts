import { db } from '@/data/db';
import { Behavior } from '@/data/types';
import { generateId } from '@/utils/id';

function rowToBehavior(row: any): Behavior {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    goalMode: row.goalMode,
    unit: row.unit,
    costPerUnit: row.costPerUnit ?? undefined,
    costCurrency: row.costCurrency ?? undefined,
    planAlternative: row.planAlternative ?? undefined,
    createdAt: row.createdAt,
    archived: !!row.archived,
    cleanSinceAt: row.cleanSinceAt,
  };
}

export const behaviorsRepo = {
  list(): Behavior[] {
    const rows = db.getAllSync('SELECT * FROM behaviors ORDER BY createdAt ASC;');
    return rows.map(rowToBehavior);
  },

  get(id: string): Behavior | null {
    const row = db.getFirstSync('SELECT * FROM behaviors WHERE id = ?;', [id]);
    return row ? rowToBehavior(row) : null;
  },

  create(input: Omit<Behavior, 'id' | 'createdAt' | 'archived' | 'cleanSinceAt'>): Behavior {
    const now = new Date().toISOString();
    const behavior: Behavior = {
      ...input,
      id: generateId(),
      createdAt: now,
      archived: false,
      cleanSinceAt: now,
    };
    db.runSync(
      `INSERT INTO behaviors (id, name, category, goalMode, unit, costPerUnit, costCurrency, planAlternative, createdAt, archived, cleanSinceAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        behavior.id,
        behavior.name,
        behavior.category,
        behavior.goalMode,
        behavior.unit,
        behavior.costPerUnit ?? null,
        behavior.costCurrency ?? null,
        behavior.planAlternative ?? null,
        behavior.createdAt,
        0,
        behavior.cleanSinceAt,
      ]
    );
    return behavior;
  },

  update(id: string, patch: Partial<Behavior>): void {
    const existing = behaviorsRepo.get(id);
    if (!existing) return;
    const next = { ...existing, ...patch };
    db.runSync(
      `UPDATE behaviors SET name=?, category=?, goalMode=?, unit=?, costPerUnit=?, costCurrency=?, planAlternative=?, archived=?, cleanSinceAt=? WHERE id=?;`,
      [
        next.name,
        next.category,
        next.goalMode,
        next.unit,
        next.costPerUnit ?? null,
        next.costCurrency ?? null,
        next.planAlternative ?? null,
        next.archived ? 1 : 0,
        next.cleanSinceAt,
        id,
      ]
    );
  },

  resetCleanTimer(id: string, at: string = new Date().toISOString()): void {
    db.runSync('UPDATE behaviors SET cleanSinceAt = ? WHERE id = ?;', [at, id]);
  },

  archive(id: string): void {
    db.runSync('UPDATE behaviors SET archived = 1 WHERE id = ?;', [id]);
  },
};
