// Points along a gentle arc, like the option rails in the reference designs.
// "left" bulges outward to the left "(", "right" bulges to the right ")".

export type ArcSpec = { top: number; bottom: number; midX: number; side: "left" | "right"; radius?: number };

function xAt(y: number, { top, bottom, midX, side, radius = 700 }: ArcSpec) {
  const dy = y - (top + bottom) / 2;
  const offset = radius - Math.sqrt(Math.max(0, radius * radius - dy * dy));
  return side === "left" ? midX + offset : midX - offset;
}

export function arcPoints(n: number, spec: ArcSpec) {
  return Array.from({ length: n }, (_, i) => {
    const y = spec.top + ((spec.bottom - spec.top) * i) / Math.max(1, n - 1);
    return { x: xAt(y, spec), y };
  });
}

/** SVG path for the rail, extended a little past the first and last point. */
export function arcPath(spec: ArcSpec, overshoot = 70) {
  const from = spec.top - overshoot;
  const to = spec.bottom + overshoot;
  const steps = 32;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const y = from + ((to - from) * i) / steps;
    return `${i ? "L" : "M"}${xAt(y, spec).toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

// Desktop stage composition (px). Below 1200px the layout stacks instead.
export const STAGE = { width: 1200, height: 720 };
export const CHAKRA_ARC: ArcSpec = { top: 160, bottom: 560, midX: 196, side: "left" };
export const WEEK_ARC: ArcSpec = { top: 286, bottom: 574, midX: 1020, side: "right" };
