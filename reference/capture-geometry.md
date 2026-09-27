# Geometry recovered from the TV capture

Source: `reference/tv-capture.jpg` (1206 x 880). Everything below was measured from the image, not
eyeballed: wall, ceiling, floor and rug edges were found by gradient scans and line fits (typically
0.5 to 1 px RMS), and the camera was solved from the vanishing points. Coordinates are image pixels
(x right, y down) unless stated.

## How it was solved

1. **Lines.** Straight-line fits to: the sign wall's top edge (slope +0.254) and floor line (-0.180),
   the right wall's top edge (-0.290), the rug's far-left edge (-0.223), far-right edge (+0.334) and
   near-left edge (+0.836), and the wall corner, which is vertical at x = 751.6 for its whole height
   (so there is no measurable camera roll).
2. **Vanishing points.** The two wall lines along the sign wall meet at **(1936, 440)**. Taking the
   horizon as y = 440 (see pitch below), the right wall's top edge puts the other point at
   **(-291, 440)**. Both sit on the image's horizontal centreline, so the camera is level.
3. **Camera.** With the principal point at the image centre (603, 440), two orthogonal vanishing points
   give the focal length: **f = 1092 px**, i.e. a vertical FOV of **44 degrees** (57 degrees
   horizontal). Using the rug's own edge points instead gives f = 1023 px (about 47 degrees), so the
   FOV is good to roughly +/- 3 degrees.
4. **Orientation.** The camera looks toward the back-right corner: its forward direction is
   0.633 along +X and -0.774 along Z, i.e. **39.3 degrees to the right of straight at the sign wall**.
   Pitch is about 0. The painting's frame verticals stay vertical to within 1 px over 140 px, which
   agrees.
5. **Floor plane.** With that camera, any floor pixel maps to floor coordinates (in units of camera
   height H). Checks that came out right: the six measured points along the sign wall's floor line all
   map to the same depth (spread 0.01 H), and the rug's far-left edge comes out parallel to the sign
   wall within 1 degree.

## What the capture tells us about the room

| Quantity | Value | Confidence |
|---|---|---|
| Camera height above floor | 0.42 of the room's height (eye is below mid-height) | good |
| Rug proportions | 1.77 H wide (along the sign wall) x 1.50 H deep, about 1.18 : 1 | medium |
| Rug edges vs walls | parallel to the sign wall (within 1 degree); the other edge within 4 to 8 degrees, limited by the rug's right corner being partly hidden by the chair | medium |
| Rug centre to sign wall | 1.34 H | good |
| Rug centre to right wall | 1.72 H | good |
| Room height | about 2.39 H | medium |

Two things differ from what the build assumes, and are noted here, not changed:
- The capture's rug is about 1.18 : 1, not the 1.5 : 1 of the 6.6 x 4.4 carpet.
- Measured from the rug centre, the right wall is 1.28 times farther than the sign wall, so if the rug is
  centred the capture's room is not a cube (about 1.44 : 1.12 : 1 wide : deep : high). The build keeps
  its 10-unit cube.

## The chair

**Position (measured; moderate confidence).** The chair's leg contact points on the floor (three of the
four legs are visible) put its footprint centre at **(+0.68 H, +0.63 H)** from the rug centre, meaning to
the right, toward the right wall, and toward the camera. Across the calibration range (f 1023 to 1150,
yaw 36 to 43 degrees) that moves by only +/- 0.04 H. Converting to the 10-unit room two ways
(as a fraction of the distance to each wall, or via the rug's size) gives an offset from the rug centre
of **x = +2.2 (range 1.8 to 2.7), z = +2.2 (range 1.7 to 2.5)**, so about **2.2 units right of centre and
2.2 units toward the viewer**. The leg identification (which dark marks are legs) adds uncertainty, so
treat each number as good to about +/- 0.7 units. It is 3 units from the right wall, not against it.

**Size (measured; moderate).** Overall height about 0.79 H, roughly 2.3 to 2.9 units in the build's
scale; footprint about 1.9 units front to back.

**Rotation (inferred; low to moderate confidence, about +/- 20 degrees).** The chair is a stylised
angular armchair, and its rotation cannot be recovered as cleanly as its position. The evidence:
- The tops and bottoms of its big flat panels are horizontal in the image (slope 0 to 0.07), which
  means those edges are parallel to the image plane, i.e. **the chair is turned about 39 degrees from
  the room's axes, showing its side to the camera**.
- Its seat cushion tip is at the left and its tall reclined back at the right, so it faces screen-left:
  toward **(-0.77, -0.63)** in room (X, Z), i.e. the back-left, toward the sign wall and the rug, with
  its back to the right wall's corner side.
- Against that, the seat cushion's own long edge has a slope (+0.28) closer to a wall-aligned
  direction, but the cushion is a rounded form so that edge is the weakest evidence. Facing the sign
  wall squarely is the main alternative reading.

Chosen: yaw so the chair faces (-0.77, -0.63), i.e. **rotation.y = -129 degrees** in the build. It is a
single constant (`CHAIR_YAW` in `src/chair.js`) if that turns out to read wrong.
