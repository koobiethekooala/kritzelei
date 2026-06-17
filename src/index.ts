// React entry point (the primary API).
export { ScribbleAvatar, useScribble } from "./react/index.js";
export type { ScribbleAvatarProps } from "./react/index.js";

// Framework-agnostic core, re-exported for convenience.
export {
  generateScribble,
  scribbleToSVG,
  buildPalette,
  hueLightBoost,
  stableHash,
  seededRandom,
  ARCHETYPES,
  ARCHETYPE_NAMES,
  cardinalSpline,
  normalizePoints,
  DEFAULT_SIZE,
} from "./core/index.js";

export type {
  ScribblyOptions,
  ScribbleModel,
  ScribblePath,
  Archetype,
  ArchetypeName,
  PaletteConfig,
  ResolvedColors,
  ToneFamily,
  AnimateConfig,
  Point,
  Rng,
} from "./core/index.js";
