// store/useHistoryStore.ts
// Translation history, backed by SQLite (lib/db). The list lives in memory for
// the UI; every mutation is mirrored to the database so it survives restarts.
import { create } from 'zustand';
import {
  clearEntries,
  deleteEntries,
  deleteEntry,
  getAllEntries,
  insertEntry,
  updateEntryEmbedding,
} from '@/lib/db';
import { embedText } from '@/lib/embeddings';
import { deleteImage, persistImage } from '@/lib/media';
import { MeetingDetail, Mode, TranslationEntry } from '@/types/translation';

// Fields a caller provides; id + timestamp are assigned here.
type NewEntry = {
  mode: Mode;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  imageUri?: string; // document scans
  detail?: MeetingDetail; // meeting sessions
};

type HistoryState = {
  entries: TranslationEntry[];
  loaded: boolean;
  load: () => Promise<void>;
  addEntry: (input: NewEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
  removeMany: (ids: string[]) => Promise<void>;
  clear: () => Promise<void>;
};

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: [],
  loaded: false,

  load: async () => {
    const entries = await getAllEntries();
    set({ entries, loaded: true });
  },

  addEntry: async (input) => {
    const id = makeId();
    // Copy the scan image into permanent storage so it survives cache eviction.
    const imageUri = input.imageUri ? persistImage(input.imageUri, id) : undefined;
    const entry: TranslationEntry = {
      id,
      timestamp: new Date().toISOString(),
      ...input,
      imageUri,
    };
    await insertEntry(entry);
    set({ entries: [entry, ...get().entries] });

    // Embedding is best-effort and computed off the critical path so saving
    // never blocks on the model. Backfill the row + in-memory entry when ready.
    const embedding = await embedText(`${input.sourceText} ${input.translatedText}`);
    if (!embedding) return;
    await updateEntryEmbedding(entry.id, embedding);
    set({
      entries: get().entries.map((e) => (e.id === entry.id ? { ...e, embedding } : e)),
    });
  },

  remove: async (id) => {
    const entry = get().entries.find((e) => e.id === id);
    await deleteEntry(id);
    deleteImage(entry?.imageUri);
    set({ entries: get().entries.filter((e) => e.id !== id) });
  },

  // Bulk delete from selection mode. Cleans up each entry's persisted image.
  removeMany: async (ids) => {
    const idSet = new Set(ids);
    const removed = get().entries.filter((e) => idSet.has(e.id));
    await deleteEntries(ids);
    removed.forEach((e) => deleteImage(e.imageUri));
    set({ entries: get().entries.filter((e) => !idSet.has(e.id)) });
  },

  clear: async () => {
    const { entries } = get();
    await clearEntries();
    entries.forEach((e) => deleteImage(e.imageUri));
    set({ entries: [] });
  },
}));
