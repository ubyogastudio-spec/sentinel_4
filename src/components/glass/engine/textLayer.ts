import * as THREE from 'three';
import type { GlassLayout } from './pageCanvas';
import type { Point2D } from './springs';

export function projectPanelCorners(
  group: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  layout: GlassLayout,
  sectionW: number,
  sectionH: number,
  zTop: number,
): [Point2D, Point2D, Point2D, Point2D] {
  const { panelW, panelH, navH, navGap, blockH, blockOffsetY } = layout;
  // Center of panel in world Y-up coordinates
  const panelCenterWorldY = blockOffsetY + (blockH / 2 - navH - navGap - panelH / 2);
  const topY = panelCenterWorldY + panelH / 2;
  const botY = panelCenterWorldY - panelH / 2;
  const leftX = -panelW / 2;
  const rightX = panelW / 2;

  const corners = [
    new THREE.Vector3(leftX, topY, zTop),
    new THREE.Vector3(rightX, topY, zTop),
    new THREE.Vector3(rightX, botY, zTop),
    new THREE.Vector3(leftX, botY, zTop),
  ];

  group.updateMatrixWorld(true);
  const projected = corners.map((v) => {
    v.applyMatrix4(group.matrixWorld);
    v.project(camera);
    return {
      x: ((v.x + 1) * 0.5) * sectionW,
      y: ((-v.y + 1) * 0.5) * sectionH,
    };
  });

  return [projected[0], projected[1], projected[2], projected[3]];
}

export function projectNavCorners(
  group: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  layout: GlassLayout,
  sectionW: number,
  sectionH: number,
  zTop: number,
): [Point2D, Point2D, Point2D, Point2D] {
  const { panelW, navH, blockH, blockOffsetY } = layout;
  const navCenterWorldY = blockOffsetY + (blockH / 2 - navH / 2);
  const topY = navCenterWorldY + navH / 2;
  const botY = navCenterWorldY - navH / 2;
  const leftX = -panelW / 2;
  const rightX = panelW / 2;

  const corners = [
    new THREE.Vector3(leftX, topY, zTop),
    new THREE.Vector3(rightX, topY, zTop),
    new THREE.Vector3(rightX, botY, zTop),
    new THREE.Vector3(leftX, botY, zTop),
  ];

  group.updateMatrixWorld(true);
  const projected = corners.map((v) => {
    v.applyMatrix4(group.matrixWorld);
    v.project(camera);
    return {
      x: ((v.x + 1) * 0.5) * sectionW,
      y: ((-v.y + 1) * 0.5) * sectionH,
    };
  });

  return [projected[0], projected[1], projected[2], projected[3]];
}
