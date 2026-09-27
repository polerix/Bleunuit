import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { HALF_SIZE } from './room.js';

// Where the chair stands and which way it faces, recovered from the TV capture (see
// reference/capture-geometry.md for the measurements and how far to trust them). The rug centre is at
// (0, 0.4); the chair is about 2.2 units to the right of it and 2.2 toward the viewer. Its yaw turns its
// front (+Z in the chair's own frame) to face the back-left, (-0.77, -0.63) in world X/Z, with its back
// toward the right wall's side. Position is good to about +/- 0.7 units; the yaw to about +/- 20 degrees.
export const CHAIR_POSITION = { x: 2.2, z: 2.6 };
export const CHAIR_YAW = THREE.MathUtils.degToRad(-129);

// Darken a geometry from its bottom to its top with vertex colours. It stands in for ambient occlusion:
// the room's lighting is deliberately flat, and a plain lit surface would read as plastic, not fabric.
function shadeByHeight(geometry, bottom = 0.6, top = 1) {
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox;
  const pos = geometry.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) - min.y) / (max.y - min.y || 1);
    const k = bottom + (top - bottom) * Math.pow(t, 0.8);
    colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = k;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

// A soft-edged elliptical shadow on the floor so the chair sits on the carpet instead of floating.
function createContactShadow(w, d) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  g.addColorStop(0, 'rgba(6, 2, 28, 0.55)');
  g.addColorStop(0.55, 'rgba(6, 2, 28, 0.3)');
  g.addColorStop(1, 'rgba(6, 2, 28, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, toneMapped: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.03;
  return mesh;
}

// An opaque upholstered armchair: high reclined back, two slab arms, a soft seat pillow that stands
// proud of the arms, piped seams, and thin legs. Modelled on the chair in the capture. In its own frame
// the front is +Z, the up axis is +Y, and y = 0 is the floor.
export function createArmchair() {
  const chair = new THREE.Group();

  // Pale lilac fabric. Roughness is high and there is a velvety sheen at grazing angles, so the surface
  // reads as cloth; vertex colours (see shadeByHeight) supply the soft darkening toward the floor.
  const fabricMat = new THREE.MeshPhysicalMaterial({
    color: 0x5a28c0,
    roughness: 0.92,
    metalness: 0,
    sheen: 0.2,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color(0x8a60f0),
    vertexColors: true
  });
  const seatMat = fabricMat.clone();
  seatMat.color.set(0x6a34d0);   // the seat pillow is a shade lighter, as in the capture
  const pipingMat = new THREE.MeshStandardMaterial({ color: 0x5a2fa0, roughness: 0.9, metalness: 0 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x8c86a8, roughness: 0.35, metalness: 0.6 });

  // Rounded box helper: soft, pillowy edges are what make a box read as upholstery
  function padded(w, h, d, radius, material, x, y, z, tilt = 0, bottom = 0.6) {
    const geo = shadeByHeight(new RoundedBoxGeometry(w, h, d, 6, radius), bottom, 1);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.rotation.x = tilt;
    chair.add(mesh);
    return mesh;
  }

  // A thin rounded seam ("piping") running from one point to another
  function seam(x1, y1, z1, x2, y2, z2, r = 0.016) {
    const a = new THREE.Vector3(x1, y1, z1);
    const b = new THREE.Vector3(x2, y2, z2);
    const len = a.distanceTo(b);
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 8), pipingMat);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    chair.add(mesh);
  }

  // Legs: four slim metal stems under the plinth
  const legGeo = new THREE.CylinderGeometry(0.03, 0.022, 0.42, 12);
  [[-0.78, -0.66], [0.78, -0.66], [-0.78, 0.66], [0.78, 0.66]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(lx, 0.21, lz);
    chair.add(leg);
  });

  // Plinth under the seat
  padded(1.96, 0.44, 1.76, 0.07, fabricMat, 0, 0.64, 0, 0, 0.4);

  // Seat pillow, standing about 0.15 proud of the arms at the front
  padded(1.3, 0.36, 1.62, 0.13, seatMat, 0, 1.02, 0.1, 0, 0.7);

  // Slab arms, tall and square-shouldered
  padded(0.34, 1.2, 1.66, 0.06, fabricMat, -0.81, 1.22, -0.03, 0, 0.42);
  padded(0.34, 1.2, 1.66, 0.06, fabricMat, 0.81, 1.22, -0.03, 0, 0.42);

  // High back, leaning back about 16 degrees, with a softer pillow in front of it
  const lean = -THREE.MathUtils.degToRad(16);
  padded(1.7, 2.1, 0.24, 0.08, fabricMat, 0, 1.68, -0.68, lean, 0.48);
  padded(1.28, 0.95, 0.24, 0.11, seatMat, 0, 1.5, -0.46, lean, 0.75);

  // Piping: around the seat pillow's top edge, along the arms' tops and the back's top edge
  const sy = 1.2;                                           // seat pillow top
  seam(-0.65, sy, 0.91, 0.65, sy, 0.91);                     // front edge
  seam(-0.65, sy, 0.91, -0.65, sy, -0.7);                    // left edge
  seam(0.65, sy, 0.91, 0.65, sy, -0.7);                      // right edge
  seam(-0.81, 1.82, 0.8, -0.81, 1.82, -0.84);                // left arm top
  seam(0.81, 1.82, 0.8, 0.81, 1.82, -0.84);                  // right arm top
  const topY = 1.68 + 1.05 * Math.cos(lean), topZ = -0.68 + 1.05 * Math.sin(lean);
  seam(-0.75, topY, topZ, 0.75, topY, topZ);                 // back top edge

  chair.add(createContactShadow(2.9, 2.6));

  chair.rotation.y = CHAIR_YAW;
  chair.position.set(CHAIR_POSITION.x, -HALF_SIZE, CHAIR_POSITION.z);
  return chair;
}
