import { db } from '@/data/db';
import { Behavior } from '@/data/types';
import { generateId } from '@/utils/id';

function num(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function rowToBehavior(row: any): Behavior {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    goalMode: row.goalMode,
    unit: row.unit,
    costPerUnit: num(row.costPerUnit),
    costCurrency: row.costCurrency ?? undefined,
    minutesPerUnit: num(row.minutesPerUnit),
    baselinePerDay: num(row.baselinePerDay),
    savingsGoalLabel: row.savingsGoalLabel ?? undefined,
    savingsGoalAmount: num(row.savingsGoalAmount),
    planAlternative: row.planAlternative ?? undefined,
    createdAt: row.createdAt,
    archived: !!row.archived,
    cleanSinceAt: row.cleanSinceAt,
  };
}

export type BehaviorInput = Omit<Behavior, 'id' | 'createdAt' | 'archived' | 'cleanSinceAt'>;

export const behaviorsRepo = {
  list(): Behavior[] {
    const rows = db.getAllSync('SELECT * FROM behaviors ORDER BY createdAt ASC;');
    return rows.map(rowToBehavior);
  },

  get(id: string): Behavior | null {
    const row = db.getFirstSync('SELECT * FROM behaviors WHERE id = ?;', [id]);
    return row ? rowToBehavior(row) : null;
  },

  create(input: BehaviorInput): Behavior {
    const now = new Date().toISOString();
    const behavior: Behavior = {
      ...input,
      id: generateId(),
      createdAt: now,
      archived: false,
      cleanSinceAt: now,
    };
    db.runSync(
      `INSERT INTO behaviors (id, name, category, goalMode, unit, costPerUnit, costCurrency, minutesPerUnit, baselinePerDay, savingsGoalLabel, savingsGoalAmount, planAlternative, createdAt, archived, cleanSinceAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        behavior.id,
        behavior.name,
        behavior.category,
        behavior.goalMode,
        behavior.unit,
        behavior.costPerUnit ?? null,
        behavior.costCurrency ?? null,
        behavior.minutesPerUnit ?? null,
        behavior.baselinePerDay ?? null,
        behavior.savingsGoalLabel ?? null,
        behavior.savingsGoalAmount ?? null,
        behavior.planAlternative ?? null,
        behavior.createdAt,
        0,
        behavior.cleanSinceAt,
      ]
    );
    return behavior;
  },

  update(id: string, patch: Partial<Behavior>): Behavior | null {
    const existing = behaviorsRepo.get(id);
    if (!existing) return null;
    const next = { ...existing, ...patch };
    db.runSync(
      `UPDATE behaviors SET name=?, category=?, goalMode=?, unit=?, costPerUnit=?, costCurrency=?, minutesPerUnit=?, baselinePerDay=?, savingsGoalLabel=?, savingsGoalAmount=?, planAlternative=?, archived=?, cleanSinceAt=? WHERE id=?;`,
      [
        next.name,
        next.category,
        next.goalMode,
        next.unit,
        next.costPerUnit ?? null,
        next.costCurrency ?? null,
        next.minutesPerUnit ?? null,
        next.baselinePerDay ?? null,
        next.savingsGoalLabel ?? null,
        next.savingsGoalAmount ?? null,
        next.planAlternative ?? null,
        next.archived ? 1 : 0,
        next.cleanSinceAt,
        id,
      ]
    );
    return next;
  },

  setCleanSince(id: string, at: string): void {
    db.runSync('UPDATE behaviors SET cleanSinceAt = ? WHERE id = ?;', [at, id]);
  },

  archive(id: string): void {
    db.runSync('UPDATE behaviors SET archived = 1 WHERE id = ?;', [id]);
  },

  unarchive(id: string): void {
    db.runSync('UPDATE behaviors SET archived = 0 WHERE id = ?;', [id]);
  },
};
