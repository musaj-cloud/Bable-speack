// lib/db.ts
// SQLite persistence for translation history. All data stays on device.
// Screens/components never write raw SQL — they go through these helpers.
import * as SQLite from 'expo-sqlite';
import { TranslationEntry } from '@/types/translation';

// One shared connection, opened lazily on first use.
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Add a column only if it's missing — lets existing installs pick up new fields
// (image_uri, detail) without dropping their saved history.
const ensureColumn = async (
  db: SQLite.SQLiteDatabase,
  name: string,
  ddl: string
): Promise<void> => {
  const cols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(translations)');
  if (!cols.some((c) => c.name === name)) {
    await db.execAsync(`ALTER TABLE translations ADD COLUMN ${ddl}`);
  }
};

const getDb = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('babelspeak.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS translations (
          id              TEXT PRIMARY KEY NOT NULL,
          timestamp       TEXT NOT NULL,
          mode            TEXT NOT NULL,
          source_lang     TEXT NOT NULL,
          target_lang     TEXT NOT NULL,
          source_text     TEXT NOT NULL,
          translated_text TEXT NOT NULL,
          embedding       TEXT
        );
      `);
      await ensureColumn(db, 'image_uri', 'image_uri TEXT');
      await ensureColumn(db, 'detail', 'detail TEXT');
      return db;
    });
  }
  return dbPromise;
};

// Shape of a row as stored in SQLite (snake_case columns).
type Row = {
  id: string;
  timestamp: string;
  mode: string;
  source_lang: string;
  target_lang: string;
  source_text: string;
  translated_text: string;
  embedding: string | null;
  image_uri: string | null;
  detail: string | null;
};

const rowToEntry = (r: Row): TranslationEntry => ({
  id: r.id,
  timestamp: r.timestamp,
  mode: r.mode as TranslationEntry['mode'],
  sourceLang: r.source_lang,
  targetLang: r.target_lang,
  sourceText: r.source_text,
  translatedText: r.translated_text,
  embedding: r.embedding ? (JSON.parse(r.embedding) as number[]) : undefined,
  imageUri: r.image_uri ?? undefined,
  detail: r.detail ? (JSON.parse(r.detail) as TranslationEntry['detail']) : undefined,
});

// Newest first.
export const getAllEntries = async (): Promise<TranslationEntry[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM translations ORDER BY timestamp DESC'
  );
  return rows.map(rowToEntry);
};

export const insertEntry = async (entry: TranslationEntry): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO translations
       (id, timestamp, mode, source_lang, target_lang, source_text, translated_text, embedding, image_uri, detail)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.timestamp,
      entry.mode,
      entry.sourceLang,
      entry.targetLang,
      entry.sourceText,
      entry.translatedText,
      entry.embedding ? JSON.stringify(entry.embedding) : null,
      entry.imageUri ?? null,
      entry.detail ? JSON.stringify(entry.detail) : null,
    ]
  );
};

// Backfill an embedding once it has been computed (kept separate so saving an
// entry never waits on the embedding model).
export const updateEntryEmbedding = async (
  id: string,
  embedding: number[]
): Promise<void> => {
  const db = await getDb();
  await db.runAsync('UPDATE translations SET embedding = ? WHERE id = ?', [
    JSON.stringify(embedding),
    id,
  ]);
};

export const deleteEntry = async (id: string): Promise<void> => {
  const db = await getDb();
  await db.runAsync('DELETE FROM translations WHERE id = ?', [id]);
};

// Bulk delete (selection-mode "Delete selected" in History).
export const deleteEntries = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(', ');
  await db.runAsync(`DELETE FROM translations WHERE id IN (${placeholders})`, ids);
};

export const clearEntries = async (): Promise<void> => {
  const db = await getDb();
  await db.runAsync('DELETE FROM translations');
};
