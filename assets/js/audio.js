// Audio-Ausgabe: Signaltöne (WebAudio) und Sprachansagen (SpeechSynthesis).
let ctx = null;

// Stimmen-Verwaltung
let allVoices = [];        // alle Gerätestimmen (SpeechSynthesisVoice)
let germanVoices = [];     // gefiltert: deutsche Stimmen mit Geschlechts-Schätzung
let voicesReady = false;
let voicesCbs = [];        // Callbacks, sobald die Stimmenliste verfügbar ist

// Aktuelle Stimm-Einstellungen (vom Coach/den Reglern gesetzt)
let currentVoice = null;   // gewählte SpeechSynthesisVoice (oder null = Auto)
let currentPitch = 1.0;
let currentRate = 1.05;

// Heuristik zur Geschlechtsschätzung anhand des Stimmnamens. Die Web-Speech-API
// liefert kein Geschlecht, daher raten wir über bekannte Namensbestandteile.
const FEMALE_HINTS = ['anna', 'helena', 'petra', 'katja', 'hedda', 'marlene', 'steffi', 'vicki', 'klara', 'sara', 'amira', 'female', 'frau', 'weiblich', 'google deutsch'];
const MALE_HINTS = ['markus', 'stefan', 'martin', 'yannick', 'viktor', 'conrad', 'hans', 'klaus', 'reed', 'daniel', 'male', 'mann', 'männlich'];

function guessGender(name = '') {
  const n = name.toLowerCase();
  if (FEMALE_HINTS.some((h) => n.includes(h))) return 'female';
  if (MALE_HINTS.some((h) => n.includes(h))) return 'male';
  return 'any';
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function initAudio() {
  // AudioContext erst nach Nutzerinteraktion erlaubt (Autoplay-Policy).
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  loadVoices();
}

// Stimmen laden, ohne AudioContext anzulegen (z. B. schon beim Seitenstart,
// damit die Auswahlliste gefüllt ist, bevor der Nutzer interagiert).
export function primeVoices() {
  loadVoices();
}

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const collect = () => {
    const list = window.speechSynthesis.getVoices();
    if (!list.length) return;
    allVoices = list;
    germanVoices = list
      .filter((v) => /de(-|_)?/i.test(v.lang))
      .map((v) => ({ voiceURI: v.voiceURI, name: v.name, lang: v.lang, gender: guessGender(v.name) }));
    voicesReady = true;
    const cbs = voicesCbs;
    voicesCbs = [];
    cbs.forEach((cb) => { try { cb(); } catch {} });
  };
  collect();
  if (!voicesReady) window.speechSynthesis.onvoiceschanged = collect;
}

// Callback ausführen, sobald die Stimmenliste verfügbar ist (oder sofort).
export function onVoicesReady(cb) {
  if (voicesReady) cb();
  else voicesCbs.push(cb);
}

// Liste der wählbaren Stimmen (deutsch bevorzugt, sonst alle) – inkl.
// geschätztem Geschlecht für die Auto-Auswahl und die Anzeige.
export function getGermanVoices() {
  if (germanVoices.length) return germanVoices.slice();
  return allVoices.map((v) => ({ voiceURI: v.voiceURI, name: v.name, lang: v.lang, gender: guessGender(v.name) }));
}

// Passende Stimmen-URI für ein gewünschtes Geschlecht ('male'|'female'|'any').
export function pickVoiceURI(gender = 'any') {
  const list = getGermanVoices();
  if (!list.length) return null;
  if (gender && gender !== 'any') {
    const match = list.find((v) => v.gender === gender);
    if (match) return match.voiceURI;
  }
  return list[0].voiceURI;
}

// Aktuelle Stimm-Einstellungen setzen (vom Coach / den Reglern).
export function setVoiceSettings({ voiceURI, pitch, rate } = {}) {
  if (voiceURI !== undefined) {
    currentVoice = voiceURI ? allVoices.find((v) => v.voiceURI === voiceURI) || null : null;
  }
  if (typeof pitch === 'number') currentPitch = pitch;
  if (typeof rate === 'number') currentRate = rate;
}

function tone({ freq = 880, duration = 0.15, type = 'sine', gain = 0.25, when = 0 }) {
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// Semantische Töne
export const sound = {
  tick: () => tone({ freq: 720, duration: 0.12, type: 'sine', gain: 0.2 }),
  start: () => {
    // Aufsteigendes Startsignal
    tone({ freq: 660, duration: 0.18, when: 0 });
    tone({ freq: 880, duration: 0.18, when: 0.18 });
    tone({ freq: 1180, duration: 0.32, when: 0.36, type: 'square', gain: 0.3 });
  },
  end: () => {
    tone({ freq: 520, duration: 0.25, type: 'triangle', gain: 0.28 });
    tone({ freq: 400, duration: 0.3, type: 'triangle', gain: 0.28, when: 0.18 });
  },
  rest: () => tone({ freq: 480, duration: 0.2, type: 'sine', gain: 0.22 }),
  done: () => {
    tone({ freq: 660, duration: 0.2, when: 0 });
    tone({ freq: 880, duration: 0.2, when: 0.2 });
    tone({ freq: 1180, duration: 0.4, when: 0.4 });
  },
  // Applaus: gefiltertes Rauschen mit an-/abschwellender Hüllkurve,
  // klingt wie ein klatschendes Publikum.
  applause: () => {
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const duration = 2.4;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Sporadische Spitzen erzeugen einzelne „Klatscher“ im Rauschen.
      data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.35 ? 1 : 0.25);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1700;
    filter.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.4, t0 + 0.2);   // schnell anschwellen
    g.gain.setValueAtTime(0.4, t0 + 1.3);                 // halten
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration); // ausklingen
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + duration);
  },
};

let onSpeakStart = null;
let onSpeakEnd = null;
export function setSpeechHooks({ start, end }) {
  onSpeakStart = start;
  onSpeakEnd = end;
}

export function speak(text, { interrupt = false, pitch, rate } = {}) {
  if (!('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  if (interrupt) synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE';
  // Gewählte Stimme, sonst die erste deutsche als Rückfall.
  const v = currentVoice || (germanVoices.length ? allVoices.find((x) => x.voiceURI === germanVoices[0].voiceURI) : null);
  if (v) u.voice = v;
  u.rate = clamp(typeof rate === 'number' ? rate : currentRate, 0.5, 2);
  u.pitch = clamp(typeof pitch === 'number' ? pitch : currentPitch, 0, 2);
  u.onstart = () => onSpeakStart && onSpeakStart();
  u.onend = () => onSpeakEnd && onSpeakEnd();
  u.onerror = () => onSpeakEnd && onSpeakEnd();
  synth.speak(u);
}

export function cancelSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
