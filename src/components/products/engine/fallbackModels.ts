import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ProductEntry } from '@/content/products';

function makeMaterials() {
  const body = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2B2B2B'),
    roughness: 0.45,
    metalness: 0.3,
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#161618'),
    roughness: 0.35,
    metalness: 0.55,
  });
  const bezel = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#101012'),
    roughness: 0.2,
    metalness: 0.75,
  });
  const led = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#05E901'),
    emissive: new THREE.Color('#05E901'),
    emissiveIntensity: 1.6,
    roughness: 0.25,
    metalness: 0.1,
  });
  return { body, darkMetal, bezel, led };
}

export function buildFallbackModel(slug: ProductEntry['slug']): THREE.Group {
  const group = new THREE.Group();
  const { body, darkMetal, bezel, led } = makeMaterials();

  if (slug === 'camera') {
    // Cylinder body (radius .32, length 1.1)
    const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.1, 32), body);
    bodyMesh.rotation.z = Math.PI / 2;
    group.add(bodyMesh);

    // Sun shield hood
    const shieldGeo = new THREE.CylinderGeometry(0.355, 0.355, 0.95, 32, 1, true, -Math.PI * 0.48, Math.PI * 0.96);
    const shieldMat = body.clone();
    shieldMat.side = THREE.DoubleSide;
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.rotation.z = Math.PI / 2;
    shield.rotation.x = Math.PI / 2;
    shield.position.set(0.14, 0.03, 0);
    group.add(shield);

    // Front lens ring (black) + green inner ring + optic glass
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 16, 36), bezel);
    outerRing.rotation.y = Math.PI / 2;
    outerRing.position.set(0.55, 0, 0);
    group.add(outerRing);

    const innerGreenRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.016, 12, 32), led);
    innerGreenRing.rotation.y = Math.PI / 2;
    innerGreenRing.position.set(0.56, 0, 0);
    group.add(innerGreenRing);

    const lensCore = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 28), darkMetal);
    lensCore.rotation.z = Math.PI / 2;
    lensCore.position.set(0.54, 0, 0);
    group.add(lensCore);

    // Wall arm and mounting plate
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.5, 18), darkMetal);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(-0.76, -0.08, 0);
    group.add(arm);

    const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.095, 18, 18), bezel);
    knuckle.position.set(-0.56, -0.05, 0);
    group.add(knuckle);

    const plate = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.58, 0.42, 3, 0.03), darkMetal);
    plate.position.set(-1.02, -0.08, 0);
    group.add(plate);

    group.rotation.y = -0.35;
    return group;
  }

  if (slug === 'reader') {
    // Main plate: RoundedBoxGeometry 0.9 x 1.5 x 0.25
    const chassis = new THREE.Mesh(new RoundedBoxGeometry(0.9, 1.5, 0.25, 4, 0.06), body);
    group.add(chassis);

    const backPlate = new THREE.Mesh(new RoundedBoxGeometry(0.94, 1.54, 0.06, 3, 0.04), darkMetal);
    backPlate.position.z = -0.12;
    group.add(backPlate);

    // Green status bar at the top
    const statusBar = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.065, 0.04, 2, 0.015), led);
    statusBar.position.set(0, 0.54, 0.12);
    group.add(statusBar);

    // 3x4 grid of small key boxes
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const keyMesh = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.12, 0.04, 2, 0.015), darkMetal);
        keyMesh.position.set((col - 1) * 0.22, 0.22 - row * 0.18, 0.125);
        group.add(keyMesh);
      }
    }

    // Bottom NFC emblem strip
    const nfcStrip = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.035, 0.03, 2, 0.01), bezel);
    nfcStrip.position.set(0, -0.54, 0.125);
    group.add(nfcStrip);

    return group;
  }

  // 'hub': flat box 2.0 x 0.3 x 1.0 with 8 dark port insets, green LEDs, and two rack ears
  const chassis = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.3, 1.0, 3, 0.025), body);
  group.add(chassis);

  // Two rack ears
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.28, 0.04, 2, 0.01), darkMetal);
    ear.position.set(side * 1.06, 0, 0.46);
    group.add(ear);
  }

  // Eight port insets and green LEDs
  for (let i = 0; i < 8; i += 1) {
    const x = -0.68 + i * 0.18;
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.04), bezel);
    port.position.set(x, -0.02, 0.49);
    group.add(port);

    const ledMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.02), led);
    ledMesh.position.set(x, 0.075, 0.5);
    group.add(ledMesh);
  }

  // Console/uplink port on the right
  const uplink = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.04), darkMetal);
  uplink.position.set(0.82, -0.01, 0.49);
  group.add(uplink);

  group.rotation.x = 0.22;
  return group;
}
