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
  // Applaus & Jubel: viele einzelne, scharfe Klatscher (statt durchgehendem
  // Rauschen) ergeben einen realistischen Publikums-Applaus, dazu ein paar
  // Jubel-Rufe. Wird live in einen Stereo-Puffer synthetisiert.
  applause: () => {
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const sr = ctx.sampleRate;
    const duration = 3.4;
    const len = Math.floor(sr * duration);
    const buf = ctx.createBuffer(2, len, sr);

    const claps = 620; // Anzahl einzelner „Hände“-Klatscher
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let k = 0; k < claps; k++) {
        const t = Math.random() * duration;
        const pos = Math.floor(t * sr);
        // Lautstärke-Hüllkurve über die Zeit: schnell an, halten, ausklingen.
        const ge = t < 0.35 ? t / 0.35 : (t > duration - 0.8 ? Math.max(0, (duration - t) / 0.8) : 1);
        const amp = (0.5 + Math.random() * 0.5) * ge;
        // Einzelner Klatscher: kurzer Rausch-Impuls mit sehr schnellem Abfall.
        const clapLen = Math.floor(sr * (0.004 + Math.random() * 0.012));
        for (let j = 0; j < clapLen && pos + j < len; j++) {
          const env = Math.exp(-j / (clapLen * 0.3));
          data[pos + j] += (Math.random() * 2 - 1) * amp * env * 0.16;
        }
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;
    // Höhen betonen → klingt nach klatschenden Händen, nicht nach Rauschen.
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 900;
    const peak = ctx.createBiquadFilter();
    peak.type = 'peaking'; peak.frequency.value = 2400; peak.gain.value = 6; peak.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.value = 1.0;
    src.connect(hp).connect(peak).connect(g).connect(ctx.destination);
    src.start(t0); src.stop(t0 + duration);

    // Jubel-Rufe („Woo!“) – ein paar versetzte, aufsteigende Töne.
    const whoops = [
      { f0: 520, f1: 880,  t: 0.15 },
      { f0: 610, f1: 1050, t: 0.60 },
      { f0: 470, f1: 820,  t: 1.25 },
      { f0: 660, f1: 1170, t: 1.90 },
      { f0: 560, f1: 990,  t: 2.40 },
    ];
    whoops.forEach(({ f0, f1, t }) => {
      const st = t0 + t;
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f0, st);
      o.frequency.exponentialRampToValueAtTime(f1, st + 0.2);
      o.frequency.exponentialRampToValueAtTime(f0 * 0.92, st + 0.4);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1600;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, st);
      g2.gain.exponentialRampToValueAtTime(0.09, st + 0.08);
      g2.gain.exponentialRampToValueAtTime(0.0001, st + 0.45);
      o.connect(lp).connect(g2).connect(ctx.destination);
      o.start(st); o.stop(st + 0.5);
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
