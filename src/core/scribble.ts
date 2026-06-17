import type {
  ArchetypeName,
  ScribbleModel,
  ScribblyOptions,
} from "./types.js";
import { stableHash, seededRandom } from "./hash.js";
import { buildPalette } from "./color.js";
import { ARCHETYPES, ARCHETYPE_NAMES } from "./archetypes.js";
import { cardinalSpline, normalizePoints } from "./spline.js";

/** Default output size in px. */
export const DEFAULT_SIZE = 100;

/** Fraction of the viewBox kept as padding around the mark. */
const PADDING_RATIO = 0.1;

/** The scribble is drawn within this fraction of the radius. */
const SAFE_RADIUS_RATIO = 0.9;

/**
 * Generates a deterministic scribble for the given id. Same id + options always
 * produce the same `ScribbleModel`. This is the pure, framework-agnostic heart
 * of the library — no DOM, no React.
 */
export function generateScribble(options: ScribblyOptions): ScribbleModel {
  const {
    id,
    size = DEFAULT_SIZE,
    background = true,
    crayon = true,
    fill,
    strokeWidth,
    archetypes,
    archetypeParams,
    palette,
  } = options;

  const hash = stableHash(id);
  const rand = seededRandom(hash);

  // Resolve colors from the (possibly customized) palette.
  const colors = buildPalette(palette)(hash);

  // Pick a gesture from the allowed set, seeded by the hash.
  const allowed: ArchetypeName[] =
    archetypes && archetypes.length > 0 ? archetypes : ARCHETYPE_NAMES;
  const archetypeName = allowed[hash % allowed.length];
  const archetype = ARCHETYPES[archetypeName];
  const params = { ...archetype.params, ...archetypeParams?.[archetypeName] };

  // Geometry: a circle of diameter `size` inside a slightly padded viewBox.
  const totalSize = size + size * PADDING_RATIO * 2;
  const viewBox = `${-totalSize / 2} ${-totalSize / 2} ${totalSize} ${totalSize}`;
  const safeRadius = (size / 2) * SAFE_RADIUS_RATIO;

  // Build the mark: raw points -> normalized -> spline segments.
  const rawPoints = archetype.generate(rand, safeRadius, params);
  const targetFill = fill ?? 0.62 + rand() * 0.06;
  const points = normalizePoints(rawPoints, safeRadius, targetFill);
  const strokeScale = (size / DEFAULT_SIZE) * (strokeWidth ?? 1);
  const paths = cardinalSpline(points, archetype.tension, archetype.closed).map(
    (p) => ({ ...p, width: p.width * strokeScale }),
  );

  return {
    size,
    viewBox,
    stroke: colors.stroke,
    background: background ? colors.background : undefined,
    archetype: archetypeName,
    crayon,
    paths,
  };
}
