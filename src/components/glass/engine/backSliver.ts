import * as THREE from 'three';

export interface BackSliverController {
  readonly mesh: THREE.Mesh;
  update: (
    time: number,
    dt: number,
    visible: boolean,
    appearElapsed: number,
    pointerNdc: THREE.Vector2 | null,
    raycaster: THREE.Raycaster,
    camera: THREE.Camera,
  ) => boolean;
  resize: (width: number, height: number) => void;
  dispose: () => void;
}

const SLIVER_FRACTIONS: readonly [number, number][] = [
  [0.147, 0.243],
  [0.252, 0.169],
  [0.287, 0.277],
  [0.151, 0.258],
];

function sliverAnchor(width: number): { fx: number; fy: number } {
  // Desktop (<900px uses compact top-left slot matching mobile CSS .glass-back-btn)
  return width < 900 ? { fx: 0.24, fy: 0.12 } : { fx: 0.219, fy: 0.238 };
}

function buildSliverGeometry(width: number, height: number): THREE.ExtrudeGeometry {
  const effectiveW = Math.max(width, 640);
  const k = effectiveW / 1918;
  const pts = SLIVER_FRACTIONS.map(
    ([fx, fy]) => new THREE.Vector2((fx - 0.219) * effectiveW, (0.238 - fy) * height),
  );

  const shape = new THREE.Shape();
  const radius = Math.max(4, 14 * k);
  const n = pts.length;

  for (let i = 0; i < n; i += 1) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];

    const v1 = new THREE.Vector2().subVectors(prev, curr);
    const v2 = new THREE.Vector2().subVectors(next, curr);
    const l1 = v1.length();
    const l2 = v2.length();
    const r = Math.min(radius, l1 * 0.35, l2 * 0.35);

    const p1 = curr.clone().addScaledVector(v1.normalize(), r);
    const p2 = curr.clone().addScaledVector(v2.normalize(), r);

    if (i === 0) shape.moveTo(p1.x, p1.y);
    else shape.lineTo(p1.x, p1.y);
    shape.quadraticCurveTo(curr.x, curr.y, p2.x, p2.y);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(3, 11 * k),
    bevelEnabled: true,
    bevelThickness: Math.max(0.8, 2.2 * k),
    bevelSize: Math.max(0.8, 2.2 * k),
    bevelSegments: 3,
    curveSegments: 8,
  });
  geo.center();
  return geo;
}

export function createBackSliver(width: number, height: number): BackSliverController {
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#17171b'),
    roughness: 0.36,
    metalness: 0.05,
    clearcoat: 0.7,
    clearcoatRoughness: 0.12,
    specularIntensity: 0.7,
    iridescence: 0.35,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [250, 650],
    envMapIntensity: 1.15,
  });

  const anchor = sliverAnchor(width);
  const mesh = new THREE.Mesh(buildSliverGeometry(width, height), material);
  mesh.position.set((anchor.fx - 0.5) * width, (0.5 - anchor.fy) * height, 40);
  mesh.scale.setScalar(0.001);
  mesh.visible = false;

  let scaleCurrent = 0;
  let tipX = 0;
  let tipY = 0;

  return {
    mesh,
    update(time, dt, visible, appearElapsed, pointerNdc, raycaster, camera) {
      const targetScale = visible && appearElapsed >= 0.3 ? 1 : 0;
      const speed = visible ? 7.5 : 11;
      scaleCurrent += (targetScale - scaleCurrent) * (1 - Math.exp(-Math.min(dt, 0.05) * speed));

      if (scaleCurrent < 0.01 && targetScale === 0) {
        mesh.visible = false;
        return false;
      }

      mesh.visible = true;
      mesh.scale.setScalar(Math.max(0.001, scaleCurrent));

      let hovered = false;
      let targetTipX = 0;
      let targetTipY = 0;

      if (visible && pointerNdc) {
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObject(mesh, false);
        if (hits.length > 0) {
          hovered = true;
          const localHit = mesh.worldToLocal(hits[0].point.clone());
          targetTipY = THREE.MathUtils.clamp((localHit.x / Math.max(80, width * 0.07)) * 0.14, -0.14, 0.14);
          targetTipX = THREE.MathUtils.clamp((-localHit.y / Math.max(40, height * 0.05)) * 0.14, -0.14, 0.14);
        }
      }

      const tipAlpha = 1 - Math.exp(-Math.min(dt, 0.05) * 10);
      tipX += (targetTipX - tipX) * tipAlpha;
      tipY += (targetTipY - tipY) * tipAlpha;

      const wobbleY = Math.sin(time * 2.1) * 0.035;
      const wobbleX = Math.cos(time * 1.7) * 0.03;

      mesh.rotation.set(0.08 + wobbleX + tipX, -0.16 + wobbleY + tipY, 0);
      return hovered;
    },
    resize(nextW, nextH) {
      const nextAnchor = sliverAnchor(nextW);
      mesh.geometry.dispose();
      mesh.geometry = buildSliverGeometry(nextW, nextH);
      mesh.position.set((nextAnchor.fx - 0.5) * nextW, (0.5 - nextAnchor.fy) * nextH, 40);
    },
    dispose() {
      mesh.geometry.dispose();
      material.dispose();
    },
  };
}
