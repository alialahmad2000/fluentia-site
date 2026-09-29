/**
 * Scene: the phone of «أول كلمة» — modelled here, not downloaded.
 *
 * A rounded titanium body (physical metal lit by a generated room environment,
 * so every tilt slides real reflections across the frame), a black glass front,
 * the screen as a live canvas texture, a glass sheen that moves with the
 * rotation, side buttons, and a soft contact shadow that tightens as it nears
 * the floor. The camera is fixed; the pose comes from phonePose() so the voice
 * line (drawn on the page's voice layer) meets the microphone exactly.
 *
 * The screen shows: nothing (off) → the voice arriving through the mic as a
 * live recording waveform (the same wave() as the line) → the first frame of
 * the real footage the DOM phone then plays (matched swap).
 *
 * params (from the leg): p, rest {x,y,w,h}, floorY, energy, poster (url)
 */
import {
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  BoxGeometry,
  Shape,
  ShapeGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { phonePose } from "../legs/phonePose";
import { wave, voiceNow } from "../core/voice";

const W0 = 0.47; // model width (height = 1)
const D0 = 0.05;
const R0 = 0.075;

function roundedRect(w, h, r) {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function uvFit(geo, w, h) {
  // ShapeGeometry UVs are in shape units; map them to 0..1 over the box
  const uv = geo.attributes.uv;
  const pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  uv.needsUpdate = true;
  return geo;
}

export function create(renderer) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 6);
  const TAN = Math.tan((30 / 2) * (Math.PI / 180));
  const disposables = [];
  const keep = (x) => (disposables.push(x), x);

  const pmrem = new PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  pmrem.dispose();
  scene.environment = envRT.texture;
  disposables.push(envRT);

  const phone = new Group();
  scene.add(phone);

  // graphite titanium — the DOM phone after the swap wears the same colour
  const frame = keep(new MeshPhysicalMaterial({ color: new Color("#4a5260"), metalness: 1, roughness: 0.32, clearcoat: 0.4, clearcoatRoughness: 0.2 }));
  const body = new Mesh(keep(new RoundedBoxGeometry(W0, 1, D0, 6, R0)), frame);
  phone.add(body);

  const frontGlass = keep(new MeshPhysicalMaterial({ color: new Color("#05070b"), metalness: 0.2, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 }));
  const front = new Mesh(keep(new ShapeGeometry(roundedRect(W0 - 0.012, 1 - 0.012, R0 - 0.006), 12)), frontGlass);
  front.position.z = D0 / 2 + 0.0008;
  phone.add(front);

  // the screen: a live canvas
  const SW = W0 - 0.04;
  const SH = 1 - 0.04;
  const cv = document.createElement("canvas");
  cv.width = 540;
  cv.height = Math.round(540 * (SH / SW));
  const cx = cv.getContext("2d");
  const tex = keep(new CanvasTexture(cv));
  tex.colorSpace = SRGBColorSpace;
  const screenMat = keep(new MeshBasicMaterial({ map: tex, toneMapped: false }));
  const screen = new Mesh(uvFit(keep(new ShapeGeometry(roundedRect(SW, SH, R0 - 0.02), 16)), SW, SH), screenMat);
  screen.position.z = D0 / 2 + 0.0016;
  phone.add(screen);

  // glass sheen over the screen: reflections slide as it turns
  const sheenMat = keep(new MeshPhysicalMaterial({ color: new Color("#ffffff"), metalness: 0, roughness: 0.06, transparent: true, opacity: 0.1, clearcoat: 1 }));
  const sheen = new Mesh(keep(new ShapeGeometry(roundedRect(W0 - 0.012, 1 - 0.012, R0 - 0.006), 12)), sheenMat);
  sheen.position.z = D0 / 2 + 0.0024;
  phone.add(sheen);

  // side buttons
  const btnGeo = keep(new BoxGeometry(0.008, 0.09, 0.022));
  [
    [W0 / 2 + 0.002, 0.2],
    [-W0 / 2 - 0.002, 0.24],
    [-W0 / 2 - 0.002, 0.12],
  ].forEach(([x, y]) => {
    const b = new Mesh(btnGeo, frame);
    b.position.set(x, y, 0);
    phone.add(b);
  });

  // contact shadow on the page
  const sh = document.createElement("canvas");
  sh.width = 256;
  sh.height = 64;
  const shx = sh.getContext("2d");
  const g = shx.createRadialGradient(128, 32, 2, 128, 32, 124);
  g.addColorStop(0, "rgba(10,26,51,0.55)");
  g.addColorStop(1, "rgba(10,26,51,0)");
  shx.fillStyle = g;
  shx.scale(1, 0.26);
  shx.fillRect(0, 0, 256, 256);
  const shadowMat = keep(new MeshBasicMaterial({ map: keep(new CanvasTexture(sh)), transparent: true, depthWrite: false, side: DoubleSide }));
  const shadow = new Mesh(keep(new PlaneGeometry(1, 0.25)), shadowMat);
  scene.add(shadow);

  const poster = new Image();
  let posterReady = false;
  poster.onload = () => (posterReady = true);

  const params = { p: 0, rest: { x: 0, y: 0, w: 100, h: 200 }, floorY: 700, poster: null };
  let W = 1;
  let H = 1;
  let upp = 0.01;
  function resize(w, h) {
    W = w;
    H = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    upp = (2 * 6 * TAN) / h; // world units per px at the phone's plane
  }

  let lastKey = "";
  function drawScreen(p, t) {
    const animating = p > 0.49 && p < 0.88;
    const key = `${posterReady}|${p < 0.49 ? "a" : p >= 0.88 ? "b" : "c"}`;
    if (!animating && key === lastKey) return;
    lastKey = key;
    const w = cv.width;
    const h = cv.height;
    cx.fillStyle = "#050b16";
    cx.fillRect(0, 0, w, h);
    const rec = Math.min(1, Math.max(0, (p - 0.5) / 0.06)) * (1 - Math.min(1, Math.max(0, (p - 0.8) / 0.05)));
    // one direction only: lock screen → the voice arriving → the real screen
    const show = Math.min(1, Math.max(0, (p - 0.8) / 0.07));
    if (rec < 0.02 && show < 0.02) {
      cx.fillStyle = "#000";
      cx.beginPath();
      cx.roundRect(w / 2 - 70, 26, 140, 38, 19);
      cx.fill();
      cx.fillStyle = "#f3ede2";
      cx.textAlign = "center";
      cx.font = "600 120px Barlow Condensed, Inter, sans-serif";
      cx.fillText("9:41", w / 2, h * 0.24);
      cx.fillStyle = "rgba(243,237,226,0.18)";
      cx.beginPath();
      cx.roundRect(w / 2 - 60, h - 40, 120, 8, 4);
      cx.fill();
    }
    if (rec > 0) {
      const v = voiceNow();
      cx.globalAlpha = rec;
      // island
      cx.fillStyle = "#000";
      cx.beginPath();
      cx.roundRect(w / 2 - 70, 26, 140, 38, 19);
      cx.fill();
      // the voice, arrived: the same wave, now filling the screen
      const mid = h * 0.5;
      const amp = 60 + v.energy * 80;
      cx.lineCap = "round";
      for (const [lw, a] of [[5, 1]]) {
        cx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const u = i / 120;
          const x = 30 + (w - 60) * u;
          const y = mid + wave(u, t * 1.7, amp);
          if (i) cx.lineTo(x, y);
          else cx.moveTo(x, y);
        }
        cx.strokeStyle = `rgba(56,189,248,${a})`;
        cx.lineWidth = lw;
        cx.stroke();
      }
      // a recording light
      cx.fillStyle = `rgba(244,63,94,${0.5 + 0.5 * Math.sin(t * 6)})`;
      cx.beginPath();
      cx.arc(w / 2, h * 0.78, 12, 0, Math.PI * 2);
      cx.fill();
      cx.globalAlpha = 1;
    }
    if (show > 0 && posterReady) {
      cx.globalAlpha = show;
      const s = Math.max(w / poster.width, h / poster.height);
      cx.drawImage(poster, (w - poster.width * s) / 2, (h - poster.height * s) / 2, poster.width * s, poster.height * s);
      cx.globalAlpha = 1;
    }
    tex.needsUpdate = true;
  }

  function update(t) {
    const time = t / 1000;
    if (params.poster && poster.src.indexOf(params.poster) < 0) poster.src = params.poster;
    const pose = phonePose(params.p, params.rest, params.floorY, H, time);
    const scale = params.rest.h * upp;
    phone.scale.setScalar(scale);
    phone.position.set((pose.cx - W / 2) * upp, -(pose.cy - H / 2) * upp, 0);
    phone.rotation.set(pose.rx, pose.ry, pose.rz);
    // the shadow sits on the floor line, tighter and darker as the phone comes down
    const gap = Math.max(0, params.floorY - (pose.cy + params.rest.h / 2));
    const near = 1 - Math.min(1, gap / (H * 0.5));
    shadow.position.set((pose.cx - W / 2) * upp, -(params.floorY + 6 - H / 2) * upp, -0.2);
    shadow.scale.set(scale * W0 * (1.6 - near * 0.5), scale * 0.5, 1);
    shadowMat.opacity = near * (params.p < 0.5 ? 1 : 1 - Math.min(1, (params.p - 0.5) / 0.1));
    sheenMat.opacity = 0.06 + Math.abs(pose.ry) * 0.25;
    drawScreen(params.p, time);
  }

  return {
    params,
    clear: [0xf3f7fb, 1],
    update,
    render: (r) => r.render(scene, camera),
    resize,
    dispose: () => disposables.forEach((x) => x.dispose()),
  };
}
