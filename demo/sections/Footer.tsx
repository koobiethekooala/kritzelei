import { Chip } from "../components/Chip.js";

const REPO = "https://github.com/koobiethekooala/kritzelei";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-row">
          <div className="foot-meta">
            v0.1.0 · MIT license ·{" "}
            <a href={REPO} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
          <span className="foot-by">
            Made by{" "}
            <span className="foot-by-mark">
              <Chip
                seed="alex@koo.dev"
                className="foot-avatar"
                size={48}
                title="Alexandre Koo"
                animate={false}
              />
              Alexandre Koo
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
