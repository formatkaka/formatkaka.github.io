import Phaser from 'phaser';
import { GAME_CONFIG, INITIAL_BASKET_SPEEDS, RANDOM_SPEEDS } from './config';
import type { GameState, PlayerData, BasketData, GameStats, GameTexts } from './types';

class EggTossGame extends Phaser.Scene {
  private player: PlayerData | null = null;
  private baskets: BasketData[] = [];
  private gameState: GameState = 'START';
  private currentBasket: BasketData | null = null;
  private currentBasketIndex = -1;
  private isFalling = false;
  private stats: GameStats = {
    score: 0,
    lives: GAME_CONFIG.GAME.INITIAL_LIVES,
    level: 1,
    basketsCaught: 0,
  };
  private texts: GameTexts = {
    scoreText: null,
    livesText: null,
    levelText: null,
    messageText: null,
  };
  private ground: Phaser.Physics.Arcade.Image | null = null;
  private playerStartY = 0;

  preload() {
    const baseURL = window.location.origin;
    this.load.setBaseURL(baseURL);
    this.load.image('basket', 'assets/egg-toss-game/basket.png');
    this.load.image('pp', 'assets/egg-toss-game/panipuri.png');
    this.load.image('bg', 'assets/egg-toss-game/bg.jpg');
  }

  create() {
    this.setupBackground();
    this.setupPlayer();
    this.setupGround();
    this.setupBaskets();
    this.setupCamera();
    this.setupUI();
    this.setupControls();
    this.showStartScreen();
  }

  private setupCamera() {
    const { HEIGHT, WIDTH } = GAME_CONFIG.CANVAS;
    const lastBasketY = this.baskets[this.baskets.length - 1].sprite.y;

    const worldTop = lastBasketY - HEIGHT * 2;
    const worldBottom = this.playerStartY + HEIGHT;
    const worldHeight = worldBottom - worldTop;

    this.cameras.main.setBounds(0, worldTop, WIDTH, worldHeight);
    this.physics.world.setBounds(0, worldTop, WIDTH, worldHeight);

    const startCameraY = this.playerStartY - HEIGHT * 0.5;
    this.cameras.main.scrollY = startCameraY;
  }

  private updateCameraBounds() {
    const { HEIGHT, WIDTH } = GAME_CONFIG.CANVAS;
    const lastBasketY = this.baskets[this.baskets.length - 1].sprite.y;

    const worldTop = lastBasketY - HEIGHT * 2;
    const worldBottom = this.playerStartY + HEIGHT;
    const worldHeight = worldBottom - worldTop;

    this.cameras.main.setBounds(0, worldTop, WIDTH, worldHeight);
    this.physics.world.setBounds(0, worldTop, WIDTH, worldHeight);
  }

  update() {
    if (this.gameState === 'PLAYING') {
      this.updateBaskets();
      this.updatePlayerInBasket();
      this.checkPlayerLanding();
      this.keepPlayerInBounds();
    }
  }

  private updatePlayerInBasket() {
    if (!this.player || !this.currentBasket || this.player.isJumping) return;

    const { sprite } = this.player;
    const basketX = this.currentBasket.sprite.x;
    sprite.setX(basketX);
  }

  private setupBackground() {
    const { WIDTH, HEIGHT } = GAME_CONFIG.CANVAS;
    this.add
      .image(WIDTH / 2, HEIGHT / 2, 'bg')
      .setDisplaySize(WIDTH, HEIGHT)
      .setScrollFactor(0);
  }

  private setupPlayer() {
    const { WIDTH, HEIGHT } = GAME_CONFIG.CANVAS;
    const { SCALE } = GAME_CONFIG.PLAYER;

    this.playerStartY = HEIGHT * 0.9;

    const playerSprite = this.physics.add
      .image(WIDTH / 2, this.playerStartY, 'pp')
      .setScale(SCALE)
      .setCollideWorldBounds(false)
      .setScrollFactor(1);

    if (playerSprite.body && 'gravity' in playerSprite.body) {
      playerSprite.body.gravity.y = 0;
    }

    this.player = {
      sprite: playerSprite,
      isJumping: false,
      canJump: true,
    };
  }

  private setupGround() {
    const { WIDTH, HEIGHT } = GAME_CONFIG.CANVAS;
    const groundY = HEIGHT - 20;

    this.ground = this.physics.add
      .image(WIDTH / 2, groundY, 'basket')
      .setScale(10, 0.1)
      .setAlpha(0)
      .setImmovable(true);

    if (this.ground.body && 'gravity' in this.ground.body) {
      this.ground.body.gravity.y = 0;
    }
  }

  private setupBaskets() {
    const { INITIAL_COUNT } = GAME_CONFIG.BASKET;
    this.createBaskets(0, INITIAL_COUNT);
  }

  private createBaskets(startIndex: number, count: number) {
    const { WIDTH } = GAME_CONFIG.CANVAS;
    const { SPACING, SCALE } = GAME_CONFIG.BASKET;

    const basket0Y = this.playerStartY - 150;

    for (let i = 0; i < count; i++) {
      const index = startIndex + i;
      const yPos = basket0Y - index * SPACING;
      const speed = this.getBasketSpeed(index);
      const direction = speed === 0 ? 0 : Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

      const basketSprite = this.physics.add
        .image(WIDTH / 2, yPos, 'basket')
        .setScale(SCALE)
        .setImmovable(true)
        .setScrollFactor(1);

      if (basketSprite.body && 'gravity' in basketSprite.body) {
        basketSprite.body.gravity.y = 0;
      }

      const basketData: BasketData = {
        sprite: basketSprite,
        index,
        speed: speed * direction,
        initialX: WIDTH / 2,
      };

      this.baskets.push(basketData);
    }
  }

  private getBasketSpeed(index: number) {
    // First 3 baskets have fixed speeds, rest are randomized
    if (index < INITIAL_BASKET_SPEEDS.length) {
      return INITIAL_BASKET_SPEEDS[index];
    }
    // Random speed from the pool for remaining baskets
    const randomIndex = Phaser.Math.Between(0, RANDOM_SPEEDS.length - 1);
    return RANDOM_SPEEDS[randomIndex];
  }

  private setupUI() {
    const { WIDTH } = GAME_CONFIG.CANVAS;

    this.texts.scoreText = this.add
      .text(20, 20, `Score: ${this.stats.score}`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.texts.livesText = this.add
      .text(WIDTH - 20, 20, `Lives: ${this.stats.lives}`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.texts.levelText = this.add
      .text(WIDTH / 2, 20, `Basket: ${this.stats.basketsCaught}`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.texts.messageText = this.add
      .text(WIDTH / 2, GAME_CONFIG.CANVAS.HEIGHT / 2, '', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 15, y: 8 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);
  }

  private setupControls() {
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.gameState === 'START') {
        this.restartGame();
      } else if (this.gameState === 'GAME_OVER') {
        this.restartGame();
      } else if (this.gameState === 'PLAYING') {
        this.jump();
      }
    });
  }

  private jump() {
    if (!this.player || !this.player.canJump) return;

    const { sprite } = this.player;
    const { JUMP_VELOCITY } = GAME_CONFIG.PLAYER;

    if (sprite.body && 'gravity' in sprite.body) {
      sprite.body.gravity.y = GAME_CONFIG.PHYSICS.GRAVITY_Y;
    }

    sprite.setVelocityY(JUMP_VELOCITY);
    this.player.isJumping = true;
    this.player.canJump = false;
  }

  private updateBaskets() {
    const { WIDTH } = GAME_CONFIG.CANVAS;

    this.baskets.forEach((basket) => {
      const { sprite, speed } = basket;
      const currentX = sprite.x;
      const newX = currentX + speed * 0.016;

      if (newX < 0 || newX > WIDTH) {
        basket.speed = -speed;
      } else {
        sprite.setX(newX);
      }
    });
  }

  private checkPlayerLanding() {
    if (!this.player || !this.player.isJumping || this.isFalling) return;

    const { sprite } = this.player;

    if (sprite.body?.velocity.y && sprite.body.velocity.y > 0) {
      const landedInBasket = this.checkBasketCollision();

      if (landedInBasket) {
        this.handleSuccessfulCatch(landedInBasket);
      } else {
        const nextBasketIndex = this.currentBasketIndex + 1;
        const nextBasket = this.baskets[nextBasketIndex];
        const fallbackBasket = this.currentBasket || this.baskets[0];
        const referenceBasket = nextBasket || fallbackBasket;

        if (referenceBasket && sprite.y >= referenceBasket.sprite.y + 30) {
          this.startFalling();
        }
      }
    }
  }

  private startFalling() {
    if (!this.player || this.isFalling) return;

    this.isFalling = true;

    this.tweens.add({
      targets: this.player.sprite,
      alpha: 0.3,
      duration: 800,
      ease: 'Power2',
    });

    this.time.delayedCall(1000, () => {
      this.handleMissedCatch();
      this.isFalling = false;
    });
  }

  private checkBasketCollision() {
    if (!this.player) return null;

    const { sprite } = this.player;
    const playerBounds = sprite.getBounds();

    const nextBasketIndex = this.currentBasketIndex + 1;
    const nextBasket = this.baskets[nextBasketIndex];

    if (!nextBasket) return null;

    const basketBounds = nextBasket.sprite.getBounds();

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, basketBounds)) {
      return nextBasket;
    }

    return null;
  }

  private handleSuccessfulCatch(basket: BasketData) {
    if (!this.player) return;

    this.stats.score += GAME_CONFIG.GAME.POINTS_PER_CATCH * this.stats.level;
    this.stats.basketsCaught++;
    this.currentBasketIndex = basket.index;
    this.updateUI();
    this.checkLevelUp();

    // Add more baskets dynamically every 10 baskets
    if ((basket.index + 1) % 10 === 0) {
      const newBasketsStartIndex = this.baskets.length;
      this.createBaskets(newBasketsStartIndex, GAME_CONFIG.BASKET.INCREMENT);
      this.updateCameraBounds();
    }

    this.currentBasket = basket;
    this.player.sprite.setY(basket.sprite.y - 10);
    this.player.sprite.setVelocity(0, 0);
    this.player.sprite.setAlpha(1);

    if (this.player.sprite.body && 'gravity' in this.player.sprite.body) {
      this.player.sprite.body.gravity.y = 0;
    }

    this.player.isJumping = false;
    this.player.canJump = false;

    this.showFeedback(`+${GAME_CONFIG.GAME.POINTS_PER_CATCH * this.stats.level}`, '#00ff00');

    const nextBasket = this.baskets[basket.index + 1];
    if (nextBasket) {
      const targetCameraY = nextBasket.sprite.y - GAME_CONFIG.CANVAS.HEIGHT * 0.6;

      this.tweens.add({
        targets: this.cameras.main,
        scrollY: targetCameraY,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          if (this.player) {
            this.player.canJump = true;
          }
        },
      });
    } else {
      this.player.canJump = true;
    }
  }

  private handleMissedCatch() {
    if (!this.player) return;

    this.stats.lives -= 1;
    this.updateUI();

    if (this.stats.lives <= 0) {
      this.gameOver();
    } else {
      this.restartFromCurrentBasket();
      this.showFeedback('-1 Life', '#ff0000');
    }
  }

  private restartFromCurrentBasket() {
    if (!this.player) return;

    const basket = this.baskets[this.currentBasketIndex];
    if (!basket) {
      this.resetPlayer();
      return;
    }

    this.currentBasket = basket;
    this.player.sprite.setY(basket.sprite.y - 10);
    this.player.sprite.setX(basket.sprite.x);
    this.player.sprite.setVelocity(0, 0);
    this.player.sprite.setAlpha(1);

    if (this.player.sprite.body && 'gravity' in this.player.sprite.body) {
      this.player.sprite.body.gravity.y = 0;
    }

    this.player.isJumping = false;
    this.player.canJump = true;

    const targetCameraY = basket.sprite.y - GAME_CONFIG.CANVAS.HEIGHT * 0.9;
    this.cameras.main.scrollY = targetCameraY;
  }

  private resetPlayer() {
    if (!this.player) return;

    this.currentBasket = null;
    this.currentBasketIndex = -1;
    this.isFalling = false;

    const { sprite } = this.player;

    sprite.setY(this.playerStartY);
    sprite.setX(GAME_CONFIG.CANVAS.WIDTH / 2);
    sprite.setVelocity(0, 0);
    sprite.setAlpha(1);

    if (sprite.body && 'gravity' in sprite.body) {
      sprite.body.gravity.y = 0;
    }

    this.player.isJumping = false;
    this.player.canJump = true;
  }

  private keepPlayerInBounds() {
    if (!this.player) return;

    const { sprite } = this.player;
    const { WIDTH } = GAME_CONFIG.CANVAS;

    if (sprite.x < 0) sprite.setX(0);
    if (sprite.x > WIDTH) sprite.setX(WIDTH);
  }

  private checkLevelUp() {
    const newLevel = Math.floor(this.stats.score / GAME_CONFIG.GAME.LEVEL_UP_THRESHOLD) + 1;

    if (newLevel > this.stats.level) {
      this.stats.level = newLevel;
      this.showFeedback(`Level ${this.stats.level}!`, '#ffff00');
    }
  }

  private showFeedback(message: string, color = '#ffffff') {
    if (!this.texts.messageText) return;

    this.texts.messageText.setStyle({ color }).setText(message).setVisible(true);

    this.time.delayedCall(800, () => {
      this.texts.messageText?.setVisible(false);
    });
  }

  private updateUI() {
    this.texts.scoreText?.setText(`Score: ${this.stats.score}`);
    this.texts.livesText?.setText(`Lives: ${this.stats.lives}`);
    this.texts.levelText?.setText(`Basket: ${this.stats.basketsCaught}`);
  }

  private showStartScreen() {
    this.gameState = 'START';

    if (!this.texts.messageText) return;

    this.texts.messageText
      .setStyle({ color: '#ffffff' })
      .setText('EGG TOSS GAME\n\nPress SPACE to Jump\nLand in Baskets!\n\nPress SPACE to Start')
      .setVisible(true);
  }

  private startGame() {
    this.gameState = 'PLAYING';
    this.texts.messageText?.setVisible(false);
  }

  private gameOver() {
    this.gameState = 'GAME_OVER';

    if (!this.texts.messageText) return;

    this.texts.messageText
      .setStyle({ color: '#ffffff' })
      .setText(
        `GAME OVER!\n\n` +
          `Score: ${this.stats.score}\n` +
          `Baskets Caught: ${this.stats.basketsCaught}\n\n` +
          `Press SPACE to Restart`
      )
      .setVisible(true);
  }

  private restartGame() {
    this.stats = {
      score: 0,
      lives: GAME_CONFIG.GAME.INITIAL_LIVES,
      level: 1,
      basketsCaught: 0,
    };
    this.currentBasket = null;
    this.currentBasketIndex = -1;
    this.isFalling = false;
    this.updateUI();
    this.resetAllBaskets();
    this.resetCamera();
    this.resetPlayer();
    this.startGame();
  }

  private resetAllBaskets() {
    const { WIDTH } = GAME_CONFIG.CANVAS;
    const { SPACING } = GAME_CONFIG.BASKET;

    const basket0Y = this.playerStartY - 150;

    this.baskets.forEach((basket, index) => {
      const yPos = basket0Y - index * SPACING;
      basket.sprite.setY(yPos);
      basket.sprite.setX(WIDTH / 2);
      basket.initialX = WIDTH / 2;

      const speed = this.getBasketSpeed(index);
      const direction = speed === 0 ? 0 : Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      basket.speed = speed * direction;
    });
  }

  private resetCamera() {
    const { HEIGHT } = GAME_CONFIG.CANVAS;
    const startCameraY = this.playerStartY - 0.9 * HEIGHT;
    this.cameras.main.scrollY = startCameraY;
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.CANVAS.WIDTH,
  height: GAME_CONFIG.CANVAS.HEIGHT,
  scene: EggTossGame,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
