import type { Rng } from "./types.js";

/** Random integer in [min, max] inclusive. */
export function randInt(rand: Rng, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

/** Random float in [min, max). */
export function randRange(rand: Rng, min: number, max: number): number {
  return min + rand() * (max - min);
}

/** Base stroke width for a single point, tuned for the default 100px size. */
export function strokeWidth(rand: Rng): number {
  return 1.5 + rand() * 2.5;
}
