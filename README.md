# BabelSpeak

> **The universal translator that works with no internet.** Speak, photograph, or record — every AI step runs on your phone. Nothing ever leaves the device.

<div align="center">

### ▶️ &nbsp; [**Watch the Demo Video**](#) &nbsp; · &nbsp; 📥 &nbsp; [**Download the APK**](#) &nbsp; · &nbsp; 🔗 &nbsp; [**DoraHacks Submission**](#)

</div>

<!-- TODO: replace the # placeholders above with the real links -->

---

##  The Story Behind BabelSpeak

A few years ago, a friend of mine travelled to a small town where almost no one spoke her language. She told me about a night she'll never forget she got lost, her phone had no signal, and the one app she trusted to help her, Google Translate, simply stopped working. No bars, no translation. She stood at a junction unable to ask a single person for directions, holding a phone that was useless the moment it left WiFi.

That stayed with me. We talk about translation like it's a solved problem but every mainstream translator quietly assumes one thing: that you have internet. Turn off the signal and the magic disappears. Yet the people who need translation the most are often exactly the ones without reliable connectivity: travellers in rural areas, refugees crossing borders, aid workers in disaster zones, market traders, students far from home.

Then I asked a simple question:

> **"What if the translator lived entirely inside the phone?"**

What if you could land in a country with no SIM card, no WiFi, airplane mode on — and still:

- *Speak English and hear French come out of the speaker.*
- *Photograph a menu or a road sign and read it in your own language.*
- *Record a multilingual meeting and walk away with a translated, summarized transcript.*

And what if none of it not a single word, photo, or second of audio ever left the device? No cloud. No API keys. No account.

**That idea became BabelSpeak.**

BabelSpeak is a private, fully-offline universal translator. You speak, photograph, or record, and every AI step transcription, translation, cleanup, speech, OCR, embeddings runs locally on your phone via the QVAC SDK. It even lets two phones hold a live cross-language conversation directly device-to-device over a serverless P2P channel, where only the translated text crosses the wire, never your voice.

Everything happens on the device. No cloud. No API keys. No data leaves the phone. Ever. Because for 40% of the world with no reliable internet, an online-only translator isn't a tool, it's a promise that breaks the moment they need it.

---

**A private, fully-offline universal translator. Speak, photograph, or record. Translate anything, anywhere nothing ever leaves your phone.**

Built for the **QVAC "Unleash Edge AI" Hackathon** by Tether, on DoraHacks.

> **The demo moment:** Turn off WiFi on stage. Speak English. Hear French back. No internet. That is edge AI.

---

##  The Problem

Every mainstream translator Google Translate, DeepL, Apple Translate — depends on cloud servers. The moment you lose signal, they fail. And the people who need translation most (travellers in rural areas, refugees, aid workers, anyone in a disaster zone) are precisely those least likely to have reliable internet. On top of that, every phrase you translate is sent to, and often retained by, a third party.

##  The Solution

BabelSpeak translates **just by speaking, photographing, or recording**, with **every AI step running locally on the device** via the QVAC SDK. No account. No internet required for AI. No data collection. A privacy promise that is architecturally enforced, not just stated.

---

##  Core Features

| Feature | What it does | QVAC capability |
|---|---|---|
| **Converse** | Speak in one language, hear it spoken back in another in real time (live streaming transcription) | Transcription (Whisper) + Translation (Bergamot) + TTS |
| **Document** | Photograph a sign, menu, or document and read it translated | OCR + Translation |
| **Meeting** | Record a multilingual conversation → translated, summarized transcript | Transcription + Translation + Text Generation (summary) |
| **History** | Search past translations by meaning, not keywords | Embeddings + on-device RAG |
| **Ask Your History** | Ask a natural-language question and get a grounded answer drawn from your own past entries | Embeddings retrieval + Text Generation (RAG Q&A) |
| **Live Conversation (P2P)** | Two phones, no shared WiFi, a real cross-language chat where each phone translates locally | Holepunch P2P (HyperDHT) |
| **Light & dark mode** | Polished, accessible, travel-inspired UI (Material 3) | — |

**Everything above runs on the phone.** The only network use is the Holepunch DHT for P2P peer discovery — and even that carries **only already-translated text, never raw audio.**

---

##  Privacy Promise (Non-Negotiable)

- ❌ No cloud database
- ❌ No cloud AI / external inference (no Google Translate, no DeepL)
- ❌ No external translation or speech APIs
- ❌ No analytics or crash reporting that sends data off device
- ✅ Translation history stored locally in **SQLite**
- ✅ Language pair / settings / theme in **AsyncStorage**
- ✅ All AI inference on-device via **QVAC SDK**
- ✅ Live Conversation is **serverless, peer-to-peer**, translated-text-only

---

##  Tech Stack

- **Framework:** Expo SDK 54 · React Native 0.81 · TypeScript · Expo Router (file-based routing)
- **AI / Edge inference:** [`@qvac/sdk`](https://github.com/tetherto/qvac) `0.13.x` — transcription, translation, text generation, TTS, OCR, embeddings
- **P2P:** QVAC Holepunch (HyperDHT) via a Bare worklet bundled with `bare-pack` (`react-native-bare-kit`)
- **State:** Zustand · **Local DB:** `expo-sqlite` · **Persistence:** AsyncStorage
- **Audio:** `expo-audio` + `expo-stream-audio` (real-time PCM mic capture for live streaming transcription)
- **Camera / Document:** `expo-camera` + `expo-image-picker`
- **UI:** NativeWind v4 / Tailwind CSS · `react-native-reanimated` · light + dark theming (Material 3 tokens)

### QVAC capabilities (7, chained — all free, Apache 2.0, on-device)

| Step | Capability | What it does |
|---|---|---|
| 1 | Transcription (Whisper) | Speech → text |
| 2 | Translation (Bergamot) | Source → target language |
| 3 | Text Generation (Qwen3) | Cleanup + Meeting summaries + RAG answers |
| 4 | TTS (Supertonic) | Speaks the translation aloud |
| 5 | OCR | Extracts text from photos |
| 6 | Embeddings (EmbeddingGemma) | Semantic history search + RAG |
| 7 | Holepunch P2P (HyperDHT) | Serverless device-to-device channel |

Models download once on first use and run entirely offline thereafter.

---

## 📱 App Flow

```
Onboarding (intro · language pair · offline-ready)
      │
      ▼
   CONVERSE ──hold mic──► speak → transcribe → translate → speak back (TTS)
      │
   DOCUMENT ──photo──► OCR → translate → read aloud
      │
   MEETING ──record──► transcribe → translate → summarize → transcript
      │
   HISTORY ◄── semantic RAG search + "Ask Your History" Q&A
      │
   LIVE (P2P) ──pair code / QR──► two phones, each translates locally
      │
   SETTINGS (languages · TTS · theme · storage · about)
```

The bottom navigation has 5 tabs: **CONVERSE · DOCUMENT · MEETING · HISTORY · SETTINGS** — with Live Conversation behind its own entry so a P2P failure never breaks the core app.

---

##  Running Locally

> BabelSpeak uses native modules (QVAC SDK, Bare P2P worklet, camera, audio). **It requires a development build — it will not run in Expo Go.** The QVAC runtime needs a **physical arm64 device** (no emulator).

### Prerequisites
- Node.js 18+
- A physical arm64 Android device (Android 10+ / minSdkVersion 29) with USB debugging
- ~2–3 GB free storage on device for AI models

### Steps
```bash
# 1. Install dependencies
npm install

# 2. (P2P only) bundle the Holepunch worklet
npm run build:p2p

# 3. Build & run a development client
npx expo run:android      # local build, or use EAS cloud (below)

# 4. Daily work — JS/TSX edits hot-reload, no rebuild
npx expo start --dev-client
```

Cloud build (no local Android SDK needed):
```bash
eas build --profile development --platform android
```

On first launch, granting microphone/camera permission and picking a language pair triggers a one-time on-device model download.

### Quality gates
```bash
npm run lint
npm run typecheck
```

> ⚠️ Do not remove the `expo-font` → `14.0.12` override in `package.json` — a newer build crashes on SDK 54. After any dependency change, run `npm ls expo-font` to confirm a single SDK 54 version.

---

##  Project Structure

```
app/            Expo Router screens (onboarding, tabs, document/meeting results, live P2P)
components/     Reusable UI (cards, badges, waveform, language selector, pipeline rows)
lib/            qvac · transcription · translation · cleanup · tts · ocr · embeddings
                · rag · llm · summarize · db · p2p · pairing · liveMic
store/          Zustand stores (onboarding, language, converse, document, meeting,
                history, settings, theme, p2p)
constants/      colors.ts (light+dark Material 3 tokens) · typography.ts · images.ts
data/           languages · onboarding content · mode cards
p2p / scripts/  Bare worklet + build-p2p.mjs bundler
types/          Shared TypeScript types
```

---

##  Demo

- **Demo video:** _<!-- TODO: add public YouTube/Vimeo link (record with WiFi off) -->_
- **Download APK (Android):** _<!-- TODO: add EAS build / APK link -->_
- **Screenshots:** _<!-- TODO: add screenshots in /docs -->_

---

##  Team

- **Ajibade Muhammod** — Developer — GitHub [@muhaj-dev](https://github.com/muhaj-dev) · DoraHacks [@muhaj](https://dorahacks.io/hacker/Muhaj)
- **Adeshina Fuad** — Designer · DoraHacks [@leadui](https://dorahacks.io/hacker/Leadui)

---

##  License

Apache 2.0. All QVAC tooling is free and open source.

See [AGENTS.md](AGENTS.md) for the full build guide, architecture, design system, and contribution rules.

---

*Built with ❤️ and zero cloud calls using the QVAC SDK by Tether.*
