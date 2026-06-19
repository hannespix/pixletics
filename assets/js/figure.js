// Schematische 2D-Gliederpuppe ("Holzpuppe"), die Übungen vormacht.
// Kein 3D, keine Bibliothek, voll offline. Seitenansicht (Blick nach rechts).
//
// Ansatz: der/die KONTAKTPUNKT(e) am Boden sind fix verankert; der restliche
// Körper wird über 2-Knochen-Inverse-Kinematik (IK) anatomisch korrekt
// nachgezogen. So bleiben Füße (Kniebeuge) bzw. Hände+Zehen (Liegestütz) am
// Boden stehen, während sich der Körper hebt/senkt.

const SVGNS = 'http://www.w3.org/2000/svg';
const RAD = Math.PI / 180;
const dir = (deg) => [Math.sin(deg * RAD), -Math.cos(deg * RAD)];
const addv = (p, v, len) => [p[0] + v[0] * len, p[1] + v[1] * len];
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// 2-Knochen-IK: Gelenk J finden, sodass |R-J|=l1 und |J-T|=l2.
// bend = +1/-1 wählt die Beugerichtung (Knie/Ellbogen vor oder zurück).
function ik2(R, T, l1, l2, bend) {
  let dx = T[0] - R[0], dy = T[1] - R[1];
  const L = Math.hypot(dx, dy) || 0.0001;
  const ux = dx / L, uy = dy / L;
  const d = Math.min(Math.max(L, Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const a = (d * d + l1 * l1 - l2 * l2) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  // Senkrechte zur Richtung R->T
  const nx = -uy, ny = ux;
  return [R[0] + ux * a + nx * h * bend, R[1] + uy * a + ny * h * bend];
}

const BONE = { torso: 27, neck: 5, head: 8, upArm: 15, foreArm: 14, thigh: 19, shin: 18, foot: 7 };
const CX = 50, GROUND_Y = 104, DEPTH = 2.6;

export class FigureAnimator {
  constructor(svg) {
    this.svg = svg;
    this.raf = null; this.anim = null; this.t0 = 0;
    this._build();
    this.setPoints(EXERCISES.squats.solve(0));
  }

  _line(cls, w, opacity = 1) {
    const l = document.createElementNS(SVGNS, 'line');
    l.setAttribute('stroke-linecap', 'round'); l.setAttribute('stroke-width', w); l.setAttribute('class', cls);
    if (opacity !== 1) l.setAttribute('opacity', opacity);
    this.svg.appendChild(l); return l;
  }
  _dot(r, cls) {
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('r', r); c.setAttribute('class', cls); this.svg.appendChild(c); return c;
  }

  _build() {
    this.svg.setAttribute('viewBox', '0 0 100 120');
    this.thighF = this._line('fig-limb fig-far', 7, 0.45);
    this.shinF = this._line('fig-limb fig-far', 7, 0.45);
    this.footF = this._line('fig-limb fig-far', 6, 0.45);
    this.upArmF = this._line('fig-limb fig-far', 6, 0.45);
    this.foreArmF = this._line('fig-limb fig-far', 6, 0.45);
    this.torso = this._line('fig-torso', 12);
    this.thighN = this._line('fig-limb', 7.5);
    this.shinN = this._line('fig-limb', 7.5);
    this.footN = this._line('fig-limb', 6.5);
    this.upArmN = this._line('fig-limb', 6.5);
    this.foreArmN = this._line('fig-limb', 6.5);
    this.jKneeN = this._dot(3.7, 'fig-joint');
    this.jAnkN = this._dot(3.1, 'fig-joint');
    this.jElbowN = this._dot(3.3, 'fig-joint');
    this.jHip = this._dot(3.9, 'fig-joint');
    this.jShoulder = this._dot(3.9, 'fig-joint');
    this.jHand = this._dot(3.4, 'fig-joint');
    this.cHead = this._dot(BONE.head, 'fig-head');
  }

  setPoints(P) {
    const set = (l, a, b) => { l.setAttribute('x1', a[0].toFixed(2)); l.setAttribute('y1', a[1].toFixed(2)); l.setAttribute('x2', b[0].toFixed(2)); l.setAttribute('y2', b[1].toFixed(2)); };
    set(this.torso, P.hip, P.shoulder);
    set(this.thighF, P.hipF, P.kneeF); set(this.shinF, P.kneeF, P.ankF); set(this.footF, P.ankF, P.toeF);
    set(this.upArmF, P.sF, P.elbowF); set(this.foreArmF, P.elbowF, P.handF);
    set(this.thighN, P.hipN, P.kneeN); set(this.shinN, P.kneeN, P.ankN); set(this.footN, P.ankN, P.toeN);
    set(this.upArmN, P.sN, P.elbowN); set(this.foreArmN, P.elbowN, P.handN);
    const dot = (c, p) => { c.setAttribute('cx', p[0].toFixed(2)); c.setAttribute('cy', p[1].toFixed(2)); };
    dot(this.jKneeN, P.kneeN); dot(this.jAnkN, P.ankN); dot(this.jElbowN, P.elbowN);
    this.jHip.setAttribute('cx', P.hip[0]); this.jHip.setAttribute('cy', P.hip[1]);
    this.jShoulder.setAttribute('cx', P.shoulder[0]); this.jShoulder.setAttribute('cy', P.shoulder[1]);
    this.jHand.setAttribute('cx', P.handN[0].toFixed(2)); this.jHand.setAttribute('cy', P.handN[1].toFixed(2));
    this.cHead.setAttribute('cx', P.head[0].toFixed(2)); this.cHead.setAttribute('cy', P.head[1].toFixed(2));
  }

  play(anim) {
    const a = typeof anim === 'string' ? EXERCISES[anim] : anim;
    if (!a) { this.stop(); return false; }
    this.svg.setAttribute('viewBox', viewBoxFor(a));
    this.anim = a; this.t0 = performance.now();
    if (!this.raf) this._loop();
    return true;
  }

  // Einzelbild ohne Animation (z. B. als Icon in der Übungs-Übersicht).
  still(key, t = 0.42) {
    const a = EXERCISES[key];
    if (!a) return false;
    this.stop();
    this.svg.setAttribute('viewBox', viewBoxFor(a));
    this.setPoints(a.solve(t));
    return true;
  }

  _loop() {
    const tick = (now) => {
      if (!this.anim) { this.raf = null; return; }
      const dur = this.anim.duration || 1500;
      const u = ((now - this.t0) % dur) / dur;
      const tri = u < 0.5 ? u * 2 : (1 - u) * 2; // 0 -> 1 -> 0 (Ping-Pong)
      this.setPoints(this.anim.solve(easeInOut(tri)));
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; this.anim = null; }
}

// Hilfen für die Solver
function depth(p, sign) { return [p[0] + DEPTH * sign, p[1]]; }
// Komplettes Skelett aus Schlüsselpunkten ableiten (mit Tiefe nah/fern).
function rig({ hip, shoulder, ankle, hand, toe, kneeBend, elbowBend, headAng, footAng, armFK }) {
  const hipN = depth(hip, 1), hipF = depth(hip, -1);
  const sN = depth(shoulder, 1), sF = depth(shoulder, -1);
  const ankN = depth(ankle, 1), ankF = depth(ankle, -1);
  const kneeN = ik2(hipN, ankN, BONE.thigh, BONE.shin, kneeBend);
  const kneeF = ik2(hipF, ankF, BONE.thigh, BONE.shin, kneeBend);
  const toeN = toe ? depth(toe, 1) : addv(ankN, dir(footAng), BONE.foot);
  const toeF = toe ? depth(toe, -1) : addv(ankF, dir(footAng), BONE.foot);
  let elbowN, handN, elbowF, handF;
  if (armFK != null) { // freie Arme per Vorwärtskinematik (Winkel)
    elbowN = addv(sN, dir(armFK), BONE.upArm); handN = addv(elbowN, dir(armFK), BONE.foreArm);
    elbowF = addv(sF, dir(armFK), BONE.upArm); handF = addv(elbowF, dir(armFK), BONE.foreArm);
  } else { // gestützte Arme: Hand am Boden verankert -> IK
    const hN = depth(hand, 1), hF = depth(hand, -1);
    elbowN = ik2(sN, hN, BONE.upArm, BONE.foreArm, elbowBend); handN = hN;
    elbowF = ik2(sF, hF, BONE.upArm, BONE.foreArm, elbowBend); handF = hF;
  }
  const neck = addv(shoulder, dir(headAng), BONE.neck);
  const head = addv(neck, dir(headAng), BONE.head);
  return { hip, shoulder, head, hipN, hipF, sN, sF, kneeN, ankN, toeN, kneeF, ankF, toeF, elbowN, handN, elbowF, handF };
}

// viewBox je Übung aus der echten Bounding-Box über die ganze Animation
// berechnen (mit Rand) -> Figur immer zentriert, nie abgeschnitten. Wird gecacht.
function computeViewBox(a) {
  let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
  for (let i = 0; i <= 12; i++) {
    const P = a.solve(i / 12);
    for (const k in P) {
      const p = P[k];
      if (Array.isArray(p) && p.length === 2) {
        if (p[0] < minx) minx = p[0]; if (p[0] > maxx) maxx = p[0];
        if (p[1] < miny) miny = p[1]; if (p[1] > maxy) maxy = p[1];
      }
    }
  }
  const pad = BONE.head + 4; // Kopfradius + Strichbreite abdecken
  return `${(minx - pad).toFixed(1)} ${(miny - pad).toFixed(1)} ${(maxx - minx + 2 * pad).toFixed(1)} ${(maxy - miny + 2 * pad).toFixed(1)}`;
}
function viewBoxFor(a) { return a._vb || (a._vb = computeViewBox(a)); }

export const EXERCISES = {
  // Kniebeuge: Füße fix am Boden. Hüfte senkt sich + leicht zurück; Knie per IK
  // nach vorne gebeugt; Oberkörper lehnt vor; Arme zum Ausgleich nach vorne.
  squats: {
    duration: 1700, viewBox: '20 14 60 96',
    solve(t) {
      const ankle = [CX + 1, GROUND_Y - 1];           // Knöchel fix am Boden
      const hip = [lerp(CX + 1, CX - 3, t), lerp(GROUND_Y - 36, GROUND_Y - 18, t)];
      const lean = lerp(8, 34, t);                     // Oberkörper-Neigung
      const shoulder = addv(hip, dir(lean), BONE.torso);
      const armFK = lerp(95, 88, t);                   // Arme nach vorne
      return rig({ hip, shoulder, ankle, kneeBend: -1, headAng: lean * 0.5, footAng: 92, armFK });
    },
  },
  // Liegestütz: Hände + Zehen fix am Boden. Schulter senkt sich; Ellbogen per IK
  // gebeugt; Körper bleibt als Brett gestreckt (Hüfte auf der Linie Schulter–Knöchel).
  pushups: {
    duration: 1500, viewBox: '8 60 86 50',
    solve(t) {
      const toe = [16, GROUND_Y - 1];                  // Zehen fix am Boden
      const ankle = [16, GROUND_Y - 7];                // Knöchel direkt über den Zehen
      const hand = [76, GROUND_Y - 1];                 // Hände fix am Boden (unter der Schulter)
      const bodyLen = BONE.thigh + BONE.shin + BONE.torso; // Körper = gestrecktes Brett
      const bodyAng = lerp(69, 79, t);                 // pivotiert auf den Zehen: oben -> unten
      const shoulder = addv(ankle, dir(bodyAng), bodyLen);
      const hip = addv(ankle, dir(bodyAng), BONE.thigh + BONE.shin); // Hüfte auf der Brett-Linie
      return rig({ hip, shoulder, ankle, hand, toe, kneeBend: 1, elbowBend: 1, headAng: 98 });
    },
  },
};
