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
  // Applaus & Jubel: klatschendes Publikum + Mengen-„Aaah“ + ein paar
  // aufsteigende Jubel-Pfiffe – klingt wie eine feiernde Menge.
  applause: () => {
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const duration = 2.8;

    // Rausch-Puffer-Helfer
    const makeNoise = (peakProb = null) => {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        d[i] = peakProb == null
          ? Math.random() * 2 - 1
          : (Math.random() * 2 - 1) * (Math.random() < peakProb ? 1 : 0.22);
      }
      return buf;
    };

    // 1) Klatschen: gefiltertes Rauschen mit einzelnen „Klatschern“.
    const clap = ctx.createBufferSource();
    clap.buffer = makeNoise(0.35);
    const clapFilter = ctx.createBiquadFilter();
    clapFilter.type = 'bandpass';
    clapFilter.frequency.value = 1800;
    clapFilter.Q.value = 0.6;
    const clapGain = ctx.createGain();
    clapGain.gain.setValueAtTime(0.0001, t0);
    clapGain.gain.exponentialRampToValueAtTime(0.4, t0 + 0.2);
    clapGain.gain.setValueAtTime(0.4, t0 + 1.7);
    clapGain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    clap.connect(clapFilter).connect(clapGain).connect(ctx.destination);
    clap.start(t0); clap.stop(t0 + duration);

    // 2) Jubel-Teppich: tieferes, rauschiges „Aaah“ der Menge mit lebendiger
    //    Filterbewegung.
    const roar = ctx.createBufferSource();
    roar.buffer = makeNoise();
    const roarFilter = ctx.createBiquadFilter();
    roarFilter.type = 'bandpass';
    roarFilter.frequency.setValueAtTime(700, t0);
    roarFilter.frequency.linearRampToValueAtTime(920, t0 + 1.2);
    roarFilter.frequency.linearRampToValueAtTime(650, t0 + 2.4);
    roarFilter.Q.value = 0.8;
    const roarGain = ctx.createGain();
    roarGain.gain.setValueAtTime(0.0001, t0);
    roarGain.gain.exponentialRampToValueAtTime(0.26, t0 + 0.4);
    roarGain.gain.setValueAtTime(0.26, t0 + 1.9);
    roarGain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    roar.connect(roarFilter).connect(roarGain).connect(ctx.destination);
    roar.start(t0); roar.stop(t0 + duration);

    // 3) Jubel-Pfiffe: ein paar versetzte, aufsteigende „Woo!“-Töne.
    const whoops = [
      { f0: 520, f1: 880,  t: 0.10 },
      { f0: 600, f1: 1040, t: 0.55 },
      { f0: 470, f1: 820,  t: 1.15 },
      { f0: 660, f1: 1160, t: 1.70 },
    ];
    whoops.forEach(({ f0, f1, t }) => {
      const st = t0 + t;
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f0, st);
      o.frequency.exponentialRampToValueAtTime(f1, st + 0.18);
      o.frequency.exponentialRampToValueAtTime(f0 * 0.9, st + 0.36);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(0.13, st + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.42);
      o.connect(g).connect(ctx.destination);
      o.start(st); o.stop(st + 0.46);
    });
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
