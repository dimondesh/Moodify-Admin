import { cn } from "@/lib/utils";

const DEFAULT_SIZE = 16;
const DEFAULT_STROKE = 2;

function circularMetrics(size: number, stroke: number) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return { r, c, cx: size / 2, cy: size / 2 };
}

type RingProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

/** Determinate progress ring. */
export function CircularProgress({
  percent,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
  className,
}: RingProps & { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const { r, c, cx, cy } = circularMetrics(size, strokeWidth);
  const offset = c - (clamped / 100) * c;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("-rotate-90 text-amber-400", className)}
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-amber-500/20"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  );
}

/** Indeterminate spinner — same ring style as CircularProgress. */
export function CircularSpinner({
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
  className,
}: RingProps) {
  const { r, c, cx, cy } = circularMetrics(size, strokeWidth);
  const arc = c * 0.25;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("animate-spin text-amber-400", className)}
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-amber-500/20"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${arc} ${c - arc}`}
      />
    </svg>
  );
}
