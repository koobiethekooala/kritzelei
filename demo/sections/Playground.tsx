import { useMemo, useState } from "react";
import { generateScribble, stableHash } from "kritzelei";
import { Chip } from "../components/Chip.js";

/** Compact stroke label — rounded HSL, ellipsis via CSS if still too long. */
function formatStrokeLabel(color: string): string {
  const m = color.match(
    /^hsla?\(\s*([\d.]+)\s*,?\s*([\d.]+)%\s*,?\s*([\d.]+)%/i,
  );
  if (m) {
    return `hsl(${Math.round(Number(m[1]))}, ${Math.round(Number(m[2]))}%, ${Math.round(Number(m[3]))}%)`;
  }
  return color;
}

export function Playground() {
  const [seed, setSeed] = useState("grace.hopper@navy.mil");

  const info = useMemo(() => {
    const value = seed || " ";
    const model = generateScribble({ id: value });
    const hash = stableHash(value) >>> 0;
    return {
      archetype: model.archetype,
      stroke: model.stroke,
      hash: "0x" + hash.toString(16).padStart(8, "0").slice(0, 6),
    };
  }, [seed]);

  return (
    <section id="play">
      <div className="wrap">
        <div className="play">
          <div className="play-mark">
            {/* re-key on seed so the draw-on animation replays on every change */}
            <Chip
              key={seed}
              seed={seed || " "}
              size={240}
              animate={{ durationMs: 700 }}
            />
          </div>
          <div className="play-fields">
            <label htmlFor="seedInput">
              Try it with an email, a name, an ID
            </label>
            <input
              id="seedInput"
              value={seed}
              spellCheck={false}
              autoComplete="off"
              onChange={(e) => setSeed(e.target.value)}
            />
            <div className="readout">
              <div>
                <span>Archetype</span>
                <b>{info.archetype}</b>
              </div>
              <div className="readout-stroke">
                <span>Stroke</span>
                <b title={info.stroke}>
                  <i
                    className="swatch"
                    style={{ background: info.stroke }}
                    aria-hidden="true"
                  />
                  {formatStrokeLabel(info.stroke)}
                </b>
              </div>
              <div>
                <span>Hash</span>
                <b>{info.hash}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
