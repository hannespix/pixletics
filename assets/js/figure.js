// Schematische 2D-Gliederpuppe ("Holzpuppe"), die Übungen vormacht.
// Prozedural per Gelenkwinkel – kein 3D, keine Bibliothek, voll offline.
//
// Winkelkonvention: Grad, 0° = nach OBEN, im Uhrzeigersinn positiv
// (90° = nach rechts/vorne, 180° = nach unten, 270° = nach links/hinten).
// Die Figur schaut nach rechts (Seitenansicht). Nahe/ferne Gliedmaßen werden
// mit leichtem Versatz + geringerer Deckkraft gezeichnet (Tiefenwirkung).

const SVGNS = 'http://www.w3.org/2000/svg';
const RAD = Math.PI / 180;
const dir = (deg) => [Math.sin(deg * RAD), -Math.cos(deg * RAD)];
const add = (p, v, len) => [p[0] + v[0] * len, p[1] + v[1] * len];
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Knochenlängen in viewBox-Einheiten (viewBox 0 0 100 120).
const BONE = { torso: 27, neck: 5, head: 8.5, upArm: 15, foreArm: 14, thigh: 19, shin: 18, foot: 7 };
const CX = 50, BASE_Y = 60, GROUND_Y = 104; // Hüftpunkt in Ruhe + Bodenlinie

// Grund-/Standpose (Seitenansicht, Blick nach rechts). Alle Winkel absolut.
export const DEFAULT_POSE = {
  y: 0, torso: 3, head: 1, foot: 92,
  aun: 190, afn: 192,   // Arm nah: Oberarm / Unterarm (hängend)
  auf: 186, aff: 188,   // Arm fern
  ltn: 183, lsn: 181,   // Bein nah: Oberschenkel / Schienbein
  ltf: 177, lsf: 179,   // Bein fern
};

const merge = (p) => ({ ...DEFAULT_POSE, ...p });

function lerpPose(a, b, t) {
  const o = {};
  for (const k in DEFAULT_POSE) o[k] = lerp(a[k] ?? DEFAULT_POSE[k], b[k] ?? DEFAULT_POSE[k], t);
  return o;
}

// Aus einer Pose alle Gelenkpunkte berechnen.
function points(pose) {
  const hip = [CX, BASE_Y + pose.y];
  const tv = dir(pose.torso);
  const shoulder = add(hip, tv, BONE.torso);
  const neck = add(shoulder, tv, BONE.neck);
  const head = add(neck, dir(pose.head), BONE.head);
  const sN = [shoulder[0] + 2.5, shoulder[1]], sF = [shoulder[0] - 2.5, shoulder[1]];
  const hN = [hip[0] + 2.5, hip[1]], hF = [hip[0] - 2.5, hip[1]];
  const elbowN = add(sN, dir(pose.aun), BONE.upArm), handN = add(elbowN, dir(pose.afn), BONE.foreArm);
  const elbowF = add(sF, dir(pose.auf), BONE.upArm), handF = add(elbowF, dir(pose.aff), BONE.foreArm);
  const kneeN = add(hN, dir(pose.ltn), BONE.thigh), ankN = add(kneeN, dir(pose.lsn), BONE.shin);
  const kneeF = add(hF, dir(pose.ltf), BONE.thigh), ankF = add(kneeF, dir(pose.lsf), BONE.shin);
  const toeN = add(ankN, dir(pose.foot), BONE.foot), toeF = add(ankF, dir(pose.foot), BONE.foot);
  return { hip, shoulder, head, sN, sF, hN, hF, elbowN, handN, elbowF, handF, kneeN, ankN, kneeF, ankF, toeN, toeF };
}

export class FigureAnimator {
  constructor(svg) {
    this.svg = svg;
    this.raf = null;
    this.anim = null;
    this.t0 = 0;
    this._build();
    this.setPose(DEFAULT_POSE);
  }

  _line(cls, w, opacity = 1) {
    const l = document.createElementNS(SVGNS, 'line');
    l.setAttribute('stroke-linecap', 'round');
    l.setAttribute('stroke-width', w);
    l.setAttribute('class', cls);
    if (opacity !== 1) l.setAttribute('opacity', opacity);
    this.svg.appendChild(l);
    return l;
  }
  _dot(r, cls) {
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('r', r); c.setAttribute('class', cls);
    this.svg.appendChild(c);
    return c;
  }

  _build() {
    this.svg.setAttribute('viewBox', '0 0 100 120');
    // Bodenlinie ganz hinten.
    this.ground = this._line('fig-ground', 2.5, 0.5);
    this.ground.setAttribute('x1', 16); this.ground.setAttribute('y1', GROUND_Y);
    this.ground.setAttribute('x2', 84); this.ground.setAttribute('y2', GROUND_Y);
    // ferne Gliedmaßen (hinten), dann Rumpf, dann nahe (vorne), Kopf oben
    this.lThighF = this._line('fig-limb fig-far', 7, 0.45);
    this.lShinF = this._line('fig-limb fig-far', 7, 0.45);
    this.lFootF = this._line('fig-limb fig-far', 6, 0.45);
    this.lUpArmF = this._line('fig-limb fig-far', 6, 0.45);
    this.lForeArmF = this._line('fig-limb fig-far', 6, 0.45);
    this.lTorso = this._line('fig-torso', 12);
    this.lThighN = this._line('fig-limb', 7.5);
    this.lShinN = this._line('fig-limb', 7.5);
    this.lFootN = this._line('fig-limb', 6.5);
    this.lUpArmN = this._line('fig-limb', 6.5);
    this.lForeArmN = this._line('fig-limb', 6.5);
    this.jHip = this._dot(3.2, 'fig-joint');
    this.jShoulder = this._dot(3.2, 'fig-joint');
    this.handN = this._dot(3.4, 'fig-joint');
    this.cHead = this._dot(BONE.head, 'fig-head');
  }

  setPose(pose) {
    const p = points(pose);
    const set = (l, a, b) => { l.setAttribute('x1', a[0].toFixed(2)); l.setAttribute('y1', a[1].toFixed(2)); l.setAttribute('x2', b[0].toFixed(2)); l.setAttribute('y2', b[1].toFixed(2)); };
    set(this.lTorso, p.hip, p.shoulder);
    set(this.lThighF, p.hF, p.kneeF); set(this.lShinF, p.kneeF, p.ankF); set(this.lFootF, p.ankF, p.toeF);
    set(this.lUpArmF, p.sF, p.elbowF); set(this.lForeArmF, p.elbowF, p.handF);
    set(this.lThighN, p.hN, p.kneeN); set(this.lShinN, p.kneeN, p.ankN); set(this.lFootN, p.ankN, p.toeN);
    set(this.lUpArmN, p.sN, p.elbowN); set(this.lForeArmN, p.elbowN, p.handN);
    this.jHip.setAttribute('cx', p.hip[0]); this.jHip.setAttribute('cy', p.hip[1]);
    this.jShoulder.setAttribute('cx', p.shoulder[0]); this.jShoulder.setAttribute('cy', p.shoulder[1]);
    this.handN.setAttribute('cx', p.handN[0].toFixed(2)); this.handN.setAttribute('cy', p.handN[1].toFixed(2));
    this.cHead.setAttribute('cx', p.head[0].toFixed(2)); this.cHead.setAttribute('cy', p.head[1].toFixed(2));
  }

  // anim: Key aus ANIMATIONS oder Objekt { duration, pingpong, poses:[..] }
  play(anim) {
    const a = typeof anim === 'string' ? ANIMATIONS[anim] : anim;
    if (!a) { this.stop(); return false; }
    this.anim = a;
    this.t0 = performance.now();
    if (!this.raf) this._loop();
    return true;
  }

  _loop() {
    const tick = (now) => {
      if (!this.anim) { this.raf = null; return; }
      const a = this.anim, dur = a.duration || 1500;
      const u = ((now - this.t0) % dur) / dur;
      let pose;
      if (a.pingpong) {
        const tri = u < 0.5 ? u * 2 : (1 - u) * 2;
        pose = lerpPose(a.poses[0], a.poses[1], easeInOut(tri));
      } else {
        const n = a.poses.length, f = u * n, i = Math.floor(f) % n, j = (i + 1) % n;
        pose = lerpPose(a.poses[i], a.poses[j], easeInOut(f - Math.floor(f)));
      }
      this.setPose(pose);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.anim = null;
  }
}

// ---- Übungs-Animationen ----
// Jede Übung = wenige Keyframe-Posen, im Ping-Pong (oder Loop) abgespielt.
export const ANIMATIONS = {
  // Kniebeuge: Hüfte runter, Oberkörper leicht vor, Knie nach vorne; Arme vor.
  squats: {
    duration: 1700, pingpong: true,
    poses: [
      merge({ y: 0, torso: 6, foot: 92, aun: 96, afn: 96, auf: 96, aff: 96, ltn: 183, lsn: 181, ltf: 177, lsf: 179 }),
      merge({ y: 19, torso: 32, foot: 86, aun: 92, afn: 92, auf: 92, aff: 92, ltn: 132, lsn: 188, ltf: 128, lsf: 184 }),
    ],
  },
  // Liegestütz: Körper waagerecht, Arme stützen zum Boden; im "Down" Ellbogen beugen + Körper senken.
  pushups: {
    duration: 1500, pingpong: true,
    poses: [
      merge({ y: 18, torso: 90, head: 80, foot: 150, aun: 178, afn: 178, auf: 174, aff: 174, ltn: 256, lsn: 256, ltf: 252, lsf: 252 }),
      merge({ y: 27, torso: 90, head: 80, foot: 150, aun: 152, afn: 116, auf: 148, aff: 112, ltn: 256, lsn: 256, ltf: 252, lsf: 252 }),
    ],
  },
};
