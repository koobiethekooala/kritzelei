import type { ScribbleModel } from "./types.js";

let filterCounter = 0;

/** The chalky "crayon" displacement filter, as raw SVG markup. */
function crayonFilter(id: string): string {
  return (
    `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" result="noise"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="noise" scale="7" ` +
    `xChannelSelector="R" yChannelSelector="G"/>` +
    `</filter>`
  );
}

/**
 * Renders a `ScribbleModel` to a static SVG string. Framework-agnostic — useful
 * for server rendering, emails, plain HTML, or non-React frameworks.
 *
 * Note: the draw-on animation is a React-layer concern; this output is static.
 *
 * @param model - The model from `generateScribble`.
 * @param opts.filterId - Override the crayon filter id (must be unique per
 *   document if you inline several). Defaults to an auto-incrementing id.
 */
export function scribbleToSVG(
  model: ScribbleModel,
  opts: { filterId?: string } = {},
): string {
  const { size, viewBox, stroke, background, crayon, paths } = model;
  const filterId = opts.filterId ?? `kritzelei-crayon-${filterCounter++}`;
  const filterRef = crayon ? ` filter="url(#${filterId})"` : "";

  const defs = crayon ? `<defs>${crayonFilter(filterId)}</defs>` : "";
  const bg = background
    ? `<circle cx="0" cy="0" r="${size / 2}" fill="${background}"/>`
    : "";

  const marks = paths
    .map(
      (p) =>
        `<path d="${p.d}" fill="none" stroke="${stroke}" ` +
        `stroke-width="${p.width}" stroke-linecap="round" ` +
        `stroke-linejoin="round"${filterRef}/>`,
    )
    .join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="${viewBox}">${defs}${bg}${marks}</svg>`
  );
}
