// Coach-Charaktere ("Personas"): jeder hat einen eigenen Tonfall (Stimmlage &
// Tempo als Vorgabe), ein bevorzugtes Geschlecht der Gerätestimme und einen
// Pool an Sprüchen je Trainingsmoment.
// Platzhalter in den Sprüchen:
//   {ex}   -> Name der Übung
//   {name} -> optionaler Name des Nutzers (fällt sauber weg, wenn leer)

export const PERSONAS = [
  {
    id: 'standard',
    name: 'Standard',
    emoji: '🎯',
    desc: 'Neutral & sachlich – die klassische Ansage.',
    gender: 'any',
    pitch: 1.0,
    rate: 1.05,
    lines: {
      next:   ['Nächste Übung: {ex}', 'Weiter mit {ex}', 'Es folgt: {ex}'],
      again:  ['Nochmal: {ex}', '{ex}, noch ein Satz'],
      work:   ['Los geht’s', 'Start', 'Auf geht’s'],
      rest:   ['Pause', 'Kurze Pause', 'Durchatmen'],
      warn15: ['Noch 15 Sekunden', 'Fünfzehn Sekunden'],
      mid:    ['Weiter so', 'Sauber, {name}', 'Dranbleiben'],
      finish: ['Geschafft! Sehr gut gemacht.', 'Fertig. Stark, {name}!'],
    },
  },
  {
    id: 'drill',
    name: 'Drill-Sergeant Stahl',
    emoji: '🪖',
    desc: 'Laut, tief, befehlend. Keine Ausreden!',
    gender: 'male',
    pitch: 0.7,
    rate: 1.18,
    lines: {
      next:   ['Antreten! Jetzt {ex}!', 'Bewegung! Es folgt {ex}!', 'Aufstellung für {ex}!'],
      again:  ['Nochmal {ex}! Keine Diskussion!', '{ex}! Und diesmal richtig!'],
      work:   ['Bewegung!', 'Los, los, los!', 'Tempo! Keine Pause im Kopf!', 'Anpacken!'],
      rest:   ['Pause! Aber nicht hinlegen!', 'Durchatmen, Soldat!', 'Kurz Luft holen, dann weiter!'],
      warn15: ['Noch fünfzehn Sekunden! Durchhalten!', 'Fünfzehn! Nicht nachlassen!'],
      mid:    ['Schneller, {name}, nicht einschlafen!', 'Schwäche ist keine Option!', 'Aufgeben gibt’s nicht!', 'Zähne zusammen, {name}!', 'Ich hör dich nicht ächzen!'],
      finish: ['Mission erfüllt! Wegtreten!', 'Geschafft, Soldat. Respekt!'],
    },
  },
  {
    id: 'hype',
    name: 'Hype-Coach Max',
    emoji: '🚀',
    desc: 'Pusht dich nach vorn – maximale Motivation.',
    gender: 'male',
    pitch: 1.0,
    rate: 1.1,
    lines: {
      next:   ['Jetzt kommt {ex} – du packst das!', 'Auf zu {ex}!', 'Bereit für {ex}? Los!'],
      again:  ['Noch ein Satz {ex} – volle Power!', '{ex}, einmal noch, du Maschine!'],
      work:   ['Auf geht’s, du schaffst das!', 'Power an!', 'Jetzt zeigen, was du draufhast!', 'Vollgas!'],
      rest:   ['Stark! Kurz erholen.', 'Top gemacht – Pause genießen.', 'Atme tief, gleich geht’s weiter.'],
      warn15: ['Noch 15 Sekunden – Endspurt!', 'Fünfzehn! Da geht noch was!'],
      mid:    ['Auf geht’s, {name}, nicht schlappmachen!', 'Du bist stärker als du denkst!', 'Weiter, {name}, weiter!', 'Genau so, bleib dran!', 'Das sieht klasse aus!'],
      finish: ['Geschafft! Riesenleistung, {name}!', 'Stark! Sei stolz auf dich!'],
    },
  },
  {
    id: 'cheeky',
    name: 'Frechdachs Freddy',
    emoji: '😏',
    desc: 'Foppt dich mit frechen Sprüchen.',
    gender: 'male',
    pitch: 1.12,
    rate: 1.06,
    lines: {
      next:   ['So, jetzt {ex} – kein Drücken!', 'Na los, {ex}. Du wolltest doch fit werden.', 'Jetzt {ex}, der Spaß beginnt.'],
      again:  ['Nochmal {ex}? Jep. Selber schuld.', '{ex}, die Zweite. Genießen!'],
      work:   ['Na los, beweg dich!', 'Nicht so zaghaft!', 'Mehr als gucken musst du schon!'],
      rest:   ['Pause. Aber bild dir nichts drauf ein.', 'Verschnauf mal, Champ.', 'Pause – du Glückspilz.'],
      warn15: ['Noch 15 Sekunden, dann darfst du jammern.', 'Fünfzehn Sekunden, halt durch.'],
      mid:    ['Schneller, {name}, nicht einschlafen!', 'Na, schon müde? Stell dich nicht so an!', 'Meine Oma macht das schneller!', 'Komm, {name}, das war jetzt nicht alles, oder?', 'Schwitzt du oder weinst du?'],
      finish: ['Geschafft! Und es lebt noch.', 'Fertig! War doch halb so wild, {name}.'],
    },
  },
  {
    id: 'lena',
    name: 'Coach Lena',
    emoji: '💪',
    desc: 'Weibliche Stimme, motivierend & freundlich.',
    gender: 'female',
    pitch: 1.12,
    rate: 1.05,
    lines: {
      next:   ['Weiter geht’s mit {ex}.', 'Jetzt {ex} – du schaffst das!', 'Als Nächstes: {ex}.'],
      again:  ['Noch ein Satz {ex}, komm!', '{ex}, einmal noch – stark bleiben!'],
      work:   ['Komm schon, du packst das!', 'Los geht’s, konzentrier dich!', 'Jetzt mit voller Kraft!'],
      rest:   ['Super gemacht – kurz erholen.', 'Sauber! Atme durch.', 'Pause, gut gemacht.'],
      warn15: ['Noch 15 Sekunden – dranbleiben!', 'Fünfzehn Sekunden, du machst das toll!'],
      mid:    ['Komm schon, {name}, du packst das!', 'Sauber gemacht, weiter so!', 'Bleib dran, {name}!', 'Sieht richtig gut aus!', 'Noch ein bisschen, du schaffst das!'],
      finish: ['Geschafft! Klasse gemacht, {name}!', 'Fertig – sei stolz auf dich!'],
    },
  },
  {
    id: 'zen',
    name: 'Zen-Meisterin Ruheherz',
    emoji: '🧘',
    desc: 'Ruhig & entspannt, gleichmäßiges Tempo.',
    gender: 'female',
    pitch: 0.96,
    rate: 0.9,
    lines: {
      next:   ['Sanft weiter zu {ex}.', 'Es folgt {ex}. Bleib bei dir.', 'Nun {ex}.'],
      again:  ['Noch einmal {ex}, ganz ruhig.', '{ex}, wiederhole achtsam.'],
      work:   ['Beginne, ruhig und kontrolliert.', 'Atme und bewege dich.', 'Finde deinen Rhythmus.'],
      rest:   ['Pause. Atme tief ein und aus.', 'Ruhe. Spüre deinen Atem.', 'Lass los, kurze Pause.'],
      warn15: ['Noch fünfzehn Sekunden, bleib gelassen.', 'Fünfzehn Sekunden, ruhig weiter.'],
      mid:    ['Bleib im Rhythmus, {name}.', 'Ruhig atmen, weiter.', 'Spür deine Kraft, {name}.', 'Ganz gleichmäßig.'],
      finish: ['Geschafft. Sehr schön, {name}.', 'Fertig. Komm zur Ruhe.'],
    },
  },
];

export function getPersona(id) {
  return PERSONAS.find((p) => p.id === id) || PERSONAS[0];
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTokens(text, { ex = '', name = '' } = {}) {
  let t = text.replace(/\{ex\}/g, ex);
  if (name) {
    t = t.replace(/\{name\}/g, name);
  } else {
    // Namens-Platzhalter samt umgebendem Komma entfernen, z. B.
    // "Bleib dran, {name}!" -> "Bleib dran!"
    t = t.replace(/,?\s*\{name\}/g, '');
  }
  return t
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/^[\s,]+/, '')
    .trim();
}

// Liefert einen zufälligen, fertig befüllten Spruch zum gegebenen Moment.
export function line(persona, key, ctx = {}) {
  const pool = persona.lines[key];
  if (!pool || !pool.length) return '';
  return fillTokens(pick(pool), ctx);
}
