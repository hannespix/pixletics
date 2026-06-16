// Bibliothek typischer Bodyweight-/Zirkel-Übungen (Vorlage).
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

// Zirkeltraining-Stationen: jede Station wird pro Runde genau einmal absolviert
// (reps: 1) – man geht im Kreis von Matte zu Matte.
export const CIRCUIT_EXERCISES = [
  { id: 'circ-rope',      name: 'Seilspringen',            area: 'Cardio',     emoji: '🪢', cue: 'Seil schwingen, locker auf den Ballen springen', reps: 1 },
  { id: 'circ-shuttle',   name: 'Pendellauf',              area: 'Cardio',     emoji: '🏃', cue: 'Zwischen zwei Bänken hin und her sprinten',       reps: 1 },
  { id: 'circ-scooter',   name: 'Rollbrett ziehen',        area: 'Ganzkörper', emoji: '🛹', cue: 'Bäuchlings auf dem Rollbrett mit den Armen ziehen', reps: 1 },
  { id: 'circ-ballwall',  name: 'Ball an die Decke',       area: 'Schultern',  emoji: '🏐', cue: 'Ball kraftvoll hochwerfen und wieder fangen',       reps: 1 },
  { id: 'circ-lunge',     name: 'Ausfallschritte',         area: 'Beine',      emoji: '🚶', cue: 'Im Wechsel pro Seite, Knie über dem Knöchel',       reps: 1 },
  { id: 'circ-rings',     name: 'Ringe ziehen',            area: 'Rücken',     emoji: '🟠', cue: 'An den Ringen hochziehen und kontrolliert ablassen', reps: 1 },
  { id: 'circ-bench',     name: 'Bank stemmen',            area: 'Brust',      emoji: '🛏️', cue: 'Gewicht/Stange von der Brust nach oben drücken',    reps: 1 },
  { id: 'circ-wallbars',  name: 'Sprossenwand-Beinheben',  area: 'Bauch',      emoji: '🧗', cue: 'An der Sprossenwand hängend die Beine anheben',     reps: 1 },
  { id: 'circ-overhead',  name: 'Stange überkopf stemmen', area: 'Schultern',  emoji: '🏋️', cue: 'Stange hinter dem Nacken nach oben stemmen',        reps: 1 },
  { id: 'circ-hipthrust', name: 'Hüftstemmen mit Gewicht', area: 'Po',         emoji: '🌉', cue: 'Gewicht auf der Hüfte, Becken kraftvoll hochdrücken', reps: 1 },
  { id: 'circ-boxjump',   name: 'Box-Sprünge',             area: 'Beine',      emoji: '📦', cue: 'Beidbeinig auf die Box springen, kontrolliert runter', reps: 1 },
  { id: 'circ-battlerope',name: 'Battle Ropes',            area: 'Arme',       emoji: '🌊', cue: 'Taue im schnellen Wechsel auf und ab schlagen',     reps: 1 },
  { id: 'circ-kettlebell',name: 'Kettlebell-Swings',       area: 'Ganzkörper', emoji: '🔔', cue: 'Aus der Hüfte schwungvoll auf Schulterhöhe',        reps: 1 },
  { id: 'circ-medball',   name: 'Medizinball-Slams',       area: 'Ganzkörper', emoji: '💥', cue: 'Ball über Kopf und kraftvoll auf den Boden schmettern', reps: 1 },
  { id: 'circ-stepups',   name: 'Step-ups auf die Bank',   area: 'Beine',      emoji: '🪜', cue: 'Im Wechsel auf die Bank steigen, Knie hoch',         reps: 1 },
];

// Ergänzende Übungen, die bisher fehlende Körperregionen abdecken (Schultern,
// Waden, Rücken) – so lässt sich jeder Bereich von Kopf bis Fuß trainieren.
// Werden bei Bestandsnutzern per Migration zur Bibliothek hinzugefügt.
export const EXTRA_EXERCISES = [
  { id: 'pikepushups',  name: 'Pike-Liegestütze',   area: 'Schultern',  emoji: '🔻', cue: 'Hüfte hoch zum „V“, Kopf Richtung Boden senken', reps: 3 },
  { id: 'shouldertaps', name: 'Schulterklopfen',    area: 'Schultern',  emoji: '👋', cue: 'Im hohen Stütz abwechselnd die Schulter antippen', reps: 3 },
  { id: 'calfraises',   name: 'Wadenheben',         area: 'Waden',      emoji: '👣', cue: 'Auf die Zehenspitzen hoch, langsam absenken', reps: 3 },
  { id: 'swimmers',     name: 'Schwimmer',          area: 'Rücken',     emoji: '🏊', cue: 'Bäuchlings Arme und Beine wechselseitig heben', reps: 3 },
];

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
  // Ergänzende Übungen (Schultern, Waden, Rücken).
  ...EXTRA_EXERCISES,
  // Zirkeltraining-Stationen mit anhängen (in der Bibliothek wählbar).
  ...CIRCUIT_EXERCISES,
];

// Vorgefertigtes Zirkeltraining: 15 Stationen, jede einmal pro Runde „im Kreis“.
// activeRest: ab der 2. Runde ist die Pause eine Aktivpause (Runde um die Halle).
export const CIRCUIT_SET = {
  id: 'set-zirkel',
  name: '🎯 Zirkeltraining',
  activeRest: true,
  exercises: CIRCUIT_EXERCISES.map((e) => e.id),
};

// Vordefinierte Sets. Drei Freeletics-Ganzkörper-Workouts (je ~50–55 min bei
// 30/30/10) mit Variation, plus das Zirkeltraining. Jedes Set trainiert den
// kompletten Körper von Kopf bis Fuß: Beine (Quadrizeps), Po & hintere Kette,
// Waden, Brust, Schultern, Rücken, Arme (Trizeps), Bauch und Core – dazu
// Cardio-Aufwärmen und ein Ganzkörper-Finisher.
export const DEFAULT_SETS = [
  {
    id: 'set-free-a',
    name: '🤸‍♂️ Freeletics A · Kraft & Core',
    exercises: [
      'jacks',        // Aufwärmen / Cardio
      'squats',       // Beine / Quadrizeps
      'pushups',      // Brust
      'pikepushups',  // Schultern
      'superman',     // Rücken
      'lunges',       // Beine / Po (pro Seite)
      'tricepdips',   // Arme / Trizeps
      'calfraises',   // Waden
      'bridge',       // Po / hintere Oberschenkel
      'situps',       // Bauch
      'plank',        // Core (statisch)
      'wallsit',      // Beine (statisch)
      'climbers',     // Cardio / Core
      'burpees',      // Ganzkörper-Finisher
    ],
  },
  {
    id: 'set-free-b',
    name: '🤸‍♂️ Freeletics B · Cardio & Stabilität',
    exercises: [
      'highknees',    // Aufwärmen / Cardio
      'jumpsquats',   // Beine (explosiv)
      'pushups',      // Brust
      'shouldertaps', // Schultern
      'swimmers',     // Rücken
      'skater',       // Beine / Cardio (pro Seite)
      'calfraises',   // Waden
      'bridge',       // Po / hintere Kette
      'plankjacks',   // Core / Cardio
      'crunches',     // Bauch
      'sideplank',    // Core (pro Seite)
      'tricepdips',   // Arme / Trizeps
      'climbers',     // Cardio / Core
      'burpees',      // Ganzkörper-Finisher
    ],
  },
  {
    id: 'set-free-c',
    name: '🤸‍♂️ Freeletics C · Ganzkörper-Mix',
    exercises: [
      'jacks',        // Aufwärmen / Cardio
      'lunges',       // Beine / Po (pro Seite)
      'pushups',      // Brust
      'pikepushups',  // Schultern
      'superman',     // Rücken
      'jumpsquats',   // Beine (explosiv)
      'tricepdips',   // Arme / Trizeps
      'calfraises',   // Waden
      'bridge',       // Po / hintere Kette
      'legraises',    // Bauch (unterer)
      'sideplank',    // Core (pro Seite)
      'wallsit',      // Beine (statisch)
      'climbers',     // Cardio / Core
      'burpees',      // Ganzkörper-Finisher
    ],
  },
  CIRCUIT_SET,
];
