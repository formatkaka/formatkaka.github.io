export type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

export type PlayerData = {
  sprite: Phaser.Physics.Arcade.Image;
  isJumping: boolean;
  canJump: boolean;
};

export type BasketData = {
  sprite: Phaser.Physics.Arcade.Image;
  index: number;
  speed: number;
  initialX: number;
};

export type GameStats = {
  score: number;
  lives: number;
  level: number;
  basketsCaught: number;
};

export type GameTexts = {
  scoreText: Phaser.GameObjects.Text | null;
  livesText: Phaser.GameObjects.Text | null;
  levelText: Phaser.GameObjects.Text | null;
  messageText: Phaser.GameObjects.Text | null;
};
