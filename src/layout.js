// The room is always framed at a fixed aspect ratio -- the original broadcast's 4:3 landscape -- rather
// than filling the browser window. The single constant below controls it everywhere (the camera's
// aspect and the #stage element's shape both read it); flip to portrait by changing this one line.
export const ASPECT_RATIO = 4 / 3;   // width / height. Swap to 3 / 4 for 3:4 portrait.

// Sizes the #stage element to the largest ASPECT_RATIO box that fits the window, centred, and returns
// that size in CSS pixels. Whatever doesn't fit shows as letterbox bars (top/bottom, ratio wider than
// the window) or pillarbox bars (left/right, ratio narrower than the window) in the page background
// colour, since #stage sits over it.
export function layoutStage(stage) {
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  let width = ww;
  let height = Math.round(ww / ASPECT_RATIO);
  if (height > wh) {
    height = wh;
    width = Math.round(wh * ASPECT_RATIO);
  }
  stage.style.width = `${width}px`;
  stage.style.height = `${height}px`;
  return { width, height };
}
