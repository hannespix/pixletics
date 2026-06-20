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

// Dauer des weichen Übergangs zwischen zwei Posen.
const TRANS_MS = 650;
// Konstante Bühnen-Größe: jede Übung wird in einem quadratischen Fenster fester
// Kantenlänge zentriert -> gleicher Figur-Maßstab überall (kein Wachsen/Schrumpfen),
// aber jede Übung sitzt mittig in der Bubble (das "Kamera"-Fenster wandert mit).
const STAGE_S = 82;
const parseVB = (s) => s.split(' ').map(Number);
const lerpVB = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
// Zwei Posen (Punkt-Wörterbücher gleicher Schlüssel) Punkt für Punkt mischen.
function lerpPose(A, B, t) {
  const o = {};
  for (const k in B) {
    const a = A[k], b = B[k];
    const pt = Array.isArray(a) && Array.isArray(b) && a.length === 2 && typeof a[0] === 'number';
    o[k] = pt ? mix(a, b, t) : b; // Punkte mischen; props/sonstiges -> Ziel übernehmen
  }
  return o;
}

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
    this.raf = null; this.anim = null; this.t0 = 0; this.trans = null; this._lastP = null; this.speedFactor = 1;
    this._build();
    this.setPoints(EXERCISES.squats.solve(0));
    this._lastP = null; // erster play() soll nicht aus dieser Default-Pose morphen
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
    this.svg.setAttribute('viewBox', `${CX - STAGE_S / 2} 6 ${STAGE_S} ${STAGE_S}`);
    // Requisiten-Ebene HINTER der Figur (Box, Bank, Wand, Sprossen, Ringe …).
    this.gBack = document.createElementNS(SVGNS, 'g'); this.svg.appendChild(this.gBack);
    // Zeichenreihenfolge hinten->vorne: ferne Glieder, Rumpf, KOPF, dann nahe
    // Glieder. So liegt der Kopf hinter dem nahen Arm (Superman/Arme über Kopf:
    // Arm vor dem Kopf) und vor den fernen Gliedern.
    this.thighF = this._line('fig-limb fig-far', 7, 0.45);
    this.shinF = this._line('fig-limb fig-far', 7, 0.45);
    this.footF = this._line('fig-limb fig-far', 6, 0.45);
    this.upArmF = this._line('fig-limb fig-far', 6, 0.45);
    this.foreArmF = this._line('fig-limb fig-far', 6, 0.45);
    this.torso = this._line('fig-torso', 12);
    this.cHead = this._dot(BONE.head, 'fig-head');
    this.thighN = this._line('fig-limb', 7.5);
    this.shinN = this._line('fig-limb', 7.5);
    this.footN = this._line('fig-limb', 6.5);
    this.upArmN = this._line('fig-limb', 6.5);
    this.foreArmN = this._line('fig-limb', 6.5);
    this.jHip = this._dot(3.2, 'fig-joint');
    this.jShoulder = this._dot(3.2, 'fig-joint');
    this.jHand = this._dot(3.4, 'fig-joint');
    // Requisiten-Ebene VOR der Figur (gehaltene Geräte: Hantel, Ball, Stange …).
    this.gFront = document.createElementNS(SVGNS, 'g'); this.svg.appendChild(this.gFront);
  }

  // Geräte/Requisiten zeichnen (pr.front -> vor der Figur, sonst dahinter).
  // type: 'rect'|'circle'|'line'; optional fill/stroke/sw; kettlebell: 'kb'.
  _drawProps(list) {
    this.gBack.replaceChildren(); this.gFront.replaceChildren();
    if (!list) return;
    for (const pr of list) {
      const g = pr.front ? this.gFront : this.gBack;
      const add = (tag, attrs) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); g.appendChild(e); return e; };
      const fill = pr.fill || '#8a929e', stroke = pr.stroke || fill, sw = pr.sw || 4;
      if (pr.type === 'rect') add('rect', { x: pr.x, y: pr.y, width: pr.w, height: pr.h, rx: pr.rx || 1.5, fill });
      else if (pr.type === 'circle') add('circle', { cx: pr.x, cy: pr.y, r: pr.r, fill: pr.stroke ? (pr.fill || 'none') : fill, ...(pr.stroke ? { stroke, 'stroke-width': sw } : {}) });
      else if (pr.type === 'ellipse') add('ellipse', { cx: pr.x, cy: pr.y, rx: pr.rx, ry: pr.ry, fill: 'none', stroke, 'stroke-width': pr.sw || 1.5 });
      else if (pr.type === 'line') add('line', { x1: pr.x1, y1: pr.y1, x2: pr.x2, y2: pr.y2, stroke, 'stroke-width': sw, 'stroke-linecap': 'round', fill: 'none' });
      else if (pr.type === 'kb') { // Kettlebell: Kugel + Bügel
        add('path', { d: `M ${pr.x - pr.r * 0.7} ${pr.y - pr.r * 0.4} q ${pr.r * 0.7} ${-pr.r} ${pr.r * 1.4} 0`, fill: 'none', stroke: pr.stroke || '#3a3f47', 'stroke-width': 2.4 });
        add('circle', { cx: pr.x, cy: pr.y, r: pr.r, fill: pr.fill || '#3a3f47' });
      }
    }
  }

  setPoints(P) {
    const set = (l, a, b) => { l.setAttribute('x1', a[0].toFixed(2)); l.setAttribute('y1', a[1].toFixed(2)); l.setAttribute('x2', b[0].toFixed(2)); l.setAttribute('y2', b[1].toFixed(2)); };
    this._drawProps(P.props);
    set(this.torso, P.hip, P.shoulder);
    set(this.thighF, P.hipF, P.kneeF); set(this.shinF, P.kneeF, P.ankF); set(this.footF, P.ankF, P.toeF);
    set(this.upArmF, P.sF, P.elbowF); set(this.foreArmF, P.elbowF, P.handF);
    set(this.thighN, P.hipN, P.kneeN); set(this.shinN, P.kneeN, P.ankN); set(this.footN, P.ankN, P.toeN);
    set(this.upArmN, P.sN, P.elbowN); set(this.foreArmN, P.elbowN, P.handN);
    this.jHip.setAttribute('cx', P.hip[0]); this.jHip.setAttribute('cy', P.hip[1]);
    this.jShoulder.setAttribute('cx', P.shoulder[0]); this.jShoulder.setAttribute('cy', P.shoulder[1]);
    this.jHand.setAttribute('cx', P.handN[0].toFixed(2)); this.jHand.setAttribute('cy', P.handN[1].toFixed(2));
    this.cHead.setAttribute('cx', P.head[0].toFixed(2)); this.cHead.setAttribute('cy', P.head[1].toFixed(2));
    this._lastP = P;
  }

  play(anim, opts = {}) {
    const a = typeof anim === 'string' ? EXERCISES[anim] : anim;
    if (!a) { this.stop(); return false; }
    const speed = opts.speed ?? 1;
    const toVB = stageViewBox(a); // pro Übung zentriert, konstante Größe
    // Gleiche Animation, läuft schon -> nur das Tempo ändern (Phase beibehalten),
    // damit die langsame Pausen-Vorschau nahtlos ins volle Übungstempo übergeht.
    if (a === this.anim && this.raf && !this.trans) {
      const base = a.duration || 1500, now = performance.now();
      const cur = base / this.speedFactor;
      const u = ((now - this.t0) % cur) / cur;
      this.speedFactor = speed;
      this.t0 = now - u * (base / speed);
      return true;
    }
    this.anim = a; this.speedFactor = speed;
    if (this._lastP) {
      // Sanfter Übergang: aus der aktuellen Pose in die neue morphen; die Bühne
      // wandert dabei mit (nur Verschiebung, gleiche Größe -> kein Skalensprung).
      this.trans = {
        fromP: this._lastP, toP: a.solve(0),
        fromVB: parseVB(this.svg.getAttribute('viewBox')), toVB: parseVB(toVB),
        start: performance.now(), dur: TRANS_MS,
      };
    } else {
      this.trans = null; this.t0 = performance.now();
      this.svg.setAttribute('viewBox', toVB);
    }
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
      if (this.trans) { // laufender Übergang: Pose morphen + Bühne mitführen
        const k = Math.min(1, (now - this.trans.start) / this.trans.dur);
        const e = easeInOut(k);
        this.setPoints(lerpPose(this.trans.fromP, this.trans.toP, e));
        this.svg.setAttribute('viewBox', lerpVB(this.trans.fromVB, this.trans.toVB, e).join(' '));
        if (k >= 1) { this.trans = null; this.t0 = now; }
        this.raf = requestAnimationFrame(tick);
        return;
      }
      if (!this.anim) { this.raf = null; return; }
      const dur = (this.anim.duration || 1500) / (this.speedFactor || 1);
      const u = ((now - this.t0) % dur) / dur;
      // 'cycle': durchlaufende Schleife (z. B. Lauf-/Marschbewegung, t=0 == t=1);
      // sonst Ping-Pong (0 -> 1 -> 0) mit Ease für Hin-/Her-Bewegungen.
      const tt = this.anim.loop === 'cycle' ? u : easeInOut(u < 0.5 ? u * 2 : (1 - u) * 2);
      this.setPoints(this.anim.solve(tt));
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; this.anim = null; this.trans = null; this._lastP = null; this.speedFactor = 1; }
}

// Hilfen für die Solver
function depth(p, sign) { return [p[0] + DEPTH * sign, p[1]]; }
// Komplettes Skelett aus Schlüsselpunkten ableiten (mit Tiefe nah/fern).
// Schlüsselpunkte -> komplettes Skelett (Tiefe nah/fern). Beine und Arme können
// pro Seite unabhängig gesetzt werden (Suffix N = nah/vorne, F = fern/hinten),
// sonst gelten die symmetrischen Werte. So lassen sich Schrittstellungen
// (Ausfallschritt, Knieheben, Mountain Climbers …) anatomisch korrekt bauen.
function rig(o) {
  const { hip, shoulder } = o;
  const headAng = o.headAng ?? 0;
  // Ein Bein (sign: +1 = nah/vorne, -1 = fern/hinten).
  // FK (Oberschenkel-/Schienbein-Winkel) für angehobene Beine (Knieheben,
  // Mountain Climbers, Beinheben …) ODER IK zum fixen Fuß am Boden.
  const leg = (sign) => {
    const hipP = depth(hip, sign);
    const footAng = (sign > 0 ? o.footAngN : o.footAngF) ?? o.footAng;
    const thighAng = (sign > 0 ? o.thighAngN : o.thighAngF) ?? o.thighAng;
    if (thighAng != null) {
      const shinAng = (sign > 0 ? o.shinAngN : o.shinAngF) ?? o.shinAng ?? thighAng;
      const knee = addv(hipP, dir(thighAng), BONE.thigh);
      const ank = addv(knee, dir(shinAng), BONE.shin);
      const toe = addv(ank, dir(footAng ?? shinAng), BONE.foot);
      return [hipP, knee, ank, toe];
    }
    const ankle = (sign > 0 ? o.ankleN : o.ankleF) || o.ankle;
    const toeP = (sign > 0 ? o.toeN : o.toeF) || o.toe;
    const kneeBend = (sign > 0 ? o.kneeBendN : o.kneeBendF) ?? o.kneeBend;
    const ankP = depth(ankle, sign);
    const knee = ik2(hipP, ankP, BONE.thigh, BONE.shin, kneeBend);
    const toe = toeP ? depth(toeP, sign) : addv(ankP, dir(footAng), BONE.foot);
    return [hipP, knee, ankP, toe];
  };
  // Ein Arm: freie Winkel (FK) ODER Hand am Boden verankert (IK).
  const arm = (sign) => {
    const sP = depth(shoulder, sign);
    const up = (sign > 0 ? o.armUpN : o.armUpF) ?? o.armUp ?? o.armFK;
    if (up != null) {
      const fore = (sign > 0 ? o.armForeN : o.armForeF) ?? o.armFore ?? up;
      const elbow = addv(sP, dir(up), BONE.upArm);
      return [sP, elbow, addv(elbow, dir(fore), BONE.foreArm)];
    }
    const handP = depth((sign > 0 ? o.handN : o.handF) || o.hand, sign);
    return [sP, ik2(sP, handP, BONE.upArm, BONE.foreArm, o.elbowBend), handP];
  };
  const [hipN, kneeN, ankN, toeN] = leg(1);
  const [hipF, kneeF, ankF, toeF] = leg(-1);
  const [sN, elbowN, handN] = arm(1);
  const [sF, elbowF, handF] = arm(-1);
  const neck = addv(shoulder, dir(headAng), BONE.neck);
  const head = addv(neck, dir(headAng), BONE.head);
  return { hip, shoulder, head, hipN, hipF, sN, sF, kneeN, ankN, toeN, kneeF, ankF, toeF, elbowN, handN, elbowF, handF };
}

// Stehende Grundhaltung (Füße am Boden, Beine ~gerade) – Basis für Pausen-Idles.
function stand({ hipBob = 0, lean = 3, headAng = 2, armUp, armFore }) {
  const ankle = [CX, GROUND_Y - 1];
  const hip = [CX, GROUND_Y - 37 - hipBob];
  const shoulder = addv(hip, dir(lean), BONE.torso);
  return rig({ hip, shoulder, ankle, kneeBend: -1, footAng: 92, headAng, armUp, armFore });
}

// viewBox je Übung aus der echten Bounding-Box über die ganze Animation
// berechnen (mit Rand) -> Figur immer zentriert, nie abgeschnitten. Wird gecacht.
function computeViewBox(a) {
  let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
  for (let i = 0; i <= 12; i++) {
    const P = a.solve(i / 12);
    for (const k in P) {
      const p = P[k];
      if (Array.isArray(p) && p.length === 2 && typeof p[0] === 'number') {
        if (p[0] < minx) minx = p[0]; if (p[0] > maxx) maxx = p[0];
        if (p[1] < miny) miny = p[1]; if (p[1] > maxy) maxy = p[1];
      }
    }
  }
  const pad = BONE.head + 4; // Kopfradius + Strichbreite abdecken
  return `${(minx - pad).toFixed(1)} ${(miny - pad).toFixed(1)} ${(maxx - minx + 2 * pad).toFixed(1)} ${(maxy - miny + 2 * pad).toFixed(1)}`;
}
function viewBoxFor(a) { return a._vb || (a._vb = computeViewBox(a)); }

// Quadratisches Bühnen-Fenster, zentriert auf die FIGUR (nicht auf die Geräte).
// Größe = mindestens STAGE_S, sonst Figur-Bounding-Box + Rand; gehaltene Geräte
// nahe der Hände (Ball/Hantel/Stange/Kettlebell) werden mit eingefasst, große
// Umgebungs-Geräte (Wand, Box, Bank, Sprossenwand, Seil) dürfen an den Rand
// laufen, damit die Figur immer groß und mittig bleibt.
function stageViewBox(a) {
  if (a._svb) return a._svb;
  let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
  const ext = (x, y, r = 0) => { minx = Math.min(minx, x - r); maxx = Math.max(maxx, x + r); miny = Math.min(miny, y - r); maxy = Math.max(maxy, y + r); };
  for (let i = 0; i <= 16; i++) {
    const P = a.solve(i / 16);
    for (const k in P) {
      const p = P[k]; if (!Array.isArray(p) || typeof p[0] !== 'number') continue; // P.props ist ein Array -> überspringen
      ext(p[0], p[1], k === 'head' ? BONE.head : 3); // Kopfradius bzw. Strich/Gelenk
    }
    for (const pr of (P.props || [])) { // nur kleine, gehaltene Geräte mit einfassen
      if (pr.type === 'kb' || (pr.type === 'circle' && pr.r <= 8)) ext(pr.x, pr.y, pr.r + 2);
    }
  }
  const cx = (minx + maxx) / 2, cy = (miny + maxy) / 2;
  const S = Math.max(STAGE_S, maxx - minx, maxy - miny);
  return (a._svb = `${(cx - S / 2).toFixed(1)} ${(cy - S / 2).toFixed(1)} ${S} ${S}`);
}

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
      const toe = [21, GROUND_Y - 1];                  // Zehen fix am Boden, nach vorne (auf dem Ballen)
      const ankle = [15, GROUND_Y - 7];                // Knöchel hinter/über den Zehen -> Fuß zeigt nach vorne
      const hand = [76, GROUND_Y - 1];                 // Hände fix am Boden (unter der Schulter)
      const bodyLen = BONE.thigh + BONE.shin + BONE.torso; // Körper = gestrecktes Brett
      const bodyAng = lerp(69, 79, t);                 // pivotiert auf den Zehen: oben -> unten
      const shoulder = addv(ankle, dir(bodyAng), bodyLen);
      const hip = addv(ankle, dir(bodyAng), BONE.thigh + BONE.shin); // Hüfte auf der Brett-Linie
      return rig({ hip, shoulder, ankle, hand, toe, kneeBend: 1, elbowBend: 1, headAng: 98 });
    },
  },

  // Ausfallschritte „auf der Stelle": abwechselnd vor- und zurücktreten. Ein Fuß
  // tritt nach vorne (flach), der andere bleibt hinten auf dem Ballen, die Hüfte
  // senkt sich -> vorderes Knie über dem Knöchel, hinteres Knie zum Boden; dann
  // zurück durch den Stand und auf die andere Seite. Hände locker in der Hüfte.
  lunges: {
    duration: 2600, loop: 'cycle',
    solve(t) {
      const s = Math.sin(2 * Math.PI * t);             // +: nahes Bein vorn, -: fernes Bein vorn
      const amt = Math.abs(s);                          // 0 Stand .. 1 tiefer Ausfallschritt
      const nearBack = Math.max(0, -s), farBack = Math.max(0, s);
      const hip = [CX, GROUND_Y - 37 + 13 * amt];       // senkt sich beim Ausfallschritt (tiefer)
      const lean = 4 + 5 * amt;
      const shoulder = addv(hip, dir(lean), BONE.torso);
      return rig({
        hip, shoulder, headAng: lean,
        ankleN: [CX + 22 * s, GROUND_Y - 1 - 7 * nearBack], kneeBendN: -1, footAngN: lerp(90, 150, nearBack),
        ankleF: [CX - 22 * s, GROUND_Y - 1 - 7 * farBack], kneeBendF: -1, footAngF: lerp(90, 150, farBack),
        armUp: 205, armFore: 120,                        // Hände locker in die Hüften
      });
    },
  },

  // Knieheben: zügiges Marschieren auf der Stelle mit hohen Knien. Immer ein Bein
  // gestreckt am Boden (Kontaktpunkt), das andere zieht das Knie auf Hüfthöhe
  // (Schienbein hängt, Zehen nach unten). Die beiden Beine heben in getrennten
  // Halbphasen -> nie schwebt die Figur. Arme pumpen gegengleich (gleichseitiger
  // Arm nach hinten, wenn das Knie hochkommt), Ellbogen gebeugt nach hinten.
  highknees: {
    duration: 900, loop: 'cycle',
    solve(t) {
      const hip = [CX, GROUND_Y - 37];
      const lean = 6;
      const shoulder = addv(hip, dir(lean), BONE.torso);
      const s = Math.sin(2 * Math.PI * t);
      const nearLift = Math.max(0, s);            // 1. Hälfte: nahes Knie hoch
      const farLift = Math.max(0, -s);            // 2. Hälfte: fernes Knie hoch
      const thigh = (l) => lerp(180, 74, l);       // gestreckt unten -> Knie auf Hüfthöhe
      const shin = (l) => lerp(180, 150, l);       // Schienbein hängt beim Heben
      const foot = (l) => lerp(95, 165, l);        // Fuß flach -> Zehen nach unten
      const upN = 182 + 35 * s, upF = 182 - 35 * s; // Armpump gegengleich
      return rig({
        hip, shoulder, headAng: lean,
        thighAngN: thigh(nearLift), shinAngN: shin(nearLift), footAngN: foot(nearLift),
        thighAngF: thigh(farLift), shinAngF: shin(farLift), footAngF: foot(farLift),
        armUpN: upN, armForeN: upN - 50,
        armUpF: upF, armForeF: upF - 50,
      });
    },
  },

  // Mountain Climbers: Stütz auf den Händen (fix), Hüfte leicht angehoben. Die
  // Knie ziehen abwechselnd nach vorne zur Brust und strecken zurück zum Boden.
  // Beine per Vorwärtskinematik (Winkel) -> kein Umklappen der Knie; jedes Bein
  // treibt in seiner Halbphase, das andere bleibt hinten gestreckt am Boden.
  climbers: {
    duration: 820, loop: 'cycle',
    solve(t) {
      const hand = [72, GROUND_Y - 1];                 // Hände fix am Boden
      const shoulder = [64, GROUND_Y - 26];            // Schultern über den Händen
      const hip = [44, GROUND_Y - 42];                 // Hüfte angehoben (Platz für die Beine)
      const sgn = Math.sin(2 * Math.PI * t);
      const nD = Math.max(0, sgn), fD = Math.max(0, -sgn); // near treibt 1. Hälfte, far 2.
      const thigh = (d) => lerp(208, 116, d);          // hinten unten -> Knie nach vorne zur Brust
      const shin = (d) => lerp(208, 188, d);           // gestreckt -> Fuß unter dem Knie
      const foot = (d) => lerp(206, 165, d);
      return rig({
        hip, shoulder, hand, elbowBend: 1, headAng: 120,
        thighAngN: thigh(nD), shinAngN: shin(nD), footAngN: foot(nD),
        thighAngF: thigh(fD), shinAngF: shin(fD), footAngF: foot(fD),
      });
    },
  },

  // Sit-ups: Rückenlage, Füße flach am Boden (fix), Knie angewinkelt nach oben.
  // Der Oberkörper rollt um die fixe Hüfte vom Liegen bis fast zum Sitz nach oben
  // (Drehung über „oben", nicht durch den Boden). Hände an den Schläfen, Ellbogen
  // nach vorne; Kinn leicht zur Brust.
  situps: {
    duration: 1700,
    solve(t) {
      const hip = [50, GROUND_Y - 5];                  // Gesäß bleibt am Boden (Drehpunkt)
      const ankle = [66, GROUND_Y - 1];                // Füße flach am Boden, fix
      const torsoAng = lerp(270, 374, t);              // flach (links) -> aufgerichtet (über oben)
      const shoulder = addv(hip, dir(torsoAng), BONE.torso);
      const headAng = torsoAng - 12;                   // Kopf in Rumpfrichtung, Kinn zur Brust
      const head = addv(shoulder, dir(headAng), BONE.neck + BONE.head);
      return rig({
        hip, shoulder, headAng,
        ankle, kneeBend: -1, footAng: 95,              // Knie angewinkelt nach oben
        hand: head, elbowBend: 1,                      // Hände am Kopf, Ellbogen nach vorne
      });
    },
  },

  // Crunches: wie Sit-ups, aber nur die Schulterblätter heben kurz ab – der
  // Oberkörper rollt nur leicht auf (kleiner Winkel), unterer Rücken bleibt unten.
  crunches: {
    duration: 1300,
    solve(t) {
      const hip = [50, GROUND_Y - 5];
      const ankle = [66, GROUND_Y - 1];
      const torsoAng = lerp(268, 308, t);              // nur kleiner Aufrollwinkel
      const shoulder = addv(hip, dir(torsoAng), BONE.torso);
      const headAng = torsoAng - 14;
      const head = addv(shoulder, dir(headAng), BONE.neck + BONE.head);
      return rig({
        hip, shoulder, headAng,
        ankle, kneeBend: -1, footAng: 95,
        hand: head, elbowBend: 1,                      // Hände am Kopf, Ellbogen nach vorne
      });
    },
  },

  // Beinheben: Rückenlage, Oberkörper flach am Boden (fix), Arme neben dem
  // Körper. Die gestreckten Beine heben gemeinsam um die Hüfte vom Boden bis
  // fast senkrecht und senken wieder (Bauch/unterer Rücken).
  legraises: {
    duration: 1900,
    solve(t) {
      const hip = [56, GROUND_Y - 4];
      const shoulder = addv(hip, dir(270), BONE.torso); // Rumpf flach nach links am Boden
      const legAng = lerp(92, 6, t);                     // Beine waagerecht -> fast senkrecht
      return rig({
        hip, shoulder, headAng: 274,                     // Kopf liegt am Boden
        thighAng: legAng, shinAng: legAng, footAng: legAng + 20, // Beine gestreckt zusammen
        armUp: 96, armFore: 96,                           // Arme flach am Boden neben dem Körper
      });
    },
  },

  // Beckenheben (Glute Bridge): Schultern und Füße bleiben am Boden (fix). Die
  // Hüfte drückt nach oben, bis Schulter–Hüfte–Knie eine Linie bilden; Knie über
  // den Knöcheln. Kopf bleibt am Boden.
  bridge: {
    duration: 1700,
    solve(t) {
      const shoulder = [32, GROUND_Y - 3];             // Schultern fix am Boden
      const ankle = [64, GROUND_Y - 1];                // Füße flach fix am Boden
      const torsoAng = lerp(90, 56, t);                // Rumpf flach -> Hüfte hoch
      const hip = addv(shoulder, dir(torsoAng), BONE.torso);
      return rig({
        hip, shoulder, headAng: 270,                   // Kopf liegt am Boden
        ankle, kneeBend: -1, footAng: 95,              // Knie über den Knöcheln
        armUp: 100, armFore: 100,                       // Arme flach am Boden
      });
    },
  },

  // Beinheben: Rückenlage, Oberkörper flach am Boden (fix), Arme neben dem
  // Körper. Die gestreckten Beine heben gemeinsam um die Hüfte vom Boden bis
  // fast senkrecht und senken wieder (Bauch/unterer Rücken).
  legraises: {
    duration: 1900,
    solve(t) {
      const hip = [56, GROUND_Y - 4];
      const shoulder = addv(hip, dir(270), BONE.torso); // Rumpf flach nach links am Boden
      const legAng = lerp(92, 6, t);                     // Beine waagerecht -> fast senkrecht
      return rig({
        hip, shoulder, headAng: 274,                     // Kopf liegt am Boden
        thighAng: legAng, shinAng: legAng, footAng: legAng + 20, // Beine gestreckt zusammen
        armUp: 96, armFore: 96,                           // Arme flach am Boden neben dem Körper
      });
    },
  },

  // Superman: Bauchlage, Bauch/Hüfte bleibt am Boden (fix). Arme nach vorne und
  // Beine nach hinten heben gleichzeitig ab (Rückenstrecker), Körper macht einen
  // leichten Bogen. Arme/Beine gestreckt.
  superman: {
    duration: 1600,
    solve(t) {
      const hip = [46, GROUND_Y - 4];                  // Hüfte/Bauch am Boden
      const torsoAng = lerp(80, 72, t);                // Brust hebt ab
      const shoulder = addv(hip, dir(torsoAng), BONE.torso);
      const arm = lerp(66, 50, t);                     // Arme vorn-oben: tiefer -> höher
      const leg = lerp(294, 306, t);                   // Beine hinten-oben: tiefer -> höher
      return rig({
        hip, shoulder, headAng: lerp(74, 58, t),       // Blick mit nach vorne-oben
        thighAng: leg, shinAng: leg, footAng: leg,     // Beine gestreckt nach hinten-oben
        armUp: arm, armFore: arm,                       // Arme gestreckt nach vorne-oben
      });
    },
  },

  // Wadenheben: aufrecht stehen, auf die Fußballen hoch (Fersen heben), langsam
  // senken. Fußballen sind der fixe Kontaktpunkt; der ganze Körper hebt sich.
  calfraises: {
    duration: 1100,
    solve(t) {
      const lift = lerp(0, 7, t);
      const toe = [CX + 5, GROUND_Y - 1];              // Fußballen fix am Boden
      const ankle = [CX, GROUND_Y - 5 - lift];         // Ferse hebt sich, Körper steigt
      const hip = [CX, GROUND_Y - 42 - lift];
      const shoulder = addv(hip, dir(4), BONE.torso);
      return rig({
        hip, shoulder, headAng: 2,
        ankle, toe, kneeBend: -1,                       // Beine ~gerade
        armUp: 188, armFore: 172,                        // Arme locker an der Seite (Ellbogen hinten)
      });
    },
  },

  // Strecksprünge (Jump Squats): tief in die Kniebeuge, dann explosiv nach oben
  // abspringen (Füße verlassen den Boden, Körper gestreckt, Zehen gespitzt, Arme
  // nach oben). Ping-Pong: unten Hocke -> oben Sprung.
  jumpsquats: {
    duration: 900,
    solve(t) {
      const hip = [CX, lerp(GROUND_Y - 22, GROUND_Y - 44, t)];   // Hocke -> hoch in der Luft
      const ankle = [CX, lerp(GROUND_Y - 1, GROUND_Y - 12, t)];  // am Boden -> abgehoben
      const lean = lerp(28, 3, t);                                // vorgebeugt -> gestreckt
      const shoulder = addv(hip, dir(lean), BONE.torso);
      const arm = lerp(206, 14, t);                               // Arme: unten/hinten -> über Kopf
      return rig({
        hip, shoulder, headAng: lerp(14, 2, t),                   // Kopf zwischen den Armen (senkrecht)
        ankle, kneeBend: -1, footAng: lerp(92, 150, t),           // Zehen am Boden -> gespitzt
        armUp: arm, armFore: arm,                                  // gestreckt nach oben schwingen
      });
    },
  },

  // Unterarmstütz (Plank): Unterarme + Zehen sind die fixen Kontaktpunkte, der
  // Körper bleibt ein gerades Brett. Statischer Halt mit minimaler Atembewegung.
  plank: {
    duration: 2600, pingpong: true,
    solve(t) {
      const bob = lerp(0, 1.2, t);                     // dezentes Atmen
      const toe = [18, GROUND_Y - 1];                  // Zehen fix, nach vorne (auf dem Ballen)
      const ankle = [12, GROUND_Y - 6];
      const bodyAng = 81;                              // Brett leicht ansteigend zu den Schultern
      const shoulder = addv(ankle, dir(bodyAng), BONE.thigh + BONE.shin + BONE.torso - bob);
      const hip = addv(ankle, dir(bodyAng), BONE.thigh + BONE.shin);
      return rig({
        hip, shoulder, headAng: 110,
        ankle, toe, kneeBend: 1,
        armUpN: 180, armForeN: 90, armUpF: 180, armForeF: 90, // Unterarme flach am Boden
      });
    },
  },

  // Pike-Liegestütze: umgekehrtes V (Hüfte hoch), Hände + Füße am Boden fix; der
  // Kopf senkt sich zwischen den Händen Richtung Boden (Ellbogen beugen) und drückt
  // wieder hoch – Schulterfokus.
  pikepushups: {
    duration: 1600,
    solve(t) {
      const hand = [72, GROUND_Y - 1];                 // Hände fix
      const toe = [26, GROUND_Y - 1];                  // Zehen fix
      const ankle = [29, GROUND_Y - 6];
      const hip = [50, GROUND_Y - 48];                 // Hüfte hoch gepiked (fix)
      const torsoAng = lerp(150, 171, t);              // Schulter/Kopf senkt sich nach unten-vorn
      const shoulder = addv(hip, dir(torsoAng), BONE.torso);
      return rig({
        hip, shoulder, headAng: torsoAng + 6,          // Kopf Richtung Boden
        ankleN: ankle, ankleF: ankle, toeN: toe, toeF: toe, kneeBend: 1, footAng: 250,
        hand, elbowBend: 1,
      });
    },
  },

  // Enge Liegestütze (Diamant): wie Liegestütz, Hände aber eng unter der Brust,
  // Ellbogen dicht am Körper nach hinten.
  diamond: {
    duration: 1500,
    solve(t) {
      const toe = [21, GROUND_Y - 1];                  // Zehen nach vorne (auf dem Ballen)
      const ankle = [15, GROUND_Y - 7];
      const hand = [66, GROUND_Y - 1];                 // Hände enger/weiter hinten unter der Brust
      const bodyLen = BONE.thigh + BONE.shin + BONE.torso;
      const bodyAng = lerp(70, 80, t);
      const shoulder = addv(ankle, dir(bodyAng), bodyLen);
      const hip = addv(ankle, dir(bodyAng), BONE.thigh + BONE.shin);
      return rig({ hip, shoulder, ankle, hand, toe, kneeBend: 1, elbowBend: 1, headAng: 98 });
    },
  },

  // Hampelmänner: Seitenansicht-Umsetzung – Arme schwingen seitlich unten bis
  // über den Kopf, Beine öffnen/schließen (vor/zurück angedeutet), kleiner Hops.
  // Arme über Schulterhöhe -> gestreckt nach oben (Kopf dank Zeichenreihenfolge
  // dazwischen). Ping-Pong: zu/unten <-> offen/oben.
  jacks: {
    duration: 640,
    solve(t) {
      const hop = 4 * t;                                // Absprung: Hüfte hoch, Füße heben leicht ab
      const hip = [CX, GROUND_Y - 35 - hop];
      const shoulder = addv(hip, dir(2), BONE.torso);
      const arm = lerp(196, 4, t);                      // Arme seitlich unten -> gerade über den Kopf
      const spread = lerp(2, 10, t);                    // Füße zusammen -> auseinander
      const fy = GROUND_Y - 1 - 3 * t;
      return rig({
        hip, shoulder, headAng: 1,
        ankleN: [CX + spread, fy], kneeBendN: -1, footAngN: 96,
        ankleF: [CX - spread, fy], kneeBendF: -1, footAngF: 96,
        armUp: arm, armFore: arm,                        // gestreckte Arme
      });
    },
  },

  // Schwimmer: Bauchlage wie Superman, aber Arme und Beine flattern gegengleich
  // (rechter Arm + linkes Bein heben, dann Wechsel). Bauch bleibt am Boden.
  swimmers: {
    duration: 1500, loop: 'cycle',
    solve(t) {
      const hip = [46, GROUND_Y - 4];
      const shoulder = addv(hip, dir(82), BONE.torso);
      const s = Math.sin(2 * Math.PI * t);
      const naUp = (s + 1) / 2, faUp = 1 - naUp;        // Arm-Hub nah/fern gegengleich
      const arm = (u) => lerp(99, 54, u);               // am Boden vorn -> deutlich angehoben
      const leg = (u) => lerp(262, 294, u);             // am Boden hinten -> deutlich angehoben
      return rig({
        hip, shoulder, headAng: 86,
        armUpN: arm(naUp), armForeN: arm(naUp), armUpF: arm(faUp), armForeF: arm(faUp),
        thighAngN: leg(faUp), shinAngN: leg(faUp), footAngN: leg(faUp), // Bein gegengleich zum Arm
        thighAngF: leg(naUp), shinAngF: leg(naUp), footAngF: leg(naUp),
      });
    },
  },

  // Schulterklopfen: hoher Stütz (Brett), abwechselnd hebt eine Hand ab und tippt
  // die gegenüberliegende Schulter; die andere Hand stützt am Boden. Zehen fix.
  shouldertaps: {
    duration: 1600, loop: 'cycle',
    solve(t) {
      const toe = [20, GROUND_Y - 1], ankle = [20, GROUND_Y - 7];
      const bodyLen = BONE.thigh + BONE.shin + BONE.torso;
      const shoulder = addv(ankle, dir(70), bodyLen);
      const hip = addv(ankle, dir(70), BONE.thigh + BONE.shin);
      const floor = [shoulder[0], GROUND_Y - 1];       // Stützhand unter der Schulter
      const s = Math.sin(2 * Math.PI * t);
      const nTap = Math.max(0, s), fTap = Math.max(0, -s);
      const o = { hip, shoulder, ankle, toe, kneeBend: 1, elbowBend: 1, headAng: 104 };
      // Tipp-Arm per FK (Hand zur Brust/Schulter), Stütz-Arm per IK zum Boden.
      const up = (tap) => lerp(182, 300, tap);          // unten am Boden -> hoch zur Schulter
      const fore = (tap) => lerp(182, 232, tap);
      if (nTap > 0) { o.armUpN = up(nTap); o.armForeN = fore(nTap); o.handF = floor; }
      else if (fTap > 0) { o.armUpF = up(fTap); o.armForeF = fore(fTap); o.handN = floor; }
      else { o.handN = floor; o.handF = floor; }
      return rig(o);
    },
  },

  // Plank Jacks: Brett-Stütz auf den Händen (fix), die Füße hüpfen auf/zu
  // (in der Seitenansicht als kleines Vor/Zurück angedeutet). Hüfte/Rumpf bleibt.
  plankjacks: {
    duration: 600,
    solve(t) {
      const hand = [76, GROUND_Y - 1];
      const shoulder = [70, GROUND_Y - 29];
      const hip = addv(shoulder, dir(250), BONE.torso);
      const spread = lerp(1, 9, t);                     // Füße zu -> auseinander
      const baseX = 22;
      return rig({
        hip, shoulder, hand, elbowBend: 1, headAng: 116,
        ankleN: [baseX + spread, GROUND_Y - 3], kneeBendN: 1, footAngN: 250,
        ankleF: [baseX - spread, GROUND_Y - 3], kneeBendF: 1, footAngF: 250,
      });
    },
  },

  // Russian Twists: zurückgelehnter V-Sitz (Gesäß am Boden, Knie angewinkelt,
  // Füße leicht angehoben), Hände vor der Brust zusammen und im Wechsel zur Seite
  // geführt (Rotation in der Seitenansicht als Auf/Ab-Schwung angedeutet).
  twists: {
    duration: 1500,
    solve(t) {
      const sway = (t - 0.5) * 2;                       // -1 .. 1
      const hip = [50, GROUND_Y - 9];                   // Gesäß am Boden
      const shoulder = addv(hip, dir(332), BONE.torso); // zurückgelehnter Oberkörper
      const arm = 74 + sway * 18;                        // Hände vor der Brust, schwingen
      return rig({
        hip, shoulder, headAng: 332,
        thighAng: 72, shinAng: 126, footAng: 126,        // V-Sitz: Knie hoch, Füße vorn angehoben
        armUp: arm, armFore: arm + 8,                     // beide Arme nach vorne (Hände zusammen)
      });
    },
  },

  // Seitstütz (Side Plank): Körper als gerade Diagonale, unterer Arm stützt am
  // Boden, Füße am Boden, Hüfte angehoben; oberer Arm gerade nach oben gestreckt.
  // Statischer Halt mit leichtem Wippen.
  sideplank: {
    duration: 2800, pingpong: true,
    solve(t) {
      const bob = lerp(0, 2, t);
      const toe = [78, GROUND_Y - 1], ankle = [75, GROUND_Y - 5];
      const bodyLen = BONE.thigh + BONE.shin + BONE.torso;
      const bodyAng = 287;                              // von den Füßen (rechts) nach links-oben
      const shoulder = addv(ankle, dir(bodyAng), bodyLen - bob);
      const hip = addv(ankle, dir(bodyAng), BONE.thigh + BONE.shin);
      return rig({
        hip, shoulder, ankle, toe, kneeBend: 1, headAng: 333,
        handF: [shoulder[0], GROUND_Y - 1], elbowBend: -1, // unterer (ferner) Arm stützt am Boden
        armUpN: 4, armForeN: 4,                            // oberer (naher) Arm gerade nach oben
      });
    },
  },

  // Skater-Sprünge: tiefe Landung auf einem Bein (unter dem Körper, gebeugt), das
  // andere schwingt nach hinten-oben (Ausgleich), Oberkörper vorgebeugt, Arme
  // gegengleich. Im Wechsel (cycle).
  skater: {
    duration: 1300, loop: 'cycle',
    solve(t) {
      const s = Math.sin(2 * Math.PI * t);
      const nSt = (s + 1) / 2, fSt = 1 - nSt;            // Stand-Anteil je Bein
      const hip = [CX, GROUND_Y - 30];
      const lean = 24;
      const shoulder = addv(hip, dir(lean), BONE.torso);
      // Fuß-Ziel: Schwung hinten-oben <-> Stand am Boden unter der Hüfte.
      const ank = (st) => [lerp(CX - 20, CX + 2, st), lerp(GROUND_Y - 16, GROUND_Y - 1, st)];
      const foot = (st) => lerp(210, 95, st);            // hinten gespitzt -> flach am Boden
      const arm = (fwd) => lerp(150, 214, fwd);          // vor <-> zurück
      return rig({
        hip, shoulder, headAng: lean,
        ankleN: ank(nSt), kneeBendN: -1, footAngN: foot(nSt),
        ankleF: ank(fSt), kneeBendF: -1, footAngF: foot(fSt),
        armUpN: arm(fSt), armForeN: arm(fSt) - 42,        // gegengleich zum nahen Bein
        armUpF: arm(nSt), armForeF: arm(nSt) - 42,
      });
    },
  },

  // Burpees: vollständige Sequenz – Hocke (Hände zum Boden) -> Brett zurückspringen
  // -> Brett halten -> zurück in die Hocke -> explosiv hochspringen (Arme über Kopf).
  // Posen werden geblendet (cycle, t=0 == t=1 = Hocke).
  burpees: {
    duration: 1700, loop: 'cycle',
    solve(t) {
      const squat = () => { const ankle = [CX, GROUND_Y - 1], hip = [CX, GROUND_Y - 18], sh = addv(hip, dir(44), BONE.torso); return rig({ hip, shoulder: sh, ankle, kneeBend: -1, footAng: 92, headAng: 26, armUp: 122, armFore: 122 }); };
      const plank = () => { const toe = [20, GROUND_Y - 1], ankle = [20, GROUND_Y - 7], hand = [80, GROUND_Y - 1], bl = BONE.thigh + BONE.shin + BONE.torso, sh = addv(ankle, dir(72), bl), hip = addv(ankle, dir(72), BONE.thigh + BONE.shin); return rig({ hip, shoulder: sh, ankle, toe, hand, kneeBend: 1, elbowBend: 1, headAng: 100 }); };
      const jump = () => { const ankle = [CX, GROUND_Y - 14], hip = [CX, GROUND_Y - 46], sh = addv(hip, dir(3), BONE.torso); return rig({ hip, shoulder: sh, ankle, kneeBend: -1, footAng: 155, headAng: 2, armUp: 8, armFore: 8 }); };
      let from, to, u;
      if (t < 0.28) { from = squat(); to = plank(); u = t / 0.28; }
      else if (t < 0.44) return plank();
      else if (t < 0.60) { from = plank(); to = squat(); u = (t - 0.44) / 0.16; }
      else if (t < 0.80) { from = squat(); to = jump(); u = (t - 0.60) / 0.20; }
      else { from = jump(); to = squat(); u = (t - 0.80) / 0.20; }
      return lerpPose(from, to, easeInOut(u));
    },
  },

  // Wandsitzen: Rücken senkrecht an der Wand, Oberschenkel waagerecht, Schienbeine
  // senkrecht (Knie ~90°). Statischer Halt mit leichtem Wippen. Wand direkt hinter
  // dem Rücken (volle Höhe), Hände auf den Oberschenkeln.
  wallsit: {
    duration: 2800, pingpong: true,
    solve(t) {
      const bob = lerp(0, 1.4, t);
      const hip = [42, GROUND_Y - 19 - bob];                     // Gesäß an der Wand, Sitzhöhe
      const shoulder = addv(hip, dir(358), BONE.torso);          // Rücken senkrecht an der Wand
      const P = rig({
        hip, shoulder, headAng: 0,
        thighAng: 90, shinAng: 179, footAng: 92,                 // Oberschenkel waagerecht, Schienbein senkrecht
        armUp: 90, armFore: 90,                                   // Hände auf den Oberschenkeln
      });
      P.props = [{ type: 'rect', x: 34, y: 36, w: 6, h: GROUND_Y - 36, fill: '#5b6472' }]; // Wand (volle Höhe) direkt hinter dem Rücken
      return P;
    },
  },

  // Trizeps-Dips: Hände hinter dem Körper auf einer Bank/Kiste, Beine vorne,
  // Ellbogen nach hinten beugen -> Gesäß senkt/hebt sich. Bank als Requisite.
  tricepdips: {
    duration: 1700,
    solve(t) {
      const hand = [32, GROUND_Y - 27];                          // Hände auf der Bankkante (hinten)
      const shoulder = [42, lerp(GROUND_Y - 48, GROUND_Y - 36, t)]; // senkt sich beim Dip
      const hip = [50, lerp(GROUND_Y - 30, GROUND_Y - 20, t)];
      const ankle = [70, GROUND_Y - 1];                          // Füße vorne am Boden
      const P = rig({ hip, shoulder, hand, elbowBend: 1, headAng: 6, ankle, kneeBend: -1, footAng: 92 });
      P.props = [{ type: 'rect', x: 16, y: GROUND_Y - 27, w: 24, h: 28, fill: '#7a5a3c' }]; // Bank/Kiste
      return P;
    },
  },

  // Kettlebell-Swings: Hüfthinge, Kettlebell schwingt zwischen den Beinen (tief)
  // bis auf Schulterhöhe (vorn-oben). Ping-Pong.
  'circ-kettlebell': {
    duration: 1100,
    solve(t) {
      const hip = [CX, GROUND_Y - 37 + 5 * t];
      const ankle = [CX, GROUND_Y - 1];
      const lean = lerp(6, 40, t);                       // aufrecht (oben) -> Hüfthinge (unten)
      const shoulder = addv(hip, dir(lean), BONE.torso);
      const arm = lerp(40, 112, t);                      // vorn-oben -> nach unten zwischen die Beine
      const P = rig({ hip, shoulder, ankle, kneeBend: -1, footAng: 92, headAng: lean * 0.4, armUp: arm, armFore: arm });
      const h = P.handN; P.props = [{ type: 'kb', x: h[0], y: h[1] + 5, r: 5, front: true }];
      return P;
    },
  },

  // Stange über Kopf stemmen: aus Schulterhöhe gerade nach oben drücken. Stange
  // mit Scheiben als Requisite in den Händen.
  'circ-overhead': {
    duration: 1300,
    solve(t) {
      const hip = [CX, GROUND_Y - 37], ankle = [CX, GROUND_Y - 1];
      const shoulder = addv(hip, dir(3), BONE.torso);
      const P = rig({ hip, shoulder, ankle, kneeBend: -1, footAng: 92, headAng: 2, armUp: lerp(40, 5, t), armFore: lerp(20, 5, t) });
      const h = P.handN;
      P.props = [{ type: 'line', x1: h[0] - 13, y1: h[1], x2: h[0] + 13, y2: h[1], sw: 2.4, stroke: '#cfd3d8', front: true },
        { type: 'circle', x: h[0] - 13, y: h[1], r: 3.4, fill: '#3a3f47', front: true },
        { type: 'circle', x: h[0] + 13, y: h[1], r: 3.4, fill: '#3a3f47', front: true }];
      return P;
    },
  },

  // Sitzbank stemmen: Bank von der Brust gerade über den Kopf drücken.
  'circ-bench': {
    duration: 1400,
    solve(t) {
      const hip = [CX, GROUND_Y - 37], ankle = [CX, GROUND_Y - 1];
      const shoulder = addv(hip, dir(3), BONE.torso);
      const P = rig({ hip, shoulder, ankle, kneeBend: -1, footAng: 92, headAng: 2, armUp: lerp(42, 6, t), armFore: lerp(24, 6, t) });
      const h = P.handN; P.props = [{ type: 'rect', x: h[0] - 17, y: h[1] - 3, w: 34, h: 6, rx: 2, fill: '#7a5a3c', front: true }];
      return P;
    },
  },

  // Box-Sprünge: aus der Hocke explosiv nach oben (neben der Box). Box rechts.
  'circ-boxjump': {
    duration: 900,
    solve(t) {
      const ankle = [CX - 8, lerp(GROUND_Y - 1, GROUND_Y - 16, t)];
      const hip = [CX - 8, lerp(GROUND_Y - 20, GROUND_Y - 44, t)];
      const lean = lerp(34, 8, t);
      const shoulder = addv(hip, dir(lean), BONE.torso);
      const arm = lerp(156, 26, t);
      const P = rig({ hip, shoulder, ankle, kneeBend: -1, footAng: lerp(92, 150, t), headAng: lean * 0.4, armUp: arm, armFore: arm });
      P.props = [{ type: 'rect', x: CX + 14, y: GROUND_Y - 24, w: 26, h: 24, fill: '#7a5a3c' }];
      return P;
    },
  },

  // Step-ups: einen Fuß auf die Bank/Box setzen und hochsteigen (im Wechsel).
  'circ-stepups': {
    duration: 1600, loop: 'cycle',
    solve(t) {
      const boxTop = GROUND_Y - 20;
      const up = (1 - Math.cos(2 * Math.PI * t)) / 2;     // 0 unten -> 1 oben gestiegen
      const hip = [CX, lerp(GROUND_Y - 37, GROUND_Y - 45, up)];
      const shoulder = addv(hip, dir(8), BONE.torso);
      const P = rig({
        hip, shoulder, headAng: 6, armFK: 96,
        ankleN: [CX + 18, lerp(GROUND_Y - 1, boxTop, up)], kneeBendN: -1, footAngN: 92,
        ankleF: [CX - 8, GROUND_Y - 1], kneeBendF: -1, footAngF: 92,
      });
      P.props = [{ type: 'rect', x: CX + 10, y: boxTop, w: 28, h: 24, fill: '#7a5a3c' }];
      return P;
    },
  },

  // Hüftstemmen mit Stange: Schultern auf der Kiste, Füße am Boden, Becken mit
  // Stange nach oben drücken (wie Beckenheben, Schultern erhöht).
  'circ-hipthrust': {
    duration: 1500,
    solve(t) {
      const shoulder = [34, GROUND_Y - 24];              // Schultern auf der Kiste (fix)
      const ankle = [66, GROUND_Y - 1];
      const hip = [50, lerp(GROUND_Y - 14, GROUND_Y - 26, t)]; // Becken hoch
      const P = rig({ hip, shoulder, headAng: 300, ankle, kneeBend: -1, footAng: 92, armUp: 250, armFore: 250 });
      P.props = [{ type: 'rect', x: 22, y: GROUND_Y - 28, w: 22, h: 28, fill: '#7a5a3c' },
        { type: 'line', x1: hip[0] - 13, y1: hip[1] - 1, x2: hip[0] + 13, y2: hip[1] - 1, sw: 3, stroke: '#cfd3d8', front: true }];
      return P;
    },
  },

  // Rollbrett ziehen: bäuchlings auf dem Brett, mit den Armen nach vorne ziehen.
  'circ-scooter': {
    duration: 1500, loop: 'cycle',
    solve(t) {
      const hip = [48, GROUND_Y - 7];
      const shoulder = addv(hip, dir(70), BONE.torso);  // Brust deutlich angehoben (Blick nach vorn)
      const arm = lerp(60, 104, (Math.sin(2 * Math.PI * t) + 1) / 2); // weit vorgreifen -> zurückziehen
      const P = rig({ hip, shoulder, headAng: 72, thighAng: 261, shinAng: 261, footAng: 261, armUp: arm, armFore: arm });
      P.props = [{ type: 'rect', x: 36, y: GROUND_Y - 5, w: 42, h: 5, rx: 2, fill: '#6b4a2c' }, // Rollbrett deutlich sichtbar
        { type: 'circle', x: 45, y: GROUND_Y - 1, r: 2.6, fill: '#1c1c1c' }, { type: 'circle', x: 70, y: GROUND_Y - 1, r: 2.6, fill: '#1c1c1c' }];
      return P;
    },
  },

  // Seilspringen: kleine Hopser auf den Fußballen, Seil dreht ums Männchen.
  'circ-rope': {
    duration: 480,
    solve(t) {
      const hop = 8 * Math.sin(Math.PI * t);            // deutliche Hopser
      const hip = [CX, GROUND_Y - 37 - hop];
      const ankle = [CX, GROUND_Y - 4 - hop];
      const shoulder = addv(hip, dir(3), BONE.torso);
      const P = rig({ hip, shoulder, ankle, kneeBend: -1, footAng: 116, headAng: 2, armUp: 150, armFore: 196 });
      P.props = [{ type: 'ellipse', x: CX, y: GROUND_Y - 28, rx: lerp(19, 23, t), ry: 27, stroke: '#cbb88f', sw: 1.4 }];
      return P;
    },
  },

  // Ringe-Klimmzüge: an den Ringen hängen und hochziehen (Knie angewinkelt).
  'circ-rings': {
    duration: 1500,
    solve(t) {
      const hand = [CX, GROUND_Y - 80];
      const shoulder = [CX, lerp(GROUND_Y - 60, GROUND_Y - 71, t)]; // hochziehen
      const hip = [CX, shoulder[1] + BONE.torso];
      const P = rig({ hip, shoulder, handN: hand, handF: hand, elbowBend: 1, headAng: 2, thighAng: 202, shinAng: 118, footAng: 118 });
      P.props = [{ type: 'line', x1: CX - 9, y1: 8, x2: hand[0] - 9, y2: hand[1], sw: 1.4, stroke: '#cbb88f' },
        { type: 'line', x1: CX + 9, y1: 8, x2: hand[0] + 9, y2: hand[1], sw: 1.4, stroke: '#cbb88f' },
        { type: 'circle', x: hand[0] - 9, y: hand[1], r: 4, stroke: '#2c2f35', sw: 2 },
        { type: 'circle', x: hand[0] + 9, y: hand[1], r: 4, stroke: '#2c2f35', sw: 2 }];
      return P;
    },
  },

  // Sprossenwand-Beinheben: an der Sprossenwand hängen, gestreckte Beine heben.
  'circ-wallbars': {
    duration: 1800,
    solve(t) {
      const hand = [46, GROUND_Y - 80];
      const shoulder = [48, GROUND_Y - 64];
      const hip = [50, GROUND_Y - 46];
      const leg = lerp(178, 96, t);                     // unten -> waagerecht heben
      const P = rig({ hip, shoulder, handN: hand, handF: hand, elbowBend: 1, headAng: 4, thighAng: leg, shinAng: leg + 3, footAng: leg });
      const bars = [{ type: 'line', x1: 40, y1: 8, x2: 40, y2: 104, sw: 2.2, stroke: '#9c6b3f' }, { type: 'line', x1: 30, y1: 8, x2: 30, y2: 104, sw: 2.2, stroke: '#9c6b3f' }];
      for (let y = 16; y < 104; y += 11) bars.push({ type: 'line', x1: 30, y1: y, x2: 40, y2: y, sw: 1.6, stroke: '#9c6b3f' });
      P.props = bars;
      return P;
    },
  },

  // Battle Ropes: leichte Hocke, Arme schlagen die Taue gegengleich auf/ab.
  'circ-battlerope': {
    duration: 460, loop: 'cycle',
    solve(t) {
      const hip = [CX - 6, GROUND_Y - 32], ankle = [CX - 6, GROUND_Y - 1];
      const shoulder = addv(hip, dir(10), BONE.torso);
      const s = (Math.sin(2 * Math.PI * t) + 1) / 2;
      const P = rig({
        hip, shoulder, ankle, kneeBend: -1, footAng: 92, headAng: 8,
        armUpN: lerp(118, 152, s), armForeN: lerp(118, 152, s),
        armUpF: lerp(152, 118, s), armForeF: lerp(152, 118, s),
      });
      const anchor = [92, GROUND_Y - 1];
      P.props = [{ type: 'line', x1: P.handF[0], y1: P.handF[1], x2: anchor[0], y2: anchor[1], sw: 2, stroke: '#b9925f', front: true },
        { type: 'line', x1: P.handN[0], y1: P.handN[1], x2: anchor[0], y2: anchor[1], sw: 2, stroke: '#cbb88f', front: true }];
      return P;
    },
  },

  // Medizinball an die Decke: aus leichter Hocke explosiv hoch, Ball über Kopf.
  'circ-ballwall': {
    duration: 1000,
    solve(t) {
      const hip = [CX, lerp(GROUND_Y - 30, GROUND_Y - 39, t)], ankle = [CX, GROUND_Y - 1];
      const shoulder = addv(hip, dir(4), BONE.torso);
      const arm = lerp(40, 6, t);
      const P = rig({ hip, shoulder, ankle, kneeBend: -1, footAng: 92, headAng: 2, armUp: arm, armFore: arm });
      const h = P.handN; P.props = [{ type: 'circle', x: h[0], y: h[1] - 6, r: 6, fill: '#7a4a2a', front: true }];
      return P;
    },
  },

  // Medizinball-Slams: Ball über Kopf und kraftvoll auf den Boden schmettern.
  'circ-medball': {
    duration: 850,
    solve(t) {
      const hip = [CX, lerp(GROUND_Y - 38, GROUND_Y - 24, t)], ankle = [CX, GROUND_Y - 1];
      const lean = lerp(4, 38, t);
      const shoulder = addv(hip, dir(lean), BONE.torso);
      const arm = lerp(6, 120, t);
      const P = rig({ hip, shoulder, ankle, kneeBend: -1, footAng: 92, headAng: lean * 0.4, armUp: arm, armFore: arm });
      const h = P.handN; P.props = [{ type: 'circle', x: h[0], y: h[1] + (t < 0.5 ? -6 : 6), r: 6, fill: '#7a4a2a', front: true }];
      return P;
    },
  },

  // Medizinball-Wurf aus Rückenlage: aufrichten und den Ball nach vorn (Wand) werfen.
  'circ-wallthrow': {
    duration: 1400,
    solve(t) {
      const hip = [42, GROUND_Y - 6], ankle = [60, GROUND_Y - 1];
      const torsoAng = lerp(282, 352, t);               // liegen -> aufrichten/werfen
      const shoulder = addv(hip, dir(torsoAng), BONE.torso);
      const arm = lerp(312, 416, t);                     // hinter dem Kopf -> über oben nach vorn (Wurfbogen)
      const P = rig({ hip, shoulder, headAng: torsoAng - 8, ankle, kneeBend: -1, footAng: 95, armUp: arm, armFore: arm });
      const h = P.handN;
      P.props = [{ type: 'rect', x: 72, y: 36, w: 6, h: GROUND_Y - 36, fill: '#5b6472' }, { type: 'circle', x: h[0], y: h[1], r: 5.5, fill: '#7a4a2a', front: true }];
      return P;
    },
  },

  // Rutschpad-Sprint: Hände auf der Bank, Beine sprinten im Wechsel (wie Climbers).
  'circ-sliders': {
    duration: 560, loop: 'cycle',
    solve(t) {
      const hand = [72, GROUND_Y - 22];
      const shoulder = [64, GROUND_Y - 46];
      const hip = [46, GROUND_Y - 44];                  // angehoben, damit Füße über dem Boden bleiben
      const s = Math.sin(2 * Math.PI * t);
      const nD = Math.max(0, s), fD = Math.max(0, -s);
      const thigh = (d) => lerp(206, 116, d), shin = (d) => lerp(206, 186, d), foot = (d) => lerp(204, 165, d);
      const P = rig({
        hip, shoulder, handN: hand, handF: hand, elbowBend: 1, headAng: 118,
        thighAngN: thigh(nD), shinAngN: shin(nD), footAngN: foot(nD),
        thighAngF: thigh(fD), shinAngF: shin(fD), footAngF: foot(fD),
      });
      P.props = [{ type: 'rect', x: 60, y: GROUND_Y - 22, w: 28, h: 22, fill: '#7a5a3c' }];
      return P;
    },
  },

  // Kettlebell-Russian-Twist: V-Sitz, Kettlebell von Seite zu Seite.
  'circ-kbtwist': {
    duration: 1500,
    solve(t) {
      const sway = (t - 0.5) * 2;
      const hip = [50, GROUND_Y - 9];
      const shoulder = addv(hip, dir(332), BONE.torso);
      const arm = 76 + sway * 16;
      const P = rig({ hip, shoulder, headAng: 332, thighAng: 72, shinAng: 126, footAng: 126, armUp: arm, armFore: arm + 8 });
      const h = P.handN; P.props = [{ type: 'kb', x: h[0], y: h[1] + 4, r: 4.5, front: true }];
      return P;
    },
  },

  // Liegestütz mit Drehung: Liegestütz, oben den Oberkörper öffnen, ein Arm hoch.
  'circ-rotpushup': {
    duration: 1600,
    solve(t) {
      const toe = [21, GROUND_Y - 1], ankle = [15, GROUND_Y - 7];
      const hand = [72, GROUND_Y - 1];
      const bodyLen = BONE.thigh + BONE.shin + BONE.torso;
      const shoulder = addv(ankle, dir(73), bodyLen);
      const hip = addv(ankle, dir(73), BONE.thigh + BONE.shin);
      const P = rig({
        hip, shoulder, ankle, toe, kneeBend: 1, headAng: 100, elbowBend: 1,
        handF: hand,                                      // ferner Arm stützt am Boden
        handN: [lerp(74, 73, t), lerp(GROUND_Y - 1, GROUND_Y - 54, t)], // naher Arm: Boden -> öffnet nach oben
      });
      return P;
    },
  },

  // Kurzer neutraler Stand (Arme locker an der Seite, leichtes Atmen) – wird als
  // 1-Sekunden-Übergang zwischen den Übungen gezeigt (Männchen "steht kurz").
  idle: {
    duration: 2400, pingpong: true,
    solve(t) { return stand({ hipBob: lerp(0, 1.4, t), lean: 3, headAng: 2, armUp: 196, armFore: 182 }); },
  },

  // ---- Pausen-Idles (Männchen entspannt sich) ----
  // Durchatmen, Hände in die Hüften, Brust hebt/senkt sich.
  rest_breathe: {
    duration: 2800, pingpong: true,
    solve(t) { return stand({ hipBob: lerp(0, 2.2, t), lean: 3, headAng: lerp(3, 0, t), armUp: 206, armFore: 124 }); },
  },
  // Recken/Strecken: Arme über den Kopf, leicht nach hinten.
  rest_stretch: {
    duration: 2600, pingpong: true,
    solve(t) { const arm = lerp(150, 8, t); return stand({ hipBob: lerp(0, 2, t), lean: lerp(4, -3, t), headAng: lerp(3, -4, t), armUp: arm, armFore: arm }); },
  },
  // Seitneigung (lockern), Arme hängen locker (Ellbogen leicht nach hinten gebeugt).
  rest_sidebend: {
    duration: 2800, pingpong: true,
    solve(t) { const lean = lerp(-11, 11, t); const up = lerp(181, 187, t); return stand({ lean, headAng: lean, armUp: up, armFore: up - 16 }); },
  },
  // Arme locker vor/zurück schwingen + leichtes Wippen (Ellbogen zeigt nach hinten).
  rest_swing: {
    duration: 1500, pingpong: true,
    solve(t) { const up = lerp(150, 205, t); return stand({ hipBob: lerp(0, 2.5, t), lean: 3, headAng: 2, armUp: up, armFore: up - 14 }); },
  },
};
