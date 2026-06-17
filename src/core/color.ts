import type { PaletteConfig, ResolvedColors, ToneFamily } from "./types.js";

/**
 * How perceptually *light* a fully saturated hue is. Yellow, cyan and lime are
 * naturally bright; at mid lightness they read muddy (mustard, teal, olive), so
 * this is used to nudge them lighter. Returns 0..1, peaking on the bright hues.
 */
export function hueLightBoost(hue: number): number {
  const bumps = [
    { center: 56, weight: 1.0, spread: 26 }, // yellow (brightest)
    { center: 185, weight: 0.7, spread: 38 }, // cyan / aqua
    { center: 95, weight: 0.55, spread: 38 }, // lime / spring green
  ];
  let boost = 0;
  for (const b of bumps) {
    let d = Math.abs(hue - b.center);
    d = Math.min(d, 360 - d); // shortest distance around the wheel
    boost = Math.max(boost, b.weight * Math.max(0, 1 - d / b.spread));
  }
  return boost;
}

/**
 * The built-in color system: a saturated stroke and a pale tint of the *same*
 * hue for the background, so figure/ground contrast is guaranteed and the two
 * elements feel related. The hash also picks a tone family so the set spans
 * vivid crayon colors, soft pastels and electric neons.
 *
 * Greys, browns and blacks never occur because saturation stays high and
 * lightness never bottoms out.
 */
function autoColors(
  hash: number,
  families: ToneFamily[] | undefined,
  hueRange: [number, number] | undefined,
): ResolvedColors {
  let hue = Math.abs(hash) % 360;
  if (hueRange) {
    const [lo, hi] = hueRange;
    hue = lo + ((Math.abs(hash) % 360) / 360) * (hi - lo);
    hue = ((hue % 360) + 360) % 360;
  }

  // Choose a tone family. With no restriction, weight ~50% vivid / 30% pastel /
  // 20% neon; with a restriction, pick uniformly from the allowed families.
  let family: ToneFamily;
  if (families && families.length > 0) {
    family = families[Math.abs(hash >> 24) % families.length];
  } else {
    const pick = Math.abs(hash >> 24) % 10;
    family = pick < 5 ? "vivid" : pick < 8 ? "pastel" : "neon";
  }

  let sat: number;
  let light: number;
  if (family === "pastel") {
    sat = 62 + Math.abs((hash >> 8) % 24); // 62..85
    light = 78 + Math.abs((hash >> 12) % 7); // 78..84
  } else if (family === "neon") {
    sat = 95 + Math.abs((hash >> 8) % 6); // 95..100
    light = 58 + Math.abs((hash >> 12) % 8); // 58..65
  } else {
    sat = 70 + Math.abs((hash >> 8) % 18); // 70..87
    light = 46 + Math.abs((hash >> 12) % 10); // 46..55
  }

  // Brighten perceptually-light hues so they pop instead of looking muddy.
  const boost = hueLightBoost(hue);
  sat = Math.min(100, sat + boost * 8);
  const maxLight = family === "pastel" ? 87 : 70;
  light = Math.min(maxLight, light + boost * (family === "pastel" ? 5 : 12));

  // Background: a pale wash of the same hue, always clearly lighter than the
  // mark so contrast holds even for light pastel strokes.
  const bgSat = (family === "pastel" ? 48 : 58) + Math.abs((hash >> 16) % 10);
  const bgLight = Math.min(97, Math.max(light + 10, 93));

  return {
    stroke: `hsl(${hue}, ${sat}%, ${light}%)`,
    background: `hsl(${hue}, ${bgSat}%, ${bgLight}%)`,
  };
}

/**
 * Resolves a `PaletteConfig` into a deterministic `(hash) => colors` function.
 * Defaults to the built-in tone-family system when no config is given.
 */
export function buildPalette(
  config?: PaletteConfig,
): (hash: number) => ResolvedColors {
  if (config && "generate" in config) {
    return config.generate;
  }

  if (config && "stroke" in config) {
    const strokes = Array.isArray(config.stroke) ? config.stroke : [config.stroke];
    const background =
      config.background === false ? undefined : config.background;
    return (hash: number) => ({
      stroke: strokes[Math.abs(hash) % strokes.length],
      background,
    });
  }

  const families = config?.families;
  const hueRange = config?.hueRange;
  return (hash: number) => autoColors(hash, families, hueRange);
}
