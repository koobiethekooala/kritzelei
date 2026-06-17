import { useEffect, useId, useState } from "react";
import type { CSSProperties } from "react";
import type { AnimateConfig, ScribblyOptions } from "../core/types.js";
import { useScribble } from "./useScribble.js";

export interface ScribbleAvatarProps extends ScribblyOptions {
  /** Draw-on animation. `false` (default), `true`, or `{ durationMs }`. */
  animate?: AnimateConfig;
  className?: string;
  style?: CSSProperties;
  /** Accessible label. When omitted, the SVG is marked decorative. */
  title?: string;
}

const DEFAULT_DURATION_MS = 500;

/**
 * Renders a deterministic scribble avatar for `id`. SSR-safe: the markup is
 * produced purely during render, and the draw-on animation only kicks in after
 * mount so server and client output match.
 */
export function ScribbleAvatar({
  animate = false,
  className,
  style,
  title,
  ...options
}: ScribbleAvatarProps) {
  const model = useScribble(options);

  // Unique, stable id so multiple avatars don't share one filter definition.
  const filterId = `kritzelei-${useId().replace(/:/g, "")}`;

  const animateEnabled = animate !== false;
  const durationMs =
    typeof animate === "object" && animate.durationMs != null
      ? animate.durationMs
      : DEFAULT_DURATION_MS;

  // Start undrawn, then flip after mount (client-only) to trigger the CSS
  // transition. Initial state is identical on server and client → no mismatch.
  const [drawn, setDrawn] = useState(!animateEnabled);
  useEffect(() => {
    if (!animateEnabled) return;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setDrawn(true)),
    );
    return () => cancelAnimationFrame(raf);
  }, [animateEnabled, model]);

  const totalSeconds = durationMs / 1000;
  const segSeconds = totalSeconds / Math.max(model.paths.length, 1);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={model.size}
      height={model.size}
      viewBox={model.viewBox}
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}

      {model.crayon ? (
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves={1}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="7"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      ) : null}

      {model.background ? (
        <circle cx={0} cy={0} r={model.size / 2} fill={model.background} />
      ) : null}

      {model.paths.map((p, i) => {
        const delay =
          model.paths.length > 1
            ? (i / model.paths.length) * totalSeconds
            : 0;
        return (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={model.stroke}
            strokeWidth={p.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={model.crayon ? `url(#${filterId})` : undefined}
            pathLength={animateEnabled ? 1 : undefined}
            style={
              animateEnabled
                ? {
                    strokeDasharray: 1,
                    strokeDashoffset: drawn ? 0 : 1,
                    transition: `stroke-dashoffset ${segSeconds}s linear ${delay}s`,
                  }
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}
