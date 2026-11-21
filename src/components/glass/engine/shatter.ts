import * as THREE from 'three';
import { easeInCubic, easeOutBack } from './springs';

export type ShatterPhase = 'entering' | 'assembled' | 'shattering' | 'shattered' | 'reassembling';

export interface PieceFlight {
  readonly stagger: number;
  readonly velocity: THREE.Vector3;
  readonly tumbleAxis: THREE.Vector3;
  readonly tumbleAngle: number;
}

export function createPieceFlight(index: number, scale: number, centroid: THREE.Vector2): PieceFlight {
  const angle = Math.atan2(centroid.y, centroid.x) + (index - 2.5) * 0.28;
  const outward = (260 + ((index * 97) % 180)) * scale;
  const vx = Math.cos(angle) * outward;
  const vy = Math.sin(angle) * outward - 220 * scale;
  const vz = (420 + ((index * 137) % 380)) * scale;

  const axis = new THREE.Vector3(
    Math.sin(index * 1.9 + 0.4),
    Math.cos(index * 2.3 + 1.1),
    Math.sin(index * 3.1 + 0.7),
  ).normalize();

  return {
    stagger: index * 0.03,
    velocity: new THREE.Vector3(vx, vy, vz),
    tumbleAxis: axis,
    tumbleAngle: 2.0 + ((index * 0.43) % 1.6),
  };
}

export const SHATTER_DURATION = 0.72;

export function applyFlightTransform(
  target: THREE.Object3D,
  basePosition: THREE.Vector3,
  hoverOffset: THREE.Vector3,
  hoverEuler: THREE.Euler,
  flight: PieceFlight,
  phase: ShatterPhase,
  phaseElapsed: number,
  scale: number,
): void {
  if (phase === 'assembled') {
    target.visible = true;
    target.position.copy(basePosition).add(hoverOffset);
    target.rotation.copy(hoverEuler);
    return;
  }

  if (phase === 'shattered') {
    target.visible = false;
    return;
  }

  target.visible = true;
  const localT = Math.max(0, Math.min(1, (phaseElapsed - flight.stagger) / SHATTER_DURATION));

  let progress = 0;
  if (phase === 'shattering') {
    progress = easeInCubic(localT);
  } else if (phase === 'reassembling' || phase === 'entering') {
    progress = 1 - easeOutBack(localT);
  }

  const gravity = -520 * scale;
  target.position.set(
    basePosition.x + hoverOffset.x * (1 - progress) + flight.velocity.x * progress,
    basePosition.y + hoverOffset.y * (1 - progress) + flight.velocity.y * progress + 0.5 * gravity * progress * progress,
    basePosition.z + hoverOffset.z * (1 - progress) + flight.velocity.z * progress,
  );

  const qHover = new THREE.Quaternion().setFromEuler(hoverEuler);
  const qTumble = new THREE.Quaternion().setFromAxisAngle(flight.tumbleAxis, flight.tumbleAngle * progress);
  target.quaternion.copy(qHover).multiply(qTumble);
}
