import type { Point, ScribblePath } from "./types.js";

/**
 * Re-centers and re-scales a raw point cloud so it sits at the optical center
 * of the circle and fills it to a consistent fraction. This is the single most
 * important quality lever: it makes every output feel like part of one family
 * rather than a random sampler.
 *
 * @param points - Raw points from an archetype.
 * @param targetRadius - The circle radius to fill within.
 * @param targetFill - Fraction of the radius to fill (0..1).
 */
export function normalizePoints(
  points: Point[],
  targetRadius: number,
  targetFill: number,
): Point[] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const extent = Math.max(maxX - minX, maxY - minY) || 1;
  const scale = (targetFill * 2 * targetRadius) / extent;

  return points.map((p) => ({
    x: (p.x - cx) * scale,
    y: (p.y - cy) * scale,
    width: p.width,
  }));
}

/**
 * Builds smooth cardinal-spline segments through a set of points, in SVG path
 * syntax. Returns one `ScribblePath` per cubic Bézier segment, each carrying
 * its own stroke width so the mark can taper.
 *
 * @param points - Points to interpolate.
 * @param tension - Cardinal-spline tension (higher = curvier).
 * @param closed - Whether to wrap the path back to its start.
 */
export function cardinalSpline(
  points: Point[],
  tension: number,
  closed: boolean,
): ScribblePath[] {
  if (!points || points.length < 2) return [];

  if (points.length === 2) {
    const [a, b] = points;
    return [
      { d: `M ${a.x},${a.y} L ${b.x},${b.y}`, width: (a.width + b.width) / 2 },
    ];
  }

  const pts = points.map((p) => ({ ...p }));
  if (closed) {
    pts.push({ ...points[0] });
    pts.unshift({ ...points[points.length - 1] });
  }

  const at = (i: number): Point => pts[Math.max(0, Math.min(i, pts.length - 1))];

  const segments: ScribblePath[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    const c1x = p1.x + ((p2.x - p0.x) * tension) / 6;
    const c1y = p1.y + ((p2.y - p0.y) * tension) / 6;
    const c2x = p2.x - ((p3.x - p1.x) * tension) / 6;
    const c2y = p2.y - ((p3.y - p1.y) * tension) / 6;

    segments.push({
      d: `M ${p1.x},${p1.y} C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`,
      width: (p1.width + p2.width) / 2,
    });
  }

  return segments;
}
