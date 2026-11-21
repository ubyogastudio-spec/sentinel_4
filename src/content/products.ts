export interface ProductEntry {
  readonly slug: 'camera' | 'reader' | 'hub';
  readonly name: string;
  readonly code: string;
  readonly service: 'surveillance' | 'access' | 'network';
  readonly model: string;
  readonly credit?: string;
}

export const products: readonly ProductEntry[] = [
  { slug: 'camera', name: 'Sentinel Eye',  code: 'SE-4', service: 'surveillance', model: '/models/camera.glb' },
  { slug: 'reader', name: 'Sentinel Gate', code: 'SG-2', service: 'access',       model: '/models/reader.glb' },
  { slug: 'hub',    name: 'Sentinel Core', code: 'SC-8', service: 'network',      model: '/models/hub.glb' },
] as const;
