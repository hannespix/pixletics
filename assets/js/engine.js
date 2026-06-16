// Workout-Engine: baut den Ablaufplan und steuert die Phasen-Zustandsmaschine.
// Pro Übung: prepare (kombinierte Pause + Vorbereitung mit Ansage/Countdown) ->
// work (Übung). Eine separate rest-Phase gibt es nicht mehr.

export const PHASE = { PREPARE: 'prepare', WORK: 'work', REST: 'rest', DONE: 'done' };

// Baut die Schrittliste. Jede Übung wird gemäß ihrer eigenen Wiederholungszahl
// (`reps`) mehrfach hintereinander ausgeführt, danach folgt die nächste Übung.
// Diese Sequenz wird durchlaufen und so oft wiederholt, bis die Gesamtdauer
// (totalMinutes) erreicht ist.
// `items` ist ein Array aus { exId, reps }.
export function buildSchedule(items, config) {
  const { workSeconds, pauseSeconds, totalMinutes } = config;
  // Pause + Vorbereitung sind zusammengelegt: vor jeder Übung ein Block, in dem
  // man sich erholt UND gleich zu Beginn hört, was als Nächstes kommt.
  const cycle = pauseSeconds + workSeconds;
  const totalSeconds = totalMinutes * 60;
  const maxRounds = Math.max(1, Math.floor(totalSeconds / cycle));
  const steps = [];
  if (!items.length) return steps;

  // Jede Übung gemäß ihrer Wiederholungen aufblähen,
  // z. B. [A, A, A, B, B, B, B, …] bei 3 bzw. 4 Wiederholungen.
  const sequence = [];
  for (const it of items) {
    const reps = Math.max(1, it.reps || 1);
    for (let r = 0; r < reps; r++) sequence.push({ exId: it.exId, rep: r + 1, repsTotal: reps });
  }

  for (let i = 0; i < maxRounds; i++) {
    const item = sequence[i % sequence.length];
    // lap = wievielter kompletter Durchlauf durch die Übungs-/Stationsfolge.
    const lap = Math.floor(i / sequence.length) + 1;
    // Rundenwechsel: erster Block eines neuen Durchlaufs (für Applaus + längere Pause).
    const roundBreak = i > 0 && i % sequence.length === 0;
    const meta = { exId: item.exId, rep: item.rep, repsTotal: item.repsTotal, round: i + 1, lap, roundBreak };
    // Vor jeder Übung der kombinierte Pause-/Vorbereitungsblock, dann die Übung.
    // Erste Übung: kurzer Lead-in. Rundenwechsel: längere Pause. Sonst normal.
    let prepDuration = pauseSeconds;
    if (i === 0) prepDuration = Math.min(pauseSeconds, 10);
    else if (roundBreak) prepDuration = pauseSeconds * 2;
    steps.push({ phase: PHASE.PREPARE, duration: prepDuration, ...meta });
    steps.push({ phase: PHASE.WORK, duration: workSeconds, ...meta });
  }
  // Metadaten: Gesamtdauer, Schrittanzahl & Länge eines Durchlaufs (für Laps)
  steps.totalRounds = maxRounds;
  steps.lapLength = sequence.length;
  steps.totalLaps = Math.ceil(maxRounds / sequence.length);
  steps.totalSeconds = steps.reduce((s, st) => s + st.duration, 0);
  return steps;
}

// Reiner Intervall-Timer OHNE Übungsliste (Tabata, EMOM, AMRAP, freie Intervalle).
// Erzeugt eine zu WorkoutEngine kompatible Schrittliste mit generischen Labels
// (kein exId). `unit` ist das Wort pro Intervall (z. B. „Intervall“, „Minute“).
// `rest === 0` (z. B. EMOM/AMRAP) -> keine Pausenblöcke, nur ein kurzer Lead-in
// vor dem ersten Block.
export function buildIntervalSchedule({ work, rest, rounds, unit = 'Intervall' }) {
  const w = Math.max(1, Math.round(work) || 1);
  const r = Math.max(0, Math.round(rest) || 0);
  const n = Math.max(1, Math.round(rounds) || 1);
  const steps = [];
  for (let i = 0; i < n; i++) {
    const label = n > 1 ? `${unit} ${i + 1}` : unit;
    const meta = { exId: null, label, interval: i + 1, intervalsTotal: n, round: i + 1, lap: 1, rep: 1, repsTotal: 1 };
    if (r > 0) {
      // Vor jedem Intervall ein Pausenblock; die erste Pause als kurzer Lead-in.
      steps.push({ phase: PHASE.PREPARE, duration: i === 0 ? Math.min(r, 10) : r, ...meta });
    } else if (i === 0) {
      // Ohne Pause trotzdem ein kurzer Lead-in (Countdown) vor dem ersten Block.
      steps.push({ phase: PHASE.PREPARE, duration: 5, ...meta });
    }
    steps.push({ phase: PHASE.WORK, duration: w, ...meta });
  }
  steps.interval = true;
  steps.unit = unit;
  steps.totalRounds = n;
  steps.lapLength = n;
  steps.totalLaps = 1;
  steps.totalSeconds = steps.reduce((s, st) => s + st.duration, 0);
  return steps;
}

export class WorkoutEngine {
  constructor(handlers = {}) {
    this.h = handlers; // { onTick, onPhase, onCountdown, onSecond, onFinish }
    this.steps = [];
    this.index = 0;
    this.running = false;
    this.paused = false;
    this._raf = null;
    this._phaseStart = 0;
    this._pausedAt = 0;
    this._lastSecond = -1;
    this._elapsedBefore = 0; // verstrichene Zeit vorheriger Schritte (ms)
  }

  load(steps) {
    this.steps = steps;
    this.index = 0;
    this._elapsedBefore = 0;
  }

  get current() {
    return this.steps[this.index] || null;
  }

  start() {
    if (!this.steps.length) return;
    this.running = true;
    this.paused = false;
    this.index = 0;
    this._elapsedBefore = 0;
    this._enterPhase();
    this._loop();
  }

  _enterPhase() {
    const step = this.current;
    this._phaseStart = performance.now();
    this._lastSecond = -1;
    if (step && this.h.onPhase) this.h.onPhase(step, this.index, this.steps);
  }

  _loop() {
    const tick = () => {
      if (!this.running) return;
      if (!this.paused) this._update();
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  _update() {
    const step = this.current;
    if (!step) return this._finish();
    const elapsedMs = performance.now() - this._phaseStart;
    const totalMs = step.duration * 1000;
    const remainingMs = Math.max(0, totalMs - elapsedMs);
    const secondsLeft = Math.ceil(remainingMs / 1000);

    if (this.h.onTick) {
      this.h.onTick({
        step,
        index: this.index,
        steps: this.steps,
        remainingMs,
        secondsLeft,
        sessionRemaining: this._sessionRemaining(remainingMs),
      });
    }

    if (secondsLeft !== this._lastSecond) {
      this._lastSecond = secondsLeft;
      if (secondsLeft > 0 && this.h.onSecond) {
        this.h.onSecond({ step, secondsLeft, duration: step.duration });
      }
    }

    if (remainingMs <= 0) this._advance();
  }

  _sessionRemaining(currentRemainingMs) {
    let rest = currentRemainingMs;
    for (let i = this.index + 1; i < this.steps.length; i++) rest += this.steps[i].duration * 1000;
    return rest;
  }

  _advance() {
    const finished = this.current;
    this._elapsedBefore += finished ? finished.duration * 1000 : 0;
    this.index += 1;
    if (this.index >= this.steps.length) return this._finish();
    this._enterPhase();
  }

  skip() {
    if (!this.running) return;
    this._advance();
  }

  pause() {
    if (!this.running || this.paused) return;
    this.paused = true;
    this._pausedAt = performance.now();
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    // Phasenstart um Pausendauer verschieben, damit nichts springt.
    this._phaseStart += performance.now() - this._pausedAt;
  }

  toggle() {
    this.paused ? this.resume() : this.pause();
  }

  stop() {
    this.running = false;
    this.paused = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  _finish() {
    this.stop();
    if (this.h.onFinish) this.h.onFinish();
  }
}
