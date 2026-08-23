import {
  layoutNextLine,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext';

import { campaignNarrative, martyrs } from './martyrs';

const canvas = document.querySelector<HTMLCanvasElement>('[data-memorial-canvas]');
const stage = document.querySelector<HTMLElement>('.remembrance__stage');
const journey = document.querySelector<HTMLElement>('[data-memorial-journey]');
const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-memorial-step]'));
const resolutionStep = document.querySelector<HTMLElement>('[data-memorial-resolution]');
const previousButton = document.querySelector<HTMLButtonElement>('[data-memorial-previous]');
const nextButton = document.querySelector<HTMLButtonElement>('[data-memorial-next]');
const currentNumber = document.querySelector<HTMLElement>('[data-memorial-current]');
const activeName = document.querySelector<HTMLElement>('[data-memorial-active-name]');
const activePhase = document.querySelector<HTMLElement>('[data-memorial-active-phase]');
const activeMeta = document.querySelector<HTMLElement>('[data-memorial-active-meta]');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrativeCopy = `${campaignNarrative} ${martyrs
  .map(({ fullName, unit }) => `${fullName} · ${unit}`)
  .join(' · ')}`
  .replace(/\s+/g, ' ')
  .trim()
  .toUpperCase();
const resolvedCopy = martyrs
  .map(({ fullName }) => fullName)
  .join(' · ')
  .toUpperCase();

let activeIndex = 0;
let frameId = 0;
let isResolved = false;
let preparedNarrative: PreparedTextWithSegments | null = null;
let preparedNames: PreparedTextWithSegments | null = null;

const wheel: WheelState = {
  x: 0,
  y: 0,
  angle: 0,
  shape: 0,
  targetX: 0,
  targetY: 0,
  targetAngle: 0,
  targetShape: 0,
};

const setCanvasSize = () => {
  if (!canvas) return;
  const bounds = canvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(bounds.width * scale);
  canvas.height = Math.round(bounds.height * scale);
  canvas.dataset.scale = `${scale}`;
  preparedNarrative = prepareWithSegments(narrativeCopy, getNarrativeFont(bounds.width));
  preparedNames = prepareWithSegments(resolvedCopy, getResolvedFont(bounds.width));
  updateWheelTarget();
};

const updateWheelTarget = () => {
  if (!canvas) return;
  const { width, height } = canvas.getBoundingClientRect();
  if (isResolved) setResolvedWheelTarget(width, height);
  else setJourneyWheelTarget(width, height);
  if (reducedMotion) snapWheelToTarget();
  requestDraw();
};

const setJourneyWheelTarget = (width: number, height: number) => {
  const progress = activeIndex / Math.max(martyrs.length - 1, 1);
  const compact = width < 720;
  wheel.targetX = width * (compact ? 0.5 : 0.3 + Math.sin(progress * Math.PI * 3) * 0.1);
  wheel.targetY = height * (compact ? 0.2 : 0.34 + Math.cos(progress * Math.PI * 2) * 0.065);
  wheel.targetAngle = activeIndex * (Math.PI / 12);
  wheel.targetShape = getCampaignPhase(activeIndex);
};

const setResolvedWheelTarget = (width: number, height: number) => {
  wheel.targetX = width * 0.5;
  wheel.targetY = height * (width < 720 ? 0.16 : 0.18);
  wheel.targetAngle = Math.PI * 2;
  wheel.targetShape = 4;
};

const snapWheelToTarget = () => {
  wheel.x = wheel.targetX;
  wheel.y = wheel.targetY;
  wheel.angle = wheel.targetAngle;
  wheel.shape = wheel.targetShape;
};

const setActiveStep = (index: number) => {
  isResolved = false;
  stage?.removeAttribute('data-resolved');
  activeIndex = Math.max(0, Math.min(index, martyrs.length - 1));
  steps.forEach((step, stepIndex) =>
    step.toggleAttribute('data-active', stepIndex === activeIndex)
  );
  updateActiveContent();
  updateNavigation();
  updateWheelTarget();
};

const updateActiveContent = () => {
  const martyr = martyrs[activeIndex];
  if (!martyr) return;
  if (currentNumber) currentNumber.textContent = `${activeIndex + 1}`.padStart(2, '0');
  if (activeName) activeName.textContent = martyr.fullName;
  if (activePhase) activePhase.textContent = martyr.phase;
  if (activeMeta) activeMeta.textContent = `${martyr.unit} · ${martyr.location}`;
};

const setResolved = (resolved: boolean) => {
  if (isResolved === resolved) return;
  isResolved = resolved;
  stage?.toggleAttribute('data-resolved', resolved);
  updateNavigation();
  updateWheelTarget();
};

const updateNavigation = () => {
  if (previousButton) previousButton.disabled = !isResolved && activeIndex === 0;
  if (nextButton) nextButton.disabled = isResolved;
};

const requestDraw = () => {
  cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(drawFrame);
};

const drawFrame = () => {
  if (!canvas || !preparedNarrative || !preparedNames) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  interpolateWheel();
  drawScene(context, canvas, preparedNarrative, preparedNames);
  positionFocus(canvas.getBoundingClientRect().width);
  if (!wheelHasSettled()) frameId = requestAnimationFrame(drawFrame);
};

const interpolateWheel = () => {
  const amount = reducedMotion ? 1 : 0.085;
  wheel.x += (wheel.targetX - wheel.x) * amount;
  wheel.y += (wheel.targetY - wheel.y) * amount;
  wheel.angle += (wheel.targetAngle - wheel.angle) * amount;
  wheel.shape += (wheel.targetShape - wheel.shape) * amount;
};

const wheelHasSettled = () => {
  const positionDelta = Math.abs(wheel.targetX - wheel.x) + Math.abs(wheel.targetY - wheel.y);
  const angleDelta = Math.abs(wheel.targetAngle - wheel.angle);
  return (
    positionDelta < 0.2 && angleDelta < 0.002 && Math.abs(wheel.targetShape - wheel.shape) < 0.002
  );
};

const positionFocus = (width: number) => {
  if (!stage) return;
  const radius = getWheelRadius(width);
  stage.style.setProperty('--focus-x', `${wheel.x}px`);
  stage.style.setProperty('--focus-y', `${wheel.y + radius + (width < 720 ? 44 : 62)}px`);
};

const drawScene = (
  context: CanvasRenderingContext2D,
  targetCanvas: HTMLCanvasElement,
  narrative: PreparedTextWithSegments,
  names: PreparedTextWithSegments
) => {
  const scale = Number(targetCanvas.dataset.scale ?? 1);
  const width = targetCanvas.width / scale;
  const height = targetCanvas.height / scale;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, width, height);
  if (isResolved) drawResolvedText(context, names, width, height);
  else drawReflowingText(context, narrative, width, height);
  drawChakra(context, getWheelRadius(width));
};

const drawReflowingText = (
  context: CanvasRenderingContext2D,
  text: PreparedTextWithSegments,
  width: number,
  height: number
) => {
  const compact = width < 720;
  const lineHeight = compact ? 21 : 28;
  const baseMargin = compact ? 18 : 52;
  const clearRadius = getClearRadius(width);
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  context.font = getNarrativeFont(width);
  context.fillStyle = compact ? 'rgba(17, 25, 39, 0.4)' : 'rgba(17, 25, 39, 0.46)';
  context.textBaseline = 'alphabetic';

  for (let y = baseMargin; y < height - baseMargin; y += lineHeight) {
    const bounds = getTerrainBounds(y, width, height, baseMargin);
    const nextCursor = drawTextRow(context, text, cursor, { ...bounds, y, clearRadius });
    if (!nextCursor) break;
    cursor = nextCursor;
  }
};

const getTerrainBounds = (y: number, width: number, height: number, margin: number) => {
  const progress = y / Math.max(height, 1);
  const amplitude = width * (0.018 + wheel.shape * 0.011);
  const leftWave = (Math.sin(progress * Math.PI * (3 + wheel.shape * 0.4) + wheel.shape) + 1) / 2;
  const rightWave = (Math.cos(progress * Math.PI * (4 + wheel.shape * 0.3) - wheel.shape) + 1) / 2;
  return {
    left: margin + leftWave * amplitude,
    right: width - margin - rightWave * amplitude,
  };
};

const drawTextRow = (
  context: CanvasRenderingContext2D,
  text: PreparedTextWithSegments,
  cursor: LayoutCursor,
  row: TextRow
) => {
  const clearCenterY = wheel.y + row.clearRadius * 0.28;
  const verticalDistance = Math.abs(row.y - clearCenterY);
  if (verticalDistance >= row.clearRadius) {
    return drawLine(context, text, cursor, row.left, row.y, row.right - row.left);
  }

  const halfChord = Math.sqrt(row.clearRadius ** 2 - verticalDistance ** 2);
  const leftWidth = Math.max(0, wheel.x - halfChord - row.left);
  const rightStart = Math.max(row.left, wheel.x + halfChord);
  const rightWidth = Math.max(0, row.right - rightStart);
  const afterLeft =
    leftWidth > 64 ? drawLine(context, text, cursor, row.left, row.y, leftWidth) : cursor;
  if (!afterLeft) return null;
  return rightWidth > 64
    ? drawLine(context, text, afterLeft, rightStart, row.y, rightWidth)
    : afterLeft;
};

const drawLine = (
  context: CanvasRenderingContext2D,
  text: PreparedTextWithSegments,
  cursor: LayoutCursor,
  x: number,
  y: number,
  maxWidth: number
) => {
  const line = layoutNextLine(text, cursor, maxWidth);
  if (!line) return null;
  context.fillText(line.text, x, y);
  return line.end;
};

const drawResolvedText = (
  context: CanvasRenderingContext2D,
  text: PreparedTextWithSegments,
  width: number,
  height: number
) => {
  const compact = width < 720;
  const startY = height * (compact ? 0.34 : 0.36);
  const lineHeight = compact ? 17 : 22;
  const bottom = height - (compact ? 38 : 58);
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  context.font = getResolvedFont(width);
  context.fillStyle = 'rgba(17, 25, 39, 0.66)';
  context.textBaseline = 'alphabetic';

  for (let y = startY; y < bottom; y += lineHeight) {
    const progress = (y - startY) / Math.max(bottom - startY, 1);
    const maxWidth = width * (0.24 + progress * 0.68);
    const line = layoutNextLine(text, cursor, maxWidth);
    if (!line) break;
    context.fillText(line.text, (width - line.width) / 2, y);
    cursor = line.end;
  }
};

const drawChakra = (context: CanvasRenderingContext2D, radius: number) => {
  context.save();
  context.translate(wheel.x, wheel.y);
  context.rotate(wheel.angle);
  drawChakraRings(context, radius);
  drawChakraSpokes(context, radius);
  context.restore();
  drawChakraNumber(context, radius);
};

const drawChakraRings = (context: CanvasRenderingContext2D, radius: number) => {
  context.strokeStyle = '#163b6d';
  context.lineWidth = Math.max(2, radius * 0.035);
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.stroke();
  context.lineWidth = Math.max(1.5, radius * 0.018);
  context.beginPath();
  context.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
  context.stroke();
};

const drawChakraSpokes = (context: CanvasRenderingContext2D, radius: number) => {
  for (let spoke = 0; spoke < 24; spoke += 1) {
    const angle = spoke * (Math.PI / 12);
    context.strokeStyle = spoke === 0 && !isResolved ? '#c76b27' : '#163b6d';
    context.lineWidth =
      spoke === 0 && !isResolved ? Math.max(2.5, radius * 0.026) : Math.max(1, radius * 0.012);
    context.beginPath();
    context.moveTo(Math.cos(angle) * radius * 0.2, Math.sin(angle) * radius * 0.2);
    context.lineTo(Math.cos(angle) * radius * 0.9, Math.sin(angle) * radius * 0.9);
    context.stroke();
  }
};

const drawChakraNumber = (context: CanvasRenderingContext2D, radius: number) => {
  if (isResolved) return;
  context.fillStyle = '#163b6d';
  context.font = `700 ${Math.max(12, radius * 0.14)}px "Source Sans Pro", sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(`${activeIndex + 1}`.padStart(2, '0'), wheel.x, wheel.y);
  context.textAlign = 'start';
};

const getCampaignPhase = (index: number) => {
  if (index <= 5) return 0;
  if (index <= 10) return 1;
  if (index <= 16) return 2;
  if (index <= 20) return 3;
  return 4;
};

const getWheelRadius = (width: number) => Math.min(width < 720 ? 66 : 102, width * 0.16);
const getClearRadius = (width: number) => getWheelRadius(width) + (width < 720 ? 104 : 138);
const getNarrativeFont = (width: number) =>
  `600 ${width < 720 ? 13 : 17}px "Source Sans Pro", sans-serif`;
const getResolvedFont = (width: number) =>
  `600 ${width < 720 ? 10 : 13}px "Source Sans Pro", sans-serif`;

const scrollToStep = (index: number) => {
  const step = steps[Math.max(0, Math.min(index, steps.length - 1))];
  step?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
};

const scrollForward = () => {
  if (activeIndex === martyrs.length - 1) {
    resolutionStep?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'center',
    });
    return;
  }
  scrollToStep(activeIndex + 1);
};

const scrollBack = () => {
  if (isResolved) {
    scrollToStep(martyrs.length - 1);
    return;
  }
  scrollToStep(activeIndex - 1);
};

const observeSteps = () => {
  const options = { rootMargin: '-44% 0px -44% 0px', threshold: 0 };
  const stepObserver = new IntersectionObserver(handleIntersections, options);
  steps.forEach((step) => stepObserver.observe(step));
  if (resolutionStep) new IntersectionObserver(handleResolution, options).observe(resolutionStep);
};

const handleIntersections: IntersectionObserverCallback = (entries) => {
  const visibleStep = entries.find(({ isIntersecting }) => isIntersecting);
  if (!visibleStep) return;
  const index = Number((visibleStep.target as HTMLElement).dataset.memorialStep);
  if (Number.isFinite(index)) setActiveStep(index);
};

const handleResolution: IntersectionObserverCallback = ([entry]) => {
  if (!entry) return;
  if (entry.isIntersecting) setResolved(true);
  else if (entry.boundingClientRect.top > window.innerHeight / 2) setResolved(false);
};

const handleJourneyKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  event.preventDefault();
  if (event.key === 'ArrowDown' && !isResolved) scrollForward();
  if (event.key === 'ArrowUp') scrollBack();
};

const initialise = async () => {
  if (!canvas || !journey || steps.length === 0) return;
  await document.fonts.ready;
  setCanvasSize();
  snapWheelToTarget();
  setActiveStep(0);
  observeSteps();
  window.addEventListener('resize', setCanvasSize);
  journey.addEventListener('keydown', handleJourneyKeydown);
  previousButton?.addEventListener('click', scrollBack);
  nextButton?.addEventListener('click', scrollForward);
};

void initialise();

type WheelState = {
  x: number;
  y: number;
  angle: number;
  shape: number;
  targetX: number;
  targetY: number;
  targetAngle: number;
  targetShape: number;
};

type TextRow = {
  left: number;
  right: number;
  y: number;
  clearRadius: number;
};
