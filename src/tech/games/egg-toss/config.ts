export const BASKET_SPEEDS = [
  10, 15, 20, 0, 25, 30, 0, 40, 50, 0, 60, 75, 90, 0, 110, 125, 140, 0, 160, 180,
];

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
