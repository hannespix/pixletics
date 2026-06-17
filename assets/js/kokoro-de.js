// Deutsche neuronale Stimme „Martin" (Beta) – Kokoro-82M, auf Deutsch nachtrainiert.
// Modell: Godelaune/Kokoro-82M-ONNX-German-Martin (Apache-2.0), Einzelsprecher.
// Läuft komplett im Browser auf CPU/WASM via onnxruntime-web. Wird NUR auf Klick
// geladen. Erst-Download des Modells ~310 MB von HuggingFace (danach im Cache).
//
// Pipeline (1:1 nach der Referenz kokoro-onnx, damit Tokens/Phoneme/Stimmvektor
// exakt passen):
//   Text --espeak-ng(de)--> IPA-Phoneme --Vokabular--> Token-IDs
//   Tokens [0, …, 0] + Stimmvektor (Zeile = Phonem-Anzahl) + Speed -> ONNX -> Audio
//
// Der Stimmvektor (martin.npy aus voices-martin.npz, Form 510×1×256, float32)
// liegt vorab extrahiert als kompakte Rohdatei im Repo (assets/models), damit der
// Browser nur das große Modell laden muss und kein .npz parsen.

import { mb } from './neural-util.js';

const ORT_LIB = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/ort.wasm.bundle.min.mjs';
const PHON_LIB = 'https://cdn.jsdelivr.net/npm/phonemizer@1.2.1';
const MODEL_URL = 'https://huggingface.co/Godelaune/Kokoro-82M-ONNX-German-Martin/resolve/main/kokoro-martin.onnx';
const VOICE_URL = new URL('../models/martin-voice.f32', import.meta.url).href;

const SAMPLE_RATE = 24000;
const MAX_PHONEME_LENGTH = 510;
const STYLE_DIM = 256;

// Phonem -> Token-ID (verbatim aus kokoro-onnx/config.json, als \u-Escapes
// erzeugt, damit die IPA-Zeichen unzweifelhaft korrekt sind).
const VOCAB = {
  ';': 1, ':': 2, ',': 3, '.': 4, '!': 5, '?': 6, '—': 9, '…': 10,
  '"': 11, '(': 12, ')': 13, '“': 14, '”': 15, ' ': 16, '̃': 17, 'ʣ': 18,
  'ʥ': 19, 'ʦ': 20, 'ʨ': 21, 'ᵝ': 22, 'ꭧ': 23, 'A': 24, 'I': 25, 'O': 31,
  'Q': 33, 'S': 35, 'T': 36, 'W': 39, 'Y': 41, 'ᵊ': 42, 'a': 43, 'b': 44,
  'c': 45, 'd': 46, 'e': 47, 'f': 48, 'h': 50, 'i': 51, 'j': 52, 'k': 53,
  'l': 54, 'm': 55, 'n': 56, 'o': 57, 'p': 58, 'q': 59, 'r': 60, 's': 61,
  't': 62, 'u': 63, 'v': 64, 'w': 65, 'x': 66, 'y': 67, 'z': 68, 'ɑ': 69,
  'ɐ': 70, 'ɒ': 71, 'æ': 72, 'β': 75, 'ɔ': 76, 'ɕ': 77, 'ç': 78, 'ɖ': 80,
  'ð': 81, 'ʤ': 82, 'ə': 83, 'ɚ': 85, 'ɛ': 86, 'ɜ': 87, 'ɟ': 90, 'ɡ': 92,
  'ɥ': 99, 'ɨ': 101, 'ɪ': 102, 'ʝ': 103, 'ɯ': 110, 'ɰ': 111, 'ŋ': 112, 'ɳ': 113,
  'ɲ': 114, 'ɴ': 115, 'ø': 116, 'ɸ': 118, 'θ': 119, 'œ': 120, 'ɹ': 123, 'ɾ': 125,
  'ɻ': 126, 'ʁ': 128, 'ɽ': 129, 'ʂ': 130, 'ʃ': 131, 'ʈ': 132, 'ʧ': 133, 'ʊ': 135,
  'ʋ': 136, 'ʌ': 138, 'ɣ': 139, 'ɤ': 140, 'χ': 142, 'ʎ': 143, 'ʒ': 147, 'ʔ': 148,
  'ˈ': 156, 'ˌ': 157, 'ː': 158, 'ʰ': 162, 'ʲ': 164, '↓': 169, '→': 171, '↗': 172,
  '↘': 173, 'ᵻ': 177,
};

// espeak-ng gibt das g gelegentlich als ASCII 'g' aus – Kokoro kennt aber nur
// das IPA-Skript-g (U+0261). Vor dem Filtern angleichen, sonst fehlen Laute.
function normalizePhonemes(s) {
  return s.replace(/g/g, 'ɡ');
}

let modelPromise = null;   // Promise auf { ort, session }
let phonemizeFn = null;    // phonemizer.phonemize
let voicePromise = null;   // Promise auf Float32Array (510*256)
let audioCtx = null;
let currentSrc = null;

function loadPhonemizer() {
  if (!phonemizeFn) {
    phonemizeFn = import(/* @vite-ignore */ PHON_LIB)
      .then((m) => m.phonemize)
      .catch((e) => { phonemizeFn = null; throw new Error('Phonemizer (espeak-ng) konnte nicht geladen werden. ' + (e?.message || e)); });
  }
  return phonemizeFn;
}

function loadVoice() {
  if (!voicePromise) {
    voicePromise = fetch(VOICE_URL)
      .then((r) => { if (!r.ok) throw new Error('Stimmdatei nicht gefunden (HTTP ' + r.status + ').'); return r.arrayBuffer(); })
      .then((buf) => new Float32Array(buf))
      .catch((e) => { voicePromise = null; throw e; });
  }
  return voicePromise;
}

// Lädt das große ONNX-Modell mit Byte-Fortschritt und initialisiert die Session.
function loadModel(say, prog) {
  if (!modelPromise) {
    modelPromise = (async () => {
      say('1/4 · Lade ONNX-Laufzeit vom CDN …'); prog(null);
      let ort;
      try {
        ort = await import(/* @vite-ignore */ ORT_LIB);
      } catch (e) {
        throw new Error('onnxruntime-web konnte nicht geladen werden (CDN/Netz?). ' + (e?.message || e));
      }
      try { ort.env.wasm.numThreads = 1; } catch {} // GitHub Pages ist nicht cross-origin-isoliert

      say('2/4 · Lade deutsches Kokoro-Modell „Martin" von HuggingFace (~310 MB, einmalig) …');
      prog(null);
      const bytes = await fetchWithProgress(MODEL_URL, (loaded, total) => {
        const pct = total ? Math.min(100, Math.round((loaded / total) * 100)) : null;
        prog(pct);
        say(`2/4 · Lade Modell „Martin" …\n↓ ${mb(loaded)} / ${total ? mb(total) : '?'} MB${pct != null ? ` · ${pct}%` : ''}`);
      });

      say('3/4 · Initialisiere Modell (CPU/WASM) …'); prog(null);
      let session;
      try {
        session = await ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] });
      } catch (e) {
        throw new Error('Modell-Initialisierung fehlgeschlagen (evtl. zu wenig Speicher auf dem Gerät). ' + (e?.message || e));
      }
      return { ort, session };
    })().catch((err) => { modelPromise = null; throw err; });
  }
  return modelPromise;
}

// fetch() mit Fortschritt; nutzt content-length zur Vorab-Allokation (spart Speicher).
async function fetchWithProgress(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Modell-Download fehlgeschlagen (HTTP ' + res.status + ').');
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body || !res.body.getReader) {
    const buf = new Uint8Array(await res.arrayBuffer());
    onProgress(buf.length, total || buf.length);
    return buf;
  }
  const reader = res.body.getReader();
  let loaded = 0;
  if (total) {
    const out = new Uint8Array(total);
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      out.set(value, loaded);
      loaded += value.length;
      onProgress(loaded, total);
    }
    return out;
  }
  // Unbekannte Größe: Chunks sammeln.
  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); loaded += value.length; onProgress(loaded, 0);
  }
  const out = new Uint8Array(loaded);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

function playFloat(float32, rate) {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') { try { audioCtx.resume(); } catch {} }
  martinStop();
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

// Wandelt deutschen Text in Sprache (Stimme Martin) um und spielt sie ab.
export async function martinSpeak(text, { onStatus, onProgress } = {}) {
  const say = (t) => { try { onStatus && onStatus(t); } catch {} };
  const prog = (p) => { try { onProgress && onProgress(p); } catch {} };

  const [{ ort, session }, phonemize, voice] = await Promise.all([
    loadModel(say, prog), loadPhonemizer(), loadVoice(),
  ]);

  say('4/4 · Wandle Text in Phoneme um (Deutsch) …'); prog(null);
  const parts = await phonemize((text || '').trim() || 'Test.', 'de');
  const raw = Array.isArray(parts) ? parts.join(' ') : String(parts);
  const phonemes = [...normalizePhonemes(raw)].filter((c) => VOCAB[c] !== undefined).join('');

  let ids = [];
  for (const ch of phonemes) ids.push(VOCAB[ch]);
  if (ids.length > MAX_PHONEME_LENGTH) ids = ids.slice(0, MAX_PHONEME_LENGTH);
  if (!ids.length) throw new Error('Keine verwertbaren Phoneme erzeugt (Text leer?).');

  // Stimmvektor: Zeile = Anzahl der (ungepolsterten) Tokens, geklammert auf 0..509.
  const row = Math.min(ids.length, 509);
  const style = voice.slice(row * STYLE_DIM, row * STYLE_DIM + STYLE_DIM);

  // Tokens mit Pad-0 am Anfang/Ende, int64.
  const tokenData = BigInt64Array.from([0, ...ids, 0].map((n) => BigInt(n)));
  const names = session.inputNames || [];
  const tokenName = names.includes('input_ids') ? 'input_ids' : 'tokens';

  const feeds = {};
  feeds[tokenName] = new ort.Tensor('int64', tokenData, [1, tokenData.length]);
  feeds.style = new ort.Tensor('float32', Float32Array.from(style), [1, STYLE_DIM]);
  feeds.speed = (tokenName === 'input_ids')
    ? new ort.Tensor('int32', Int32Array.from([1]), [1])
    : new ort.Tensor('float32', Float32Array.from([1.0]), [1]);

  say('Erzeuge Sprache (Martin) … (CPU, einen Moment)'); prog(null);
  const out = await session.run(feeds);
  const audio = out[session.outputNames[0]];
  const pcm = audio.data instanceof Float32Array ? audio.data : Float32Array.from(audio.data);

  await playFloat(pcm, SAMPLE_RATE);
  say('✓ Fertig – Wiedergabe läuft.'); prog(100);
  return true;
}

export function martinStop() {
  if (currentSrc) {
    try { currentSrc.stop(); } catch {}
    currentSrc = null;
  }
}
