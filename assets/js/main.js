import { DEFAULT_REPS } from './exercises.js';
import {
  loadSets, saveSets, loadConfig, saveConfig,
  loadExercises, saveExercises, loadStations, saveStations, uid,
} from './store.js';
import { initAudio, sound, speak, cancelSpeech, setSpeechHooks } from './audio.js';
import { buildSchedule, WorkoutEngine, PHASE } from './engine.js';
import { Spotify } from './spotify.js';
import { Radio } from './radio.js';
import { encodeShare, decodeShare } from './share.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------------- State ----------------
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
}

// ================ TRAINING VIEW ================
function renderPicker() {
  const host = $('#set-picker');
  host.innerHTML = '';
  if (!sets.length) {
    host.innerHTML = '<p class="muted">Noch keine Sets. Lege im Tab „Übungssets“ welche an.</p>';
    return;
  }
  sets.forEach((set) => {
    const order = selectedSetIds.indexOf(set.id);
    const selected = order !== -1;
    const item = document.createElement('div');
    item.className = 'picker-item' + (selected ? ' selected' : '');
    item.innerHTML = `
      <div class="pi-check">${selected ? '✓' : ''}</div>
      <div class="pi-body">
        <div class="pi-name">${escapeHtml(set.name)}</div>
        <div class="pi-sub">${set.exercises.length} Übungen · ${set.exercises.map((id) => exerciseMap[id]?.emoji || '').join(' ')}</div>
      </div>
      ${selected ? `<div class="order-badge">#${order + 1}</div>` : ''}`;
    item.addEventListener('click', () => {
      const idx = selectedSetIds.indexOf(set.id);
      if (idx === -1) selectedSetIds.push(set.id);
      else selectedSetIds.splice(idx, 1);
      renderPicker();
      updatePlanSummary();
    });
    host.appendChild(item);
  });
}

function bindConfig() {
  const map = {
    'cfg-work': 'workSeconds',
    'cfg-rest': 'restSeconds',
    'cfg-prepare': 'prepareSeconds',
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

function selectedExerciseIds() {
  return selectedSetIds.flatMap((id) => sets.find((s) => s.id === id)?.exercises || []);
}

// Für den Ablaufplan: nur existierende Übungen mit ihrer Wiederholungszahl.
function selectedExercises() {
  return selectedExerciseIds()
    .filter((exId) => exerciseMap[exId])
    .map((exId) => ({ exId, reps: exerciseMap[exId].reps || DEFAULT_REPS }));
}

function updatePlanSummary() {
  const pool = selectedExerciseIds();
  const cycle = config.prepareSeconds + config.workSeconds + config.restSeconds;
  const rounds = Math.max(1, Math.floor((config.totalMinutes * 60) / cycle));
  const el = $('#plan-summary');
  if (!pool.length) {
    el.textContent = 'Wähle oben mindestens ein Set aus.';
    return;
  }
  el.textContent = `≈ ${rounds} Runden · ${pool.length} Übungen (Wdh. je Übung) · ${config.totalMinutes} Min geplant`;
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

// ================ SET EDITOR ================
function openEditor(setId) {
  editorSetId = setId;
  const set = sets.find((s) => s.id === setId);
  if (!set) return;
  $('#editor-name').value = set.name;
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
      <span class="reps-badge" title="Wiederholungen">×${ex.reps || DEFAULT_REPS}</span>
      <button class="rm" title="Entfernen">✕</button>`;
    li.querySelector('.rm').addEventListener('click', () => {
      set.exercises = set.exercises.filter((id) => id !== exId);
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
  const data = {
    name,
    area: $('#ex-area').value.trim(),
    emoji: $('#ex-emoji').value.trim() || '🏋️',
    cue: $('#ex-cue').value.trim(),
    reps,
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
  // Auch aus allen Sets entfernen.
  sets.forEach((s) => (s.exercises = s.exercises.filter((id) => id !== editorExId)));
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

function setupSortable() {
  const list = $('#chosen-list');
  let dragging = null;
  list.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('.handle');
    if (!handle) return;
    dragging = handle.closest('.ex-item');
    if (!dragging) return;
    e.preventDefault();
    dragging.classList.add('dragging');
    dragging.setPointerCapture?.(e.pointerId);

    const onMove = (ev) => {
      const after = getDragAfter(list, ev.clientY);
      if (after == null) list.appendChild(dragging);
      else list.insertBefore(dragging, after);
    };
    const onUp = () => {
      dragging.classList.remove('dragging');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      // Reihenfolge aus DOM übernehmen
      const set = currentSet();
      if (set) {
        set.exercises = [...list.querySelectorAll('.ex-item')].map((li) => li.dataset.id);
        saveSets(sets);
      }
      dragging = null;
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
}

$('#editor-name').addEventListener('input', (e) => {
  const set = currentSet();
  if (set) {
    set.name = e.target.value;
    saveSets(sets);
  }
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
  $('#redirect-uri').textContent = spotify.redirectUri;
  const panel = $('#spotify-panel');
  const connected = spotify.isConnected();
  panel.innerHTML = `
    <div class="sp-row">
      <input id="sp-client" placeholder="Spotify Client ID" value="${escapeHtml(spotify.clientId)}" />
      ${connected
        ? '<button class="btn btn-danger" id="sp-logout">Trennen</button>'
        : '<button class="btn btn-primary" id="sp-connect">Verbinden</button>'}
    </div>
    <p class="muted small"><span class="status-dot ${connected ? 'on' : ''}"></span>${connected ? 'Verbunden' : 'Nicht verbunden'}</p>
    <div class="sp-now" id="sp-now"></div>
    <div class="sp-controls" id="sp-controls" ${connected ? '' : 'hidden'}>
      <button class="btn" id="sp-prev">⏮</button>
      <button class="btn" id="sp-play">⏯</button>
      <button class="btn" id="sp-next">⏭</button>
    </div>`;

  $('#sp-client')?.addEventListener('change', (e) => (spotify.clientId = e.target.value));
  $('#sp-connect')?.addEventListener('click', async () => {
    try {
      spotify.clientId = $('#sp-client').value;
      await spotify.login();
    } catch (err) {
      alert(err.message);
    }
  });
  $('#sp-logout')?.addEventListener('click', () => {
    spotify.logout();
    renderSpotify();
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
  };
  if (connected && !spotify.player) spotify.initPlayer().catch(() => {});
  if (spotify.state) renderNowPlaying(spotify.state);
}

function renderNowPlaying(state) {
  const host = $('#sp-now');
  if (!host) return;
  const track = state?.track_window?.current_track;
  if (!track) {
    host.innerHTML = '<span class="muted small">Tippe einmal auf ⏯, dann starte in der Spotify-App einen Song und wähle dort als Gerät „Freeletics Timer“. Er läuft dann hier weiter.</span>';
    return;
  }
  host.innerHTML = `
    <img src="${track.album?.images?.[0]?.url || ''}" alt="" />
    <div>
      <div style="font-weight:700">${escapeHtml(track.name)}</div>
      <div class="muted small">${escapeHtml(track.artists?.map((a) => a.name).join(', ') || '')}</div>
    </div>`;
  // Runner-Anzeige aktualisieren
  const rs = $('#runner-spotify');
  if (rs && !$('#runner').hidden) rs.textContent = `🎵 ${track.name} – ${track.artists?.map((a) => a.name).join(', ')}`;
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
    host.innerHTML = `<span class="status-dot on"></span><span class="small">▶ ${escapeHtml(name)}</span>`;
  } else {
    host.innerHTML = '<span class="muted small">Kein Sender aktiv. Tippe oben auf ▶.</span>';
  }
  const rs = $('#runner-spotify');
  if (rs && radio.playing && !$('#runner').hidden) rs.textContent = `📻 ${name}`;
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
  a.download = 'freeletics-timer-konfiguration.json';
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
  const items = selectedExercises();
  if (!items.length) {
    switchView('train');
    alert('Bitte wähle mindestens ein Set mit Übungen aus.');
    return;
  }
  const steps = buildSchedule(items, config);
  engine.load(steps);
  engine.h = runnerHandlers(steps);

  $('#runner').hidden = false;
  requestWakeLock();
  engine.start();
}

function fmtTime(ms) {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function runnerHandlers(steps) {
  const bg = $('#runner-bg');
  return {
    onPhase(step, index) {
      const ex = exerciseMap[step.exId];
      bg.className = 'runner-bg ' + step.phase;
      const repInfo = step.repsTotal > 1 ? ` · Satz ${step.rep}/${step.repsTotal}` : '';
      $('#runner-round').textContent = `Runde ${step.round} / ${steps.totalRounds}${repInfo}`;

      if (step.phase === PHASE.PREPARE) {
        setPhaseUI('Bereit machen', ex, '⏱️');
        // Zweite (oder weitere) Wiederholung derselben Übung gesondert ansagen.
        if (config.voice) {
          const ansage = step.rep > 1 ? `Nochmal: ${ex.name}` : `Nächste Runde: ${ex.name}`;
          speak(ansage, { interrupt: true });
        }
        showNext(steps, index);
      } else if (step.phase === PHASE.WORK) {
        setPhaseUI('Los!', ex, '');
        if (config.beeps) sound.start();
        if (config.voice) speak('Los gehts', { interrupt: true });
        $('#next-up').textContent = '';
      } else if (step.phase === PHASE.REST) {
        setPhaseUI('Pause', ex, '⏸️');
        if (config.beeps) sound.rest();
        if (config.voice) speak('Pause', { interrupt: true });
        showNext(steps, index);
      }
    },
    onSecond({ step, secondsLeft, duration }) {
      if (step.phase === PHASE.WORK) {
        // Ansage „Noch 15 Sekunden“ (nur wenn die Übung lang genug ist).
        if (secondsLeft === 15 && duration > 18) {
          if (config.voice) speak('Noch 15 Sekunden');
        }
        // Letzte 10 Sekunden laut runterzählen + ticken.
        if (secondsLeft <= 10) {
          if (config.beeps) sound.tick();
          if (config.voice) speak(String(secondsLeft));
        }
      } else {
        // prepare / rest: letzte 3 Sekunden ticken
        if (secondsLeft <= 3 && config.beeps) sound.tick();
        if (step.phase === PHASE.PREPARE && secondsLeft <= 3 && config.voice) speak(String(secondsLeft));
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
    },
    onFinish() {
      setPhaseUI('Geschafft! 🎉', null, '🏁');
      $('#exercise-name').textContent = 'Sehr gut!';
      $('#big-timer').textContent = '✓';
      $('#exercise-cue').textContent = 'Workout abgeschlossen';
      $('#next-up').textContent = '';
      if (config.beeps) sound.applause();
      if (config.voice) speak('Geschafft! Sehr gut gemacht.', { interrupt: true });
      releaseWakeLock();
    },
  };
}

function setPhaseUI(label, ex, icon) {
  $('#phase-label').textContent = label;
  $('#exercise-name').textContent = ex ? `${ex.emoji} ${ex.name}` : '';
  $('#exercise-cue').textContent = ex ? ex.cue : '';
  $('#phase-icon').textContent = icon || '';
}

function showNext(steps, index) {
  // Nächste WORK-Phase finden
  for (let i = index + 1; i < steps.length; i++) {
    if (steps[i].phase === PHASE.WORK) {
      const ex = exerciseMap[steps[i].exId];
      $('#next-up').textContent = ex ? `Danach: ${ex.emoji} ${ex.name}` : '';
      return;
    }
  }
  $('#next-up').textContent = 'Letzte Übung – Endspurt!';
}

function stopRunner() {
  engine.stop();
  cancelSpeech();
  spotify.unduck();
  radio.unduck();
  releaseWakeLock();
  $('#runner').hidden = true;
}

// Runner-Steuerung
$('#btn-start').addEventListener('click', startWorkout);
$('#btn-close-runner').addEventListener('click', stopRunner);
$('#btn-skip').addEventListener('click', () => engine.skip());
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

// ---------------- Teilen & Sichern: Buttons ----------------
$('#btn-share-link').addEventListener('click', createShareLink);
$('#btn-export').addEventListener('click', exportFile);
$('#import-file').addEventListener('change', (e) => importFile(e.target.files[0]));

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
});

// ---------------- Helpers ----------------
function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------------- Init ----------------
async function init() {
  bindConfig();
  renderPicker();
  renderSetsList();
  renderExercisesList();
  renderRadio();
  setupSortable();
  updatePlanSummary();
  renderSpotify();

  // Radio-Status -> UI
  radio.onState = (state) => {
    renderRadio();
    renderRadioNow(state);
  };
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
