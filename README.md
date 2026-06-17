# kritzelei

Deterministic, delightful **scribble avatars** for React. One import, zero config, infinitely customizable.

Give it a string (a user id, email, anything) and it draws a stable, hand-drawn-feeling scribble avatar. The same string always produces the same mark. Pass `animate` when you want the strokes to draw themselves on.

```tsx
import { ScribbleAvatar } from "kritzelei";

<ScribbleAvatar id="ada@example.com" />;
```

## Features

- **Deterministic** — same `id` always yields the same scribble.
- **SSR-safe** — works in Next.js server components; no hydration mismatch.
- **Zero runtime dependencies** — React is the only (peer) dependency.
- **Delightful** — optional draw-on animation via `stroke-dashoffset`, plus a chalky crayon texture.
- **Customizable** — colors, gesture archetypes, per-archetype params, background, animation.
- **Framework-agnostic core** — render to an SVG string anywhere via `scribbleToSVG`.

## Install

```bash
npm install kritzelei
```

> React 17+ is a peer dependency.

## Usage

```tsx
import { ScribbleAvatar } from "kritzelei";

function UserBadge({ email }: { email: string }) {
  return <ScribbleAvatar id={email} size={64} title={email} />;
}
```

### Props

`ScribbleAvatar` accepts every option below, plus `animate`, `className`, `style`, and `title`.

- `id` (string, required) — the seed. Same id, same avatar.
- `size` (number, default `100`) — width & height in px. Stroke weight scales proportionally with size.
- `strokeWidth` (number, default `1`) — multiplier on the auto-scaled stroke weight.
- `background` (boolean, default `true`) — show the hue-tinted background circle.
- `crayon` (boolean, default `true`) — apply the chalky texture filter.
- `fill` (number, default ~`0.65`) — optical fill as a fraction of the radius.
- `archetypes` (string[]) — restrict which gestures may be used.
- `archetypeParams` (object) — per-archetype tuning (see below).
- `palette` (object) — color customization (see below).
- `animate` (`boolean | { durationMs?: number }`, default `false`) — the draw-on animation. Pass `true` or `{ durationMs }` to enable.
- `className`, `style` — forwarded to the `<svg>`.
- `title` (string) — accessible label; when omitted the SVG is marked decorative.

Thicker or thinner strokes at any size:

```tsx
<ScribbleAvatar id="ada" size={64} />
<ScribbleAvatar id="ada" size={200} strokeWidth={1.2} />
```

## Gesture archetypes

Every avatar is one recognizable *kind* of confident scribble. The seed picks one of:

`nest` · `spiral` · `core` · `starburst` · `petal-bloom` · `ziggy` · `haystack`

Restrict the set:

```tsx
<ScribbleAvatar id="ada" archetypes={["nest", "spiral", "petal-bloom"]} />
```

Tune a gesture without forking it — overrides are shallow-merged over the defaults:

```tsx
<ScribbleAvatar
  id="ada"
  archetypes={["ziggy"]}
  archetypeParams={{ ziggy: { minSeg: 6, maxSeg: 8, drift: 0.06 } }}
/>
```

## Colors

By default kritzelei builds a color *system*: a saturated stroke and a pale tint of the
**same hue** for the background, so contrast is guaranteed and the two feel related.
The hash also picks a tone family — vivid, pastel, or neon.

Restrict the auto system:

```tsx
// only soft pastels, only in the blue–purple range
<ScribbleAvatar id="ada" palette={{ families: ["pastel"], hueRange: [200, 290] }} />
```

Use fixed colors:

```tsx
<ScribbleAvatar id="ada" palette={{ stroke: ["#ff5470", "#1b9aaa"], background: "#fff" }} />
```

Take full control:

```tsx
<ScribbleAvatar
  id="ada"
  palette={{ generate: (hash) => ({ stroke: `hsl(${hash % 360} 80% 50%)` }) }}
/>
```

Turn the background off entirely:

```tsx
<ScribbleAvatar id="ada" background={false} />
```

## Without React

The core is pure and framework-agnostic. Generate a model or an SVG string:

```ts
import { generateScribble, scribbleToSVG } from "kritzelei/core";

const model = generateScribble({ id: "ada", size: 80 });
const svg = scribbleToSVG(model); // -> "<svg ...>...</svg>"
```

## Development

```bash
npm install
npm run dev        # live demo gallery (Vite)
npm run build      # build the library (tsup -> ESM + CJS + types)
npm run typecheck
```

## How it works

1. The `id` is hashed into a stable integer that seeds a small PRNG.
2. The seed picks a gesture archetype and a color system.
3. The archetype emits raw points, which are normalized to a consistent optical
   fill and center, then smoothed with a cardinal spline.
4. Stroke weights are scaled to match `size` (with an optional `strokeWidth`
   multiplier).
5. React renders the result as an SVG. Pass `animate` to draw the strokes on.

## License

MIT
