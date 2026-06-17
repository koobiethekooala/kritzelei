import type { Rng } from "./types.js";

/**
 * Converts a string into a stable, non-negative 32-bit integer (a djb2-style
 * hash). The same string always maps to the same number, which is what makes
 * every scribble deterministic per id.
 */
export function stableHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // force 32-bit
  }
  return Math.abs(hash);
}

/**
 * A small, fast seedable PRNG (Lehmer / MINSTD). Given a seed it returns a
 * function producing a deterministic sequence of floats in [0, 1).
 */
export function seededRandom(seed: number): Rng {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return function () {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}
