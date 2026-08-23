import Phaser from 'phaser';
import {
  GAME_CONFIG,
  GAME_MODES,
  INITIAL_BASKET_SPEEDS,
  RANDOM_SPEEDS,
  RENDER_SCALE,
} from './config';
import { GameAudio } from './audio';
import type {
  BasketBehavior,
  BasketData,
  GameState,
  GameStats,
  GameTexts,
  PlayerData,
  ReceiverPhase,
} from './types';

class EggTossGame extends Phaser.Scene {
  private player: PlayerData | null = null;
  private baskets: BasketData[] = [];
  private gameState: GameState = 'START';
  private currentBasket: BasketData | null = null;
  private currentBasketIndex = -1;
  private isFalling = false;
  private isSettling = false;
  private selectedModeIndex = 0;
  private bestBaskets = this.loadBestBaskets();
  private bestMarker: Phaser.GameObjects.Text | null = null;
  private feedbackTimer: Phaser.Time.TimerEvent | null = null;
  private audio = new GameAudio();
  private cameraRiseSpeed = GAME_CONFIG.GAME.CAMERA_RISE_SPEED;
  private cameraRiseTargetSpeed = GAME_CONFIG.GAME.CAMERA_RISE_SPEED;
  private stats: GameStats = {
    score: 0,
    level: 1,
    basketsCaught: 0,
  };
  private texts: GameTexts = {
    scoreText: null,
    bestText: null,
    progressText: null,
    messageText: null,
    audioText: null,
  };
  private playerStartY = 0;

  preload() {
    const baseURL = window.location.origin;
    this.load.setBaseURL(baseURL);
    this.load.image('basket', 'assets/egg-toss-game/basket.png');
    this.load.image('panipuri', 'assets/egg-toss-game/panipuri.png');
    this.load.image('momo', 'assets/egg-toss-game/momo.png');
    this.load.image('steamer', 'assets/egg-toss-game/steamer.png');
    this.load.image('cat', 'assets/egg-toss-game/cat.png');
    this.load.image('box', 'assets/egg-toss-game/box.png');
    this.load.image('cue-wind', 'assets/egg-toss-game/cue-wind.svg');
    this.load.image('cue-pause', 'assets/egg-toss-game/cue-pause.svg');
    this.load.image('cue-turn', 'assets/egg-toss-game/cue-turn.svg');
    this.load.image('bg', 'assets/egg-toss-game/bg.jpg');
  }

  create() {
    this.setupBackground();
    this.setupPlayer();
    this.setupBaskets();
    this.setupCamera();
    this.setupUI();
    this.setupBestMarker();
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

  update(_time: number, delta: number) {
    if (this.gameState === 'PLAYING') {
      this.updateBaskets(delta);
      this.updatePlayerInBasket();
      this.checkPlayerLanding();
      this.keepPlayerInBounds();
      this.updateRisingDanger(delta);
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
    const { START_Y_OFFSET } = GAME_CONFIG.PLAYER;
    const mode = this.getSelectedMode();

    this.playerStartY = HEIGHT * START_Y_OFFSET;

    const playerSprite = this.physics.add
      .image(WIDTH / 2, this.playerStartY, mode.playerTexture)
      .setScale(mode.playerScale)
      .setCollideWorldBounds(false)
      .setScrollFactor(1)
      .setDepth(2);

    if (playerSprite.body && 'gravity' in playerSprite.body) {
      playerSprite.body.gravity.y = 0;
    }

    this.player = {
      sprite: playerSprite,
      isJumping: false,
      canJump: true,
    };
  }

  private setupBaskets() {
    const { INITIAL_COUNT } = GAME_CONFIG.BASKET;
    this.createBaskets(0, INITIAL_COUNT);
  }

  private createBaskets(startIndex: number, count: number) {
    const { WIDTH } = GAME_CONFIG.CANVAS;
    const { SPACING, START_Y } = GAME_CONFIG.BASKET;
    const mode = this.getSelectedMode();

    const basket0Y = this.playerStartY - START_Y;

    for (let i = 0; i < count; i++) {
      const index = startIndex + i;
      const yPos = basket0Y - index * SPACING;
      const behavior = this.getBasketBehavior(index);
      const speed = this.getBasketSpeed(index);
      const direction = speed === 0 ? 0 : Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

      const basketSprite = this.physics.add
        .image(WIDTH / 2, yPos, mode.catcherTexture)
        .setScale(mode.catcherScale)
        .setImmovable(true)
        .setScrollFactor(1)
        .setDepth(1);

      const foregroundSprite = this.add
        .image(WIDTH / 2, yPos, mode.catcherTexture)
        .setScale(mode.catcherScale)
        .setScrollFactor(1)
        .setDepth(3);
      this.cropCatcherForeground(foregroundSprite);
      const behaviorText = this.createBehaviorText(WIDTH / 2, yPos, behavior);
      const behaviorVisual = this.createBehaviorVisual(WIDTH / 2, yPos, behavior);

      if (basketSprite.body && 'gravity' in basketSprite.body) {
        basketSprite.body.gravity.y = 0;
      }

      const basketData: BasketData = {
        sprite: basketSprite,
        foregroundSprite,
        behaviorText,
        behaviorVisual,
        index,
        speed: speed * direction,
        currentSpeed: speed * direction,
        behavior,
        behaviorElapsed: 0,
        behaviorPhase: 'NORMAL',
        behaviorCueX: WIDTH / 2,
      };

      this.syncBasketVisuals(basketData);
      this.baskets.push(basketData);
    }
  }

  private getBasketSpeed(index: number) {
    return this.getBaseBasketSpeed(index);
  }

  private getBaseBasketSpeed(index: number) {
    // First 3 baskets have fixed speeds, rest are randomized
    if (index < INITIAL_BASKET_SPEEDS.length) {
      return INITIAL_BASKET_SPEEDS[index];
    }
    // Random speed from the pool for remaining baskets
    const randomIndex = Phaser.Math.Between(0, RANDOM_SPEEDS.length - 1);
    return RANDOM_SPEEDS[randomIndex];
  }

  private getBasketBehavior(index: number): BasketBehavior {
    const { FIRST_SPECIAL_BASKET, SPECIAL_BASKET_INTERVAL } = GAME_CONFIG.RECEIVER;
    const basketNumber = index + 1;
    const isSpecial =
      basketNumber >= FIRST_SPECIAL_BASKET &&
      (basketNumber - FIRST_SPECIAL_BASKET) % SPECIAL_BASKET_INTERVAL === 0;
    if (!isSpecial) return 'STEADY';

    const specialBehaviors: BasketBehavior[] = ['SWIFT', 'PAUSE', 'REVERSE'];
    const specialIndex = (basketNumber - FIRST_SPECIAL_BASKET) / SPECIAL_BASKET_INTERVAL;
    return specialBehaviors[specialIndex % specialBehaviors.length];
  }

  private createBehaviorVisual(x: number, y: number, behavior: BasketBehavior) {
    return this.add.image(x, y, this.getBehaviorTexture(behavior)).setDepth(4).setVisible(false);
  }

  private getBehaviorTexture(behavior: BasketBehavior) {
    return {
      PAUSE: 'cue-pause',
      REVERSE: 'cue-turn',
      STEADY: 'cue-wind',
      SWIFT: 'cue-wind',
    }[behavior];
  }

  private createBehaviorText(x: number, y: number, behavior: BasketBehavior) {
    const text = this.add.text(x, y, '', this.getBehaviorTextStyle(behavior));
    text.setOrigin(0.5).setScrollFactor(1).setDepth(4).setVisible(false);
    this.updateBehaviorText(text, behavior, 'NORMAL', 0);
    return text;
  }

  private getBehaviorTextStyle(behavior: BasketBehavior) {
    return {
      fontSize: `${toRenderPixels(11)}px`,
      color: this.getBehaviorColor(behavior),
      backgroundColor: '#000000',
      padding: { x: toRenderPixels(4), y: toRenderPixels(2) },
    };
  }

  private getBehaviorColor(behavior: BasketBehavior) {
    return { STEADY: '#ffffff', SWIFT: '#ffb347', PAUSE: '#ff8dc7', REVERSE: '#7ee5ff' }[behavior];
  }

  private updateBehaviorText(
    text: Phaser.GameObjects.Text,
    behavior: BasketBehavior,
    phase: ReceiverPhase,
    speed: number
  ) {
    const label = this.getBehaviorLabel(behavior, phase, speed);
    text.setText(label).setStyle({ color: this.getBehaviorColor(behavior) });
  }

  private getBehaviorLabel(behavior: BasketBehavior, phase: ReceiverPhase, speed: number) {
    if (behavior === 'STEADY') return 'SAFE';
    if (behavior === 'SWIFT') return this.getSwiftLabel(phase);
    if (behavior === 'PAUSE') return this.getPauseLabel(phase);
    return phase === 'WARNING' ? `TURN ${speed >= 0 ? '←' : '→'}` : this.getTurnLabel(phase);
  }

  private getSwiftLabel(phase: ReceiverPhase) {
    return { NORMAL: 'QUICK', WARNING: 'WIND UP', ACTION: 'RUSH!', RECOVERY: 'EASING' }[phase];
  }

  private getPauseLabel(phase: ReceiverPhase) {
    return { NORMAL: 'PAUSES', WARNING: 'SLOWING', ACTION: 'PAUSED', RECOVERY: 'MOVING' }[phase];
  }

  private getTurnLabel(phase: ReceiverPhase) {
    return { NORMAL: 'TURNS', WARNING: 'TURNING', ACTION: 'TURNED', RECOVERY: 'STEADY' }[phase];
  }

  private setupUI() {
    const { WIDTH } = GAME_CONFIG.CANVAS;

    this.texts.scoreText = this.add
      .text(toRenderPixels(12), toRenderPixels(12), `Score: ${this.stats.score}`, {
        fontSize: `${toRenderPixels(16)}px`,
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: toRenderPixels(6), y: toRenderPixels(4) },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.texts.bestText = this.add
      .text(WIDTH - toRenderPixels(12), toRenderPixels(12), `Best: ${this.bestBaskets}`, {
        fontSize: `${toRenderPixels(16)}px`,
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: toRenderPixels(6), y: toRenderPixels(4) },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.texts.audioText = this.add
      .text(WIDTH - toRenderPixels(12), toRenderPixels(92), 'SFX: ON', {
        fontSize: `${toRenderPixels(14)}px`,
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: toRenderPixels(6), y: toRenderPixels(4) },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.texts.progressText = this.add
      .text(WIDTH / 2, toRenderPixels(48), this.getProgressText(), {
        fontSize: `${toRenderPixels(16)}px`,
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: toRenderPixels(6), y: toRenderPixels(4) },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.texts.messageText = this.add
      .text(WIDTH / 2, GAME_CONFIG.CANVAS.HEIGHT / 2, '', {
        fontSize: `${toRenderPixels(24)}px`,
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: toRenderPixels(15), y: toRenderPixels(8) },
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);
  }

  private setupControls() {
    this.input.keyboard?.on('keydown-SPACE', () => this.handlePrimaryAction());
    this.input.keyboard?.on('keydown-LEFT', () => this.changeMode(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.changeMode(1));
    this.input.keyboard?.on('keydown-M', () => this.toggleAudio());
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) =>
      this.handlePointerAction(pointer)
    );
  }

  private handlePointerAction(pointer: Phaser.Input.Pointer) {
    if (this.isAudioToggle(pointer)) {
      this.toggleAudio();
      return;
    }

    if (this.gameState === 'PLAYING') {
      this.jump();
      return;
    }

    const selectionEdge = GAME_CONFIG.CANVAS.WIDTH * 0.3;
    if (pointer.x < selectionEdge) this.changeMode(-1);
    else if (pointer.x > GAME_CONFIG.CANVAS.WIDTH - selectionEdge) this.changeMode(1);
    else this.handlePrimaryAction();
  }

  private handlePrimaryAction() {
    this.audio.unlock();

    if (this.gameState === 'START' || this.gameState === 'GAME_OVER') {
      this.restartGame();
      return;
    }

    this.jump();
  }

  private changeMode(direction: number) {
    if (this.gameState === 'PLAYING' || this.gameState === 'ENDING') return;

    this.selectedModeIndex = Phaser.Math.Wrap(
      this.selectedModeIndex + direction,
      0,
      GAME_MODES.length
    );
    this.resetGameState();
    this.applySelectedMode();
    this.showStartScreen();
  }

  private applySelectedMode() {
    const mode = this.getSelectedMode();
    this.player?.sprite.setTexture(mode.playerTexture).setScale(mode.playerScale);
    this.baskets.forEach(({ sprite, foregroundSprite }) => {
      sprite.setTexture(mode.catcherTexture).setScale(mode.catcherScale);
      foregroundSprite.setTexture(mode.catcherTexture).setScale(mode.catcherScale);
      this.cropCatcherForeground(foregroundSprite);
    });
  }

  private cropCatcherForeground(sprite: Phaser.GameObjects.Image) {
    const { foregroundCropYRatio } = this.getSelectedMode();
    const cropY = sprite.height * foregroundCropYRatio;
    sprite.setCrop(0, cropY, sprite.width, sprite.height - cropY);
  }

  private getSelectedMode() {
    return GAME_MODES[this.selectedModeIndex];
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
    this.audio.jump();
  }

  private updateBaskets(delta: number) {
    const { WIDTH } = GAME_CONFIG.CANVAS;
    const deltaSeconds = Math.min(delta, GAME_CONFIG.GAME.MAX_FRAME_DELTA_MS) / 1000;

    this.baskets.forEach((basket) => {
      const { sprite } = basket;
      const halfWidth = sprite.displayWidth / 2;
      const minX = halfWidth;
      const maxX = WIDTH - halfWidth;
      this.moveBasket(basket, this.getBasketMovementSpeed(basket, delta), minX, maxX, deltaSeconds);
      this.syncBasketVisuals(basket);
    });
  }

  private getBasketMovementSpeed(basket: BasketData, delta: number) {
    if (basket.index !== this.currentBasketIndex + 1) return basket.speed;

    basket.behaviorElapsed += delta;
    const phase =
      basket.behavior === 'STEADY' ? 'NORMAL' : this.getBehaviorPhase(basket.behaviorElapsed);
    this.applyBehaviorPhase(basket, phase);
    return this.getBehaviorTargetSpeed(basket);
  }

  private getBehaviorPhase(elapsed: number): ReceiverPhase {
    const { NORMAL_DURATION_MS, WARNING_DURATION_MS, ACTION_DURATION_MS, RECOVERY_DURATION_MS } =
      GAME_CONFIG.RECEIVER;
    const cycleDuration =
      NORMAL_DURATION_MS + WARNING_DURATION_MS + ACTION_DURATION_MS + RECOVERY_DURATION_MS;
    const cycleTime = elapsed % cycleDuration;

    if (cycleTime < NORMAL_DURATION_MS) return 'NORMAL';
    if (cycleTime < NORMAL_DURATION_MS + WARNING_DURATION_MS) return 'WARNING';
    if (cycleTime < NORMAL_DURATION_MS + WARNING_DURATION_MS + ACTION_DURATION_MS) return 'ACTION';
    return 'RECOVERY';
  }

  private applyBehaviorPhase(basket: BasketData, phase: ReceiverPhase) {
    if (basket.behaviorPhase === phase) return;

    if (basket.behavior === 'REVERSE' && phase === 'ACTION') basket.speed *= -1;
    basket.behaviorPhase = phase;
    this.updateBehaviorText(basket.behaviorText, basket.behavior, phase, basket.speed);
    if (phase === 'WARNING') this.showBehaviorForecast(basket);
    if (phase === 'ACTION') this.showBehaviorAction(basket);
  }

  private showBehaviorForecast(basket: BasketData) {
    if (basket.index !== this.currentBasketIndex + 1) return;

    if (basket.behavior === 'REVERSE') this.positionTurnCue(basket);
    this.audio.receiverWarning(basket.behavior);
  }

  private positionTurnCue(basket: BasketData) {
    const direction = Math.sign(basket.currentSpeed || basket.speed || 1);
    const offset = basket.sprite.displayWidth / 2 + toRenderPixels(12);
    basket.behaviorCueX = Phaser.Math.Clamp(
      basket.sprite.x + direction * offset,
      toRenderPixels(24),
      GAME_CONFIG.CANVAS.WIDTH - toRenderPixels(24)
    );
  }

  private showBehaviorAction(basket: BasketData) {
    if (basket.index !== this.currentBasketIndex + 1) return;
    this.audio.receiverAction(basket.behavior);
  }

  private getBehaviorTargetSpeed(basket: BasketData) {
    const { behavior, behaviorPhase, speed } = basket;
    if (behavior === 'STEADY' || behaviorPhase === 'NORMAL') return speed;
    if (behaviorPhase === 'WARNING') return speed * 0.35;
    if (behaviorPhase === 'RECOVERY') return speed * 0.7;
    if (behavior === 'PAUSE') return 0;
    return behavior === 'SWIFT' ? speed * GAME_CONFIG.RECEIVER.SWIFT_MULTIPLIER : speed;
  }

  private moveBasket(
    basket: BasketData,
    targetSpeed: number,
    minX: number,
    maxX: number,
    deltaSeconds: number
  ) {
    const speed = this.getSmoothedBasketSpeed(basket, targetSpeed, deltaSeconds);
    const newX = basket.sprite.x + speed * deltaSeconds;
    if (newX >= minX && newX <= maxX) return basket.sprite.setX(newX);

    basket.currentSpeed *= -0.35;
    basket.speed *= -1;
    basket.sprite.setX(Phaser.Math.Clamp(newX, minX, maxX));
  }

  private getSmoothedBasketSpeed(basket: BasketData, targetSpeed: number, deltaSeconds: number) {
    const { VELOCITY_RESPONSE } = GAME_CONFIG.RECEIVER;
    const blend = 1 - Math.exp(-VELOCITY_RESPONSE * deltaSeconds);
    basket.currentSpeed = Phaser.Math.Linear(basket.currentSpeed, targetSpeed, blend);
    return basket.currentSpeed;
  }

  private syncBasketVisuals(basket: BasketData) {
    const { sprite, foregroundSprite, behaviorText } = basket;
    foregroundSprite.setX(sprite.x);
    behaviorText.setPosition(sprite.x, sprite.y - sprite.displayHeight / 2 - toRenderPixels(16));
    this.syncBehaviorVisual(basket);
  }

  private syncBehaviorVisual(basket: BasketData) {
    const isActive = basket.index === this.currentBasketIndex + 1;
    const isVisible = isActive && basket.behavior !== 'STEADY';
    basket.behaviorVisual.setVisible(isVisible);
    if (!isVisible) return;

    const { x, y } = this.getBehaviorVisualPosition(basket);
    const pulse = this.getBehaviorVisualPulse(basket);
    const size = GAME_CONFIG.RECEIVER.CUE_SIZE * pulse;
    basket.behaviorVisual
      .setPosition(x, y)
      .setDisplaySize(size, size)
      .setAlpha(basket.behaviorPhase === 'NORMAL' ? 0.62 : 1);
  }

  private getBehaviorVisualPosition(basket: BasketData) {
    const { sprite, behavior, currentSpeed, behaviorCueX } = basket;
    const direction = Math.sign(currentSpeed || basket.speed || 1);
    const sideOffset = sprite.displayWidth / 2 + toRenderPixels(24);
    if (behavior === 'SWIFT') return { x: sprite.x - direction * sideOffset, y: sprite.y };
    if (behavior === 'REVERSE') {
      const x =
        basket.behaviorPhase === 'NORMAL' ? sprite.x + direction * sideOffset : behaviorCueX;
      return { x, y: sprite.y };
    }
    return { x: sprite.x, y: sprite.y - sprite.displayHeight / 2 - toRenderPixels(28) };
  }

  private getBehaviorVisualPulse(basket: BasketData) {
    if (basket.behaviorPhase !== 'WARNING') return 1;
    return 1 + Math.sin(basket.behaviorElapsed / 65) * 0.08;
  }

  private updateRisingDanger(delta: number) {
    if (!this.isRisingDangerActive()) return;

    const cappedDelta = Math.min(delta, GAME_CONFIG.GAME.MAX_FRAME_DELTA_MS);
    this.updateCameraRiseSpeed(cappedDelta);
    this.cameras.main.scrollY -= (this.cameraRiseSpeed * cappedDelta) / 1000;
    if (this.hasPlayerLeftViewport()) this.endRun('LEFT BEHIND!');
  }

  private updateCameraRiseSpeed(delta: number) {
    const response = 1 - Math.exp((-3 * delta) / 1000);
    this.cameraRiseSpeed = Phaser.Math.Linear(
      this.cameraRiseSpeed,
      this.cameraRiseTargetSpeed,
      response
    );
  }

  private isRisingDangerActive() {
    return Boolean(this.stats.basketsCaught > 0 && this.player && !this.isFalling);
  }

  private hasPlayerLeftViewport() {
    if (!this.player) return false;

    const viewportBottom = this.cameras.main.scrollY + GAME_CONFIG.CANVAS.HEIGHT;
    return this.player.sprite.getBounds().top >= viewportBottom;
  }

  private isAudioToggle(pointer: Phaser.Input.Pointer) {
    const bounds = this.texts.audioText?.getBounds();
    return Boolean(bounds?.contains(pointer.x, pointer.y));
  }

  private toggleAudio() {
    this.audio.unlock();
    const enabled = this.audio.toggle();
    this.texts.audioText?.setText(enabled ? 'SFX: ON' : 'SFX: OFF');
    if (enabled) this.audio.catch();
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
    this.endRun('MISS!');
  }

  private checkBasketCollision() {
    if (!this.player) return null;

    const { sprite } = this.player;
    const playerBounds = sprite.getBounds();

    const nextBasketIndex = this.currentBasketIndex + 1;
    const nextBasket = this.baskets[nextBasketIndex];

    if (!nextBasket) return null;

    const basketBounds = nextBasket.sprite.getBounds();

    if (this.isInsideBasketOpening(playerBounds, basketBounds)) {
      return nextBasket;
    }

    return null;
  }

  private isInsideBasketOpening(
    playerBounds: Phaser.Geom.Rectangle,
    basketBounds: Phaser.Geom.Rectangle
  ) {
    const { CATCH_DEPTH } = GAME_CONFIG.BASKET;
    const { catchHorizontalInset, minimumHorizontalOverlap } = this.getSelectedMode();
    const catchLeft = basketBounds.left + catchHorizontalInset;
    const catchRight = basketBounds.right - catchHorizontalInset;
    const catchBottom = basketBounds.top + CATCH_DEPTH;

    const overlapLeft = Math.max(playerBounds.left, catchLeft);
    const overlapRight = Math.min(playerBounds.right, catchRight);
    const overlapWidth = Math.max(0, overlapRight - overlapLeft);
    const isHorizontallySupported = overlapWidth >= playerBounds.width * minimumHorizontalOverlap;
    const isCrossingRim =
      playerBounds.bottom >= basketBounds.top && playerBounds.top <= catchBottom;

    return isHorizontallySupported && isCrossingRim;
  }

  private handleSuccessfulCatch(basket: BasketData) {
    if (!this.player) return;

    const pointsAwarded = GAME_CONFIG.GAME.POINTS_PER_CATCH * this.stats.level;
    this.stats.score += pointsAwarded;
    this.stats.basketsCaught++;
    this.currentBasketIndex = basket.index;
    const newLevel = this.updateLevel();
    const isNewBest = this.updateBestBaskets();
    this.updateUI();

    // Add more baskets dynamically every 10 baskets
    if ((basket.index + 1) % 10 === 0) {
      const newBasketsStartIndex = this.baskets.length;
      this.createBaskets(newBasketsStartIndex, GAME_CONFIG.BASKET.INCREMENT);
      this.updateCameraBounds();
    }

    this.currentBasket = basket;
    this.player.sprite.setVelocity(0, 0);
    this.player.sprite.setAlpha(1);

    if (this.player.sprite.body && 'gravity' in this.player.sprite.body) {
      this.player.sprite.body.gravity.y = 0;
    }

    this.player.isJumping = false;
    this.player.canJump = false;

    this.audio.catch();
    this.showCatchFeedback(pointsAwarded, newLevel, isNewBest);
    this.settlePlayerInBasket(basket);
  }

  private settlePlayerInBasket(basket: BasketData) {
    if (!this.player) return;

    const { LANDING_DURATION, LANDING_OVERSHOOT } = GAME_CONFIG.PLAYER;
    const { landingRestOffsetY } = this.getSelectedMode();
    this.isSettling = true;

    this.tweens.add({
      targets: this.player.sprite,
      y: basket.sprite.y + landingRestOffsetY,
      duration: LANDING_DURATION,
      ease: 'Back.easeOut',
      easeParams: [LANDING_OVERSHOOT],
      onComplete: () => this.finishLanding(basket),
    });
  }

  private finishLanding(basket: BasketData) {
    this.isSettling = false;
    this.moveCameraToNextBasket(basket);
  }

  private moveCameraToNextBasket(basket: BasketData) {
    const nextBasket = this.baskets[basket.index + 1];
    if (!nextBasket) {
      if (this.player) this.player.canJump = true;
      return;
    }

    const { CAMERA_MOVE_DURATION, NEXT_BASKET_SCREEN_Y_RATIO } = GAME_CONFIG.GAME;
    this.prepareReceiverForPlay(basket, nextBasket);

    this.tweens.add({
      targets: this.cameras.main,
      scrollY: nextBasket.sprite.y - GAME_CONFIG.CANVAS.HEIGHT * NEXT_BASKET_SCREEN_Y_RATIO,
      duration: CAMERA_MOVE_DURATION,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        if (this.player) this.player.canJump = true;
      },
    });
  }

  private prepareReceiverForPlay(currentBasket: BasketData, nextBasket: BasketData) {
    nextBasket.behaviorElapsed = 0;
    nextBasket.behaviorPhase = 'NORMAL';
    this.ensureReceiverKeepsCrossing(currentBasket, nextBasket);
    this.cameraRiseTargetSpeed = this.getFairCameraRiseSpeed(nextBasket);
    this.updateBehaviorText(
      nextBasket.behaviorText,
      nextBasket.behavior,
      'NORMAL',
      nextBasket.speed
    );
  }

  private ensureReceiverKeepsCrossing(currentBasket: BasketData, nextBasket: BasketData) {
    const { MIN_ACTIVE_SPEED, MIN_RELATIVE_SPEED } = GAME_CONFIG.RECEIVER;
    const nextDirection = Math.sign(nextBasket.speed || nextBasket.currentSpeed || 1);
    const currentDirection = Math.sign(currentBasket.currentSpeed || currentBasket.speed || 1);
    const currentMagnitude = Math.abs(currentBasket.currentSpeed || currentBasket.speed);
    const nextMagnitude = Math.max(Math.abs(nextBasket.speed), MIN_ACTIVE_SPEED);
    const needsSeparation =
      nextDirection === currentDirection &&
      Math.abs(nextMagnitude - currentMagnitude) < MIN_RELATIVE_SPEED;
    const safeMagnitude = needsSeparation ? currentMagnitude + MIN_RELATIVE_SPEED : nextMagnitude;
    nextBasket.speed = safeMagnitude * nextDirection;
  }

  private getFairCameraRiseSpeed(basket: BasketData) {
    const { CAMERA_RISE_SPEED } = GAME_CONFIG.GAME;
    if (basket.behavior !== 'STEADY') return CAMERA_RISE_SPEED;

    const { CAMERA_SPEED_REFERENCE, MINIMUM_LANDING_CHANCES } = GAME_CONFIG.RECEIVER;
    const speedRatio = Math.abs(basket.speed) / CAMERA_SPEED_REFERENCE;
    const minimumRatio = 1 / MINIMUM_LANDING_CHANCES;
    return CAMERA_RISE_SPEED * Phaser.Math.Clamp(speedRatio, minimumRatio, 1);
  }

  private endRun(reason: string) {
    if (!this.player || this.gameState === 'ENDING' || this.gameState === 'GAME_OVER') return;

    this.gameState = 'ENDING';
    this.isFalling = true;
    this.player.canJump = false;
    this.player.isJumping = false;
    this.clearFeedback();
    this.audio.miss();
    this.cameras.main.shake(100, 0.008);
    this.tweens.add({ targets: this.player.sprite, alpha: 0, duration: 160, ease: 'Cubic.easeIn' });
    this.time.delayedCall(GAME_CONFIG.GAME.FAST_RESTART_DELAY, () => this.gameOver(reason));
  }

  private resetPlayer() {
    if (!this.player) return;

    this.currentBasket = null;
    this.currentBasketIndex = -1;
    this.isFalling = false;
    this.isSettling = false;

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

  private updateLevel() {
    const newLevel = Math.floor(this.stats.score / GAME_CONFIG.GAME.LEVEL_UP_THRESHOLD) + 1;

    if (newLevel <= this.stats.level) return null;

    this.stats.level = newLevel;
    return newLevel;
  }

  private showCatchFeedback(pointsAwarded: number, newLevel: number | null, isNewBest: boolean) {
    const message = isNewBest
      ? `NEW BEST!\n+${pointsAwarded}`
      : newLevel
        ? `+${pointsAwarded}\nLevel ${newLevel}!`
        : `+${pointsAwarded}`;
    this.showFeedback(message, isNewBest || newLevel ? '#ffff00' : '#00ff00');
  }

  private showFeedback(message: string, color = '#ffffff') {
    if (!this.texts.messageText) return;

    this.clearFeedback();
    this.texts.messageText
      .setStyle({ color, fontSize: `${toRenderPixels(24)}px` })
      .setText(message)
      .setVisible(true);

    this.feedbackTimer = this.time.delayedCall(800, () => {
      this.texts.messageText?.setVisible(false);
    });
  }

  private clearFeedback() {
    this.feedbackTimer?.remove(false);
    this.feedbackTimer = null;
    this.texts.messageText?.setVisible(false);
  }

  private updateUI() {
    this.texts.scoreText?.setText(`Score: ${this.stats.score}`);
    this.texts.bestText?.setText(`Best: ${this.bestBaskets}`);
    this.texts.progressText?.setText(this.getProgressText());
  }

  private getProgressText() {
    return `Basket: ${this.stats.basketsCaught}  •  Level: ${this.stats.level}`;
  }

  private loadBestBaskets() {
    try {
      return Number(window.localStorage.getItem('toss-kaka-best-baskets')) || 0;
    } catch {
      return 0;
    }
  }

  private updateBestBaskets() {
    if (this.stats.basketsCaught <= this.bestBaskets) return false;

    this.bestBaskets = this.stats.basketsCaught;
    this.saveBestBaskets();
    this.updateBestMarker();
    return true;
  }

  private saveBestBaskets() {
    try {
      window.localStorage.setItem('toss-kaka-best-baskets', String(this.bestBaskets));
    } catch {
      // Keep the best run for the current session when storage is unavailable.
    }
  }

  private setupBestMarker() {
    this.bestMarker = this.add
      .text(0, 0, '', {
        fontSize: `${toRenderPixels(14)}px`,
        color: '#ffdb58',
        backgroundColor: '#000000',
        padding: { x: toRenderPixels(6), y: toRenderPixels(3) },
      })
      .setOrigin(0.5)
      .setScrollFactor(1)
      .setDepth(4);
    this.updateBestMarker();
  }

  private updateBestMarker() {
    if (!this.bestMarker) return;

    const markerY = this.getBasketY(this.bestBaskets) - toRenderPixels(110);
    this.bestMarker
      .setText(`★ BEST ${this.bestBaskets}`)
      .setPosition(toRenderPixels(72), markerY)
      .setVisible(this.bestBaskets > 0);
  }

  private getBasketY(index: number) {
    return this.playerStartY - GAME_CONFIG.BASKET.START_Y - index * GAME_CONFIG.BASKET.SPACING;
  }

  private showStartScreen() {
    this.gameState = 'START';

    if (!this.texts.messageText) return;

    const mode = this.getSelectedMode();

    this.texts.messageText
      .setStyle({ color: '#ffffff', fontSize: `${toRenderPixels(20)}px` })
      .setText(
        `TOSS KAKA\n\n<  ${mode.name.toUpperCase()}  >\n` +
          `${mode.combination}\n\n` +
          `Sides / arrows: choose\n` +
          `Center / SPACE: start`
      )
      .setVisible(true);
  }

  private startGame() {
    this.gameState = 'PLAYING';
    this.texts.messageText?.setVisible(false);
  }

  private gameOver(reason: string) {
    this.gameState = 'GAME_OVER';
    this.isFalling = false;

    if (!this.texts.messageText) return;

    const restartLabel = this.currentBasket
      ? 'Center / SPACE: resume'
      : 'Center / SPACE: play again';

    this.texts.messageText
      .setStyle({ color: '#ffffff', fontSize: `${toRenderPixels(22)}px` })
      .setText(
        `${reason}\n\n` +
          `Score: ${this.stats.score}\n` +
          `Baskets Caught: ${this.stats.basketsCaught}\n\n` +
          `Best: ${this.bestBaskets}\n\n` +
          `${restartLabel}\n` +
          `Sides / arrows: mode`
      )
      .setVisible(true);
  }

  private restartGame() {
    if (this.currentBasket) {
      this.resumeFromCheckpoint();
      return;
    }

    this.resetGameState();
    this.startGame();
  }

  private resumeFromCheckpoint() {
    if (!this.player || !this.currentBasket) return;

    const { sprite } = this.player;
    const { landingRestOffsetY } = this.getSelectedMode();
    this.gameState = 'PLAYING';
    this.isFalling = false;
    this.isSettling = false;
    this.clearFeedback();
    sprite.setPosition(
      this.currentBasket.sprite.x,
      this.currentBasket.sprite.y + landingRestOffsetY
    );
    sprite.setVelocity(0, 0).setAlpha(1);

    if (sprite.body && 'gravity' in sprite.body) sprite.body.gravity.y = 0;
    this.player.isJumping = false;
    this.player.canJump = false;
    this.moveCameraToNextBasket(this.currentBasket);
  }

  private resetGameState() {
    this.stats = {
      score: 0,
      level: 1,
      basketsCaught: 0,
    };
    this.currentBasket = null;
    this.currentBasketIndex = -1;
    this.isFalling = false;
    this.clearFeedback();
    this.updateUI();
    this.resetAllBaskets();
    this.resetCamera();
    this.resetPlayer();
  }

  private resetAllBaskets() {
    const { WIDTH } = GAME_CONFIG.CANVAS;
    const { INITIAL_COUNT, SPACING, START_Y } = GAME_CONFIG.BASKET;
    const { catcherScale } = this.getSelectedMode();

    while (this.baskets.length > INITIAL_COUNT) {
      const basket = this.baskets.pop();
      basket?.sprite.destroy();
      basket?.foregroundSprite.destroy();
      basket?.behaviorText.destroy();
      basket?.behaviorVisual.destroy();
    }

    const basket0Y = this.playerStartY - START_Y;

    this.baskets.forEach((basket, index) => {
      const yPos = basket0Y - index * SPACING;
      basket.sprite.setY(yPos);
      basket.sprite.setX(WIDTH / 2);
      basket.sprite.setScale(catcherScale);
      basket.foregroundSprite.setY(yPos);
      basket.foregroundSprite.setX(WIDTH / 2);
      basket.foregroundSprite.setScale(catcherScale);

      basket.behavior = this.getBasketBehavior(index);
      basket.behaviorVisual.setTexture(this.getBehaviorTexture(basket.behavior));
      basket.behaviorElapsed = 0;
      basket.behaviorPhase = 'NORMAL';
      basket.behaviorCueX = WIDTH / 2;
      basket.currentSpeed = 0;
      this.updateBehaviorText(
        basket.behaviorText,
        basket.behavior,
        basket.behaviorPhase,
        basket.speed
      );

      const speed = this.getBasketSpeed(index);
      const direction = speed === 0 ? 0 : Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      basket.speed = speed * direction;
      basket.currentSpeed = basket.speed;
      this.syncBasketVisuals(basket);
    });
  }

  private resetCamera() {
    const { HEIGHT } = GAME_CONFIG.CANVAS;
    const startCameraY = this.playerStartY - GAME_CONFIG.PLAYER.START_Y_OFFSET * HEIGHT;
    this.cameras.main.scrollY = startCameraY;
    this.cameraRiseSpeed = GAME_CONFIG.GAME.CAMERA_RISE_SPEED;
    this.cameraRiseTargetSpeed = GAME_CONFIG.GAME.CAMERA_RISE_SPEED;
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.CANVAS.WIDTH,
  height: GAME_CONFIG.CANVAS.HEIGHT,
  scene: EggTossGame,
  fps: {
    target: 60,
    smoothStep: true,
    deltaHistory: 10,
  },
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
    roundPixels: false,
    powerPreference: 'high-performance',
  },
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
    autoRound: false,
  },
};

const game = new Phaser.Game(config);

game.canvas.setAttribute('aria-label', 'Toss Kaka game. Press Space or tap to jump.');
game.canvas.style.touchAction = 'none';

function toRenderPixels(value: number) {
  return value * RENDER_SCALE;
}
