// First 3 baskets have fixed speeds, rest are randomized from RANDOM_SPEEDS pool
export const RENDER_SCALE = Math.min(window.devicePixelRatio || 1, 2);
export const INITIAL_BASKET_SPEEDS = [20, 28.75, 30].map(toRenderPixels);
export const RANDOM_SPEEDS = [0, 37, 46, 60, 76, 90, 113, 136, 166, 187].map(toRenderPixels);

export const GAME_MODES = [
  {
    name: 'Chaat Bazaar',
    combination: 'Pani puri → Leaf basket',
    playerTexture: 'chaat-object',
    catcherTexture: 'chaat-basket',
    backgroundTexture: 'bg-chaat',
    playerScale: 0.055 * RENDER_SCALE,
    catcherScale: 0.1 * RENDER_SCALE,
    landingRestOffsetY: toRenderPixels(-7),
    foregroundCropYRatio: 0.5,
    catchHorizontalInset: toRenderPixels(14),
    minimumHorizontalOverlap: 0.82,
    accentColor: 0xffc857,
    accentHex: '#ffc857',
    ambience: 'market',
  },
  {
    name: 'Turkish Sweet Shop',
    combination: 'Baklava → Pastry box',
    playerTexture: 'turkey-object',
    catcherTexture: 'turkey-basket',
    backgroundTexture: 'bg-turkey',
    playerScale: 0.055 * RENDER_SCALE,
    catcherScale: 0.13 * RENDER_SCALE,
    landingRestOffsetY: toRenderPixels(-8),
    foregroundCropYRatio: 0.48,
    catchHorizontalInset: toRenderPixels(12),
    minimumHorizontalOverlap: 0.84,
    accentColor: 0x7ed6c5,
    accentHex: '#7ed6c5',
    ambience: 'sweet-shop',
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
    TAKEOFF_DURATION: 90,
    FLIGHT_STRETCH_X: 0.94,
    FLIGHT_STRETCH_Y: 1.08,
    TUMBLE_SPEED: 82,
    LANDING_DURATION: 170,
    LANDING_HORIZONTAL_RESPONSE: 15,
    LANDING_SQUASH_X: 1.12,
    LANDING_SQUASH_Y: 0.82,
    MISS_DURATION: 460,
    MISS_FADE_DELAY: 150,
    MISS_SPIN_SPEED: 240,
  },
  BASKET: {
    CATCH_DEPTH: toRenderPixels(18),
    INITIAL_COUNT: 20,
    INCREMENT: 10,
    SPACING: toRenderPixels(180),
    START_Y: toRenderPixels(150),
    IMPACT_DURATION: 140,
    EDGE_TILT: 3,
  },
  GAME: {
    POINTS_PER_CATCH: 10,
    LEVEL_UP_THRESHOLD: 50,
    CAMERA_MOVE_DURATION: 280,
    CAMERA_RISE_SPEED: toRenderPixels(8),
    CAMERA_FOLLOW_RESPONSE: 7,
    NEXT_BASKET_SCREEN_Y_RATIO: 0.38,
    MAX_FRAME_DELTA_MS: 32,
    REWARD_DURATION: 450,
    STATUS_DURATION: 760,
    PAUSE_LABEL: 'PAUSED',
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
    TURN_LANE_WIDTH: toRenderPixels(250),
    TURN_WALL_INSET: toRenderPixels(8),
    TURN_WARNING_DISTANCE: toRenderPixels(52),
    FIRST_PREVIEW_DURATION_MS: 800,
  },
  FEEDBACK: {
    PARTICLE_POOL_SIZE: 24,
    TAKEOFF_PARTICLES: 4,
    LANDING_PARTICLES: 9,
    PARTICLE_DISTANCE: toRenderPixels(34),
    PARTICLE_DURATION: 280,
  },
  PHYSICS: {
    GRAVITY_Y: toRenderPixels(1200),
  },
} as const;

function toRenderPixels(value: number) {
  return value * RENDER_SCALE;
}
