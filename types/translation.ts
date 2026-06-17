// types/translation.ts
export type Mode = 'converse' | 'document' | 'meeting';

export type Language = {
  code: string; // ISO code, e.g. "en", "fr"
  name: string; // Display name, e.g. "English"
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
