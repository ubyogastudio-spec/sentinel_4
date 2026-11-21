import type { ProductEntry } from '@/content/products';

interface ProductIllustrationProps {
  readonly slug: ProductEntry['slug'];
  readonly className?: string;
}

export function ProductIllustration({ slug, className }: ProductIllustrationProps) {
  if (slug === 'camera') {
    return (
      <svg
        viewBox="0 0 240 160"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        {/* Wall plate and arm */}
        <rect x="28" y="64" width="12" height="44" rx="2" />
        <path d="M40 86 H70 L84 72 H102" />
        {/* Camera body */}
        <rect x="96" y="48" width="84" height="46" rx="8" />
        {/* Sun shield */}
        <path d="M92 46 H188 L178 36 H100 Z" />
        {/* Lens bezel */}
        <circle cx="176" cy="71" r="18" />
        <circle cx="176" cy="71" r="11" stroke="hsl(var(--primary))" strokeWidth={2} />
        <circle cx="176" cy="71" r="4" fill="hsl(var(--primary))" stroke="none" />
        {/* Side vents */}
        <line x1="112" y1="62" x2="140" y2="62" />
        <line x1="112" y1="71" x2="140" y2="71" />
        <line x1="112" y1="80" x2="140" y2="80" />
      </svg>
    );
  }

  if (slug === 'reader') {
    return (
      <svg
        viewBox="0 0 240 160"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        {/* Outer rounded plate */}
        <rect x="86" y="18" width="68" height="124" rx="10" />
        <rect x="92" y="24" width="56" height="112" rx="6" strokeOpacity={0.45} />
        {/* Green status bar */}
        <rect
          x="104"
          y="34"
          width="32"
          height="5"
          rx="2.5"
          fill="hsl(var(--primary))"
          stroke="none"
        />
        {/* 3x4 keypad grid */}
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={101 + col * 14}
              y={52 + row * 15}
              width="10"
              height="10"
              rx="2"
            />
          )),
        )}
        {/* Card tap zone */}
        <path d="M110 120 H130" stroke="hsl(var(--primary))" strokeWidth={1.75} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Rack ears */}
      <rect x="18" y="66" width="12" height="36" rx="1.5" />
      <rect x="210" y="66" width="12" height="36" rx="1.5" />
      {/* Chassis */}
      <rect x="30" y="58" width="180" height="52" rx="4" />
      <path d="M36 58 L54 44 H186 L204 58" strokeOpacity={0.5} />
      {/* 8 port insets */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
        <rect key={idx} x={44 + idx * 18} y="76" width="12" height="14" rx="1.5" />
      ))}
      {/* 4 green status dots */}
      {[0, 1, 2, 3].map((idx) => (
        <circle
          key={idx}
          cx={50 + idx * 36}
          cy="68"
          r="2.2"
          fill="hsl(var(--primary))"
          stroke="none"
        />
      ))}
      {/* Management port */}
      <circle cx="196" cy="83" r="4" />
    </svg>
  );
}
