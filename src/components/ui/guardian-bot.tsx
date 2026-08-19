"use client";

/**
 * Guardian, as a character.
 *
 * The product's whole personality is "careful, and honest when it isn't sure",
 * so the bot expresses state rather than decorating: it blinks while idle,
 * scans while retrieving, widens its eyes on a contradiction, and settles when
 * a question is answered cleanly. Someone watching the screen can read what the
 * system is doing without reading a word.
 *
 * Hand-drawn SVG rather than a Lottie file: no dependency, no network fetch,
 * scales cleanly on a projector, and the eyes can be driven straight from state.
 */

export type BotMood = "idle" | "thinking" | "alert" | "resolved";

const EYE = {
  idle: { rx: 2.4, ry: 3.2, cy: 0 },
  thinking: { rx: 2.2, ry: 2.8, cy: 0 },
  alert: { rx: 3.1, ry: 3.6, cy: -0.4 },
  resolved: { rx: 2.6, ry: 1.2, cy: -1 },
};

const FACE: Record<BotMood, string> = {
  idle: "var(--color-nx-accent)",
  thinking: "var(--color-nx-accent)",
  alert: "var(--color-nx-danger)",
  resolved: "var(--color-nx-success)",
};

export default function GuardianBot({
  mood = "idle",
  size = 40,
  className = "",
}: {
  mood?: BotMood;
  size?: number;
  className?: string;
}) {
  const eye = EYE[mood];
  const colour = FACE[mood];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label={`Guardian is ${mood}`}
      className={`gb gb-${mood} ${className}`}
    >
      {/* Antenna — pulses while it is working */}
      <line x1="24" y1="9" x2="24" y2="4" stroke={colour} strokeWidth="1.8" strokeLinecap="round" />
      <circle className="gb-tip" cx="24" cy="3" r="2.4" fill={colour} />

      {/* Head */}
      <rect x="8" y="9" width="32" height="26" rx="9" fill={colour} />

      {/* Visor */}
      <rect x="12" y="14" width="24" height="15" rx="7" fill="#FFFFFF" opacity="0.16" />

      {/* Eyes — the whole expression lives here */}
      <g className="gb-eyes" fill="#FFFFFF">
        <ellipse cx="18.5" cy={22 + eye.cy} rx={eye.rx} ry={eye.ry} />
        <ellipse cx="29.5" cy={22 + eye.cy} rx={eye.rx} ry={eye.ry} />
      </g>

      {/* Mouth: a flat line normally, a small smile once settled */}
      {mood === "resolved" ? (
        <path d="M20 28.5 Q24 31.5 28 28.5" stroke="#FFFFFF" strokeWidth="1.6"
              strokeLinecap="round" fill="none" opacity="0.85" />
      ) : (
        <rect x="21" y="28" width="6" height="1.6" rx="0.8" fill="#FFFFFF" opacity="0.55" />
      )}

      {/* Ears */}
      <rect x="4.5" y="18" width="3" height="8" rx="1.5" fill={colour} opacity="0.75" />
      <rect x="40.5" y="18" width="3" height="8" rx="1.5" fill={colour} opacity="0.75" />

      {/* Shoulders, so it reads as a body rather than a floating head */}
      <path d="M14 37 Q24 34 34 37 L34 40 Q24 38 14 40 Z" fill={colour} opacity="0.55" />
    </svg>
  );
}
