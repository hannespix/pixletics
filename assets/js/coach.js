// Coach-Charaktere ("Personas"): je eigene Tonlage (pitch/rate), bevorzugtes
// Geschlecht der Gerätestimme und Spruch-Pools je Trainingsmoment.
// Platzhalter: {ex} = Übungsname, {name} = optionaler Name des Nutzers.
//
// Der „work“-Pool (Spruch beim Start jeder Übung) hat pro Sprecher 20+ Sprüche.
// Über einen Shuffle-Bag (siehe line()) wiederholt sich innerhalb einer Runde
// möglichst wenig.

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
      start:  ['Los geht’s.', 'Training startet.', 'Auf geht’s.'],
      next:   ['Nächste Übung: {ex}', 'Weiter mit {ex}', 'Es folgt: {ex}', 'Gleich: {ex}', 'Jetzt kommt {ex}'],
      again:  ['Nochmal: {ex}', '{ex}, noch ein Satz', '{ex}, weiter'],
      work:   [
        'Los geht’s', 'Start', 'Auf geht’s', 'Und los', 'Jetzt', 'Bereit – los',
        'Konzentriert starten', 'Sauber anfangen', 'Tempo aufnehmen', 'Dranbleiben',
        'Jetzt durchziehen', 'Volle Konzentration', 'Kontrolliert arbeiten',
        'Sauber ausführen', 'Leg los', 'Jetzt geht’s los', 'Fokus, los',
        'Gleichmäßig durchziehen', 'Saubere Technik', 'Volle Aufmerksamkeit',
        'Los, sauber bleiben', 'Konzentriert durchziehen',
      ],
      rest:   ['Pause', 'Kurze Pause', 'Durchatmen'],
      warn15: ['Noch 15 Sekunden', 'Fünfzehn Sekunden'],
      mid:    ['Weiter so', 'Sauber, {name}', 'Dranbleiben', 'Konzentriert bleiben', 'Gleichmäßig weiter'],
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
      start:  ['Aufstellung! Wir legen los!', 'Antreten! Training beginnt!', 'Keine Ausreden – los geht’s!'],
      next:   ['Antreten! Jetzt {ex}!', 'Bewegung! Es folgt {ex}!', 'Aufstellung für {ex}!', 'Bereitmachen für {ex}!'],
      again:  ['Nochmal {ex}! Keine Diskussion!', '{ex}! Und diesmal richtig!'],
      work:   [
        'Bewegung!', 'Los, los, los!', 'Tempo! Keine Pause im Kopf!', 'Anpacken!',
        'Vollgas, Soldat!', 'Keine Ausreden!', 'Zähne zusammen!', 'Durchhalten, marsch!',
        'Schneller!', 'Aufgeben gibt’s nicht!', 'Reiß dich zusammen!', 'Mehr Einsatz!',
        'Bewegt euch!', 'Kein Gejammer!', 'Volle Power, sofort!', 'Durchziehen!',
        'Disziplin, los!', 'Das ist ein Befehl!', 'Nicht nachlassen!',
        'Alles geben, jetzt!', 'Kämpfen!', 'Bis zum Anschlag!',
      ],
      rest:   ['Pause! Aber nicht hinlegen!', 'Durchatmen, Soldat!', 'Kurz Luft holen, dann weiter!'],
      warn15: ['Noch fünfzehn Sekunden! Durchhalten!', 'Fünfzehn! Nicht nachlassen!'],
      mid:    ['Schneller, {name}, nicht einschlafen!', 'Schwäche ist keine Option!', 'Aufgeben gibt’s nicht!', 'Zähne zusammen, {name}!', 'Ich hör dich nicht ächzen!', 'Mehr Tempo!'],
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
      start:  ['Auf geht’s, das wird stark!', 'Los, wir starten – volle Energie!', 'Bereit? Dann geben wir Gas!'],
      next:   ['Jetzt kommt {ex} – du packst das!', 'Auf zu {ex}!', 'Bereit für {ex}? Los!', 'Gleich {ex} – Feuer frei!'],
      again:  ['Noch ein Satz {ex} – volle Power!', '{ex}, einmal noch, du Maschine!'],
      work:   [
        'Auf geht’s, du schaffst das!', 'Power an!', 'Jetzt zeigen, was du draufhast!',
        'Vollgas!', 'Du bist eine Maschine!', 'Gib alles!', 'Jetzt rockst du das!',
        'Energie hoch!', 'Das wird stark!', 'Zeig deine Power!', 'Du packst das!',
        'Lass es krachen!', 'Voller Einsatz, los!', 'Du bist im Flow!',
        'Beweg dich, Champion!', 'Heute ist dein Tag!', 'Stärker als gestern!',
        'Komm, durchstarten!', 'Feuer frei!', 'Geht ab!', 'Jetzt richtig!', 'Hol dir das!',
      ],
      rest:   ['Stark! Kurz erholen.', 'Top gemacht – Pause genießen.', 'Atme tief, gleich geht’s weiter.'],
      warn15: ['Noch 15 Sekunden – Endspurt!', 'Fünfzehn! Da geht noch was!'],
      mid:    ['Auf geht’s, {name}, nicht schlappmachen!', 'Du bist stärker als du denkst!', 'Weiter, {name}, weiter!', 'Genau so, bleib dran!', 'Das sieht klasse aus!', 'Noch mehr Power!'],
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
      start:  ['Na endlich, auf geht’s!', 'Schluss mit Aufwärmen im Kopf – los!', 'Dann zeig mal, was du draufhast!'],
      next:   ['So, jetzt {ex} – kein Drücken!', 'Na los, {ex}. Du wolltest doch fit werden.', 'Jetzt {ex}, der Spaß beginnt.', 'Ab zu {ex}, Sportsfreund.'],
      again:  ['Nochmal {ex}? Jep. Selber schuld.', '{ex}, die Zweite. Genießen!'],
      work:   [
        'Na los, beweg dich!', 'Nicht so zaghaft!', 'Mehr als gucken musst du schon!',
        'Komm, keine Ausreden!', 'Meine Oma macht das schneller!', 'Schwitzt du oder weinst du?',
        'Na, schon müde?', 'Stell dich nicht so an!', 'Ein bisschen mehr Tempo, ja?',
        'Das war jetzt nicht alles, oder?', 'Hey, aufwachen!', 'Bewegung, Faulpelz!',
        'Du wolltest doch fit werden!', 'Jetzt aber zackig!', 'Nicht schummeln!',
        'Geht da noch was? Sicher!', 'Komm, beeindruck mich!', 'Halbe Sachen gibt’s nicht!',
        'Ran an den Speck!', 'Zeig mal Muckis!', 'Auf geht’s, Sportskanone!', 'Nicht einrosten!',
      ],
      rest:   ['Pause. Aber bild dir nichts drauf ein.', 'Verschnauf mal, Champ.', 'Pause – du Glückspilz.'],
      warn15: ['Noch 15 Sekunden, dann darfst du jammern.', 'Fünfzehn Sekunden, halt durch.'],
      mid:    ['Schneller, {name}, nicht einschlafen!', 'Na, schon müde? Stell dich nicht so an!', 'Meine Oma macht das schneller!', 'Komm, {name}, das war nicht alles, oder?', 'Schwitzt du oder weinst du?', 'Mehr Pep!'],
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
      start:  ['Schön, dass du da bist – los geht’s!', 'Wir starten, du schaffst das!', 'Auf geht’s, gemeinsam durch!'],
      next:   ['Weiter geht’s mit {ex}.', 'Jetzt {ex} – du schaffst das!', 'Als Nächstes: {ex}.', 'Gleich {ex}, bereit?'],
      again:  ['Noch ein Satz {ex}, komm!', '{ex}, einmal noch – stark bleiben!'],
      work:   [
        'Komm schon, du packst das!', 'Los geht’s, konzentrier dich!', 'Jetzt mit voller Kraft!',
        'Du machst das super!', 'Bleib dran, das läuft!', 'Sauber und stark!',
        'Du bist stärker als du denkst!', 'Schön gleichmäßig!', 'Weiter so, klasse!',
        'Genau richtig, los!', 'Glaub an dich!', 'Volle Konzentration, los!',
        'Das sieht toll aus!', 'Jeder Schritt zählt!', 'Du wächst gerade!',
        'Stark angefangen!', 'Bleib in deinem Tempo!', 'Atme und zieh durch!',
        'Mega, weiter!', 'Du rockst das!', 'Voller Fokus, los geht’s!', 'Dranbleiben, super!',
      ],
      rest:   ['Super gemacht – kurz erholen.', 'Sauber! Atme durch.', 'Pause, gut gemacht.'],
      warn15: ['Noch 15 Sekunden – dranbleiben!', 'Fünfzehn Sekunden, du machst das toll!'],
      mid:    ['Komm schon, {name}, du packst das!', 'Sauber gemacht, weiter so!', 'Bleib dran, {name}!', 'Sieht richtig gut aus!', 'Noch ein bisschen, du schaffst das!', 'Stark, weiter!'],
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
      start:  ['Wir beginnen. Atme und komm an.', 'Lass uns ruhig starten.', 'Beginnen wir – ganz bei dir.'],
      next:   ['Sanft weiter zu {ex}.', 'Es folgt {ex}. Bleib bei dir.', 'Nun {ex}.', 'Achtsam zu {ex}.'],
      again:  ['Noch einmal {ex}, ganz ruhig.', '{ex}, wiederhole achtsam.'],
      work:   [
        'Beginne, ruhig und kontrolliert.', 'Atme und bewege dich.', 'Finde deinen Rhythmus.',
        'Ganz ruhig starten.', 'Spüre deinen Körper.', 'Bleib bei deinem Atem.',
        'Sanft beginnen.', 'Kraft aus der Ruhe.', 'Achtsam bewegen.', 'Im Gleichmaß bleiben.',
        'Lass es fließen.', 'Konzentriert und gelassen.', 'Eine Bewegung nach der anderen.',
        'Ruhig durchatmen, los.', 'Innere Ruhe, äußere Kraft.', 'Präsent im Moment.',
        'Weich und stark zugleich.', 'Vertraue deinem Tempo.', 'Spür die Energie.',
        'Bleib zentriert.', 'Gelassen durchziehen.', 'Ruhe gibt Kraft.',
      ],
      rest:   ['Pause. Atme tief ein und aus.', 'Ruhe. Spüre deinen Atem.', 'Lass los, kurze Pause.'],
      warn15: ['Noch fünfzehn Sekunden, bleib gelassen.', 'Fünfzehn Sekunden, ruhig weiter.'],
      mid:    ['Bleib im Rhythmus, {name}.', 'Ruhig atmen, weiter.', 'Spür deine Kraft, {name}.', 'Ganz gleichmäßig.', 'Im Fluss bleiben.'],
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

// Shuffle-Bag pro (Persona+Moment): erst wenn alle Sprüche dran waren, wird
// neu gemischt – so wiederholt sich in einer Runde möglichst wenig.
const bags = {};
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickNoRepeat(key, arr) {
  if (arr.length <= 1) return arr[0];
  let bag = bags[key];
  if (!bag || !bag.length) bag = bags[key] = shuffle(arr.map((_, i) => i));
  return arr[bag.pop()];
}

function fillTokens(text, { ex = '', name = '' } = {}) {
  let t = text.replace(/\{ex\}/g, ex);
  if (name) {
    t = t.replace(/\{name\}/g, name);
  } else {
    t = t.replace(/,?\s*\{name\}/g, '');
  }
  return t
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/^[\s,]+/, '')
    .trim();
}

// Liefert einen möglichst wenig wiederholten, fertig befüllten Spruch.
export function line(persona, key, ctx = {}) {
  const pool = persona.lines[key];
  if (!pool || !pool.length) return '';
  return fillTokens(pickNoRepeat(`${persona.id}.${key}`, pool), ctx);
}
