import './style.css';
import { createStage } from './scene.js';
import { buildRoom } from './room.js';
import { createTranslucentPurpleArmchair } from './chair.js';
import { createControls } from './controls.js';
import { createUI } from './ui.js';

const container = document.getElementById('canvas-container');
const { scene, camera, renderer } = createStage(container);

buildRoom(scene, renderer);
scene.add(createTranslucentPurpleArmchair());

const ui = createUI();
const controls = createControls({
  camera,
  dom: renderer.domElement,
  onFovChange: ui.showFov,
  onAutoRotateChange: ui.showAutoRotate
});
ui.bind(controls);

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
  last = now;
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
