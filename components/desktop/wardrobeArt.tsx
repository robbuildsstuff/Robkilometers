import type { WardrobeArt } from '@/content';

// Cartoon clothes for the wardrobe: flat retro colours, thick dark outlines (like the bookcase).
const INK = '#1a100a';
const line = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export function Hanger() {
  return (
    <svg viewBox="0 0 100 34" className="hanger" aria-hidden="true">
      <path d="M50 2 q7 0 7 7 q0 6 -7 8 v3 L8 32 h84 L50 20" fill="none" {...line} />
    </svg>
  );
}

const ART: Record<WardrobeArt, React.ReactNode> = {
  tee: (
    <svg viewBox="0 0 100 100">
      <path d="M30 14 L42 9 Q50 18 58 9 L70 14 L93 32 L82 47 L72 40 L72 94 L28 94 L28 40 L18 47 L7 32 Z" fill="#b8322a" {...line} />
      <path d="M42 9 Q50 22 58 9" fill="none" {...line} />
      <text x="50" y="72" textAnchor="middle" fontFamily="Tahoma, sans-serif" fontWeight="700" fontSize="26" fill="#e2b33c" stroke={INK} strokeWidth="1.5">
        7
      </text>
    </svg>
  ),
  sweater: (
    <svg viewBox="0 0 100 100">
      <path d="M30 13 L42 9 Q50 17 58 9 L70 13 L86 30 L95 82 L82 85 L74 46 L74 94 L26 94 L26 46 L18 85 L5 82 L14 30 Z" fill="#e2b33c" {...line} />
      <path d="M42 9 Q50 20 58 9" fill="none" {...line} />
      <path d="M28 52 H72 M28 62 H72 M28 72 H72" stroke="#c98a1c" strokeWidth="4" />
      <path d="M26 86 H74 M6 76 L18 74 M94 76 L82 74" {...line} fill="none" />
    </svg>
  ),
  jacket: (
    <svg viewBox="0 0 100 100">
      <path d="M30 12 L40 8 L50 20 L60 8 L70 12 L86 30 L95 84 L82 87 L74 46 L74 95 L26 95 L26 46 L18 87 L5 84 L14 30 Z" fill="#2a7a78" {...line} />
      <path d="M40 8 L36 30 L50 20 L64 30 L60 8" fill="#3f9a96" {...line} />
      <path d="M50 20 V95" {...line} />
      <path d="M32 62 h12 v10 h-12 Z M56 62 h12 v10 h-12 Z" fill="#24605e" {...line} />
      <path d="M30 70 L46 58 L58 70 L72 58" fill="none" stroke="#9ad4cf" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  ),
  pants: (
    <svg viewBox="0 0 80 120">
      <path d="M14 6 H66 L71 114 H50 L42 40 H38 L30 114 H9 Z" fill="#8a5ab8" {...line} />
      <path d="M14 6 H66 V16 H14 Z" fill="#6d4a8a" {...line} />
      <path d="M22 20 L19 108 M58 20 L61 108" stroke="#6d4a8a" strokeWidth="2" />
    </svg>
  ),
  jeans: (
    <svg viewBox="0 0 80 120">
      <path d="M14 6 H66 L71 114 H50 L42 40 H38 L30 114 H9 Z" fill="#4a72b8" {...line} />
      <path d="M14 6 H66 V16 H14 Z" fill="#3a5a96" {...line} />
      <path d="M18 22 q8 10 16 0 M46 22 q8 10 16 0" fill="none" stroke="#e2b33c" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M17 28 L14 110 M63 28 L66 110" stroke="#e2b33c" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  ),
  shorts: (
    <svg viewBox="0 0 80 70">
      <path d="M12 6 H68 L73 62 H47 L40 32 L33 62 H7 Z" fill="#6fbf5a" {...line} />
      <path d="M12 6 H68 V15 H12 Z" fill="#4f8a46" {...line} />
      <path d="M36 15 v10 M44 15 v10" stroke={INK} strokeWidth="2" />
    </svg>
  ),
  hat: (
    <svg viewBox="0 0 100 60">
      <path d="M26 36 Q28 8 50 8 Q72 8 74 36 Z" fill="#e6d98a" {...line} />
      <path d="M8 40 Q50 26 92 40 Q88 52 50 50 Q12 52 8 40 Z" fill="#e6d98a" {...line} />
      <path d="M27 30 Q50 24 73 30 L74 36 Q50 30 26 36 Z" fill="#7a4424" {...line} />
    </svg>
  ),
  shoes: (
    <svg viewBox="0 0 240 44">
      {[
        { x: 0, c: '#e6d98a' },
        { x: 62, c: '#4f8a46' },
        { x: 124, c: '#e0b090' },
        { x: 186, c: '#8fa6e6' },
      ].map(({ x, c }) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <path d="M4 32 Q4 18 16 16 L26 14 Q32 24 46 26 Q52 28 52 34 V38 H4 Z" fill={c} {...line} />
          <path d="M4 38 H52" stroke={INK} strokeWidth="5" />
          <path d="M18 22 l6 -2 M22 26 l6 -2" stroke={INK} strokeWidth="2" />
        </g>
      ))}
    </svg>
  ),
};

export function ClothesArt({ art }: { art: WardrobeArt }) {
  return <span className={`wd-art wd-${art}`}>{ART[art]}</span>;
}

// The digital photo frame on the shelf, showing a little cartoon outfit.
export function FitsFrame() {
  return (
    <svg viewBox="0 0 90 100" aria-hidden="true">
      <rect x="3" y="3" width="84" height="86" rx="6" fill="#3e3e44" {...line} />
      <rect x="11" y="11" width="68" height="66" fill="#cfe3f5" stroke={INK} strokeWidth="2" />
      <circle cx="45" cy="26" r="7" fill="#e0a878" stroke={INK} strokeWidth="2" />
      <path d="M33 37 q12 -5 24 0 l4 22 h-32 z" fill="#b8322a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M36 59 h18 l2 18 h-8 l-3 -12 l-3 12 h-8 z" fill="#24407e" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="45" cy="83" r="2.5" fill="#4fdc6a" />
      <path d="M30 89 L24 98 M60 89 L66 98" {...line} />
    </svg>
  );
}

// The little "Wants" notebook.
export function WantsBook() {
  return (
    <svg viewBox="0 0 54 72" aria-hidden="true">
      <rect x="4" y="3" width="46" height="66" rx="3" fill="#b8322a" {...line} />
      <path d="M12 3 V69" stroke={INK} strokeWidth="2" />
      <rect x="18" y="16" width="26" height="14" fill="#fffbe8" stroke={INK} strokeWidth="2" />
      <path d="M38 3 v20 l4 -4 l4 4 v-20" fill="#e2b33c" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
