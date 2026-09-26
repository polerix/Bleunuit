# Bleu Nuit

An interactive 3D room, "Bleu Nuit Gallery". A 10-unit cubic room with navy floor and ceiling,
blue side walls, a glitter-lettered BLEU NUIT sign on the back wall, a dotted carpet on the floor,
and a translucent purple acrylic armchair in the middle.

The carpet and the sign are not image files. `index.html` draws both, along with an unused
landscape painting, at load time onto `<canvas>` elements and uses them as Three.js textures.

## Running it

It is one self-contained file with no build step, no package manager and no dependencies to install.
Open `index.html` in a browser that supports WebGL.

Three.js **r128** (cdnjs) and **Tailwind** (the Tailwind Play CDN, `cdn.tailwindcss.com`) are loaded
from CDNs, so **it needs network access** the first time it loads. Offline it will not render.

The file is named `index.html` so the repo can be served from GitHub Pages without changes. It was
originally called `Bleu_Nuit_3D_Cubic_Room.html`.

## Controls

| Action | Mouse | Touch |
|---|---|---|
| Rotate the room | Drag | Swipe (one finger) |
| Change field of view (22°–92°) | Scroll wheel | Pinch (two fingers) |
| Change field of view | Vertical slider, left edge | Vertical slider, left edge |
| Back to the default view | **Reset View** button | **Reset View** button |
| Slow orbit around the room | **Auto Orbit** button (becomes **Pause Orbit**) | same |

- Scroll and pinch change the camera's **field of view**, not a plain zoom. The camera moves back
  as the FOV narrows so the room stays about the same size on screen, and only the perspective
  changes, from wide-angle (92°) to flat/telephoto (22°). The default is 60°. The label beside the
  slider reads Wide Angle, Normal, Isometric Feel or Flat / Tele.
- Rotation is clamped: about ±117° horizontally from the front, and a limited band of elevation.
- Dragging or touching the scene switches Auto Orbit off. **Reset View** also switches it off.
- The gesture hint at the bottom fades after 6 seconds.

## Reference plates

`reference/` holds the real-world material the room is modelled on. These are for comparison and
are not loaded by the page.

| File | What it is | Used to check |
|---|---|---|
| `reference/signage-bleu-nuit.png` | Photo of the real BLEU NUIT sign: purple glitter-filled block letters with a lighter violet outline, stacked BLEU over NUIT on near-black. 1600×1200. | `createBleuNuitTexture()`, the back wall |
| `reference/carpet-pattern.png` | The carpet: light periwinkle dots in diagonal clusters on a deep royal blue ground. 1448×1086. | `createCarpetTexture()`, the floor carpet |
| `reference/swatch-navy-dark.png` | Flat dark navy swatch, measured at about `#0f084f`. | Room surface colours |
| `reference/swatch-indigo.png` | Flat indigo/violet swatch, measured at about `#261987`. | Room surface colours |

For comparison, the code currently uses `0x110e52` for the floor and ceiling and `0x191475` for the
side walls. Which swatch is meant for which surface is not recorded here.

## Known gaps

Found by reading the source, then partly checked by rendering the page in headless Chromium
(software WebGL) at several field-of-view settings.

1. **The carpet colours are inverted relative to the reference.** The reference photo
   (`reference/carpet-pattern.png`) is light periwinkle dots on a deep blue ground.
   `createCarpetTexture()` (`index.html`, line 157) does the opposite: a light periwinkle ground
   (`#a8b4e5`, line 164) with deep blue dots (`#2b3990` and `#1e2b7a`, lines 181 and 194).
   Still open.

2. **`MeshLambertMaterial` is given `roughness`/`metalness`, which it ignores.** The two side/floor
   wall materials and the carpet material pass them; three.js logs two console warnings
   (`'roughness' is not a property of this material`, and the same for `metalness`) on every load.
   Harmless, and not fixed. The surfaces render as plain Lambert either way.

## Recently closed

- **The framed landscape paintings are now hung.** `createWallArt()` is called twice, one painting
  per side wall, both parented under `frameGroup`, which is added to the scene. Each faces into the
  room, is centred on its wall in height and depth, and stands 0.005 off the wall to avoid
  z-fighting. The frame is a thin four-piece navy border with a dark inner lip and a hairline
  highlight on the top edge, and the art sits recessed behind it. Frame plus art is about a fifth
  to a quarter of the wall's height. `createPaintingTexture()` was retuned a little toward the
  close-up reference (colours, a larger sun, more of the lighter back hills showing) rather than
  rewritten.
