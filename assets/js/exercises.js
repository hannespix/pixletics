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
  { id: 'circ-rope',      name: 'Seilspringen',            area: 'Cardio',     emoji: '🪢', cue: 'Seil schwingen, locker auf den Fußballen springen', reps: 1 },
  { id: 'circ-shuttle',   name: 'Pendellauf',              area: 'Cardio',     emoji: '🏃', cue: 'Zwischen zwei Bänken hin und her sprinten, an der Linie kurz abtouchen', reps: 1 },
  { id: 'circ-scooter',   name: 'Rollbrett ziehen',        area: 'Rücken',     emoji: '🛹', cue: 'Bäuchlings auf dem Rollbrett liegen und dich mit den Armen kräftig nach vorne ziehen', reps: 1 },
  { id: 'circ-ballwall',  name: 'Medizinball an die Decke', area: 'Schultern', emoji: '🏐', cue: 'Den Medizinball kraftvoll gerade nach oben werfen und wieder fangen', reps: 1 },
  { id: 'circ-lunge',     name: 'Ausfallschritte',         area: 'Beine',      emoji: '🚶', cue: 'Im Wechsel pro Seite, vorderes Knie über dem Knöchel', reps: 1 },
  { id: 'circ-rings',     name: 'Ringe-Klimmzüge',         area: 'Rücken',     emoji: '🟠', cue: 'An den Ringen kraftvoll hochziehen und kontrolliert ablassen', reps: 1 },
  { id: 'circ-bench',     name: 'Sitzbank stemmen',        area: 'Brust',      emoji: '🛏️', cue: 'Ein Ende der Bank in die Sprossenwand einhängen, das freie Ende von der Brust über den Kopf nach oben stemmen', reps: 1 },
  { id: 'circ-wallbars',  name: 'Sprossenwand-Beinheben',  area: 'Bauch',      emoji: '🧗', cue: 'An der Sprossenwand hängen und die gestreckten Beine nach oben ziehen', reps: 1 },
  { id: 'circ-overhead',  name: 'Stange über Kopf stemmen', area: 'Schultern', emoji: '🏋️', cue: 'Stange von den Schultern gerade über den Kopf nach oben stemmen', reps: 1 },
  { id: 'circ-hipthrust', name: 'Hüftstemmen mit Stange',  area: 'Po',         emoji: '🌉', cue: 'Schultern/Nacken auf der Kiste, Stange auf der Hüfte – das Becken kraftvoll nach oben drücken', reps: 1 },
  { id: 'circ-boxjump',   name: 'Box-Sprünge',             area: 'Beine',      emoji: '📦', cue: 'Beidbeinig auf die Box springen, kontrolliert herunter', reps: 1 },
  { id: 'circ-battlerope',name: 'Battle Ropes',            area: 'Arme',       emoji: '🌊', cue: 'Taue im schnellen Wechsel auf und ab schlagen', reps: 1 },
  { id: 'circ-kettlebell',name: 'Kettlebell-Swings',       area: 'Ganzkörper', emoji: '🔔', cue: 'Aus der Hüfte schwungvoll auf Schulterhöhe', reps: 1 },
  { id: 'circ-medball',   name: 'Medizinball-Slams',       area: 'Ganzkörper', emoji: '💥', cue: 'Ball über Kopf und kraftvoll auf den Boden schmettern', reps: 1 },
  { id: 'circ-stepups',   name: 'Step-ups auf die Bank',   area: 'Beine',      emoji: '🪜', cue: 'Im Wechsel auf die Bank steigen, Knie hoch', reps: 1 },
  // Neu für das Standard-Zirkeltraining:
  { id: 'circ-wallthrow', name: 'Medizinball-Wurf aus Rückenlage', area: 'Ganzkörper', emoji: '🤾', cue: 'Aus der Rückenlage aufrichten und den Medizinball kraftvoll gegen die Wand werfen, fangen und zurück in die Rückenlage', reps: 1 },
  { id: 'circ-sliders',   name: 'Rutschpad-Sprint',        area: 'Cardio',     emoji: '🧊', cue: 'Vorn auf die Sitzbank stützen, in Sprintposition mit Rutschpads unter den Füßen auf der Stelle rennen', reps: 1 },
  { id: 'circ-kbtwist',   name: 'Kettlebell-Russian-Twist', area: 'Bauch',     emoji: '🔄', cue: 'Im V-Sitz mit angehobenen Beinen die Kettlebell von Seite zu Seite über die Hüfte führen', reps: 1 },
  { id: 'circ-rotpushup', name: 'Liegestütz mit Drehung',  area: 'Brust',      emoji: '🙆', cue: 'Liegestütz an Holzgriffen; oben den Oberkörper öffnen und einen Arm zur Decke strecken, Seite im Wechsel', reps: 1 },
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

// Übungen aus dem Montags-Programm („3er Serien 2 – blaue Hantel“), die es in
// der Bibliothek noch nicht gab. Werden bei Bestandsnutzern per Migration
// ergänzt. Die übrigen Montags-Übungen sind bereits Standard (Liegestütze,
// Kniebeugen, Sit-ups, Burpees, Ausfallschritte, Seitstütz, Wandsitzen,
// Beckenheben, Trizeps-Dips).
export const MONDAY_EXERCISES = [
  { id: 'mo-row',        name: 'Rudern (Hantel)',                  area: 'Rücken', emoji: '🚣', cue: 'Oberkörper vorgebeugt, Hantel zum Bauch ziehen', reps: 3 },
  { id: 'mo-vsit',       name: 'Sitzen, Beine anheben & halten',   area: 'Bauch',  emoji: '🚤', cue: 'Aufrecht sitzen, Beine anheben und oben halten', reps: 3 },
  { id: 'mo-bridgeknee', name: 'Brücke, Knie zum Ellenbogen',      area: 'Core',   emoji: '🌉', cue: 'In der Brücke Knie zum gegenüberliegenden Ellenbogen', reps: 3 },
  { id: 'mo-armcircles', name: 'Bauchlage, Arme kreisen',          area: 'Rücken', emoji: '🔄', cue: 'Bäuchlings die gestreckten Arme kreisen lassen', reps: 3 },
  { id: 'mo-bike',       name: 'Fahrrad fahren',                   area: 'Bauch',  emoji: '🚴', cue: 'In Rückenlage die Beine wie beim Radfahren treten', reps: 3 },
  { id: 'mo-revplank',   name: 'Unterarmstütz rücklings, Beine anheben', area: 'Core', emoji: '🔙', cue: 'Rücklings auf die Unterarme stützen, Beine abwechselnd heben', reps: 3 },
  { id: 'mo-quadruped',  name: 'Vierfüßler, Knie & Ellenbogen',    area: 'Core',   emoji: '🐾', cue: 'Im Vierfüßlerstand Knie und Ellenbogen zusammenführen', reps: 3 },
  { id: 'mo-dbhops',     name: 'Beine über Hantel, rechts/links',  area: 'Cardio', emoji: '🏋️', cue: 'Seitlich über die Hantel springen – rechts, links', reps: 3 },
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
  // Übungen aus dem Montags-Programm.
  ...MONDAY_EXERCISES,
  // Zirkeltraining-Stationen mit anhängen (in der Bibliothek wählbar).
  ...CIRCUIT_EXERCISES,
];

// Montags-Programm, 1:1 in der Reihenfolge des bisherigen Ablaufs
// („3er Serien 2 – blaue Hantel“): 17 Übungen, jede 3× hintereinander.
// Bei 30 s Belastung + 30 s Pause ergibt das ~51 Minuten pro Durchlauf.
export const MONDAY_SET = {
  id: 'set-montag',
  name: '🗓️ Montag · 3er Serien (blaue Hantel)',
  exercises: [
    'situps',         //  1. Situps gerade
    'burpees',        //  2. Burpees
    'squats',         //  3. Kniebeugen
    'mo-row',         //  4. Rudern
    'tricepdips',     //  5. Rücklings an Kiste – Trizeps
    'mo-vsit',        //  6. Sitzen, Beine anheben und halten
    'wallsit',        //  7. Sitzen an der Wand
    'mo-bridgeknee',  //  8. Brücke, Knie zum gegenüberliegenden Ellenbogen
    'bridge',         //  9. Rückenlage, Hüfte anheben
    'mo-armcircles',  // 10. Bauchlage, Arme kreisen
    'sideplank',      // 11. Seitstütz
    'lunges',         // 12. Ausfallschritte
    'mo-bike',        // 13. Fahrrad fahren
    'pushups',        // 14. Liegestütze
    'mo-revplank',    // 15. Unterarmstütz rücklings, Beine anheben
    'mo-quadruped',   // 16. Vierfüßler, Knie und Ellenbogen zusammen
    'mo-dbhops',      // 17. Beine über Hantel rechts/links
  ],
  // Im Original läuft JEDE Übung 3× – auch die sonst beidseitigen (4×).
  reps: { lunges: 3, sideplank: 3 },
};

// Vorgefertigtes Zirkeltraining: 15 Stationen, jede einmal pro Runde „im Kreis“.
// activeRest: ab der 2. Runde ist die Pause eine Aktivpause (Runde um die Halle).
export const CIRCUIT_SET = {
  id: 'set-zirkel',
  name: '🎯 Zirkeltraining',
  activeRest: true,
  // Standard-Zirkel: 15 Stationen in fester Reihenfolge (je Station 1× pro Runde).
  exercises: [
    'tricepdips',     //  1. Trizeps-Dips an der Kiste
    'circ-rope',      //  2. Seilspringen
    'circ-scooter',   //  3. Rollbrett ziehen (Oberkörper nach vorne)
    'circ-rings',     //  4. Ringe-Klimmzüge
    'circ-wallthrow', //  5. Medizinball-Wurf aus Rückenlage an die Wand
    'circ-shuttle',   //  6. Pendellauf
    'circ-wallbars',  //  7. Sprossenwand-Beinheben
    'circ-bench',     //  8. Sitzbank stemmen
    'circ-rotpushup', //  9. Liegestütz mit Drehung (Alt. zu Wandsitzen)
    'circ-hipthrust', // 10. Hüftstemmen mit Stange
    'circ-overhead',  // 11. Stange über Kopf stemmen
    'circ-sliders',   // 12. Rutschpad-Sprint
    'circ-ballwall',  // 13. Medizinball an die Decke
    'circ-lunge',     // 14. Ausfallschritte
    'circ-kbtwist',   // 15. Kettlebell-Russian-Twist
  ],
  // Trizeps-Dips ist eine Standard-Übung (reps 3) – im Zirkel nur 1× pro Station.
  reps: { tricepdips: 1 },
};

// Vordefinierte Sets. Drei Freeletics-Ganzkörper-Workouts mit ~60 Übungs-
// Wiederholungen, sodass bei 30/30-Timing rund eine Stunde abwechslungsreiches
// (nicht wiederholtes) Training herauskommt. Jedes Set trainiert den kompletten
// Körper von Kopf bis Fuß: Beine (Quadrizeps), Po & hintere Kette, Waden, Brust,
// Schultern, Rücken, Arme (Trizeps), Bauch und Core – dazu Cardio-Aufwärmen und
// ein Ganzkörper-Finisher. Die meisten Übungen kommen 3×, beidseitige 4×.
export const DEFAULT_SETS = [
  {
    id: 'set-free-a',
    name: '🤸‍♂️ Freeletics A · Kraft & Core',
    exercises: [
      'jacks',        // Cardio / Aufwärmen
      'squats',       // Beine / Quadrizeps
      'pushups',      // Brust
      'pikepushups',  // Schultern
      'superman',     // Rücken
      'lunges',       // Beine / Po (pro Seite)
      'tricepdips',   // Arme / Trizeps
      'calfraises',   // Waden
      'bridge',       // Po / hintere Kette
      'situps',       // Bauch
      'plank',        // Core (statisch)
      'climbers',     // Cardio / Core
      'diamond',      // Brust / Trizeps
      'shouldertaps', // Schultern
      'swimmers',     // Rücken
      'crunches',     // Bauch
      'sideplank',    // Core (pro Seite)
      'skater',       // Beine / Cardio (pro Seite)
      'burpees',      // Ganzkörper-Finisher
    ],
  },
  {
    id: 'set-free-b',
    name: '🤸‍♂️ Freeletics B · Cardio & Stabilität',
    exercises: [
      'highknees',    // Cardio / Aufwärmen
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
      'lunges',       // Beine / Po (pro Seite)
      'pikepushups',  // Schultern
      'superman',     // Rücken
      'twists',       // Bauch / Rotation
      'jacks',        // Cardio
      'burpees',      // Ganzkörper-Finisher
    ],
  },
  {
    id: 'set-free-c',
    name: '🤸‍♂️ Freeletics C · Ganzkörper-Mix',
    exercises: [
      'jacks',        // Cardio / Aufwärmen
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
      'climbers',     // Cardio / Core
      'diamond',      // Brust / Trizeps
      'shouldertaps', // Schultern
      'swimmers',     // Rücken
      'twists',       // Bauch / Rotation
      'squats',       // Beine / Quadrizeps
      'plank',        // Core (statisch)
      'burpees',      // Ganzkörper-Finisher
    ],
  },
  MONDAY_SET,
  CIRCUIT_SET,
];
