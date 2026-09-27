import * as THREE from 'three';
import { BLEU_NUIT_LETTERS } from './letters.js';
import carpetUrl from './assets/carpet.png';

// Procedural textures for the room, drawn onto <canvas> elements at load time.

// 2. Procedural Landscape Portrait (Rolling green hills, winding path, pink sun in purple sky)
export function createPaintingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  // Sky: Deep purple gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
  skyGrad.addColorStop(0, '#3a0a5c');
  skyGrad.addColorStop(1, '#480878');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Glowing pink/salmon sun
  const sunX = canvas.width * 0.5;
  const sunY = canvas.height * 0.3;
  const sunRad = 105;

  // Sun subtle aura
  const auraGrad = ctx.createRadialGradient(sunX, sunY, sunRad * 0.7, sunX, sunY, sunRad * 2);
  auraGrad.addColorStop(0, 'rgba(251, 131, 128, 0.4)');
  auraGrad.addColorStop(1, 'rgba(251, 131, 128, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRad * 2, 0, Math.PI * 2);
  ctx.fill();

  // Sun disc
  ctx.fillStyle = '#fb8380';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRad, 0, Math.PI * 2);
  ctx.fill();

  // Background gentle rolling hills (light mint green)
  ctx.fillStyle = '#6dd97f';
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.58);
  ctx.quadraticCurveTo(canvas.width * 0.25, canvas.height * 0.44, canvas.width * 0.5, canvas.height * 0.52);
  ctx.quadraticCurveTo(canvas.width * 0.75, canvas.height * 0.42, canvas.width, canvas.height * 0.5);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();

  // Foreground hills (rich vibrant green)
  ctx.fillStyle = '#46ab3c';
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.58);
  ctx.quadraticCurveTo(canvas.width * 0.35, canvas.height * 0.66, canvas.width * 0.5, canvas.height * 0.56);
  ctx.lineTo(canvas.width * 0.5, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#3fa940';
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.5, canvas.height * 0.56);
  ctx.quadraticCurveTo(canvas.width * 0.7, canvas.height * 0.5, canvas.width, canvas.height * 0.64);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(canvas.width * 0.5, canvas.height);
  ctx.closePath();
  ctx.fill();

  // Light curving winding path down the center
  ctx.fillStyle = '#bbb8d8';
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.52, canvas.height * 0.56);
  ctx.bezierCurveTo(
    canvas.width * 0.44, canvas.height * 0.62,
    canvas.width * 0.56, canvas.height * 0.72,
    canvas.width * 0.30, canvas.height
  );
  ctx.lineTo(canvas.width * 0.12, canvas.height);
  ctx.bezierCurveTo(
    canvas.width * 0.36, canvas.height * 0.72,
    canvas.width * 0.40, canvas.height * 0.6,
    canvas.width * 0.49, canvas.height * 0.56
  );
  ctx.closePath();
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// Dense purple glitter for the letter faces, returned as a w x h canvas. Built with
// createImageData/putImageData only, so nothing is read back from a canvas. Fine grain is
// per-pixel sparkle over ~4-9px soft grains, plus two octaves of soft value noise for the clumps
// and dark blotches. The combined field is mapped to colour through the per-channel percentiles
// measured inside the photo's letters, so the tonal spread matches it.
function createGlitterLayer(w, h) {
  const n = w * h;
  const standardize = (a) => {
    let m = 0; for (let i = 0; i < n; i++) m += a[i]; m /= n;
    let v = 0; for (let i = 0; i < n; i++) v += (a[i] - m) * (a[i] - m);
    const k = 1 / Math.sqrt(v / n || 1);
    for (let i = 0; i < n; i++) a[i] = (a[i] - m) * k;
    return a;
  };
  const valueNoise = (cell) => {
    const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2;
    const g = new Float32Array(gw * gh);
    for (let i = 0; i < g.length; i++) g[i] = Math.random();
    const a = new Float32Array(n);
    for (let y = 0; y < h; y++) {
      const fy = y / cell, iy = Math.floor(fy); let ty = fy - iy; ty = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < w; x++) {
        const fx = x / cell, ix = Math.floor(fx); let tx = fx - ix; tx = tx * tx * (3 - 2 * tx);
        const p = iy * gw + ix;
        a[y * w + x] = (g[p] * (1 - tx) + g[p + 1] * tx) * (1 - ty) + (g[p + gw] * (1 - tx) + g[p + gw + 1] * tx) * ty;
      }
    }
    return standardize(a);
  };

  // Fine grain: per-pixel sparkle over ~4-9px soft grains (value noise avoids the axis-aligned
  // hatching a box blur leaves behind)
  const sparkle = new Float32Array(n);
  for (let i = 0; i < n; i++) sparkle[i] = Math.random();
  standardize(sparkle);
  const grain = valueNoise(4);
  const grainBig = valueNoise(9);
  const fine = new Float32Array(n);
  for (let i = 0; i < n; i++) fine[i] = 0.55 * sparkle[i] + 0.6 * grain[i] + 0.55 * grainBig[i];
  standardize(fine);
  const clumpBig = valueNoise(56);
  const clumpSmall = valueNoise(18);
  const clump = 0.2;    // weight of the soft clumps against the fine grain

  // Percentile tables (u = 0, 1, 5, 25, 50, 75, 95, 99, 100%) measured in the photo's letters
  const U = [0, 0.01, 0.05, 0.25, 0.5, 0.75, 0.95, 0.99, 1];
  const R = [26, 32, 39, 59, 82, 108, 142, 162, 190];
  const G = [0, 0, 5, 19, 40, 64, 98, 119, 150];
  const B = [118, 126, 136, 157, 179, 204, 235, 251, 255];
  const lerpTable = (t, u) => {
    let k = 1; while (k < U.length - 1 && u > U[k]) k++;
    const f = (u - U[k - 1]) / (U[k] - U[k - 1]);
    return t[k - 1] + (t[k] - t[k - 1]) * f;
  };

  const layer = document.createElement('canvas');
  layer.width = w;
  layer.height = h;
  const lctx = layer.getContext('2d');
  const img = lctx.createImageData(w, h);
  const d = img.data;
  const wFine = Math.sqrt(1 - clump * clump);
  for (let i = 0; i < n; i++) {
    const z = wFine * fine[i] + clump * (0.8 * clumpBig[i] + 0.6 * clumpSmall[i]);
    const u = 1 / (1 + Math.exp(-1.702 * z));   // logistic ~ normal CDF
    d[i * 4] = lerpTable(R, u);
    d[i * 4 + 1] = lerpTable(G, u);
    d[i * 4 + 2] = lerpTable(B, u);
    d[i * 4 + 3] = 255;
  }
  lctx.putImageData(img, 0, 0);
  return layer;
}

export function createBleuNuitTexture() {
  // Square, to match the square back wall, so the lettering keeps the photo's proportions.
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');

  // Deep blue-black wall (the photo's background, sampled)
  ctx.fillStyle = '#09022e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle textured wall noise
  ctx.fillStyle = 'rgba(40, 20, 90, 0.2)';
  for (let i = 0; i < 70000; i++) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
  }

  // Bounds of the lettering block, then centre it (slightly above middle) on the canvas
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  BLEU_NUIT_LETTERS.forEach((letter) => letter[0].forEach(([px, py]) => {
    minX = Math.min(minX, px); maxX = Math.max(maxX, px);
    minY = Math.min(minY, py); maxY = Math.max(maxY, py);
  }));
  const offX = Math.round(canvas.width / 2 - (minX + maxX) / 2);
  const offY = Math.round(canvas.height * 0.47 - (minY + maxY) / 2);

  const letters = new Path2D();
  BLEU_NUIT_LETTERS.forEach((letter) => letter.forEach((loop) => {
    loop.forEach(([px, py], i) => (i ? letters.lineTo(px + offX, py + offY) : letters.moveTo(px + offX, py + offY)));
    letters.closePath();
  }));

  // Glitter fills the letters (even-odd, so the B's counters stay open). The keyline and the
  // inner shadow are bands hugging the inside of every outline, drawn by stroking the same
  // path at twice the band width and clipping to the letters.
  const bx = minX + offX, by = minY + offY;
  const glitter = createGlitterLayer(maxX - minX + 1, maxY - minY + 1);
  ctx.save();
  ctx.clip(letters, 'evenodd');
  ctx.drawImage(glitter, bx, by);
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 10;

  // Inner shadow: in the photo the glitter is darker just inside the keyline and recovers to
  // full brightness ~28px in. Measured as the blend towards (28, 7, 152): about 50% out to
  // 16px, falling to 0 at 28px. Stacked strokes, each clipped to the letters, approximate it.
  [[16, 0.05], [18, 0.07], [20, 0.08], [22, 0.10], [24, 0.08], [26, 0.08], [28, 0.04]].forEach(([reach, a]) => {
    ctx.strokeStyle = `rgba(28, 7, 152, ${a})`;
    ctx.lineWidth = reach * 2;
    ctx.stroke(letters);
  });
  ctx.strokeStyle = '#553ccd';   // keyline: ~9px band, the photo's measured colour
  ctx.lineWidth = 18;
  ctx.stroke(letters);
  ctx.restore();

  return new THREE.CanvasTexture(canvas);
}

// The carpet is a real image (src/assets/carpet.png, 1448 x 1086): light periwinkle ground with
// royal-blue dots. It loads asynchronously, so the caller gets a texture via onLoad; until then (or if
// the load fails) the carpet material stays flat periwinkle.
export function loadCarpetTexture(renderer, onLoad, onError) {
  new THREE.TextureLoader().load(carpetUrl, (tex) => {
    // The image is not seamless (dots are cut at its edges), so it is laid over the carpet once, not
    // repeated. It is 4:3 and the carpet 3:2, so use the middle 8/9 of its width; that keeps the dots
    // round at the image's own density (about 12 dot clusters across the carpet).
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(8 / 9, 1);
    tex.offset.set(1 / 18, 0);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    onLoad(tex);
  }, undefined, onError);
}

// Suede for the side walls: a soft, low-contrast mottling (dark blotches with soft edges) over a fine
// grain, as in the capture, where the wall varies about +/- 12% in brightness (about 7% in blotches, 4%
// in grain). It is a multiplier on the wall colour, so it is stored around SUEDE_MEAN (a texel can't be
// brighter than 1) and the wall colour is scaled up by 1 / SUEDE_MEAN to keep the wall's overall
// brightness where it was. All the noise wraps, so the texture repeats without seams.
export const SUEDE_MEAN = 0.92;

export function createSuedeTexture(renderer, repeat = 3) {
  const size = 512;
  const n = size * size;

  // Periodic value noise on a cell grid that wraps at the texture edge
  const wrapNoise = (cell) => {
    const g = Math.ceil(size / cell);
    const grid = new Float32Array(g * g);
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random();
    const a = new Float32Array(n);
    for (let y = 0; y < size; y++) {
      const fy = y / cell, iy = Math.floor(fy); let ty = fy - iy; ty = ty * ty * (3 - 2 * ty);
      const y0 = iy % g, y1 = (iy + 1) % g;
      for (let x = 0; x < size; x++) {
        const fx = x / cell, ix = Math.floor(fx); let tx = fx - ix; tx = tx * tx * (3 - 2 * tx);
        const x0 = ix % g, x1 = (ix + 1) % g;
        a[y * size + x] = (grid[y0 * g + x0] * (1 - tx) + grid[y0 * g + x1] * tx) * (1 - ty)
                        + (grid[y1 * g + x0] * (1 - tx) + grid[y1 * g + x1] * tx) * ty;
      }
    }
    // zero mean, unit variance
    let m = 0; for (let i = 0; i < n; i++) m += a[i]; m /= n;
    let v = 0; for (let i = 0; i < n; i++) v += (a[i] - m) * (a[i] - m);
    const k = 1 / Math.sqrt(v / n || 1);
    for (let i = 0; i < n; i++) a[i] = (a[i] - m) * k;
    return a;
  };

  const big = wrapNoise(64);      // soft blotches, about 0.4 wall units across
  const mid = wrapNoise(24);
  const grain = wrapNoise(2);     // fine nap

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < n; i++) {
    const delta = 0.05 * big[i] + 0.035 * mid[i] + 0.04 * grain[i] + 0.02 * (Math.random() - 0.5) * 3.46;
    const v = Math.max(0, Math.min(255, 255 * SUEDE_MEAN * (1 + delta)));
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
    d[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}
