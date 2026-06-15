// Persistenz über localStorage: Übungen, Übungssets und Einstellungen.
import { DEFAULT_SETS, DEFAULT_EXERCISES, DEFAULT_REPS, CIRCUIT_EXERCISES, CIRCUIT_SET } from './exercises.js';

const SETS_KEY = 'freeletics.sets.v2';
const CONFIG_KEY = 'freeletics.config.v2';
const EXERCISES_KEY = 'freeletics.exercises.v1';
const STATIONS_KEY = 'freeletics.stations.v1';
const SEED_KEY = 'freeletics.seed.v1';

// Kuratierte Power-Sender quer durch die Genres (alle HTTPS-Direktstreams,
// auf Erreichbarkeit/Audio-Antwort geprüft). Nutzer können eigene hinzufügen.
// np = SomaFM-Kanal-ID für die „Now Playing“-Anzeige (nur SomaFM liefert sie
// im Browser CORS-frei; andere Sender zeigen nur Name/Genre).
export const DEFAULT_STATIONS = [
  { id: 'st-bigfm-workout', name: 'bigFM Workout',      genre: 'Workout',     url: 'https://streams.bigfm.de/bigfm-workout-128-mp3' },
  { id: 'st-sunshine',      name: 'sunshine live',      genre: 'Dance/Electro', url: 'https://stream.sunshine-live.de/live/mp3-192/' },
  { id: 'st-technobase',    name: 'TechnoBase.FM',      genre: 'Techno',      url: 'https://listen.technobase.fm/tunein-mp3' },
  { id: 'st-rockantenne',   name: 'ROCK ANTENNE',       genre: 'Rock',        url: 'https://stream.rockantenne.de/rockantenne/stream/mp3' },
  { id: 'st-ra-metal',      name: 'ROCK ANTENNE Heavy Metal', genre: 'Metal', url: 'https://stream.rockantenne.de/heavy-metal/stream/mp3' },
  { id: 'st-bigfm',         name: 'bigFM',              genre: 'Hip-Hop',     url: 'https://streams.bigfm.de/bigfm-deutschland-128-mp3' },
  { id: 'st-soma-defcon',   name: 'SomaFM DEF CON',     genre: 'Electro/Industrial', url: 'https://ice1.somafm.com/defcon-128-mp3', np: 'defcon' },
  { id: 'st-soma-trip',     name: 'SomaFM The Trip',    genre: 'Prog House',  url: 'https://ice1.somafm.com/thetrip-128-mp3', np: 'thetrip' },
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

// ---------------- Einmalige Migrationen ----------------
// Fügt neu hinzugekommene Standard-Inhalte (z. B. das Zirkeltraining) einmalig
// auch bei Bestandsnutzern hinzu, ohne deren eigene Übungen/Sets zu verändern.
// Jede Migration läuft nur einmal – löscht der Nutzer Inhalte später wieder,
// kommen sie nicht zurück.
export function ensureDefaultsSeeded() {
  const applied = safeParse(localStorage.getItem(SEED_KEY), []);
  if (applied.includes('content-v2')) return;

  // Fehlende Zirkel-Stationen zur Übungs-Bibliothek hinzufügen (eigene behalten).
  const exercises = loadExercises();
  const have = new Set(exercises.map((e) => e.id));
  let exChanged = false;
  CIRCUIT_EXERCISES.forEach((e) => {
    if (!have.has(e.id)) {
      exercises.push({ ...e });
      exChanged = true;
    }
  });
  if (exChanged) saveExercises(exercises);

  // Kuratierte Sets (3× Freeletics + Zirkel) und Power-Sender setzen.
  saveSets(DEFAULT_SETS.map((s) => ({ ...s, exercises: [...s.exercises] })));
  saveStations(DEFAULT_STATIONS.map((s) => ({ ...s })));

  if (!applied.includes('zirkel-v1')) applied.push('zirkel-v1');
  applied.push('content-v2');
  localStorage.setItem(SEED_KEY, JSON.stringify(applied));
}
