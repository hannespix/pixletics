import { DEFAULT_REPS } from './exercises.js';
import {
  loadSets, saveSets, loadConfig, saveConfig,
  loadExercises, saveExercises, loadStations, saveStations, uid,
  ensureDefaultsSeeded, loadSession, saveSession, clearSession,
} from './store.js';
import {
  initAudio, sound, speak, cancelSpeech, setSpeechHooks,
  primeVoices, onVoicesReady, getGermanVoices, pickVoiceURI, setVoiceSettings,
} from './audio.js';
import { PERSONAS, getPersona, line, motivationLine, resetCoachBags } from './coach.js';
import { buildSchedule, buildIntervalSchedule, WorkoutEngine, PHASE } from './engine.js';
import { generateSet } from './setgen.js';
import { resolveHowto } from './howto.js';
import { Spotify } from './spotify.js';
import { Radio } from './radio.js';
import { encodeShare, decodeShare } from './share.js';
import { GooeyMorph } from './gooey.js';
import { initPWA } from './pwa.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------------- State ----------------
ensureDefaultsSeeded();                   // neue Standard-Inhalte (Zirkel) nachziehen
let exercises = loadExercises();          // editierbare Übungs-Bibliothek
let exerciseMap = {};                      // id -> Übung (zur Laufzeit)
let sets = loadSets();
let stations = loadStations();             // Radio-Sender
let config = loadConfig();
let selectedSetIds = []; // Reihenfolge = Abspielreihenfolge
let editorSetId = null;
let editorExId = null;   // gerade bearbeitete Übung (null = neue)
let editorStationId = null; // gerade bearbeiteter Sender (null = neuer)
let lastStationId = null;   // zuletzt gestarteter Sender (für Runner-Toggle)
let workoutActiveRest = false; // aktuelles Workout nutzt Aktivpause (ab 2. Runde)
let runnerCurrentExId = null;  // aktuell im Runner angezeigte Übung (für die Anleitung)
const spotify = new Spotify();
const radio = new Radio();
const engine = new WorkoutEngine();
let wakeLock = null;

function rebuildExerciseMap() {
  exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]));
}
rebuildExerciseMap();

// ---------------- Tabs ----------------
$$('#tabs .tab').forEach((tab) => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});
function switchView(view) {
  $$('#tabs .tab').forEach((t) => t.classList.toggle('active', t.dataset.view === view));
  $$('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${view}`));
  closeNavMenu();
}

// Hamburger-Navigation (kleine Screens): Tabs als ausklappbares Menü.
const navToggleBtn = $('#btn-nav');
const tabsNav = $('#tabs');
function closeNavMenu() {
  if (!tabsNav) return;
  tabsNav.classList.remove('open');
  navToggleBtn?.setAttribute('aria-expanded', 'false');
}
navToggleBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const open = tabsNav.classList.toggle('open');
  navToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});
document.addEventListener('click', (e) => {
  if (!tabsNav?.classList.contains('open')) return;
  if (!tabsNav.contains(e.target) && e.target !== navToggleBtn) closeNavMenu();
});

// ================ TRAINING VIEW ================
// Label-Maps für die Auto-Set-Metadaten (vgl. setgen.js).
const INTENSITY_LABEL = { locker: 'Locker', mittel: 'Mittel', intensiv: 'Intensiv' };
const FOCUS_LABEL = {
  ganzkoerper: 'Ganzkörper', oberkoerper: 'Oberkörper',
  unterkoerper: 'Unterkörper', core: 'Core', cardio: 'Cardio',
};
// Geschätzte Dauer eines Sets in Minuten (Übungszahl × Zyklus aus Übung+Pause).
function setEstMinutes(set) {
  const cycle = (config.workSeconds || 30) + (config.pauseSeconds || 30);
  return Math.max(1, Math.round((set.exercises.length * cycle) / 60));
}
// Emoji-Badge: erstes vorhandenes Übungs-Emoji des Sets, sonst Default.
function setEmoji(set) {
  for (const id of set.exercises) { const ex = exerciseMap[id]; if (ex && ex.emoji) return ex.emoji; }
  return '🏋️';
}

let pickerIntroDone = false; // gestaffelter Einzug nur beim ersten Render

function renderPicker(highlightId) {
  const host = $('#set-picker');
  host.innerHTML = '';
  if (!sets.length) {
    host.innerHTML = '<p class="muted">Noch keine Sets. Lege im Tab „Übungssets“ welche an.</p>';
    host.classList.remove('intro');
    return;
  }
  sets.forEach((set) => {
    const order = selectedSetIds.indexOf(set.id);
    const selected = order !== -1;
    const item = document.createElement('div');
    item.className = 'picker-item' + (selected ? ' selected' : '');
    if (highlightId && set.id === highlightId && selected) item.classList.add('just-picked');
    const est = setEstMinutes(set);
    const focusTags = ((set.gen && set.gen.focus) || []).map((f) => FOCUS_LABEL[f]).filter(Boolean);
    const intensity = set.gen ? INTENSITY_LABEL[set.gen.intensity] : '';
    const chips = [
      intensity ? `<span class="pi-chip">${escapeHtml(intensity)}</span>` : '',
      ...focusTags.map((t) => `<span class="pi-chip">${escapeHtml(t)}</span>`),
    ].join('');
    item.innerHTML = `
      <div class="pi-icon">${escapeHtml(setEmoji(set))}</div>
      <div class="pi-body">
        <div class="pi-name">${escapeHtml(set.name)}</div>
        <div class="pi-sub">${set.exercises.length} Übungen · ≈ ${est} Min</div>
        ${chips ? `<div class="pi-chips">${chips}</div>` : ''}
      </div>
      <div class="pi-state">
        ${selected ? `<div class="order-badge">#${order + 1}</div>` : ''}
        <div class="pi-check">${selected ? '✓' : ''}</div>
      </div>`;
    item.addEventListener('click', () => {
      const idx = selectedSetIds.indexOf(set.id);
      if (idx === -1) selectedSetIds.push(set.id);
      else selectedSetIds.splice(idx, 1);
      renderPicker(set.id);
      updatePlanSummary();
    });
    host.appendChild(item);
  });
  // Einzugs-Animation nur einmalig (sonst flackert sie bei jedem Toggle).
  if (!pickerIntroDone) { host.classList.add('intro'); pickerIntroDone = true; }
  else host.classList.remove('intro');
}

function bindConfig() {
  const map = {
    'cfg-work': 'workSeconds',
    'cfg-pause': 'pauseSeconds',
    'cfg-total': 'totalMinutes',
  };
  for (const [id, key] of Object.entries(map)) {
    const inp = $('#' + id);
    inp.value = config[key];
    inp.addEventListener('change', () => {
      const v = Math.max(Number(inp.min), Math.min(Number(inp.max), Number(inp.value) || 0));
      inp.value = v;
      config[key] = v;
      saveConfig(config);
      updatePlanSummary();
    });
  }
  const toggles = { 'cfg-voice': 'voice', 'cfg-beeps': 'beeps', 'cfg-duck': 'duckSpotify' };
  for (const [id, key] of Object.entries(toggles)) {
    const inp = $('#' + id);
    inp.checked = config[key];
    inp.addEventListener('change', () => {
      config[key] = inp.checked;
      saveConfig(config);
    });
  }
}

// ================ STIMME & COACH ================
function currentPersona() {
  return getPersona(config.voicePersona);
}

// Ansage-Umfang. Stufen: 'full' (Sprüche + Übungsnamen), 'phrases' (Sprüche,
// aber OHNE Übungsnamen – z. B. Zirkel mit verschiedenen Übungen je Person),
// 'concise' (knapp: Namen + Status, keine Sprüche), 'minimal' (nur Countdown).
// Der Standard-Coach ist bewusst sprüche-frei → 'full' wird zu 'concise'.
function verbosityLevel() {
  let v = config.verbosity || 'full';
  if (config.voicePersona === 'standard' && v === 'full') v = 'concise';
  return v;
}
// names = Übungsnamen ansagen; phrases = Coach-Sprüche/Kommentare ansagen.
// Motivations-/Kommentar-Sprüche lassen sich separat ganz abschalten
// (config.coachComments) – dann kommen nur die wichtigen Ansagen (Namen,
// Countdown, Status), ohne Sticheleien.
function announceFlags() {
  const v = verbosityLevel();
  const commentsOn = config.coachComments !== false;
  return {
    v,
    names: v === 'full' || v === 'concise',
    phrases: (v === 'full' || v === 'phrases') && commentsOn,
  };
}

// Sanfte Grenzen für Stimmlage/Tempo – zu tiefe/hohe oder zu schnelle/langsame
// Werte klingen über die Web-Speech-API schnell roboterhaft. MÜSSEN mit den
// Slider-Grenzen in index.html übereinstimmen.
const PITCH_MIN = 0.8, PITCH_MAX = 1.2;
const RATE_MIN = 0.85, RATE_MAX = 1.25;
const clampRange = (v, lo, hi, dflt) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : dflt;
};

// Gespeicherte Werte einmalig in den erlaubten Bereich ziehen (z. B. alte,
// extreme Persona-Vorgaben), damit Regler, Anzeige und Ausgabe übereinstimmen.
function normalizeVoiceRanges() {
  const pitch = clampRange(config.voicePitch, PITCH_MIN, PITCH_MAX, 1.0);
  const rate = clampRange(config.voiceRate, RATE_MIN, RATE_MAX, 1.05);
  if (pitch !== config.voicePitch || rate !== config.voiceRate) {
    config.voicePitch = pitch;
    config.voiceRate = rate;
    saveConfig(config);
  }
}

// Aktuelle Stimm-Einstellungen an die Audio-Schicht übergeben.
function applyVoiceSettings() {
  const persona = currentPersona();
  let voiceURI = config.voiceURI;
  if (!voiceURI || voiceURI === 'auto') voiceURI = pickVoiceURI(persona.gender);
  const pitch = clampRange(config.voicePitch, PITCH_MIN, PITCH_MAX, 1.0);
  const rate = clampRange(config.voiceRate, RATE_MIN, RATE_MAX, 1.05);
  setVoiceSettings({ voiceURI, pitch, rate, volume: config.voiceVolume });
}

// Musik-Lautstärke (Radio + Spotify) anwenden.
function applyMusicVolume() {
  const v = typeof config.musicVolume === 'number' ? config.musicVolume : 0.8;
  radio.setVolume(v);
  spotify.setVolume?.(v);
}

function renderVoiceSettings() {
  const host = $('#persona-list');
  if (!host) return;
  // Charakter-Kacheln
  host.innerHTML = '';
  PERSONAS.forEach((p) => {
    const sel = p.id === config.voicePersona;
    const item = document.createElement('div');
    item.className = 'persona-item' + (sel ? ' selected' : '');
    item.innerHTML = `
      <span class="persona-emoji">${p.emoji}</span>
      <span class="persona-body">
        <span class="persona-name">${escapeHtml(p.name)}</span>
        <span class="persona-desc">${escapeHtml(p.desc)}</span>
      </span>
      <span class="persona-check">${sel ? '✓' : ''}</span>`;
    item.addEventListener('click', () => selectPersona(p.id));
    host.appendChild(item);
  });

  // Gerätestimmen-Auswahl: kuratierte Kurzliste statt aller Systemstimmen –
  // bis zu 2 weibliche + 2 männliche (beste Qualität zuerst), klar gekennzeichnet.
  const sel = $('#cfg-voiceuri');
  if (sel) {
    const list = getGermanVoices(); // präzise deutsche Stimmen, beste zuerst
    const females = list.filter((v) => v.gender === 'female').slice(0, 2);
    const males = list.filter((v) => v.gender === 'male').slice(0, 2);
    const picked = [...females, ...males];
    // Falls zu wenige eindeutig geschlechtliche Stimmen: mit übrigen auffüllen.
    for (const v of list) {
      if (picked.length >= 4) break;
      if (!picked.includes(v)) picked.push(v);
    }
    // Gespeicherte Stimme sicher anzeigen, auch wenn nicht in der Kurzliste.
    if (config.voiceURI && config.voiceURI !== 'auto' && !picked.some((v) => v.voiceURI === config.voiceURI)) {
      const cur = list.find((v) => v.voiceURI === config.voiceURI);
      if (cur) picked.push(cur);
    }
    const label = (v) => {
      const g = v.gender === 'female' ? ' ♀' : v.gender === 'male' ? ' ♂' : '';
      const star = v.quality >= 4 ? ' ⭐' : ''; // hochwertige (neuronale/Cloud-)Stimme
      return `${escapeHtml(v.name)}${g}${star}`;
    };
    const opts = ['<option value="auto">Automatisch (beste deutsche Stimme)</option>'];
    picked.forEach((v) => opts.push(`<option value="${escapeHtml(v.voiceURI)}">${label(v)}</option>`));
    sel.innerHTML = opts.join('');
    const wanted = config.voiceURI || 'auto';
    sel.value = wanted;
    if (sel.value !== wanted) sel.value = 'auto'; // gespeicherte Stimme nicht (mehr) vorhanden
  }

  // Felder & Schieberegler
  if ($('#cfg-coachname')) $('#cfg-coachname').value = config.coachName || '';
  if ($('#cfg-verbosity')) $('#cfg-verbosity').value = config.verbosity || 'full';
  if ($('#cfg-comments')) $('#cfg-comments').checked = config.coachComments !== false;
  setSlider('cfg-voicevol', 'val-voicevol', Math.round((config.voiceVolume ?? 1) * 100), (v) => Math.round(v) + ' %');
  setSlider('cfg-pitch', 'val-pitch', config.voicePitch, (v) => v.toFixed(2));
  setSlider('cfg-rate', 'val-rate', config.voiceRate, (v) => v.toFixed(2) + '×');
  updateVoiceCurrentLabel();
}

function setSlider(inputId, valId, value, fmt) {
  const inp = $('#' + inputId);
  if (!inp) return;
  inp.value = value;
  const lab = $('#' + valId);
  if (lab) lab.textContent = fmt(Number(value));
}

function updateVoiceCurrentLabel() {
  const el = $('#voice-current');
  if (!el) return;
  const p = currentPersona();
  el.textContent = `${p.emoji} ${p.name}`;
}

function selectPersona(id) {
  const p = getPersona(id);
  config.voicePersona = id;
  // Charakter-Vorgaben für Stimmlage/Tempo übernehmen (lassen sich danach
  // mit den Reglern feinjustieren).
  config.voicePitch = p.pitch;
  config.voiceRate = p.rate;
  saveConfig(config);
  applyVoiceSettings();
  renderVoiceSettings();
}

function bindVoiceSettings() {
  normalizeVoiceRanges(); // alte/extreme Werte in den sanften Bereich ziehen
  $('#cfg-coachname')?.addEventListener('input', (e) => {
    config.coachName = e.target.value.trim().slice(0, 20);
    saveConfig(config);
  });
  $('#cfg-voiceuri')?.addEventListener('change', (e) => {
    config.voiceURI = e.target.value;
    saveConfig(config);
    applyVoiceSettings();
  });
  $('#cfg-verbosity')?.addEventListener('change', (e) => {
    config.verbosity = e.target.value;
    saveConfig(config);
  });
  $('#cfg-comments')?.addEventListener('change', (e) => {
    config.coachComments = e.target.checked;
    saveConfig(config);
  });
  const bindRange = (id, key, valId, fmt, apply) => {
    const inp = $('#' + id);
    if (!inp) return;
    inp.addEventListener('input', () => {
      const v = Number(inp.value);
      config[key] = v;
      const lab = $('#' + valId);
      if (lab) lab.textContent = fmt(v);
      saveConfig(config);
      if (apply) applyVoiceSettings();
    });
  };
  // Coach-Lautstärke (0–100 % im Slider, gespeichert als 0–1).
  $('#cfg-voicevol')?.addEventListener('input', () => {
    const pct = Number($('#cfg-voicevol').value);
    config.voiceVolume = Math.max(0, Math.min(1, pct / 100));
    const lab = $('#val-voicevol');
    if (lab) lab.textContent = Math.round(pct) + ' %';
    saveConfig(config);
    applyVoiceSettings();
  });
  bindRange('cfg-pitch', 'voicePitch', 'val-pitch', (v) => v.toFixed(2), true);
  bindRange('cfg-rate', 'voiceRate', 'val-rate', (v) => v.toFixed(2) + '×', true);
  $('#btn-voice-test')?.addEventListener('click', testVoice);
}

function testVoice() {
  initAudio();
  applyVoiceSettings();
  const p = currentPersona();
  const name = config.coachName;
  const sample = `Kniebeugen! ${motivationLine(p, { name })}`;
  speak(sample.trim(), { interrupt: true });
}

// Wiederholungen einer Übung IN EINEM SET: set-spezifischer Wert, sonst der
// Standardwert der Übung. So kann dieselbe Übung je Set unterschiedlich oft laufen.
function setReps(set, exId) {
  const v = set?.reps?.[exId];
  if (Number.isFinite(v) && v > 0) return v;
  return exerciseMap[exId]?.reps || DEFAULT_REPS;
}

// Für den Ablaufplan: nur existierende Übungen mit ihrer (set-spezifischen)
// Wiederholungszahl – Reihenfolge wie in den gewählten Sets.
function selectedExercises() {
  const out = [];
  for (const setId of selectedSetIds) {
    const set = sets.find((s) => s.id === setId);
    if (!set) continue;
    for (const exId of set.exercises) {
      if (!exerciseMap[exId]) continue;
      out.push({ exId, reps: setReps(set, exId) });
    }
  }
  return out;
}

// Kennzahlen im Hero-Block (Anzahl Sets/Übungen, geplante Minuten).
function updateHeroStats() {
  const setsEl = $('#hero-sets');
  if (!setsEl) return;
  setsEl.textContent = sets.length;
  $('#hero-ex').textContent = exercises.length;
  $('#hero-min').textContent = config.totalMinutes;
}

function updatePlanSummary() {
  updateHeroStats();
  const el = $('#plan-summary');
  const startBtn = $('#btn-start');
  const has = selectedExercises().length > 0;
  if (startBtn) startBtn.disabled = !has; // Leerzustand: kein Set gewählt
  if (!el) return;
  if (!has) { el.hidden = true; el.textContent = ''; return; }
  const cycle = config.pauseSeconds + config.workSeconds;
  const rounds = Math.max(1, Math.floor((config.totalMinutes * 60) / cycle));
  el.hidden = false;
  el.textContent = `≈ ${config.totalMinutes} Min · ${rounds} Runden`;
}

// ================ INTERVALL-TIMER (reiner Timer ohne Übungen) ================
const INTERVAL_PRESETS = {
  tabata: { unit: 'Intervall', work: 20, rest: 10, rounds: 8, showWorkRest: true, minutesField: false,
            desc: '20 s Belastung · 10 s Pause · 8 Runden (≈ 4 min).' },
  emom:   { unit: 'Minute', work: 60, rest: 0, rounds: 10, showWorkRest: false, minutesField: true,
            desc: 'Jede Minute startet ein Intervall – der Rest der Minute ist Pause.' },
  amrap:  { unit: 'AMRAP', work: 600, rest: 0, rounds: 10, showWorkRest: false, minutesField: true,
            desc: 'Ein durchgehender Timer – so viele Runden wie möglich.' },
  free:   { unit: 'Intervall', work: 40, rest: 20, rounds: 8, showWorkRest: true, minutesField: false,
            desc: 'Eigene Werte: Belastung, Pause und Runden frei wählbar.' },
};

function currentIntervalMode() {
  return (config.interval && config.interval.mode) || 'tabata';
}

// Liest die sichtbaren Felder + den Modus und liefert Engine-Parameter.
// Bei EMOM/AMRAP steht im „Runden“-Feld die Minutenzahl.
function intervalParams() {
  const mode = currentIntervalMode();
  const p = INTERVAL_PRESETS[mode] || INTERVAL_PRESETS.tabata;
  const work = Math.max(1, Number($('#iv-work').value) || p.work);
  const rest = Math.max(0, Number($('#iv-rest').value) || 0);
  const f3 = Math.max(1, Number($('#iv-rounds').value) || p.rounds);
  if (mode === 'amrap') return { work: f3 * 60, rest: 0, rounds: 1, unit: 'AMRAP' };
  if (mode === 'emom') return { work: 60, rest: 0, rounds: f3, unit: 'Minute' };
  return { work, rest, rounds: f3, unit: 'Intervall' };
}

function updateIntervalSummary() {
  const mode = currentIntervalMode();
  const { work, rest, rounds } = intervalParams();
  let txt;
  if (mode === 'amrap') txt = `AMRAP · ${fmtTime(work * 1000)}`;
  else if (mode === 'emom') txt = `EMOM · ${rounds} Min`;
  else txt = `${rounds}× ${work}/${rest}s · ${fmtTime((work + rest) * rounds * 1000)}`;
  const el = $('#interval-summary');
  if (el) el.textContent = txt;
}

function saveIntervalConfig(mode = currentIntervalMode()) {
  config.interval = {
    mode,
    work: Number($('#iv-work').value),
    rest: Number($('#iv-rest').value),
    rounds: Number($('#iv-rounds').value),
  };
  saveConfig(config);
}

// Setzt Chips, Beschriftung, Feld-Sichtbarkeit und Werte für einen Preset.
function applyIntervalPreset(mode, useSaved = false) {
  const p = INTERVAL_PRESETS[mode] || INTERVAL_PRESETS.tabata;
  $$('#preset-chips .chip').forEach((c) => c.classList.toggle('active', c.dataset.preset === mode));
  $('#preset-desc').textContent = p.desc;
  $('#iv-work-wrap').hidden = !p.showWorkRest;
  $('#iv-rest-wrap').hidden = !p.showWorkRest;
  $('#iv-rounds-label').textContent = p.minutesField ? 'Minuten' : 'Runden';
  const saved = config.interval || {};
  if (useSaved && saved.mode === mode) {
    $('#iv-work').value = saved.work ?? p.work;
    $('#iv-rest').value = saved.rest ?? p.rest;
    $('#iv-rounds').value = saved.rounds ?? p.rounds;
  } else {
    $('#iv-work').value = p.work;
    $('#iv-rest').value = p.rest;
    $('#iv-rounds').value = p.rounds;
  }
  saveIntervalConfig(mode);
  updateIntervalSummary();
}

function bindIntervalUI() {
  $$('#preset-chips .chip').forEach((chip) => {
    chip.addEventListener('click', () => applyIntervalPreset(chip.dataset.preset));
  });
  ['#iv-work', '#iv-rest', '#iv-rounds'].forEach((sel) => {
    const inp = $(sel);
    inp.addEventListener('change', () => {
      const v = Math.max(Number(inp.min), Math.min(Number(inp.max), Number(inp.value) || 0));
      inp.value = v;
      saveIntervalConfig();
      updateIntervalSummary();
    });
  });
  $('#btn-interval-start').addEventListener('click', startInterval);
  applyIntervalPreset(currentIntervalMode(), true);
}

function startInterval() {
  initAudio();
  resetCoachBags(); // frische Spruch-Mischung pro Workout
  saveIntervalConfig();
  const { work, rest, rounds, unit } = intervalParams();
  workoutActiveRest = false;
  clearSession(); updateResumeButton(); // neues Workout ersetzt einen gespeicherten Stand
  const steps = buildIntervalSchedule({ work, rest, rounds, unit });
  armRunner(steps);
}

// ================ SETS VIEW ================
function renderSetsList() {
  const host = $('#sets-list');
  host.innerHTML = '';
  if (!sets.length) {
    host.innerHTML = '<p class="muted">Noch keine Sets vorhanden.</p>';
    return;
  }
  sets.forEach((set) => {
    const row = document.createElement('div');
    row.className = 'set-row';
    row.innerHTML = `
      <div>
        <div class="sr-name">${escapeHtml(set.name)}</div>
        ${set.desc ? `<div class="sr-desc">${escapeHtml(set.desc)}</div>` : ''}
        <div class="sr-sub">${set.exercises.length} Übungen · ${set.exercises.map((id) => exerciseMap[id]?.name).filter(Boolean).join(', ') || '—'}</div>
      </div>
      <span class="icon-btn">✎</span>`;
    row.addEventListener('click', () => openEditor(set.id));
    host.appendChild(row);
  });
}

$('#btn-new-set').addEventListener('click', () => {
  const set = { id: uid(), name: 'Neues Set', exercises: [] };
  sets.push(set);
  saveSets(sets);
  openEditor(set.id);
});

// ================ AUTO-SET-ASSISTENT ================
// Sammelt Parameter und erzeugt per Algorithmus ein ausgewogenes Set.
let wizardParams = { intensity: 'mittel', goal: 'mix', focus: ['ganzkoerper'], durationMin: 20 };

// Eine Segment-Gruppe (Einfachauswahl) verdrahten.
function setupSegGroup(sel, onChange) {
  const group = $(sel);
  if (!group) return;
  group.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-v]');
    if (!btn) return;
    group.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === btn));
    onChange(btn.dataset.v);
  });
}
setupSegGroup('#wiz-intensity', (v) => { wizardParams.intensity = v; });
setupSegGroup('#wiz-goal', (v) => { wizardParams.goal = v; });

// Körperfokus: Mehrfachauswahl, „Ganzkörper" ist exklusiv.
$('#wiz-focus').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-v]');
  if (!btn) return;
  const v = btn.dataset.v;
  let focus = wizardParams.focus.slice();
  if (v === 'ganzkoerper') {
    focus = ['ganzkoerper'];
  } else {
    focus = focus.filter((f) => f !== 'ganzkoerper');
    focus = focus.includes(v) ? focus.filter((f) => f !== v) : [...focus, v];
    if (!focus.length) focus = ['ganzkoerper'];
  }
  wizardParams.focus = focus;
  $('#wiz-focus').querySelectorAll('button').forEach((b) => b.classList.toggle('on', focus.includes(b.dataset.v)));
});

$('#wiz-duration').addEventListener('input', (e) => {
  wizardParams.durationMin = Number(e.target.value);
  $('#wiz-duration-val').textContent = e.target.value;
});

// Sekunden pro Übung (Pause + Belastung) zur Dauer-Abschätzung.
function cycleSeconds() {
  return Math.max(20, (config.pauseSeconds || 30) + (config.workSeconds || 30));
}

$('#btn-auto-set').addEventListener('click', () => { $('#set-wizard').hidden = false; });
$('#btn-close-wizard').addEventListener('click', () => { $('#set-wizard').hidden = true; });

$('#btn-generate-set').addEventListener('click', () => {
  const res = generateSet(exercises, wizardParams, cycleSeconds());
  if (!res || !res.exercises.length) {
    alert('Mit diesem Fokus stehen zu wenige Übungen zur Verfügung. Wähle einen breiteren Körperfokus.');
    return;
  }
  const set = { id: uid(), name: res.name, desc: res.desc, exercises: res.exercises, gen: res.gen };
  sets.push(set);
  saveSets(sets);
  $('#set-wizard').hidden = true;
  openEditor(set.id);
});

// ================ SET EDITOR ================
function openEditor(setId) {
  editorSetId = setId;
  const set = sets.find((s) => s.id === setId);
  if (!set) return;
  $('#editor-name').value = set.name;
  $('#editor-desc').value = set.desc || '';
  $('#btn-regenerate-set').hidden = !set.gen; // nur bei auto-erstellten Sets
  renderEditor();
  $('#set-editor').hidden = false;
}

function currentSet() {
  return sets.find((s) => s.id === editorSetId);
}

function renderEditor() {
  const set = currentSet();
  if (!set) return;
  $('#chosen-count').textContent = `(${set.exercises.length})`;

  // Gewählte Übungen (sortierbar)
  const chosen = $('#chosen-list');
  chosen.innerHTML = '';
  set.exercises.forEach((exId) => {
    const ex = exerciseMap[exId];
    if (!ex) return;
    const li = document.createElement('li');
    li.className = 'ex-item';
    li.dataset.id = exId;
    li.innerHTML = `
      <span class="handle" title="Ziehen zum Sortieren">⠿</span>
      <span class="emoji">${escapeHtml(ex.emoji)}</span>
      <span class="ex-name">${escapeHtml(ex.name)}<div class="ex-area">${escapeHtml(ex.area)}</div></span>
      <span class="reps-step" title="Wiederholungen in diesem Set">
        <button type="button" class="reps-btn" data-d="-1" aria-label="weniger Wiederholungen">−</button>
        <span class="reps-val">×${setReps(set, exId)}</span>
        <button type="button" class="reps-btn" data-d="1" aria-label="mehr Wiederholungen">+</button>
      </span>
      <button class="rm" title="Entfernen">✕</button>`;
    const valEl = li.querySelector('.reps-val');
    li.querySelectorAll('.reps-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = Math.max(1, Math.min(12, setReps(set, exId) + Number(btn.dataset.d)));
        if (!set.reps) set.reps = {};
        set.reps[exId] = next;
        valEl.textContent = '×' + next;
        saveSets(sets);
      });
    });
    li.querySelector('.rm').addEventListener('click', () => {
      set.exercises = set.exercises.filter((id) => id !== exId);
      if (set.reps) delete set.reps[exId];
      saveSets(sets);
      renderEditor();
    });
    chosen.appendChild(li);
  });

  // Bibliothek
  const lib = $('#library-list');
  lib.innerHTML = '';
  exercises.forEach((ex) => {
    const inSet = set.exercises.includes(ex.id);
    const li = document.createElement('li');
    li.className = 'ex-item' + (inSet ? ' in-set' : '');
    li.innerHTML = `
      <span class="emoji">${escapeHtml(ex.emoji)}</span>
      <span class="ex-name">${escapeHtml(ex.name)}<div class="ex-area">${escapeHtml(ex.area)}</div></span>
      <span class="lib-check">${inSet ? '✓' : '＋'}</span>`;
    li.addEventListener('click', () => {
      if (set.exercises.includes(ex.id)) set.exercises = set.exercises.filter((id) => id !== ex.id);
      else set.exercises.push(ex.id);
      saveSets(sets);
      renderEditor();
    });
    lib.appendChild(li);
  });
}

// ================ ÜBUNGEN (Bibliothek bearbeiten) ================
function renderExercisesList() {
  const host = $('#exercises-list');
  if (!host) return;
  host.innerHTML = '';
  if (!exercises.length) {
    host.innerHTML = '<p class="muted">Noch keine Übungen. Lege mit „+ Neue Übung“ welche an.</p>';
    return;
  }
  exercises.forEach((ex) => {
    const row = document.createElement('div');
    row.className = 'set-row';
    row.innerHTML = `
      <div class="ex-row-main">
        <span class="emoji">${escapeHtml(ex.emoji || '🏋️')}</span>
        <div>
          <div class="sr-name">${escapeHtml(ex.name)}</div>
          <div class="sr-sub">${escapeHtml(ex.area || '')}${ex.cue ? ' · ' + escapeHtml(ex.cue) : ''}</div>
        </div>
      </div>
      <div class="ex-row-end">
        <span class="reps-badge" title="Wiederholungen">×${ex.reps || DEFAULT_REPS}</span>
        <span class="icon-btn">✎</span>
      </div>`;
    row.addEventListener('click', () => openExEditor(ex.id));
    host.appendChild(row);
  });
}

function openExEditor(exId) {
  editorExId = exId;
  const ex = exId ? exerciseMap[exId] : null;
  $('#ex-editor-title').textContent = ex ? 'Übung bearbeiten' : 'Neue Übung';
  $('#ex-emoji').value = ex?.emoji || '';
  $('#ex-name').value = ex?.name || '';
  $('#ex-area').value = ex?.area || '';
  $('#ex-cue').value = ex?.cue || '';
  $('#ex-reps').value = ex?.reps || DEFAULT_REPS;
  // Editierbare Anleitung vorbefüllen: eigene Werte oder kuratierte Vorlage.
  const h = resolveHowto(ex) || { steps: [], tips: [] };
  $('#ex-steps').value = (h.steps || []).join('\n');
  $('#ex-tips').value = (h.tips || []).join('\n');
  // Anleitung standardmäßig nur ANZEIGEN; Bearbeiten erst auf Knopfdruck.
  const viewHtml = howtoHtml(exId);
  const view = $('#ex-howto-view');
  view.innerHTML = viewHtml || '<p class="muted small">Noch keine Anleitung hinterlegt.</p>';
  view.hidden = false;
  $('#ex-howto-edit').hidden = true;
  const editBtn = $('#btn-edit-howto');
  editBtn.hidden = false;
  editBtn.textContent = viewHtml ? '✏️ Anleitung bearbeiten' : '＋ Anleitung hinzufügen';
  $('#btn-delete-ex').style.visibility = ex ? 'visible' : 'hidden';
  $('#exercise-editor').hidden = false;
}

function closeExEditor() {
  $('#exercise-editor').hidden = true;
  editorExId = null;
}

function saveExEditor() {
  const name = $('#ex-name').value.trim();
  if (!name) {
    alert('Bitte einen Namen für die Übung eingeben.');
    return;
  }
  const reps = Math.max(1, Math.min(6, Number($('#ex-reps').value) || DEFAULT_REPS));
  // Anleitung: je eine Anweisung/ein Hinweis pro Zeile.
  const parseLines = (v) => v.split('\n').map((s) => s.trim()).filter(Boolean);
  const data = {
    name,
    area: $('#ex-area').value.trim(),
    emoji: $('#ex-emoji').value.trim() || '🏋️',
    cue: $('#ex-cue').value.trim(),
    reps,
    steps: parseLines($('#ex-steps').value),
    tips: parseLines($('#ex-tips').value),
  };
  if (editorExId) {
    const ex = exerciseMap[editorExId];
    if (ex) Object.assign(ex, data);
  } else {
    exercises.push({ id: uid('ex'), ...data });
  }
  saveExercises(exercises);
  rebuildExerciseMap();
  closeExEditor();
  refreshExerciseDependents();
}

function deleteExEditor() {
  if (!editorExId) return;
  const ex = exerciseMap[editorExId];
  if (!confirm(`Übung „${ex?.name || ''}“ wirklich löschen? Sie wird auch aus allen Sets entfernt.`)) return;
  exercises = exercises.filter((e) => e.id !== editorExId);
  // Auch aus allen Sets (samt set-spezifischer Wiederholungen) entfernen.
  sets.forEach((s) => {
    s.exercises = s.exercises.filter((id) => id !== editorExId);
    if (s.reps) delete s.reps[editorExId];
  });
  saveExercises(exercises);
  saveSets(sets);
  rebuildExerciseMap();
  closeExEditor();
  refreshExerciseDependents();
}

// Nach Änderungen an Übungen alle abhängigen Ansichten aktualisieren.
function refreshExerciseDependents() {
  renderExercisesList();
  renderSetsList();
  renderPicker();
  updatePlanSummary();
  if (editorSetId) renderEditor();
}

// Drag & Drop Reihenfolge (zeiger-basiert, funktioniert mit Maus und Touch)
function getDragAfter(listEl, y) {
  const els = [...listEl.querySelectorAll('.ex-item:not(.dragging)')];
  let closest = { offset: -Infinity, el: null };
  for (const el of els) {
    const box = el.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) closest = { offset, el };
  }
  return closest.el;
}

// Sortieren der gewählten Übungen per Drag & Drop. Das gezogene Element „klebt"
// animiert am Finger/an der Maus (transform), die Nachbarn weichen weich aus
// (FLIP), beim Loslassen gleitet es sanft in die Ziel-Lücke.
function setupSortable() {
  const list = $('#chosen-list');
  if (!list) return;
  let dragging = null;
  let grabOffset = 0;      // wo innerhalb des Elements gegriffen wurde
  let currentTranslate = 0; // aktuell gesetzte translateY

  // Layout-Position (ohne unseren transform) aus der aktuellen Bildschirmlage.
  const naturalTop = () => dragging.getBoundingClientRect().top - currentTranslate;
  // Element unter den Finger kleben.
  const glue = (clientY) => {
    currentTranslate = (clientY - grabOffset) - naturalTop();
    dragging.style.transform = `translateY(${currentTranslate}px)`;
  };
  // DOM umsortieren und die Nachbarn weich an ihre neue Stelle gleiten lassen.
  const flipReorder = (refNode) => {
    const sibs = [...list.children].filter((el) => el !== dragging);
    const before = new Map(sibs.map((el) => [el, el.getBoundingClientRect().top]));
    list.insertBefore(dragging, refNode); // refNode === null -> ans Ende
    for (const el of sibs) {
      const delta = before.get(el) - el.getBoundingClientRect().top;
      if (!delta) continue;
      el.style.transition = 'none';
      el.style.transform = `translateY(${delta}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.18s ease';
        el.style.transform = '';
      });
    }
  };

  list.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('.handle');
    if (!handle) return;
    const item = handle.closest('.ex-item');
    if (!item) return;
    e.preventDefault();
    dragging = item;
    currentTranslate = 0;
    grabOffset = e.clientY - item.getBoundingClientRect().top;
    item.classList.add('dragging');
    item.setPointerCapture?.(e.pointerId);
    document.body.classList.add('dragging-active');
    glue(e.clientY);

    const onMove = (ev) => {
      const after = getDragAfter(list, ev.clientY);
      if (after == null) {
        if (list.lastElementChild !== dragging) flipReorder(null);
      } else if (after !== dragging && dragging.nextElementSibling !== after) {
        flipReorder(after);
      }
      glue(ev.clientY); // nach dem Umsortieren wieder exakt unter den Finger
    };
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      document.body.classList.remove('dragging-active');
      const el = dragging;
      dragging = null;
      // sanft in die Ziel-Lücke gleiten (von currentTranslate -> 0)
      el.style.transition = 'transform 0.18s ease';
      el.style.transform = '';
      const cleanup = () => {
        el.style.transition = '';
        el.style.transform = '';
        el.classList.remove('dragging');
        el.removeEventListener('transitionend', cleanup);
      };
      el.addEventListener('transitionend', cleanup);
      setTimeout(cleanup, 240); // Fallback, falls keine Bewegung -> kein transitionend
      // neue Reihenfolge übernehmen
      const set = currentSet();
      if (set) {
        set.exercises = [...list.querySelectorAll('.ex-item')].map((li) => li.dataset.id);
        saveSets(sets);
      }
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  });
}

$('#editor-name').addEventListener('input', (e) => {
  const set = currentSet();
  if (set) {
    set.name = e.target.value;
    saveSets(sets);
  }
});
$('#editor-desc').addEventListener('input', (e) => {
  const set = currentSet();
  if (set) {
    set.desc = e.target.value;
    saveSets(sets);
  }
});
// Auto-erstelltes Set mit denselben Parametern neu würfeln (frische Variante).
$('#btn-regenerate-set').addEventListener('click', () => {
  const set = currentSet();
  if (!set || !set.gen) return;
  const res = generateSet(exercises, set.gen, cycleSeconds());
  if (!res || !res.exercises.length) return;
  set.exercises = res.exercises;
  set.desc = res.desc;
  if (set.reps) set.reps = {}; // set-spezifische Wiederholungen zurücksetzen
  saveSets(sets);
  $('#editor-desc').value = set.desc;
  renderEditor();
});
$('#btn-save-set').addEventListener('click', closeEditor);
$('#btn-close-editor').addEventListener('click', closeEditor);
$('#btn-delete-set').addEventListener('click', () => {
  if (!confirm('Dieses Set wirklich löschen?')) return;
  sets = sets.filter((s) => s.id !== editorSetId);
  selectedSetIds = selectedSetIds.filter((id) => id !== editorSetId);
  saveSets(sets);
  closeEditor();
});
function closeEditor() {
  $('#set-editor').hidden = true;
  editorSetId = null;
  renderSetsList();
  renderPicker();
  updatePlanSummary();
}

// ================ SPOTIFY ================
function renderSpotify() {
  const panel = $('#spotify-panel');
  const connected = spotify.isConnected();
  const keyless = spotify.keyless; // ID fest eingebaut → kein Key-Feld nötig
  panel.innerHTML = `
    <div class="sp-row">
      ${keyless ? '' : `<input id="sp-client" placeholder="Spotify Client ID" value="${escapeHtml(spotify.clientId)}" />`}
      ${connected
        ? '<button class="btn btn-danger" id="sp-logout">Trennen</button>'
        : `<button class="btn btn-primary" id="sp-connect">${keyless ? '▶ Mit Spotify verbinden' : 'Verbinden'}</button>`}
    </div>
    <p class="muted small"><span class="status-dot ${connected ? 'on' : ''}"></span>${connected ? 'Verbunden' : 'Nicht verbunden'}</p>
    ${connected ? '<button class="btn btn-primary sp-here-btn" id="sp-here">▶ Hier abspielen</button>' : ''}
    <div class="sp-now" id="sp-now"></div>
    <div class="sp-controls" id="sp-controls" ${connected ? '' : 'hidden'}>
      <button class="btn" id="sp-prev">⏮</button>
      <button class="btn" id="sp-play">⏯</button>
      <button class="btn" id="sp-next">⏭</button>
    </div>`;

  $('#sp-client')?.addEventListener('change', (e) => (spotify.clientId = e.target.value));
  $('#sp-connect')?.addEventListener('click', async () => {
    try {
      if (!keyless && $('#sp-client')) spotify.clientId = $('#sp-client').value;
      await spotify.login();
    } catch (err) {
      alert(err.message);
    }
  });
  $('#sp-logout')?.addEventListener('click', () => {
    spotify.logout();
    renderSpotify();
  });
  // Wiedergabe mit einem Tipp auf dieses Gerät übertragen (kein Geräte-Suchen).
  $('#sp-here')?.addEventListener('click', async () => {
    await spotify.activate();
    const ok = await spotify.transferHere(true);
    if (!ok) {
      alert('Konnte nicht übertragen. Starte in der Spotify-App kurz einen Song (damit etwas läuft) und tippe dann erneut „Hier abspielen“.');
    }
  });
  $('#sp-prev')?.addEventListener('click', () => spotify.previous());
  $('#sp-play')?.addEventListener('click', () => spotify.togglePlay());
  $('#sp-next')?.addEventListener('click', () => spotify.next());

  spotify.onState = (s) => renderNowPlaying(s);
  spotify.onReady = () => {
    // Sobald das Browser-Gerät bereit ist, beim nächsten Tippen das
    // Audio-Element aktivieren – sonst blockiert v. a. iOS das Übertragen
    // der Wiedergabe von der Spotify-App auf dieses Gerät.
    document.body.addEventListener('pointerdown', () => spotify.activate(), { once: true });
    applyMusicVolume(); // gewählte Musik-Lautstärke auf den Player anwenden
  };
  if (connected && !spotify.player) spotify.initPlayer().catch(() => {});
  if (spotify.state) renderNowPlaying(spotify.state);
}

function renderNowPlaying(state) {
  const host = $('#sp-now');
  if (!host) return;
  const track = state?.track_window?.current_track;
  if (!track) {
    host.innerHTML = '<span class="muted small">Tippe „▶ Hier abspielen“ – die Wiedergabe wird auf dieses Gerät übertragen. Läuft gerade nichts, starte in der Spotify-App kurz einen Song und tippe erneut.</span>';
    return;
  }
  host.innerHTML = `
    <img src="${track.album?.images?.[0]?.url || ''}" alt="" />
    <div>
      <div style="font-weight:700">${escapeHtml(track.name)}</div>
      <div class="muted small">${escapeHtml(track.artists?.map((a) => a.name).join(', ') || '')}</div>
    </div>`;
  updateRunnerNowPlaying();
}

// Zeigt im Runner an, was gerade läuft – Radio (mit Song, falls verfügbar)
// oder Spotify. So steht dort nicht mehr pauschal „Spotify“.
function updateRunnerNowPlaying() {
  const el = $('#runner-nowplaying');
  if (!el) return;
  if (radio.playing) {
    const name = radio.current?.name || 'Radio';
    const genre = radio.current?.genre ? ` · ${radio.current.genre}` : '';
    const np = radio.nowPlaying;
    const track = np && (np.artist || np.title)
      ? `<div class="rm-track">${escapeHtml([np.artist, np.title].filter(Boolean).join(' – '))}</div>`
      : '';
    el.innerHTML = `<div class="rm-src">📻 ${escapeHtml(name)}${escapeHtml(genre)}</div>${track}`;
    return;
  }
  const track = spotify.state?.track_window?.current_track;
  if (track && spotify.ready) {
    const artists = track.artists?.map((a) => a.name).join(', ') || '';
    el.innerHTML = `<div class="rm-src">🎵 Spotify</div><div class="rm-track">${escapeHtml(track.name)}${artists ? ' – ' + escapeHtml(artists) : ''}</div>`;
    return;
  }
  el.innerHTML = '<span class="muted small">Tippen, um Sender/Spotify zu wählen</span>';
}

// ================ RADIO ================
function renderRadio() {
  const host = $('#radio-list');
  if (!host) return;
  host.innerHTML = '';
  if (!stations.length) {
    host.innerHTML = '<p class="muted">Noch keine Sender. Lege mit „+ Sender“ welche an.</p>';
    return;
  }
  // Nach Genre gruppieren.
  const byGenre = {};
  stations.forEach((s) => {
    const g = s.genre || 'Sonstige';
    (byGenre[g] ||= []).push(s);
  });
  Object.keys(byGenre).sort().forEach((genre) => {
    const head = document.createElement('div');
    head.className = 'radio-genre';
    head.textContent = genre;
    host.appendChild(head);
    byGenre[genre].forEach((st) => {
      const isCur = radio.current?.id === st.id && radio.playing;
      const row = document.createElement('div');
      row.className = 'radio-item' + (isCur ? ' playing' : '');
      row.innerHTML = `
        <button class="radio-play" title="${isCur ? 'Stoppen' : 'Abspielen'}">${isCur ? '⏹' : '▶'}</button>
        <div class="radio-body">
          <div class="radio-name">${escapeHtml(st.name)}</div>
          <div class="radio-url muted small">${escapeHtml(st.url)}</div>
        </div>
        <button class="icon-btn radio-edit" title="Bearbeiten">✎</button>`;
      row.querySelector('.radio-play').addEventListener('click', () => {
        if (radio.current?.id === st.id && radio.playing) {
          radio.stop();
        } else {
          lastStationId = st.id;
          radio.play(st);
        }
      });
      row.querySelector('.radio-edit').addEventListener('click', () => openStationEditor(st.id));
      host.appendChild(row);
    });
  });
}

function renderRadioNow(state) {
  const host = $('#radio-now');
  if (!host) return;
  const name = radio.current?.name || '';
  if (state === 'error') {
    host.innerHTML = `<span class="status-dot"></span><span class="muted small">Sender „${escapeHtml(name)}“ nicht erreichbar – evtl. kein HTTPS-Direktstream.</span>`;
  } else if (state === 'loading') {
    host.innerHTML = `<span class="status-dot"></span><span class="muted small">Verbinde mit „${escapeHtml(name)}“ …</span>`;
  } else if (radio.playing) {
    const np = radio.nowPlaying;
    const track = np && (np.artist || np.title)
      ? ` · <span class="muted">${escapeHtml([np.artist, np.title].filter(Boolean).join(' – '))}</span>`
      : '';
    host.innerHTML = `<span class="status-dot on"></span><span class="small">▶ ${escapeHtml(name)}${track}</span>`;
  } else {
    host.innerHTML = '<span class="muted small">Kein Sender aktiv. Tippe oben auf ▶.</span>';
  }
  updateRunnerNowPlaying();
}

// ================ MUSIK-SCHNELLWAHL (Modal) ================
// Kleines Overlay (auch über dem Runner), um schnell einen Radiosender zu wählen
// oder Spotify zu verbinden – ohne in den Musik-Tab zu wechseln.
function renderMusicModal() {
  const modal = $('#music-modal');
  if (!modal || modal.hidden) return;
  // Musik-Lautstärke-Slider auf aktuellen Wert setzen.
  const vol = $('#cfg-musicvol');
  if (vol) {
    const pct = Math.round((typeof config.musicVolume === 'number' ? config.musicVolume : 0.8) * 100);
    vol.value = pct;
    const lab = $('#val-musicvol');
    if (lab) lab.textContent = pct + ' %';
  }
  const list = $('#mm-radio');
  list.innerHTML = '';
  if (!stations.length) {
    list.innerHTML = '<p class="muted small">Noch keine Sender. Lege im Tab „Musik“ welche an.</p>';
  } else {
    const byGenre = {};
    stations.forEach((s) => { (byGenre[s.genre || 'Sonstige'] ||= []).push(s); });
    Object.keys(byGenre).sort().forEach((genre) => {
      const head = document.createElement('div');
      head.className = 'radio-genre';
      head.textContent = genre;
      list.appendChild(head);
      byGenre[genre].forEach((st) => {
        const isCur = radio.current?.id === st.id && radio.playing;
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'mm-station' + (isCur ? ' playing' : '');
        row.innerHTML = `<span class="mm-ic">${isCur ? '⏹' : '▶'}</span><span class="mm-name">${escapeHtml(st.name)}</span>`;
        row.addEventListener('click', () => {
          if (radio.current?.id === st.id && radio.playing) {
            radio.stop();
          } else {
            initAudio();
            lastStationId = st.id;
            radio.play(st);
          }
          renderMusicModal();
        });
        list.appendChild(row);
      });
    });
  }
  const sp = $('#mm-spotify');
  const connected = spotify.isConnected();
  sp.innerHTML = `
    <div class="mm-sp-row">
      <span class="status-dot ${connected ? 'on' : ''}"></span>
      <span class="small">Spotify ${connected ? 'verbunden' : 'nicht verbunden'}</span>
      ${connected
        ? '<button class="btn" id="mm-sp-here">▶ Hier abspielen</button>'
        : '<button class="btn btn-primary" id="mm-sp-connect">▶ Verbinden</button>'}
    </div>`;
  $('#mm-sp-connect')?.addEventListener('click', async () => {
    try { await spotify.login(); } catch (err) { alert(err.message); }
  });
  $('#mm-sp-here')?.addEventListener('click', async () => {
    await spotify.activate();
    const ok = await spotify.transferHere(true);
    if (!ok) alert('Konnte nicht übertragen. Starte in der Spotify-App kurz einen Song und tippe dann erneut „Hier abspielen“.');
  });
}

function openMusicModal() {
  initAudio();
  $('#music-modal').hidden = false;
  renderMusicModal();
}
function closeMusicModal() {
  $('#music-modal').hidden = true;
}

// ---- Coach-Schnelleinstellungen im laufenden Workout ----
// Bindet die wichtigsten Coach-Regler im Modal; Änderungen greifen sofort.
function bindCoachModal() {
  const sel = $('#rc-persona');
  if (sel) {
    sel.innerHTML = PERSONAS.map((p) => `<option value="${p.id}">${p.emoji} ${escapeHtml(p.name)}</option>`).join('');
    sel.addEventListener('change', (e) => selectPersona(e.target.value));
  }
  $('#rc-verbosity')?.addEventListener('change', (e) => { config.verbosity = e.target.value; saveConfig(config); });
  $('#rc-comments')?.addEventListener('change', (e) => { config.coachComments = e.target.checked; saveConfig(config); });
  $('#rc-voice')?.addEventListener('change', (e) => { config.voice = e.target.checked; saveConfig(config); });
  $('#rc-beeps')?.addEventListener('change', (e) => { config.beeps = e.target.checked; saveConfig(config); });
  $('#rc-duck')?.addEventListener('change', (e) => { config.duckSpotify = e.target.checked; saveConfig(config); });
  $('#rc-voicevol')?.addEventListener('input', () => {
    const pct = Number($('#rc-voicevol').value);
    config.voiceVolume = Math.max(0, Math.min(1, pct / 100));
    const lab = $('#rc-val-voicevol');
    if (lab) lab.textContent = Math.round(pct) + ' %';
    saveConfig(config);
    applyVoiceSettings();
  });
  $('#btn-close-coach')?.addEventListener('click', closeCoachModal);
  $('#coach-modal')?.addEventListener('click', (e) => { if (e.target.id === 'coach-modal') closeCoachModal(); });
}

function openCoachModal() {
  initAudio();
  if ($('#rc-persona')) $('#rc-persona').value = config.voicePersona || 'standard';
  if ($('#rc-verbosity')) $('#rc-verbosity').value = config.verbosity || 'full';
  if ($('#rc-comments')) $('#rc-comments').checked = config.coachComments !== false;
  if ($('#rc-voice')) $('#rc-voice').checked = !!config.voice;
  if ($('#rc-beeps')) $('#rc-beeps').checked = !!config.beeps;
  if ($('#rc-duck')) $('#rc-duck').checked = !!config.duckSpotify;
  const pct = Math.round((config.voiceVolume ?? 1) * 100);
  if ($('#rc-voicevol')) $('#rc-voicevol').value = pct;
  if ($('#rc-val-voicevol')) $('#rc-val-voicevol').textContent = pct + ' %';
  $('#coach-modal').hidden = false;
}
function closeCoachModal() {
  $('#coach-modal').hidden = true;
}

function openStationEditor(stId) {
  editorStationId = stId;
  const st = stId ? stations.find((s) => s.id === stId) : null;
  $('#station-editor-title').textContent = st ? 'Sender bearbeiten' : 'Neuer Sender';
  $('#station-name').value = st?.name || '';
  $('#station-genre').value = st?.genre || '';
  $('#station-url').value = st?.url || '';
  $('#btn-delete-station').style.visibility = st ? 'visible' : 'hidden';
  $('#station-editor').hidden = false;
}

function closeStationEditor() {
  $('#station-editor').hidden = true;
  editorStationId = null;
}

function saveStationEditor() {
  const name = $('#station-name').value.trim();
  const url = $('#station-url').value.trim();
  if (!name || !url) {
    alert('Bitte Name und Stream-URL angeben.');
    return;
  }
  if (!/^https:\/\//i.test(url)) {
    alert('Die Stream-URL muss mit https:// beginnen (HTTP wird vom Browser blockiert).');
    return;
  }
  const data = { name, genre: $('#station-genre').value.trim() || 'Sonstige', url };
  if (editorStationId) {
    const st = stations.find((s) => s.id === editorStationId);
    if (st) Object.assign(st, data);
  } else {
    stations.push({ id: uid('st'), ...data });
  }
  saveStations(stations);
  closeStationEditor();
  renderRadio();
}

function deleteStationEditor() {
  if (!editorStationId) return;
  const st = stations.find((s) => s.id === editorStationId);
  if (!confirm(`Sender „${st?.name || ''}“ wirklich löschen?`)) return;
  if (radio.current?.id === editorStationId) radio.stop();
  stations = stations.filter((s) => s.id !== editorStationId);
  saveStations(stations);
  closeStationEditor();
  renderRadio();
}

// ================ TEILEN & SICHERN ================
function gatherShareData() {
  return { v: 1, exercises, sets, stations, config };
}

function applyShareData(data) {
  if (!data || typeof data !== 'object') throw new Error('Ungültige Daten.');
  if (Array.isArray(data.exercises)) {
    exercises = data.exercises.map((e) => ({ ...e, reps: e.reps || DEFAULT_REPS }));
    saveExercises(exercises);
    rebuildExerciseMap();
  }
  if (Array.isArray(data.sets)) {
    sets = data.sets.map((s) => ({ ...s, exercises: [...(s.exercises || [])] }));
    saveSets(sets);
    selectedSetIds = [];
  }
  if (Array.isArray(data.stations)) {
    stations = data.stations;
    saveStations(stations);
  }
  if (data.config && typeof data.config === 'object') {
    config = { ...config, ...data.config };
    saveConfig(config);
  }
  // Alles neu aufbauen.
  bindConfig();
  renderPicker();
  renderSetsList();
  renderExercisesList();
  renderRadio();
  renderVoiceSettings();
  applyVoiceSettings();
  updatePlanSummary();
}

async function createShareLink() {
  try {
    const payload = await encodeShare(gatherShareData());
    const url = `${location.origin}${location.pathname}#share=${payload}`;
    const out = $('#share-output');
    out.value = url;
    out.hidden = false;
    out.focus();
    out.select();
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {}
    alert(copied ? 'Teilen-Link wurde kopiert! 🔗' : 'Teilen-Link erstellt – unten markiert, bitte kopieren.');
  } catch (err) {
    alert('Konnte keinen Link erstellen: ' + err.message);
  }
}

function exportFile() {
  const blob = new Blob([JSON.stringify(gatherShareData(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pixletics-konfiguration.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function importFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!confirm('Import ersetzt deine Übungen, Sets und Sender. Fortfahren?')) return;
      applyShareData(data);
      alert('Import erfolgreich. ✅');
    } catch (err) {
      alert('Datei konnte nicht gelesen werden: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// Beim Laden geteilte Daten aus dem Link (#share=…) übernehmen.
async function handleShareHash() {
  const m = location.hash.match(/#share=(.+)$/);
  if (!m) return;
  try {
    const data = await decodeShare(m[1]);
    if (confirm('Geteilte Konfiguration importieren? Ersetzt deine Übungen, Sets und Sender.')) {
      applyShareData(data);
      alert('Geteilte Konfiguration übernommen. ✅');
    }
  } catch (err) {
    console.warn('Share-Import fehlgeschlagen', err);
  } finally {
    history.replaceState({}, document.title, location.origin + location.pathname);
  }
}

// ================ RUNNER ================
async function startWorkout() {
  initAudio();
  resetCoachBags(); // frische Spruch-Mischung pro Workout
  const items = selectedExercises();
  if (!items.length) {
    switchView('train');
    alert('Bitte wähle mindestens ein Set mit Übungen aus.');
    return;
  }
  // Aktivpause aktiv, wenn ein gewähltes Set sie vorsieht (z. B. Zirkeltraining).
  workoutActiveRest = selectedSetIds.some((id) => sets.find((s) => s.id === id)?.activeRest);
  clearSession(); updateResumeButton(); // neues Workout ersetzt einen gespeicherten Stand
  // Zirkel (Aktivpause) enden auf einer vollen Runde – kein angebrochener Durchlauf.
  const steps = buildSchedule(items, config, { wholeLaps: workoutActiveRest });
  armRunner(steps);
}

let pendingStartIndex = 0; // ab welchem Schritt beginRunner startet (Fortsetzen)

// „Bereit“-Zustand: Runner öffnen, eine Übung als Vorschau zeigen und einen
// Start-Knopf anbieten – so kann man vorher in Ruhe die Musik wählen. Das
// Workout startet erst beim Tippen auf Start (beginRunner). `startIndex > 0`
// = Fortsetzen ab diesem Schritt.
function armRunner(steps, startIndex = 0) {
  pendingStartIndex = Math.min(Math.max(0, startIndex), Math.max(0, steps.length - 1));
  const resuming = pendingStartIndex > 0;
  engine.load(steps);
  engine.h = runnerHandlers(steps);
  const bg = $('#runner-bg');
  if (bg) bg.className = 'runner-bg prepare';
  // Vorschau: beim Fortsetzen der aktuelle Schritt, sonst die erste Übung.
  const preview = resuming ? steps[pendingStartIndex] : (steps.find((s) => s.phase === PHASE.WORK) || steps[0]);
  const ex = preview && (preview.exId ? exerciseMap[preview.exId] : { name: preview.label, emoji: '⏱️', cue: '' });
  $('#phase-label').textContent = resuming ? 'Fortsetzen' : 'Bereit';
  $('#exercise-name').textContent = ex ? `${ex.emoji} ${ex.name}` : '';
  $('#exercise-cue').textContent = resuming ? 'Weiter, wo du aufgehört hast – auf Start' : 'Wähle ggf. Musik – dann auf Start';
  // Anleitung zur ersten/aktuellen Übung schon im „Bereit“-Screen anbieten.
  runnerCurrentExId = (preview && preview.exId) || null;
  $('#btn-runner-howto').hidden = !(runnerCurrentExId && resolveHowto(exerciseMap[runnerCurrentExId]));
  $('#big-timer').textContent = preview ? String(preview.duration).padStart(2, '0') : '00';
  const ring0 = $('#timer-ring');
  if (ring0) { ring0.classList.remove('final'); ring0.style.setProperty('--p', '1'); ring0.style.setProperty('--ring', 'var(--blue)'); }
  $('#phase-icon').textContent = '';
  $('#next-up').textContent = '';
  $('#runner-round').textContent = '';
  $('#runner-session').textContent = '';
  $('#runner-progress-bar').style.width = '0%';
  $('#btn-runner-start').textContent = resuming ? '▶︎ Fortsetzen' : '▶︎ Start';
  $('#btn-runner-start').hidden = false;
  $('#runner-workout-sec').hidden = true; // Steuerung erst nach dem Start
  $('#runner').hidden = false;
  pauseHeaderLoop();
}

function beginRunner() {
  initAudio();
  $('#btn-runner-start').hidden = true;
  $('#runner-workout-sec').hidden = false;
  $('#btn-pause').textContent = '⏸';
  requestWakeLock();
  engine.start(pendingStartIndex);
  pendingStartIndex = 0;
}

// ---------------- Workout-Status sichern / fortsetzen ----------------
// Die Schrittliste hat Zusatz-Eigenschaften am Array (totalRounds …), die JSON
// nicht mitnimmt – daher getrennt als meta sichern und beim Laden wieder anhängen.
function serializeSteps(steps) {
  return {
    steps: steps.map((s) => ({ ...s })),
    meta: {
      totalRounds: steps.totalRounds, lapLength: steps.lapLength,
      totalLaps: steps.totalLaps, totalSeconds: steps.totalSeconds,
      interval: !!steps.interval, unit: steps.unit,
    },
  };
}
function deserializeSteps(data) {
  const steps = (data.steps || []).map((s) => ({ ...s }));
  const m = data.meta || {};
  steps.totalRounds = m.totalRounds; steps.lapLength = m.lapLength;
  steps.totalLaps = m.totalLaps; steps.totalSeconds = m.totalSeconds;
  if (m.interval) steps.interval = true;
  steps.unit = m.unit;
  return steps;
}

function saveCurrentSession() {
  const steps = engine.steps;
  if (!steps || !steps.length) return;
  saveSession({
    data: serializeSteps(steps),
    index: engine.index,
    activeRest: workoutActiveRest,
    savedAt: Date.now(),
  });
}

// „Fortsetzen“-Knopf + Hero-Hinweis je nach gespeichertem Workout ein-/ausblenden.
function updateResumeButton() {
  const has = !!loadSession();
  const btn = $('#btn-resume');
  if (btn) btn.hidden = !has;
  const hero = $('#hero-resume');
  if (hero) hero.hidden = !has;
}

function resumeWorkout() {
  const session = loadSession();
  if (!session || !session.data) { updateResumeButton(); return; }
  initAudio();
  resetCoachBags();
  workoutActiveRest = !!session.activeRest;
  const steps = deserializeSteps(session.data);
  if (!steps.length) { clearSession(); updateResumeButton(); return; }
  armRunner(steps, Math.min(session.index || 0, steps.length - 1));
}

function fmtTime(ms) {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function runnerHandlers(steps) {
  const bg = $('#runner-bg');
  const interval = !!steps.interval; // reiner Intervall-Timer (kein exId)
  // Vorbereitungsschritt direkt vor der letzten Übung – für „Letzte Übung“ statt
  // „gleich geht's weiter“ (am Ende kommt nichts mehr „weiter“).
  let lastWorkIndex = -1;
  for (let i = 0; i < steps.length; i++) if (steps[i].phase === PHASE.WORK) lastWorkIndex = i;
  const finalPrepare = lastWorkIndex > 0 ? steps[lastWorkIndex - 1] : null;
  return {
    onPhase(step, index) {
      // Intervalle (oder zwischenzeitlich gelöschte Übungen) -> generisches Objekt.
      const ex = (step.exId ? exerciseMap[step.exId] : null) || { name: step.label || 'Übung', emoji: '🏋️', cue: '' };
      bg.className = 'runner-bg ' + step.phase;
      // Timer-Ring zum Phasenstart füllen + Akzentfarbe je Phase.
      const ring = $('#timer-ring');
      if (ring) {
        ring.classList.remove('final');
        ring.style.setProperty('--p', '1');
        ring.style.setProperty('--ring', step.phase === PHASE.WORK ? 'var(--accent)' : 'var(--blue)');
      }
      const lapLen = steps.lapLength || steps.length;
      const repInfo = step.repsTotal > 1 ? ` · Satz ${step.rep}/${step.repsTotal}` : '';
      let roundLabel;
      if (interval) {
        roundLabel = steps.totalRounds > 1 ? `${steps.unit} ${step.interval}/${steps.totalRounds}` : steps.unit;
      } else if (steps.totalLaps > 1) {
        const posInLap = ((step.round - 1) % lapLen) + 1;
        const unit = workoutActiveRest ? 'Station' : 'Übung';
        roundLabel = `Runde ${step.lap}/${steps.totalLaps} · ${unit} ${posInLap}/${lapLen}`;
      } else {
        roundLabel = `Übung ${step.round}/${steps.totalRounds}`;
      }
      $('#runner-round').textContent = roundLabel + repInfo;

      const persona = currentPersona();
      const name = config.coachName;
      const { names, phrases } = announceFlags();
      if (step.phase === PHASE.PREPARE) {
        const active = workoutActiveRest && step.lap >= 2;
        if (index === 0) {
          // Erste Übung: kein Pausen-Start – Startansage + was kommt, dann Countdown.
          setPhaseUI('Los geht’s', ex, '⏱️');
          if (config.voice) {
            const parts = [];
            if (phrases) parts.push(line(persona, 'start'));
            // „Wir starten mit …“ (statt „los“, um Doppelungen mit dem Startspruch zu vermeiden).
            if (names && !interval) parts.push(`Wir starten mit ${ex.name}.${ex.cue ? ' ' + ex.cue + '.' : ''}`);
            if (!parts.length) parts.push('Los geht’s.');
            speak(parts.join(' '), { interrupt: true });
          }
        } else if (step.roundBreak) {
          // Rundenwechsel: kleiner Applaus + „Runde geschafft“ + ggf. Aktivpause-Ansage.
          setPhaseUI(active ? 'Aktivpause' : 'Rundenpause', ex, active ? '🏃' : '🎉');
          if (active) $('#exercise-cue').textContent = 'Eine Runde um die Halle laufen 🏃';
          if (config.beeps) sound.applause();
          if (config.voice) {
            let msg = `Runde ${step.lap - 1} geschafft!`;
            if (active && step.lap === 2) msg += ' Ab jetzt Aktivpause: in jeder Pause eine Runde um die Halle laufen.';
            else if (active) msg += ' Aktivpause: eine Runde um die Halle laufen.';
            else msg += ' Kurze Pause.';
            speak(msg, { interrupt: true });
          }
        } else if (active) {
          // Aktivpause (Zirkel ab Runde 2): Runde um die Halle.
          setPhaseUI('Aktivpause', ex, '🏃');
          $('#exercise-cue').textContent = 'Eine Runde um die Halle laufen 🏃';
          if (config.beeps) sound.rest();
          if (config.voice) speak(phrases || names ? 'Aktivpause! Eine Runde um die Halle laufen.' : 'Aktivpause.', { interrupt: true });
        } else {
          setPhaseUI('Pause', ex, '⏸️');
          if (config.beeps) sound.rest();
          if (config.voice) {
            const restSpruch = phrases ? line(persona, 'rest') : '';
            // „Pause“ nur voranstellen, wenn der Spruch das Wort nicht ohnehin enthält.
            const txt = !restSpruch ? 'Pause.' : (/pause/i.test(restSpruch) ? restSpruch : `Pause. ${restSpruch}`);
            speak(txt, { interrupt: true });
          }
        }
        showNextAfter(steps, index);
      } else if (step.phase === PHASE.WORK) {
        setPhaseUI('Los!', ex, '');
        if (config.beeps) sound.start();
        if (config.voice) {
          const spruch = phrases ? motivationLine(persona, { name }) : '';
          const parts = [];
          // Signalwort „Los!“ nur, wenn der Spruch es nicht selbst enthält (kein Doppel).
          if (!/\blos\b/i.test(spruch)) parts.push('Los!');
          if (names && !interval) parts.push(`${ex.name}!`);
          if (spruch) parts.push(spruch);
          speak(parts.join(' ') || 'Los!', { interrupt: true });
        }
        $('#next-up').textContent = '';
      }
    },
    onSecond({ step, secondsLeft, duration }) {
      const { names, phrases, v } = announceFlags();
      if (step.phase === PHASE.WORK) {
        // Ab und zu ein zweiter Anfeuer-Spruch in der Übungsmitte – mal gibt es
        // also einen Spruch pro Übung, mal zwei (aus demselben Topf, ohne
        // Wiederholung). Liegt vor „Noch fünfzehn Sekunden“ und dem Countdown.
        if (config.voice && phrases && duration >= 20) {
          const midAt = Math.max(16, Math.round(duration * 0.6));
          if (secondsLeft === midAt && Math.random() * 100 < 45) {
            speak(motivationLine(currentPersona(), { name: config.coachName }));
          }
        }
        // „Noch fünfzehn Sekunden“ – funktionaler Hinweis (außer 'minimal').
        if (secondsLeft === 15 && duration > 18 && config.voice && v !== 'minimal') {
          speak('Noch fünfzehn Sekunden.');
        }
        // Letzte 10 Sekunden laut runterzählen + ticken.
        if (secondsLeft <= 10) {
          if (config.beeps) sound.tick();
          if (config.voice) speak(String(secondsLeft));
        }
      } else if (step.phase === PHASE.PREPARE) {
        const firstBlock = step.round === 1; // Lead-in: nur Countdown
        // Kurz vor dem Ende der Pause eine Vorwarnung:
        //  • mit Übungsnamen (full/concise): „Als Nächstes: X.“
        //  • nur Sprüche (phrases): generische „gleich geht's weiter“-Ansage
        //  • minimal: nichts (nur Countdown)
        if (!firstBlock && config.voice && secondsLeft === Math.max(4, duration - 9)) {
          const isFinal = step === finalPrepare;
          if (names) {
            const ex = exerciseMap[step.exId];
            if (ex) speak(`${isFinal ? 'Letzte Übung' : 'Als Nächstes'}: ${ex.name}.${ex.cue ? ' ' + ex.cue + '.' : ''}`);
          } else if (phrases) {
            speak(isFinal ? 'Achtung, letzte Übung!' : (line(currentPersona(), 'ready') || 'Achtung, gleich geht’s weiter!'));
          }
        }
        // letzte 3 Sekunden: Start-Countdown (immer).
        if (secondsLeft <= 3) {
          if (config.beeps) sound.tick();
          if (config.voice) speak(String(secondsLeft));
        }
      }
    },
    onTick({ step, remainingMs, secondsLeft, sessionRemaining }) {
      const t = $('#big-timer');
      const txt = String(secondsLeft).padStart(2, '0');
      if (t.textContent !== txt) {
        t.textContent = txt;
        if (secondsLeft <= 5) {
          t.classList.remove('pulse');
          void t.offsetWidth;
          t.classList.add('pulse');
        }
      }
      $('#runner-session').textContent = `Noch ${fmtTime(sessionRemaining)}`;
      const frac = 1 - sessionRemaining / (steps.totalSeconds * 1000);
      $('#runner-progress-bar').style.width = `${Math.min(100, frac * 100)}%`;
      // Timer-Ring leert sich über die aktuelle Phase; letzte 3 Sek. dramatisch.
      const ring = $('#timer-ring');
      if (ring && step && step.duration) {
        ring.style.setProperty('--p', Math.max(0, Math.min(1, remainingMs / (step.duration * 1000))).toFixed(4));
        ring.classList.toggle('final', secondsLeft <= 3);
      }
    },
    onFinish() {
      setPhaseUI('Geschafft! 🎉', null, '🏁');
      const ring = $('#timer-ring');
      if (ring) { ring.classList.remove('final'); ring.style.setProperty('--p', '1'); ring.style.setProperty('--ring', 'var(--green)'); }
      $('#exercise-name').textContent = 'Sehr gut!';
      $('#big-timer').textContent = '✓';
      $('#exercise-cue').textContent = 'Workout abgeschlossen';
      $('#next-up').textContent = '';
      if (config.beeps) sound.applause();
      if (config.voice) {
        speak(announceFlags().phrases ? line(currentPersona(), 'finish', { name: config.coachName }) : 'Geschafft!', { interrupt: true });
      }
      releaseWakeLock();
      clearSession(); updateResumeButton(); // beendetes Workout nicht zum Fortsetzen anbieten
    },
  };
}

function setPhaseUI(label, ex, icon) {
  $('#phase-label').textContent = label;
  $('#exercise-name').textContent = ex ? `${ex.emoji} ${ex.name}` : '';
  $('#exercise-cue').textContent = ex ? ex.cue : '';
  $('#phase-icon').textContent = icon || '';
  // Info-Button nur zeigen, wenn zur aktuellen Übung eine Anleitung existiert.
  runnerCurrentExId = ex?.id || null;
  $('#btn-runner-howto').hidden = !(ex && resolveHowto(ex));
}
$('#btn-runner-howto').addEventListener('click', () => openHowtoModal(runnerCurrentExId));

// Während der Pause zeigt die große Anzeige bereits die kommende Übung; als
// „Danach“ blenden wir die übernächste ein (die erste WORK nach der kommenden).
function showNextAfter(steps, index) {
  let skippedUpcoming = false;
  for (let i = index + 1; i < steps.length; i++) {
    if (steps[i].phase === PHASE.WORK) {
      if (!skippedUpcoming) { skippedUpcoming = true; continue; }
      const st = steps[i];
      const ex = exerciseMap[st.exId];
      const label = ex ? `${ex.emoji} ${ex.name}` : (st.label || '');
      $('#next-up').textContent = label ? `Danach: ${label}` : '';
      return;
    }
  }
  $('#next-up').textContent = steps.interval ? 'Letztes Intervall – Endspurt!' : 'Letzte Übung – Endspurt!';
}

function stopRunner() {
  // Laufendes (noch nicht beendetes) Workout sichern, damit man fortsetzen kann.
  if (engine.running) saveCurrentSession();
  engine.stop();
  cancelSpeech();
  spotify.unduck();
  radio.unduck();
  releaseWakeLock();
  $('#btn-runner-start').hidden = true; // „Bereit“-Knopf zurücksetzen
  $('#runner').hidden = true;
  resumeHeaderLoop(); // Logo-Schleife wieder aufnehmen
  updateResumeButton();
}

// Runner-Steuerung
$('#btn-start').addEventListener('click', startWorkout);
$('#btn-resume').addEventListener('click', resumeWorkout);
$('#btn-runner-start').addEventListener('click', beginRunner);
$('#btn-close-runner').addEventListener('click', stopRunner);
$('#btn-prev').addEventListener('click', () => engine.prev());
$('#btn-skip').addEventListener('click', () => engine.skip());

// Beim Schließen/Wegschalten der App ein laufendes Workout sichern (Fortsetzen).
window.addEventListener('pagehide', () => { if (engine.running) saveCurrentSession(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && engine.running) saveCurrentSession();
});
$('#btn-pause').addEventListener('click', () => {
  engine.toggle();
  $('#btn-pause').textContent = engine.paused ? '▶' : '⏸';
  if (engine.paused) cancelSpeech();
});
$('#btn-prev-track').addEventListener('click', () => spotify.previous());
$('#btn-sp-toggle').addEventListener('click', () => spotify.togglePlay());
$('#btn-next-track').addEventListener('click', () => spotify.next());

// ---------------- Sprachansage duckt die Musik (Spotify + Radio) ----------------
// Beim schnellen Runterzählen folgen viele kurze Ansagen aufeinander. Damit die
// Musik nicht zwischen den Zahlen kurz wieder laut wird, wird das Lautmachen
// verzögert: Startet innerhalb der Wartezeit die nächste Ansage, bleibt es leise.
let unduckTimer = null;
setSpeechHooks({
  start: () => {
    if (unduckTimer) {
      clearTimeout(unduckTimer);
      unduckTimer = null;
    }
    if (!config.duckSpotify) return;
    if (spotify.ready) spotify.duck();
    if (radio.playing) radio.duck();
  },
  end: () => {
    if (unduckTimer) clearTimeout(unduckTimer);
    unduckTimer = setTimeout(() => {
      unduckTimer = null;
      if (!config.duckSpotify) return;
      if (spotify.ready) spotify.unduck();
      radio.unduck();
    }, 1200);
  },
});

// ---------------- Übungen-Editor: Buttons ----------------
$('#btn-new-ex').addEventListener('click', () => openExEditor(null));
$('#btn-close-ex-editor').addEventListener('click', closeExEditor);
$('#btn-save-ex').addEventListener('click', saveExEditor);
$('#btn-delete-ex').addEventListener('click', deleteExEditor);
// Anleitung von „nur ansehen" zu „bearbeiten" umschalten.
$('#btn-edit-howto').addEventListener('click', () => {
  $('#ex-howto-view').hidden = true;
  $('#btn-edit-howto').hidden = true;
  $('#ex-howto-edit').hidden = false;
  $('#ex-steps').focus();
});

// ---------------- Radio / Sender-Editor: Buttons ----------------
$('#btn-new-station').addEventListener('click', () => openStationEditor(null));
$('#btn-close-station-editor').addEventListener('click', closeStationEditor);
$('#btn-save-station').addEventListener('click', saveStationEditor);
$('#btn-delete-station').addEventListener('click', deleteStationEditor);
$('#btn-radio-toggle').addEventListener('click', () => {
  if (radio.playing) {
    radio.stop();
  } else {
    const st = stations.find((s) => s.id === lastStationId) || stations[0];
    if (st) {
      lastStationId = st.id;
      radio.play(st);
    }
  }
});

// ---------------- Musik-Schnellwahl: Buttons ----------------
$('#btn-music').addEventListener('click', openMusicModal);
$('#btn-runner-music').addEventListener('click', openMusicModal);
$('#btn-close-music').addEventListener('click', closeMusicModal);
$('#music-modal').addEventListener('click', (e) => { if (e.target.id === 'music-modal') closeMusicModal(); });
$('#btn-runner-coach').addEventListener('click', openCoachModal);
$('#cfg-musicvol')?.addEventListener('input', () => {
  const pct = Number($('#cfg-musicvol').value);
  config.musicVolume = Math.max(0, Math.min(1, pct / 100));
  const lab = $('#val-musicvol');
  if (lab) lab.textContent = Math.round(pct) + ' %';
  saveConfig(config);
  applyMusicVolume();
});

// ---------------- Teilen & Sichern: Buttons ----------------
$('#btn-share-link').addEventListener('click', createShareLink);
$('#btn-export').addEventListener('click', exportFile);
$('#import-file').addEventListener('change', (e) => importFile(e.target.files[0]));

// ---------------- Vollbild ----------------
const fsSupported = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
function toggleFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
  }
}
function updateFsButtons() {
  const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
  $('#btn-fullscreen')?.classList.toggle('active', on);
  $('#btn-fs-runner')?.classList.toggle('active', on);
}
if (!fsSupported) {
  // Vollbild-API nicht verfügbar (z. B. iOS Safari) – Schalter ausblenden.
  if ($('#btn-fullscreen')) $('#btn-fullscreen').hidden = true;
  if ($('#btn-fs-runner')) $('#btn-fs-runner').hidden = true;
} else {
  $('#btn-fullscreen')?.addEventListener('click', toggleFullscreen);
  $('#btn-fs-runner')?.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFsButtons);
  document.addEventListener('webkitfullscreenchange', updateFsButtons);
}

// ---------------- Wake Lock (Bildschirm an) ----------------
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
  } catch {}
}
function releaseWakeLock() {
  try {
    wakeLock?.release();
  } catch {}
  wakeLock = null;
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !$('#runner').hidden && engine.running) requestWakeLock();
  // Kopf-Logo-Schleife pausieren, wenn der Tab im Hintergrund ist (Akku/Performance).
  if (document.hidden) pauseHeaderLoop();
  else resumeHeaderLoop();
});

// ---------------- Helpers ----------------
function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------------- Übungsanleitung ("So geht's" + "Worauf achten") ----------------
// Liefert formatiertes HTML zur Übungs-ID oder '' (wenn keine Anleitung vorhanden).
function howtoHtml(exId) {
  const h = resolveHowto(exerciseMap[exId]);
  if (!h) return '';
  const steps = (h.steps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const tips = (h.tips || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('');
  return `
    ${steps ? `<div class="howto-block"><h4>So führst du sie aus</h4><ol class="howto-steps">${steps}</ol></div>` : ''}
    ${tips ? `<div class="howto-block"><h4>⚠️ Worauf besonders achten</h4><ul class="howto-tips">${tips}</ul></div>` : ''}`;
}

// Anleitung als Overlay öffnen (aus dem Runner).
function openHowtoModal(exId) {
  const ex = exerciseMap[exId];
  const html = howtoHtml(exId);
  if (!ex || !html) return;
  $('#howto-title').textContent = `${ex.emoji || ''} ${ex.name}`.trim();
  $('#howto-body').innerHTML = html;
  $('#howto-modal').hidden = false;
}
$('#btn-close-howto').addEventListener('click', () => { $('#howto-modal').hidden = true; });
$('#howto-modal').addEventListener('click', (e) => { if (e.target.id === 'howto-modal') $('#howto-modal').hidden = true; });

// ---------------- Logo-Animation (Gooey-Morph) ----------------
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
// 3 s „pixletics“, 2 s „workout“, im Loop. Morph 30 % langsamer (~1,56 s).
const HEAD_LOOP = { duration: 1560, dwellA: 3000, dwellB: 2000 };
let headerMorph = null;

// Dauerhafter Ping-Pong im Kopfzeilen-Logo (pixletics ↔ workout timer).
function startHeaderLoop() {
  if (reducedMotion) return;
  const stage = $('#brand-morph');
  if (!stage) return;
  if (!headerMorph) {
    headerMorph = new GooeyMorph({
      stage,
      layerA: $('#brand-a'),
      layerB: $('#brand-b'),
      blur: document.querySelector('#goo-head feGaussianBlur'),
      matrix: document.querySelector('#goo-head feColorMatrix'),
      disp: document.querySelector('#goo-head feDisplacementMap'),
      filterId: 'goo-head',
      maxBlur: 6, gooStd: 3.4,
      threshBase: 12, threshAmp: 14, offBase: -4, offAmp: -5,
      // Kein Dauer-Wabern: Filter nur während des Wechsels, dazwischen scharf.
      dispBase: 0, dispAmp: 2.0, keepFilter: false,
    });
  }
  headerMorph.loop(HEAD_LOOP);
}
function pauseHeaderLoop() {
  headerMorph?.stopLoop();
}
function resumeHeaderLoop() {
  if (headerMorph && !document.hidden && $('#runner')?.hidden) headerMorph.loop(HEAD_LOOP);
}

// ---------------- Init ----------------
async function init() {
  initPWA();
  bindConfig();
  bindVoiceSettings();
  bindIntervalUI();
  renderPicker();
  renderSetsList();
  renderExercisesList();
  renderRadio();
  renderVoiceSettings();
  setupSortable();
  bindCoachModal();
  updatePlanSummary();
  updateResumeButton(); // „Fortsetzen“ zeigen, falls ein Workout offen ist
  renderSpotify();
  applyMusicVolume(); // gespeicherte Musik-Lautstärke (Radio) anwenden
  startHeaderLoop(); // animiertes Kopfzeilen-Logo (kein Intro-Splash mehr)

  // Gerätestimmen laden und Auswahl/Coach anwenden, sobald sie verfügbar sind.
  primeVoices();
  applyVoiceSettings();
  onVoicesReady(() => {
    applyVoiceSettings();
    renderVoiceSettings();
  });

  // Radio-Status & „Now Playing“ -> UI
  radio.onState = (state) => {
    renderRadio();
    renderRadioNow(state);
    renderMusicModal();
  };
  radio.onMeta = () => renderRadioNow();
  renderRadioNow();

  // Geteilte Konfiguration aus dem Link (#share=…) übernehmen.
  await handleShareHash();

  // Spotify-Redirect verarbeiten (falls wir gerade von Spotify zurückkommen)
  try {
    if (await spotify.handleRedirect()) {
      switchView('musik');
      await spotify.initPlayer();
      renderSpotify();
    }
  } catch (err) {
    console.warn(err);
  }
  // AudioContext bei erster Interaktion freischalten
  document.body.addEventListener('pointerdown', () => initAudio(), { once: true });
}

init();
