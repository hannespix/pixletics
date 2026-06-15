// Gooey-Morph zwischen zwei Layern – angelehnt an den klassischen SVG-Gooey-
// Effekt: Während des Übergangs werden beide Layer geblurrt und über den Filter
// (Blur + Alpha-Schwelle) zu einer „flüssigen“ Masse verschmolzen, die sich
// zur Zielform wieder verfestigt.

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class GooeyMorph {
  constructor({ stage, layerA, layerB, blur, matrix, filterId, maxBlur = 24, gooStd = 13 }) {
    this.stage = stage;
    this.a = layerA;
    this.b = layerB;
    this.blur = blur;
    this.matrix = matrix;
    this.filterId = filterId;
    this.maxBlur = maxBlur;
    this.gooStd = gooStd;
    this.raf = null;
    this.state = 'a'; // welcher Layer gerade „fest“ sichtbar ist
    this._setStatic(this.a, this.b);
  }

  _setStatic(shown, hidden) {
    shown.style.opacity = 1;
    shown.style.filter = 'none';
    hidden.style.opacity = 0;
    hidden.style.filter = 'none';
    this.stage.style.filter = 'none';
  }

  // Morpht vom aktuellen Zustand in den jeweils anderen.
  morph(duration = 1500) {
    const from = this.state === 'a' ? this.a : this.b;
    const to = this.state === 'a' ? this.b : this.a;
    return new Promise((resolve) => {
      const t0 = performance.now();
      this.stage.style.filter = `url(#${this.filterId})`;
      const frame = (now) => {
        const raw = Math.min(1, (now - t0) / duration);
        const t = easeInOutCubic(raw);
        const peak = Math.sin(t * Math.PI); // 0 → 1 → 0

        // Kreuzblende mit hohem Überlapp, damit die „Masse“ sichtbar bleibt.
        from.style.opacity = Math.max(0, 1 - t * t * 1.2);
        from.style.filter = `blur(${(t * this.maxBlur).toFixed(1)}px)`;
        to.style.opacity = Math.max(0, 1 - (1 - t) * (1 - t) * 1.2);
        to.style.filter = `blur(${((1 - t) * this.maxBlur).toFixed(1)}px)`;

        // Gooey-Filter: Blur + Alpha-Schwelle zur Spitze hin hochfahren.
        const std = peak * this.gooStd;
        const thresh = 18 + peak * 32;
        const offset = -8 - peak * 11;
        this.blur.setAttribute('stdDeviation', std.toFixed(1));
        this.matrix.setAttribute(
          'values',
          `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${thresh.toFixed(0)} ${offset.toFixed(0)}`,
        );

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

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    // Auf den aktuell sichtbaren Zustand zurücksetzen.
    if (this.state === 'a') this._setStatic(this.a, this.b);
    else this._setStatic(this.b, this.a);
  }
}
