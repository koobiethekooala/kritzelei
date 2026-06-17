import { Chip } from "../components/Chip.js";

const REPO = "https://github.com/koobiethekooala/kritzelei";

type RunEntry = [label: string, value: string];

const RUN_ITEMS: RunEntry[] = [
  ["email", "ada@lovelace.com"],
  ["username", "@norbert"],
  ["commit", "e3f9a2c"],
  ["api key", "sk_live_4f8e"],
  ["user ID", "usr_8K2p9"],
  ["workspace", "design-retros"],
  ["branch", "feat/scribbles"],
  ["wallet", "0x7a3F…b21"],
  ["ticket", "TKT-4821"],
  ["session", "sess_91xQ"],
  ["channel", "#design-eng"],
  ["project", "moonshot"],
];

const RUN_ROWS: RunEntry[][] = [
  RUN_ITEMS.slice(0, 3),
  RUN_ITEMS.slice(3, 6),
  RUN_ITEMS.slice(6, 9),
  RUN_ITEMS.slice(9),
];

function RunItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="run-item">
      <Chip seed={value} className="run-chip" size={176} />
      <span className="run-text">
        <span className="run-tag">{label}</span>
        <span className="run-value">{value}</span>
      </span>
    </span>
  );
}

function RunLine({
  items,
  reverse = false,
}: {
  items: RunEntry[];
  reverse?: boolean;
}) {
  const renderSegment = (id: string, hidden = false) => (
    <div className="run-segment" key={id} aria-hidden={hidden || undefined}>
      {items.map(([label, value]) => (
        <RunItem key={`${id}-${value}`} label={label} value={value} />
      ))}
    </div>
  );

  return (
    <div className={`run-line${reverse ? " run-line--reverse" : ""}`}>
      <div className="run-track">
        {renderSegment("a")}
        {renderSegment("b", true)}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <header className="heromast">
          <div className="ident">
            <span className="identtext">
              <b>Scribbles for everything.</b>
              <span className="ident-desc">
                kritzelei generates deterministic scribbles from any string
                identifier. Customizable, lightweight, works with any codebase.
              </span>
              <a
                className="ident-cmd"
                href={REPO}
                target="_blank"
                rel="noreferrer"
              >
                GitHub →
              </a>
            </span>
          </div>
        </header>

        <div className="run-wrap">
          <div className="run-lines">
            {RUN_ROWS.map((row, i) => (
              <RunLine key={i} items={row} reverse={i % 2 === 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
