// Demo meeting content shown until the QVAC record → transcribe → translate →
// summarize pipeline lands in Phase 5. Mirrors the Meeting design mockup.

export type DemoSegment = {
  id: string;
  speaker: string;
  langLabel: string; // display code, e.g. "EN" / "ES"
  side: 'left' | 'right'; // right = own language, left = foreign (shows translation)
  sourceText: string;
  translatedText?: string; // shown beneath the source for foreign-language turns
};

export const DEMO_DURATION = '45:12';

export const DEMO_SEGMENTS: DemoSegment[] = [
  {
    id: '1',
    speaker: 'Speaker 1',
    langLabel: 'EN',
    side: 'right',
    sourceText: 'So, integrating the new API should reduce our latency by about 40%, right?',
  },
  {
    id: '2',
    speaker: 'Speaker 2',
    langLabel: 'ES',
    side: 'left',
    sourceText: 'Exactamente. Si todo sale según lo planeado, la mejora será inmediata.',
    translatedText:
      'Exactly. If everything goes according to plan, the improvement will be immediate.',
  },
  {
    id: '3',
    speaker: 'Speaker 1',
    langLabel: 'EN',
    side: 'right',
    sourceText: "Perfect. We'll start the rollout on Thursday.",
  },
];

export const DEMO_SUMMARY = [
  'API integration expected to cut latency by 40%.',
  'Rollout scheduled for Thursday.',
];
