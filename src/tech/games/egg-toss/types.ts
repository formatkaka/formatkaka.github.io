export type GameState = 'START' | 'PLAYING' | 'ENDING' | 'GAME_OVER';

export type BasketBehavior = 'STEADY' | 'SWIFT' | 'PAUSE' | 'REVERSE';

export type ReceiverPhase = 'NORMAL' | 'WARNING' | 'ACTION' | 'RECOVERY';

export type PlayerData = {
  sprite: Phaser.Physics.Arcade.Image;
  isJumping: boolean;
  canJump: boolean;
};

export type BasketData = {
  sprite: Phaser.Physics.Arcade.Image;
  foregroundSprite: Phaser.GameObjects.Image;
  behaviorText: Phaser.GameObjects.Text;
  behaviorVisual: Phaser.GameObjects.Image;
  index: number;
  speed: number;
  currentSpeed: number;
  behavior: BasketBehavior;
  behaviorElapsed: number;
  behaviorPhase: ReceiverPhase;
  behaviorCueX: number;
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
};
