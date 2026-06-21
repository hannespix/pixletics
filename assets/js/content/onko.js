// Inhalts-Pack „Onko-Sport“ (versteckte Schwester-App von pixletics).
// Sanfte, gelenkschonende Reha-/Bewegungsübungen für onkologische Trainings-
// gruppen. Struktur identisch zum Freeletics-Pack (exercises.js), nur ruhigere
// Inhalte, eigenes Theme/Branding und niedrigere Default-Intensität.
//
// WICHTIG: Diese App ersetzt keine ärztliche oder physiotherapeutische Beratung.

export const DEFAULT_REPS = 3;

// Übungs-Bibliothek (sanft). id muss eindeutig sein; fig = Animations-Schlüssel.
export const DEFAULT_EXERCISES = [
  { id: 'onko-march',     name: 'Marschieren auf der Stelle', area: 'Aufwärmen',     emoji: '🚶', cue: 'Locker auf der Stelle gehen, Arme leicht mitschwingen', reps: 3 },
  { id: 'onko-armraise',  name: 'Arme heben',                 area: 'Schultern',     emoji: '🙆', cue: 'Gestreckte Arme langsam nach vorne/oben heben und senken', reps: 3 },
  { id: 'onko-squat',     name: 'Kniebeuge zum Stuhl',        area: 'Beine',         emoji: '🪑', cue: 'Wie zum Hinsetzen, Gesäß zurück – nur so tief wie angenehm', reps: 3 },
  { id: 'onko-calf',      name: 'Wadenheben',                 area: 'Waden',         emoji: '👣', cue: 'Auf die Fußballen hoch, langsam absenken (ggf. festhalten)', reps: 3 },
  { id: 'onko-bridge',    name: 'Beckenheben',                area: 'Po & Rücken',   emoji: '🌉', cue: 'In Rückenlage das Becken sanft anheben, kurz halten', reps: 3 },
  { id: 'onko-superman',  name: 'Rückenstärkung',             area: 'Rücken',        emoji: '🦸', cue: 'In Bauchlage Arme/Beine nur leicht abheben', reps: 3 },
  { id: 'onko-legraise',  name: 'Beinheben (liegend)',        area: 'Bauch',         emoji: '🦶', cue: 'Gestreckte Beine langsam heben und senken, Rücken bleibt flach', reps: 3 },
  { id: 'onko-crunch',    name: 'Bauchpresse (sanft)',        area: 'Bauch',         emoji: '🔵', cue: 'Schulterblätter nur leicht anheben, Nacken locker', reps: 3 },
  { id: 'onko-bend',      name: 'Rumpfbeuge (Dehnung)',       area: 'Beweglichkeit', emoji: '🧘', cue: 'Im Stehen langsam nach vorn beugen, so weit angenehm, wieder aufrichten', reps: 3 },
  { id: 'onko-twist',     name: 'Sanfte Rumpfdrehung',        area: 'Beweglichkeit', emoji: '🌀', cue: 'Oberkörper locker zur Seite drehen, Hüfte bleibt ruhig', reps: 3 },
  { id: 'onko-balance',   name: 'Einbeinstand',               area: 'Gleichgewicht', emoji: '⚖️', cue: 'Pro Seite – ein Knie anheben und das Gleichgewicht halten (ggf. festhalten)', reps: 4 },
  { id: 'onko-lunge',     name: 'Ausfallschritt (klein)',     area: 'Beine',         emoji: '🚶', cue: 'Pro Seite – kleiner Schritt nach vorn, vorderes Knie über dem Knöchel', reps: 4 },
  { id: 'onko-wallsit',   name: 'Wandsitzen (kurz)',          area: 'Beine',         emoji: '🧱', cue: 'Mit dem Rücken an der Wand, nur leicht in die Knie – kurz halten', reps: 3 },
  { id: 'onko-plank',     name: 'Unterarmstütz (kurz)',       area: 'Core',          emoji: '➖', cue: 'Körper gerade halten (auch auf den Knien möglich), kurz halten', reps: 3 },
  { id: 'onko-breathe',   name: 'Tiefe Atmung',               area: 'Atmung',        emoji: '🌬️', cue: 'Ruhig ein- und ausatmen, Arme heben/senken sich sanft mit', reps: 2 },
];

// Sanfte Standard-Sets.
export const DEFAULT_SETS = [
  {
    id: 'onko-set-easy',
    name: '🌱 Sanfter Einstieg',
    exercises: ['onko-march', 'onko-armraise', 'onko-bend', 'onko-calf', 'onko-balance', 'onko-breathe'],
  },
  {
    id: 'onko-set-strength',
    name: '💪 Kraft & Stabilität (sanft)',
    exercises: ['onko-march', 'onko-squat', 'onko-bridge', 'onko-superman', 'onko-wallsit', 'onko-armraise', 'onko-plank', 'onko-balance', 'onko-breathe'],
  },
  {
    id: 'onko-set-mobility',
    name: '🧘 Beweglichkeit & Entspannung',
    exercises: ['onko-march', 'onko-bend', 'onko-armraise', 'onko-twist', 'onko-calf', 'onko-balance', 'onko-breathe'],
  },
  {
    id: 'onko-set-full',
    name: '🌿 Ganzkörper (sanft)',
    exercises: ['onko-march', 'onko-armraise', 'onko-squat', 'onko-bridge', 'onko-superman', 'onko-legraise', 'onko-crunch', 'onko-calf', 'onko-twist', 'onko-balance', 'onko-breathe'],
  },
];

// Animations-Zuordnung (Übungs-id -> figure.js-Animationsschlüssel).
export const FIGURE_ANIMS = {
  'onko-march': 'highknees',
  'onko-armraise': 'onko_armraise',
  'onko-squat': 'squats',
  'onko-calf': 'calfraises',
  'onko-bridge': 'bridge',
  'onko-superman': 'superman',
  'onko-legraise': 'legraises',
  'onko-crunch': 'crunches',
  'onko-bend': 'onko_forwardbend',
  'onko-twist': 'twists',
  'onko-balance': 'onko_balance',
  'onko-lunge': 'lunges',
  'onko-wallsit': 'wallsit',
  'onko-plank': 'plank',
  'onko-breathe': 'onko_breathing',
};

// Sanftere Vorgaben: längere Belastung, ruhigerer Coach, kürzeres Programm.
export const CONFIG_OVERRIDES = {
  workSeconds: 40,
  pauseSeconds: 30,
  totalMinutes: 20,
  voicePersona: 'lena',   // „Die Mutmacherin“ – ermutigend & sanft
  voiceRate: 1.0,
  motivation: 45,
};

// Ruhige, ermutigende Slogans (Format wie main.js: *…* = Akzent).
export const HERO_SLOGANS = [
  'Schön, dass du *aktiv* bleibst! 🌿',
  'Jede Bewegung *zählt*. 💚',
  'In *deinem* Tempo. 🌱',
  'Sanft in *Bewegung*. 🙆',
  'Bleib *dran* – das tut dir gut. ✨',
  'Hör auf deinen *Körper*. 🧡',
];

export const BRAND = {
  shareTitle: 'pixletics · Onko-Sport',
  shareText: 'pixletics Onko-Sport – sanfte Bewegungsübungen mit Coach-Ansagen, Musik und eigenen Sets:',
  shareFile: 'pixletics-onko-konfiguration.json',
};
