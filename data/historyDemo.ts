// data/historyDemo.ts
// Demo history entries grouped by day. Replaced by SQLite-backed data in Phase 4.
import { Mode } from '@/types/translation';

export type HistoryItem = {
  id: string;
  mode: Mode;
  sourceLang: string; // ISO code
  targetLang: string; // ISO code
  bidirectional?: boolean; // render ⇄ instead of → (meetings)
  time: string; // display time, e.g. "10:42 AM"
  sourceText?: string; // converse/text entries
  translatedText?: string; // converse/text entries (shown muted)
  title?: string; // document/meeting entries
  subtitle?: string; // document/meeting entries
  thumbnail?: boolean; // document entries show an image placeholder
};

export type HistoryGroup = { label: string; items: HistoryItem[] };

export const HISTORY_GROUPS: HistoryGroup[] = [
  {
    label: 'Today',
    items: [
      {
        id: '1',
        mode: 'converse',
        sourceLang: 'en',
        targetLang: 'ja',
        time: '10:42 AM',
        sourceText: 'Where is the nearest subway station?',
        translatedText: '最寄りの地下鉄の駅はどこですか？',
      },
      {
        id: '2',
        mode: 'document',
        sourceLang: 'en',
        targetLang: 'es',
        time: '09:15 AM',
        sourceText:
          'I would like to order a coffee with milk, please. Also, do you have any pastries?',
      },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      {
        id: '3',
        mode: 'document',
        sourceLang: 'fr',
        targetLang: 'en',
        time: '2:30 PM',
        title: 'Menu Scan',
        subtitle: 'Translated 14 items',
        thumbnail: true,
      },
      {
        id: '4',
        mode: 'meeting',
        sourceLang: 'en',
        targetLang: 'de',
        bidirectional: true,
        time: '11:00 AM',
        title: 'Tour Guide Conversation',
        subtitle: '15 min duration • 42 exchanges',
      },
    ],
  },
];
