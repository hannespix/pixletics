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
const STAGE_S = 92;
const parseVB = (s) => s.split(' ').map(Number);
const lerpVB = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
// Zwei Posen (Punkt-Wörterbücher gleicher Schlüssel) Punkt für Punkt mischen.
function lerpPose(A, B, t) {
  const o = {};
  for (const k in B) { const a = A[k], b = B[k]; o[k] = (Array.isArray(a) && Array.isArray(b)) ? mix(a, b, t) : b; }
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
    this.jHip = this._dot(3.2, 'fig-joint');
    this.jShoulder = this._dot(3.2, 'fig-joint');
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

// Quadratisches, um die Übung zentriertes Bühnen-Fenster. Kantenlänge = mindestens
// STAGE_S (gleicher Maßstab für die meisten Übungen) und nur größer, wenn die
// Übung mehr Platz braucht (inkl. Kopf-/Strichrand) -> nie abgeschnitten, immer
// mittig. Übergänge führen das Fenster weich mit (siehe play/_loop).
function stageViewBox(a) {
  if (a._svb) return a._svb;
  let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
  for (let i = 0; i <= 16; i++) {
    const P = a.solve(i / 16);
    for (const k in P) {
      const p = P[k]; if (!Array.isArray(p)) continue;
      const r = k === 'head' ? BONE.head + 1 : 4; // Kopfradius bzw. Strich/Gelenk abdecken
      minx = Math.min(minx, p[0] - r); maxx = Math.max(maxx, p[0] + r);
      miny = Math.min(miny, p[1] - r); maxy = Math.max(maxy, p[1] + r);
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

  // Ausfallschritt: vorderer Fuß flach am Boden, hinterer auf dem Ballen (Ferse
  // hoch). Die Hüfte senkt sich gerade nach unten -> vorderes Knie beugt über dem
  // Knöchel nach vorne, hinteres Knie sinkt zum Boden; Oberkörper bleibt aufrecht.
  // Beide Füße bleiben fix am Boden (Kontaktpunkte), Knie per IK nachgezogen.
  lunges: {
    duration: 1900,
    solve(t) {
      const ankleN = [60, GROUND_Y - 1];               // vorderer Fuß flach, fix
      const ankleF = [34, GROUND_Y - 7];               // hinterer Fuß auf dem Ballen, fix
      const hip = [lerp(49, 48, t), lerp(GROUND_Y - 36, GROUND_Y - 27, t)]; // senkt sich
      const lean = lerp(3, 7, t);                       // Oberkörper fast aufrecht
      const shoulder = addv(hip, dir(lean), BONE.torso);
      return rig({
        hip, shoulder, headAng: lean,
        ankleN, kneeBendN: -1, footAngN: 90,            // vorderes Knie nach vorne über den Knöchel
        ankleF, kneeBendF: -1, footAngF: 148,           // hinteres Bein, Ballen/Ferse hoch
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

  // Mountain Climbers: hoher Stütz (Hände fix am Boden), Körper als Brett. Die
  // Beine wechseln im Laufschritt: ein Knie zieht nach vorne zur Brust (Fuß
  // angehoben/getuckt), das andere streckt sich nach hinten zum Boden. Beide
  // Beine gegenphasig (cycle) – die Hände bleiben der fixe Kontaktpunkt.
  climbers: {
    duration: 720, loop: 'cycle',
    solve(t) {
      const hand = [76, GROUND_Y - 1];                 // Hände fix am Boden
      const shoulder = [70, GROUND_Y - 30];            // Schultern über den Händen
      const hip = addv(shoulder, dir(250), BONE.torso); // Brett-Linie nach hinten
      // Fuß-Ziel je Bein: hinten am Boden (gestreckt) <-> vorn unter die Brust
      // angehoben (Knie zur Brust). Über IK -> Füße bleiben immer über dem Boden.
      const dN = (1 - Math.cos(2 * Math.PI * t)) / 2;
      const dF = (1 + Math.cos(2 * Math.PI * t)) / 2;  // gegenphasig
      const ank = (d) => [lerp(22, 56, d), lerp(GROUND_Y - 4, GROUND_Y - 18, d)];
      return rig({
        hip, shoulder, hand, elbowBend: 1, headAng: 116,
        ankleN: ank(dN), kneeBendN: -1, footAngN: lerp(250, 300, dN),
        ankleF: ank(dF), kneeBendF: -1, footAngF: lerp(250, 300, dF),
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
      const toe = [12, GROUND_Y - 1];                  // Zehen fix
      const ankle = [14, GROUND_Y - 6];
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
      const toe = [16, GROUND_Y - 1];
      const ankle = [16, GROUND_Y - 7];
      const hand = [66, GROUND_Y - 1];                 // Hände enger/weiter hinten unter der Brust
      const bodyLen = BONE.thigh + BONE.shin + BONE.torso;
      const bodyAng = lerp(70, 80, t);
      const shoulder = addv(ankle, dir(bodyAng), bodyLen);
      const hip = addv(ankle, dir(bodyAng), BONE.thigh + BONE.shin);
      return rig({ hip, shoulder, ankle, hand, toe, kneeBend: 1, elbowBend: 1, headAng: 98 });
    },
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
