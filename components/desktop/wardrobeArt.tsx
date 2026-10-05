import type { WardrobeArt } from '@/content';

// Cartoon clothes for the wardrobe: flat retro colours, thick dark outlines (like the bookcase).
const INK = '#1a100a';
const line = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const thin = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export function Hanger() {
  return (
    <svg viewBox="0 0 100 34" className="hanger" aria-hidden="true">
      <path d="M50 2 q7 0 7 7 q0 6 -7 8 v3 L8 32 h84 L50 20" fill="none" {...line} />
    </svg>
  );
}

// A shoe pair: two of the same shoe, the back one slightly behind.
function Pair({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 110 52">
      <g transform="translate(34 0)" opacity="0.92">
        {children}
      </g>
      <g transform="translate(0 6)">{children}</g>
    </svg>
  );
}

const ART: Record<WardrobeArt, React.ReactNode> = {
  cap: (
    <svg viewBox="0 0 110 60">
      <path d="M20 44 Q18 10 52 8 Q82 8 84 40 Z" fill="#24407e" {...line} />
      <path d="M52 8 Q50 26 50 42 M36 12 Q30 26 32 42 M68 11 Q72 26 70 41" fill="none" {...thin} />
      <path d="M78 38 Q100 38 106 48 Q90 52 70 46 Z" fill="#1d3466" {...line} />
      <path d="M16 44 H86" {...line} />
      <circle cx="52" cy="8" r="4" fill="#24407e" {...thin} />
      <rect x="40" y="22" width="20" height="12" rx="2" fill="#e2b33c" {...thin} />
    </svg>
  ),
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
  jersey: (
    <svg viewBox="0 0 100 100">
      <path d="M32 13 L44 9 L50 16 L56 9 L68 13 L90 28 L82 44 L72 38 L72 94 L28 94 L28 38 L18 44 L10 28 Z" fill="#f2f2ec" {...line} />
      <path d="M28 46 H72 V58 H28 Z" fill="#e8574a" stroke="none" />
      <path d="M28 62 H72 V68 H28 Z" fill="#24407e" stroke="none" />
      <path d="M50 16 V94" stroke={INK} strokeWidth="2" strokeDasharray="4 3" />
      <path d="M32 13 L44 9 L50 16 L56 9 L68 13 L90 28 L82 44 L72 38 L72 94 L28 94 L28 38 L18 44 L10 28 Z" fill="none" {...line} />
      <rect x="56" y="74" width="12" height="10" fill="#e2b33c" {...thin} />
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
  sneakers: (
    <Pair>
      <path d="M4 36 Q4 22 14 20 L26 17 Q34 27 52 29 Q66 31 68 38 V42 H4 Z" fill="#f2f2ec" {...line} />
      <path d="M2 42 H70 V46 H2 Z" fill="#e8e0c8" {...thin} />
      <path d="M22 32 Q36 36 50 30" fill="none" stroke="#b8322a" strokeWidth="4" strokeLinecap="round" />
      <path d="M20 24 l6 -2 M24 28 l6 -2" {...thin} />
    </Pair>
  ),
  loafers: (
    <Pair>
      <path d="M4 40 Q4 30 14 28 Q40 22 58 30 Q68 34 68 40 V44 H4 Z" fill="#7a4424" {...line} />
      <path d="M2 44 H70 V47 H2 Z" fill="#3a2414" {...thin} />
      <path d="M30 27 Q44 24 56 30 L54 34 Q42 30 32 32 Z" fill="#5a3218" {...thin} />
      <rect x="40" y="28" width="7" height="3" fill="#e2b33c" stroke={INK} strokeWidth="1" />
    </Pair>
  ),
  running: (
    <Pair>
      <path d="M4 34 Q4 20 14 18 L26 15 Q34 25 50 27 Q66 29 68 36 V40 H4 Z" fill="#e9631a" {...line} />
      <path d="M2 40 H70 Q70 47 64 47 H6 Q2 47 2 40 Z" fill="#f2f2ec" {...thin} />
      <path d="M14 44 H60" stroke="#8fa6e6" strokeWidth="3" />
      <path d="M18 24 L40 34 M26 21 L46 31" stroke="#24407e" strokeWidth="3" strokeLinecap="round" />
    </Pair>
  ),
  boots: (
    <Pair>
      <path d="M8 44 V10 Q8 4 14 4 H34 Q38 4 38 10 V24 Q54 26 64 32 Q68 36 68 42 V44 Z" fill="#d9a54a" {...line} />
      <path d="M6 44 H70 V49 H6 Z" fill="#3a2414" {...thin} />
      <path d="M8 6 Q22 0 38 6" fill="none" stroke="#3a2414" strokeWidth="5" strokeLinecap="round" />
      <path d="M38 12 l-8 4 M38 18 l-8 4 M38 24 l-8 4" {...thin} />
      <path d="M40 30 Q54 30 64 36" fill="none" {...thin} />
    </Pair>
  ),
};

export function ClothesArt({ art }: { art: WardrobeArt }) {
  return <span className={`wd-art wd-${art}`}>{ART[art]}</span>;
}

// A real-looking photo frame: wooden frame, white mat, a cartoon fit pic, leaning on a little easel.
export function FitsFrame() {
  return (
    <svg viewBox="0 0 84 100" aria-hidden="true">
      <path d="M58 30 L74 98" {...line} />
      <rect x="4" y="4" width="64" height="88" fill="#7a4424" {...line} />
      <rect x="10" y="10" width="52" height="76" fill="#fffbe8" stroke={INK} strokeWidth="1.5" />
      <rect x="17" y="17" width="38" height="58" fill="#cfe3f5" stroke={INK} strokeWidth="1.5" />
      <circle cx="36" cy="30" r="5.5" fill="#e0a878" stroke={INK} strokeWidth="1.5" />
      <path d="M27 39 q9 -4 18 0 l3 17 h-24 z" fill="#b8322a" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M29 56 h14 l1 16 h-6 l-2 -10 l-2 10 h-6 z" fill="#24407e" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17 70 H55 V75 H17 Z" fill="#9fc97a" stroke="none" />
    </svg>
  );
}

// The Wants book, lying flat with its spine facing out.
export function WantsBook() {
  return (
    <svg viewBox="0 0 110 30" aria-hidden="true">
      <path d="M8 6 H104 V24 H8 Z" fill="#fffbe8" {...thin} />
      <path d="M12 9 H100 M12 13 H100 M12 17 H100 M12 21 H100" stroke="#c9b98a" strokeWidth="1" />
      <rect x="3" y="3" width="100" height="24" rx="3" fill="#b8322a" {...line} />
      <path d="M10 6.5 H96 M10 23.5 H96" stroke="#e2b33c" strokeWidth="1.5" />
      <text x="53" y="20" textAnchor="middle" fontFamily="Tahoma, Verdana, sans-serif" fontWeight="700" fontSize="12" letterSpacing="2" fill="#fff4e0">
        WANTS
      </text>
    </svg>
  );
}
