// Persistenz über localStorage: Übungen, Übungssets und Einstellungen.
import { DEFAULT_SETS, DEFAULT_EXERCISES, DEFAULT_REPS } from './exercises.js';

const SETS_KEY = 'freeletics.sets.v2';
const CONFIG_KEY = 'freeletics.config.v2';
const EXERCISES_KEY = 'freeletics.exercises.v1';

export const DEFAULT_CONFIG = {
  workSeconds: 30,    // Dauer einer Übung (Belastung)
  restSeconds: 30,    // Pause zwischen den Übungen
  prepareSeconds: 10, // Countdown vor jeder Übung
  totalMinutes: 60,   // Gesamtdauer des Programms
  voice: true,        // Sprachansagen an/aus
  beeps: true,        // Signaltöne an/aus
  duckSpotify: true,  // Spotify bei Ansagen leiser
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
