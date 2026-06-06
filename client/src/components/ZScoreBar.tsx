/*
 * Design: "Editorial Clinical" — a small bell-curve glyph that marks where
 * the measured z-score falls. Hairline stroke, serif-era restraint; no fills.
 */
import { motion } from "framer-motion";

type Props = {
  z: number | null;
  band: "normal" | "note" | "watch" | "rare" | null;
  compact?: boolean;
};

const BAND_COLOR: Record<NonNullable<Props["band"]>, string> = {
  normal: "var(--state-normal)",
  note: "var(--state-note)",
  watch: "var(--state-watch)",
  rare: "var(--state-rare)",
};

// Simple bell curve path across [-3, 3]; we only use the fill to mark a tail.
export default function ZScoreBar({ z, band, compact }: Props) {
  const W = compact ? 72 : 120;
  const H = compact ? 28 : 44;
  const pad = 4;
  const innerW = W - pad * 2;
  const zClamped = z == null ? 0 : Math.max(-3.2, Math.min(3.2, z));
  const xAt = (zv: number) => pad + ((zv + 3) / 6) * innerW;

  // Generate a bell-curve polyline
  const points: string[] = [];
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const zv = -3 + (6 * i) / N;
    const y = Math.exp(-0.5 * zv * zv); // 0..1
    const sx = pad + (i / N) * innerW;
    const sy = H - pad - y * (H - pad * 2);
    points.push(`${sx.toFixed(2)},${sy.toFixed(2)}`);
  }

  const markerX = xAt(zClamped);
  const color = band ? BAND_COLOR[band] : "var(--ink-soft)";

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="shrink-0"
      aria-label={z == null ? "No value" : `z = ${z.toFixed(2)}`}
    >
      {/* baseline */}
      <line
        x1={pad}
        y1={H - pad}
        x2={W - pad}
        y2={H - pad}
        stroke="var(--rule)"
        strokeWidth={1}
      />
      {/* ±1 and ±2 tick marks */}
      {[-2, -1, 1, 2].map((t) => (
        <line
          key={t}
          x1={xAt(t)}
          y1={H - pad - 2}
          x2={xAt(t)}
          y2={H - pad + 2}
          stroke="var(--rule)"
          strokeWidth={1}
        />
      ))}
      {/* bell curve */}
      <polyline
        fill="none"
        stroke="var(--ink-soft)"
        strokeOpacity={0.55}
        strokeWidth={1}
        points={points.join(" ")}
      />
      {/* midline */}
      <line
        x1={xAt(0)}
        y1={pad}
        x2={xAt(0)}
        y2={H - pad}
        stroke="var(--rule)"
        strokeDasharray="2 3"
      />
      {/* marker */}
      {z != null && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <line
            x1={markerX}
            y1={pad}
            x2={markerX}
            y2={H - pad}
            stroke={color}
            strokeWidth={1.5}
          />
          <circle
            cx={markerX}
            cy={H - pad - Math.exp(-0.5 * zClamped * zClamped) * (H - pad * 2)}
            r={2.5}
            fill={color}
          />
        </motion.g>
      )}
    </svg>
  );
}
