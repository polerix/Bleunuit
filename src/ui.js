// The page chrome: FOV slider and its label, Reset View, Auto Orbit, and the gesture hint.
export function createUI() {
  const fovSlider = document.getElementById('fovSlider');
  const fovTag = document.getElementById('fovTag');
  const resetBtn = document.getElementById('resetCamBtn');
  const autoRotateBtn = document.getElementById('autoRotateBtn');
  const rotText = document.getElementById('rotText');
  const hint = document.getElementById('gestureHint');

  // Fade out the gesture hint after 6 seconds
  setTimeout(() => hint.classList.add('is-hidden'), 6000);

  return {
    showFov(fov) {
      fovSlider.value = fov;
      let label = 'Normal';
      if (fov >= 75) label = 'Wide Angle';
      else if (fov <= 35) label = 'Flat / Tele';
      else if (fov < 50) label = 'Isometric Feel';
      fovTag.textContent = `${label} (${Math.round(fov)}°)`;
    },
    showAutoRotate(on) {
      autoRotateBtn.classList.toggle('is-active', on);
      rotText.textContent = on ? 'Pause Orbit' : 'Auto Orbit';
    },
    // Wire the controls in once they exist (they need the UI's callbacks first)
    bind(controls) {
      fovSlider.addEventListener('input', (e) => controls.setFov(parseFloat(e.target.value)));
      resetBtn.addEventListener('click', () => controls.reset());
      autoRotateBtn.addEventListener('click', () => controls.toggleAutoRotate());
    }
  };
}
