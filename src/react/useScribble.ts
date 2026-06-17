import { useMemo } from "react";
import { generateScribble } from "../core/scribble.js";
import type { ScribbleModel, ScribblyOptions } from "../core/types.js";

/**
 * Returns a memoized `ScribbleModel` for the given options. Recomputes only when
 * the options change. For a stable memo, pass stable references for object/array
 * options (`palette`, `archetypes`, `archetypeParams`); inline literals will
 * recompute each render (cheap, but not memoized).
 */
export function useScribble(options: ScribblyOptions): ScribbleModel {
  const {
    id,
    size,
    background,
    crayon,
    fill,
    archetypes,
    archetypeParams,
    palette,
  } = options;

  return useMemo(
    () => generateScribble(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, size, background, crayon, fill, archetypes, archetypeParams, palette],
  );
}
