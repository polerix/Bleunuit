import './style.css';
import { createStage } from './scene.js';
import { buildRoom, HALF_SIZE } from './room.js';
import { createArmchair } from './chair.js';
import { createControls, DEFAULT_VIEW } from './controls.js';
import { createUI } from './ui.js';
import { ASPECT_RATIO, layoutStage } from './layout.js';

const stage = document.getElementById('stage');
const container = document.getElementById('canvas-container');
const { scene, camera, renderer } = createStage(container, ASPECT_RATIO);

const room = buildRoom(scene, renderer);
const chair = createArmchair();
scene.add(chair);

const ui = createUI();
const controls = createControls({
  camera,
  dom: renderer.domElement,
  onFovChange: ui.showFov,
  onAutoRotateChange: ui.showAutoRotate
});
ui.bind(controls);
ui.showFov(DEFAULT_VIEW.fov);

// Fit #stage to the window at ASPECT_RATIO (letterboxed or pillarboxed) and size the renderer to match.
// The camera's aspect never changes here: it is fixed at ASPECT_RATIO in createStage(), because the
// frame is always that ratio regardless of the window's own shape.
function resize() {
  const { width, height } = layoutStage(stage);
  renderer.setSize(width, height);
}

resize();
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);

let last = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  controls.tick((now - last) / 1000);
  room.update(camera);
  // The floor is single-sided, so from below it vanishes; the chair would then hang in mid-air
  chair.visible = camera.position.y > -HALF_SIZE;
  last = now;
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
