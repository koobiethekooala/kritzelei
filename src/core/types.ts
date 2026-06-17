/**
 * A single raw point produced by an archetype, before normalization and
 * splining. `width` is the local stroke weight at that point.
 */
export interface Point {
  x: number;
  y: number;
  width: number;
}

/** Seeded pseudo-random generator: returns a float in [0, 1). */
export type Rng = () => number;

/** The built-in gesture vocabulary. */
export type ArchetypeName =
  | "nest"
  | "spiral"
  | "core"
  | "starburst"
  | "petal-bloom"
  | "ziggy"
  | "haystack";

/**
 * A self-contained gesture descriptor. `generate` returns raw points centered
 * loosely around the origin; size and centering are handled later by the shared
 * normalize step, so a gesture only cares about its *character*.
 */
export interface Archetype {
  name: ArchetypeName;
  /** Cardinal-spline tension. High = curvy, low = sharp corners. */
  tension: number;
  /** Whether the spline wraps back to its start. */
  closed: boolean;
  /** Named, tunable constants — the only place to retune a gesture. */
  params: Record<string, number>;
  /** Produces raw points using the (possibly overridden) `params`. */
  generate(rand: Rng, radius: number, params: Record<string, number>): Point[];
}

/** Color tone families used by the default palette. */
export type ToneFamily = "vivid" | "pastel" | "neon";

/** Resolved stroke + (optional) background for one avatar. */
export interface ResolvedColors {
  stroke: string;
  /** Omitted/undefined means "no background fill". */
  background?: string;
}

/**
 * Color customization. Pick exactly one shape:
 * - `{ families, hueRange }` restricts the built-in vivid/pastel/neon system.
 * - `{ stroke, background }` uses fixed colors (stroke may be a list to pick from).
 * - `{ generate }` takes full control given the seed hash.
 */
export type PaletteConfig =
  | { families?: ToneFamily[]; hueRange?: [number, number] }
  | { stroke: string | string[]; background?: string | false }
  | { generate: (hash: number) => ResolvedColors };

/** Draw-on animation config. */
export type AnimateConfig = boolean | { durationMs?: number };

/**
 * Everything needed to generate a scribble. Only `id` is required — it seeds
 * the deterministic output, so the same id always yields the same avatar.
 */
export interface ScribblyOptions {
  /** Seed for deterministic output (e.g. a user id or email). */
  id: string;
  /** Output width & height in px. Default 100. */
  size?: number;
  /** Show the hue-tinted background circle. Default true. */
  background?: boolean;
  /** Apply the chalky "crayon" texture filter. Default true. */
  crayon?: boolean;
  /** Optical fill as a fraction of the radius (0..1). Default ~0.65. */
  fill?: number;
  /** Multiplier on the auto-scaled stroke weight. Default 1. */
  strokeWidth?: number;
  /** Restrict which gestures may be picked. Default: all of them. */
  archetypes?: ArchetypeName[];
  /** Per-archetype param overrides, shallow-merged over the defaults. */
  archetypeParams?: Partial<Record<ArchetypeName, Record<string, number>>>;
  /** Color customization. Default: the built-in tone-family system. */
  palette?: PaletteConfig;
}

/** One renderable stroke segment. */
export interface ScribblePath {
  /** SVG path `d` attribute. */
  d: string;
  /** Stroke width for this segment. */
  width: number;
}

/**
 * A fully resolved, serializable description of a scribble. This is what the
 * pure core produces; renderers (React, SVG string, etc.) consume it.
 */
export interface ScribbleModel {
  size: number;
  viewBox: string;
  /** Stroke color of the mark. */
  stroke: string;
  /** Background fill, or undefined when disabled. */
  background?: string;
  /** Which gesture was used (handy for debugging / labelling). */
  archetype: ArchetypeName;
  /** Whether the crayon texture should be applied when rendering. */
  crayon: boolean;
  /** The stroke segments that make up the mark. */
  paths: ScribblePath[];
}
