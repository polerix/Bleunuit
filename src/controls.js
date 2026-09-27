import * as THREE from 'three';
import { HALF_SIZE } from './room.js';

// Camera navigation: the camera orbits a target point on a sphere, and the field of view is the
// "zoom". The camera backs away as the FOV narrows so the room stays about the same size on screen and
// only the perspective changes, from wide angle (92 deg) to flat/telephoto (22 deg).
const BASE_FOV = 60;        // the FOV at which BASE_RADIUS frames the room
const BASE_RADIUS = 10.5;
const MIN_FOV = 22;
const MAX_FOV = 92;

// How far the camera sits from its pivot at a given FOV: backing away as the FOV narrows keeps the
// room about the same size on screen. The tan(fov/2) ratio holds object scale steady while the
// perspective changes.
function orbitRadius(fovDeg) {
  const rad = THREE.MathUtils.degToRad;
  return BASE_RADIUS * Math.tan(rad(BASE_FOV) / 2) / Math.tan(rad(fovDeg) / 2);
}

// The opening and reset view, recovered from the TV capture (reference/capture-geometry.md).
// The capture's camera is level with 44 degrees of vertical FOV and looks 39.3 degrees to the right of
// straight at the sign wall, and the wall corner stands at x = 751.6 of 1206 with its top and bottom at
// y = 138 and 657 of 880 (horizon at the image's centre line). The orbit camera always looks at its pivot,
// so those landmarks fix where the pivot has to be: solve for the camera position that puts the room's
// back-right corner (HALF_SIZE, -HALF_SIZE) on those pixels, then place the pivot on the view axis one
// orbit radius ahead of it. Nothing here is tuned by eye.
const CAPTURE = { width: 1206, height: 880, cornerX: 751.6, cornerTopY: 138, cornerBottomY: 657, yawDeg: 39.3 };

function captureView(fovDeg) {
  const rad = THREE.MathUtils.degToRad;
  const cy = CAPTURE.height / 2;
  const f = cy / Math.tan(rad(fovDeg) / 2);                              // focal length in capture pixels
  const depth = f * 2 * HALF_SIZE / (CAPTURE.cornerBottomY - CAPTURE.cornerTopY);   // camera to corner, along the view axis
  const lateral = (CAPTURE.cornerX - CAPTURE.width / 2) / f * depth;     // corner's offset to the right of the axis
  const eyeFromTop = HALF_SIZE - (cy - CAPTURE.cornerTopY) * depth / f;       // the corner's top and bottom
  const eyeFromBottom = (CAPTURE.cornerBottomY - cy) * depth / f - HALF_SIZE;  // each give the eye height
  const eyeY = (eyeFromTop + eyeFromBottom) / 2;
  const yaw = rad(CAPTURE.yawDeg);
  const fw = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));       // view direction (X, Z)
  const rt = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));        // screen-right direction
  const camera = new THREE.Vector3(HALF_SIZE, eyeY, -HALF_SIZE).addScaledVector(fw, -depth).addScaledVector(rt, -lateral);
  const target = camera.clone().addScaledVector(fw, orbitRadius(fovDeg));
  return { target, theta: -yaw };
}

const OPENING_FOV = 44;
const OPENING = captureView(OPENING_FOV);

export const DEFAULT_VIEW = {
  fov: OPENING_FOV,
  theta: OPENING.theta,
  phi: Math.PI * 0.5,          // level camera
  target: OPENING.target       // the orbit pivot, off the room's centre
};
const HOME_PHI = DEFAULT_VIEW.phi;

export function createControls({ camera, dom, onFovChange, onAutoRotateChange }) {
  const targetPoint = DEFAULT_VIEW.target.clone();

  let currentFov = DEFAULT_VIEW.fov;
  const spherical = {
    radius: BASE_RADIUS,
    theta: DEFAULT_VIEW.theta,   // azimuth horizontal angle (radians)
    phi: HOME_PHI      // polar elevation angle (radians)
  };

  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let initialPinchDist = null;
  let autoRotate = false;

  function update() {
    // Clamp angles to stay inside aesthetic viewing bounds
    spherical.phi = Math.max(0.25 * Math.PI, Math.min(0.60 * Math.PI, spherical.phi));
    spherical.theta = Math.max(-0.65 * Math.PI, Math.min(0.65 * Math.PI, spherical.theta));

    // When FOV decreases (flatter perspective), back the camera up to compensate framing.
    // The tan(fov/2) ratio keeps object scale perceptually stable while altering perspective depth.
    const effectiveRadius = orbitRadius(currentFov);

    camera.fov = currentFov;
    camera.updateProjectionMatrix();

    camera.position.x = targetPoint.x + effectiveRadius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.position.y = targetPoint.y + effectiveRadius * Math.cos(spherical.phi);
    camera.position.z = targetPoint.z + effectiveRadius * Math.sin(spherical.phi) * Math.cos(spherical.theta);

    camera.lookAt(targetPoint);
  }

  function setFov(value) {
    currentFov = Math.max(MIN_FOV, Math.min(MAX_FOV, value));
    onFovChange(currentFov);
    update();
  }

  function setAutoRotate(value) {
    autoRotate = value;
    onAutoRotateChange(autoRotate);
  }

  // Mouse drag
  dom.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
    setAutoRotate(false);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMousePos.x;
    const dy = e.clientY - prevMousePos.y;

    spherical.theta -= dx * 0.006;
    spherical.phi -= dy * 0.004;

    prevMousePos = { x: e.clientX, y: e.clientY };
    update();
  });

  // Scroll wheel adjusts the FOV (wide angle to flat)
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    setFov(currentFov + e.deltaY * 0.05);
  }, { passive: false });

  // Touch: one finger rotates, two fingers pinch the FOV
  dom.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setAutoRotate(false);
    } else if (e.touches.length === 2) {
      isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDist = Math.hypot(dx, dy);
    }
  }, { passive: true });

  dom.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - prevMousePos.x;
      const dy = e.touches[0].clientY - prevMousePos.y;

      spherical.theta -= dx * 0.007;
      spherical.phi -= dy * 0.005;

      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      update();
    } else if (e.touches.length === 2 && initialPinchDist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const diff = (initialPinchDist - dist) * 0.12;

      initialPinchDist = dist;
      setFov(currentFov + diff);
    }
  }, { passive: true });

  dom.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      isDragging = false;
      initialPinchDist = null;
    } else if (e.touches.length === 1) {
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      initialPinchDist = null;
    }
  });

  update();

  return {
    update,
    setFov,
    toggleAutoRotate() {
      setAutoRotate(!autoRotate);
    },
    reset() {
      currentFov = DEFAULT_VIEW.fov;
      spherical.theta = DEFAULT_VIEW.theta;
      spherical.phi = HOME_PHI;
      setAutoRotate(false);
      onFovChange(currentFov);
      update();
    },
    // Called every frame: slow orbit with a gentle vertical sway while auto-rotate is on
    tick(delta, elapsed) {
      if (!autoRotate) return;
      spherical.theta += delta * 0.25;
      spherical.phi = HOME_PHI + Math.sin(elapsed * 0.6) * 0.05;
      update();
    }
  };
}
