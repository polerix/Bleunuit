import './style.css';
import { createStage } from './scene.js';
import { buildRoom, HALF_SIZE } from './room.js';
import { createArmchair } from './chair.js';
import { createControls, DEFAULT_VIEW } from './controls.js';
import { createUI } from './ui.js';

const container = document.getElementById('canvas-container');
const { scene, camera, renderer } = createStage(container);

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

// Handle window resizing dynamically
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  controls.update();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const start = performance.now();
let last = start;

function animate(now) {
  requestAnimationFrame(animate);
  controls.tick((now - last) / 1000, (now - start) / 1000);
  room.update(camera);
  // The floor is single-sided, so from below it vanishes; the chair would then hang in mid-air
  chair.visible = camera.position.y > -HALF_SIZE;
  last = now;
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
