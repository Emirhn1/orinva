import { db } from '@/data/db';
import { UserQuote, QuoteMeta } from '@/data/types';
import { generateId } from '@/utils/id';

function rowToUserQuote(row: any): UserQuote {
  return { id: row.id, category: row.category, text: row.text, author: row.author ?? null, createdAt: row.createdAt };
}

function rowToMeta(row: any): QuoteMeta {
  return {
    quoteId: row.quoteId,
    isFavorite: !!row.isFavorite,
    lastShownAt: row.lastShownAt ?? null,
    shownCount: row.shownCount ?? 0,
    hiddenAt: row.hiddenAt ?? null,
  };
}

export const quotesRepo = {
  listUser(): UserQuote[] {
    return db.getAllSync('SELECT * FROM user_quotes ORDER BY createdAt DESC;').map(rowToUserQuote);
  },

  createUser(input: Omit<UserQuote, 'id' | 'createdAt'>): UserQuote {
    const q: UserQuote = { ...input, id: `u-${generateId()}`, createdAt: new Date().toISOString() };
    db.runSync('INSERT INTO user_quotes (id, category, text, author, createdAt) VALUES (?, ?, ?, ?, ?);', [
      q.id,
      q.category,
      q.text,
      q.author,
      q.createdAt,
    ]);
    return q;
  },

  removeUser(id: string): void {
    db.runSync('DELETE FROM user_quotes WHERE id = ?;', [id]);
    db.runSync('DELETE FROM quote_meta WHERE quoteId = ?;', [id]);
  },

  listMeta(): QuoteMeta[] {
    return db.getAllSync('SELECT * FROM quote_meta;').map(rowToMeta);
  },

  upsertMeta(meta: QuoteMeta): void {
    db.runSync(
      'INSERT OR REPLACE INTO quote_meta (quoteId, isFavorite, lastShownAt, shownCount, hiddenAt) VALUES (?, ?, ?, ?, ?);',
      [meta.quoteId, meta.isFavorite ? 1 : 0, meta.lastShownAt, meta.shownCount, meta.hiddenAt]
    );
  },

  removeMeta(id: string): void {
    db.runSync('DELETE FROM quote_meta WHERE quoteId = ?;', [id]);
  },
};
