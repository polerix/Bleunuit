import * as THREE from 'three';

// Camera navigation: the camera orbits a target point on a sphere, and the field of view is the
// "zoom". The camera backs away as the FOV narrows so the room stays about the same size on screen and
// only the perspective changes, from wide angle (92 deg) to flat/telephoto (22 deg).
const BASE_FOV = 60;        // the FOV at which BASE_RADIUS frames the room
const BASE_RADIUS = 10.5;
const MIN_FOV = 22;
const MAX_FOV = 92;

// The opening and reset view, recovered from the TV capture (reference/capture-geometry.md): a level
// camera (pitch about 0, so the polar angle is 90 degrees), 44 degrees of vertical FOV, and an azimuth
// 39 degrees to the left of straight-on, which puts the sign wall on the left and the painting wall
// on the right with the corner between them. Azimuth is measured to about +/- 3 degrees.
export const DEFAULT_VIEW = {
  fov: 44,
  theta: -THREE.MathUtils.degToRad(39.3),
  phi: Math.PI * 0.5
};
const HOME_PHI = DEFAULT_VIEW.phi;

export function createControls({ camera, dom, onFovChange, onAutoRotateChange }) {
  const targetPoint = new THREE.Vector3(0, 0, 0);

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
    const fovRad = THREE.MathUtils.degToRad(currentFov);
    const baseFovRad = THREE.MathUtils.degToRad(BASE_FOV);
    const distRatio = Math.tan(baseFovRad / 2) / Math.tan(fovRad / 2);

    const effectiveRadius = BASE_RADIUS * distRatio;

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
