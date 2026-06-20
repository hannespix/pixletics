// Selbstkontrolle für die Holzpuppe-Animationen (Entwickler-Tool, NICHT Teil der PWA).
// Misst pro Übung objektive Kennzahlen und flaggt Ausreißer, damit Animations-
// Probleme auffallen, ohne jede Übung manuell zu prüfen.
//
// Nutzung:  node tools/figure-qa.mjs
//
// Kennzahlen je Übung (über den ganmzen Bewegungszyklus gemessen):
//   frac  Anteil, den die Figur vom (figur-zentrierten) Bühnen-Fenster ausfüllt
//         -> zu klein? (Figur sollte das Fenster gut füllen)
//   amp   maximale Gelenk-Bewegung -> zu klein = wirkt statisch
//   brch  wie weit ragt die Figur unter den Boden (GROUND_Y=104) -> sollte ~0
//   lift  wie hoch heben die Füße ab -> bei Sprüngen sollten sie deutlich abheben
//   poff  wie weit ragt ein Gerät aus dem figur-zentrierten Fenster heraus
//
// Flags: FLOOR (Boden-Durchdringung), SMALL (Figur zu klein), STATIC (kaum
//        Bewegung), NOJUMP (Sprung-Übung ohne Absprung), PROPOFF (Gerät stark
//        außerhalb des Rahmens). Statische Halte-Übungen sind ausgenommen.
import { EXERCISES } from '../assets/js/figure.js';

const GY = 104, STAGE_S = 82;
const skipStatic = new Set(['plank', 'wallsit', 'sideplank', 'idle']);
const isJump = new Set(['jumpsquats', 'burpees', 'circ-boxjump']);
const rows = [];
for (const name in EXERCISES) {
  if (name.startsWith('rest_') || name === 'idle') continue;
  const a = EXERCISES[name];
  let fmnx = 1e9, fmny = 1e9, fmxx = -1e9, fmxy = -1e9, breach = -1, footMinY = 1e9, propOff = 0;
  const jr = {};
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const P = a.solve(i / N);
    for (const k in P) {
      const p = P[k]; if (!Array.isArray(p) || p.length !== 2 || typeof p[0] !== 'number') continue;
      const r = k === 'head' ? 8 : 3;
      fmnx = Math.min(fmnx, p[0] - r); fmxx = Math.max(fmxx, p[0] + r); fmny = Math.min(fmny, p[1] - r); fmxy = Math.max(fmxy, p[1] + r);
      breach = Math.max(breach, p[1] - GY);
      if (k.startsWith('toe') || k.startsWith('ank')) footMinY = Math.min(footMinY, p[1]);
      const j = (jr[k] = jr[k] || { a: 1e9, b: -1e9, c: 1e9, d: -1e9 });
      j.a = Math.min(j.a, p[0]); j.b = Math.max(j.b, p[0]); j.c = Math.min(j.c, p[1]); j.d = Math.max(j.d, p[1]);
    }
  }
  const figW = fmxx - fmnx, figH = fmxy - fmny, figDim = Math.max(figW, figH);
  const cx = (fmnx + fmxx) / 2, cy = (fmny + fmxy) / 2, S = Math.max(STAGE_S, figW, figH);
  for (let i = 0; i <= 8; i++) for (const pr of (a.solve(i / 8).props || [])) {
    let x0, x1, y0, y1;
    if (pr.type === 'rect') { x0 = pr.x; x1 = pr.x + pr.w; y0 = pr.y; y1 = pr.y + pr.h; }
    else if (pr.type === 'circle' || pr.type === 'kb') { x0 = pr.x - pr.r; x1 = pr.x + pr.r; y0 = pr.y - pr.r; y1 = pr.y + pr.r; }
    else if (pr.type === 'ellipse') { x0 = pr.x - pr.rx; x1 = pr.x + pr.rx; y0 = pr.y - pr.ry; y1 = pr.y + pr.ry; }
    else if (pr.type === 'line') { x0 = Math.min(pr.x1, pr.x2); x1 = Math.max(pr.x1, pr.x2); y0 = Math.min(pr.y1, pr.y2); y1 = Math.max(pr.y1, pr.y2); }
    else continue;
    propOff = Math.max(propOff, (cx - S / 2) - x0, x1 - (cx + S / 2), (cy - S / 2) - y0, y1 - (cy + S / 2));
  }
  let amp = 0; for (const k in jr) amp = Math.max(amp, jr[k].b - jr[k].a, jr[k].d - jr[k].c);
  const figFrac = figDim / S, footLift = GY - footMinY;
  const f = [];
  if (breach > 2.5) f.push('FLOOR+' + breach.toFixed(0));
  if (figFrac < 0.72) f.push('SMALL ' + figFrac.toFixed(2));
  if (!skipStatic.has(name) && amp < 7) f.push('STATIC ' + amp.toFixed(0));
  if (isJump.has(name) && footLift < 6) f.push('NOJUMP ' + footLift.toFixed(0));
  if (propOff > 26) f.push('PROPOFF+' + propOff.toFixed(0));
  rows.push({ name, figFrac: figFrac.toFixed(2), amp: amp.toFixed(0), breach: breach.toFixed(0), footLift: footLift.toFixed(0), propOff: propOff.toFixed(0), flags: f.join(' ') });
}
rows.sort((x, y) => (y.flags ? 1 : 0) - (x.flags ? 1 : 0));
console.log('name'.padEnd(18), 'frac', 'amp', 'brch', 'lift', 'poff', '  FLAGS');
for (const r of rows) console.log(r.name.padEnd(18), r.figFrac, r.amp.padStart(3), r.breach.padStart(3), r.footLift.padStart(3), r.propOff.padStart(3), ' ', r.flags);
console.log('\nMit Flags:', rows.filter((r) => r.flags).length, '/', rows.length);
