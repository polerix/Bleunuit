import * as THREE from 'three';
import { createPaintingTexture, createBleuNuitTexture, createSuedeTexture, loadCarpetTexture, SUEDE_MEAN } from './textures.js';

// Room dimensions (cubic room)
export const ROOM_SIZE = 10;
export const HALF_SIZE = ROOM_SIZE / 2;

// Floor, ceiling, side walls, the BLEU NUIT back wall, the carpet and the two framed paintings.
export function buildRoom(scene, renderer) {
  // Room materials
  const navyFloorCeilMat = new THREE.MeshStandardMaterial({
    color: 0x110e52,
    roughness: 0.5,
    metalness: 0
  });

  // Side walls are suede: the texture is a brightness multiplier around SUEDE_MEAN, so the colour is
  // scaled up by the same amount to keep the wall's overall brightness unchanged.
  const blueSideWallMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x191475).multiplyScalar(1 / SUEDE_MEAN),
    map: createSuedeTexture(renderer),
    roughness: 0.5,
    metalness: 0
  });

  // Floor
  const floorGeo = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);
  const floor = new THREE.Mesh(floorGeo, navyFloorCeilMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -HALF_SIZE;
  scene.add(floor);

  // Ceiling
  const ceiling = new THREE.Mesh(floorGeo, navyFloorCeilMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = HALF_SIZE;
  scene.add(ceiling);

  // Left Wall
  const wallGeo = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);
  const leftWall = new THREE.Mesh(wallGeo, blueSideWallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.x = -HALF_SIZE;
  scene.add(leftWall);

  // Right Wall
  const rightWall = new THREE.Mesh(wallGeo, blueSideWallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.x = HALF_SIZE;
  scene.add(rightWall);

  // Back Wall (BLEU NUIT graphic billboard)
  const bleuNuitTex = createBleuNuitTexture();
  const backWallMat = new THREE.MeshBasicMaterial({
    map: bleuNuitTex,
    toneMapped: false   // keep the sign's colours as drawn, like the paintings
  });
  const backWall = new THREE.Mesh(wallGeo, backWallMat);
  backWall.position.z = -HALF_SIZE;
  scene.add(backWall);

  // Centered carpet on the floor. The material starts as flat periwinkle (the image's ground colour,
  // and what stays if the load fails) and takes the map when the image arrives.
  const carpetGeo = new THREE.PlaneGeometry(6.6, 4.4);
  const carpetMat = new THREE.MeshStandardMaterial({
    color: 0x8790c6,
    roughness: 0.5,
    metalness: 0
  });
  loadCarpetTexture(renderer, (tex) => {
    carpetMat.map = tex;
    carpetMat.color.set(0xffffff);   // the map supplies the colour now
    carpetMat.needsUpdate = true;    // adding a map changes the shader, so recompile
  }, () => console.warn('Bleu Nuit: carpet image failed to load; using flat periwinkle'));
  const carpet = new THREE.Mesh(carpetGeo, carpetMat);
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(0, -HALF_SIZE + 0.015, 0.4);
  scene.add(carpet);

  const paintingTex = createPaintingTexture();
  const frameGroup = new THREE.Group();

  // Framed landscape: thin navy border with a dark inner lip, art recessed behind it.
  // Local +z is the viewing direction; the group's origin is the centre of the frame.
  function createWallArt() {
    const artRoot = new THREE.Group();
    const artW = 2.6;
    const artH = 1.95;
    const border = 0.08;   // visible face width of the frame
    const lip = 0.03;      // dark inner lip between the frame face and the art
    const depth = 0.06;    // how far the frame stands proud of the wall
    const recess = 0.02;   // how far behind the frame face the art sits

    // Canvas painting (untouched by tone mapping so it keeps the reference colours)
    const pMat = new THREE.MeshBasicMaterial({ map: paintingTex, toneMapped: false });
    const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(artW, artH), pMat);
    pMesh.position.z = depth - recess;
    artRoot.add(pMesh);

    const faceMat = new THREE.MeshLambertMaterial({ color: 0x2e296d });
    const topMat = new THREE.MeshLambertMaterial({ color: 0x8987d7 });  // thin highlight
    const lipMat = new THREE.MeshBasicMaterial({ color: 0x0c0933, toneMapped: false });

    // Four border pieces, each a box, framing the inner opening (artW + 2*lip by artH + 2*lip)
    const innerW = artW + lip * 2;
    const innerH = artH + lip * 2;
    const outerW = innerW + border * 2;
    const outerH = innerH + border * 2;
    const pieces = [
      // [width, height, x, y]
      [outerW, border, 0, (innerH + border) / 2],     // top
      [outerW, border, 0, -(innerH + border) / 2],    // bottom
      [border, innerH, -(innerW + border) / 2, 0],    // left
      [border, innerH, (innerW + border) / 2, 0]      // right
    ];
    pieces.forEach(([w, h, x, y]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), faceMat);
      m.position.set(x, y, depth / 2);
      artRoot.add(m);
    });

    // Highlight on the top edge only: a hair-thin strip on the front face of the top piece
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(outerW, 0.012), topMat);
    hl.position.set(0, outerH / 2 - 0.006, depth + 0.001);
    artRoot.add(hl);

    // Inner lip: four thin dark strips ringing the art, set just in front of it
    const lipZ = depth - recess + 0.002;
    [
      [innerW, lip, 0, (artH + lip) / 2],
      [innerW, lip, 0, -(artH + lip) / 2],
      [lip, artH, -(artW + lip) / 2, 0],
      [lip, artH, (artW + lip) / 2, 0]
    ].forEach(([w, h, x, y]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lipMat);
      m.position.set(x, y, lipZ);
      artRoot.add(m);
    });

    return artRoot;
  }

  // Hang one landscape on each side wall, facing into the room. The frame's back sits
  // on the wall plane; the 0.005 gap avoids z-fighting with the wall surface.
  const wallGap = 0.005;
  const leftArt = createWallArt();
  leftArt.position.set(-HALF_SIZE + wallGap, 0, 0);
  leftArt.rotation.y = Math.PI / 2;      // +z (viewing side) -> +x, into the room
  frameGroup.add(leftArt);

  const rightArt = createWallArt();
  rightArt.position.set(HALF_SIZE - wallGap, 0, 0);
  rightArt.rotation.y = -Math.PI / 2;    // +z -> -x, into the room
  frameGroup.add(rightArt);

  scene.add(frameGroup);

  // The side walls are single-sided, so from outside the room they are invisible; a painting hung on
  // one would then float in mid-air. Show each painting only while the camera is inside its wall.
  return {
    update(camera) {
      leftArt.visible = camera.position.x > -HALF_SIZE;
      rightArt.visible = camera.position.x < HALF_SIZE;
    }
  };
}
