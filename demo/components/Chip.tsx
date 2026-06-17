import { ScribbleAvatar } from "kritzelei";
import type { AnimateConfig } from "kritzelei";

interface ChipProps {
  /** The seed string. Same seed, same mark. */
  seed: string;
  /** Wrapper class that sizes the chip (CSS scales the inner svg to fill). */
  className?: string;
  /** Internal render size used for path detail; CSS controls display size. */
  size?: number;
  /** Accessible label; omit to mark the mark decorative. */
  title?: string;
  animate?: AnimateConfig;
}

/**
 * A round container holding a real `ScribbleAvatar`. The avatar renders at a
 * fixed `size`, but `.chip svg { width:100%; height:100% }` scales it to fill
 * whatever the wrapper class dictates — so the same component works for the
 * 26px logo and the 240px playground mark alike.
 */
export function Chip({
  seed,
  className = "chip",
  size = 120,
  title,
  animate,
}: ChipProps) {
  return (
    <span className={className}>
      <ScribbleAvatar id={seed} size={size} title={title} animate={animate} />
    </span>
  );
}
