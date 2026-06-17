// constants/typography.ts
// Official BabelSpeak type scale. Serif (Georgia) for content, mono for labels.
import { TextStyle } from 'react-native';

export const fonts = {
  body: 'Georgia', // Serif — headings, body text, transcripts, translations
  mono: 'monospace', // Mono — labels, badges, tabs, pipeline steps, status
};

export const typography = {
  h1: { fontFamily: 'Georgia', fontSize: 32, fontWeight: '700', lineHeight: 38 },
  h2: { fontFamily: 'Georgia', fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h3: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '600', lineHeight: 28 },
  h4: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', lineHeight: 22 },
  bodyLg: { fontFamily: 'Georgia', fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMd: { fontFamily: 'Georgia', fontSize: 14, fontWeight: '400', lineHeight: 22 },
  bodySm: { fontFamily: 'Georgia', fontSize: 13, fontWeight: '400', lineHeight: 20 },
  label: { fontFamily: 'monospace', fontSize: 11, fontWeight: '600', letterSpacing: 1.2 },
  mono: { fontFamily: 'monospace', fontSize: 13, fontWeight: '400' },
  caption: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 0.8 },
  tab: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 0.5 },
} satisfies Record<string, TextStyle>;
