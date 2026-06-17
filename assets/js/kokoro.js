// Kokoro-TTS (Beta, experimentell): neuronale Sprachsynthese komplett im Browser.
// Wird NUR auf ausdrücklichen Wunsch geladen (Button in den Einstellungen) –
// die Bibliothek (transformers.js + onnxruntime-web) und das Modell (~86 MB, q8)
// werden per dynamischem Import von einem CDN bzw. von HuggingFace geholt und
// danach im Browser-Cache gehalten. Für den Normalbetrieb wird hier nichts geladen.
//
// WICHTIG: Das offizielle Kokoro-Modell kann (noch) KEIN Deutsch – die Stimmen
// sind englisch. Deutsche Texte klingen daher englisch ausgesprochen. Dieser
// Test dient zur Beurteilung von Klang und Performance auf dem echten Gerät.
//
// Wir nutzen bewusst WASM (CPU) + q8: läuft auf jedem Gerät ohne WebGPU und lädt
// am wenigsten herunter. Etwas langsamer, aber zuverlässig zum Antesten.

import { makeProgressCallback } from './neural-util.js';

const KOKORO_LIB = 'https://esm.sh/kokoro-js@1.2.1';
const KOKORO_MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';

// Eine kleine Auswahl Stimmen (a = American, b = British; f/m = Geschlecht).
export const KOKORO_VOICES = [
  { id: 'af_heart',   label: 'Heart (US, weiblich)' },
  { id: 'af_bella',   label: 'Bella (US, weiblich)' },
  { id: 'am_michael', label: 'Michael (US, männlich)' },
  { id: 'am_adam',    label: 'Adam (US, männlich)' },
  { id: 'bf_emma',    label: 'Emma (UK, weiblich)' },
  { id: 'bm_george',  label: 'George (UK, männlich)' },
];

let ttsPromise = null;     // Promise auf die geladene KokoroTTS-Instanz
let currentAudio = null;   // aktuell spielendes <audio> (zum Stoppen)

// Lädt Bibliothek + Modell genau einmal, mit Fortschritts-Rückmeldung.
//   onStatus(text)      – Textstatus für die UI
//   onProgress(pct|null)– Gesamtfortschritt 0..100 (oder null = unbestimmt)
function loadKokoro(onStatus, onProgress) {
  if (!ttsPromise) {
    ttsPromise = (async () => {
      const say = (t) => { try { onStatus && onStatus(t); } catch {} };
      const prog = (p) => { try { onProgress && onProgress(p); } catch {} };

      say('1/2 · Lade Kokoro-Bibliothek vom CDN …');
      let mod;
      try {
        mod = await import(/* @vite-ignore */ KOKORO_LIB);
      } catch (e) {
        throw new Error('Bibliothek konnte nicht geladen werden (CDN/Netz?). ' + (e?.message || e));
      }
      const KokoroTTS = mod.KokoroTTS || mod.default?.KokoroTTS;
      if (!KokoroTTS) throw new Error('kokoro-js geladen, aber kein KokoroTTS-Export gefunden.');

      const progress_callback = makeProgressCallback(say, prog, '2/2 · Lade Sprachmodell (CPU/WASM, q8) …');
      say('2/2 · Lade Sprachmodell (CPU/WASM, q8, ~86 MB beim ersten Mal) …');
      prog(null);
      let tts;
      try {
        tts = await KokoroTTS.from_pretrained(KOKORO_MODEL, {
          dtype: 'q8',
          device: 'wasm',
          progress_callback,
        });
      } catch (e) {
        throw new Error('Modell-Download/-Init fehlgeschlagen. ' + (e?.name || '') + ': ' + (e?.message || e));
      }
      prog(100);
      return tts;
    })().catch((err) => {
      ttsPromise = null; // bei Fehler erneut versuchbar
      throw err;
    });
  }
  return ttsPromise;
}

// Erzeugt Sprache aus Text und spielt sie ab. Liefert true bei Erfolg.
export async function kokoroSpeak(text, { voice = 'af_heart', onStatus, onProgress } = {}) {
  const say = (t) => { try { onStatus && onStatus(t); } catch {} };
  const tts = await loadKokoro(onStatus, onProgress);
  say('Erzeuge Sprache … (beim ersten Mal etwas Geduld – läuft auf der CPU)');
  const audio = await tts.generate((text || '').trim() || 'Test.', { voice });
  const blob = audio.toBlob();
  const url = URL.createObjectURL(blob);
  kokoroStop();
  const el = new Audio(url);
  currentAudio = el;
  el.addEventListener('ended', () => URL.revokeObjectURL(url));
  await el.play();
  say('✓ Fertig – Wiedergabe läuft.');
  return true;
}

export function kokoroStop() {
  if (currentAudio) {
    try { currentAudio.pause(); } catch {}
    currentAudio = null;
  }
}
