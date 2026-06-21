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

// Kuratierte, sanfte Anleitungen pro Vital-Übung (Struktur wie howto.js: steps =
// Schritt-für-Schritt, tips = worauf besonders achten). howto.js greift per
// Übungs-id darauf zu, wenn keine eigene Anleitung am Objekt hinterlegt ist.
// Bewusst gelenkschonend formuliert: „nur so weit wie angenehm“, ggf. festhalten.
export const HOWTO = {
  'vital-march': {
    steps: [
      'Aufrecht hinstellen, die Füße etwa hüftbreit, der Blick geht nach vorn.',
      'Abwechselnd die Knie locker anheben – nur so hoch, wie es angenehm ist.',
      'Die Arme entspannt mitschwingen lassen und ruhig weiteratmen.',
    ],
    tips: [
      'Das Tempo selbst bestimmen – langsam ist völlig in Ordnung.',
      'Bei unsicherem Stand in der Nähe einer Wand oder Stuhllehne marschieren.',
      'Locker bleiben, die Schultern nicht hochziehen.',
    ],
  },
  'vital-armraise': {
    steps: [
      'Aufrecht stehen oder sitzen, die Arme hängen locker an den Seiten.',
      'Die gestreckten Arme langsam nach vorn und oben heben – so weit, wie es ohne Schmerzen geht.',
      'Ebenso langsam wieder absenken.',
    ],
    tips: [
      'Die Schultern bleiben tief und locker, nicht zu den Ohren ziehen.',
      'Nur bis zur angenehmen Höhe heben – nicht in den Schmerz hinein.',
      'Ruhig atmen: beim Heben ein, beim Senken aus.',
    ],
  },
  'vital-squat': {
    steps: [
      'Vor einen Stuhl stellen, die Füße etwa hüftbreit.',
      'Das Gesäß nach hinten schieben, als wolltest du dich setzen – nur so tief, wie es angenehm ist.',
      'Über die Fersen wieder aufrichten.',
    ],
    tips: [
      'Die Knie zeigen in Richtung der Fußspitzen, nicht nach innen.',
      'Ein echter Stuhl hinter dir gibt Sicherheit – kurz auftippen ist erlaubt.',
      'Den Oberkörper aufrecht lassen, der Blick geht nach vorn.',
    ],
  },
  'vital-calf': {
    steps: [
      'Aufrecht stehen, bei Bedarf an einer Wand oder Stuhllehne festhalten.',
      'Langsam auf die Fußballen hochkommen.',
      'Kurz oben halten und kontrolliert wieder absenken.',
    ],
    tips: [
      'Zur Sicherheit ruhig festhalten – das ist kein Nachteil.',
      'Langsam absenken, nicht einfach fallen lassen.',
      'Gleichmäßig weiteratmen.',
    ],
  },
  'vital-bridge': {
    steps: [
      'In Rückenlage die Knie aufstellen, die Füße hüftbreit am Boden.',
      'Den Po anspannen und das Becken sanft anheben.',
      'Kurz halten, dann langsam wieder ablegen.',
    ],
    tips: [
      'Nur so hoch heben, wie es angenehm ist – kein Hohlkreuz erzwingen.',
      'Die Kraft kommt aus dem Po, nicht aus dem unteren Rücken.',
      'Die Füße bleiben ruhig am Boden, das Gewicht auf den Fersen.',
    ],
  },
  'vital-superman': {
    steps: [
      'In Bauchlage legen, die Arme nach vorn oder neben den Körper.',
      'Arme und Beine nur leicht vom Boden abheben.',
      'Kurz halten und wieder ablegen.',
    ],
    tips: [
      'Eine ganz kleine Bewegung genügt – nicht hochreißen.',
      'Der Blick geht zum Boden, der Nacken bleibt lang.',
      'Bei Beschwerden im unteren Rücken nur die Arme oder nur die Beine heben.',
    ],
  },
  'vital-legraise': {
    steps: [
      'In Rückenlage ein Bein anstellen, das andere strecken (oder beide strecken).',
      'Das gestreckte Bein langsam anheben.',
      'Ebenso langsam wieder absenken.',
    ],
    tips: [
      'Der untere Rücken bleibt flach am Boden – kein Hohlkreuz.',
      'Lieber ein Bein nach dem anderen, wenn beide zu anstrengend sind.',
      'Langsam und kontrolliert bewegen, vor allem beim Absenken.',
    ],
  },
  'vital-crunch': {
    steps: [
      'In Rückenlage die Knie aufstellen, die Füße am Boden.',
      'Die Schulterblätter nur leicht vom Boden lösen.',
      'Kurz halten und langsam zurück.',
    ],
    tips: [
      'Nur ein kleines Stück anheben – das ist kein kompletter Sit-up.',
      'Das Kinn nicht auf die Brust pressen, etwas Abstand lassen.',
      'Der Nacken bleibt locker, die Bewegung kommt aus dem Bauch.',
    ],
  },
  'vital-bend': {
    steps: [
      'Aufrecht stehen, die Füße etwa hüftbreit, die Knie leicht gebeugt.',
      'Den Oberkörper langsam nach vorn sinken lassen – so weit, wie es angenehm ist.',
      'Langsam Wirbel für Wirbel wieder aufrichten.',
    ],
    tips: [
      'Die Knie dürfen leicht gebeugt bleiben – das schont den Rücken.',
      'Nicht wippen oder federn, sanft in die Dehnung gehen.',
      'Bei Schwindel langsamer aufrichten und kurz stehen bleiben.',
    ],
  },
  'vital-twist': {
    steps: [
      'Aufrecht stehen oder sitzen, die Arme locker vor dem Körper.',
      'Den Oberkörper langsam zu einer Seite drehen, die Hüfte bleibt ruhig nach vorn.',
      'Zur Mitte zurück und zur anderen Seite drehen.',
    ],
    tips: [
      'Nur so weit drehen, wie es angenehm ist.',
      'Die Bewegung ist langsam und kontrolliert, nicht schwungvoll.',
      'Aufrecht bleiben und gleichmäßig weiteratmen.',
    ],
  },
  'vital-balance': {
    steps: [
      'Aufrecht stehen, bei Bedarf an einer Wand oder Stuhllehne festhalten.',
      'Ein Knie leicht anheben und das Gleichgewicht auf dem Standbein halten.',
      'Kurz halten, absetzen und die Seite wechseln.',
    ],
    tips: [
      'Ruhig festhalten oder eine Hand in Wandnähe lassen – Sicherheit geht vor.',
      'Einen festen Punkt vor dir mit den Augen fixieren, das hilft beim Balancieren.',
      'Pro Seite gleich lange üben.',
    ],
  },
  'vital-lunge': {
    steps: [
      'Aufrecht stehen, dann einen kleinen Schritt nach vorn machen.',
      'Beide Knie leicht beugen – nur so tief, wie es angenehm ist.',
      'Über das vordere Bein zurück in den Stand und die Seite wechseln.',
    ],
    tips: [
      'Das vordere Knie bleibt über dem Knöchel, nicht weiter nach vorn.',
      'Bei unsicherem Stand seitlich an einer Wand oder Lehne festhalten.',
      'Den Oberkörper aufrecht halten.',
    ],
  },
  'vital-wallsit': {
    steps: [
      'Mit dem Rücken an eine Wand stellen und ein Stück nach unten rutschen.',
      'Nur leicht in die Knie gehen – ein tiefer Winkel ist nicht nötig.',
      'Die Position kurz halten und wieder hochrutschen.',
    ],
    tips: [
      'So weit herunterrutschen, wie es angenehm ist – lieber höher als zu tief.',
      'Der ganze Rücken bleibt an der Wand.',
      'Gleichmäßig weiteratmen, nicht die Luft anhalten.',
    ],
  },
  'vital-plank': {
    steps: [
      'Auf die Unterarme stützen, die Ellbogen unter den Schultern.',
      'Den Körper gerade halten – auch auf den Knien abgestützt möglich.',
      'Die Position kurz halten, dann ablegen.',
    ],
    tips: [
      'Die Knie-Variante ist gelenkschonend und völlig ausreichend.',
      'Po und Bauch leicht anspannen, die Hüfte nicht durchhängen lassen.',
      'Schon wenige Sekunden bringen etwas – lieber kurz und sauber.',
    ],
  },
  'vital-breathe': {
    steps: [
      'Bequem hinsetzen oder hinstellen, die Schultern locker.',
      'Langsam durch die Nase einatmen und die Arme dabei sanft heben.',
      'Ruhig durch den Mund ausatmen und die Arme wieder senken.',
    ],
    tips: [
      'Tief in den Bauch atmen – die Bauchdecke hebt sich.',
      'Länger ausatmen als einatmen, das beruhigt.',
      'Die Augen bei Bedarf schließen und ganz ruhig werden.',
    ],
  },
};
