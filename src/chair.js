import * as THREE from 'three';
import { HALF_SIZE } from './room.js';

// Where the chair stands and which way it faces, recovered from the TV capture (see
// reference/capture-geometry.md for the measurements and how far to trust them). The rug centre is at
// (0, 0.4); the chair is about 2.2 units to the right of it and 2.2 toward the viewer. Its yaw turns its
// front (+Z in the chair's own frame) to face the back-left, (-0.77, -0.63) in world X/Z, with its back
// toward the right wall's side. Position is good to about +/- 0.7 units; the yaw to about +/- 20 degrees.
export const CHAIR_POSITION = { x: 2.2, z: 2.6 };
export const CHAIR_YAW = THREE.MathUtils.degToRad(-129);

export function createTranslucentPurpleArmchair() {
  const chairGroup = new THREE.Group();

  // Translucent purple acrylic material
  const acrylicMat = new THREE.MeshPhysicalMaterial({
    color: 0x9333ea,
    emissive: 0x3b0764,
    emissiveIntensity: 0.18,
    transparent: true,
    opacity: 0.62,
    roughness: 0.12,
    metalness: 0.05,
    transmission: 0.55, // acrylic glass feel
    ior: 1.45,
    depthWrite: false
  });

  // Seat base cushion
  const seatGeo = new THREE.BoxGeometry(1.6, 0.22, 1.5);
  const seat = new THREE.Mesh(seatGeo, acrylicMat);
  seat.position.y = 0.6;
  chairGroup.add(seat);

  // High Backrest
  const backGeo = new THREE.BoxGeometry(1.6, 1.9, 0.2);
  const backrest = new THREE.Mesh(backGeo, acrylicMat);
  backrest.position.set(0, 1.55, -0.65);
  // Subtle tilt backwards
  backrest.rotation.x = 0.07;
  chairGroup.add(backrest);

  // Armrests (Left & Right)
  const armGeo = new THREE.BoxGeometry(0.2, 0.75, 1.5);

  const leftArm = new THREE.Mesh(armGeo, acrylicMat);
  leftArm.position.set(-0.8, 0.95, 0);
  chairGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, acrylicMat);
  rightArm.position.set(0.8, 0.95, 0);
  chairGroup.add(rightArm);

  // Sleek legs (translucent tinted studs/supports)
  const legGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.6, 16);
  const legPositions = [
    [-0.7, 0.3, 0.6],
    [0.7, 0.3, 0.6],
    [-0.7, 0.3, -0.6],
    [0.7, 0.3, -0.6]
  ];

  legPositions.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, acrylicMat);
    leg.position.set(lx, ly, lz);
    chairGroup.add(leg);
  });

  // Stand it where the capture puts it, turned as the capture shows
  chairGroup.rotation.y = CHAIR_YAW;
  chairGroup.position.set(CHAIR_POSITION.x, -HALF_SIZE, CHAIR_POSITION.z);
  return chairGroup;
}
