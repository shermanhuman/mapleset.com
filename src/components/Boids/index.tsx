import React, { useEffect, useRef } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { leavesPlaying, onLeavesPlayingChange } from './playing';
import styles from './styles.module.css';

// Speeds in px/s, forces in px/s² (CSS pixels). Time-based, so refresh rate doesn't change the motion.
// The loop runs at the display's rate: a 30 fps cap aliased against 60, 90, 120 and 240 Hz
// displays and gave uneven frame spacing, so leaves stepped across art pixels in a ragged rhythm.
const MIN_SPEED = 15;
const MAX_SPEED = 42;
const VISUAL_RANGE = 120;
const MIN_DISTANCE = 80;
const ALIGNMENT = 1.2;
const COHESION = 0.7;
const SEPARATION = 70;
const WANDER = 9.1; // px/s per √s: random kicks to velocity, scaled by √dt so the wobble is the same at any frame rate
const WIND_X = 28; // The prevailing drift the leaves settle into: rightward and down
const WIND_Y = 16;
const WIND_PULL = 0.6; // Per second, how strongly a leaf's velocity is drawn towards the wind
// The cursor wades through the leaves like feet through a pile: a still cursor
// nudges them aside, a moving one kicks them along its path, out to the sides
// and up, and sets them whirling; they float back down and settle.
const SCATTER_RADIUS = 160; // Leaves inside this distance of the cursor are pushed
const SCATTER_FORCE = 1200; // px/s² at the cursor, still
const KICK_CARRY = 5; // Per second: how much of the cursor's velocity a leaf picks up
const KICK_SPREAD = 4; // Per second: outward push per px/s of cursor speed
const KICK_LIFT = 2; // Per second: upward lift per px/s of cursor speed
const SCATTER_SPEED = 700; // Top speed of a kicked leaf; it slows back down afterwards
const SLOW_DOWN = 1.2; // Per second, how quickly a kicked leaf returns to drifting speed
const POINTER_SMOOTHING = 15; // Per second, how quickly the cursor's measured speed follows it
// Each leaf spins in the picture plane and tumbles (turns over) at its own pace
const SPIN_RATE = [0.3, 1.0]; // rad/s, either way
const FLIP_RATE = [0.8, 2.2]; // rad/s
const SPIN_KICK = 0.25; // rad/s added per px of cursor sweep near the leaf
const FLIP_KICK = 0.25;
const MAX_TURN = 15; // rad/s, for both
const SETTLE = 1; // Per second, how quickly a kicked leaf's turning eases back to its own pace
const MAX_STEP = 0.1; // Seconds: after a stall, carry on from where the leaves were instead of jumping

// The leaves fall behind the whole site, on a canvas of art pixels scaled up by
// --px like the hero. The sprites (static/img/leaves/leaf-sprites-20.png) are
// oak, willow, birch and linden silhouettes traced from herbarium photos, and a
// drawn Japanese maple, 20 art pixels long with short straight stems, in
// 25-pixel cells, white on transparent. Each leaf has 7 rows of tumble frames
// (TUMBLE: its width as it turns over; negative is its back, mirrored) and 16
// columns of spin (0 is tip up, turning clockwise).
const KINDS = 5;
const TUMBLE = [1, 0.87, 0.5, 0, -0.5, -0.87, -1];
const SPINS = 16;
const CELL = 25;
const LEAF_COLOUR = '#3d1a36'; // The cards' surface: a little lighter than the page's plum
const AREA_PER_LEAF = 6000; // Art pixels² of screen per leaf
const MIN_LEAVES = 8;
const MAX_LEAVES = 60;

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: number;
  spin: number; // rad
  spinRate: number; // rad/s
  ownSpin: number; // The pace it settles back to
  flip: number; // rad: how far it has turned over
  flipRate: number;
  ownFlip: number;
}

interface Pointer {
  x: number;
  y: number;
  vx: number; // px/s, smoothed
  vy: number;
  active: boolean;
}

function step(boids: Boid[], dt: number, width: number, height: number, margin: number, pointer: Pointer) {
  for (const boid of boids) {
    let avgVX = 0, avgVY = 0, avgX = 0, avgY = 0, pushX = 0, pushY = 0, neighbors = 0;

    for (const other of boids) {
      if (other === boid) continue;
      const dx = boid.x - other.x;
      const dy = boid.y - other.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > VISUAL_RANGE * VISUAL_RANGE) continue;

      avgVX += other.vx;
      avgVY += other.vy;
      avgX += other.x;
      avgY += other.y;
      neighbors++;

      if (distSq < MIN_DISTANCE * MIN_DISTANCE) {
        const factor = 1 - Math.sqrt(distSq) / MIN_DISTANCE;
        pushX += dx * factor * factor;
        pushY += dy * factor * factor;
      }
    }

    let ax = pushX * SEPARATION + (WIND_X - boid.vx) * WIND_PULL;
    let ay = pushY * SEPARATION + (WIND_Y - boid.vy) * WIND_PULL;
    if (neighbors > 0) {
      ax += (avgVX / neighbors - boid.vx) * ALIGNMENT + (avgX / neighbors - boid.x) * COHESION;
      ay += (avgVY / neighbors - boid.vy) * ALIGNMENT + (avgY / neighbors - boid.y) * COHESION;
    }

    if (pointer.active) {
      const dx = boid.x - pointer.x;
      const dy = boid.y - pointer.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < SCATTER_RADIUS) {
        const near = 1 - dist / SCATTER_RADIUS;
        const sweep = Math.hypot(pointer.vx, pointer.vy);
        const push = near * (SCATTER_FORCE + sweep * KICK_SPREAD);
        ax += (dx / dist) * push + pointer.vx * near * KICK_CARRY;
        ay += (dy / dist) * push + pointer.vy * near * KICK_CARRY - sweep * near * KICK_LIFT;
        const whirl = sweep * near * dt;
        boid.spinRate += Math.sign(boid.spinRate) * whirl * SPIN_KICK;
        boid.flipRate += whirl * FLIP_KICK;
      }
    }

    // Turning, easing back to the leaf's own pace after a kick
    const settle = 1 - Math.exp(-SETTLE * dt);
    boid.spinRate = Math.max(-MAX_TURN, Math.min(MAX_TURN, boid.spinRate + (boid.ownSpin - boid.spinRate) * settle));
    boid.flipRate = Math.min(MAX_TURN, boid.flipRate + (boid.ownFlip - boid.flipRate) * settle);
    boid.spin += boid.spinRate * dt;
    boid.flip += boid.flipRate * dt;

    const kick = WANDER * Math.sqrt(dt);
    boid.vx += ax * dt + (Math.random() * 2 - 1) * kick;
    boid.vy += ay * dt + (Math.random() * 2 - 1) * kick;

    // Above drifting speed (after a scatter), ease back down instead of stopping dead
    const speed = Math.hypot(boid.vx, boid.vy) || 1;
    const easedSpeed = Math.max(MAX_SPEED, speed * Math.exp(-SLOW_DOWN * dt));
    const limit = speed > MAX_SPEED ? Math.min(SCATTER_SPEED, easedSpeed) : Math.max(MIN_SPEED, speed);
    boid.vx *= limit / speed;
    boid.vy *= limit / speed;

    boid.x += boid.vx * dt;
    boid.y += boid.vy * dt;

    if (boid.x < -margin) boid.x = width + margin;
    if (boid.x > width + margin) boid.x = -margin;
    if (boid.y < -margin) boid.y = height + margin;
    if (boid.y > height + margin) boid.y = -margin;
  }
}

const turn = Math.PI * 2;

// The sprite for a leaf's spin and tumble: spin to the nearest of SPINS angles,
// tumble to the frame whose width is nearest how far it has turned over
function spriteFor(sprites: HTMLCanvasElement[][][], boid: Boid): HTMLCanvasElement {
  const spin = ((Math.round((boid.spin / turn) * SPINS) % SPINS) + SPINS) % SPINS;
  const width = Math.cos(boid.flip);
  let frame = 0;
  for (let f = 1; f < TUMBLE.length; f++) if (Math.abs(TUMBLE[f] - width) < Math.abs(TUMBLE[frame] - width)) frame = f;
  return sprites[boid.kind][frame][spin];
}

// Each cell of the sprite sheet as its own canvas in the leaf colour, by kind,
// tumble frame and spin; loaded once per page load and shared
let spriteBank: Promise<HTMLCanvasElement[][][]> | null = null;
function loadSprites(src: string): Promise<HTMLCanvasElement[][][]> {
  spriteBank ??= new Promise((resolve, reject) => {
    const sheet = new Image();
    sheet.onload = () =>
      resolve(
        Array.from({length: KINDS}, (_, kind) =>
          TUMBLE.map((_, frame) =>
            Array.from({length: SPINS}, (_, spin) => {
              const sprite = document.createElement('canvas');
              sprite.width = sprite.height = CELL;
              const ctx = sprite.getContext('2d');
              if (ctx) {
                ctx.drawImage(sheet, spin * CELL, (kind * TUMBLE.length + frame) * CELL, CELL, CELL, 0, 0, CELL, CELL);
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = LEAF_COLOUR;
                ctx.fillRect(0, 0, CELL, CELL);
              }
              return sprite;
            }),
          ),
        ),
      );
    sheet.onerror = reject;
    sheet.src = src;
  });
  return spriteBank;
}

const FallingLeaves: React.FC = () => {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sheetUrl = useBaseUrl('/img/leaves/leaf-sprites-20.png');

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!layer || !canvas || !ctx) return;

    let sprites: HTMLCanvasElement[][][] | null = null;
    const boids: Boid[] = [];
    let width = 0; // CSS pixels: the viewport
    let height = 0;
    let px = 1; // CSS pixels per art pixel
    let frameId: number | null = null;
    let lastTime = 0;
    let disposed = false;
    const pointer: Pointer = { x: 0, y: 0, vx: 0, vy: 0, active: false };
    let lastPointerX = 0;
    let lastPointerY = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!sprites) return;
      for (const boid of boids) {
        const sprite = spriteFor(sprites, boid);
        ctx.drawImage(sprite, Math.round(boid.x / px - CELL / 2), Math.round(boid.y / px - CELL / 2));
      }
    };

    const tick = (time: number) => {
      frameId = requestAnimationFrame(tick);
      // A frame's timestamp can precede the moment the loop restarted, so never step backwards
      const dt = Math.min(Math.max((time - lastTime) / 1000, 0), MAX_STEP);
      // The cursor's speed, from how far it moved since the last frame
      if (dt > 0) {
        const follow = Math.min(1, POINTER_SMOOTHING * dt);
        pointer.vx += ((pointer.active ? (pointer.x - lastPointerX) / dt : 0) - pointer.vx) * follow;
        pointer.vy += ((pointer.active ? (pointer.y - lastPointerY) / dt : 0) - pointer.vy) * follow;
      }
      lastPointerX = pointer.x;
      lastPointerY = pointer.y;
      step(boids, dt, width, height, CELL * px, pointer);
      lastTime = time;
      draw();
    };

    // Animate while playing and the tab is visible; a paused leaf stays where it is
    const updateLoop = () => {
      const shouldRun = leavesPlaying() && !document.hidden && sprites !== null && boids.length > 0;
      if (shouldRun && frameId === null) {
        lastTime = performance.now();
        frameId = requestAnimationFrame(tick);
      } else if (!shouldRun && frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
        pointer.active = false;
      }
    };

    const between = ([low, high]: number[]) => low + Math.random() * (high - low);
    const addLeaf = () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
      const boid: Boid = {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        kind: Math.floor(Math.random() * KINDS),
        spin: Math.random() * turn,
        spinRate: 0,
        ownSpin: (Math.random() < 0.5 ? -1 : 1) * between(SPIN_RATE),
        flip: Math.random() * turn,
        flipRate: 0,
        ownFlip: between(FLIP_RATE),
      };
      boid.spinRate = boid.ownSpin;
      boid.flipRate = boid.ownFlip;
      boids.push(boid);
    };

    const resizeObserver = new ResizeObserver(() => {
      const oldPx = px;
      px = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--px'), 10) || 3;
      width = layer.clientWidth;
      height = layer.clientHeight;
      // Whole art pixels covering the viewport, scaled up by a whole number
      canvas.width = Math.ceil(width / px);
      canvas.height = Math.ceil(height / px);
      canvas.style.width = `${canvas.width * px}px`;
      canvas.style.height = `${canvas.height * px}px`;
      // When the scale changes, keep each leaf on the same art pixel
      for (const boid of boids) {
        boid.x *= px / oldPx;
        boid.y *= px / oldPx;
      }
      // About the same number of leaves per screenful at any size
      const target = Math.min(MAX_LEAVES, Math.max(MIN_LEAVES, Math.round((canvas.width * canvas.height) / AREA_PER_LEAF)));
      while (boids.length < target) addLeaf();
      boids.length = target;
      draw();
      updateLoop();
    });
    resizeObserver.observe(layer);

    loadSprites(sheetUrl).then((loaded) => {
      if (disposed) return;
      sprites = loaded;
      draw();
      updateLoop();
    }, () => {});

    const stopListening = onLeavesPlayingChange(updateLoop);
    document.addEventListener('visibilitychange', updateLoop);

    // The layer ignores the pointer so the page stays clickable; track it on the window
    const onPointerMove = (event: PointerEvent) => {
      if (!pointer.active) {
        // Entering: no sweep from wherever it last was
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = frameId !== null;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);

    return () => {
      disposed = true;
      if (frameId !== null) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      stopListening();
      document.removeEventListener('visibilitychange', updateLoop);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [sheetUrl]);

  return (
    <div ref={layerRef} className={styles.layer} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default React.memo(FallingLeaves);
