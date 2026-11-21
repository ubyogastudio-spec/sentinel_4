import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Locale } from '@/i18n';
import { createBackSliver } from './backSliver';
import { buildCells, type CellName, type Pt } from './cutPattern';
import {
  drawNavCanvas,
  drawPanelCanvas,
  measureGlassLayout,
  raceGlassFonts,
  type GlassCopy,
  type GlassHoverState,
  type GlassLayout,
} from './pageCanvas';
import { applyFlightTransform, createPieceFlight, SHATTER_DURATION, type PieceFlight, type ShatterPhase } from './shatter';
import { computePanelMatrix3d, expSmooth, stepSpring, type SpringState } from './springs';
import { projectNavCorners, projectPanelCorners } from './textLayer';

const CELL_NAMES: readonly CellName[] = ['A', 'B', 'C', 'D', 'E'];

interface ShardPiece {
  readonly name: string;
  readonly group: THREE.Group;
  readonly glassMesh: THREE.Mesh;
  readonly faceMesh: THREE.Mesh;
  readonly basePosition: THREE.Vector3;
  readonly liftSpring: SpringState;
  readonly tipXSpring: SpringState;
  readonly tipYSpring: SpringState;
  hoverAmount: number;
  flight: PieceFlight;
  centroidNorm: THREE.Vector2;
}

export interface GlassHeroOptions {
  readonly container: HTMLElement;
  readonly eventRoot: HTMLElement;
  readonly panelLayerEl: HTMLElement;
  readonly navLayerEl: HTMLElement;
  readonly copy: GlassCopy;
  readonly locale: Locale;
  readonly lowPower: boolean;
  readonly onLayoutChange: (layout: GlassLayout) => void;
  readonly onShatterStateChange: (state: 'assembled' | 'shattered') => void;
  readonly onFirstFrame?: (ms: number) => void;
  readonly onContextLost?: () => void;
  readonly onContextRestored?: () => void;
  readonly onFail: () => void;
}

export interface GlassHeroController {
  setCopy: (copy: GlassCopy, locale: Locale) => void;
  setDomHover: (patch: Partial<GlassHoverState>) => void;
  shatter: () => void;
  reassemble: () => void;
  pause: () => void;
  resume: () => void;
  dispose: () => void;
}

function insetPolygon(pts: readonly THREE.Vector2[], inset: number): THREE.Vector2[] {
  const n = pts.length;
  const out: THREE.Vector2[] = [];
  for (let i = 0; i < n; i += 1) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];

    const e1 = new THREE.Vector2().subVectors(curr, prev).normalize();
    const e2 = new THREE.Vector2().subVectors(next, curr).normalize();

    const n1 = new THREE.Vector2(e1.y, -e1.x);
    const n2 = new THREE.Vector2(e2.y, -e2.x);

    const bis = new THREE.Vector2().addVectors(n1, n2);
    const len = bis.length();
    if (len < 1e-4) {
      out.push(curr.clone().addScaledVector(n1, inset));
    } else {
      bis.divideScalar(len);
      const cosHalf = Math.max(0.35, bis.dot(n1));
      out.push(curr.clone().addScaledVector(bis, inset / cosHalf));
    }
  }
  return out;
}

function buildRoundedShape(pts: readonly THREE.Vector2[], radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const n = pts.length;
  for (let i = 0; i < n; i += 1) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];

    const v1 = new THREE.Vector2().subVectors(prev, curr);
    const v2 = new THREE.Vector2().subVectors(next, curr);
    const r = Math.min(radius, v1.length() * 0.35, v2.length() * 0.35);

    const p1 = curr.clone().addScaledVector(v1.normalize(), r);
    const p2 = curr.clone().addScaledVector(v2.normalize(), r);

    if (i === 0) shape.moveTo(p1.x, p1.y);
    else shape.lineTo(p1.x, p1.y);
    shape.quadraticCurveTo(curr.x, curr.y, p2.x, p2.y);
  }
  shape.closePath();
  return shape;
}

export async function createGlassHero(options: GlassHeroOptions): Promise<GlassHeroController> {
  const {
    container,
    eventRoot,
    panelLayerEl,
    navLayerEl,
    lowPower,
    onLayoutChange,
    onShatterStateChange,
    onFirstFrame,
    onContextLost: notifyContextLost,
    onContextRestored: notifyContextRestored,
    onFail,
  } = options;

  let activeCopy = options.copy;
  let activeLocale = options.locale;
  let disposed = false;
  let paused = false;
  let rafId = 0;
  let firstFrameDrawn = false;
  let contextLost = false;
  let contextLostGraceTimer: number | null = null;
  let activeVisibleWaitMs = 0;
  let stallCheckTimer: number | null = null;
  let lastStallPoll = performance.now();
  const startTimeMs = performance.now();

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.touchAction = 'pan-y';
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor('#050507', 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#050507');

  const roomEnv = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(roomEnv, 0.04);
  roomEnv.dispose();
  pmrem.dispose();
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.42;

  const keyLight = new THREE.DirectionalLight('#dceaff', 1.65);
  keyLight.position.set(-600, 700, 900);
  scene.add(keyLight);

  const fillLight = new THREE.HemisphereLight('#c4d8ff', '#0b0b10', 0.35);
  scene.add(fillLight);

  const fov = 30;
  const camera = new THREE.PerspectiveCamera(fov, 1, 10, 8000);

  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  const navCanvas = document.createElement('canvas');
  const panelCanvas = document.createElement('canvas');
  const measureCtx = panelCanvas.getContext('2d');
  if (!measureCtx) {
    renderer.dispose();
    if (canvas.parentNode === container) container.removeChild(canvas);
    onFail();
    throw new Error('2D canvas unavailable');
  }

  const navTexture = new THREE.CanvasTexture(navCanvas);
  navTexture.colorSpace = THREE.SRGBColorSpace;
  navTexture.minFilter = THREE.LinearFilter;
  navTexture.magFilter = THREE.LinearFilter;

  const panelTexture = new THREE.CanvasTexture(panelCanvas);
  panelTexture.colorSpace = THREE.SRGBColorSpace;
  panelTexture.minFilter = THREE.LinearFilter;
  panelTexture.magFilter = THREE.LinearFilter;

  const glowUniforms = {
    uCursorWorld: { value: new THREE.Vector3(0, 0, 0) },
    uCursorActive: { value: 0 },
    uCursorRadius: { value: 300 },
  };

  const applyCursorGlowShader = (shader: THREE.WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uCursorWorld = glowUniforms.uCursorWorld;
    shader.uniforms.uCursorActive = glowUniforms.uCursorActive;
    shader.uniforms.uCursorRadius = glowUniforms.uCursorRadius;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vSentinelWorldPos;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vSentinelWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform vec3 uCursorWorld;
         uniform float uCursorActive;
         uniform float uCursorRadius;
         varying vec3 vSentinelWorldPos;`,
      )
      .replace(
        '#include <dithering_fragment>',
        `float cursorDist = length(vSentinelWorldPos.xy - uCursorWorld.xy);
         float glow = exp(-1.6 * pow(cursorDist / max(1.0, uCursorRadius), 2.0));
         gl_FragColor.rgb += vec3(0.10, 0.62, 0.16) * 0.16 * glow * uCursorActive;
         #include <dithering_fragment>`,
      );
  };

  const glassMaterialBase = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#17171b'),
    roughness: 0.36,
    metalness: 0.05,
    clearcoat: 0.7,
    clearcoatRoughness: 0.12,
    specularIntensity: 0.7,
    iridescence: 0.55,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [250, 650],
    envMapIntensity: 1.0,
  });
  glassMaterialBase.onBeforeCompile = applyCursorGlowShader;
  glassMaterialBase.customProgramCacheKey = () => 'sentinel-glass-glow-v1';

  const navFaceMat = new THREE.MeshBasicMaterial({ map: navTexture, transparent: true, depthWrite: false });
  const panelFaceMat = new THREE.MeshBasicMaterial({ map: panelTexture, transparent: true, depthWrite: false });

  let sectionW = Math.max(320, container.clientWidth);
  let sectionH = Math.max(400, container.clientHeight);
  let layout: GlassLayout = measureGlassLayout(measureCtx, sectionW, sectionH, activeCopy, activeLocale);

  const hoverState: GlassHoverState = {
    pillHovered: false,
    readHovered: false,
    navHoveredIndex: -1,
  };

  const backSliver = createBackSliver(sectionW, sectionH);
  scene.add(backSliver.mesh);

  const pieces: ShardPiece[] = [];
  const createPiece = (name: string, index: number, matFace: THREE.MeshBasicMaterial): ShardPiece => {
    const group = new THREE.Group();
    const mat = glassMaterialBase.clone();
    mat.onBeforeCompile = applyCursorGlowShader;
    mat.customProgramCacheKey = () => 'sentinel-glass-glow-v1';
    const glassMesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    glassMesh.userData.pieceIndex = index;
    const faceMesh = new THREE.Mesh(new THREE.BufferGeometry(), matFace);
    faceMesh.userData.pieceIndex = index;
    group.add(glassMesh, faceMesh);
    rootGroup.add(group);
    return {
      name,
      group,
      glassMesh,
      faceMesh,
      basePosition: new THREE.Vector3(),
      liftSpring: { value: 0, velocity: 0 },
      tipXSpring: { value: 0, velocity: 0 },
      tipYSpring: { value: 0, velocity: 0 },
      hoverAmount: 0,
      flight: createPieceFlight(index, layout.scale, new THREE.Vector2(0, 0)),
      centroidNorm: new THREE.Vector2(0, 0),
    };
  };

  // Index 0: Nav slab; 1..5: Cells A..E
  pieces.push(createPiece('NAV', 0, navFaceMat));
  CELL_NAMES.forEach((cellName, i) => pieces.push(createPiece(cellName, i + 1, panelFaceMat)));

  let pointerInside = false;
  const pointerNdc = new THREE.Vector2(0, 0);
  let pointerPanelNorm: Pt | null = null;
  let hoveredPieceIndex = -1;
  const hoveredLocalPoint = new THREE.Vector3();
  let glowStrength = 0;

  let tiltX = 0.8 * (Math.PI / 180);
  let tiltY = -1.2 * (Math.PI / 180);

  let phase: ShatterPhase = 'entering';
  let phaseElapsed = 0;
  let shatterTime = 0;
  let lastGeoRebuild = -1;
  const rebuildInterval = lowPower ? 1 / 30 : 1 / 45;

  const raycaster = new THREE.Raycaster();
  const rayPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const rayWorldHit = new THREE.Vector3();

  const rebuildTextures = () => {
    const dpr = Math.max(1.5, Math.min(window.devicePixelRatio || 1, 2));
    drawNavCanvas(navCanvas, layout, activeCopy, dpr, hoverState);
    drawPanelCanvas(panelCanvas, layout, activeCopy, activeLocale, dpr, hoverState);
    navTexture.needsUpdate = true;
    panelTexture.needsUpdate = true;
  };

  const rebuildNavGeometry = () => {
    const navPiece = pieces[0];
    const S = layout.scale;
    const depth = Math.max(1, 13 * S);
    const bevel = Math.max(0.5, 2.6 * S);
    const radius = Math.max(2, 20 * S);
    const w = layout.panelW;
    const h = layout.navH;

    const pts = [
      new THREE.Vector2(-w / 2, h / 2),
      new THREE.Vector2(w / 2, h / 2),
      new THREE.Vector2(w / 2, -h / 2),
      new THREE.Vector2(-w / 2, -h / 2),
    ];
    const shape = buildRoundedShape(pts, radius);

    navPiece.glassMesh.geometry.dispose();
    navPiece.glassMesh.geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 8,
    });

    navPiece.faceMesh.geometry.dispose();
    const faceGeo = new THREE.ShapeGeometry(shape, 8);
    const posAttr = faceGeo.attributes.position;
    const uvs = new Float32Array(posAttr.count * 2);
    for (let i = 0; i < posAttr.count; i += 1) {
      const px = posAttr.getX(i);
      const py = posAttr.getY(i);
      uvs[i * 2] = (px + w / 2) / w;
      uvs[i * 2 + 1] = (py + h / 2) / h;
    }
    faceGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    faceGeo.translate(0, 0, depth + bevel + 0.6);
    navPiece.faceMesh.geometry = faceGeo;

    const navCenterY = layout.blockOffsetY + (layout.blockH / 2 - layout.navH / 2);
    navPiece.basePosition.set(0, navCenterY, -depth * 0.5);
    navPiece.flight = createPieceFlight(0, S, new THREE.Vector2(0, 0.8));
  };

  const rebuildCellGeometries = (time: number) => {
    const S = layout.scale;
    const depth = Math.max(1, 13 * S);
    const bevel = Math.max(0.5, 2.6 * S);
    const radius = Math.max(2, 20 * S);
    const halfGap = Math.max(1.2, 7 * S);
    const { panelW, panelH, navH, navGap, blockH, blockOffsetY } = layout;
    const panelCenterY = blockOffsetY + (blockH / 2 - navH - navGap - panelH / 2);
    const portrait = sectionH > sectionW;
    const cells = buildCells(time, pointerPanelNorm, portrait);

    CELL_NAMES.forEach((cellName, idx) => {
      const piece = pieces[idx + 1];
      const normPoly = cells[cellName];

      const worldPts = normPoly.map(
        ([nx, ny]) => new THREE.Vector2((nx - 0.5) * panelW, (0.5 - ny) * panelH),
      );

      const centroid = new THREE.Vector2();
      worldPts.forEach((p) => centroid.add(p));
      centroid.divideScalar(worldPts.length);

      const insetPts = insetPolygon(worldPts, halfGap);
      const localPts = insetPts.map((p) => p.clone().sub(centroid));
      const shape = buildRoundedShape(localPts, radius);

      piece.glassMesh.geometry.dispose();
      piece.glassMesh.geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 3,
        curveSegments: 8,
      });

      piece.faceMesh.geometry.dispose();
      const faceGeo = new THREE.ShapeGeometry(shape, 8);
      const posAttr = faceGeo.attributes.position;
      const uvs = new Float32Array(posAttr.count * 2);
      for (let i = 0; i < posAttr.count; i += 1) {
        const px = posAttr.getX(i) + centroid.x;
        const py = posAttr.getY(i) + centroid.y;
        uvs[i * 2] = (px + panelW / 2) / panelW;
        uvs[i * 2 + 1] = (py + panelH / 2) / panelH;
      }
      faceGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      faceGeo.translate(0, 0, depth + bevel + 0.6);
      piece.faceMesh.geometry = faceGeo;

      piece.basePosition.set(centroid.x, panelCenterY + centroid.y, -depth * 0.5);
      piece.centroidNorm.set(centroid.x / Math.max(1, panelW), centroid.y / Math.max(1, panelH));
      if (phase === 'assembled' || phase === 'entering') {
        piece.flight = createPieceFlight(idx + 1, S, piece.centroidNorm);
      }
    });
  };

  const applyLayoutAndSize = () => {
    if (disposed) return;
    sectionW = Math.max(300, container.clientWidth || window.innerWidth);
    sectionH = Math.max(400, container.clientHeight || window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(sectionW, sectionH, false);

    camera.aspect = sectionW / sectionH;
    camera.position.z = (sectionH / 2) / Math.tan(THREE.MathUtils.degToRad(fov / 2));
    camera.updateProjectionMatrix();

    layout = measureGlassLayout(measureCtx, sectionW, sectionH, activeCopy, activeLocale);
    glowUniforms.uCursorRadius.value = 300 * layout.scale;
    onLayoutChange(layout);
    rebuildTextures();
    rebuildNavGeometry();
    rebuildCellGeometries(0);
    backSliver.resize(sectionW, sectionH);
  };

  const updatePointerFromEvent = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    pointerInside = true;
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    pointerNdc.set(nx * 2 - 1, -(ny * 2 - 1));

    const panelLeft = layout.sideMargin;
    const panelTop = layout.topMargin + layout.navH + layout.navGap;
    const pnx = THREE.MathUtils.clamp((e.clientX - rect.left - panelLeft) / layout.panelW, 0, 1);
    const pny = THREE.MathUtils.clamp((e.clientY - rect.top - panelTop) / layout.panelH, 0, 1);
    pointerPanelNorm = [pnx, pny];
  };

  const resetPointer = () => {
    pointerInside = false;
    pointerPanelNorm = null;
    hoveredPieceIndex = -1;
  };

  const onPointerDown = (e: PointerEvent) => {
    updatePointerFromEvent(e);
  };

  const onPointerMove = (e: PointerEvent) => {
    updatePointerFromEvent(e);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') {
      resetPointer();
    }
  };

  const onPointerCancel = () => {
    resetPointer();
  };

  const onPointerLeave = () => {
    resetPointer();
  };

  const onContextLost = (e: Event) => {
    e.preventDefault();
    if (disposed) return;
    contextLost = true;
    notifyContextLost?.();
    if (contextLostGraceTimer !== null) {
      window.clearTimeout(contextLostGraceTimer);
    }
    // Wait up to 3 s for webglcontextrestored; otherwise trigger one rebuild
    contextLostGraceTimer = window.setTimeout(() => {
      contextLostGraceTimer = null;
      if (!disposed) onFail();
    }, 3000);
  };

  const onContextRestored = () => {
    if (contextLostGraceTimer !== null) {
      window.clearTimeout(contextLostGraceTimer);
      contextLostGraceTimer = null;
    }
    notifyContextRestored?.();
    if (!disposed) {
      // Rebuild cleanly with a fresh canvas on restore
      onFail();
    }
  };

  eventRoot.addEventListener('pointerdown', onPointerDown, { passive: true });
  eventRoot.addEventListener('pointermove', onPointerMove, { passive: true });
  eventRoot.addEventListener('pointerup', onPointerUp, { passive: true });
  eventRoot.addEventListener('pointercancel', onPointerCancel, { passive: true });
  eventRoot.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  window.addEventListener('resize', applyLayoutAndSize);

  // Fonts never block the engine: race against 1500 ms and redraw when fonts settle.
  const loadedInTime = await raceGlassFonts(1500);
  if (disposed) {
    return {
      setCopy: () => {},
      setDomHover: () => {},
      shatter: () => {},
      reassemble: () => {},
      pause: () => {},
      resume: () => {},
      dispose: () => {},
    };
  }

  if (!loadedInTime && typeof document !== 'undefined' && 'fonts' in document) {
    void document.fonts.ready.then(() => {
      if (disposed) return;
      layout = measureGlassLayout(measureCtx, sectionW, sectionH, activeCopy, activeLocale);
      onLayoutChange(layout);
      rebuildTextures();
    });
  }

  applyLayoutAndSize();

  let prevTime = performance.now();
  let totalTime = 0;

  const hoverMeshes = pieces.map((p) => p.glassMesh);

  const tick = (now: number) => {
    if (disposed || paused || contextLost) return;
    rafId = requestAnimationFrame(tick);

    const dt = Math.min((now - prevTime) / 1000, 0.05);
    prevTime = now;
    totalTime += dt;
    phaseElapsed += dt;

    if (phase === 'entering' && phaseElapsed >= SHATTER_DURATION + pieces.length * 0.03) {
      phase = 'assembled';
      onShatterStateChange('assembled');
    } else if (phase === 'shattering' && phaseElapsed >= SHATTER_DURATION + pieces.length * 0.03) {
      phase = 'shattered';
      onShatterStateChange('shattered');
    } else if (phase === 'reassembling' && phaseElapsed >= SHATTER_DURATION + pieces.length * 0.03) {
      phase = 'assembled';
      onShatterStateChange('assembled');
    }

    const targetTiltY = pointerInside
      ? (pointerNdc.x * 7 - 1.2) * (Math.PI / 180)
      : -1.2 * (Math.PI / 180);
    const targetTiltX = pointerInside
      ? (-pointerNdc.y * 5.5 + 0.8) * (Math.PI / 180)
      : 0.8 * (Math.PI / 180);

    tiltX = expSmooth(tiltX, targetTiltX, dt, 0.3);
    tiltY = expSmooth(tiltY, targetTiltY, dt, 0.3);
    rootGroup.rotation.set(tiltX, tiltY, 0);

    glowStrength = expSmooth(glowStrength, pointerInside && phase === 'assembled' ? 1 : 0, dt, 0.18);
    glowUniforms.uCursorActive.value = glowStrength;

    if (pointerInside && phase === 'assembled') {
      raycaster.setFromCamera(pointerNdc, camera);
      if (raycaster.ray.intersectPlane(rayPlane, rayWorldHit)) {
        glowUniforms.uCursorWorld.value.copy(rayWorldHit);
      }
      const hits = raycaster.intersectObjects(hoverMeshes, false);
      if (hits.length > 0) {
        const hitMesh = hits[0].object;
        hoveredPieceIndex = typeof hitMesh.userData.pieceIndex === 'number' ? hitMesh.userData.pieceIndex : -1;
        if (hoveredPieceIndex >= 0) {
          hoveredLocalPoint.copy(hits[0].point);
          pieces[hoveredPieceIndex].group.worldToLocal(hoveredLocalPoint);
        }
      } else {
        hoveredPieceIndex = -1;
      }
    } else {
      hoveredPieceIndex = -1;
    }

    if (phase === 'assembled' && totalTime - lastGeoRebuild >= rebuildInterval) {
      lastGeoRebuild = totalTime;
      rebuildCellGeometries(totalTime);
    }

    const S = layout.scale;
    const depth = Math.max(1, 13 * S);
    const bevel = Math.max(0.5, 2.6 * S);
    const zTop = depth * 0.5 + bevel + 0.6;

    pieces.forEach((piece, idx) => {
      const isHovered = phase === 'assembled' && idx === hoveredPieceIndex;
      const targetLift = isHovered ? (idx === 0 ? 32 : 50) * S : 0;

      let targetTipX = 0;
      let targetTipY = 0;
      if (isHovered) {
        const halfW = idx === 0 ? layout.panelW * 0.5 : layout.panelW * 0.28;
        const halfH = idx === 0 ? layout.navH * 0.5 : layout.panelH * 0.28;
        targetTipY = THREE.MathUtils.clamp((hoveredLocalPoint.x / Math.max(40, halfW)) * 0.24, -0.24, 0.24);
        targetTipX = THREE.MathUtils.clamp((-hoveredLocalPoint.y / Math.max(40, halfH)) * 0.24, -0.24, 0.24);
      }

      const lift = stepSpring(piece.liftSpring, targetLift, dt, 170, 19);
      const tipX = stepSpring(piece.tipXSpring, targetTipX, dt, 170, 19);
      const tipY = stepSpring(piece.tipYSpring, targetTipY, dt, 170, 19);

      piece.hoverAmount = expSmooth(piece.hoverAmount, isHovered ? 1 : 0, dt, 0.14);
      const glassMat = piece.glassMesh.material as THREE.MeshPhysicalMaterial;
      glassMat.iridescence = THREE.MathUtils.lerp(0.55, 1.0, piece.hoverAmount);
      glassMat.envMapIntensity = THREE.MathUtils.lerp(1.0, 1.9, piece.hoverAmount);

      applyFlightTransform(
        piece.group,
        piece.basePosition,
        new THREE.Vector3(0, 0, lift),
        new THREE.Euler(tipX, tipY, 0),
        piece.flight,
        phase,
        phaseElapsed,
        S,
      );
    });

    const sliverVisible = phase === 'shattering' || phase === 'shattered';
    if (sliverVisible) shatterTime += dt;
    else shatterTime = 0;
    backSliver.update(totalTime, dt, sliverVisible, shatterTime, pointerInside ? pointerNdc : null, raycaster, camera);

    if (phase !== 'shattered') {
      const panelCorners = projectPanelCorners(rootGroup, camera, layout, sectionW, sectionH, zTop);
      panelLayerEl.style.transform = computePanelMatrix3d(layout.panelW, layout.panelH, panelCorners);

      const navCorners = projectNavCorners(rootGroup, camera, layout, sectionW, sectionH, zTop);
      navLayerEl.style.transform = computePanelMatrix3d(layout.panelW, layout.navH, navCorners);
    }

    renderer.render(scene, camera);

    if (!firstFrameDrawn) {
      firstFrameDrawn = true;
      if (stallCheckTimer !== null) {
        window.clearInterval(stallCheckTimer);
        stallCheckTimer = null;
      }
      onFirstFrame?.(Math.round(performance.now() - startTimeMs));
    }
  };

  // Start the stall watcher only after the first RAF is scheduled, counting only active visible time.
  lastStallPoll = performance.now();
  stallCheckTimer = window.setInterval(() => {
    const now = performance.now();
    if (!paused && !document.hidden && !firstFrameDrawn && !contextLost) {
      activeVisibleWaitMs += now - lastStallPoll;
      if (activeVisibleWaitMs >= 15000) {
        if (stallCheckTimer !== null) {
          window.clearInterval(stallCheckTimer);
          stallCheckTimer = null;
        }
        if (!disposed) onFail();
      }
    }
    lastStallPoll = now;
  }, 500);

  if (!paused && !contextLost) {
    rafId = requestAnimationFrame(tick);
  }

  return {
    setCopy(nextCopy, nextLocale) {
      if (disposed) return;
      activeCopy = nextCopy;
      activeLocale = nextLocale;
      layout = measureGlassLayout(measureCtx, sectionW, sectionH, activeCopy, activeLocale);
      onLayoutChange(layout);
      rebuildTextures();
    },
    setDomHover(patch) {
      if (disposed) return;
      Object.assign(hoverState, patch);
      rebuildTextures();
    },
    shatter() {
      if (disposed || phase === 'shattering' || phase === 'shattered') return;
      phase = 'shattering';
      phaseElapsed = 0;
      shatterTime = 0;
    },
    reassemble() {
      if (disposed || phase === 'reassembling' || phase === 'assembled') return;
      phase = 'reassembling';
      phaseElapsed = 0;
    },
    pause() {
      if (paused || disposed) return;
      paused = true;
      cancelAnimationFrame(rafId);
    },
    resume() {
      if (!paused || disposed || contextLost) return;
      paused = false;
      prevTime = performance.now();
      lastStallPoll = prevTime;
      rafId = requestAnimationFrame(tick);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (stallCheckTimer !== null) {
        window.clearInterval(stallCheckTimer);
        stallCheckTimer = null;
      }
      if (contextLostGraceTimer !== null) {
        window.clearTimeout(contextLostGraceTimer);
        contextLostGraceTimer = null;
      }
      cancelAnimationFrame(rafId);

      eventRoot.removeEventListener('pointerdown', onPointerDown);
      eventRoot.removeEventListener('pointermove', onPointerMove);
      eventRoot.removeEventListener('pointerup', onPointerUp);
      eventRoot.removeEventListener('pointercancel', onPointerCancel);
      eventRoot.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      window.removeEventListener('resize', applyLayoutAndSize);

      pieces.forEach((piece) => {
        piece.glassMesh.geometry.dispose();
        (piece.glassMesh.material as THREE.Material).dispose();
        piece.faceMesh.geometry.dispose();
      });
      backSliver.dispose();
      glassMaterialBase.dispose();
      navFaceMat.dispose();
      panelFaceMat.dispose();
      navTexture.dispose();
      panelTexture.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    },
  };
}
