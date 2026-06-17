import type { Archetype, ArchetypeName, Point, Rng } from "./types.js";
import { randInt, randRange, strokeWidth } from "./rng.js";

/* ---------------------------------------------------------------------------
 * Gesture archetypes
 *
 * Each archetype is a self-contained descriptor whose `generate` returns raw
 * points centered loosely around the origin. Size and centering are handled by
 * the shared normalize step, so a gesture only cares about its *character*. To
 * retune one, edit its `params` block (or override per-instance at runtime).
 * ------------------------------------------------------------------------- */

/**
 * nest: a few overlapping, slightly offset loops — an enthusiastic,
 * tangled mass of rings.
 */
const loopNest: Archetype = {
  name: "nest",
  tension: 1.6,
  closed: true,
  params: {
    minLoops: 3,
    maxLoops: 4,
    centerSpread: 0.5, // how far loop centers wander from origin
    minLoopR: 0.42,
    maxLoopR: 0.8,
    minPts: 9,
    maxPts: 12,
    jitter: 0.3, // per-point radial wobble
  },
  generate(rand: Rng, radius: number, p: Record<string, number>): Point[] {
    const points: Point[] = [];
    const loops = randInt(rand, p.minLoops, p.maxLoops);
    for (let l = 0; l < loops; l++) {
      const cx = (rand() - 0.5) * radius * p.centerSpread;
      const cy = (rand() - 0.5) * radius * p.centerSpread;
      const lr = radius * randRange(rand, p.minLoopR, p.maxLoopR);
      const ptsPerLoop = randInt(rand, p.minPts, p.maxPts);
      const startA = rand() * Math.PI * 2;
      const dir = rand() < 0.5 ? 1 : -1;
      for (let i = 0; i < ptsPerLoop; i++) {
        const a = startA + dir * (i / ptsPerLoop) * Math.PI * 2;
        const jitter = 1 + (rand() - 0.5) * p.jitter;
        points.push({
          x: cx + Math.cos(a) * lr * jitter,
          y: cy + Math.sin(a) * lr * jitter,
          width: strokeWidth(rand),
        });
      }
    }
    return points;
  },
};

/** spiral: a jittered archimedean spiral winding out from the center. */
const spiral: Archetype = {
  name: "spiral",
  tension: 1.6,
  closed: false,
  params: {
    minTurns: 2.5,
    maxTurns: 4.0,
    minPts: 30,
    maxPts: 39,
    innerR: 0.1, // starting radius fraction
    outerSpan: 0.9, // how much radius grows over the spiral
    jitter: 0.18,
  },
  generate(rand: Rng, radius: number, p: Record<string, number>): Point[] {
    const points: Point[] = [];
    const turns = randRange(rand, p.minTurns, p.maxTurns);
    const total = randInt(rand, p.minPts, p.maxPts);
    const startA = rand() * Math.PI * 2;
    const dir = rand() < 0.5 ? 1 : -1;
    for (let i = 0; i < total; i++) {
      const t = i / (total - 1);
      const a = startA + dir * t * turns * Math.PI * 2;
      const r = radius * (p.innerR + t * p.outerSpan);
      const jitter = 1 + (rand() - 0.5) * p.jitter;
      points.push({
        x: Math.cos(a) * r * jitter,
        y: Math.sin(a) * r * jitter,
        width: strokeWidth(rand),
      });
    }
    return points;
  },
};

/** core: the original alternating-sides dense fill. */
const scribbleFill: Archetype = {
  name: "core",
  tension: 1.6,
  closed: true,
  params: {
    minPts: 28,
    maxPts: 40,
    momentum: 0.1,
    directionBias: 1,
    maxAngleChange: Math.PI * 0.1,
    minDist: 0.35,
    distSpan: 0.4,
  },
  generate(rand: Rng, radius: number, p: Record<string, number>): Point[] {
    const steps = p.minPts + Math.floor(rand() * (p.maxPts - p.minPts));
    const points: Point[] = [];

    let leftAngle = rand() * Math.PI * 2;
    let rightAngle = (leftAngle + Math.PI + (rand() - 0.5)) % (Math.PI * 2);
    const generalDirection = rand() * Math.PI * 2;

    for (let i = 0; i < steps; i++) {
      const isLeftSide = i % 2 === 0;

      const currentAngle = isLeftSide ? leftAngle : rightAngle;
      const oppositeAngle = isLeftSide ? rightAngle : leftAngle;
      const targetAngle = oppositeAngle + Math.PI + (rand() - 0.5);
      const angleChange = (rand() - 0.5) * p.maxAngleChange;

      const newAngle =
        currentAngle * p.momentum +
        targetAngle * (1 - p.momentum) +
        generalDirection * p.directionBias +
        angleChange;

      if (isLeftSide) leftAngle = newAngle;
      else rightAngle = newAngle;

      const dist = radius * (p.minDist + rand() * p.distSpan);
      points.push({
        x: dist * Math.cos(newAngle),
        y: dist * Math.sin(newAngle),
        width: strokeWidth(rand),
      });
    }

    return points;
  },
};

/**
 * starburst: alternating inner/outer radii — a rounded, hand-drawn star. Each
 * spike has its own length and angle, the whole star is slightly off-center,
 * and the hand drifts as it travels around, so no two arms match.
 */
const starburst: Archetype = {
  name: "starburst",
  tension: 1.6,
  closed: true,
  params: {
    minSpikes: 5,
    maxSpikes: 9,
    offCenter: 0.1, // max off-center drift of the whole star
    lenDrift: 0.25, // slow growth/shrink of arms around the star
    angDrift: 0.4, // slow angular drift around the star
    angleWobble: 0.5, // per-step angular wobble (fraction of base)
    lenJitter: 0.18, // per-arm length jitter
    minOvershoot: 1,
    maxOvershoot: 2,
    tipMinR: 0.86,
    tipSpan: 0.14,
    valleyMinR: 0.34,
    valleySpan: 0.22,
  },
  generate(rand: Rng, radius: number, p: Record<string, number>): Point[] {
    const points: Point[] = [];
    const spikes = randInt(rand, p.minSpikes, p.maxSpikes);
    const startA = rand() * Math.PI * 2;

    const offCenterA = rand() * Math.PI * 2;
    const offCenterR = radius * p.offCenter * rand();
    const ox = Math.cos(offCenterA) * offCenterR;
    const oy = Math.sin(offCenterA) * offCenterR;

    const lenDrift = (rand() - 0.5) * p.lenDrift;
    const angDrift = (rand() - 0.5) * p.angDrift;

    const total = spikes * 2;
    const overshoot = randInt(rand, p.minOvershoot, p.maxOvershoot);
    const base = (2 * Math.PI) / total;

    for (let i = 0; i < total + overshoot; i++) {
      const t = i / total; // 0..>1
      const isTip = i % 2 === 0;

      const angleWobble = (rand() - 0.5) * base * p.angleWobble;
      const a = startA + i * base + angleWobble + angDrift * t;

      const lenJitter = (rand() - 0.5) * p.lenJitter;
      const r = isTip
        ? radius * (p.tipMinR + rand() * p.tipSpan + lenDrift * t + lenJitter)
        : radius * (p.valleyMinR + rand() * p.valleySpan + lenJitter);

      points.push({
        x: ox + Math.cos(a) * r,
        y: oy + Math.sin(a) * r,
        width: strokeWidth(rand),
      });
    }
    return points;
  },
};

/**
 * petal-bloom: teardrop loops radiating from the center, like a doodled flower.
 * Each petal sweeps out and curls back, with per-petal length jitter.
 */
const petalBloom: Archetype = {
  name: "petal-bloom",
  tension: 1.6,
  closed: true,
  params: {
    minPetals: 4,
    maxPetals: 7,
    ptsPerPetal: 9,
    minLen: 0.7,
    maxLen: 1.0, // petal reach as fraction of radius
    petalWidth: 0.28, // lateral bulge of each loop
    lenJitter: 0.12,
  },
  generate(rand: Rng, radius: number, p: Record<string, number>): Point[] {
    const points: Point[] = [];
    const petals = randInt(rand, p.minPetals, p.maxPetals);
    const startA = rand() * Math.PI * 2;
    const dir = rand() < 0.5 ? 1 : -1;

    for (let i = 0; i < petals; i++) {
      const baseA = startA + dir * (i / petals) * Math.PI * 2;
      const lenJit = 1 + (rand() - 0.5) * p.lenJitter;
      const petalLen = radius * randRange(rand, p.minLen, p.maxLen) * lenJit;
      const width = radius * p.petalWidth;
      const side = rand() < 0.5 ? 1 : -1; // which way the loop curls

      for (let j = 0; j < p.ptsPerPetal; j++) {
        const t = j / (p.ptsPerPetal - 1);
        // Radial reach peaks mid-petal; lateral offset makes the loop.
        const reach = Math.sin(t * Math.PI) * petalLen;
        const lateral = side * Math.sin(t * Math.PI * 2) * width;
        points.push({
          x: Math.cos(baseA) * reach - Math.sin(baseA) * lateral,
          y: Math.sin(baseA) * reach + Math.cos(baseA) * lateral,
          width: strokeWidth(rand),
        });
      }
    }
    return points;
  },
};

/**
 * ziggy: a sharp bolt crossing the frame. Low tension keeps the corners
 * crisp; the straight runs get a touch of hand-drawn drift so they aren't
 * ruler-perfect.
 */
const lightning: Archetype = {
  name: "ziggy",
  tension: 0.3,
  closed: false,
  params: {
    minSeg: 4,
    maxSeg: 13, // number of zig segments (back-and-forth count)
    minZig: 0.35,
    maxZig: 0.7, // perpendicular throw as fraction of radius
    lenJitter: 0.25, // along-axis step jitter
    subdivs: 2, // intermediate points per straight run
    drift: 0.035, // hand-drawn wobble off the straight line
  },
  generate(rand: Rng, radius: number, p: Record<string, number>): Point[] {
    const segments = randInt(rand, p.minSeg, p.maxSeg);
    // One consistent weight for the whole bolt — avoids thin segments from
    // averaging adjacent per-point widths.
    const w = strokeWidth(rand);
    const travelA = rand() * Math.PI * 2;
    const perpA = travelA + Math.PI / 2;
    const toXY = (along: number, side: number) => ({
      x: Math.cos(travelA) * along + Math.cos(perpA) * side,
      y: Math.sin(travelA) * along + Math.sin(perpA) * side,
    });

    // Lay down the zig vertices in the (along, side) frame.
    const verts: { along: number; side: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const alongJit = (rand() - 0.5) * p.lenJitter * ((2 * radius) / segments);
      const along = -radius + t * 2 * radius + alongJit;
      const zig = randRange(rand, p.minZig, p.maxZig);
      const side = (i % 2 === 0 ? 1 : -1) * radius * zig;
      verts.push({ along, side });
    }

    // Walk each straight run, dropping subdivided points that drift a touch off
    // the ideal line. Each run emits its start vertex (f=0) plus intermediates;
    // the final vertex is added once at the end. Wobble is zeroed at vertices
    // (sin = 0) so the sharp corners stay crisp.
    const points: Point[] = [];
    for (let i = 0; i < verts.length - 1; i++) {
      const a = verts[i];
      const b = verts[i + 1];
      for (let s = 0; s <= p.subdivs; s++) {
        const f = s / (p.subdivs + 1);
        const along = a.along + (b.along - a.along) * f;
        const side = a.side + (b.side - a.side) * f;
        const ramp = Math.sin(f * Math.PI);
        const wobble = (rand() - 0.5) * 2 * p.drift * radius * ramp;
        const xy = toXY(along, side + wobble);
        points.push({ x: xy.x, y: xy.y, width: w });
      }
    }
    const last = verts[verts.length - 1];
    const lastXY = toXY(last.along, last.side);
    points.push({ x: lastXY.x, y: lastXY.y, width: w });

    return points;
  },
};

/**
 * haystack: a pen swung rapidly back and forth while the hand drifts
 * sideways — the way a small child fills a page. Amplitude varies swing to
 * swing and the drift meanders, so strokes pile up and overlap.
 */
const kidScribble: Archetype = {
  name: "haystack",
  tension: 1.5,
  closed: false,
  params: {
    minSwings: 20,
    maxSwings: 34,
    baseAmp: 0.95, // max stroke half-length as fraction of radius
    minAmpFrac: 0.4,
    ampSpan: 0.6, // per-swing amplitude variation
    driftBias: 0.045, // average sideways advance per swing (frac radius)
    driftWander: 0.11, // random sideways wander; > bias => backtrack/overlap
    turnJitter: 0.08, // lateral jitter at each turn point
    centerJitter: 0.18, // wandering of the oscillation midline
    angJitter: 0.18, // per-swing angle wobble
  },
  generate(rand: Rng, radius: number, p: Record<string, number>): Point[] {
    const points: Point[] = [];
    const swings = randInt(rand, p.minSwings, p.maxSwings);

    // Oscillation axis (the back-and-forth) can point any direction, with the
    // drift axis running perpendicular to it.
    const oscA = rand() * Math.PI * 2;
    const driftA = oscA - Math.PI / 2;

    const w = strokeWidth(rand);

    let driftPos = -radius * 0.5;
    let center = 0;

    for (let i = 0; i <= swings; i++) {
      const sign = i % 2 === 0 ? 1 : -1;
      const amp = radius * p.baseAmp * (p.minAmpFrac + rand() * p.ampSpan);

      driftPos += radius * (p.driftBias + (rand() - 0.5) * 2 * p.driftWander);
      center += (rand() - 0.5) * 2 * p.centerJitter * radius * 0.1;

      const a = oscA + (rand() - 0.5) * p.angJitter;
      const lateral = driftPos + (rand() - 0.5) * p.turnJitter * radius;

      const along = center + sign * amp;
      points.push({
        x: Math.cos(a) * along + Math.cos(driftA) * lateral,
        y: Math.sin(a) * along + Math.sin(driftA) * lateral,
        width: w,
      });
    }

    return points;
  },
};

/** All built-in archetypes, keyed by name. */
export const ARCHETYPES: Record<ArchetypeName, Archetype> = {
  nest: loopNest,
  spiral,
  core: scribbleFill,
  starburst,
  "petal-bloom": petalBloom,
  ziggy: lightning,
  haystack: kidScribble,
};

/** Stable ordering of archetype names (used for seeded selection). */
export const ARCHETYPE_NAMES: ArchetypeName[] = [
  "nest",
  "spiral",
  "core",
  "starburst",
  "petal-bloom",
  "ziggy",
  "haystack",
];
