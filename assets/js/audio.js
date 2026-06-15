// Audio-Ausgabe: Signaltöne (WebAudio) und Sprachansagen (SpeechSynthesis).
let ctx = null;
let germanVoice = null;
let voiceReady = false;

export function initAudio() {
  // AudioContext erst nach Nutzerinteraktion erlaubt (Autoplay-Policy).
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  loadVoices();
}

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const pick = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;
    germanVoice =
      voices.find((v) => /de(-|_)?/i.test(v.lang) && /google|deutsch/i.test(v.name)) ||
      voices.find((v) => /de(-|_)?/i.test(v.lang)) ||
      null;
    voiceReady = true;
  };
  pick();
  if (!voiceReady) window.speechSynthesis.onvoiceschanged = pick;
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
};

let onSpeakStart = null;
let onSpeakEnd = null;
export function setSpeechHooks({ start, end }) {
  onSpeakStart = start;
  onSpeakEnd = end;
}

export function speak(text, { interrupt = false } = {}) {
  if (!('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  if (interrupt) synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE';
  if (germanVoice) u.voice = germanVoice;
  u.rate = 1.05;
  u.pitch = 1.0;
  u.onstart = () => onSpeakStart && onSpeakStart();
  u.onend = () => onSpeakEnd && onSpeakEnd();
  u.onerror = () => onSpeakEnd && onSpeakEnd();
  synth.speak(u);
}

export function cancelSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
