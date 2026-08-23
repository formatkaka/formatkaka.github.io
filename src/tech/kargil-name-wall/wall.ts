import { martyrs } from '../kargil-remembrance/martyrs';
import { battleArchive, getCommonsFileUrl, type ArchiveImage } from './archive';
import { battleScenes } from './scenes';

const stage = document.querySelector<HTMLElement>('[data-name-wall-stage]');
const wall = document.querySelector<HTMLElement>('[data-name-wall]');
const clearance = document.querySelector<HTMLElement>('[data-name-wall-clearance]');
const journey = document.querySelector<HTMLElement>('[data-name-wall-journey]');
const sceneElements = Array.from(document.querySelectorAll<HTMLElement>('[data-name-wall-scene]'));
const wallNames = Array.from(document.querySelectorAll<HTMLElement>('[data-wall-name]'));
const sceneNumber = document.querySelector<HTMLElement>('[data-scene-number]');
const sceneKicker = document.querySelector<HTMLElement>('[data-scene-kicker]');
const sceneTitle = document.querySelector<HTMLElement>('[data-scene-title]');
const sceneDetail = document.querySelector<HTMLElement>('[data-scene-detail]');
const sceneNames = document.querySelector<HTMLElement>('[data-scene-names]');
const sceneImages = document.querySelector<HTMLElement>('[data-scene-images]');
const context = document.querySelector<HTMLElement>('.name-wall-experiment__context');
const sceneBattle = document.querySelector<HTMLElement>('[data-scene-battle]');
const familyStory = document.querySelector<HTMLElement>('[data-family-story]');
const familyToggle = document.querySelector<HTMLButtonElement>('[data-family-toggle]');
const familyToggleLabel = document.querySelector<HTMLElement>('[data-family-toggle-label]');
const familyToggleArrow = document.querySelector<HTMLElement>('[data-family-toggle-arrow]');
const readMoreLink = document.querySelector<HTMLAnchorElement>('[data-scene-read-more]');
const lightbox = document.querySelector<HTMLDialogElement>('[data-image-lightbox]');
const lightboxImage = document.querySelector<HTMLImageElement>('[data-lightbox-image]');
const lightboxCaption = document.querySelector<HTMLElement>('[data-lightbox-caption]');
const lightboxCredit = document.querySelector<HTMLElement>('[data-lightbox-credit]');
const lightboxSource = document.querySelector<HTMLAnchorElement>('[data-lightbox-source]');
const lightboxCounter = document.querySelector<HTMLElement>('[data-lightbox-counter]');
const lightboxPrevious = document.querySelector<HTMLButtonElement>('[data-lightbox-previous]');
const lightboxNext = document.querySelector<HTMLButtonElement>('[data-lightbox-next]');
const previousButton = document.querySelector<HTMLButtonElement>('[data-scene-previous]');
const nextButton = document.querySelector<HTMLButtonElement>('[data-scene-next]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let activeSceneIndex = 0;
let layoutFrame = 0;
let layoutTimer = 0;
let lightboxLinks: HTMLAnchorElement[] = [];
let lightboxIndex = 0;

const setActiveScene = (index: number) => {
  const nextIndex = Math.max(0, Math.min(index, battleScenes.length - 1));
  const scene = battleScenes[nextIndex];
  if (!scene || !stage) return;
  activeSceneIndex = nextIndex;
  stage.style.setProperty('--scene', `${nextIndex}`);
  updateSceneContent(scene, nextIndex);
  scheduleLayout(scene, nextIndex);
};

const updateSceneContent = (scene: (typeof battleScenes)[number], index: number) => {
  sceneElements.forEach((element, sceneIndex) =>
    element.toggleAttribute('data-active', sceneIndex === index)
  );
  if (sceneNumber) sceneNumber.textContent = `${index + 1}`.padStart(2, '0');
  if (sceneKicker) sceneKicker.textContent = scene.kicker;
  if (sceneTitle) sceneTitle.textContent = scene.title;
  if (sceneDetail) sceneDetail.textContent = scene.detail;
  if (previousButton) previousButton.disabled = index === 0;
  if (nextButton) nextButton.disabled = index === battleScenes.length - 1;
  setContextMode('battle');
  if (familyToggle) familyToggle.hidden = index !== 0;
  replaceSceneNames(scene.soldierIndices);
  replaceSceneArchive(index);
};

const replaceSceneNames = (indices: number[]) => {
  if (!sceneNames) return;
  sceneNames.replaceChildren(...indices.map((index) => createListItem(index)));
};

const createListItem = (index: number) => {
  const item = document.createElement('li');
  item.textContent = martyrs[index]?.fullName ?? '';
  return item;
};

const replaceSceneArchive = (index: number) => {
  const archive = battleArchive[index];
  if (!archive) return;
  sceneImages?.replaceChildren(...archive.images.map(createArchiveLink));
  sceneImages?.scrollTo({ left: 0, behavior: 'auto' });
  if (!readMoreLink) return;
  readMoreLink.href = archive.readMore.url;
  readMoreLink.replaceChildren(archive.readMore.label, createExternalArrow());
};

const createArchiveLink = (image: ArchiveImage) => {
  const link = document.createElement('a');
  link.href = getCommonsFileUrl(image.commonsFile);
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.title = `${image.credit} · ${image.license}`;
  link.dataset.archiveImage = '';
  link.dataset.imageSrc = image.src;
  link.dataset.imageAlt = image.alt;
  link.dataset.imageCaption = image.caption;
  link.dataset.imageCredit = `${image.credit} · ${image.license}`;
  link.dataset.imageSource = link.href;
  link.append(createArchiveImage(image), createArchiveCaption(image));
  return link;
};

const createArchiveImage = (image: ArchiveImage) => {
  const element = document.createElement('img');
  element.src = image.src;
  element.alt = image.alt;
  element.loading = 'lazy';
  return element;
};

const createArchiveCaption = (image: ArchiveImage) => {
  const fragment = document.createDocumentFragment();
  const caption = document.createElement('strong');
  const credit = document.createElement('span');
  caption.textContent = image.caption;
  credit.textContent = `${image.credit} · ${image.license}`;
  fragment.append(caption, credit);
  return fragment;
};

const createExternalArrow = () => {
  const arrow = document.createElement('span');
  arrow.textContent = ' ↗';
  arrow.setAttribute('aria-hidden', 'true');
  return arrow;
};

const handleArchiveClick = (event: MouseEvent) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>('[data-archive-image]');
  if (!link || !lightbox) return;
  event.preventDefault();
  const gallery = link.closest<HTMLElement>('[data-image-gallery]');
  lightboxLinks = Array.from(
    gallery?.querySelectorAll<HTMLAnchorElement>('[data-archive-image]') ?? []
  );
  showLightboxImage(Math.max(0, lightboxLinks.indexOf(link)));
  if (!lightbox.open) lightbox.showModal();
};

const showLightboxImage = (index: number) => {
  const link = lightboxLinks[index];
  if (!link) return;
  lightboxIndex = index;
  populateLightbox(link);
  if (lightboxCounter) lightboxCounter.textContent = `${index + 1} / ${lightboxLinks.length}`;
  if (lightboxPrevious) lightboxPrevious.disabled = index === 0;
  if (lightboxNext) lightboxNext.disabled = index === lightboxLinks.length - 1;
};

const populateLightbox = (link: HTMLAnchorElement) => {
  if (lightboxImage) {
    lightboxImage.src = link.dataset.imageSrc ?? '';
    lightboxImage.alt = link.dataset.imageAlt ?? '';
  }
  if (lightboxCaption) lightboxCaption.textContent = link.dataset.imageCaption ?? '';
  if (lightboxCredit) lightboxCredit.textContent = link.dataset.imageCredit ?? '';
  if (lightboxSource) {
    const source = link.dataset.imageSource;
    lightboxSource.hidden = !source;
    lightboxSource.href = source ?? '';
  }
};

const setContextMode = (mode: 'battle' | 'family') => {
  const showFamily = mode === 'family';
  if (sceneBattle) sceneBattle.hidden = showFamily;
  if (familyStory) familyStory.hidden = !showFamily;
  if (familyToggle) familyToggle.ariaExpanded = `${showFamily}`;
  if (familyToggleLabel) {
    familyToggleLabel.textContent = showFamily
      ? 'Return to the patrol'
      : 'Continue · What remained';
  }
  if (familyToggleArrow) familyToggleArrow.textContent = showFamily ? '←' : '→';
  context?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
};

const toggleFamilyStory = () => {
  const isOpen = familyToggle?.ariaExpanded === 'true';
  setContextMode(isOpen ? 'battle' : 'family');
};

const closeLightboxOnBackdrop = (event: MouseEvent) => {
  if (event.target === lightbox) lightbox?.close();
};

const navigateLightbox = (direction: number) => {
  const nextIndex = Math.max(0, Math.min(lightboxIndex + direction, lightboxLinks.length - 1));
  showLightboxImage(nextIndex);
};

const handleLightboxKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  navigateLightbox(event.key === 'ArrowLeft' ? -1 : 1);
};

const scheduleLayout = (scene: (typeof battleScenes)[number], index: number) => {
  cancelAnimationFrame(layoutFrame);
  window.clearTimeout(layoutTimer);
  layoutFrame = requestAnimationFrame(() => layoutScene(scene, index));
  if (!reducedMotion) layoutTimer = window.setTimeout(() => layoutScene(scene, index), 720);
};

const layoutScene = (scene: (typeof battleScenes)[number], index: number) => {
  clearWallState();
  const solution = findPlacement(scene.soldierIndices, index);
  if (!solution) return;
  solution.group.elements.forEach((name) => name.setAttribute('data-highlighted', ''));
  positionWheel(solution);
  wallNames.forEach((name) => displaceNearbyName(name, solution));
};

const clearWallState = () => {
  wallNames.forEach((name) => {
    name.removeAttribute('data-highlighted');
    name.removeAttribute('data-near-wheel');
    name.style.removeProperty('--push-x');
    name.style.removeProperty('--push-y');
  });
};

const findPlacement = (indices: number[], sceneIndex: number) => {
  const groups = getGroupOccurrences(indices);
  const baseRadius = getBaseRadius();
  const radii = [baseRadius, baseRadius * 0.88, baseRadius * 0.76];
  for (const radius of radii) {
    const solutions = groups.flatMap((group) => getGroupPlacements(group, radius, sceneIndex));
    const best = solutions.sort((first, second) => second.score - first.score)[0];
    if (best) return best;
  }
  return null;
};

const getGroupOccurrences = (indices: number[]) => {
  const repetitions = new Set(wallNames.map(({ dataset }) => Number(dataset.repetition)));
  return Array.from(repetitions)
    .map((repetition) => createGroupOccurrence(indices, repetition))
    .filter((group): group is NameGroup => group !== null);
};

const createGroupOccurrence = (indices: number[], repetition: number) => {
  const elements = indices
    .map((index) => findWallName(index, repetition))
    .filter((element): element is HTMLElement => element !== undefined);
  if (elements.length !== indices.length) return null;
  return { elements, bounds: getUnionBounds(elements), repetition };
};

const findWallName = (index: number, repetition: number) =>
  wallNames.find(
    ({ dataset }) =>
      Number(dataset.soldierIndex) === index && Number(dataset.repetition) === repetition
  );

const getGroupPlacements = (group: NameGroup, radius: number, sceneIndex: number) => {
  if (!isGroupVisible(group)) return [];
  return createWheelCandidates(group, radius)
    .filter((candidate) => isWheelPositionSafe(candidate, group))
    .map((candidate) => ({
      ...candidate,
      group,
      score: scorePlacement(candidate, group, sceneIndex),
    }));
};

const createWheelCandidates = (group: NameGroup, radius: number): WheelCandidate[] => {
  const gap = window.innerWidth < 720 ? 24 : 42;
  const { left, right, top, bottom, centerX, centerY } = group.bounds;
  return [
    { x: left - radius - gap, y: centerY, radius, direction: 'left' },
    { x: right + radius + gap, y: centerY, radius, direction: 'right' },
    { x: centerX, y: top - radius - gap, radius, direction: 'above' },
    { x: centerX, y: bottom + radius + gap, radius, direction: 'below' },
  ];
};

const isGroupVisible = (group: NameGroup) => {
  const safe = getSafeWallBounds();
  return group.elements.every((element) => isRectWithin(element.getBoundingClientRect(), safe));
};

const isWheelPositionSafe = (candidate: WheelCandidate, group: NameGroup) => {
  const safe = getSafeWallBounds();
  if (!isCircleWithin(candidate, safe)) return false;
  if (
    group.elements.some((element) =>
      circleIntersectsRect(candidate, element.getBoundingClientRect())
    )
  ) {
    return false;
  }
  return getActiveCueBounds().every((bounds) => !circleIntersectsRect(candidate, bounds));
};

const scorePlacement = (candidate: WheelCandidate, group: NameGroup, sceneIndex: number) => {
  const safe = getSafeWallBounds();
  const desiredY = safe.top + (safe.height * (sceneIndex + 1)) / (battleScenes.length + 1);
  const routeScore = 180 - Math.abs(group.bounds.centerY - desiredY) * 0.16;
  const directionScore =
    candidate.direction === 'left' || candidate.direction === 'right' ? 90 : 25;
  const edgeScore = Math.min(candidate.x - safe.left, safe.right - candidate.x) * 0.08;
  return routeScore + directionScore + edgeScore - group.repetition * 2;
};

const getSafeWallBounds = () => {
  const bounds = wall?.getBoundingClientRect() ?? new DOMRect(0, 0, innerWidth, innerHeight);
  const side = window.innerWidth < 720 ? 14 : 26;
  const top = bounds.top + (window.innerWidth < 720 ? 72 : 82);
  return createBounds(bounds.left + side, top, bounds.right - side, bounds.bottom - side);
};

const getActiveCueBounds = () => {
  const active = sceneElements[activeSceneIndex];
  if (!active) return [];
  return Array.from(active.children).map((child) => child.getBoundingClientRect());
};

const getUnionBounds = (elements: HTMLElement[]) => {
  const rectangles = elements.map((element) => element.getBoundingClientRect());
  const left = Math.min(...rectangles.map((bounds) => bounds.left));
  const right = Math.max(...rectangles.map((bounds) => bounds.right));
  const top = Math.min(...rectangles.map((bounds) => bounds.top));
  const bottom = Math.max(...rectangles.map((bounds) => bounds.bottom));
  return createBounds(left, top, right, bottom);
};

const createBounds = (left: number, top: number, right: number, bottom: number): Bounds => ({
  left,
  right,
  top,
  bottom,
  width: right - left,
  height: bottom - top,
  centerX: (left + right) / 2,
  centerY: (top + bottom) / 2,
});

const isRectWithin = (rectangle: DOMRect, bounds: Bounds) =>
  rectangle.left >= bounds.left &&
  rectangle.right <= bounds.right &&
  rectangle.top >= bounds.top &&
  rectangle.bottom <= bounds.bottom;

const isCircleWithin = (circle: WheelCandidate, bounds: Bounds) =>
  circle.x - circle.radius >= bounds.left &&
  circle.x + circle.radius <= bounds.right &&
  circle.y - circle.radius >= bounds.top &&
  circle.y + circle.radius <= bounds.bottom;

const circleIntersectsRect = (circle: WheelCandidate, rectangle: DOMRect) => {
  const nearestX = Math.max(rectangle.left, Math.min(circle.x, rectangle.right));
  const nearestY = Math.max(rectangle.top, Math.min(circle.y, rectangle.bottom));
  return Math.hypot(circle.x - nearestX, circle.y - nearestY) < circle.radius + 18;
};

const getBaseRadius = () => {
  const wallWidth = wall?.getBoundingClientRect().width ?? innerWidth;
  if (window.innerWidth < 720) return Math.min(60, wallWidth * 0.17);
  return Math.min(96, wallWidth * 0.105);
};

const positionWheel = (solution: PlacementSolution) => {
  if (!stage) return;
  const point = toStagePoint(solution);
  stage.style.setProperty('--wheel-x', `${point.x}px`);
  stage.style.setProperty('--wheel-y', `${point.y}px`);
  stage.style.setProperty('--wheel-diameter', `${solution.radius * 2}px`);
  positionClearance(solution);
};

const positionClearance = (solution: PlacementSolution) => {
  if (!clearance) return;
  const point = toStagePoint(solution);
  const padding = window.innerWidth < 720 ? 18 : 28;
  const diameter = (solution.radius + padding) * 2;
  clearance.style.left = `${point.x - diameter / 2}px`;
  clearance.style.top = `${point.y - diameter / 2}px`;
  clearance.style.width = `${diameter}px`;
  clearance.style.height = `${diameter}px`;
};

const toStagePoint = (point: Point) => {
  const bounds = stage?.getBoundingClientRect();
  return { x: point.x - (bounds?.left ?? 0), y: point.y - (bounds?.top ?? 0) };
};

const displaceNearbyName = (name: HTMLElement, solution: PlacementSolution) => {
  if (name.hasAttribute('data-highlighted')) return;
  const bounds = name.getBoundingClientRect();
  const center = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
  const distance = Math.hypot(center.x - solution.x, center.y - solution.y);
  const reach = solution.radius + 86;
  if (distance > reach || distance < 1) return;
  const force = ((reach - distance) / reach) * 12;
  name.toggleAttribute('data-near-wheel', true);
  name.style.setProperty('--push-x', `${((center.x - solution.x) / distance) * force}px`);
  name.style.setProperty('--push-y', `${((center.y - solution.y) / distance) * force}px`);
};

const scrollToScene = (index: number) => {
  const element = sceneElements[Math.max(0, Math.min(index, sceneElements.length - 1))];
  element?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
};

const observeScenes = () => {
  const observer = new IntersectionObserver(handleIntersections, {
    rootMargin: '-46% 0px -46% 0px',
    threshold: 0,
  });
  sceneElements.forEach((element) => observer.observe(element));
};

const handleIntersections: IntersectionObserverCallback = (entries) => {
  const entry = entries.find(({ isIntersecting }) => isIntersecting);
  if (!entry) return;
  const index = Number((entry.target as HTMLElement).dataset.nameWallScene);
  if (Number.isFinite(index)) setActiveScene(index);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  event.preventDefault();
  scrollToScene(activeSceneIndex + (event.key === 'ArrowDown' ? 1 : -1));
};

const handleResize = () => {
  const scene = battleScenes[activeSceneIndex];
  if (scene) scheduleLayout(scene, activeSceneIndex);
};

const initialise = () => {
  if (!stage || !wall || !journey || sceneElements.length === 0) return;
  setActiveScene(0);
  observeScenes();
  journey.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleResize);
  previousButton?.addEventListener('click', () => scrollToScene(activeSceneIndex - 1));
  nextButton?.addEventListener('click', () => scrollToScene(activeSceneIndex + 1));
};

document.fonts.ready.then(initialise).catch(initialise);
context?.addEventListener('click', handleArchiveClick);
familyToggle?.addEventListener('click', toggleFamilyStory);
lightbox?.addEventListener('click', closeLightboxOnBackdrop);
lightbox?.addEventListener('keydown', handleLightboxKeydown);
lightboxPrevious?.addEventListener('click', () => navigateLightbox(-1));
lightboxNext?.addEventListener('click', () => navigateLightbox(1));

type Point = {
  x: number;
  y: number;
};

type Bounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

type NameGroup = {
  elements: HTMLElement[];
  bounds: Bounds;
  repetition: number;
};

type WheelCandidate = Point & {
  radius: number;
  direction: 'left' | 'right' | 'above' | 'below';
};

type PlacementSolution = WheelCandidate & {
  group: NameGroup;
  score: number;
};
