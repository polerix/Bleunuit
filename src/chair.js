import * as THREE from 'three';
import { HALF_SIZE } from './room.js';

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

  // Position armchair centered on the floor & rotate 180 degrees to face the viewer
  chairGroup.rotation.y = Math.PI;
  chairGroup.position.set(0, -HALF_SIZE, 0.4);
  return chairGroup;
}
