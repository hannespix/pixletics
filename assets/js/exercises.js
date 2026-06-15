// Bibliothek typischer Freeletics-/Bodyweight-Übungen.
// Jede Übung deckt einen Bereich ab, zusammen kommt der ganze Körper dran.
// id  : eindeutiger Schlüssel (für Speicherung / Sets)
// name: Anzeige- und Sprachname (Deutsch)
// area: Körperbereich (für Filter / Anzeige)
// emoji: kleines Icon
// cue : kurzer Bewegungshinweis

export const EXERCISES = [
  { id: 'burpees',      name: 'Burpees',            area: 'Ganzkörper', emoji: '🔥', cue: 'Liegestütz + Strecksprung' },
  { id: 'pushups',      name: 'Liegestütze',        area: 'Brust',      emoji: '💪', cue: 'Körper gerade, tief runter' },
  { id: 'squats',       name: 'Kniebeugen',         area: 'Beine',      emoji: '🦵', cue: 'Hüfte zurück, Knie nach außen' },
  { id: 'lunges',       name: 'Ausfallschritte',    area: 'Beine',      emoji: '🚶', cue: 'Im Wechsel, Knie über Knöchel' },
  { id: 'situps',       name: 'Sit-ups',            area: 'Bauch',      emoji: '🟢', cue: 'Bauch anspannen, kontrolliert' },
  { id: 'climbers',     name: 'Mountain Climbers',  area: 'Ganzkörper', emoji: '⛰️', cue: 'Knie schnell zur Brust ziehen' },
  { id: 'jacks',        name: 'Hampelmänner',       area: 'Cardio',     emoji: '🤸', cue: 'Arme und Beine im Takt' },
  { id: 'plank',        name: 'Unterarmstütz',      area: 'Core',       emoji: '➖', cue: 'Körper bretthart halten' },
  { id: 'highknees',    name: 'Knieheben',          area: 'Cardio',     emoji: '🏃', cue: 'Knie hoch, schnelles Tempo' },
  { id: 'legraises',    name: 'Beinheben',          area: 'Bauch',      emoji: '🦶', cue: 'Beine gestreckt heben/senken' },
  { id: 'superman',     name: 'Superman',           area: 'Rücken',     emoji: '🦸', cue: 'Arme und Beine gleichzeitig heben' },
  { id: 'wallsit',      name: 'Wandsitzen',         area: 'Beine',      emoji: '🧱', cue: 'Oberschenkel waagerecht halten' },
  { id: 'twists',       name: 'Russian Twists',     area: 'Bauch',      emoji: '🌀', cue: 'Oberkörper von Seite zu Seite' },
  { id: 'diamond',      name: 'Enge Liegestütze',   area: 'Trizeps',    emoji: '🔷', cue: 'Hände eng, Diamantform' },
  { id: 'jumpsquats',   name: 'Strecksprünge',      area: 'Beine',      emoji: '⚡', cue: 'Aus der Kniebeuge explosiv springen' },
  { id: 'plankjacks',   name: 'Plank Jacks',        area: 'Core',       emoji: '↔️', cue: 'Im Plank Beine auf/zu springen' },
  { id: 'crunches',     name: 'Crunches',           area: 'Bauch',      emoji: '🔵', cue: 'Schulterblätter leicht anheben' },
  { id: 'bridge',       name: 'Beckenheben',        area: 'Po',         emoji: '🌉', cue: 'Hüfte hoch, Po anspannen' },
  { id: 'sideplank',    name: 'Seitstütz',          area: 'Core',       emoji: '📐', cue: 'Seitlich stützen, Hüfte hoch' },
  { id: 'skater',       name: 'Skater-Sprünge',     area: 'Beine',      emoji: '⛸️', cue: 'Seitlich von Bein zu Bein springen' },
];

export const EXERCISE_MAP = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

// Vordefinierte Beispiel-Sets, die beim ersten Start angelegt werden.
export const DEFAULT_SETS = [
  {
    id: 'set-ganzkoerper',
    name: 'Ganzkörper Klassiker',
    exercises: ['burpees', 'pushups', 'squats', 'lunges', 'situps', 'climbers'],
  },
  {
    id: 'set-core',
    name: 'Core & Bauch',
    exercises: ['plank', 'crunches', 'legraises', 'twists', 'sideplank', 'bridge'],
  },
  {
    id: 'set-cardio',
    name: 'Cardio Burner',
    exercises: ['jacks', 'highknees', 'jumpsquats', 'climbers', 'skater', 'burpees'],
  },
];
