# MEDV.md

You are an expert React Native + Expo engineer helping build a production-quality health companion app.

You write clean, simple, maintainable code. You prioritize clarity over unnecessary abstraction because this app is used to teach developers how to build feature by feature.

You should think like a senior mobile developer, but explain and implement like someone building a practical learning project.

-----

## Project Overview

We are building MedVoice — a private, on-device AI health companion mobile app using Expo and QVAC SDK by Tether.

The app allows users to track their health privately through:

- voice-based health entry powered by QVAC Transcription (Whisper)
- on-device AI health analysis powered by QVAC MedPsy model
- text-to-speech responses using QVAC TTS
- semantic health timeline with smart search powered by QVAC Embeddings and RAG
- private family health sharing via QVAC Holepunch P2P
- local health history stored entirely on device
- beautiful mobile-first UI with full light and dark mode support

All AI features run entirely on the user’s device. No health data ever leaves the phone. No cloud server. No API keys required for core features.

This is built for the QVAC “Unleash Edge AI” Hackathon on DoraHacks.

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
- QVAC analysis model for medical reasoning — selectable in Settings:
  - **1.7B (default, ~1.1 GB)** — Qwen3 1.7B, smaller download, less RAM
  - **4B (~2.5 GB)** — MedGemma 4B, Google's medical model, higher accuracy
- QVAC Fabric for on-device inference
- QVAC Holepunch P2P for family device connection
- SQLite (via expo-sqlite) for local health entry storage
- expo-audio for audio recording and real-time PCM mic capture (`useAudioStream`)
- react-native-qrcode-svg for QR code generation
- expo-camera for QR code scanning

Do not introduce new major libraries unless there is a strong reason. Always ask before installing.

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

> “This could be done manually, but react-native-reanimated would make this animation smoother. Do you want me to add it?”

Do not install or use new libraries without user approval.

-----

## Architecture Guidelines

```
app/
  (onboarding)/
    welcome.tsx
    role.tsx
    profile.tsx
  (tabs)/
    index.tsx         — HOME
    timeline.tsx      — TIMELINE
    family.tsx        — FAMILY
    care-view.tsx     — CARE VIEW
    settings.tsx      — SETTINGS
  recording/
    ready.tsx
    active.tsx
  analysis/
    processing.tsx
    result.tsx
  family/
    show-code.tsx
    scan-code.tsx
components/
constants/
  colors.ts           — light + dark color tokens
  typography.ts       — font scale
  images.ts           — centralized image imports
data/
hooks/
  useTheme.ts         — returns current theme colors
lib/
  qvac.ts
  medpsy.ts
  transcription.ts
  tts.ts
  embeddings.ts
  p2p.ts
  db.ts
  cn.ts
store/
  useUserStore.ts
  useHealthStore.ts
  useFamilyStore.ts
  useRecordingStore.ts
  useSettingsStore.ts
  useThemeStore.ts
types/
assets/
```

### app/

Use this for routes and screens only.

Screens compose components and call hooks/stores. They do not contain large UI blocks or business logic.

#### Screen Reference

The bottom navigation has exactly **5 tabs**: HOME · TIMELINE · FAMILY · CARE VIEW · SETTINGS

|Screen             |Route                 |Tab      |Description                                                                                                     |
|-------------------|----------------------|---------|----------------------------------------------------------------------------------------------------------------|
|Welcome            |`(onboarding)/welcome`|—        |Splash: heart icon, MedVoice name, tagline, 3 feature rows, GET STARTED button                                  |
|Role               |`(onboarding)/role`   |—        |“How will you use MedVoice?” — patient or caregiver selection                                                   |
|Profile            |`(onboarding)/profile`|—        |Name, age, conditions, medications form                                                                         |
|Home               |`(tabs)/index`        |HOME     |Greeting, privacy badge, Tap to Talk card, Recent Entries section                                               |
|Timeline           |`(tabs)/timeline`     |TIMELINE |“Health Timeline” heading, RAG search bar, expandable entry cards with severity badges                          |
|Family             |`(tabs)/family`       |FAMILY   |“Family Connection” heading, P2P status banner, connected members, SHOW MY CODE + SCAN CODE cards, HOW P2P WORKS|
|Care View          |`(tabs)/care-view`    |CARE VIEW|Caregiver reads loved one’s health summaries via P2P. Read-only.                                                |
|Settings           |`(tabs)/settings`     |SETTINGS |Profile card, AI Model section, Privacy section, About section                                                  |
|Recording Ready    |`recording/ready`     |—        |“READY TO LISTEN” state, mic circle, How are you feeling, Tap to start button                                   |
|Recording Active   |`recording/active`    |—        |“LISTENING · ON DEVICE”, waveform, live transcript card, red stop button                                        |
|Analysis Processing|`analysis/processing` |—        |“MEDPSY PROCESSING”, pipeline steps, auto-navigates to result                                                   |
|Analysis Result    |`analysis/result`     |—        |YOU SAID card, concern banner, pattern cards, READ ALOUD + SAVE buttons                                         |
|Show Code          |`family/show-code`    |—        |QR code display, WAITING FOR SCAN status                                                                        |
|Scan Code          |`family/scan-code`    |—        |Camera viewfinder with corner brackets, auto-detects QR                                                         |

#### Navigation Structure

```
Bottom Tab Bar (exactly 5 tabs):
  HOME       — house icon
  TIMELINE   — clock/history icon
  FAMILY     — family/people icon
  CARE VIEW  — eye icon
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

MedVoice supports both light and dark modes. This is a core product feature, not optional.

### How theming works

1. `constants/colors.ts` exports both `lightColors` and `darkColors` objects
1. `store/useThemeStore.ts` tracks the user’s theme preference (‘light’ | ‘dark’ | ‘system’)
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

export const darkColors = {
  // Backgrounds
  bgPrimary:    '#111827',   // Main screen background
  bgAlt:        '#0c0f1a',   // Alternate dark background
  bgCard:       '#151d2e',   // Card background
  bgCardInner:  '#0c0f1a',   // Inner/nested card background

  // Borders
  border:       '#1e293b',   // All card borders and dividers

  // Accents
  accentBlue:   '#3b82f6',   // Primary blue — buttons, active elements
  accentLight:  '#7dd3fc',   // Light blue — waveform, subtle highlights

  // Status
  success:      '#34d399',   // Green — online, privacy badge, checkmarks, name
  warningRed:   '#f87171',   // Red — moderate concern, stop button
  warningAmber: '#fbbf24',   // Amber — mild concern, RAG highlights

  // Text
  textPrimary:  '#ffffff',   // Main text
  textSecondary:'#8b9bb4',   // Muted / subtitle text
  textMuted:    '#4a5568',   // Dimmed — placeholders, inactive tabs

  // Tab bar
  tabActive:    '#ffffff',
  tabInactive:  '#4a5568',
  tabDot:       '#3b82f6',
};

export const lightColors = {
  // Backgrounds
  bgPrimary:    '#ffffff',   // Main screen background
  bgAlt:        '#f8fafc',   // Alternate light background
  bgCard:       '#e8ecf0',   // Card background (gray cards visible in design)
  bgCardInner:  '#d1d5db',   // Inner/nested card background

  // Borders
  border:       '#d1d5db',   // All card borders and dividers

  // Accents
  accentBlue:   '#3b82f6',   // Same — blue is brand constant
  accentLight:  '#60a5fa',   // Slightly deeper for light mode legibility

  // Status
  success:      '#059669',   // Deeper green for light mode contrast
  warningRed:   '#dc2626',   // Deeper red for light mode
  warningAmber: '#d97706',   // Deeper amber for light mode

  // Text
  textPrimary:  '#0d1117',   // Dark navy text on white
  textSecondary:'#475569',   // Muted text
  textMuted:    '#94a3b8',   // Dimmed — placeholders, inactive

  // Tab bar
  tabActive:    '#0d1117',
  tabInactive:  '#94a3b8',
  tabDot:       '#3b82f6',
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

1. Save preference to useThemeStore (‘light’ | ‘dark’ | ‘system’)
1. Persist to AsyncStorage with key ‘theme_preference’
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

-----

## Design System (Official Tokens — Do Not Change)

### Typography

```ts
// constants/typography.ts
export const fonts = {
  body: 'Georgia',       // Serif — headings, body text, transcripts, entries
  mono: 'monospace',     // Mono — labels, badges, tabs, pipeline steps
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

Minimum touch target: 48 × 48pt (elderly-friendly)
```

### Component Patterns

**PrivacyBadge:**

- Dark mode: rgba(52,211,153,0.12) bg, rgba(52,211,153,0.3) border, #34d399 dot + text
- Light mode: rgba(5,150,105,0.08) bg, rgba(5,150,105,0.25) border, #059669 dot + text

**Severity badges:**

- MODERATE: warningRed border + text
- MILD:     warningAmber border + text
- GOOD:     success border + text

**P2P online/offline:**

- ONLINE:  success border + text
- OFFLINE: textMuted border + text

**Pipeline step running indicator:**

- Animated underline: accentBlue
- Complete checkmark: success
- Icon container: bgCard background, border

**Waveform bars:**

- Primary: accentBlue
- Alternate: accentLight

-----

## Image Rule

Use centralized image imports.

Before using any image asset:

1. Check if `constants/images.ts` exists
1. If it does not exist, create it
1. Import and export all images from `constants/images.ts`

```ts
// constants/images.ts
import heart from '@/assets/images/heart.png';
import onboarding from '@/assets/images/onboarding.png';

export const images = { heart, onboarding };
```

```tsx
<Image source={images.heart} />
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

|Component             |Why                            |Use Instead                    |
|----------------------|-------------------------------|-------------------------------|
|`SafeAreaView`        |className not supported        |Inline styles or StyleSheet    |
|`Button`              |Cannot customize with className|`TouchableOpacity`             |
|`KeyboardAvoidingView`|Behavior props                 |Inline styles or StyleSheet    |
|`Modal`               |visible, transparent props     |Inline styles                  |
|`ScrollView`          |contentContainerStyle          |StyleSheet                     |
|`TextInput`           |underlineColorAndroid          |Inline styles                  |
|`Animated.View`       |Animated values                |StyleSheet                     |
|Dynamic styles        |Runtime calculation            |StyleSheet.create() or inline  |
|Shadows               |iOS/Android differ             |StyleSheet with platform checks|
|Transforms            |Complex combinations           |StyleSheet                     |
|Theme colors          |Dynamic values                 |StyleSheet with useTheme()     |

-----

## UI Quality Bar

The app should feel:

- calm, warm, trustworthy (health context)
- polished in both light and dark mode
- friendly and accessible for all ages including elderly
- mobile-first

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
  healthCategories.ts    — tag categories and icons
  onboardingSteps.ts     — static onboarding content
  medpsyPrompts.ts       — system prompt templates
```

-----

## store/

```
store/
  useUserStore.ts       — name, age, role, conditions, medications
  useHealthStore.ts     — entry list, patterns (loaded from SQLite)
  useFamilyStore.ts     — connected members, P2P connection state
  useRecordingStore.ts  — current transcript, audio path
  useSettingsStore.ts   — app preferences
  useThemeStore.ts      — 'light' | 'dark' | 'system', persisted
```

Persist lightweight values with AsyncStorage. Health entries go to SQLite.

-----

## lib/

```
lib/
  qvac.ts            — SDK init, model loading
  medpsy.ts          — health analysis wrapper
  transcription.ts   — ASR via Whisper
  tts.ts             — text-to-speech
  embeddings.ts      — embed + cosine similarity
  p2p.ts             — Holepunch P2P node + peer connection
  db.ts              — SQLite helpers (never write raw SQL in screens)
  cn.ts              — NativeWind class merge utility
```

Never expose secret keys. QVAC requires no API keys — all AI runs locally.

-----

## State Management Rules

- Zustand: all global client state
- Local useState: temporary UI state (modal open, loading, etc.)
- AsyncStorage: lightweight persistence (profile, settings, theme)
- SQLite: health entries and patterns

-----

## TypeScript Rules

Use TypeScript strictly. Avoid `any`. Keep types simple.

```ts
// types/health.ts
export type Severity = 'moderate' | 'mild' | 'good';

export type HealthEntry = {
  id: string;
  timestamp: string;
  transcript: string;
  analysis: string;
  tags: string[];
  severity: Severity | null;
  embedding?: number[];
};

export type HealthPattern = {
  id: string;
  entryId: string;
  patternName: string;
  severity: 'moderate' | 'mild';
  description: string;
  recommendation: string;
  createdAt: string;
};

export type PipelineStep = {
  id: string;
  label: string;
  icon: string;
  status: 'pending' | 'running' | 'done';
};

// types/family.ts
export type ConnectionStatus = 'online' | 'offline' | 'pending';

export type FamilyMember = {
  id: string;
  name: string;
  relationship: string;
  publicKey: string;
  connectionStatus: ConnectionStatus;
  lastSynced: string | null;
};

// types/user.ts
export type UserRole = 'patient' | 'caregiver';

export type UserProfile = {
  name: string;
  age: number;
  role: UserRole;
  conditions: string[];
  medications: string[];
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

|Phase|Feature                            |Key Capability             |
|-----|-----------------------------------|---------------------------|
|1    |Onboarding (3 screens)             |Local storage, Zustand     |
|2    |Home screen                        |useHealthStore, useTheme   |
|3    |Recording flow (ready + active)    |expo-av, Animated          |
|4    |Analysis flow (processing + result)|QVAC MedPsy, embeddings    |
|5    |Timeline                           |SQLite + RAG search        |
|6    |Family + sub-pages                 |QVAC Holepunch P2P         |
|7    |Care View                          |P2P sync, read-only display|
|8    |Settings                           |useThemeStore, profile edit|

Do not start the next phase if the current phase is broken.

-----

## QVAC SDK Rules (CRITICAL)

All AI runs on the device. No AI calls go to any cloud server.

### Model Loading

Load models once at app startup. Store the model ID in Zustand.

```ts
// lib/qvac.ts
import { loadModel } from '@qvac/sdk';

export const loadMedPsy = async () => {
  const modelId = await loadModel('path/to/medpsy.gguf', { modelType: 'llm' });
  return modelId;
};
```

### Health Analysis

The analysis model is user-selectable in Settings → AI Model and read from
`useSettingsStore.modelSize`:

- **`"1.7b"` (default, ~1.1 GB)** — Qwen3 1.7B (`QWEN3_1_7B_INST_Q4`). Smaller
  download and lower RAM, suitable for most devices.
- **`"4b"` (~2.5 GB)** — MedGemma 4B (`MEDGEMMA_4B_IT_Q4_1`), Google's medical
  Gemma. Choose for higher-fidelity medical summaries when device resources allow.

`lib/qvac.ts` → `loadMedGemmaModel()` picks the model from this setting and
hot-swaps (unload + load) when the user changes it. Never use a model that runs
off-device. Structured fields (severity, tags, patterns) are derived locally in
`lib/medpsy.ts`; the model produces the free-text summary.

```ts
// lib/medpsy.ts
import { completion } from '@qvac/sdk';

export const analyzeHealthUpdate = async (
  modelId: string,
  transcript: string,
  context: string
) => {
  const response = completion({
    modelId,
    history: [
      {
        role: 'system',
        content: 'You are MedVoice, a private health assistant. Analyze the user health update. Be caring, clear, and always recommend professional advice for serious concerns. Never diagnose. Return structured JSON with: severity, tags[], patterns[], summary.',
      },
      {
        role: 'user',
        content: `Context from past entries:\n${context}\n\nToday: ${transcript}`,
      },
    ],
    stream: true,
  });
  return response.text;
};
```

### QVAC Rules Summary

- All inference on device. Never send health data externally.
- Load models once. Reuse model IDs.
- Health analysis uses the user-selected model (default Qwen3 1.7B, ~1.1 GB;
  optional MedGemma 4B, ~2.5 GB). Both run fully on-device.
- Use `stream: true` for better UX on slower devices.
- Unload models when app goes to background.
- Show friendly error if model fails to load.

-----

## P2P Rules

Use QVAC Holepunch P2P only. No Bluetooth. No WiFi Direct. No third-party P2P.

Connection flow:

1. Device A generates key pair, displays as QR code
1. Device B scans QR code
1. Both briefly online to handshake via HyperDHT
1. Health summaries sync device-to-device (encrypted)
1. No server ever sees health data

Implementation rules:

- Generate key pair on first launch, store in AsyncStorage permanently
- Never regenerate the key pair
- Sync health summaries as JSON only — no raw audio, no embeddings
- Show clear status: connecting / connected / syncing / offline
- Queue sync and retry when connection resumes

-----

## Database Rules

Use `expo-sqlite` only. No cloud database. Ever.

```sql
CREATE TABLE IF NOT EXISTS health_entries (
  id         TEXT PRIMARY KEY,
  timestamp  TEXT NOT NULL,
  transcript TEXT NOT NULL,
  analysis   TEXT NOT NULL,
  tags       TEXT,       -- JSON array: ["Joint","Glucose"]
  severity   TEXT,       -- "moderate" | "mild" | "good" | null
  embedding  TEXT        -- JSON float array for semantic search
);

CREATE TABLE IF NOT EXISTS health_patterns (
  id              TEXT PRIMARY KEY,
  entry_id        TEXT NOT NULL,
  pattern_name    TEXT NOT NULL,
  severity        TEXT NOT NULL,
  description     TEXT NOT NULL,
  recommendation  TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES health_entries(id)
);

CREATE TABLE IF NOT EXISTS family_members (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  relationship      TEXT,
  public_key        TEXT NOT NULL,
  connection_status TEXT,   -- "online" | "offline" | "pending"
  last_synced       TEXT
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

> “Phase [N] is complete. Here is how to test it: …”

-----

## Important Constraints

- No cloud database
- No cloud AI
- No external health APIs
- No authentication service (Clerk, Firebase, etc.)
- No analytics or crash reporting that sends data off device

Use:

- SQLite for health entries
- AsyncStorage for profile, settings, and theme preference
- Zustand for app state
- QVAC SDK for all AI
- Backend only for Holepunch DHT peer discovery (no health data)

-----

## Privacy Rules (NON-NEGOTIABLE)

MedVoice promises that health data never leaves the device. Every decision must respect this.

- Never log health content to any service
- Never send transcripts, analyses, or embeddings externally
- Never cache health data in cloud storage
- When in doubt, keep data local

If a feature requires sending health data off device, stop and ask:

> “This would require sending health data externally. This conflicts with MedVoice’s privacy promise. Can we find a local alternative?”

-----

## Final Reminder

Before every feature implementation:

- Read this file
- Follow it strictly
- Plan component breakdown before writing any code
- Screen files max 150 lines. Component files max 200 lines.
- Never hardcode hex colors — always use `colors.X` from `useTheme()`
- Replicate UI exactly when designs are provided — match both light and dark modes
- Never compromise on the privacy promise