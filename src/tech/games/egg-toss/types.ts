export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'ENDING' | 'GAME_OVER';

export type BasketBehavior = 'STEADY' | 'SWIFT' | 'PAUSE' | 'REVERSE';

export type ReceiverPhase = 'NORMAL' | 'WARNING' | 'ACTION' | 'RECOVERY';

export type PlayerData = {
  sprite: Phaser.Physics.Arcade.Image;
  isJumping: boolean;
  canJump: boolean;
  flightElapsed: number;
  tumbleDirection: number;
};

export type BasketData = {
  sprite: Phaser.Physics.Arcade.Image;
  foregroundSprite: Phaser.GameObjects.Image;
  behaviorText: Phaser.GameObjects.Text;
  behaviorVisual: Phaser.GameObjects.Image;
  behaviorGuide: Phaser.GameObjects.Graphics;
  behaviorWalls: [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Rectangle];
  index: number;
  speed: number;
  currentSpeed: number;
  behavior: BasketBehavior;
  behaviorElapsed: number;
  behaviorPhase: ReceiverPhase;
  turnLaneLeft: number;
  turnLaneRight: number;
  restY: number;
};

export type GameStats = {
  score: number;
  level: number;
  basketsCaught: number;
};

export type GameTexts = {
  scoreText: Phaser.GameObjects.Text | null;
  bestText: Phaser.GameObjects.Text | null;
  progressText: Phaser.GameObjects.Text | null;
  messageText: Phaser.GameObjects.Text | null;
  audioText: Phaser.GameObjects.Text | null;
  motionText: Phaser.GameObjects.Text | null;
  rewardText: Phaser.GameObjects.Text | null;
  statusText: Phaser.GameObjects.Text | null;
  settingsText: Phaser.GameObjects.Text | null;
  modeLeftText: Phaser.GameObjects.Text | null;
  modeRightText: Phaser.GameObjects.Text | null;
};
