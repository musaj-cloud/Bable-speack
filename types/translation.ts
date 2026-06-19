// types/translation.ts
export type Mode = 'converse' | 'document' | 'meeting';

export type Language = {
  code: string; // ISO code, e.g. "en", "fr"
  name: string; // Display name, e.g. "English"
};

// One conversation turn as stored with a saved meeting (serializable mirror of
// the live MeetingSegment in store/useMeetingStore).
export type SavedMeetingSegment = {
  id: string;
  side: 'you' | 'them';
  fromLang: string;
  toLang: string;
  sourceText: string;
  translatedText: string;
};

// Extra payload kept for meeting entries so a saved session can be reopened in
// full (transcript + summary + duration), not just its flattened text.
export type MeetingDetail = {
  durationSec: number;
  segments: SavedMeetingSegment[];
  summary: string[];
};

export type TranslationEntry = {
  id: string;
  timestamp: string;
  mode: Mode;
  sourceLang: string; // ISO code
  targetLang: string; // ISO code
  sourceText: string;
  translatedText: string;
  embedding?: number[]; // for semantic history search
  imageUri?: string; // document scans: persisted on-device image
  detail?: MeetingDetail; // meeting: full transcript + summary + duration
};

export type MeetingSegment = {
  id: string;
  speaker: string; // "Speaker 1" / "Speaker 2"
  lang: string;
  sourceText: string;
  translatedText: string;
};

export type MeetingResult = {
  id: string;
  timestamp: string;
  durationSec: number;
  segments: MeetingSegment[];
  summary: string;
};

export type PipelineStep = {
  id: string;
  label: string; // "Transcribing", "Translating", "Summarizing"
  status: 'pending' | 'running' | 'done';
};
