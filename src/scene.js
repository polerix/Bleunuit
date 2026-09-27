import * as THREE from 'three';

// Keep the colour pipeline the room was tuned in (three r128): colours and textures are used as
// written, and the output is not sRGB-encoded. Turning colour management on would change every colour
// in the room, so it stays off. Import this module before creating any colours.
THREE.ColorManagement.enabled = false;

// Renderer, camera, background and lights. The camera's aspect is fixed at ASPECT_RATIO (src/layout.js):
// the room is always framed at that ratio, so the camera never needs to know the window's own shape,
// only how many pixels its fixed-ratio frame currently has. The caller sizes the renderer to that frame.
export function createStage(container, aspect) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07052e');   // darkest blue, matches the page background

  const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;   // no sRGB encode on output, as in r128
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  // Flat, even lighting. Since r155 three uses physically based light units, where r128's lights were
  // pi times brighter for the same intensity, so the original intensities are scaled by pi. A further
  // 1.04 makes the lit surfaces (walls, floor, carpet) match r128 renders, which measured about 4%
  // brighter for the same setup.
  const K = Math.PI * 1.04;
  const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.95 * K);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.4 * K);
  dirLight1.position.set(0, 8, 8);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xa5b4fc, 0.35 * K);
  dirLight2.position.set(0, -6, 6);
  scene.add(dirLight2);

  return { scene, camera, renderer };
}
