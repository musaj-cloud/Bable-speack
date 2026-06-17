# BabelSpeak

**The universal translator that works offline.**

Speak, photograph, or record. Translate anything, anywhere, with no internet.
All AI runs entirely on your phone — no text, audio, or image ever leaves the device.

Built for the QVAC "Unleash Edge AI" Hackathon on DoraHacks using the
[QVAC SDK](https://github.com/tetherto/qvac) by Tether.

## Three modes

- **Converse** — real-time voice translation: speak in one language, hear it spoken back in another
- **Document** — photograph a sign, menu, or document and read it translated
- **Meeting** — record a multilingual conversation and get a translated, summarized transcript

## Tech stack

Expo · React Native · TypeScript · Expo Router · NativeWind · Zustand ·
AsyncStorage · SQLite (expo-sqlite) · QVAC SDK (`@qvac/sdk`).

## QVAC capabilities used (all free, Apache 2.0, on-device)

Transcription (Whisper) · Translation (Bergamot) · Text Generation (cleanup) ·
TTS · OCR · Text Embeddings (RAG).

## Privacy promise

Nothing you say, photograph, or record ever leaves your phone. No cloud server.
No API keys. No accounts.

## Getting started

```bash
npm install
npm run start
```

## Build phases

1. Onboarding + text translation
2. Converse mode (voice → translate → speech)
3. Document mode (camera → OCR → translate)
4. History + semantic search
5. Polish + demo prep

See [AGENTS.md](AGENTS.md) for the full build guide, architecture, design system,
and contribution rules.

## License

Apache 2.0. All QVAC tooling is free and open source.