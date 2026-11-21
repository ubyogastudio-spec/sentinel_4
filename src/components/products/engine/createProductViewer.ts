import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { ProductEntry } from '@/content/products';
import { prefersReducedMotion } from '@/lib/device';
import { loadProductModel } from './loadModel';

export interface ProductViewerOptions {
  readonly container: HTMLElement;
  readonly initialProduct: ProductEntry;
  readonly ariaLabel: string;
  readonly onLoadingChange: (loading: boolean, pct: number | null) => void;
  readonly onUnavailable: () => void;
}

export interface ProductViewerController {
  setProduct: (product: ProductEntry, ariaLabel: string) => void;
  setAriaLabel: (ariaLabel: string) => void;
  pause: () => void;
  resume: () => void;
  dispose: () => void;
}

function disposeObjectTree(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (!m) return;
        for (const val of Object.values(m)) {
          if (val instanceof THREE.Texture) val.dispose();
        }
        m.dispose();
      });
    }
  });
}

function setModelOpacity(root: THREE.Object3D, opacity: number): void {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => {
      if (!m) return;
      if (opacity < 1) {
        m.transparent = true;
        m.opacity = opacity;
      } else {
        m.opacity = 1;
        m.transparent = false;
      }
      m.needsUpdate = true;
    });
  });
}

function fitModelToUnitSphere(model: THREE.Object3D): THREE.Group {
  const wrapper = new THREE.Group();
  wrapper.add(model);
  wrapper.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);

  const radius = Math.max(sphere.radius, 0.001);
  const scale = 1 / radius;
  model.scale.multiplyScalar(scale);
  model.position.sub(sphere.center.clone().multiplyScalar(scale));
  wrapper.updateMatrixWorld(true);
  return wrapper;
}

export function createProductViewer(options: ProductViewerOptions): ProductViewerController {
  const { container, onLoadingChange, onUnavailable } = options;

  let disposed = false;
  let paused = false;
  let contextLost = false;
  let rafId = 0;

  const canvas = document.createElement('canvas');
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', options.ariaLabel);
  canvas.className = 'block h-full w-full cursor-grab active:cursor-grabbing rounded-lg focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring';
  canvas.style.touchAction = 'pan-y';
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.9;
  pmrem.dispose();

  const keyLight = new THREE.DirectionalLight('#ffffff', 1.1);
  keyLight.position.set(2.5, 4, 3);
  scene.add(keyLight);

  const fov = 30;
  const cameraDistance = 1 / Math.sin(THREE.MathUtils.degToRad(fov / 2)) / 0.72;
  const camera = new THREE.PerspectiveCamera(fov, 4 / 3, 0.1, 100);

  let azimuth = 0.55;
  let polar = Math.PI * 0.42;
  let velAzimuth = 0;
  let velPolar = 0;
  let interacted = false;
  let dragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let needsRender = true;

  const MIN_POLAR = THREE.MathUtils.degToRad(25);
  const MAX_POLAR = THREE.MathUtils.degToRad(115);

  let currentModel: THREE.Group | null = null;
  let outgoingModel: THREE.Group | null = null;
  let fadeElapsed = 0;
  let incomingOpacity = 1;
  let outgoingOpacity = 0;
  let currentAbort: AbortController | null = null;
  let requestCounter = 0;

  const updateCamera = () => {
    const sinP = Math.sin(polar);
    camera.position.set(
      cameraDistance * sinP * Math.sin(azimuth),
      cameraDistance * Math.cos(polar),
      cameraDistance * sinP * Math.cos(azimuth),
    );
    camera.lookAt(0, 0, 0);
  };

  const handleResize = () => {
    if (disposed) return;
    const w = Math.max(100, container.clientWidth);
    const h = Math.max(100, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    needsRender = true;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragging = true;
    interacted = true;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if capture is unavailable.
    }
    needsRender = true;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;

    const sens = 0.0085;
    const dAz = -dx * sens;
    const dPol = -dy * sens;
    azimuth += dAz;
    polar = THREE.MathUtils.clamp(polar + dPol, MIN_POLAR, MAX_POLAR);
    velAzimuth = dAz * 25;
    velPolar = dPol * 25;
    needsRender = true;
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore.
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step = 0.15;
    let handled = true;
    if (e.key === 'ArrowLeft') azimuth -= step;
    else if (e.key === 'ArrowRight') azimuth += step;
    else if (e.key === 'ArrowUp') polar = THREE.MathUtils.clamp(polar - step, MIN_POLAR, MAX_POLAR);
    else if (e.key === 'ArrowDown') polar = THREE.MathUtils.clamp(polar + step, MIN_POLAR, MAX_POLAR);
    else handled = false;

    if (handled) {
      e.preventDefault();
      interacted = true;
      velAzimuth = 0;
      velPolar = 0;
      needsRender = true;
    }
  };

  const onContextLost = (e: Event) => {
    e.preventDefault();
    contextLost = true;
    onUnavailable();
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('webglcontextlost', onContextLost);
  window.addEventListener('resize', handleResize);

  const loadProduct = (product: ProductEntry) => {
    currentAbort?.abort();
    const controller = new AbortController();
    currentAbort = controller;
    requestCounter += 1;
    const reqId = requestCounter;

    onLoadingChange(true, 0);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    void loadProductModel(product, controller.signal, maxAniso, (pct) => {
      if (!disposed && reqId === requestCounter) {
        onLoadingChange(true, pct);
      }
    })
      .then((loaded) => {
        if (disposed || reqId !== requestCounter) {
          disposeObjectTree(loaded);
          return;
        }
        onLoadingChange(false, 100);
        const fitted = fitModelToUnitSphere(loaded);
        if (outgoingModel) {
          scene.remove(outgoingModel);
          disposeObjectTree(outgoingModel);
          outgoingModel = null;
        }
        if (currentModel && !prefersReducedMotion()) {
          outgoingModel = currentModel;
          outgoingOpacity = 1;
          incomingOpacity = 0;
          fadeElapsed = 0;
          setModelOpacity(fitted, 0);
        } else {
          if (currentModel) {
            scene.remove(currentModel);
            disposeObjectTree(currentModel);
          }
          incomingOpacity = 1;
          outgoingOpacity = 0;
        }
        currentModel = fitted;
        scene.add(fitted);
        needsRender = true;
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!disposed && reqId === requestCounter) {
          onLoadingChange(false, null);
        }
      });
  };

  handleResize();
  loadProduct(options.initialProduct);

  let prevTime = performance.now();

  const tick = (now: number) => {
    if (disposed || paused || contextLost) return;
    rafId = requestAnimationFrame(tick);

    const dt = Math.min((now - prevTime) / 1000, 0.05);
    prevTime = now;

    const reduced = prefersReducedMotion();

    if (!dragging) {
      if (Math.abs(velAzimuth) > 1e-4 || Math.abs(velPolar) > 1e-4) {
        azimuth += velAzimuth * dt;
        polar = THREE.MathUtils.clamp(polar + velPolar * dt, MIN_POLAR, MAX_POLAR);
        const damp = Math.pow(0.92, dt * 60);
        velAzimuth *= damp;
        velPolar *= damp;
        needsRender = true;
      } else if (!interacted && !reduced) {
        azimuth += 0.35 * dt;
        needsRender = true;
      }
    }

    // Handle 300ms crossfade
    if (outgoingModel || incomingOpacity < 1) {
      fadeElapsed += dt;
      const t = Math.min(1, fadeElapsed / 0.3);
      incomingOpacity = t;
      outgoingOpacity = 1 - t;
      if (currentModel) setModelOpacity(currentModel, incomingOpacity);
      if (outgoingModel) setModelOpacity(outgoingModel, outgoingOpacity);
      if (t >= 1) {
        if (outgoingModel) {
          scene.remove(outgoingModel);
          disposeObjectTree(outgoingModel);
          outgoingModel = null;
        }
        if (currentModel) setModelOpacity(currentModel, 1);
      }
      needsRender = true;
    }

    if (needsRender || !reduced) {
      updateCamera();
      renderer.render(scene, camera);
      needsRender = false;
    }
  };

  rafId = requestAnimationFrame(tick);

  return {
    setProduct(product, ariaLabel) {
      if (disposed) return;
      canvas.setAttribute('aria-label', ariaLabel);
      loadProduct(product);
    },
    setAriaLabel(ariaLabel) {
      canvas.setAttribute('aria-label', ariaLabel);
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
      needsRender = true;
      rafId = requestAnimationFrame(tick);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      currentAbort?.abort();
      cancelAnimationFrame(rafId);

      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      window.removeEventListener('resize', handleResize);

      if (currentModel) disposeObjectTree(currentModel);
      if (outgoingModel) disposeObjectTree(outgoingModel);
      envTarget.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    },
  };
}
