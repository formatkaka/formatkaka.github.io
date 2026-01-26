// First 3 baskets have fixed speeds, rest are randomized from RANDOM_SPEEDS pool
export const INITIAL_BASKET_SPEEDS = [16, 23, 30];
export const RANDOM_SPEEDS = [0, 37, 46, 60, 76, 90, 113, 136, 166, 187];

export const GAME_CONFIG = {
  CANVAS: {
    WIDTH: 360,
    HEIGHT: 640,
  },
  PLAYER: {
    SCALE: 0.15,
    JUMP_VELOCITY: -700,
    START_Y_OFFSET: 0.9,
  },
  BASKET: {
    SCALE: 0.4,
    VISIBLE_COUNT: 3,
    INITIAL_COUNT: 20,
    INCREMENT: 10,
    SPACING: 180,
    START_Y: 150,
  },
  GAME: {
    INITIAL_LIVES: 3,
    POINTS_PER_CATCH: 10,
    LEVEL_UP_THRESHOLD: 50,
    CAMERA_SCROLL_SPEED: 0.3,
  },
  PHYSICS: {
    GRAVITY_Y: 1200,
  },
} as const;
