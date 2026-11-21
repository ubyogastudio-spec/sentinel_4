import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { ProductEntry } from '@/content/products';
import { buildFallbackModel } from './fallbackModels';

const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';
const STALL_MS = 20000;

let sharedDraco: DRACOLoader | null = null;
function getDracoLoader(): DRACOLoader {
  if (!sharedDraco) {
    sharedDraco = new DRACOLoader();
    sharedDraco.setDecoderPath(DRACO_PATH);
  }
  return sharedDraco;
}

async function fetchWithProgress(
  url: string,
  signal: AbortSignal,
  onProgress: (pct: number | null) => void,
): Promise<ArrayBuffer> {
  const stallController = new AbortController();
  const onOuterAbort = () => stallController.abort();
  signal.addEventListener('abort', onOuterAbort, { once: true });

  let stallTimer = window.setTimeout(() => stallController.abort(), STALL_MS);
  const bumpStall = () => {
    window.clearTimeout(stallTimer);
    stallTimer = window.setTimeout(() => stallController.abort(), STALL_MS);
  };

  try {
    const res = await fetch(url, { signal: stallController.signal });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || contentType.includes('text/html')) {
      throw new Error('model unavailable');
    }

    const total = Number(res.headers.get('content-length')) || 0;
    const reader = res.body?.getReader();
    if (!reader) {
      const buf = await res.arrayBuffer();
      onProgress(100);
      return buf;
    }

    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      bumpStall();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.byteLength;
        if (total > 0) {
          onProgress(Math.min(100, Math.round((received / total) * 100)));
        } else {
          onProgress(null);
        }
      }
    }

    const out = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      out.set(chunk, offset);
      offset += chunk.byteLength;
    }
    onProgress(100);
    return out.buffer;
  } finally {
    window.clearTimeout(stallTimer);
    signal.removeEventListener('abort', onOuterAbort);
  }
}

function normalizeMaterials(root: THREE.Object3D, maxAnisotropy: number): void {
  const defaultMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2B2B2B'),
    roughness: 0.5,
    metalness: 0.25,
  });
  const ledMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#05E901'),
    emissive: new THREE.Color('#05E901'),
    emissiveIntensity: 1.5,
    roughness: 0.25,
    metalness: 0.1,
  });

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    if (/led|light|status/i.test(obj.name)) {
      obj.material = ledMat;
      return;
    }
    const mat = obj.material;
    if (!mat) {
      obj.material = defaultMat;
      return;
    }
    const mats = Array.isArray(mat) ? mat : [mat];
    const hasTexture = mats.some((m) => 'map' in m && Boolean((m as THREE.MeshStandardMaterial).map));
    if (!hasTexture) {
      obj.material = defaultMat;
      return;
    }
    mats.forEach((m) => {
      const std = m as THREE.MeshStandardMaterial;
      if (std.map) {
        std.map.anisotropy = maxAnisotropy;
        std.map.needsUpdate = true;
      }
    });
  });
}

export async function loadProductModel(
  product: ProductEntry,
  signal: AbortSignal,
  maxAnisotropy: number,
  onProgress: (pct: number | null) => void,
): Promise<THREE.Object3D> {
  try {
    const buffer = await fetchWithProgress(product.model, signal, onProgress);
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const loader = new GLTFLoader();
    loader.setDRACOLoader(getDracoLoader());
    loader.setMeshoptDecoder(MeshoptDecoder);

    const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      loader.parse(buffer, '', resolve, reject);
    });

    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    normalizeMaterials(gltf.scene, maxAnisotropy);
    return gltf.scene;
  } catch (err) {
    if (signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
      throw err;
    }
    return buildFallbackModel(product.slug);
  }
}
