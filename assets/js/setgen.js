// Automatische Set-Erstellung: aus ein paar Parametern (Intensität, Schwerpunkt
// Kraft/Ausdauer, Körperfokus, gewünschte Dauer) wird ein ausgewogenes,
// abwechslungsreiches Übungsset zusammengestellt – inklusive einer erklärenden
// Beschreibung (wofür, wie es wirkt, warum diese Übungen).
//
// Der Algorithmus arbeitet auf der LIVE-Bibliothek (kann eigene Übungen
// enthalten). Bekannte Standard-Übungen sind über EX_META fein getaggt
// (Muskelgruppen, Typ, Intensität); unbekannte/eigene Übungen werden anhand
// ihres `area`-Felds eingeordnet. Für Varianz sorgt gewichtete Zufallsauswahl –
// gleiche Parameter ergeben bei jedem Aufruf ein anderes Set.

// Muskelgruppen-Vokabular -> Anzeigename
export const GROUP_LABEL = {
  beine: 'Beine', po: 'Po', waden: 'Waden', brust: 'Brust', ruecken: 'Rücken',
  schultern: 'Schultern', arme: 'Arme', bauch: 'Bauch', core: 'Rumpf', cardio: 'Cardio',
  ganzkoerper: 'Ganzkörper',
};

// Körperfokus (Wizard) -> betroffene Muskelgruppen
export const FOCUS_GROUPS = {
  ganzkoerper: ['beine', 'po', 'waden', 'brust', 'ruecken', 'schultern', 'arme', 'bauch', 'core', 'cardio'],
  oberkoerper: ['brust', 'ruecken', 'schultern', 'arme'],
  unterkoerper: ['beine', 'po', 'waden'],
  core: ['bauch', 'core'],
  cardio: ['cardio'],
};
export const FOCUS_LABEL = {
  ganzkoerper: 'Ganzkörper', oberkoerper: 'Oberkörper', unterkoerper: 'Unterkörper',
  core: 'Bauch & Core', cardio: 'Cardio',
};

// area (Bibliotheksfeld) -> Muskelgruppe(n), als Fallback für eigene Übungen.
const AREA_GROUPS = {
  'Ganzkörper': ['ganzkoerper'], 'Brust': ['brust'], 'Beine': ['beine'], 'Bauch': ['bauch'],
  'Core': ['core'], 'Cardio': ['cardio'], 'Rücken': ['ruecken'], 'Trizeps': ['arme'],
  'Po': ['po'], 'Schultern': ['schultern'], 'Waden': ['waden'], 'Arme': ['arme'],
};

// Feine Metadaten der Standard-Übungen.
// type: 'kraft' | 'ausdauer' | 'beides' · intensity: 1 (locker) … 3 (hart)
// impact: 1 = sprunglastig/gelenkbelastend (wird bei „locker“ gemieden)
// equip: true = Geräte/Zirkel-Station (wird bei der Auto-Erstellung ausgelassen)
export const EX_META = {
  burpees:     { groups: ['ganzkoerper', 'cardio', 'brust', 'beine'], type: 'beides', intensity: 3, impact: 1 },
  pushups:     { groups: ['brust', 'arme', 'core'], type: 'kraft', intensity: 2, impact: 0 },
  squats:      { groups: ['beine', 'po'], type: 'kraft', intensity: 1, impact: 0 },
  lunges:      { groups: ['beine', 'po'], type: 'kraft', intensity: 2, impact: 0 },
  situps:      { groups: ['bauch'], type: 'kraft', intensity: 1, impact: 0 },
  climbers:    { groups: ['cardio', 'core', 'schultern'], type: 'ausdauer', intensity: 2, impact: 0 },
  jacks:       { groups: ['cardio'], type: 'ausdauer', intensity: 1, impact: 1 },
  plank:       { groups: ['core', 'bauch'], type: 'kraft', intensity: 1, impact: 0 },
  highknees:   { groups: ['cardio', 'beine'], type: 'ausdauer', intensity: 2, impact: 1 },
  legraises:   { groups: ['bauch', 'core'], type: 'kraft', intensity: 2, impact: 0 },
  superman:    { groups: ['ruecken'], type: 'kraft', intensity: 1, impact: 0 },
  wallsit:     { groups: ['beine'], type: 'kraft', intensity: 2, impact: 0 },
  twists:      { groups: ['bauch', 'core'], type: 'kraft', intensity: 1, impact: 0 },
  diamond:     { groups: ['brust', 'arme'], type: 'kraft', intensity: 2, impact: 0 },
  tricepdips:  { groups: ['arme'], type: 'kraft', intensity: 2, impact: 0 },
  jumpsquats:  { groups: ['beine', 'po', 'cardio'], type: 'beides', intensity: 3, impact: 1 },
  plankjacks:  { groups: ['core', 'cardio'], type: 'ausdauer', intensity: 2, impact: 1 },
  crunches:    { groups: ['bauch'], type: 'kraft', intensity: 1, impact: 0 },
  bridge:      { groups: ['po', 'ruecken'], type: 'kraft', intensity: 1, impact: 0 },
  sideplank:   { groups: ['core', 'bauch'], type: 'kraft', intensity: 2, impact: 0 },
  skater:      { groups: ['beine', 'cardio'], type: 'ausdauer', intensity: 2, impact: 1 },
  pikepushups: { groups: ['schultern', 'arme'], type: 'kraft', intensity: 2, impact: 0 },
  shouldertaps:{ groups: ['schultern', 'core'], type: 'kraft', intensity: 1, impact: 0 },
  calfraises:  { groups: ['waden'], type: 'kraft', intensity: 1, impact: 0 },
  swimmers:    { groups: ['ruecken'], type: 'kraft', intensity: 1, impact: 0 },
  // Zirkel-/Gerätestationen: in der Auto-Erstellung ausgelassen (equip).
  'circ-rope': { groups: ['cardio'], type: 'ausdauer', intensity: 2, impact: 1, equip: true },
  'circ-shuttle': { groups: ['cardio', 'beine'], type: 'ausdauer', intensity: 3, impact: 1, equip: true },
  'circ-scooter': { groups: ['arme', 'ruecken', 'core'], type: 'kraft', intensity: 2, impact: 0, equip: true },
  'circ-ballwall': { groups: ['schultern', 'arme'], type: 'beides', intensity: 2, impact: 0, equip: true },
  'circ-lunge': { groups: ['beine', 'po'], type: 'kraft', intensity: 2, impact: 0, equip: true },
  'circ-rings': { groups: ['ruecken', 'arme'], type: 'kraft', intensity: 3, impact: 0, equip: true },
  'circ-bench': { groups: ['brust', 'arme'], type: 'kraft', intensity: 2, impact: 0, equip: true },
  'circ-wallbars': { groups: ['bauch', 'core'], type: 'kraft', intensity: 2, impact: 0, equip: true },
  'circ-overhead': { groups: ['schultern', 'arme'], type: 'kraft', intensity: 3, impact: 0, equip: true },
  'circ-hipthrust': { groups: ['po', 'beine'], type: 'kraft', intensity: 2, impact: 0, equip: true },
  'circ-boxjump': { groups: ['beine', 'cardio'], type: 'beides', intensity: 3, impact: 1, equip: true },
  'circ-battlerope': { groups: ['arme', 'cardio', 'schultern'], type: 'ausdauer', intensity: 3, impact: 0, equip: true },
  'circ-kettlebell': { groups: ['ganzkoerper', 'po', 'ruecken', 'cardio'], type: 'beides', intensity: 3, impact: 0, equip: true },
  'circ-medball': { groups: ['ganzkoerper', 'cardio', 'core'], type: 'beides', intensity: 3, impact: 1, equip: true },
  'circ-stepups': { groups: ['beine', 'po', 'cardio'], type: 'beides', intensity: 2, impact: 1, equip: true },
};

// ---- kleine Helfer ----
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const uniq = (arr) => [...new Set(arr)];
// Aufzählung: a · „a und b“ · „a, b und c“
function joinList(items) {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]} und ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`;
}

// Eine Übung mit Metadaten anreichern (bekannt via EX_META, sonst aus `area`).
function enrich(ex) {
  const meta = EX_META[ex.id];
  if (meta) return { ...ex, ...meta, groups: meta.groups };
  const groups = AREA_GROUPS[ex.area] || ['ganzkoerper'];
  return { ...ex, groups, type: 'kraft', intensity: 2, impact: 0, equip: false };
}

// Auswahlgewicht je nach Ziel (Kraft/Ausdauer) und Intensitätswunsch.
function weightOf(ex, { goal, intensity }) {
  let w = 1;
  if (goal === 'kraft') w *= { kraft: 1.8, beides: 1.1, ausdauer: 0.5 }[ex.type] ?? 1;
  else if (goal === 'ausdauer') w *= { ausdauer: 1.8, beides: 1.2, kraft: 0.55 }[ex.type] ?? 1;
  if (intensity === 'locker') w *= (4 - ex.intensity);        // bevorzugt leichte Übungen
  else if (intensity === 'intensiv') w *= (ex.intensity + 0.4); // bevorzugt harte Übungen
  return Math.max(0.05, w);
}

// Gewichtete Zufallsauswahl (Roulette) – sorgt für Varianz.
function pick(pool, params) {
  const ws = pool.map((e) => weightOf(e, params));
  let r = Math.random() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

// Reihenfolge: Cardio-Aufwärmen zuerst, harter Ganzkörper-Finisher zuletzt,
// dazwischen so anordnen, dass nicht zweimal dieselbe Hauptmuskelgruppe folgt.
function arrange(chosen, params) {
  const rest = [...chosen];
  let warm = null, fin = null;
  const ci = rest.findIndex((e) => e.groups.includes('cardio'));
  if (ci >= 0 && rest.length > 3) warm = rest.splice(ci, 1)[0];
  if (params.intensity === 'intensiv') {
    const fi = rest.findIndex((e) => e.groups.includes('ganzkoerper') && e.intensity >= 3);
    if (fi >= 0) fin = rest.splice(fi, 1)[0];
  }
  const ordered = [];
  let pool = shuffle(rest);
  while (pool.length) {
    const lastG = ordered.length ? ordered[ordered.length - 1].groups[0] : null;
    let i = pool.findIndex((e) => e.groups[0] !== lastG);
    if (i < 0) i = 0;
    ordered.push(pool.splice(i, 1)[0]);
  }
  return { list: [warm, ...ordered, fin].filter(Boolean), warm, fin };
}

function buildName(params) {
  const goalLabel = { kraft: 'Kraft', ausdauer: 'Ausdauer', mix: 'Kraft & Ausdauer' }[params.goal];
  const focus = params.focus;
  const focusTitle = (!focus.length || focus.includes('ganzkoerper'))
    ? 'Ganzkörper' : focus.map((f) => FOCUS_LABEL[f]).join(' + ');
  let emoji = '💪';
  if (params.goal === 'ausdauer' || (focus.length === 1 && focus[0] === 'cardio')) emoji = '🏃';
  else if (focus.length === 1 && focus[0] === 'unterkoerper') emoji = '🦵';
  else if (focus.length === 1 && focus[0] === 'core') emoji = '🌀';
  return `${emoji} ${focusTitle} · ${goalLabel}`;
}

function buildDesc(params, chosen, warm, fin) {
  const durationMin = params.durationMin;
  const goalLabel = { kraft: 'Kraft', ausdauer: 'Ausdauer', mix: 'Kraft-Ausdauer' }[params.goal];
  const intLabel = { locker: 'lockerer', mittel: 'mittlerer', intensiv: 'hoher' }[params.intensity];
  const focusLabel = (!params.focus.length || params.focus.includes('ganzkoerper'))
    ? 'den ganzen Körper' : joinList(params.focus.map((f) => FOCUS_LABEL[f]));
  const covered = uniq(chosen.flatMap((e) => e.groups))
    .filter((g) => g !== 'ganzkoerper')
    .map((g) => GROUP_LABEL[g]);

  const s1 = `Automatisch zusammengestelltes ${goalLabel}-Workout für ${focusLabel}, ausgelegt auf rund ${durationMin} Minuten bei ${intLabel} Intensität.`;
  const s2 = params.goal === 'kraft'
    ? 'Kräftigende Übungen wechseln gezielt die Muskelgruppe, sodass eine Partie arbeitet, während die zuvor belastete sich erholt – das erlaubt saubere, kraftvolle Wiederholungen.'
    : params.goal === 'ausdauer'
      ? 'Der Schwerpunkt liegt auf Herz-Kreislauf und Durchhaltevermögen: Die Belastung bleibt hoch, die Muskelgruppen wechseln für eine gleichmäßige Auslastung.'
      : 'Kraft- und Ausdauerreize wechseln sich ab, ebenso die Muskelgruppen – so bleibt der Puls oben, ohne dass einzelne Partien zu früh ermüden.';
  let s3 = `Ausgewählt wurden ${chosen.length} Übungen für ${joinList(covered)}`;
  if (warm) s3 += `, zum Aufwärmen ${warm.name}`;
  if (fin) s3 += ` und als Ganzkörper-Finisher ${fin.name}`;
  s3 += '.';
  const s4 = 'Für Abwechslung wird die Auswahl bei jeder Erstellung neu gewürfelt – über „Neu würfeln" bekommst du jederzeit eine frische Variante.';
  return [s1, s2, s3, s4].join(' ');
}

// Hauptfunktion. `library` = aktuelle Übungsliste, `params` siehe oben,
// `cycleSec` = geschätzte Sekunden pro Übung (Pause + Belastung) zur Dauer-
// Abschätzung. Liefert { name, desc, exercises: [id], gen } oder null.
export function generateSet(library, params, cycleSec = 60) {
  const focus = (params.focus && params.focus.length) ? params.focus : ['ganzkoerper'];
  const p = {
    intensity: params.intensity || 'mittel',
    goal: params.goal || 'mix',
    focus,
    durationMin: Math.max(5, Math.round(params.durationMin || 20)),
  };
  const targetGroups = uniq(focus.flatMap((f) => FOCUS_GROUPS[f] || []));

  // Anreichern, Geräte-Stationen raus, nur Übungen mit passender Muskelgruppe.
  let pool = library.map(enrich).filter((e) => !e.equip);
  let candidates = pool.filter((e) => e.groups.some((g) => targetGroups.includes(g)));

  // Intensitäts-Filter (mit Rückfall, falls zu wenig übrig bleibt).
  const byDiff = (list) => {
    if (p.intensity === 'locker') return list.filter((e) => e.impact === 0 && e.intensity <= 2);
    return list; // mittel/intensiv: alles erlaubt, Gewichtung steuert die Tendenz
  };
  let filtered = byDiff(candidates);
  if (filtered.length < 4) filtered = candidates;        // Fokus zu eng -> Filter lockern
  if (filtered.length < 4) filtered = byDiff(pool);      // notfalls ganzer Pool
  if (filtered.length < 1) filtered = pool;
  candidates = filtered;
  if (!candidates.length) return null;

  // Anzahl Übungen aus Wunschdauer ableiten (eine Runde ≈ gewünschte Dauer).
  const want = Math.round((p.durationMin * 60) / Math.max(20, cycleSec));
  const N = Math.max(4, Math.min(want, 18, candidates.length));

  // Auswahl: reihum über die Zielgruppen (gleichmäßige Abdeckung) + Roulette.
  const activeGroups = shuffle(targetGroups.filter((g) => candidates.some((e) => e.groups.includes(g))));
  const chosen = [];
  const used = new Set();
  let gi = 0, guard = 0;
  const maxGuard = N * (activeGroups.length + 1) * 4;
  while (chosen.length < N && used.size < candidates.length && guard++ < maxGuard) {
    const g = activeGroups[gi++ % Math.max(1, activeGroups.length)];
    const groupPool = candidates.filter((e) => !used.has(e.id) && e.groups.includes(g));
    if (!groupPool.length) continue;
    const sel = pick(groupPool, p);
    used.add(sel.id);
    chosen.push(sel);
  }
  // Auffüllen, falls Gruppen erschöpft sind.
  while (chosen.length < N) {
    const remaining = candidates.filter((e) => !used.has(e.id));
    if (!remaining.length) break;
    const sel = pick(remaining, p);
    used.add(sel.id);
    chosen.push(sel);
  }

  const { list, warm, fin } = arrange(chosen, p);
  return {
    name: buildName(p),
    desc: buildDesc(p, list, warm, fin),
    exercises: list.map((e) => e.id),
    gen: p,
  };
}
