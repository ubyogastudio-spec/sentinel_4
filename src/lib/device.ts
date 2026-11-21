interface NetworkInformationLike {
  readonly saveData?: boolean;
}

interface NavigatorDevice extends Navigator {
  readonly connection?: NetworkInformationLike;
  readonly deviceMemory?: number;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Device gate kept exclusively for the first Spline hero. */
export function isWeakDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorDevice;
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) return true;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2) return true;
  if (prefersReducedMotion()) return true;
  return false;
}

/** Lower quality cap for the glass WebGL engine (keeps WebGL active, caps DPR and rebuild cadence). */
export function isGlassLowPower(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorDevice;
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return true;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2) return true;
  return false;
}
