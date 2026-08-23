// First 3 baskets have fixed speeds, rest are randomized from RANDOM_SPEEDS pool
export const RENDER_SCALE = Math.min(window.devicePixelRatio || 1, 2);
export const INITIAL_BASKET_SPEEDS = [20, 28.75, 30].map(toRenderPixels);
export const RANDOM_SPEEDS = [0, 37, 46, 60, 76, 90, 113, 136, 166, 187].map(toRenderPixels);

export const GAME_MODES = [
  {
    name: 'Chaat Bazaar',
    combination: 'Pani puri → Basket',
    playerTexture: 'panipuri',
    catcherTexture: 'basket',
    playerScale: 0.15 * RENDER_SCALE,
    catcherScale: 0.4 * RENDER_SCALE,
    landingRestOffsetY: toRenderPixels(-5),
    foregroundCropYRatio: 0.5,
    catchHorizontalInset: 0,
    minimumHorizontalOverlap: 0.72,
  },
  {
    name: 'Momo Mountain',
    combination: 'Momo → Steamer',
    playerTexture: 'momo',
    catcherTexture: 'steamer',
    playerScale: 0.14 * RENDER_SCALE,
    catcherScale: 0.4 * RENDER_SCALE,
    landingRestOffsetY: toRenderPixels(-4),
    foregroundCropYRatio: 0.48,
    catchHorizontalInset: toRenderPixels(6),
    minimumHorizontalOverlap: 1,
  },
  {
    name: 'Box Cat',
    combination: 'Cat → Cardboard box',
    playerTexture: 'cat',
    catcherTexture: 'box',
    playerScale: 0.13 * RENDER_SCALE,
    catcherScale: 0.38 * RENDER_SCALE,
    landingRestOffsetY: toRenderPixels(-3),
    foregroundCropYRatio: 0.48,
    catchHorizontalInset: toRenderPixels(6),
    minimumHorizontalOverlap: 1,
  },
] as const;

export const GAME_CONFIG = {
  CANVAS: {
    WIDTH: toRenderPixels(360),
    HEIGHT: toRenderPixels(640),
  },
  PLAYER: {
    JUMP_VELOCITY: toRenderPixels(-700),
    START_Y_OFFSET: 0.9,
    LANDING_DURATION: 240,
    LANDING_OVERSHOOT: 1.2,
  },
  BASKET: {
    CATCH_DEPTH: toRenderPixels(18),
    INITIAL_COUNT: 20,
    INCREMENT: 10,
    SPACING: toRenderPixels(180),
    START_Y: toRenderPixels(150),
  },
  GAME: {
    POINTS_PER_CATCH: 10,
    LEVEL_UP_THRESHOLD: 50,
    CAMERA_MOVE_DURATION: 280,
    CAMERA_RISE_SPEED: toRenderPixels(8),
    NEXT_BASKET_SCREEN_Y_RATIO: 0.38,
    MAX_FRAME_DELTA_MS: 32,
    FAST_RESTART_DELAY: 260,
  },
  RECEIVER: {
    FIRST_SPECIAL_BASKET: 6,
    SPECIAL_BASKET_INTERVAL: 3,
    SWIFT_MULTIPLIER: 1.65,
    NORMAL_DURATION_MS: 1300,
    WARNING_DURATION_MS: 550,
    ACTION_DURATION_MS: 550,
    RECOVERY_DURATION_MS: 600,
    MINIMUM_LANDING_CHANCES: 3,
    MIN_ACTIVE_SPEED: toRenderPixels(46),
    MIN_RELATIVE_SPEED: toRenderPixels(18),
    CAMERA_SPEED_REFERENCE: toRenderPixels(60),
    CUE_SIZE: toRenderPixels(42),
    VELOCITY_RESPONSE: 14,
  },
  PHYSICS: {
    GRAVITY_Y: toRenderPixels(1200),
  },
} as const;

function toRenderPixels(value: number) {
  return value * RENDER_SCALE;
}
