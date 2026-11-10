// THE MAN WHO HID IN PLAIN SIGHT (Abbottabad, May 2 2011) : the shot list.
// One light per scene; witnesses are near-black with a thin red rim, the subject glows solid red. Slow camera, film grain.
import * as THREE from 'three';
import { ctx, setCtx, W, H, clamp, lerp, seg, eo, eio, eob, rr, ell } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { camera } from './core/engine.js';
import { Human } from './core/human.js';
import * as SETS from './core/sets3d.js';
import * as K from './core/kit.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z), lerpV = (a, b, k) => a.clone().lerp(b, k);
const NIGHT = { exposure: 1.25, bloom: 0.85, bloomThreshold: 0.55, vignette: 0.6, grain: 0.05, warm: 0 };
/** paper insert (map / document) drawn in 2D */
function paper(x, y, w, h, rot, draw, sc = 1) {
  if (sc <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 40;
  rr(-w / 2, -h / 2, w, h, 6); ctx.fillStyle = K.P.paper; ctx.fill(); ctx.shadowBlur = 0; draw(-w / 2, -h / 2);
  ctx.restore();
}

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.1);
  const cam = camera(36);
  const C = SETS.compound(), NS = SETS.nightSky(), ST = SETS.stairs(), COR = SETS.corridor();
  const CW = SETS.caseWall([0, 1, 2].map((k) => { const c = document.createElement('canvas'); c.width = 360; c.height = 420; const g = c.getContext('2d'), prev = ctx; setCtx(g); g.fillStyle = '#D8CFBA'; g.fillRect(0, 0, 360, 420); g.save(); g.translate(180, 210); g.scale(1.5, 1.5); K.polaroid(0, 0, 1, 0, ['house', 'glow', 'dark'][k]); g.restore(); setCtx(prev); return c; }));
  const person = (kind) => { const h = new Human({ face: false }); h.setAllMaterial(kind === 'subject' ? SETS.subjectMat() : SETS.witnessMat()); return h; };
  // the subject at his window (a shared glowing material we can dim)
  const redMat = SETS.subjectMat(2.2);
  const subjectWin = new Human({ face: false }); subjectWin.setAllMaterial(redMat);
  subjectWin.group.scale.setScalar(0.85); subjectWin.group.position.set(1.15, 1.52, -4.9); C.scene.add(subjectWin.group);
  const subjectUp = new Human({ face: false }); const upMat = SETS.subjectMat(2.2); subjectUp.setAllMaterial(upMat);
  subjectUp.group.position.set(0.85, 2.6, -2.72); ST.scene.add(subjectUp.group);
  // the SEALs: near-black with a red rim
  const walkers = []; for (let i = 0; i < 3; i++) { const h = person('witness'); C.scene.add(h.group); walkers.push(h); }
  // helicopters: two in flight, one wreck at the compound
  const HA = SETS.heli(), HB = SETS.heli(), HW = SETS.heli(); NS.scene.add(HA.group, HB.group); C.scene.add(HW.group);
  const render = (scene, focusP, extra = {}) => { if (cam.fov !== (extra.fov || 36)) { cam.fov = extra.fov || 36; cam.updateProjectionMatrix(); } E.render(scene, cam, { ...NIGHT, focus: cam.position.distanceTo(focusP), aperture: 0.0012, ...extra }); };
  const alone = () => { walkers.forEach((h) => (h.group.visible = false)); subjectWin.group.visible = false; HA.group.visible = HB.group.visible = HW.group.visible = false; C.update(0, { glow: 0 }); };

  // 1 · where do you hide? — the compound from high, push in; a red glow flickers on behind the upper window
  { const hd = Wd('hide', 0);
    add({ id: 'S01', at: 0, note: 'compound wide, red flickers on at the window on "hide"', draw(lt, d, t, blit) {
      alone(); subjectWin.group.visible = true;
      const g = lt < hd ? 0 : (Math.sin(t * 26) > -0.2 ? 1 : 0.15) * (0.35 + 0.65 * eo(seg(lt, hd, hd + 1.4)));
      C.update(t, { glow: g }); HA.group.visible = false;
      cam.position.copy(lerpV(V3(0.4, 2.9, 6.4), V3(0.2, 2.5, 4.9), eio(lt / d))); cam.lookAt(0, 2.2, -5); render(C.scene, V3(1.1, 2.8, -4.4)); blit();
    } });
    cue(0.3, 'tock', { gain: 0.4 }); }

  // 2 · not in a cave — the map insert: Abbottabad, compound circled
  { const st = cut(1), ci = Wd('wall', 1) - st;
    add({ id: 'S02', at: st, note: 'map paper insert, the compound circled in red', draw(lt, d, t, blit) {
      alone(); cam.position.set(0.2, 2.6, 5.4); cam.lookAt(0, 2.2, -5); render(C.scene, V3(0, 2.4, -5), { aperture: 0.012, maxblur: 0.016, exposure: 0.9 }); blit();
      const k = eo(clamp(lt / 0.5));
      K.dateStamp('MAY 2, 2011', 'ABBOTTABAD · PAKISTAN', clamp(lt / 1.6), 80, 300);
      paper(540, lerp(1150, 900, k), 840, 640, -0.03, (ox, oy) => {
        ctx.strokeStyle = '#6A6458'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(ox + 60, oy + 300); ctx.lineTo(ox + 780, oy + 300); ctx.moveTo(ox + 380, oy + 50); ctx.lineTo(ox + 380, oy + 590); ctx.stroke();
        for (const [bx, by, bw, bh] of [[90, 80, 130, 150], [90, 380, 130, 150], [480, 80, 120, 150], [480, 380, 150, 150], [560, 120, 90, 90]]) { rr(ox + bx, oy + by, bw, bh, 4); ctx.fillStyle = '#B9B09A'; ctx.fill(); }
        rr(ox + 430, oy + 220, 110, 90, 4); ctx.fillStyle = '#8A8270'; ctx.fill();
        ctx.font = '700 30px FreeMono'; ctx.fillStyle = K.P.redDeep; ctx.textAlign = 'left'; ctx.fillText('ABBOTTABAD', ox + 60, oy + 60);
      }, k);
      if (lt > ci) K.redCircle(540 + 430 - 420 + 55, lerp(1150, 900, k) + 220 - 320 + 45, 130, 90, seg(lt, ci, ci + 0.5));
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + ci, 'tock', { gain: 0.4 }); }

  // 3 · six years: the subject at his barred window, glowing
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'slow drift past the subject glowing in the upper window', draw(lt, d, t, blit) {
      alone(); subjectWin.group.visible = true; subjectWin.pose({ head: [6, 0, 0], shL: [8, 0, 3], shR: [8, 0, 3] });
      C.update(t, { glow: 0.95 });
      cam.position.copy(lerpV(V3(2.1, 2.9, -1.4), V3(1.5, 2.85, -1.9), eio(lt / d))); cam.lookAt(1.15, 2.85, -4.4); render(C.scene, V3(1.15, 2.85, -4.6), { fov: 42 }); blit();
    } });
    cue(st, 'whoosh', { gain: 0.4 }); }

  // 4 · no phones, no internet, trash burned — case file evidence
  { const st = cut(3), tb = Wd('burned', 3) - st;
    add({ id: 'S04', at: st, note: 'case file: redacted lines, the yard detail circled', draw(lt, d, t, blit) {
      alone(); cam.position.set(1.4, 2.7, 4.4); cam.lookAt(1.15, 2.8, -4.4); render(C.scene, V3(1.15, 2.8, -4.4), { aperture: 0.014, maxblur: 0.018, exposure: 0.85 }); blit();
      K.caseFile(540, 860, 1.3, 'COMPOUND PROFILE', 0, -0.03);
      K.redacted(300, 780, [300, 250, 320], clamp(lt / 1.4));
      if (lt > tb) K.redCircle(540 + 40, 860 + 96, 240, 80, seg(lt, tb, tb + 0.45));
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.3, 'tock', { gain: 0.35 }); cue(st + tb, 'tock', { gain: 0.4 }); }

  // 5 · just after midnight — the clock runs up to the GO
  { const st = cut(4), gp = Wd('Neptune', 4) - st;
    add({ id: 'S05', at: st, note: 'clock ticks past midnight; the operation file drops on "Neptune"', draw(lt, d, t, blit) {
      alone(); cam.position.set(0.6, 2.4, 3.6); cam.lookAt(0, 2.2, -5); render(C.scene, V3(0, 2.2, -5), { aperture: 0.013, maxblur: 0.017, exposure: 0.8 }); blit();
      K.clock(540, 620, 1.7, 12, Math.min(55, lt * 13));
      const k = eob(seg(lt, gp, gp + 0.45)); K.caseFile(540, lerp(1700, 1230, k), 1.15, 'OP. NEPTUNE SPEAR', 0, -0.04);
      K.dateStamp('MAY 2, 2011', 'AFTER MIDNIGHT', clamp(lt / 1.4), 80, 300);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + gp, 'thud', { gain: 0.5 }); cue(st + gp + 0.2, 'tock', { gain: 0.4 }); }

  // 6 · twenty-three SEALs — dark figures file past the streetlamp
  { const st = cut(5);
    add({ id: 'S06', at: st, note: 'the team walks through the lamp cone, one light', draw(lt, d, t, blit) {
      alone();
      walkers.forEach((h, i) => { h.group.visible = true; const p = clamp((lt - i * 0.55) / (d - 0.7)); h.group.position.set(lerp(0.6, 6.4, p), 0, 0.6 + i * 0.5); h.group.rotation.y = Math.PI / 2; h.walk(lt * 5 + i * 1.7, 0.75); });
      C.update(t, { glow: 0 });
      cam.position.copy(lerpV(V3(3.4, 1.15, 4.4), V3(3.9, 1.2, 3.6), eio(lt / d))); cam.lookAt(4.2, 1.1, 0.4); render(C.scene, V3(4.4, 1.1, 0.6), { fov: 40 }); blit();
      K.dateStamp('JALALABAD · AFGHANISTAN', 'THE TEAM DEPARTS', clamp(lt / 1.6), 80, 300);
    } });
    cue(st, 'whoosh', { gain: 0.45 }); }

  // 7 · two stealth Black Hawks over the mountains
  { const st = cut(6), bk = Wd('Black', 6) - st;
    add({ id: 'S07', at: st, note: 'two helicopter silhouettes drift; the second banks in on "Black"', draw(lt, d, t, blit) {
      HA.group.visible = true; HA.spin(t); HA.group.position.set(lerp(-4.5, 0.5, eio(lt / d)), lerp(2.6, 2.3, lt / d), -9); HA.group.rotation.set(0.04, 0, 0.03 * Math.sin(t * 0.9));
      HB.group.visible = lt > bk; HB.spin(t); const hb = clamp((lt - bk) / (d - bk)); HB.group.position.set(lerp(7.5, 4.6, eo(hb)), lerp(4.4, 3.4, eo(hb)), -12); HB.group.rotation.set(0, 0, -0.22 * (1 - hb) - 0.05);
      cam.position.copy(lerpV(V3(-0.6, 2.6, 0.6), V3(-0.2, 2.5, -0.4), eio(lt / d))); cam.lookAt(1.5, 2.4, -10); render(NS.scene, HA.group.position, { fov: 44, exposure: 1.55 }); blit();
    } });
    cue(st, 'slide', { dur: cut(7) - st - 0.4, gain: 0.55 }); }

  // 8 · the power dies — the neighbour windows cut out one by one
  { const st = cut(7), pw = Wd('power', 7) - st;
    add({ id: 'S08', at: st, note: 'windows go dark one by one; the streetlamp is the last light', draw(lt, d, t, blit) {
      alone();
      C.wins.forEach((w, i) => (w.visible = !(lt > pw - 0.9 + (C.wins.length - 1 - i) * 0.25)));   // neighbours cut first, the house last
      C.update(t, { glow: 0 });
      cam.position.copy(lerpV(V3(0.25, 6.5, 5.0), V3(0.15, 6.1, 4.2), eio(lt / d))); cam.lookAt(0, 0.6, -8); render(C.scene, V3(0, 1.6, -6), { fov: 55 }); blit();
      if (lt < pw - 0.9) K.dateStamp('01:00 LOCAL', 'THE LAST QUIET MINUTES', clamp(lt / 1.4), 80, 300);
    } });
    cue(st, 'whoosh', { gain: 0.45 }); for (let i = 0; i < 4; i++) cue(st + pw - 0.65 + i * 0.25, 'pop', { gain: 0.3 }); cue(st + pw, 'slide', { dur: cut(8) - st - pw, gain: 0.5 }); }

  // 9 · night vision on — a push down the dark corridor
  { const st = cut(8);
    add({ id: 'S09', at: st, note: 'corridor push, the flickering light sweeps', draw(lt, d, t, blit) {
      COR.update(t);
      cam.position.copy(lerpV(V3(0.2, 1.55, 1.6), V3(0.1, 1.5, -1.2), eio(lt / d))); cam.lookAt(0, 1.15, -10); render(COR.scene, V3(0, 1, -5), { fov: 58, exposure: 1.4 }); blit();
    } });
    cue(st, 'whoosh', { gain: 0.45 }); cue(st + 0.4, 'slide', { dur: cut(9) - st - 0.8, gain: 0.4 }); }

  // 10 · the Black Hawk slams into the dirt — one hard sound
  { const st = cut(9), im = Wd('dirt', 9) - st;
    add({ id: 'S10', at: st, note: 'the helicopter drops into the courtyard; dust, shake, black beat', draw(lt, d, t, blit) {
      alone(); HW.group.visible = true; HW.spin(t);
      const dp = seg(lt, 0, im);
      HW.group.position.set(-2.0, lerp(4.4, 1.45, eio(dp)), -4.6); HW.group.rotation.z = -0.3 * seg(lt, im - 0.08, im + 0.12);
      const shake = Math.max(0, 1 - (lt - im) / 0.7) * (lt > im ? 1 : 0);
      cam.position.set(0.2 + Math.sin(t * 67) * 0.045 * shake, 2.3, 5.2); cam.lookAt(-1.2, 2.0, -5.5); render(C.scene, V3(-1.6, 1.8, -5), { fov: 40, exposure: 1.5 + shake * 0.25 }); blit();
      if (lt > im) { const dk = seg(lt, im, im + 0.9);                                     // dust boils up over the wall
        for (let i = 0; i < 7; i++) { const px = 150 + i * 90 + Math.sin(i * 5 + t * 2) * 22, py = 1290 - dk * (140 + i * 28) + Math.sin(i * 3 + t * 1.6) * 14, r = (30 + i * 10) * (0.7 + dk); ctx.globalAlpha = 0.6 * (1 - dk); ell(px, py, r, r * 0.62, '#4A5563'); }
        ctx.globalAlpha = 1; }
      if (lt > im + 0.02 && lt < im + 0.14) { ctx.fillStyle = '#000'; ctx.fillRect(-300, -300, W + 600, H + 600); }   // the black beat
    } });
    cue(st, 'slide', { dur: Math.max(0.4, im - 0.2), gain: 0.6 }); cue(st + im, 'slam', { gain: 0.8 }); }

  // 11 · no one was hurt — the wreck settles, the team keeps moving
  { const st = cut(10);
    add({ id: 'S11', at: st, note: 'the tail pokes over the wall; figures move along it', draw(lt, d, t, blit) {
      HW.group.visible = true; HW.spin(t * 0.25); HW.group.position.set(-2.0, 1.45, -4.6); HW.group.rotation.set(0.06, 0.35, -0.3);
      walkers.forEach((h, i) => { h.group.visible = true; const p = clamp((lt - i * 0.5) / (d - 0.6)); h.group.position.set(lerp(4.6, -3.4, p), 0, -1.4 + i * 0.4); h.group.rotation.y = -Math.PI / 2; h.walk(lt * 4.6 + i, 0.6); });
      C.update(t, { glow: 0 });
      cam.position.copy(lerpV(V3(1.2, 1.5, 2.6), V3(0.6, 1.7, 1.8), eio(lt / d))); cam.lookAt(-1.4, 1.9, -5); render(C.scene, V3(-1.6, 1.7, -4.6), { fov: 42 }); blit();
      K.dateStamp('NO U.S. CASUALTIES', 'THE MISSION CONTINUES', clamp(lt / 1.5), 80, 300);
    } });
    cue(st, 'whoosh', { gain: 0.4 }); cue(st + 0.3, 'slide', { dur: cut(11) - st - 0.7, gain: 0.3 }); }

  // 12 · forty minutes in — the stairs; the red glow goes out on "dead"
  { const st = cut(11), dd = Wd('dead', 11) - st;
    add({ id: 'S12', at: st, note: 'push up the stairwell; the subject on the flight dims to black', draw(lt, d, t, blit) {
      upMat.emissiveIntensity = lerp(2.2, 0.08, eo(seg(lt, dd, dd + 0.6)));
      subjectUp.group.visible = true; subjectUp.pose({ head: [10, 0, 0], spine: [4, 0, 0] });
      cam.position.copy(lerpV(V3(0.15, 1.0, 0.5), V3(-0.1, 2.1, -0.9), eio(lt / d))); cam.lookAt(0.55, 2.7, -3.0); render(ST.scene, V3(0.85, 2.75, -2.72), { fov: 46 }); blit();
      K.dateStamp('40 MINUTES IN', 'THE THIRD FLOOR', clamp(lt / 1.4), 80, 300);
    } });
    cue(st, 'whoosh', { gain: 0.45 }); cue(st + dd, 'tock', { gain: 0.5 }); }

  // 13 · they took his files — the wreck burns behind the wall
  { const st = cut(12), wr = Wd('wreck', 12) - st;
    add({ id: 'S13', at: st, note: 'document insert; a red bloom rises over the wall on "wreck"', draw(lt, d, t, blit) {
      HW.group.visible = true; HW.spin(0); HW.group.position.set(-2.0, 1.45, -4.6); HW.group.rotation.set(0.06, 0.35, -0.3); walkers.forEach((h) => (h.group.visible = false)); C.update(t, { glow: 0 });
      cam.position.set(0.2, 2.4, 5.6); cam.lookAt(-1.0, 2.0, -5.5); render(C.scene, V3(-1.2, 1.8, -4.8), { aperture: 0.012, maxblur: 0.016, exposure: 0.95 }); blit();
      const k = eob(seg(lt, 0.1, 0.55)); K.caseFile(540, lerp(1750, 1150, k), 1.2, 'EVIDENCE — DOCUMENTS', 0, -0.04);
      const fb = seg(lt, wr, wr + 0.5), fade = 1 - seg(lt, wr + 1.6, wr + 2.6);
      if (fb > 0) { ctx.save(); ctx.globalAlpha = 0.75 * fb * fade; ctx.shadowColor = '#E4322B'; ctx.shadowBlur = 90; ell(300, 1290 - fb * 40, 130 * (0.6 + fb), 60 * (0.6 + fb), '#8E1D1A'); ctx.shadowBlur = 40; ell(300, 1290 - fb * 46, 60 * (0.6 + fb), 30 * (0.6 + fb), '#E4322B'); ctx.restore(); }
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + wr, 'thud', { gain: 0.4 }); cue(st + wr + 0.2, 'slide', { dur: cut(13) - st - wr - 0.4, gain: 0.35 }); }

  // 14 · found living in plain sight — the case wall
  { const st = cut(13), fd = Wd('found', 13) - st;
    add({ id: 'S14', at: st, note: 'case wall, the compound photo circled', draw(lt, d, t, blit) {
      cam.position.copy(lerpV(V3(0.5, 0.35, 8.6), V3(0.2, 0.25, 6.8), eio(lt / d))); cam.lookAt(0, 0.25, 0); render(CW.scene, V3(0, 0.25, 0), { bloom: 0.4 }); blit();
      K.dateStamp('THE COMPOUND', 'WAZIRISTAN HAVELI · ABBOTTABAD', clamp(lt / 1.6), 80, 300);
      if (lt > fd) K.redCircle(540, 950, 300, 230, seg(lt, fd, fd + 0.6));
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + fd, 'tock', { gain: 0.4 }); }

  // 15 · the only proof — dawn pulls back off the wreck
  { const st = cut(14);
    add({ id: 'S15', at: st, note: 'first light over the compound; slow pull-back, end on the drone', draw(lt, d, t, blit) {
      alone(); HW.group.visible = true; HW.spin(0); HW.group.position.set(-2.0, 1.45, -4.6); HW.group.rotation.set(0.06, 0.35, -0.3);
      const dawn = eio(lt / d), moonL = C.scene.children.find((c) => c.isDirectionalLight);
      if (moonL) moonL.intensity = lerp(3.0, 5.0, dawn);
      C.scene.background.set('#070B14').lerp(new THREE.Color('#1D2B4A'), dawn * 0.9); C.scene.fog.color.copy(C.scene.background);
      cam.position.copy(lerpV(V3(0.3, 2.2, 5.2), V3(0.05, 4.4, 9.6), eio(lt / d))); cam.lookAt(-0.8, 1.7, -6.5); render(C.scene, V3(-1.6, 1.7, -4.8), { fov: 38, exposure: lerp(1.2, 1.75, dawn) }); blit();
      K.filmLook(t, 0.8);
    } });
    cue(st, 'whoosh', { gain: 0.4 }); }
  // (S15 draws filmLook itself; nothing else follows)

  return { shots: S, cues: CUES };
}
