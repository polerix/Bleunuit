# Bleu Nuit

An interactive 3D room, "Bleu Nuit Gallery". A 10-unit cubic room with navy floor and ceiling,
blue side walls, a glitter-lettered BLEU NUIT sign on the back wall, a dotted carpet on the floor,
and a translucent purple acrylic armchair in the middle.

The sign and the landscape paintings on the side walls are not image files: `index.html` draws
them at load time onto `<canvas>` elements and uses them as Three.js textures. The carpet is the
exception: it is a real image, `assets/carpet.png`, loaded at runtime.

## Running it

There is no build step and no package manager: `index.html` plus the `assets/` folder is the whole
site. It needs a browser that supports WebGL, and it **must be served over HTTP**, not opened
straight off disk.

- **Live:** https://polerix.github.io/Bleunuit/ (GitHub Pages, from `main` at the repo root).
- **Locally:** run `python3 -m http.server` in the repo folder and open http://localhost:8000/.

**Why double-clicking `index.html` no longer works properly.** The sign and paintings are drawn in
`<canvas>`, which is fine on `file://`. The carpet is a loaded PNG, and browsers treat a `file://`
page as an opaque origin, so the WebGL texture is blocked (Chrome logs a CORS error). Nothing crashes:
the carpet falls back to a flat periwinkle floor with no dots, and the rest of the room is
unchanged. It is a non-issue on GitHub Pages or any local HTTP server.

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
| `reference/signage-bleu-nuit.png` | Photo of the real BLEU NUIT sign: purple glitter-filled block letters with a lighter violet outline, stacked BLEU over NUIT on near-black. 1600×1200. | `createBleuNuitTexture()`, the back wall. The letter outlines are traced from this photo |
| `reference/carpet-pattern.png` | An earlier carpet photo: light periwinkle dots in diagonal clusters on a deep royal blue ground. 1448×1086. **Superseded** by `assets/carpet.png` (see Recently closed). Kept for history. | Nothing now |
| `reference/swatch-navy-dark.png` | Flat dark navy swatch, measured at about `#0f084f`. | Room surface colours |
| `reference/swatch-indigo.png` | Flat indigo/violet swatch, measured at about `#261987`. | Room surface colours |

For comparison, the code currently uses `0x110e52` for the floor and ceiling and `0x191475` for the
side walls. Which swatch is meant for which surface is not recorded here.

## Assets

`assets/` holds files the page loads at runtime, unlike `reference/`, which is never loaded.

| File | What it is |
|---|---|
| `assets/carpet.png` | The floor carpet: light periwinkle ground (`#8790c6`) with royal-blue dots (`#2c38ac`), about 28% dot coverage. 1448×1086 (4:3), 2.7 MB. Not seamless, so it is used once and not tiled (see below). |

## Known gaps

None currently open. Checked by rendering the page in headless Chromium (software WebGL) at
several field-of-view settings.

## Recently closed

- **The framed landscape paintings are now hung.** `createWallArt()` is called twice, one painting
  per side wall, both parented under `frameGroup`, which is added to the scene. Each faces into the
  room, is centred on its wall in height and depth, and stands 0.005 off the wall to avoid
  z-fighting. The frame is a thin four-piece navy border with a dark inner lip and a hairline
  highlight on the top edge, and the art sits recessed behind it. Frame plus art is about a fifth
  to a quarter of the wall's height. `createPaintingTexture()` was retuned a little toward the
  close-up reference (colours, a larger sun, more of the lighter back hills showing) rather than
  rewritten.

- **The `MeshLambertMaterial` console warnings are gone.** The floor/ceiling, side-wall and carpet
  materials are now `MeshStandardMaterial` with `roughness: 0.5` and `metalness: 0`, colours and
  maps unchanged. The warnings came from passing `roughness`/`metalness` to a material that has
  neither.

  **Roughness 0.5 has no visible effect.** It is set, but nothing shows it: the scene is lit by an
  ambient light and two directional lights with no environment map, and with `metalness: 0` there
  is nothing for a rougher or smoother finish to change. Side by side with the old Lambert
  materials, the room renders the same (walls `#130f80`; ceiling `#0d0c74` before, `#0e0c74` after, one
  unit apart). Do not treat it as a
  finish that is meant to be showing. Metalness is deliberately 0: a trial with `metalness: 0.5`
  and no environment map turned the walls near-black (`#050541`). With a generated environment
  map it came back brighter but with gradients, no longer the flat blue. If a real satin or
  metallic finish is ever wanted, it needs an environment map (`PMREMGenerator`) and the colours
  retuned against the target.

- **The carpet is the light-ground image, and the direction reversed twice.** The original code drew
  a light periwinkle ground with dark blue dots, which is what the room mockup used as the target
  shows. That was fixed once to match `reference/carpet-pattern.png`, a photo with light dots on a
  deep royal-blue ground (commit `2859fd2`, a procedural texture built from the photo), on the basis
  that the photo beat the mockup. PAUL-ERIC then supplied a finished, clean texture image with the
  **light ground and blue dots**, i.e. back to the original direction and to what the mockup shows.
  That image is the current, final carpet, so **`2859fd2`'s dark floor is superseded**: the photo is
  no longer the carpet's authority, and the light floor is intended. Do not "fix" it back to the
  dark version, and do not treat the photo-versus-mockup note that used to be here as current.

  It is loaded from `assets/carpet.png`, not generated, because the image is exact and it is a
  finished asset. It loads asynchronously: the carpet material starts as flat periwinkle (`#8790c6`,
  also what remains if the load fails), and the texture is assigned in the loader callback with
  `needsUpdate` set, so there is no blank first paint. The image is **not seamless** (its wrap-around
  edge differs about 5x more than adjacent pixels, and dots are cut off at the edges), so it is laid
  over the carpet once with clamped wrapping, not repeated. It is 4:3 and the carpet is 3:2, so the
  middle 8/9 of its width is used, which keeps the dots round at the image's own density (about 12
  clusters across the carpet). Mipmaps and maximum anisotropy are on; no moiré or seam at 22°, 60° or
  92°. On screen it reads greyer than the file (ground about `#9fa7c1` for `#8790c6`), because of the
  room lighting and tone mapping.

- **The BLEU NUIT lettering now matches the photo.** It was `Impact` / `Arial Black` text with a
  three-layer neon outline and thin random glitter. It is now eight letter outlines drawn as paths,
  traced from `reference/signage-bleu-nuit.png` (a few vertices each, in the photo's own pixels), so
  the wide blocky proportions, the chamfered corners, the flat-bottomed angled U, the B's two
  rectangular counters, the tight spacing and the slight hand-cut stagger all come from the photo.
  Paths were chosen over a font on evidence: with each word fitted to the photo's word box, the best
  of ten candidate fonts overlapped the photo's letter mask by 0.77 (Bowlby One), and Impact, the
  old font, by 0.72 (Arial Black 0.60, Archivo Black 0.67). None has the angular letters. Because
  there is no font, there is no webfont request and nothing to load before the texture is drawn.
  The outline is one ~9px keyline in `#553ccd` hugging the inside edge, with the photo's darker inner
  rim fading out over ~28px. The glitter is generated per letter, mapped through the photo's own
  per-channel percentiles inside the letters, so its tonal spread and dark/bright clumping match.
  The texture is 1600 x 1600 to fit the square wall, with the sign at 78% of the wall's width and
  not stretched. The sign material is not tone-mapped, and the texture no longer reads a canvas
  back (`getImageData`), so the Canvas2D `willReadFrequently` console hint is gone. What is not
  reproduced: the photo's slight 3D depth and glow around the letter edges, and the very bright
  pin-point sparkles, which are averaged away at the size the wall is shown.
