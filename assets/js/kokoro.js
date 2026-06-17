// Kokoro-TTS (Beta, experimentell): neuronale Sprachsynthese komplett im Browser.
// Wird NUR auf ausdrücklichen Wunsch geladen (Button in den Einstellungen) –
// die Bibliothek (~transformers.js + onnxruntime-web) und das Modell (~80 MB)
// werden per dynamischem Import von einem CDN bzw. von HuggingFace geholt und
// danach im Browser-Cache gehalten. Für den Normalbetrieb der App wird hier
// nichts geladen.
//
// WICHTIG: Das offizielle Kokoro-Modell kann (noch) KEIN Deutsch – die Stimmen
// sind englisch. Deutsche Texte klingen daher englisch ausgesprochen. Dieser
// Test dient dazu, Klang und Performance auf dem echten Gerät zu beurteilen.

// Modell-Repository (ONNX-Variante, die kokoro-js nutzt) und CDN der Bibliothek.
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

// Lädt Bibliothek + Modell genau einmal. onStatus(text) für UI-Rückmeldung.
function loadKokoro(onStatus) {
  if (!ttsPromise) {
    ttsPromise = (async () => {
      const say = (t) => { try { onStatus && onStatus(t); } catch {} };
      say('Lade Kokoro-Bibliothek …');
      const mod = await import(/* @vite-ignore */ KOKORO_LIB);
      const KokoroTTS = mod.KokoroTTS || mod.default?.KokoroTTS;
      if (!KokoroTTS) throw new Error('kokoro-js konnte nicht geladen werden.');
      const webgpu = typeof navigator !== 'undefined' && 'gpu' in navigator;
      say(`Lade Sprachmodell … (~80 MB, nur beim ersten Mal · ${webgpu ? 'WebGPU' : 'WASM'})`);
      const tts = await KokoroTTS.from_pretrained(KOKORO_MODEL, {
        dtype: webgpu ? 'fp32' : 'q8',
        device: webgpu ? 'webgpu' : 'wasm',
      });
      return tts;
    })().catch((err) => {
      ttsPromise = null; // bei Fehler erneut versuchbar
      throw err;
    });
  }
  return ttsPromise;
}

// Erzeugt Sprache aus Text und spielt sie ab. Liefert true bei Erfolg.
export async function kokoroSpeak(text, { voice = 'af_heart', onStatus } = {}) {
  const say = (t) => { try { onStatus && onStatus(t); } catch {} };
  const tts = await loadKokoro(onStatus);
  say('Erzeuge Sprache …');
  const audio = await tts.generate((text || '').trim() || 'Test.', { voice });
  const blob = audio.toBlob();
  const url = URL.createObjectURL(blob);
  kokoroStop();
  const el = new Audio(url);
  currentAudio = el;
  el.addEventListener('ended', () => URL.revokeObjectURL(url));
  await el.play();
  say('');
  return true;
}

export function kokoroStop() {
  if (currentAudio) {
    try { currentAudio.pause(); } catch {}
    currentAudio = null;
  }
}
