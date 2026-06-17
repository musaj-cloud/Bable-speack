# AGENTS.md

You are an expert React Native + Expo engineer helping build a production-quality offline translation app.

You write clean, simple, maintainable code. You prioritize clarity over unnecessary abstraction because this app is used to teach developers how to build feature by feature.

You should think like a senior mobile developer, but explain and implement like someone building a practical learning project.

-----

## Project Overview

We are building BabelSpeak — a private, fully-offline universal translator mobile app using Expo and the QVAC SDK by Tether.

The app translates anything, anywhere, with no internet through three modes:

- **Converse** — real-time voice translation: speak in one language, hear it spoken back in another
- **Document** — photograph a sign, menu, or document and read it translated
- **Meeting** — record a multilingual conversation and get a translated, summarized transcript

All AI runs entirely on the user's device. No text, audio, or image ever leaves the phone. No cloud server. No API keys required for any feature.

This is built for the QVAC "Unleash Edge AI" Hackathon on DoraHacks.

**The demo moment:** Turn off WiFi on stage. Speak English. Hear French back. No internet. That is edge AI.

-----

## Tech Stack

Use the following stack:

- Expo
- React Native
- TypeScript
- Expo Router
- NativeWind / Tailwind CSS
- Zustand
- AsyncStorage
- QVAC SDK (`@qvac/sdk`) for all AI capabilities
- QVAC Fabric for on-device inference
- QVAC Holepunch P2P (available, not core to MVP)
- SQLite (via expo-sqlite) for local translation history storage
- expo-audio for audio recording and real-time PCM mic capture
- expo-camera for Document mode photo capture
- react-native-qrcode-svg only if a share/connect feature is added later

Do not introduce new major libraries unless there is a strong reason. Always ask before installing.

### QVAC capabilities used (6, chained)

| Step | Capability                | What it does                                          | Phase   |
|------|---------------------------|-------------------------------------------------------|---------|
| 1    | Transcription (Whisper)   | Listens to the user speaking, converts to text        | Phase 2 |
| 2    | Translation (Bergamot)    | Converts text from source to target language          | Phase 1 |
| 3    | Text Generation (cleanup) | Polishes the translation into natural phrasing        | Phase 2 |
| 4    | TTS                       | Speaks the translated text aloud on device            | Phase 2 |
| 5    | OCR                       | Extracts text from photographed documents/signs       | Phase 3 |
| 6    | Text Embeddings           | Tags entries for semantic history search              | Phase 4 |

All 6 are free (Apache 2.0). Everything runs locally — no API keys, no cloud.

-----

## Development Philosophy

Build feature by feature.

For every feature:

1. Understand the user request.
1. Check this file before coding.
1. Keep the implementation simple.
1. Avoid overengineering.
1. Prefer readable code over clever code.
1. Build the smallest useful version first.
1. Refactor only when repetition or complexity appears.
1. Keep the app easy to teach and explain.

-----

## Decision Making & Clarifications

If something is unclear or could be improved:

- Proactively suggest better approaches
- If a new library would significantly simplify implementation:
  - Recommend it
  - Explain why it is useful
  - Ask for permission before installing

Example:

> "This could be done manually, but react-native-reanimated would make this animation smoother. Do you want me to add it?"

Do not install or use new libraries without user approval.

-----

## Architecture Guidelines

```
app/
  (onboarding)/
    welcome.tsx        — Step 1: app intro, 3 feature rows, Get Started
    languages.tsx      — Step 2: pick "I speak" + "translate to"
    ready.tsx          — Step 3: offline-ready confirmation, auto-play toggle
  (tabs)/
    index.tsx          — CONVERSE (real-time voice translation, default tab)
    document.tsx       — DOCUMENT (camera + OCR + translation)
    meeting.tsx        — MEETING (record + transcribe + translate + summarize)
    history.tsx        — HISTORY (list + semantic search)
    settings.tsx       — SETTINGS (languages, TTS, theme, storage, about)
  document/
    result.tsx         — captured image + OCR text + translation (optional sub-route)
  meeting/
    result.tsx         — full transcript + per-segment translation + summary
components/
constants/
  colors.ts            — light + dark color tokens
  typography.ts        — font scale
  images.ts            — centralized image imports
  languages.ts         — supported language list + codes
data/
hooks/
  useTheme.ts          — returns current theme colors
lib/
  qvac.ts              — SDK init, model loading
  transcription.ts     — ASR via Whisper
  translation.ts       — Bergamot neural translation
  cleanup.ts           — text-generation polish pass
  tts.ts               — text-to-speech
  ocr.ts               — image text extraction
  embeddings.ts        — embed + cosine similarity
  db.ts                — SQLite helpers (never write raw SQL in screens)
  cn.ts                — NativeWind class merge utility
store/
  useOnboardingStore.ts — onboarding complete flag, default language pair
  useLanguageStore.ts   — source + target language, swap()
  useConverseStore.ts   — current transcript, translation, audio state
  useHistoryStore.ts    — entry list (loaded from SQLite)
  useSettingsStore.ts   — TTS speed, auto-play, theme prefs
  useThemeStore.ts      — 'light' | 'dark' | 'system', persisted
types/
assets/
```

### app/

Use this for routes and screens only.

Screens compose components and call hooks/stores. They do not contain large UI blocks or business logic.

#### Screen Reference

The bottom navigation has exactly **5 tabs**: CONVERSE · DOCUMENT · MEETING · HISTORY · SETTINGS

| Screen          | Route                    | Tab      | Description                                                                                      |
|-----------------|--------------------------|----------|--------------------------------------------------------------------------------------------------|
| Welcome         | `(onboarding)/welcome`   | —        | App name, tagline, 3 feature rows (mic / camera / record), Get Started, progress dots 1 of 3     |
| Languages       | `(onboarding)/languages` | —        | "Which languages do you use?" — "I speak" + "translate to" pickers, live pair preview            |
| Ready           | `(onboarding)/ready`     | —        | "You are ready to go" — offline info card, auto-play toggle (default ON), Start Translating      |
| Converse        | `(tabs)/index`           | CONVERSE | Language selector with swap, big mic button, "you said" card, translation card, TTS speaker      |
| Document        | `(tabs)/document`        | DOCUMENT | Camera button, image preview, OCR text, translation, gallery + share buttons                     |
| Meeting         | `(tabs)/meeting`         | MEETING  | Record button, waveform + timer, processing pipeline, per-segment transcript, summary card       |
| History         | `(tabs)/history`         | HISTORY  | Semantic search bar, entries with mode icon + language pair + snippet + time, swipe-to-delete     |
| Settings        | `(tabs)/settings`        | SETTINGS | Default languages, TTS speed, auto-play toggle, theme, storage/clear history, about (QVAC credit) |
| Document Result | `document/result`        | —        | Image at top, extracted OCR text, translated text, speaker button                                |
| Meeting Result  | `meeting/result`         | —        | Scrollable transcript, alternating speaker colors, original + translated per segment, summary    |

#### Navigation Structure

```
Bottom Tab Bar (exactly 5 tabs):
  CONVERSE   — mic / speech-bubble icon (default active)
  DOCUMENT   — camera icon
  MEETING    — record / waveform icon
  HISTORY    — clock/history icon
  SETTINGS   — gear icon

Active tab:   theme accent color icon + label + blue dot indicator below
Inactive tab: muted gray icon + gray label
Tab bar bg:   theme.bgPrimary
```

-----

## File Length & Component Extraction Rule (CRITICAL)

Screen files must not exceed **150 lines**.
Component files must not exceed **200 lines**.

If a screen file exceeds 150 lines, extract UI sections into `components/`.
If a component file exceeds 200 lines, split it into smaller sub-components.

Screen files only do three things:

1. Import components
1. Call hooks and stores
1. Compose the layout

Logic, styling, and animations belong in component files — never in screens.

Before writing any screen, **plan the component breakdown first**.
List which components you will create, build each one, then assemble the screen.

-----

## Light & Dark Mode System (CRITICAL)

BabelSpeak supports both light and dark modes. This is a core product feature, not optional.

### How theming works

1. `constants/colors.ts` exports both `lightColors` and `darkColors` objects
1. `store/useThemeStore.ts` tracks the user's theme preference ('light' | 'dark' | 'system')
1. `hooks/useTheme.ts` returns the correct color object based on current preference
1. Every component receives colors via `const colors = useTheme()`
1. **Never hardcode a hex color value inside a component or screen.** Always use `colors.X`

### useTheme hook

```ts
// hooks/useTheme.ts
import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/useThemeStore';
import { lightColors, darkColors } from '@/constants/colors';

export const useTheme = () => {
  const systemScheme = useColorScheme();
  const { preference } = useThemeStore();
  const scheme = preference === 'system' ? systemScheme : preference;
  return scheme === 'dark' ? darkColors : lightColors;
};
```

### Color Tokens

```ts
// constants/colors.ts

// Light is the source-of-truth design (Material 3, from the onboarding mockup).
// Dark is derived to stay Material-3-consistent with the same blue primary.

export const lightColors = {
  // Backgrounds
  bgPrimary:    '#faf8ff',   // M3 surface/background — main screen
  bgAlt:        '#f3f3fe',   // M3 surface-container-low — alt background
  bgCard:       '#ffffff',   // M3 surface-container-lowest — white cards
  bgCardInner:  '#ededf9',   // M3 surface-container — inner/nested card

  // Borders
  border:       '#e1e2ed',   // M3 surface-variant — card borders + dividers

  // Accents
  accentBlue:   '#004ac6',   // M3 primary — buttons, active elements
  accentLight:  '#2563eb',   // M3 primary-container — brighter blue highlight

  // Status
  success:      '#059669',   // Green — offline-ready badge, checkmarks
  warningRed:   '#ba1a1a',   // M3 error — recording, stop button, errors
  warningAmber: '#d97706',   // Amber — processing, search highlights

  // Icon chips (M3 "fixed" colors — constant across light/dark)
  iconChipBlue:         '#d3e4fe',   // Mic chip bg (tertiary-fixed)
  iconChipBlueText:     '#0b1c30',   // Mic icon (on-tertiary-fixed)
  iconChipGray:         '#e3e2df',   // Camera chip bg (secondary-fixed)
  iconChipGrayText:     '#1b1c1a',   // Camera icon (on-secondary-fixed)
  iconChipLavender:     '#dbe1ff',   // Meeting chip bg (primary-fixed)
  iconChipLavenderText: '#00174b',   // Meeting icon (on-primary-fixed)

  // Text
  textPrimary:  '#191b23',   // M3 on-surface — main text
  textSecondary:'#434655',   // M3 on-surface-variant — muted/subtitle text
  textMuted:    '#737686',   // M3 outline — placeholders, inactive

  // Tab bar
  tabActive:    '#191b23',   // on-surface
  tabInactive:  '#737686',   // outline
  tabDot:       '#004ac6',   // primary
};

export const darkColors = {
  // Backgrounds
  bgPrimary:    '#111319',   // M3 dark surface — main screen
  bgAlt:        '#0c0e14',   // Darker surface — alt background
  bgCard:       '#1d1f27',   // M3 surface-container — card background
  bgCardInner:  '#282a32',   // M3 surface-container-high — inner/nested card

  // Borders
  border:       '#434655',   // M3 dark outline-variant — borders + dividers

  // Accents
  accentBlue:   '#3b82f6',   // Brighter primary — legible on dark, buttons
  accentLight:  '#b4c5ff',   // M3 inverse-primary — subtle blue highlights

  // Status
  success:      '#34d399',   // Green — offline-ready badge, checkmarks
  warningRed:   '#ffb4ab',   // M3 dark error — recording, stop button, errors
  warningAmber: '#fbbf24',   // Amber — processing, search highlights

  // Icon chips (M3 "fixed" colors — identical to light by design)
  iconChipBlue:         '#d3e4fe',   // Mic chip bg (tertiary-fixed)
  iconChipBlueText:     '#0b1c30',   // Mic icon (on-tertiary-fixed)
  iconChipGray:         '#e3e2df',   // Camera chip bg (secondary-fixed)
  iconChipGrayText:     '#1b1c1a',   // Camera icon (on-secondary-fixed)
  iconChipLavender:     '#dbe1ff',   // Meeting chip bg (primary-fixed)
  iconChipLavenderText: '#00174b',   // Meeting icon (on-primary-fixed)

  // Text
  textPrimary:  '#e3e1ec',   // M3 dark on-surface — main text
  textSecondary:'#c3c6d7',   // M3 dark on-surface-variant — muted/subtitle text
  textMuted:    '#8d909f',   // M3 dark outline — placeholders, inactive

  // Tab bar
  tabActive:    '#e3e1ec',
  tabInactive:  '#8d909f',
  tabDot:       '#b4c5ff',
};

export type ColorTokens = typeof darkColors;
```

### Applying themes in components

```tsx
// CORRECT — always use theme tokens
import { useTheme } from '@/hooks/useTheme';

export const MyCard = () => {
  const colors = useTheme();
  return (
    <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
      <Text style={{ color: colors.textPrimary }}>Hello</Text>
    </View>
  );
};

// WRONG — never hardcode colors
<View style={{ backgroundColor: '#151d2e' }}>
  <Text style={{ color: '#ffffff' }}>Hello</Text>
</View>
```

### NativeWind and theming

NativeWind class names cannot use dynamic theme values. For any view that
needs a theme-aware background, border, or text color: use StyleSheet with
`colors.X` from `useTheme()`.

Use NativeWind only for layout, spacing, and flex that does not change
between themes.

```tsx
// Correct — NativeWind for layout, StyleSheet for colors
<View className="flex-1 px-5 pt-4">
  <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
    <Text style={{ color: colors.textPrimary }}>Content</Text>
  </View>
</View>
```

### Theme toggle in Settings

The Settings screen has a theme toggle. When the user switches theme:

1. Save preference to useThemeStore ('light' | 'dark' | 'system')
1. Persist to AsyncStorage with key 'theme_preference'
1. All screens rerender automatically via useTheme hook

-----

## UI Implementation Rules (VERY IMPORTANT)

For any UI-related task:

- Replicate the provided design exactly
- Match pixel-perfect layout, spacing, font sizes, colors, radii, shadows

When a design image is provided you MUST:

- match layout exactly
- match spacing and padding
- match font sizes and hierarchy
- match colors precisely using theme tokens (not hardcoded hex)
- match border radius and shadows
- match alignment and positioning
- replicate all visible UI elements

Do not approximate. Do not simplify unless explicitly asked.

The app should feel warm, travel-inspired, and accessible — a fast, useful tool
for someone in a foreign country, a rural village, or a disaster zone with no internet.

-----

## Design System (Official Tokens — Do Not Change)

### Typography

```ts
// constants/typography.ts
export const fonts = {
  body: 'Georgia',       // Serif — headings, body text, transcripts, translations
  mono: 'monospace',     // Mono — labels, badges, tabs, pipeline steps, status
};

export const typography = {
  h1:      { fontFamily: 'Georgia', fontSize: 32, fontWeight: '700', lineHeight: 38 },
  h2:      { fontFamily: 'Georgia', fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h3:      { fontFamily: 'Georgia', fontSize: 22, fontWeight: '600', lineHeight: 28 },
  h4:      { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', lineHeight: 22 },
  bodyLg:  { fontFamily: 'Georgia', fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMd:  { fontFamily: 'Georgia', fontSize: 14, fontWeight: '400', lineHeight: 22 },
  bodySm:  { fontFamily: 'Georgia', fontSize: 13, fontWeight: '400', lineHeight: 20 },
  label:   { fontFamily: 'monospace', fontSize: 11, fontWeight: '600', letterSpacing: 1.2 },
  mono:    { fontFamily: 'monospace', fontSize: 13, fontWeight: '400' },
  caption: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 0.8 },
  tab:     { fontFamily: 'monospace', fontSize: 10, letterSpacing: 0.5 },
};
```

### Spacing & Shape

```
Border radius:
  Phone frame:    44px
  Cards:          16–20px
  Inner cards:    12px
  Badges / pills: 99px (fully rounded)
  Buttons:        12–14px
  Avatars:        50% (fully round)

Card padding:     16px
Section gap:      12px
Screen padding:   20px horizontal

Minimum touch target: 48 × 48pt (accessible for all ages)
```

### Component Patterns

**OfflineBadge** (the privacy/offline promise — shown prominently):

- Dark mode: rgba(52,211,153,0.12) bg, rgba(52,211,153,0.3) border, #34d399 dot + text
- Light mode: rgba(5,150,105,0.08) bg, rgba(5,150,105,0.25) border, #059669 dot + text
- Text: "OFFLINE · ON DEVICE"

**Language selector row:**

- Two large language names with a prominent swap arrow between them
- `[English] ⇄ [French]` — names large and readable, tap to change

**Mic button (Converse):**

- Large centered circle, accentBlue idle, warningRed/pulse while listening
- Status label below: "TRANSLATING · ON DEVICE"

**Pipeline step running indicator (Meeting):**

- Steps: Transcribing… → Translating… → Summarizing…
- Animated underline: accentBlue · Complete checkmark: success

**Waveform bars (Converse / Meeting):**

- Primary: accentBlue · Alternate: accentLight

**History entry:**

- Mode icon (voice / document / meeting) + source→target language + snippet + time
- Swipe left to delete

-----

## Image Rule

Use centralized image imports.

Before using any image asset:

1. Check if `constants/images.ts` exists
1. If it does not exist, create it
1. Import and export all images from `constants/images.ts`

```ts
// constants/images.ts
import globe from '@/assets/images/globe.png';
import onboarding from '@/assets/images/onboarding.png';

export const images = { globe, onboarding };
```

```tsx
<Image source={images.globe} />
```

Never import image assets directly inside screens or components.

-----

## Styling Rules

Use NativeWind for: layout, flex, spacing, padding, margin, gap, width, height.
Use StyleSheet or inline styles for: colors (always from useTheme), shadows, animations, TextInput, SafeAreaView, KeyboardAvoidingView, Animated.View, platform-specific props.

**Never hardcode hex values.** Always use `colors.X` from `useTheme()`.

```tsx
// Layout with NativeWind, colors with StyleSheet
<View className="flex-1 px-5">
  <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border,
                 borderWidth: 1, borderRadius: 16 }}>
    <Text style={{ ...typography.bodyMd, color: colors.textPrimary }}>
      Content
    </Text>
  </View>
</View>
```

Check the NativeWind version in package.json before using any NativeWind API.
Do not upgrade NativeWind without user approval.
Reference: <https://www.nativewind.dev/v5/llms-full.txt>

-----

## Style Exception Rules

| Component              | Why                            | Use Instead                     |
|------------------------|--------------------------------|---------------------------------|
| `SafeAreaView`         | className not supported        | Inline styles or StyleSheet     |
| `Button`               | Cannot customize with className| `TouchableOpacity`              |
| `KeyboardAvoidingView` | Behavior props                 | Inline styles or StyleSheet     |
| `Modal`                | visible, transparent props     | Inline styles                   |
| `ScrollView`           | contentContainerStyle          | StyleSheet                      |
| `TextInput`            | underlineColorAndroid          | Inline styles                   |
| `Animated.View`        | Animated values                | StyleSheet                      |
| Dynamic styles         | Runtime calculation            | StyleSheet.create() or inline   |
| Shadows                | iOS/Android differ             | StyleSheet with platform checks |
| Transforms             | Complex combinations           | StyleSheet                      |
| Theme colors           | Dynamic values                 | StyleSheet with useTheme()      |

-----

## UI Quality Bar

The app should feel:

- warm, travel-inspired, trustworthy
- polished in both light and dark mode
- friendly and accessible for all ages
- fast and mobile-first

Use:

- rounded cards
- soft shadows (theme-aware)
- clear spacing
- large touch targets (48×48pt minimum)
- large readable font sizes (16pt minimum body)
- high contrast in both themes
- simple Animated transitions
- friendly empty states

-----

## data/

```
data/
  onboardingSteps.ts     — static onboarding content
  languages.ts           — supported languages + ISO codes + display names
  modeCards.ts           — Converse / Document / Meeting card metadata
```

-----

## store/

```
store/
  useOnboardingStore.ts — onboarding complete flag, default pair selection
  useLanguageStore.ts   — source language, target language, swap()
  useConverseStore.ts   — current transcript, translation, audio/recording state
  useHistoryStore.ts    — entry list (loaded from SQLite)
  useSettingsStore.ts   — TTS speed, auto-play, app preferences
  useThemeStore.ts      — 'light' | 'dark' | 'system', persisted
```

Persist lightweight values with AsyncStorage. Translation history goes to SQLite.

-----

## lib/

```
lib/
  qvac.ts            — SDK init, model loading (load once, reuse model IDs)
  transcription.ts   — ASR via Whisper (Converse, Meeting)
  translation.ts     — Bergamot neural machine translation (all modes)
  cleanup.ts         — text-generation polish pass before TTS
  tts.ts             — text-to-speech playback
  ocr.ts             — text extraction from camera images (Document)
  embeddings.ts      — embed + cosine similarity (History search)
  db.ts              — SQLite helpers (never write raw SQL in screens)
  cn.ts              — NativeWind class merge utility
```

Never expose secret keys. QVAC requires no API keys — all AI runs locally.

-----

## State Management Rules

- Zustand: all global client state
- Local useState: temporary UI state (modal open, loading, etc.)
- AsyncStorage: lightweight persistence (language pair, settings, theme, onboarding flag)
- SQLite: translation history entries

-----

## TypeScript Rules

Use TypeScript strictly. Avoid `any`. Keep types simple.

```ts
// types/translation.ts
export type Mode = 'converse' | 'document' | 'meeting';

export type Language = {
  code: string;        // ISO code, e.g. "en", "fr"
  name: string;        // Display name, e.g. "English"
};

export type TranslationEntry = {
  id: string;
  timestamp: string;
  mode: Mode;
  sourceLang: string;     // ISO code
  targetLang: string;     // ISO code
  sourceText: string;
  translatedText: string;
  embedding?: number[];   // for semantic history search
};

export type MeetingSegment = {
  id: string;
  speaker: string;        // "Speaker 1" / "Speaker 2"
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
  label: string;          // "Transcribing", "Translating", "Summarizing"
  status: 'pending' | 'running' | 'done';
};

// types/theme.ts
export type ThemePreference = 'light' | 'dark' | 'system';
export type ColorTokens = typeof import('@/constants/colors').darkColors;
```

-----

## Feature Implementation Rules

When the user asks to build a feature:

1. Read this file first
1. Identify files to change
1. Plan component breakdown before writing code
1. Keep changes focused
1. Follow existing patterns
1. Ensure feature works end-to-end
1. Fix errors before finishing

### Build Order (Phases)

We build in **5 phases**. If time runs out at any phase, submit what you have —
each phase alone is a valid submission. **Never start the next phase if the
current one is broken.** A polished Phase 2 (voice translator) beats a broken Phase 4.

| Phase | Feature                              | Hours | Cumulative | Key capability                          |
|-------|--------------------------------------|-------|------------|-----------------------------------------|
| 1     | Onboarding + text translation        | 5     | 5          | Bergamot translation, Zustand, storage  |
| 2     | Converse mode (voice → translate → speech) | 5 | 10        | Transcription + Translation + TTS       |
| 3     | Document mode (camera → OCR → translate)   | 6 | 16        | expo-camera + OCR + Translation         |
| 4     | History + smart search               | 4     | 20         | SQLite + Embeddings (RAG)               |
| 5     | Polish + demo prep                   | 4     | 24         | UI polish, Meeting mode if time, demo   |

**Phase 1** — Build the 3-step onboarding (Welcome, Languages, Ready), then a
screen where the user types text, picks two languages, and sees the translation.
No voice yet. Proves the core translation engine works.

**Phase 2** — Replace typing with voice. Speak → transcribe → translate → TTS
speaks the result. This is the demo moment: turn off WiFi and it still works.

**Phase 3** — Photograph text → OCR reads it → translate → optional TTS. Add
gallery option and share button.

**Phase 4** — Save every translation to SQLite with embeddings. Build History
with semantic search ("hospital sign" finds it even if typed "medical building").

**Phase 5** — No new features. Polish UI, loading + error states, attempt Meeting
mode if time allows, write README, record demo video (WiFi off), prepare pitch.

-----

## QVAC SDK Rules (CRITICAL)

All AI runs on the device. No AI calls go to any cloud server.

### Model Loading

Load models once at app startup. Store model IDs in Zustand. Reuse them.
Unload models when the app goes to the background. Show a friendly error if a
model fails to load. Translation models (Bergamot) are downloaded per language
pair to the device.

```ts
// lib/qvac.ts
import { loadModel } from '@qvac/sdk';

export const loadTranslationModel = async (sourceLang: string, targetLang: string) => {
  const modelId = await loadModel(`bergamot/${sourceLang}-${targetLang}`, { modelType: 'translation' });
  return modelId;
};
```

### The Converse pipeline (under 3 seconds, zero internet)

1. User holds the mic button
1. QVAC Transcription (Whisper) converts speech → text locally
1. QVAC Translation (Bergamot) translates the text on device
1. QVAC Text Generation cleans up the phrasing for natural output
1. Translated text appears on screen
1. QVAC TTS speaks the translation aloud
1. Entry saved locally with QVAC Embeddings for future search

### The Document pipeline

1. User photographs a document/sign/menu
1. QVAC OCR reads all text from the image on device
1. Extracted text → QVAC Translation
1. Translated text shown below the image; optional TTS playback

### QVAC Rules Summary

- All inference on device. Never send text, audio, or images externally.
- Load models once. Reuse model IDs. Unload on background.
- Use `stream: true` where supported for better UX on slower devices.
- Show a friendly error if a model fails to load.
- Every QVAC capability is free (Apache 2.0). No API keys, ever.

-----

## Database Rules

Use `expo-sqlite` only. No cloud database. Ever.

```sql
CREATE TABLE IF NOT EXISTS translations (
  id              TEXT PRIMARY KEY,
  timestamp       TEXT NOT NULL,
  mode            TEXT NOT NULL,    -- "converse" | "document" | "meeting"
  source_lang     TEXT NOT NULL,    -- ISO code
  target_lang     TEXT NOT NULL,    -- ISO code
  source_text     TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  embedding       TEXT              -- JSON float array for semantic search
);

CREATE TABLE IF NOT EXISTS meetings (
  id            TEXT PRIMARY KEY,
  timestamp     TEXT NOT NULL,
  duration_sec  INTEGER NOT NULL,
  segments      TEXT NOT NULL,      -- JSON array of MeetingSegment
  summary       TEXT NOT NULL
);
```

All DB calls go through `lib/db.ts`. No raw SQL in screens or components.

-----

## Linting and Validation

Run after every feature:

```bash
npm run lint
npm run typecheck
```

Fix all errors before considering a feature complete.

-----

## Communication Style

Be concise. Explain what changed and how to test.

When a phase is complete state clearly:

> "Phase [N] is complete. Here is how to test it: …"

-----

## Important Constraints

- No cloud database
- No cloud AI / no Google Translate / no DeepL
- No external translation or speech APIs
- No authentication service (Clerk, Firebase, etc.)
- No analytics or crash reporting that sends data off device

Use:

- SQLite for translation history
- AsyncStorage for language pair, settings, theme, onboarding flag
- Zustand for app state
- QVAC SDK for all AI
- Holepunch DHT only if a peer-to-peer share feature is added (no translation data)

-----

## Privacy Rules (NON-NEGOTIABLE)

BabelSpeak promises that nothing the user says, photographs, or records ever
leaves the device. Every decision must respect this.

- Never log translation content to any service
- Never send text, audio, or images externally
- Never cache translation data in cloud storage
- When in doubt, keep data local

If a feature requires sending user content off device, stop and ask:

> "This would require sending user content externally. This conflicts with
> BabelSpeak's offline + privacy promise. Can we find a local alternative?"

-----

## The Pitch (context for product decisions)

> "Right now, 40% of the world has no reliable internet. For them, Google
> Translate doesn't exist. BabelSpeak puts a universal translator in their
> pocket that works anywhere, anytime, without sending a single word to any server."

Key messages: works offline · three modes · 6 QVAC capabilities chained · privacy.
The demo: turn off WiFi, speak English, French comes out of the speaker.

-----

## Key Links

- QVAC SDK GitHub: github.com/tetherto/qvac
- QVAC Documentation: docs.qvac.tether.io
- Models (Hugging Face): huggingface.co/tether-ai
- Hackathon (DoraHacks): dorahacks.io/hackathon/qvac-unleach-edge-ai-i/detail
- QVAC Discord: discord.com/invite/tetherdev
- Expo: expo.dev

-----

## Final Reminder

Before every feature implementation:

- Read this file
- Follow it strictly
- Plan component breakdown before writing any code
- Screen files max 150 lines. Component files max 200 lines.
- Never hardcode hex colors — always use `colors.X` from `useTheme()`
- Replicate UI exactly when designs are provided — match both light and dark modes
- Never compromise on the offline + privacy promise