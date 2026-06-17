// Deutsche neuronale Stimme (Beta, experimentell) via transformers.js + MMS-TTS.
// Wird – wie Kokoro – NUR auf Klick geladen. Modell: Xenova/mms-tts-deu (VITS,
// einsprachig Deutsch). Läuft komplett offline im Browser auf CPU/WASM.
//
// Hintergrund: Statt das schwere sherpa-onnx-WASM-Bundle (eigene Binär-Assets +
// COOP/COEP-Header auf GitHub Pages) einzubinden, nutzen wir dasselbe Stack wie
// Kokoro (transformers.js/onnxruntime-web). MMS-Deutsch ist eine echte deutsche
// Stimme zum direkten Vergleich – etwas robotischer als Kokoros Englisch, aber
// mit korrekter deutscher Aussprache.

import { makeProgressCallback } from './neural-util.js';

const TF_LIB = 'https://esm.sh/@huggingface/transformers@4.2.0';
const MMS_MODEL = 'Xenova/mms-tts-deu';

let synthPromise = null;
let audioCtx = null;
let currentSrc = null;

// Lädt Bibliothek + Modell genau einmal (mit q8→fp32-Fallback) und liefert die
// fertige text-to-speech-Pipeline.
function loadGerman(onStatus, onProgress) {
  if (!synthPromise) {
    synthPromise = (async () => {
      const say = (t) => { try { onStatus && onStatus(t); } catch {} };
      const prog = (p) => { try { onProgress && onProgress(p); } catch {} };

      say('1/2 · Lade transformers.js vom CDN …');
      let mod;
      try {
        mod = await import(/* @vite-ignore */ TF_LIB);
      } catch (e) {
        throw new Error('Bibliothek konnte nicht geladen werden (CDN/Netz?). ' + (e?.message || e));
      }
      const pipeline = mod.pipeline || mod.default?.pipeline;
      if (!pipeline) throw new Error('transformers.js geladen, aber kein pipeline-Export gefunden.');

      const progress_callback = makeProgressCallback(say, prog, '2/2 · Lade deutsches Sprachmodell (MMS, CPU/WASM) …');
      say('2/2 · Lade deutsches Sprachmodell (MMS, CPU/WASM, beim ersten Mal) …');
      prog(null);

      const base = { device: 'wasm', progress_callback };
      let synth;
      try {
        // Bevorzugt die kleinere quantisierte Variante.
        synth = await pipeline('text-to-speech', MMS_MODEL, { ...base, dtype: 'q8' });
      } catch (e) {
        // Fallback auf das volle Modell, falls keine q8-Datei vorhanden ist.
        try {
          synth = await pipeline('text-to-speech', MMS_MODEL, base);
        } catch (e2) {
          throw new Error('Modell-Download/-Init fehlgeschlagen. ' + (e2?.name || '') + ': ' + (e2?.message || e2));
        }
      }
      prog(100);
      return synth;
    })().catch((err) => {
      synthPromise = null; // bei Fehler erneut versuchbar
      throw err;
    });
  }
  return synthPromise;
}

// Spielt Float32-PCM über die Web-Audio-API ab (MMS liefert rohes Audio).
function playFloat(float32, rate) {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') { try { audioCtx.resume(); } catch {} }
  germanStop();
  const buf = audioCtx.createBuffer(1, float32.length, rate);
  buf.copyToChannel(float32, 0);
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.connect(audioCtx.destination);
  currentSrc = src;
  return new Promise((resolve) => {
    src.onended = () => { if (currentSrc === src) currentSrc = null; resolve(); };
    src.start();
  });
}

// Erzeugt deutsche Sprache aus Text und spielt sie ab. Liefert true bei Erfolg.
export async function germanSpeak(text, { onStatus, onProgress } = {}) {
  const say = (t) => { try { onStatus && onStatus(t); } catch {} };
  const synth = await loadGerman(onStatus, onProgress);
  say('Erzeuge Sprache … (CPU, beim ersten Mal etwas Geduld)');
  const out = await synth((text || '').trim() || 'Test.');
  await playFloat(out.audio, out.sampling_rate);
  say('✓ Fertig – Wiedergabe läuft.');
  return true;
}

export function germanStop() {
  if (currentSrc) {
    try { currentSrc.stop(); } catch {}
    currentSrc = null;
  }
}
