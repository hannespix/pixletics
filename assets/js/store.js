// Persistenz über localStorage: Übungen, Übungssets und Einstellungen.
import { DEFAULT_SETS, DEFAULT_EXERCISES, DEFAULT_REPS } from './exercises.js';

const SETS_KEY = 'freeletics.sets.v2';
const CONFIG_KEY = 'freeletics.config.v2';
const EXERCISES_KEY = 'freeletics.exercises.v1';
const STATIONS_KEY = 'freeletics.stations.v1';

// Kuratierte Radio-Sender (alle HTTPS-Direktstreams, werbefrei/werbearm).
// Nutzer können eigene Sender hinzufügen/bearbeiten.
export const DEFAULT_STATIONS = [
  { id: 'st-rockantenne', name: 'ROCK ANTENNE',          genre: 'Rock',        url: 'https://stream.rockantenne.de/rockantenne/stream/mp3' },
  { id: 'st-fm4',         name: 'FM4 (ORF)',             genre: 'Alternative', url: 'https://orf-live.ors-shoutcast.at/fm4-q2a' },
  { id: 'st-indiepop',    name: 'SomaFM Indie Pop Rocks', genre: 'Indie',      url: 'https://ice2.somafm.com/indiepop-128-mp3' },
  { id: 'st-power',       name: 'SomaFM PowerStation',   genre: 'Energie',     url: 'https://ice2.somafm.com/powerstation-128-mp3' },
  { id: 'st-beat',        name: 'SomaFM Beat Blender',   genre: 'Electronic',  url: 'https://ice2.somafm.com/beatblender-128-mp3' },
  { id: 'st-groove',      name: 'SomaFM Groove Salad',   genre: 'Chill',       url: 'https://ice2.somafm.com/groovesalad-128-mp3' },
];

export const DEFAULT_CONFIG = {
  workSeconds: 30,    // Dauer einer Übung (Belastung)
  restSeconds: 30,    // Pause zwischen den Übungen
  prepareSeconds: 10, // Countdown vor jeder Übung
  totalMinutes: 60,   // Gesamtdauer des Programms
  voice: true,        // Sprachansagen an/aus
  beeps: true,        // Signaltöne an/aus
  duckSpotify: true,  // Spotify bei Ansagen leiser
  // ---- Stimme & Coach ----
  voicePersona: 'standard', // gewählter Coach-Charakter (siehe coach.js)
  voiceURI: 'auto',         // gewählte Gerätestimme oder 'auto' (zum Coach passend)
  voicePitch: 1.0,          // Stimmlage (0.5–1.8)
  voiceRate: 1.05,          // Sprechtempo (0.6–1.6)
  coachName: '',            // optionaler Name, mit dem der Coach dich anspricht
  motivation: 60,           // 0–100: wie oft motivierende Zwischenrufe kommen
};

function safeParse(raw, fallback) {
  try {
    const v = JSON.parse(raw);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

// ---------------- Übungen (editierbare Bibliothek) ----------------
export function loadExercises() {
  const raw = localStorage.getItem(EXERCISES_KEY);
  if (!raw) {
    const copy = DEFAULT_EXERCISES.map((e) => ({ ...e }));
    saveExercises(copy);
    return copy;
  }
  // Reps absichern (z. B. falls ältere Daten ohne reps existieren).
  return safeParse(raw, []).map((e) => ({ ...e, reps: e.reps || DEFAULT_REPS }));
}

export function saveExercises(exercises) {
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
}

// ---------------- Radio-Sender ----------------
export function loadStations() {
  const raw = localStorage.getItem(STATIONS_KEY);
  if (!raw) {
    const copy = DEFAULT_STATIONS.map((s) => ({ ...s }));
    saveStations(copy);
    return copy;
  }
  return safeParse(raw, []);
}

export function saveStations(stations) {
  localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
}

// ---------------- Sets ----------------
export function loadSets() {
  const raw = localStorage.getItem(SETS_KEY);
  if (!raw) {
    // Erstinitialisierung mit Beispiel-Sets.
    const copy = DEFAULT_SETS.map((s) => ({ ...s, exercises: [...s.exercises] }));
    saveSets(copy);
    return copy;
  }
  return safeParse(raw, []).map((s) => ({ ...s, exercises: [...(s.exercises || [])] }));
}

export function saveSets(sets) {
  localStorage.setItem(SETS_KEY, JSON.stringify(sets));
}

// ---------------- Einstellungen ----------------
export function loadConfig() {
  const raw = localStorage.getItem(CONFIG_KEY);
  return { ...DEFAULT_CONFIG, ...safeParse(raw, {}) };
}

export function saveConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function uid(prefix = 'set') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
