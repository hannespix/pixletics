// Gooey-Morph zwischen zwei Layern – angelehnt an den klassischen SVG-Gooey-
// Effekt (Blur + Alpha-Schwelle) plus organisches Warpen (feTurbulence +
// feDisplacementMap), sodass sich die Buchstaben „flüssig“ verformen, während
// sie ineinander zerfließen. Unterstützt Einzel-Morph und Endlos-Ping-Pong.

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class GooeyMorph {
  constructor(opts) {
    const {
      stage, layerA, layerB, blur, matrix, disp, filterId,
      maxBlur = 28, gooStd = 14,
      threshBase = 20, threshAmp = 35, offBase = -9, offAmp = -12,
      dispBase = 0, dispAmp = 9, keepFilter = false,
    } = opts;
    Object.assign(this, {
      stage, a: layerA, b: layerB, blur, matrix, disp, filterId,
      maxBlur, gooStd, threshBase, threshAmp, offBase, offAmp,
      dispBase, dispAmp, keepFilter,
    });
    this.raf = null;
    this.state = 'a'; // welcher Layer gerade „fest“ sichtbar ist
    this.looping = false;
    this._t = null;
    this._setStatic(this.a, this.b);
  }

  _applyFilter(on) {
    this.stage.style.filter = on ? `url(#${this.filterId})` : 'none';
  }

  _setStatic(shown, hidden) {
    shown.style.opacity = 1;
    shown.style.filter = 'none';
    hidden.style.opacity = 0;
    hidden.style.filter = 'none';
    if (this.keepFilter) {
      // Filter bleibt aktiv → dezentes Dauer-Warpen (Turbulenz läuft per SMIL).
      this.blur?.setAttribute('stdDeviation', '0');
      this.disp?.setAttribute('scale', String(this.dispBase));
      this._applyFilter(true);
    } else {
      this._applyFilter(false);
    }
  }

  // Morpht vom aktuellen Zustand in den jeweils anderen.
  morph(duration = 2000) {
    const from = this.state === 'a' ? this.a : this.b;
    const to = this.state === 'a' ? this.b : this.a;
    return new Promise((resolve) => {
      const t0 = performance.now();
      this._applyFilter(true);
      const frame = (now) => {
        const raw = Math.min(1, (now - t0) / duration);
        const t = easeInOutCubic(raw);
        const peak = Math.sin(t * Math.PI); // 0 → 1 → 0

        // Kreuzblende mit hohem Überlapp, damit die „Masse“ sichtbar bleibt.
        from.style.opacity = Math.max(0, 1 - t * t * 1.2);
        from.style.filter = `blur(${(t * this.maxBlur).toFixed(1)}px)`;
        to.style.opacity = Math.max(0, 1 - (1 - t) * (1 - t) * 1.2);
        to.style.filter = `blur(${((1 - t) * this.maxBlur).toFixed(1)}px)`;

        // Gooey-Filter (Blur + Alpha-Schwelle) zur Spitze hin hochfahren.
        this.blur?.setAttribute('stdDeviation', (peak * this.gooStd).toFixed(1));
        const thresh = this.threshBase + peak * this.threshAmp;
        const offset = this.offBase + peak * this.offAmp;
        this.matrix?.setAttribute(
          'values',
          `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${thresh.toFixed(0)} ${offset.toFixed(0)}`,
        );
        // Verformung (Displacement) ebenfalls zur Spitze hin verstärken.
        this.disp?.setAttribute('scale', (this.dispBase + peak * this.dispAmp).toFixed(1));

        if (raw < 1) {
          this.raf = requestAnimationFrame(frame);
        } else {
          this.state = this.state === 'a' ? 'b' : 'a';
          this._setStatic(to, from);
          resolve();
        }
      };
      this.raf = requestAnimationFrame(frame);
    });
  }

  _wait(ms) {
    return new Promise((r) => {
      this._t = setTimeout(() => { this._t = null; r(); }, ms);
    });
  }

  // Endlos hin und her morphen, bis stopLoop() gerufen wird.
  async loop({ duration = 2000, dwellA = 2200, dwellB = 2000 } = {}) {
    if (this.looping) return;
    this.looping = true;
    while (this.looping) {
      await this._wait(this.state === 'a' ? dwellA : dwellB);
      if (!this.looping) break;
      await this.morph(duration);
    }
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  stopLoop() {
    this.looping = false;
    if (this._t) { clearTimeout(this._t); this._t = null; }
    this.stop();
    // Auf aktuell sichtbaren Zustand „einfrieren“.
    if (this.state === 'a') this._setStatic(this.a, this.b);
    else this._setStatic(this.b, this.a);
  }
}
