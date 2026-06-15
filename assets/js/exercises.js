// Bibliothek typischer Freeletics-/Bodyweight-Übungen (Vorlage).
// Die tatsächlich genutzte Liste ist editierbar und liegt im localStorage
// (siehe store.js) – diese Konstanten dienen nur als Erstbefüllung.
// id   : eindeutiger Schlüssel (für Speicherung / Sets)
// name : Anzeige- und Sprachname (Deutsch)
// area : Körperbereich (für Filter / Anzeige)
// emoji: kleines Icon
// cue  : kurzer Bewegungshinweis (Beschreibung)
// reps : Standard-Wiederholungen pro Übung (beidseitige Übungen = 4, sonst 3)

// Standard-Wiederholungen, falls eine Übung keinen eigenen Wert hat.
export const DEFAULT_REPS = 3;

export const DEFAULT_EXERCISES = [
  { id: 'burpees',      name: 'Burpees',            area: 'Ganzkörper', emoji: '🔥', cue: 'Liegestütz + Strecksprung', reps: 3 },
  { id: 'pushups',      name: 'Liegestütze',        area: 'Brust',      emoji: '💪', cue: 'Körper gerade, tief runter', reps: 3 },
  { id: 'squats',       name: 'Kniebeugen',         area: 'Beine',      emoji: '🦵', cue: 'Hüfte zurück, Knie nach außen', reps: 3 },
  { id: 'lunges',       name: 'Ausfallschritte',    area: 'Beine',      emoji: '🚶', cue: 'Pro Seite – Knie über Knöchel', reps: 4 },
  { id: 'situps',       name: 'Sit-ups',            area: 'Bauch',      emoji: '🟢', cue: 'Bauch anspannen, kontrolliert', reps: 3 },
  { id: 'climbers',     name: 'Mountain Climbers',  area: 'Ganzkörper', emoji: '⛰️', cue: 'Knie schnell zur Brust ziehen', reps: 3 },
  { id: 'jacks',        name: 'Hampelmänner',       area: 'Cardio',     emoji: '🤸', cue: 'Arme und Beine im Takt', reps: 3 },
  { id: 'plank',        name: 'Unterarmstütz',      area: 'Core',       emoji: '➖', cue: 'Körper bretthart halten', reps: 3 },
  { id: 'highknees',    name: 'Knieheben',          area: 'Cardio',     emoji: '🏃', cue: 'Knie hoch, schnelles Tempo', reps: 3 },
  { id: 'legraises',    name: 'Beinheben',          area: 'Bauch',      emoji: '🦶', cue: 'Beine gestreckt heben/senken', reps: 3 },
  { id: 'superman',     name: 'Superman',           area: 'Rücken',     emoji: '🦸', cue: 'Arme und Beine gleichzeitig heben', reps: 3 },
  { id: 'wallsit',      name: 'Wandsitzen',         area: 'Beine',      emoji: '🧱', cue: 'Oberschenkel waagerecht halten', reps: 3 },
  { id: 'twists',       name: 'Russian Twists',     area: 'Bauch',      emoji: '🌀', cue: 'Oberkörper von Seite zu Seite', reps: 3 },
  { id: 'diamond',      name: 'Enge Liegestütze',   area: 'Trizeps',    emoji: '🔷', cue: 'Hände eng, Diamantform', reps: 3 },
  { id: 'tricepdips',   name: 'Trizeps-Dips',       area: 'Trizeps',    emoji: '🪑', cue: 'An Kiste/Stuhl, Ellbogen nach hinten beugen', reps: 3 },
  { id: 'jumpsquats',   name: 'Strecksprünge',      area: 'Beine',      emoji: '⚡', cue: 'Aus der Kniebeuge explosiv springen', reps: 3 },
  { id: 'plankjacks',   name: 'Plank Jacks',        area: 'Core',       emoji: '↔️', cue: 'Im Plank Beine auf/zu springen', reps: 3 },
  { id: 'crunches',     name: 'Crunches',           area: 'Bauch',      emoji: '🔵', cue: 'Schulterblätter leicht anheben', reps: 3 },
  { id: 'bridge',       name: 'Beckenheben',        area: 'Po',         emoji: '🌉', cue: 'Hüfte hoch, Po anspannen', reps: 3 },
  { id: 'sideplank',    name: 'Seitstütz',          area: 'Core',       emoji: '📐', cue: 'Pro Seite – seitlich stützen, Hüfte hoch', reps: 4 },
  { id: 'skater',       name: 'Skater-Sprünge',     area: 'Beine',      emoji: '⛸️', cue: 'Pro Seite – seitlich von Bein zu Bein', reps: 4 },
];

// Vordefinierte Beispiel-Sets, die beim ersten Start angelegt werden.
export const DEFAULT_SETS = [
  {
    id: 'set-freeletics',
    name: 'Freeletics Programm',
    // Ganzkörper-Zirkel, bewusst nach Muskelgruppen abwechselnd sortiert,
    // damit die Wiederholungen pro Übung nicht dieselbe Gruppe überlasten.
    exercises: [
      'jacks',       // Aufwärmen / Cardio
      'squats',      // Beine
      'pushups',     // Brust / Drücken
      'lunges',      // Beine (pro Seite, 4×)
      'tricepdips',  // Trizeps (an der Kiste)
      'wallsit',     // Beine (statisch, an der Wand)
      'climbers',    // Core / Cardio
      'situps',      // Bauch
      'plank',       // Core (statisch)
      'burpees',     // Ganzkörper-Finisher
    ],
  },
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
