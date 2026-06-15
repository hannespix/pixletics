// Workout-Engine: baut den Ablaufplan und steuert die Phasen-Zustandsmaschine.
// Phasen pro Übung: prepare (Countdown) -> work (Übung) -> rest (Pause)

export const PHASE = { PREPARE: 'prepare', WORK: 'work', REST: 'rest', DONE: 'done' };

// Baut die Schrittliste. Jede Übung wird zunächst `repeatsPerExercise`-mal
// hintereinander ausgeführt, danach folgt die nächste Übung. Diese Sequenz wird
// in Reihenfolge durchlaufen und so oft wiederholt, bis die Gesamtdauer
// (totalMinutes) erreicht ist.
export function buildSchedule(exerciseIds, config) {
  const { workSeconds, restSeconds, prepareSeconds, totalMinutes } = config;
  const repeats = Math.max(1, config.repeatsPerExercise || 1);
  const cycle = prepareSeconds + workSeconds + restSeconds;
  const totalSeconds = totalMinutes * 60;
  const maxRounds = Math.max(1, Math.floor(totalSeconds / cycle));
  const steps = [];
  if (!exerciseIds.length) return steps;

  // Jede Übung mit ihren Wiederholungen zu einer Sequenz aufblähen,
  // z. B. [A, A, B, B, …] bei 2 Wiederholungen pro Übung.
  const sequence = [];
  for (const exId of exerciseIds) {
    for (let r = 0; r < repeats; r++) sequence.push({ exId, rep: r + 1, repsTotal: repeats });
  }

  for (let i = 0; i < maxRounds; i++) {
    const item = sequence[i % sequence.length];
    const meta = { exId: item.exId, rep: item.rep, repsTotal: item.repsTotal, round: i + 1 };
    const isLast = i === maxRounds - 1;
    steps.push({ phase: PHASE.PREPARE, duration: prepareSeconds, ...meta });
    steps.push({ phase: PHASE.WORK, duration: workSeconds, ...meta });
    // Letzte Pause weglassen – Programm endet mit der Übung.
    if (!isLast) steps.push({ phase: PHASE.REST, duration: restSeconds, ...meta });
  }
  // Metadaten: Gesamtdauer & Rundenanzahl
  steps.totalRounds = maxRounds;
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
