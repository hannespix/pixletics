// Inhalts-Pack „Vital“ (versteckte Schwester-App von pixletics).
// Sanfte, gelenkschonende Reha-/Bewegungsübungen (Vital-Profil). Inhalt für
// gruppen. Struktur identisch zum Freeletics-Pack (exercises.js), nur ruhigere
// Inhalte, eigenes Theme/Branding und niedrigere Default-Intensität.
//
// WICHTIG: Diese App ersetzt keine ärztliche oder physiotherapeutische Beratung.

export const DEFAULT_REPS = 3;

// Übungs-Bibliothek (sanft). id muss eindeutig sein; fig = Animations-Schlüssel.
export const DEFAULT_EXERCISES = [
  { id: 'vital-march',     name: 'Marschieren auf der Stelle', area: 'Aufwärmen',     emoji: '🚶', cue: 'Locker auf der Stelle gehen, Arme leicht mitschwingen', reps: 3 },
  { id: 'vital-armraise',  name: 'Arme heben',                 area: 'Schultern',     emoji: '🙆', cue: 'Gestreckte Arme langsam nach vorne/oben heben und senken', reps: 3 },
  { id: 'vital-squat',     name: 'Kniebeuge zum Stuhl',        area: 'Beine',         emoji: '🪑', cue: 'Wie zum Hinsetzen, Gesäß zurück – nur so tief wie angenehm', reps: 3 },
  { id: 'vital-calf',      name: 'Wadenheben',                 area: 'Waden',         emoji: '👣', cue: 'Auf die Fußballen hoch, langsam absenken (ggf. festhalten)', reps: 3 },
  { id: 'vital-bridge',    name: 'Beckenheben',                area: 'Po & Rücken',   emoji: '🌉', cue: 'In Rückenlage das Becken sanft anheben, kurz halten', reps: 3 },
  { id: 'vital-superman',  name: 'Rückenstärkung',             area: 'Rücken',        emoji: '🦸', cue: 'In Bauchlage Arme/Beine nur leicht abheben', reps: 3 },
  { id: 'vital-legraise',  name: 'Beinheben (liegend)',        area: 'Bauch',         emoji: '🦶', cue: 'Gestreckte Beine langsam heben und senken, Rücken bleibt flach', reps: 3 },
  { id: 'vital-crunch',    name: 'Bauchpresse (sanft)',        area: 'Bauch',         emoji: '🔵', cue: 'Schulterblätter nur leicht anheben, Nacken locker', reps: 3 },
  { id: 'vital-bend',      name: 'Rumpfbeuge (Dehnung)',       area: 'Beweglichkeit', emoji: '🧘', cue: 'Im Stehen langsam nach vorn beugen, so weit angenehm, wieder aufrichten', reps: 3 },
  { id: 'vital-twist',     name: 'Sanfte Rumpfdrehung',        area: 'Beweglichkeit', emoji: '🌀', cue: 'Oberkörper locker zur Seite drehen, Hüfte bleibt ruhig', reps: 3 },
  { id: 'vital-balance',   name: 'Einbeinstand',               area: 'Gleichgewicht', emoji: '⚖️', cue: 'Pro Seite – ein Knie anheben und das Gleichgewicht halten (ggf. festhalten)', reps: 4 },
  { id: 'vital-lunge',     name: 'Ausfallschritt (klein)',     area: 'Beine',         emoji: '🚶', cue: 'Pro Seite – kleiner Schritt nach vorn, vorderes Knie über dem Knöchel', reps: 4 },
  { id: 'vital-wallsit',   name: 'Wandsitzen (kurz)',          area: 'Beine',         emoji: '🧱', cue: 'Mit dem Rücken an der Wand, nur leicht in die Knie – kurz halten', reps: 3 },
  { id: 'vital-plank',     name: 'Unterarmstütz (kurz)',       area: 'Core',          emoji: '➖', cue: 'Körper gerade halten (auch auf den Knien möglich), kurz halten', reps: 3 },
  { id: 'vital-breathe',   name: 'Tiefe Atmung',               area: 'Atmung',        emoji: '🌬️', cue: 'Ruhig ein- und ausatmen, Arme heben/senken sich sanft mit', reps: 2 },
];

// Sanfte Standard-Sets.
export const DEFAULT_SETS = [
  {
    id: 'vital-set-easy',
    name: '🌱 Sanfter Einstieg',
    exercises: ['vital-march', 'vital-armraise', 'vital-bend', 'vital-calf', 'vital-balance', 'vital-breathe'],
  },
  {
    id: 'vital-set-strength',
    name: '💪 Kraft & Stabilität (sanft)',
    exercises: ['vital-march', 'vital-squat', 'vital-bridge', 'vital-superman', 'vital-wallsit', 'vital-armraise', 'vital-plank', 'vital-balance', 'vital-breathe'],
  },
  {
    id: 'vital-set-mobility',
    name: '🧘 Beweglichkeit & Entspannung',
    exercises: ['vital-march', 'vital-bend', 'vital-armraise', 'vital-twist', 'vital-calf', 'vital-balance', 'vital-breathe'],
  },
  {
    id: 'vital-set-full',
    name: '🌿 Ganzkörper (sanft)',
    exercises: ['vital-march', 'vital-armraise', 'vital-squat', 'vital-bridge', 'vital-superman', 'vital-legraise', 'vital-crunch', 'vital-calf', 'vital-twist', 'vital-balance', 'vital-breathe'],
  },
];

// Animations-Zuordnung (Übungs-id -> figure.js-Animationsschlüssel).
export const FIGURE_ANIMS = {
  'vital-march': 'highknees',
  'vital-armraise': 'vital_armraise',
  'vital-squat': 'squats',
  'vital-calf': 'calfraises',
  'vital-bridge': 'bridge',
  'vital-superman': 'superman',
  'vital-legraise': 'legraises',
  'vital-crunch': 'crunches',
  'vital-bend': 'vital_forwardbend',
  'vital-twist': 'twists',
  'vital-balance': 'vital_balance',
  'vital-lunge': 'lunges',
  'vital-wallsit': 'wallsit',
  'vital-plank': 'plank',
  'vital-breathe': 'vital_breathing',
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
  shareTitle: 'pixletics · Vital',
  shareText: 'pixletics Vital – sanfte Bewegungsübungen mit Coach-Ansagen, Musik und eigenen Sets:',
  shareFile: 'pixletics-vital-konfiguration.json',
};
