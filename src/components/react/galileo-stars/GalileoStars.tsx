import { useEffect, useMemo, useRef, useState } from 'react';

const TEXT_LINE_HEIGHT = 30;
const TEXT_FONT = '500 22px "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif';
const STAR_COUNT = 140;
const VIEW_W = 1100;
const VIEW_H = 720;
const CONE_LENGTH = 760;
const CONE_SPREAD = 0.44;
const OBSERVER_W = 190;
const OBSERVER_H = 280;

export function GalileoStars(props: GalileoStarsProps) {
  const { companyName, headline, description, websiteLabel, websiteHref, imageSrc } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [hasImage, setHasImage] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [observerPos, setObserverPos] = useState<Point>({ x: 72, y: 188 });
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });
  const starsRef = useRef<StarParticle[]>(createStars());

  const textTokens = useMemo(() => splitText(buildBodyText(companyName, description)), [companyName, description]);
  const isFlipped = observerPos.x + OBSERVER_W * 0.5 > VIEW_W * 0.5;
  const cone = useMemo(() => getCone(observerPos, isFlipped), [observerPos, isFlipped]);
  const lineSegments = useMemo(() => layoutTextTokens(textTokens, cone), [cone, textTokens]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frameHandle = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const deltaSeconds = Math.min((now - last) / 1000, 0.05);
      last = now;
      renderStarCone(context, starsRef.current, cone, deltaSeconds);
      frameHandle = requestAnimationFrame(draw);
    };
    frameHandle = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameHandle);
  }, [cone]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pointer = toViewPoint(event.clientX, event.clientY, rect);
    dragOffsetRef.current = { x: pointer.x - observerPos.x, y: pointer.y - observerPos.y };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const pointer = toViewPoint(event.clientX, event.clientY, rect);
    const nextX = clamp(pointer.x - dragOffsetRef.current.x, 0, VIEW_W - OBSERVER_W);
    const nextY = clamp(pointer.y - dragOffsetRef.current.y, 120, VIEW_H - OBSERVER_H + 30);
    setObserverPos({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const handleImageDragStart = (event: React.DragEvent<HTMLImageElement>) => {
    event.preventDefault();
  };

  return (
    <section className="rounded-3xl border border-[#2b355f] bg-[#060913] p-4 text-[#d8deff] shadow-2xl md:p-7">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Galileo + Stars</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-white md:text-3xl">{headline}</h2>
        </div>
        <a
          href={websiteHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-200/20"
        >
          {websiteLabel}
        </a>
      </header>

      <div
        ref={stageRef}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0a1030] to-[#060913]"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} className="absolute inset-0 h-full w-full" />

        <div className="absolute inset-0">
          {lineSegments.map((segment) => (
            <p
              key={segment.id}
              className="absolute whitespace-pre text-[22px] leading-[30px] text-[#d7dbf5]"
              style={{ left: segment.x, top: segment.y, font: TEXT_FONT }}
            >
              {segment.text}
            </p>
          ))}
        </div>

        <div
          className="absolute z-20 touch-none select-none"
          style={{
            left: observerPos.x,
            top: observerPos.y,
            width: OBSERVER_W,
            height: OBSERVER_H,
            cursor: dragging ? 'grabbing' : 'grab',
          }}
          onPointerDown={handlePointerDown}
        >
          {hasImage ? (
            <img
              src={imageSrc}
              alt="Galileo with telescope"
              className="h-full w-full object-contain"
              style={{ transform: isFlipped ? 'scaleX(1)' : 'scaleX(-1)' }}
              draggable={false}
              onDragStart={handleImageDragStart}
              onError={() => setHasImage(false)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-white/20 bg-[#1a1f3a]/75 text-7xl">
              🔭
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-slate-200">
          Drag Galileo. Watch text reflow.
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">
        {description}
      </p>
    </section>
  );
}

function layoutTextTokens(tokens: string[], cone: Cone): TextSegment[] {
  if (typeof document === 'undefined') {
    return [];
  }
  const measureContext = document.createElement('canvas').getContext('2d');
  if (!measureContext) return [];
  measureContext.font = TEXT_FONT;
  const segments: TextSegment[] = [];
  let tokenIndex = 0;
  let lineTop = 72;
  let segmentId = 0;
  while (tokenIndex < tokens.length && lineTop <= VIEW_H - 60) {
    const bandBottom = lineTop + TEXT_LINE_HEIGHT;
    const slots = carveLineSlots(
      { left: 330, right: VIEW_W - 50 },
      [coneIntervalForBand(cone, lineTop, bandBottom)].filter(isInterval),
    );
    const preferredSlot = pickCenteredSlot(slots);
    if (preferredSlot) {
      const textLine = fitWords(tokens, tokenIndex, preferredSlot.right - preferredSlot.left, measureContext);
      if (textLine.text) {
        segments.push({ id: `${segmentId}`, x: preferredSlot.left, y: lineTop, text: textLine.text });
        segmentId += 1;
        tokenIndex = textLine.nextIndex;
      }
    }
    lineTop += TEXT_LINE_HEIGHT;
  }
  return segments;
}

function fitWords(
  tokens: string[],
  startIndex: number,
  maxWidth: number,
  context: CanvasRenderingContext2D,
): LineFit {
  let index = startIndex;
  let text = '';
  while (index < tokens.length) {
    const nextText = text ? `${text} ${tokens[index]}` : tokens[index] ?? '';
    if (context.measureText(nextText).width > maxWidth && text) break;
    if (context.measureText(nextText).width > maxWidth) return { text: '', nextIndex: index };
    text = nextText;
    index += 1;
  }
  return { text, nextIndex: index };
}

function carveLineSlots(base: Interval, blocked: Interval[]): Interval[] {
  let slots = [base];
  for (let index = 0; index < blocked.length; index++) {
    const nextSlots: Interval[] = [];
    for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
      const slot = slots[slotIndex];
      const cut = blocked[index];
      if (!slot || !cut) continue;
      if (cut.right <= slot.left || cut.left >= slot.right) {
        nextSlots.push(slot);
        continue;
      }
      if (cut.left > slot.left) nextSlots.push({ left: slot.left, right: cut.left });
      if (cut.right < slot.right) nextSlots.push({ left: cut.right, right: slot.right });
    }
    slots = nextSlots;
  }
  return slots.filter((slot) => slot.right - slot.left > 74);
}

function pickCenteredSlot(slots: Interval[]): Interval | null {
  if (slots.length === 0) return null;
  const midX = VIEW_W * 0.5;
  let best: Interval | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < slots.length; index++) {
    const slot = slots[index];
    if (!slot) continue;
    const width = slot.right - slot.left;
    const center = (slot.left + slot.right) * 0.5;
    const centerDistance = Math.abs(center - midX);
    const score = width - centerDistance * 1.25;
    if (score > bestScore) {
      bestScore = score;
      best = slot;
    }
  }
  return best;
}

function coneIntervalForBand(cone: Cone, top: number, bottom: number): Interval | null {
  const midY = (top + bottom) * 0.5;
  const sample = getConeCrossSection(cone, midY);
  if (!sample) return null;
  return { left: sample.left, right: sample.right };
}

function getConeCrossSection(cone: Cone, targetY: number): Interval | null {
  const points = [cone.tip, cone.edgeA, cone.edgeB];
  const intersections: number[] = [];
  for (let index = 0; index < 3; index++) {
    const p1 = points[index];
    const p2 = points[(index + 1) % 3];
    if (!p1 || !p2) continue;
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    if (targetY < minY || targetY > maxY || minY === maxY) continue;
    const t = (targetY - p1.y) / (p2.y - p1.y);
    intersections.push(p1.x + (p2.x - p1.x) * t);
  }
  if (intersections.length < 2) return null;
  intersections.sort((a, b) => a - b);
  return { left: intersections[0] ?? 0, right: intersections[intersections.length - 1] ?? 0 };
}

function getCone(observerPos: Point, isFlipped: boolean): Cone {
  const tip = isFlipped
    ? { x: observerPos.x + 46, y: observerPos.y + 58 }
    : { x: observerPos.x + 144, y: observerPos.y + 58 };
  const angle = isFlipped ? Math.PI + 0.06 : -0.06;
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  const normal = { x: -direction.y, y: direction.x };
  const end = { x: tip.x + direction.x * CONE_LENGTH, y: tip.y + direction.y * CONE_LENGTH };
  const spread = CONE_LENGTH * CONE_SPREAD;
  const edgeA = { x: end.x + normal.x * spread, y: end.y + normal.y * spread };
  const edgeB = { x: end.x - normal.x * spread, y: end.y - normal.y * spread };
  return { tip, edgeA, edgeB, direction, normal };
}

function renderStarCone(
  context: CanvasRenderingContext2D,
  stars: StarParticle[],
  cone: Cone,
  deltaSeconds: number,
): void {
  context.clearRect(0, 0, VIEW_W, VIEW_H);
  context.fillStyle = '#050812';
  context.fillRect(0, 0, VIEW_W, VIEW_H);
  drawConeBackground(context, cone);
  for (let index = 0; index < stars.length; index++) {
    const star = stars[index];
    if (!star) continue;
    star.progress += star.speed * deltaSeconds;
    if (star.progress > 1) star.progress -= 1;
    drawStar(context, star, cone);
  }
}

function drawConeBackground(context: CanvasRenderingContext2D, cone: Cone): void {
  const gradient = context.createLinearGradient(cone.tip.x, cone.tip.y, cone.edgeA.x, cone.edgeA.y);
  gradient.addColorStop(0, 'rgba(130,180,255,0.08)');
  gradient.addColorStop(0.2, 'rgba(130,180,255,0.16)');
  gradient.addColorStop(1, 'rgba(130,180,255,0.03)');
  context.beginPath();
  context.moveTo(cone.tip.x, cone.tip.y);
  context.lineTo(cone.edgeA.x, cone.edgeA.y);
  context.lineTo(cone.edgeB.x, cone.edgeB.y);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();
}

function drawStar(context: CanvasRenderingContext2D, star: StarParticle, cone: Cone): void {
  const dist = star.progress * CONE_LENGTH;
  const halfWidth = dist * CONE_SPREAD * 0.72;
  const offset = star.offset * halfWidth;
  const x = cone.tip.x + cone.direction.x * dist + cone.normal.x * offset;
  const y = cone.tip.y + cone.direction.y * dist + cone.normal.y * offset;
  const alpha = 0.25 + 0.75 * (1 - star.progress);
  context.fillStyle = `rgba(199, 230, 255, ${alpha})`;
  context.beginPath();
  context.arc(x, y, star.radius, 0, Math.PI * 2);
  context.fill();
}

function createStars(): StarParticle[] {
  return Array.from({ length: STAR_COUNT }, (_, index) => ({
    progress: (index * 31) % 100 / 100,
    speed: 0.12 + ((index * 13) % 10) / 100,
    offset: (((index * 17) % 200) - 100) / 100,
    radius: 0.8 + ((index * 5) % 16) / 10,
  }));
}

function splitText(value: string): string[] {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function buildBodyText(companyName: string, description: string): string {
  return `${companyName} is building AI tooling for product and design teams who need velocity without losing craft. ${description} Inspired by the editorial engine demo style, this page treats text as a dynamic layout system instead of static paragraphs. Move the astronomer and the star cone reshapes reading flow instantly, mirroring how modern interfaces should react to interaction. Teams can explore direction quickly, validate intent, and keep quality high while features move from idea to shipped experience.`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toViewPoint(clientX: number, clientY: number, rect: DOMRect): Point {
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  const scaleX = VIEW_W / rect.width;
  const scaleY = VIEW_H / rect.height;
  return {
    x: localX * scaleX,
    y: localY * scaleY,
  };
}

function isInterval(value: Interval | null): value is Interval {
  return Boolean(value);
}

type GalileoStarsProps = {
  companyName: string;
  headline: string;
  description: string;
  websiteLabel: string;
  websiteHref: string;
  imageSrc: string;
};

type Point = {
  x: number;
  y: number;
};

type Interval = {
  left: number;
  right: number;
};

type TextSegment = {
  id: string;
  x: number;
  y: number;
  text: string;
};

type LineFit = {
  text: string;
  nextIndex: number;
};

type Cone = {
  tip: Point;
  edgeA: Point;
  edgeB: Point;
  direction: Point;
  normal: Point;
};

type StarParticle = {
  progress: number;
  speed: number;
  offset: number;
  radius: number;
};
