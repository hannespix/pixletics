// Persistenz über localStorage: Übungen, Übungssets und Einstellungen.
import { DEFAULT_SETS, DEFAULT_EXERCISES, DEFAULT_REPS, CIRCUIT_EXERCISES, EXTRA_EXERCISES, CIRCUIT_SET } from './exercises.js';

const SETS_KEY = 'freeletics.sets.v2';
const CONFIG_KEY = 'freeletics.config.v2';
const EXERCISES_KEY = 'freeletics.exercises.v1';
const STATIONS_KEY = 'freeletics.stations.v1';
const SEED_KEY = 'freeletics.seed.v1';
const SESSION_KEY = 'freeletics.session.v1';

// Kuratierte Power-Sender quer durch die Genres (alle HTTPS-Direktstreams,
// auf Erreichbarkeit/Audio-Antwort geprüft). Nutzer können eigene hinzufügen.
// np = SomaFM-Kanal-ID für die „Now Playing“-Anzeige (nur SomaFM liefert sie
// im Browser CORS-frei; andere Sender zeigen nur Name/Genre).
// ROCK ANTENNE steht bewusst zuerst = Standard-Internetradio.
// Schwerpunkt: Rock, 70er/80er-Rock, Workout. Viele werbefreie SomaFM-Streams
// (np = SomaFM-Kanal-ID für die „Now Playing“-Anzeige).
// `cat` = grobe Kategorie für den Genre-Filter (electro/pop/hiphop/rock/metal/retro).
// `genre` = feinere Überschrift in der Liste. `np` = SomaFM-Kanal-ID für „Now Playing“.
// Auswahl nach: werbefrei/werbearm, nur Musik, workout-tauglich (nicht zu langsam).
// SomaFM = werbefrei (hörerfinanziert); bigFM/ROCK ANTENNE/RADIO BOB = werbearme
// Genre-Streams. Alle URLs auf Audio-Antwort geprüft.
export const DEFAULT_STATIONS = [
  // ---- Electro / EDM (Schwerpunkt) ----
  { id: 'st-bigfm-workout', name: 'bigFM Workout',          genre: 'Workout',      cat: 'electro', url: 'https://streams.bigfm.de/bigfm-workout-128-mp3' },
  { id: 'st-bigfm-dance',   name: 'bigFM Dance',            genre: 'Dance',        cat: 'electro', url: 'https://streams.bigfm.de/bigfm-dance-128-mp3' },
  { id: 'st-bigfm-groove',  name: 'bigFM Groove Night',     genre: 'House / Club', cat: 'electro', url: 'https://streams.bigfm.de/bigfm-groovenight-128-mp3' },
  { id: 'st-soma-beat',     name: 'SomaFM Beat Blender',    genre: 'Deep House',   cat: 'electro', url: 'https://ice1.somafm.com/beatblender-128-mp3', np: 'beatblender' },
  { id: 'st-soma-defcon',   name: 'SomaFM DEF CON Radio',   genre: 'EDM',          cat: 'electro', url: 'https://ice1.somafm.com/defcon-128-mp3',      np: 'defcon' },
  { id: 'st-soma-trip',     name: 'SomaFM The Trip',        genre: 'Prog House',   cat: 'electro', url: 'https://ice1.somafm.com/thetrip-128-mp3',     np: 'thetrip' },
  { id: 'st-soma-dubstep',  name: 'SomaFM Dub Step Beyond', genre: 'Dubstep',      cat: 'electro', url: 'https://ice1.somafm.com/dubstep-128-mp3',     np: 'dubstep' },
  { id: 'st-soma-goa',      name: 'SomaFM Suburbs of Goa',  genre: 'Psytrance',    cat: 'electro', url: 'https://ice1.somafm.com/suburbsofgoa-128-mp3', np: 'suburbsofgoa' },
  { id: 'st-soma-cliqhop',  name: 'SomaFM cliqhop idm',     genre: 'IDM',          cat: 'electro', url: 'https://ice1.somafm.com/cliqhop-128-mp3',     np: 'cliqhop' },
  { id: 'st-soma-poptron',  name: 'SomaFM PopTron',         genre: 'Electropop',   cat: 'electro', url: 'https://ice1.somafm.com/poptron-128-mp3',     np: 'poptron' },
  // ---- Pop / Charts ----
  { id: 'st-bigfm-charts',  name: 'bigFM Charts',           genre: 'Charts',       cat: 'pop',     url: 'https://streams.bigfm.de/bigfm-charts-128-mp3' },
  { id: 'st-bigfm-latin',   name: 'bigFM Latin',            genre: 'Latin / Reggaeton', cat: 'pop', url: 'https://streams.bigfm.de/bigfm-latin-128-mp3' },
  { id: 'st-soma-indie',    name: 'SomaFM Indie Pop Rocks', genre: 'Indie Pop',    cat: 'pop',     url: 'https://ice1.somafm.com/indiepop-128-mp3',    np: 'indiepop' },
  // ---- HipHop / Rap ----
  { id: 'st-bigfm-deutschrap', name: 'bigFM Deutschrap',    genre: 'Deutschrap',   cat: 'hiphop',  url: 'https://streams.bigfm.de/bigfm-deutschrap-128-mp3' },
  { id: 'st-bigfm-oldschool', name: 'bigFM Old School',     genre: 'Old School HipHop', cat: 'hiphop', url: 'https://streams.bigfm.de/bigfm-oldschool-128-mp3' },
  { id: 'st-soma-fluid',    name: 'SomaFM Fluid',           genre: 'Future Beats', cat: 'hiphop',  url: 'https://ice1.somafm.com/fluid-128-mp3',       np: 'fluid' },
  // ---- Rock ----
  { id: 'st-rockantenne',   name: 'ROCK ANTENNE',           genre: 'Rock',         cat: 'rock',    url: 'https://stream.rockantenne.de/rockantenne/stream/mp3' },
  { id: 'st-ra-alt',        name: 'ROCK ANTENNE Alternative', genre: 'Alternative', cat: 'rock',   url: 'https://stream.rockantenne.de/alternative/stream/mp3' },
  { id: 'st-ra-deutsch',    name: 'ROCK ANTENNE Deutschrock', genre: 'Deutschrock', cat: 'rock',   url: 'https://stream.rockantenne.de/deutschrock/stream/mp3' },
  { id: 'st-ra-classic',    name: 'ROCK ANTENNE Classic Perlen', genre: 'Rock-Klassiker', cat: 'rock', url: 'https://stream.rockantenne.de/classic-perlen/stream/mp3' },
  { id: 'st-bob-classic',   name: 'RADIO BOB! Classic Rock', genre: 'Classic Rock', cat: 'rock',   url: 'https://streams.radiobob.de/bob-classicrock/mp3-192/streams.radiobob.de/' },
  { id: 'st-soma-bagel',    name: 'SomaFM BAGeL Radio',     genre: 'Alternative Rock', cat: 'rock', url: 'https://ice1.somafm.com/bagel-128-mp3',     np: 'bagel' },
  // ---- Punk ----
  { id: 'st-bob-punk',      name: 'RADIO BOB! Punk Rock',   genre: 'Punk Rock',    cat: 'punk',    url: 'https://streams.radiobob.de/bob-punkrock/mp3-192/streams.radiobob.de/' },
  { id: 'st-laut-punk',     name: 'laut.fm Punk',           genre: 'Punk',         cat: 'punk',    url: 'https://stream.laut.fm/punk' },
  // ---- Metal ----
  { id: 'st-ra-metal',      name: 'ROCK ANTENNE Heavy Metal', genre: 'Metal',      cat: 'metal',   url: 'https://stream.rockantenne.de/heavy-metal/stream/mp3' },
  { id: 'st-bob-harder',    name: 'RADIO BOB! Harder!',     genre: 'Harder Rock',  cat: 'metal',   url: 'https://streams.radiobob.de/bob-harderrock/mp3-192/streams.radiobob.de/' },
  { id: 'st-soma-metal',    name: 'SomaFM Metal Detector',  genre: 'Metal',        cat: 'metal',   url: 'https://ice1.somafm.com/metal-128-mp3',       np: 'metal' },
  // ---- 80er / 90er / Retro ----
  { id: 'st-bob-80s',       name: 'RADIO BOB! 80er Rock',   genre: '80er Rock',    cat: 'retro',   url: 'https://streams.radiobob.de/bob-80srock/mp3-192/streams.radiobob.de/' },
  { id: 'st-bob-90s',       name: 'RADIO BOB! 90er Rock',   genre: '90er Rock',    cat: 'retro',   url: 'https://streams.radiobob.de/bob-90srock/mp3-192/streams.radiobob.de/' },
  { id: 'st-soma-u80s',     name: 'SomaFM Underground 80s', genre: '80er Synthpop', cat: 'retro',  url: 'https://ice1.somafm.com/u80s-128-mp3',        np: 'u80s' },
  { id: 'st-soma-70s',      name: 'SomaFM Left Coast 70s',  genre: '70er Rock',    cat: 'retro',   url: 'https://ice1.somafm.com/seventies-128-mp3',   np: 'seventies' },
];

export const DEFAULT_CONFIG = {
  workSeconds: 30,    // Dauer einer Übung (Belastung)
  pauseSeconds: 30,   // Pause + Vorbereitung zusammen, vor jeder Übung
  totalMinutes: 60,   // Gesamtdauer des Programms
  voice: true,        // Sprachansagen an/aus
  beeps: true,        // Signaltöne an/aus
  duckSpotify: true,  // Spotify bei Ansagen leiser
  voiceVolume: 1.0,   // Lautstärke Coach (Ansagen + Signaltöne), 0–1
  musicVolume: 0.8,   // Lautstärke Musik (Radio + Spotify), 0–1
  // ---- Stimme & Coach ----
  voicePersona: 'standard', // gewählter Coach-Charakter (siehe coach.js)
  voiceURI: 'auto',         // gewählte Gerätestimme oder 'auto' (zum Coach passend)
  voicePitch: 1.0,          // Stimmlage (0.5–1.8)
  voiceRate: 1.05,          // Sprechtempo (0.6–1.6)
  coachName: '',            // optionaler Name, mit dem der Coach dich anspricht
  motivation: 60,           // 0–100: wie oft motivierende Zwischenrufe kommen
  coachComments: true,      // Motivations-/Kommentar-Sprüche an/aus (false = nur wichtige Ansagen)
  verbosity: 'full',        // 'full' (Sprüche) | 'concise' (knapp) | 'minimal'
  // ---- Intervall-Timer (reiner Timer ohne Übungen) ----
  interval: { mode: 'tabata', work: 20, rest: 10, rounds: 8 },
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

// ---------------- Laufendes Workout (zum Fortsetzen nach Verlassen) ----------------
export function loadSession() {
  return safeParse(localStorage.getItem(SESSION_KEY), null);
}
export function saveSession(session) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch {}
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
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

  // Migration: Emoji in die Titel der Standard-Sets nachziehen – aber nur, wenn
  // der Nutzer den Namen nicht selbst geändert hat (Abgleich über stabile ID +
  // alten Standardnamen). Läuft unabhängig von den übrigen Migrationen genau
  // einmal und fasst Sender/Übungen nicht an.
  if (!applied.includes('titles-v1')) {
    const renames = {
      'set-free-a': ['Freeletics A · Kraft & Core', '🤸‍♂️ Freeletics A · Kraft & Core'],
      'set-free-b': ['Freeletics B · Cardio & Stabilität', '🤸‍♂️ Freeletics B · Cardio & Stabilität'],
      'set-free-c': ['Freeletics C · Ganzkörper-Mix', '🤸‍♂️ Freeletics C · Ganzkörper-Mix'],
      'set-zirkel': ['Zirkeltraining', '🎯 Zirkeltraining'],
    };
    const sets = loadSets();
    let changed = false;
    sets.forEach((s) => {
      const r = renames[s.id];
      if (r && s.name === r[0]) { s.name = r[1]; changed = true; }
    });
    if (changed) saveSets(sets);
    applied.push('titles-v1');
    localStorage.setItem(SEED_KEY, JSON.stringify(applied));
  }

  // Migration: RADIO BOB! 80er/90er Rock auch bei Bestandsnutzern ergänzen und
  // ganz nach vorne stellen (80er = Standard-Sender). Vorhandene Sender bleiben
  // erhalten; nichts wird überschrieben.
  if (!applied.includes('stations-bob-v1')) {
    const stations = loadStations();
    const have = new Set(stations.map((s) => s.id));
    const bob = [
      { id: 'st-bob-80s', name: 'RADIO BOB! 80er Rock', genre: '80er Rock', url: 'https://streams.radiobob.de/bob-80srock/mp3-192/streams.radiobob.de/' },
      { id: 'st-bob-90s', name: 'RADIO BOB! 90er Rock', genre: '90er Rock', url: 'https://streams.radiobob.de/bob-90srock/mp3-192/streams.radiobob.de/' },
    ];
    const toAdd = bob.filter((b) => !have.has(b.id));
    if (toAdd.length) saveStations([...toAdd, ...stations]);
    applied.push('stations-bob-v1');
    localStorage.setItem(SEED_KEY, JSON.stringify(applied));
  }

  // Migration: deutlich mehr Genres (Electro/EDM, Pop, HipHop, …) ergänzen und
  // bei vorhandenen Standard-Sendern die Filter-Kategorie (cat) nachrüsten.
  // Eigene Sender und vom Nutzer geänderte Namen/URLs bleiben unangetastet.
  if (!applied.includes('stations-genres-v1')) {
    const stations = loadStations();
    const byId = Object.fromEntries(stations.map((s) => [s.id, s]));
    let changed = false;
    DEFAULT_STATIONS.forEach((def) => {
      const ex = byId[def.id];
      if (!ex) { stations.push({ ...def }); changed = true; }       // neuer Sender
      else if (!ex.cat && def.cat) { ex.cat = def.cat; changed = true; } // Kategorie nachrüsten
    });
    if (changed) saveStations(stations);
    applied.push('stations-genres-v1');
    localStorage.setItem(SEED_KEY, JSON.stringify(applied));
  }

  // Migration: fehlende Standard-Sender ergänzen (u. a. neue Kategorie „Punk“).
  // Generisch – fügt alles aus DEFAULT_STATIONS hinzu, was per ID noch fehlt.
  if (!applied.includes('stations-punk-v1')) {
    const stations = loadStations();
    const have = new Set(stations.map((s) => s.id));
    const toAdd = DEFAULT_STATIONS.filter((s) => !have.has(s.id));
    if (toAdd.length) saveStations([...stations, ...toAdd]);
    applied.push('stations-punk-v1');
    localStorage.setItem(SEED_KEY, JSON.stringify(applied));
  }

  // Migration: Vollkörper-Freeletics-Sets. Ergänzt fehlende Übungen (Schultern,
  // Waden, Rücken) in der Bibliothek und aktualisiert die drei Freeletics-Sets
  // auf die neuen, den ganzen Körper abdeckenden Abläufe (~60 Min. pro Set).
  // Andere/eigene Sets bleiben unberührt. v2: Sets auf ~1 Stunde ausgebaut.
  if (!applied.includes('set-fullbody-v2')) {
    const exercises = loadExercises();
    const have = new Set(exercises.map((e) => e.id));
    let exChanged = false;
    EXTRA_EXERCISES.forEach((e) => {
      if (!have.has(e.id)) { exercises.push({ ...e }); exChanged = true; }
    });
    if (exChanged) saveExercises(exercises);

    const defById = Object.fromEntries(DEFAULT_SETS.map((s) => [s.id, s]));
    const freeIds = ['set-free-a', 'set-free-b', 'set-free-c'];
    const sets = loadSets();
    let setsChanged = false;
    sets.forEach((s) => {
      if (freeIds.includes(s.id) && defById[s.id]) {
        s.exercises = [...defById[s.id].exercises];
        setsChanged = true;
      }
    });
    if (setsChanged) saveSets(sets);
    if (!applied.includes('set-fullbody-v1')) applied.push('set-fullbody-v1');
    applied.push('set-fullbody-v2');
    localStorage.setItem(SEED_KEY, JSON.stringify(applied));
  }

  if (applied.includes('content-v4')) return;

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

  // Kuratierte Sets nur beim Erststart setzen (vorhandene nicht überschreiben).
  if (!applied.includes('content-v2')) {
    saveSets(DEFAULT_SETS.map((s) => ({ ...s, exercises: [...s.exercises] })));
  }
  // Power-Sender (ROCK ANTENNE zuerst) setzen/aktualisieren.
  saveStations(DEFAULT_STATIONS.map((s) => ({ ...s })));

  ['zirkel-v1', 'content-v2', 'content-v3', 'content-v4'].forEach((k) => { if (!applied.includes(k)) applied.push(k); });
  localStorage.setItem(SEED_KEY, JSON.stringify(applied));
}
