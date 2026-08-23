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

const MOTION_SETTING_KEY = 'toss-kaka-reduced-motion';

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
  private background: Phaser.GameObjects.Image | null = null;
  private statusTimer: Phaser.Time.TimerEvent | null = null;
  private audio = new GameAudio();
  private cameraRiseSpeed = GAME_CONFIG.GAME.CAMERA_RISE_SPEED;
  private cameraRiseTargetSpeed = GAME_CONFIG.GAME.CAMERA_RISE_SPEED;
  private cameraFocusY = 0;
  private cameraTargetY = 0;
  private reducedMotion = this.loadReducedMotion();
  private isSettingsOpen = false;
  private introducedBehaviors = new Set<BasketBehavior>();
  private feedbackParticles: Phaser.GameObjects.Arc[] = [];
  private particleCursor = 0;
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
    motionText: null,
    rewardText: null,
    statusText: null,
    settingsText: null,
    modeLeftText: null,
    modeRightText: null,
  };
  private playerStartY = 0;

  preload() {
    const baseURL = window.location.origin;
    this.load.setBaseURL(baseURL);
    this.load.image('chaat-object', 'assets/egg-toss-game/chaat-bazaar/object.png');
    this.load.image('chaat-basket', 'assets/egg-toss-game/chaat-bazaar/basket.png');
    this.load.image('bg-chaat', 'assets/egg-toss-game/chaat-bazaar/bg.png');
    this.load.image('turkey-object', 'assets/egg-toss-game/turkey-sweet-shop/object.png');
    this.load.image('turkey-basket', 'assets/egg-toss-game/turkey-sweet-shop/basket.png');
    this.load.image('bg-turkey', 'assets/egg-toss-game/turkey-sweet-shop/bg.png');
    this.load.image('cue-wind', 'assets/egg-toss-game/cue-wind.svg');
    this.load.image('cue-pause', 'assets/egg-toss-game/cue-pause.svg');
    this.load.image('cue-turn', 'assets/egg-toss-game/cue-turn.svg');
  }

  create() {
    this.setupBackground();
    this.setupPlayer();
    this.setupBaskets();
    this.setupCamera();
    this.setupUI();
    this.setupFeedbackParticles();
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
    this.cameraFocusY = startCameraY;
    this.cameraTargetY = startCameraY;
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
      this.updatePlayerInBasket(delta);
      this.updatePlayerFlight(delta);
      this.checkPlayerLanding();
      this.keepPlayerInBounds();
      this.updateCameraMotion(delta);
    } else if (this.gameState === 'ENDING') {
      this.updatePlayerFlight(delta);
    }
  }

  private updatePlayerInBasket(delta: number) {
    if (!this.player || !this.currentBasket || this.player.isJumping) return;

    const { sprite } = this.player;
    const basketX = this.currentBasket.sprite.x;
    if (!this.isSettling) return void sprite.setX(basketX);

    const cappedDelta = Math.min(delta, GAME_CONFIG.GAME.MAX_FRAME_DELTA_MS);
    const response = GAME_CONFIG.PLAYER.LANDING_HORIZONTAL_RESPONSE;
    const blend = 1 - Math.exp((-response * cappedDelta) / 1000);
    sprite.setX(Phaser.Math.Linear(sprite.x, basketX, blend));
  }

  private setupBackground() {
    const { WIDTH, HEIGHT } = GAME_CONFIG.CANVAS;
    this.background = this.add
      .image(WIDTH / 2, HEIGHT / 2, this.getSelectedMode().backgroundTexture)
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
      flightElapsed: 0,
      tumbleDirection: 1,
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
      const behaviorGuide = this.add.graphics().setDepth(0);
      const behaviorWalls = this.createBehaviorWalls(WIDTH / 2, yPos);

      if (basketSprite.body && 'gravity' in basketSprite.body) {
        basketSprite.body.gravity.y = 0;
      }

      const basketData: BasketData = {
        sprite: basketSprite,
        foregroundSprite,
        behaviorText,
        behaviorVisual,
        behaviorGuide,
        behaviorWalls,
        index,
        speed: speed * direction,
        currentSpeed: speed * direction,
        behavior,
        behaviorElapsed: 0,
        behaviorPhase: 'NORMAL',
        turnLaneLeft: 0,
        turnLaneRight: WIDTH,
        restY: yPos,
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

  private createBehaviorWalls(x: number, y: number): BasketData['behaviorWalls'] {
    return [this.createBehaviorWall(x, y), this.createBehaviorWall(x, y)];
  }

  private createBehaviorWall(x: number, y: number) {
    return this.add
      .rectangle(x, y, toRenderPixels(5), toRenderPixels(54), 0x7ee5ff, 0.88)
      .setStrokeStyle(toRenderPixels(1), 0xffffff, 0.9)
      .setDepth(4)
      .setVisible(false);
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
      .text(
        toRenderPixels(14),
        toRenderPixels(14),
        `SCORE ${this.stats.score}`,
        this.getHudTextStyle()
      )
      .setScrollFactor(0)
      .setDepth(100);

    this.texts.progressText = this.add
      .text(WIDTH / 2, toRenderPixels(16), this.getProgressText(), this.getHudTextStyle())
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.texts.settingsText = this.add
      .text(WIDTH - toRenderPixels(14), toRenderPixels(14), 'MENU', this.getHudTextStyle('#fdf3d1'))
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.texts.messageText = this.add
      .text(WIDTH / 2, GAME_CONFIG.CANVAS.HEIGHT / 2, '', {
        fontSize: `${toRenderPixels(18)}px`,
        color: '#fff9e8',
        backgroundColor: 'rgba(25, 26, 30, 0.78)',
        padding: { x: toRenderPixels(18), y: toRenderPixels(13) },
        align: 'center',
        wordWrap: { width: WIDTH - toRenderPixels(58), useAdvancedWrap: true },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);

    this.texts.modeLeftText = this.add
      .text(toRenderPixels(24), GAME_CONFIG.CANVAS.HEIGHT / 2 + toRenderPixels(110), '‹', {
        fontSize: `${toRenderPixels(48)}px`,
        color: '#fff4c4',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
    this.texts.modeRightText = this.add
      .text(WIDTH - toRenderPixels(24), GAME_CONFIG.CANVAS.HEIGHT / 2 + toRenderPixels(110), '›', {
        fontSize: `${toRenderPixels(48)}px`,
        color: '#fff4c4',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
    this.setupFeedbackUI();
  }

  private getHudTextStyle(color = '#fff9e8') {
    return {
      fontSize: `${toRenderPixels(14)}px`,
      fontStyle: 'bold',
      color,
      stroke: '#2b1d1a',
      strokeThickness: toRenderPixels(2),
      shadow: { offsetX: 0, offsetY: toRenderPixels(2), color: '#1a1010', blur: 2, fill: true },
    };
  }

  private setupFeedbackUI() {
    const { WIDTH } = GAME_CONFIG.CANVAS;
    this.texts.rewardText = this.createFeedbackText(0, 0, toRenderPixels(18), 1);
    this.texts.statusText = this.createFeedbackText(
      WIDTH / 2,
      toRenderPixels(82),
      toRenderPixels(18),
      0
    );
  }

  private createFeedbackText(x: number, y: number, fontSize: number, scrollFactor: number) {
    return this.add
      .text(x, y, '', {
        fontSize: `${fontSize}px`,
        color: '#fff9e8',
        fontStyle: 'bold',
        stroke: '#2b1d1a',
        strokeThickness: toRenderPixels(2),
      })
      .setOrigin(0.5)
      .setScrollFactor(scrollFactor)
      .setDepth(110)
      .setVisible(false);
  }

  private setupFeedbackParticles() {
    const { PARTICLE_POOL_SIZE } = GAME_CONFIG.FEEDBACK;
    for (let index = 0; index < PARTICLE_POOL_SIZE; index++) {
      const particle = this.add.circle(0, 0, toRenderPixels(2), 0xffd166).setDepth(6);
      this.feedbackParticles.push(particle.setVisible(false));
    }
  }

  private burstFeedbackParticles(x: number, y: number, kind: ParticleBurstKind) {
    const configuredCount =
      kind === 'TAKEOFF'
        ? GAME_CONFIG.FEEDBACK.TAKEOFF_PARTICLES
        : GAME_CONFIG.FEEDBACK.LANDING_PARTICLES;
    const count = this.reducedMotion ? Math.ceil(configuredCount / 2) : configuredCount;
    for (let index = 0; index < count; index++) this.launchFeedbackParticle(x, y, kind);
  }

  private launchFeedbackParticle(x: number, y: number, kind: ParticleBurstKind) {
    const particle = this.feedbackParticles[this.particleCursor % this.feedbackParticles.length];
    this.particleCursor++;
    this.tweens.killTweensOf(particle);
    const angle = Phaser.Math.DegToRad(this.getParticleAngle(kind));
    const distance = this.getParticleDistance(kind);
    particle
      .setPosition(x, y)
      .setFillStyle(this.getFeedbackColor(kind))
      .setAlpha(0.9)
      .setScale(Phaser.Math.FloatBetween(0.75, 1.35))
      .setVisible(true);
    this.tweenFeedbackParticle(particle, angle, distance);
  }

  private getParticleAngle(kind: ParticleBurstKind) {
    if (kind === 'TAKEOFF') return Phaser.Math.Between(25, 155);
    if (kind === 'LANDING') return Phaser.Math.Between(205, 335);
    return Phaser.Math.Between(0, 359);
  }

  private getParticleDistance(kind: ParticleBurstKind) {
    const distance = GAME_CONFIG.FEEDBACK.PARTICLE_DISTANCE;
    const kindMultiplier = kind === 'SPECIAL' ? 1.2 : 1;
    return distance * kindMultiplier * (this.reducedMotion ? 0.45 : 1);
  }

  private getFeedbackColor(kind: ParticleBurstKind) {
    if (kind === 'SPECIAL') return this.getSelectedMode().accentColor;
    return this.getSelectedMode().accentColor;
  }

  private tweenFeedbackParticle(particle: Phaser.GameObjects.Arc, angle: number, distance: number) {
    this.tweens.add({
      targets: particle,
      x: particle.x + Math.cos(angle) * distance,
      y: particle.y + Math.sin(angle) * distance,
      alpha: 0,
      scale: 0.2,
      duration: GAME_CONFIG.FEEDBACK.PARTICLE_DURATION,
      ease: 'Cubic.easeOut',
      onComplete: () => particle.setVisible(false),
    });
  }

  private setupControls() {
    this.input.keyboard?.on('keydown-SPACE', () => this.handlePrimaryAction());
    this.input.keyboard?.on('keydown-LEFT', () => this.changeMode(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.changeMode(1));
    this.input.keyboard?.on('keydown-M', () => this.toggleAudio());
    this.input.keyboard?.on('keydown-R', () => this.toggleReducedMotion());
    this.input.keyboard?.on('keydown-P', () => this.togglePause());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) =>
      this.handlePointerAction(pointer)
    );
  }

  private handlePointerAction(pointer: Phaser.Input.Pointer) {
    const position = this.getLogicalPointerPosition(pointer);
    if (this.handleSettingsPointer(position)) return;

    if (this.gameState === 'PAUSED') {
      this.togglePause();
      return;
    }

    if (this.gameState === 'PLAYING') {
      this.jump();
      return;
    }

    const selectionEdge = GAME_CONFIG.CANVAS.WIDTH * 0.3;
    if (position.x < selectionEdge) this.changeMode(-1);
    else if (position.x > GAME_CONFIG.CANVAS.WIDTH - selectionEdge) this.changeMode(1);
    else this.handlePrimaryAction();
  }

  private handleSettingsPointer(position: ScreenPoint) {
    const right = GAME_CONFIG.CANVAS.WIDTH - toRenderPixels(8);
    const left = right - toRenderPixels(124);
    if (position.y <= toRenderPixels(42) && position.x >= left) {
      this.toggleSettings();
      return true;
    }
    if (!this.isSettingsOpen) return false;
    if (position.x < left || position.x > right) {
      this.toggleSettings(false);
      return true;
    }

    if (position.y >= toRenderPixels(52) && position.y <= toRenderPixels(82)) {
      this.toggleAudio();
      return true;
    }
    if (position.y > toRenderPixels(82) && position.y <= toRenderPixels(112)) {
      this.toggleReducedMotion();
      return true;
    }
    if (position.y > toRenderPixels(112) && position.y <= toRenderPixels(142)) {
      if (this.gameState === 'PLAYING' || this.gameState === 'PAUSED') this.togglePause();
      else this.toggleSettings(false);
      return true;
    }
    return true;
  }

  private getLogicalPointerPosition(pointer: Phaser.Input.Pointer): ScreenPoint {
    const bounds = this.game.canvas.getBoundingClientRect();
    const clientPosition = getPointerClientPosition(pointer.event);
    const clientX = clientPosition?.x ?? bounds.left + pointer.x;
    const clientY = clientPosition?.y ?? bounds.top + pointer.y;
    return {
      x: ((clientX - bounds.left) * GAME_CONFIG.CANVAS.WIDTH) / bounds.width,
      y: ((clientY - bounds.top) * GAME_CONFIG.CANVAS.HEIGHT) / bounds.height,
    };
  }

  private handlePrimaryAction() {
    this.audio.unlock();

    if (this.isSettingsOpen) {
      this.toggleSettings(false);
      return;
    }

    if (this.gameState === 'PAUSED') {
      this.togglePause();
      return;
    }

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

  private toggleSettings(force?: boolean) {
    this.isSettingsOpen = force ?? !this.isSettingsOpen;
    const text = this.texts.settingsText;
    if (!text) return;
    if (!this.isSettingsOpen) {
      text.setText('MENU').setOrigin(1, 0).setAlign('right');
      return;
    }
    text
      .setText(
        `SOUND ${this.audio.enabled ? 'ON' : 'OFF'}\n` +
          `MOTION ${this.reducedMotion ? 'LOW' : 'FULL'}\n` +
          `${this.gameState === 'PAUSED' ? 'RESUME' : this.gameState === 'PLAYING' ? 'PAUSE' : 'CLOSE'}`
      )
      .setOrigin(1, 0)
      .setAlign('right');
  }

  private togglePause() {
    if (this.gameState !== 'PLAYING' && this.gameState !== 'PAUSED') return;
    const isPausing = this.gameState === 'PLAYING';
    this.gameState = isPausing ? 'PAUSED' : 'PLAYING';
    this.isSettingsOpen = false;
    this.toggleSettings(false);
    this.texts.messageText
      ?.setText(isPausing ? `${GAME_CONFIG.GAME.PAUSE_LABEL}\n\nTap or SPACE to continue` : '')
      .setVisible(isPausing);
  }

  private applySelectedMode() {
    const mode = this.getSelectedMode();
    this.background
      ?.setTexture(mode.backgroundTexture)
      .setDisplaySize(GAME_CONFIG.CANVAS.WIDTH, GAME_CONFIG.CANVAS.HEIGHT);
    this.player?.sprite.setTexture(mode.playerTexture).setScale(mode.playerScale);
    this.baskets.forEach(({ sprite, foregroundSprite }) => {
      sprite.setTexture(mode.catcherTexture).setScale(mode.catcherScale);
      foregroundSprite.setTexture(mode.catcherTexture).setScale(mode.catcherScale);
      this.cropCatcherForeground(foregroundSprite);
    });
    this.audio.setTheme(this.selectedModeIndex);
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
    this.preparePlayerTakeoff();
    this.audio.jump(this.selectedModeIndex);
  }

  private preparePlayerTakeoff() {
    if (!this.player) return;
    const { sprite } = this.player;
    const nextBasket = this.baskets[this.currentBasketIndex + 1];
    const targetDirection = Math.sign((nextBasket?.sprite.x ?? sprite.x + 1) - sprite.x);
    this.player.flightElapsed = 0;
    this.player.tumbleDirection = targetDirection || (Phaser.Math.Between(0, 1) === 0 ? -1 : 1);
    this.tweens.killTweensOf(sprite);
    sprite.setAlpha(1).clearTint();
    this.burstFeedbackParticles(sprite.x, sprite.y + sprite.displayHeight / 3, 'TAKEOFF');
  }

  private updatePlayerFlight(delta: number) {
    if (!this.player || (!this.player.isJumping && !this.isFalling)) return;
    const { sprite } = this.player;
    const velocityY = sprite.body?.velocity.y ?? 0;
    this.player.flightElapsed += Math.min(delta, GAME_CONFIG.GAME.MAX_FRAME_DELTA_MS);
    this.applyFlightScale(velocityY);
    if (!this.reducedMotion) {
      const spinSpeed = this.isFalling
        ? GAME_CONFIG.PLAYER.MISS_SPIN_SPEED
        : GAME_CONFIG.PLAYER.TUMBLE_SPEED;
      sprite.angle += (this.player.tumbleDirection * spinSpeed * delta) / 1000;
    }
  }

  private applyFlightScale(velocityY: number) {
    if (!this.player) return;
    const { sprite, flightElapsed } = this.player;
    const { FLIGHT_STRETCH_X, FLIGHT_STRETCH_Y, JUMP_VELOCITY, TAKEOFF_DURATION } =
      GAME_CONFIG.PLAYER;
    const baseScale = this.getSelectedMode().playerScale;
    if (this.reducedMotion) return void sprite.setScale(baseScale);
    const speedRatio = Phaser.Math.Clamp(Math.abs(velocityY / JUMP_VELOCITY), 0, 1);
    const targetX = Phaser.Math.Linear(1, FLIGHT_STRETCH_X, speedRatio);
    const targetY = Phaser.Math.Linear(1, FLIGHT_STRETCH_Y, speedRatio);
    const takeoff = Phaser.Math.Clamp(flightElapsed / TAKEOFF_DURATION, 0, 1);
    const eased = Phaser.Math.Easing.Cubic.Out(takeoff);
    const scaleX = Phaser.Math.Linear(GAME_CONFIG.PLAYER.LANDING_SQUASH_X, targetX, eased);
    const scaleY = Phaser.Math.Linear(GAME_CONFIG.PLAYER.LANDING_SQUASH_Y, targetY, eased);
    sprite.setScale(baseScale * scaleX, baseScale * scaleY);
  }

  private updateBaskets(delta: number) {
    const { WIDTH } = GAME_CONFIG.CANVAS;
    const deltaSeconds = Math.min(delta, GAME_CONFIG.GAME.MAX_FRAME_DELTA_MS) / 1000;

    this.baskets.forEach((basket) => {
      const { sprite } = basket;
      const halfWidth = sprite.displayWidth / 2;
      const bounds = this.getBasketMovementBounds(basket, halfWidth, WIDTH);
      const speed = this.getBasketMovementSpeed(basket, delta, bounds.minX, bounds.maxX);
      this.moveBasket(basket, speed, bounds.minX, bounds.maxX, deltaSeconds);
      this.syncBasketVisuals(basket);
    });
  }

  private getBasketMovementBounds(basket: BasketData, halfWidth: number, worldWidth: number) {
    const isActiveTurnBasket =
      basket.index === this.currentBasketIndex + 1 && basket.behavior === 'REVERSE';
    if (!isActiveTurnBasket) return { minX: halfWidth, maxX: worldWidth - halfWidth };

    const wallHalfWidth = toRenderPixels(2.5);
    return {
      minX: basket.turnLaneLeft + halfWidth + wallHalfWidth,
      maxX: basket.turnLaneRight - halfWidth - wallHalfWidth,
    };
  }

  private getBasketMovementSpeed(basket: BasketData, delta: number, minX: number, maxX: number) {
    if (basket.index !== this.currentBasketIndex + 1) return basket.speed;
    if (basket.behavior === 'REVERSE')
      return this.getTurnBasketMovementSpeed(basket, delta, minX, maxX);

    basket.behaviorElapsed += delta;
    const phase =
      basket.behavior === 'STEADY' ? 'NORMAL' : this.getBehaviorPhase(basket.behaviorElapsed);
    this.applyBehaviorPhase(basket, phase);
    return this.getBehaviorTargetSpeed(basket);
  }

  private getTurnBasketMovementSpeed(
    basket: BasketData,
    delta: number,
    minX: number,
    maxX: number
  ) {
    basket.behaviorElapsed += delta;
    if (
      basket.behaviorPhase === 'ACTION' &&
      basket.behaviorElapsed < GAME_CONFIG.RECEIVER.ACTION_DURATION_MS
    )
      return basket.speed;

    const boundary = basket.currentSpeed >= 0 ? maxX : minX;
    const distance = Math.abs(boundary - basket.sprite.x);
    const phase = distance <= GAME_CONFIG.RECEIVER.TURN_WARNING_DISTANCE ? 'WARNING' : 'NORMAL';
    this.applyBehaviorPhase(basket, phase);
    return basket.speed;
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

    const previousPhase = basket.behaviorPhase;
    basket.behaviorPhase = phase;
    this.updateBehaviorText(basket.behaviorText, basket.behavior, phase, basket.speed);
    if (phase === 'WARNING') this.showBehaviorForecast(basket);
    if (phase === 'ACTION') this.showBehaviorAction(basket);
    if (phase === 'RECOVERY') this.resetReceiverReaction(basket);
    if (phase === 'NORMAL' && previousPhase === 'ACTION') this.resetReceiverReaction(basket);
  }

  private showBehaviorForecast(basket: BasketData) {
    if (basket.index !== this.currentBasketIndex + 1) return;

    this.animateReceiverWarning(basket);
    this.audio.receiverWarning(basket.behavior);
  }

  private showBehaviorAction(basket: BasketData) {
    if (basket.index !== this.currentBasketIndex + 1) return;
    this.animateReceiverAction(basket);
    this.audio.receiverAction(basket.behavior);
  }

  private animateReceiverWarning(basket: BasketData) {
    if (this.reducedMotion) return;
    const direction = Math.sign(basket.currentSpeed || basket.speed || 1);
    const modeScale = this.getSelectedMode().catcherScale;
    const transform = this.getReceiverWarningTransform(basket.behavior, direction);
    this.tweens.killTweensOf([basket.sprite, basket.foregroundSprite]);
    this.tweens.add({
      targets: [basket.sprite, basket.foregroundSprite],
      scaleX: modeScale * transform.scaleX,
      scaleY: modeScale * transform.scaleY,
      angle: transform.angle,
      duration: 300,
      ease: 'Cubic.easeOut',
    });
  }

  private getReceiverWarningTransform(behavior: BasketBehavior, direction: number) {
    if (behavior === 'SWIFT') return { scaleX: 1.08, scaleY: 0.94, angle: direction * 3 };
    if (behavior === 'PAUSE') return { scaleX: 1.04, scaleY: 0.96, angle: -direction * 4 };
    return { scaleX: 0.96, scaleY: 1.04, angle: direction * 7 };
  }

  private animateReceiverAction(basket: BasketData) {
    const modeScale = this.getSelectedMode().catcherScale;
    const direction = Math.sign(basket.currentSpeed || basket.speed || 1);
    const stretchX = basket.behavior === 'SWIFT' ? 1.13 : 1.06;
    const stretchY = basket.behavior === 'PAUSE' ? 0.88 : 0.94;
    const angle = basket.behavior === 'REVERSE' ? -direction * 8 : 0;
    if (!this.reducedMotion) this.tweenReceiverImpact(basket, modeScale, stretchX, stretchY, angle);
    this.burstFeedbackParticles(basket.sprite.x, basket.sprite.y, 'SPECIAL');
  }

  private tweenReceiverImpact(
    basket: BasketData,
    baseScale: number,
    stretchX: number,
    stretchY: number,
    angle: number
  ) {
    this.tweens.killTweensOf([basket.sprite, basket.foregroundSprite]);
    this.tweens.add({
      targets: [basket.sprite, basket.foregroundSprite],
      scaleX: baseScale * stretchX,
      scaleY: baseScale * stretchY,
      angle,
      duration: 120,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  private resetReceiverReaction(basket: BasketData) {
    const baseScale = this.getSelectedMode().catcherScale;
    this.tweens.add({
      targets: [basket.sprite, basket.foregroundSprite],
      scaleX: baseScale,
      scaleY: baseScale,
      angle: 0,
      duration: this.reducedMotion ? 0 : 180,
      ease: 'Cubic.easeOut',
    });
  }

  private getBehaviorTargetSpeed(basket: BasketData) {
    const { behavior, behaviorPhase, speed } = basket;
    if (behavior === 'REVERSE') return speed;
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
    this.handleBasketBoundaryHit(basket);
  }

  private handleBasketBoundaryHit(basket: BasketData) {
    const isActiveTurnBasket =
      basket.index === this.currentBasketIndex + 1 && basket.behavior === 'REVERSE';
    if (!isActiveTurnBasket) return void this.animateBasketBounce(basket);

    basket.behaviorElapsed = 0;
    this.applyBehaviorPhase(basket, 'ACTION');
  }

  private animateBasketBounce(basket: BasketData) {
    const isRelevant =
      basket.index >= this.currentBasketIndex && basket.index <= this.currentBasketIndex + 1;
    if (this.reducedMotion || !isRelevant || basket.behaviorPhase !== 'NORMAL') return;
    const direction = Math.sign(basket.speed || 1);
    this.tweens.killTweensOf([basket.sprite, basket.foregroundSprite]);
    this.tweens.add({
      targets: [basket.sprite, basket.foregroundSprite],
      angle: direction * GAME_CONFIG.BASKET.EDGE_TILT,
      duration: 70,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  private getSmoothedBasketSpeed(basket: BasketData, targetSpeed: number, deltaSeconds: number) {
    const { VELOCITY_RESPONSE } = GAME_CONFIG.RECEIVER;
    const blend = 1 - Math.exp(-VELOCITY_RESPONSE * deltaSeconds);
    basket.currentSpeed = Phaser.Math.Linear(basket.currentSpeed, targetSpeed, blend);
    return basket.currentSpeed;
  }

  private syncBasketVisuals(basket: BasketData) {
    const { sprite, foregroundSprite, behaviorText } = basket;
    foregroundSprite.setPosition(sprite.x, sprite.y);
    behaviorText.setPosition(sprite.x, sprite.y - sprite.displayHeight / 2 - toRenderPixels(16));
    behaviorText.setVisible(false);
    this.syncBehaviorVisual(basket);
  }

  private syncBehaviorVisual(basket: BasketData) {
    const isActive = basket.index === this.currentBasketIndex + 1;
    const isVisible = isActive && basket.behavior !== 'STEADY' && basket.behavior !== 'REVERSE';
    basket.behaviorVisual.setVisible(isVisible);
    this.drawBehaviorGuide(basket, isActive);
    this.syncTurnWalls(basket);
    if (!isVisible) return;

    const { x, y } = this.getBehaviorVisualPosition(basket);
    const pulse = this.getBehaviorVisualPulse(basket);
    const size = GAME_CONFIG.RECEIVER.CUE_SIZE * pulse;
    basket.behaviorVisual
      .setPosition(x, y)
      .setDisplaySize(size, size)
      .setAlpha(this.getBehaviorVisualAlpha(basket.behaviorPhase));
  }

  private drawBehaviorGuide(basket: BasketData, isActive: boolean) {
    const guide = basket.behaviorGuide;
    guide.clear();
    if (!isActive || basket.behavior === 'STEADY') return;

    const accent = this.getSelectedMode().accentColor;
    const { sprite, behavior, behaviorPhase } = basket;
    const pulse = behaviorPhase === 'WARNING' && !this.reducedMotion ? 1.15 : 1;
    if (behavior === 'SWIFT') {
      const direction = Math.sign(basket.currentSpeed || basket.speed || 1);
      const startX = sprite.x - direction * (sprite.displayWidth / 2 + toRenderPixels(78));
      guide.lineStyle(toRenderPixels(2), accent, 0.68);
      [-toRenderPixels(10), 0, toRenderPixels(10)].forEach((offset, index) => {
        const length = toRenderPixels(28 + index * 11) * pulse;
        guide.lineBetween(
          startX,
          sprite.y + offset,
          startX + direction * length,
          sprite.y + offset
        );
      });
      return;
    }

    if (behavior === 'PAUSE') {
      const y = sprite.y - sprite.displayHeight / 2 - toRenderPixels(18);
      guide.fillStyle(accent, 0.8);
      [-toRenderPixels(16), 0, toRenderPixels(16)].forEach((offset, index) =>
        guide.fillCircle(sprite.x + offset, y, toRenderPixels((index === 1 ? 4 : 2.5) * pulse))
      );
      return;
    }

    guide.lineStyle(toRenderPixels(2), accent, behaviorPhase === 'WARNING' ? 0.9 : 0.42);
    guide.lineBetween(basket.turnLaneLeft, basket.restY, basket.turnLaneRight, basket.restY);
  }

  private syncTurnWalls(basket: BasketData) {
    const { behavior, behaviorWalls, behaviorPhase } = basket;
    const isActive = basket.index === this.currentBasketIndex + 1;
    const isVisible = isActive && behavior === 'REVERSE';
    behaviorWalls.forEach((wall) => wall.setVisible(isVisible));
    if (!isVisible) return;

    const pulse =
      behaviorPhase === 'WARNING' && !this.reducedMotion
        ? 0.82 + Math.sin(basket.behaviorElapsed / 70) * 0.18
        : 1;
    const alpha = behaviorPhase === 'NORMAL' ? 0.55 : 1;
    behaviorWalls[0]
      .setPosition(basket.turnLaneLeft, basket.restY)
      .setScale(1, pulse)
      .setFillStyle(this.getSelectedMode().accentColor, 0.9)
      .setAlpha(alpha);
    behaviorWalls[1]
      .setPosition(basket.turnLaneRight, basket.restY)
      .setScale(1, pulse)
      .setFillStyle(this.getSelectedMode().accentColor, 0.9)
      .setAlpha(alpha);
  }

  private getBehaviorVisualPosition(basket: BasketData) {
    const { sprite, behavior, currentSpeed } = basket;
    const direction = Math.sign(currentSpeed || basket.speed || 1);
    const sideOffset = sprite.displayWidth / 2 + toRenderPixels(24);
    if (behavior === 'SWIFT') return { x: sprite.x - direction * sideOffset, y: sprite.y };
    if (behavior === 'REVERSE')
      return { x: sprite.x, y: sprite.y - sprite.displayHeight / 2 - toRenderPixels(28) };
    return { x: sprite.x, y: sprite.y - sprite.displayHeight / 2 - toRenderPixels(28) };
  }

  private getBehaviorVisualPulse(basket: BasketData) {
    if (this.reducedMotion) return 1;
    if (basket.behaviorPhase === 'ACTION') return 1.12;
    if (basket.behaviorPhase !== 'WARNING') return 1;
    return 1 + Math.sin(basket.behaviorElapsed / 65) * 0.14;
  }

  private getBehaviorVisualAlpha(phase: ReceiverPhase) {
    if (phase === 'NORMAL') return 0.5;
    if (phase === 'RECOVERY') return 0.72;
    return 1;
  }

  private updateCameraMotion(delta: number) {
    const cappedDelta = Math.min(delta, GAME_CONFIG.GAME.MAX_FRAME_DELTA_MS);
    if (this.isRisingDangerActive()) this.advanceRisingDanger(cappedDelta);
    const response = GAME_CONFIG.GAME.CAMERA_FOLLOW_RESPONSE;
    const blend = 1 - Math.exp((-response * cappedDelta) / 1000);
    this.cameraFocusY = Phaser.Math.Linear(this.cameraFocusY, this.cameraTargetY, blend);
    this.cameras.main.scrollY = this.cameraFocusY;
    if (this.isRisingDangerActive() && this.hasPlayerLeftViewport()) this.endRun('LEFT BEHIND!');
  }

  private advanceRisingDanger(delta: number) {
    this.updateCameraRiseSpeed(delta);
    this.cameraTargetY -= (this.cameraRiseSpeed * delta) / 1000;
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
    return this.getStablePlayerBounds().top >= viewportBottom;
  }

  private toggleAudio() {
    this.audio.unlock();
    const enabled = this.audio.toggle();
    this.texts.audioText?.setText(enabled ? 'SFX: ON' : 'SFX: OFF');
    if (enabled) this.audio.catch(this.selectedModeIndex);
    if (this.isSettingsOpen) this.toggleSettings(true);
  }

  private toggleReducedMotion() {
    this.reducedMotion = !this.reducedMotion;
    this.saveReducedMotion();
    this.texts.motionText?.setText(this.getMotionLabel());
    if (this.reducedMotion) this.resetActiveVisualEffects();
    if (this.isSettingsOpen) this.toggleSettings(true);
  }

  private getMotionLabel() {
    return this.reducedMotion ? 'FX: REDUCED' : 'FX: FULL';
  }

  private resetActiveVisualEffects() {
    const baseScale = this.getSelectedMode().playerScale;
    this.player?.sprite.setScale(baseScale).setAngle(0);
    this.baskets
      .filter((basket) => Math.abs(basket.index - this.currentBasketIndex) <= 1)
      .forEach((basket) => this.resetReceiverReaction(basket));
  }

  private loadReducedMotion() {
    try {
      const saved = window.localStorage.getItem(MOTION_SETTING_KEY);
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }

  private saveReducedMotion() {
    try {
      window.localStorage.setItem(MOTION_SETTING_KEY, String(this.reducedMotion));
    } catch {
      // Keep the setting for the current session when storage is unavailable.
    }
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
          this.startFalling('EDGE MISS!');
        }
      }
    }
  }

  private startFalling(reason = 'MISS!') {
    this.endRun(reason);
  }

  private checkBasketCollision() {
    if (!this.player) return null;

    const playerBounds = this.getStablePlayerBounds();

    const nextBasketIndex = this.currentBasketIndex + 1;
    const nextBasket = this.baskets[nextBasketIndex];

    if (!nextBasket) return null;

    const basketBounds = this.getStableBasketBounds(nextBasket);

    if (this.isInsideBasketOpening(playerBounds, basketBounds)) {
      return nextBasket;
    }

    return null;
  }

  private getStablePlayerBounds() {
    if (!this.player) return new Phaser.Geom.Rectangle();
    const { sprite } = this.player;
    const baseScale = this.getSelectedMode().playerScale;
    const width = sprite.width * baseScale;
    const height = sprite.height * baseScale;
    return new Phaser.Geom.Rectangle(sprite.x - width / 2, sprite.y - height / 2, width, height);
  }

  private getStableBasketBounds(basket: BasketData) {
    const baseScale = this.getSelectedMode().catcherScale;
    const width = basket.sprite.width * baseScale;
    const height = basket.sprite.height * baseScale;
    return new Phaser.Geom.Rectangle(
      basket.sprite.x - width / 2,
      basket.restY - height / 2,
      width,
      height
    );
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

    this.audio.catch(this.selectedModeIndex);
    this.audio.reward(Boolean(newLevel || isNewBest));
    this.showCatchFeedback(basket, pointsAwarded, newLevel, isNewBest);
    this.animateScoreUpdate();
    this.animateBasketImpact(basket);
    this.burstFeedbackParticles(basket.sprite.x, basket.restY, 'LANDING');
    this.settlePlayerInBasket(basket);
  }

  private animateBasketImpact(basket: BasketData) {
    if (this.reducedMotion) return;
    const { IMPACT_DURATION } = GAME_CONFIG.BASKET;
    const baseScale = this.getSelectedMode().catcherScale;
    const targets = [basket.sprite, basket.foregroundSprite];
    this.tweens.killTweensOf(targets);
    targets.forEach((target) => target.setScale(baseScale * 1.02, baseScale * 0.97).setAngle(0));
    this.tweens.add({
      targets,
      scaleX: baseScale,
      scaleY: baseScale,
      duration: IMPACT_DURATION,
      ease: 'Cubic.easeOut',
    });
  }

  private settlePlayerInBasket(basket: BasketData) {
    if (!this.player) return;

    const { LANDING_DURATION } = GAME_CONFIG.PLAYER;
    const { landingRestOffsetY } = this.getSelectedMode();
    const baseScale = this.getSelectedMode().playerScale;
    this.isSettling = true;
    this.tweens.killTweensOf(this.player.sprite);

    this.tweens.add({
      targets: this.player.sprite,
      y: basket.restY + landingRestOffsetY,
      scaleX: baseScale,
      scaleY: baseScale,
      angle: 0,
      duration: LANDING_DURATION,
      ease: 'Cubic.easeOut',
      onComplete: () => this.finishLanding(basket),
    });
  }

  private finishLanding(basket: BasketData) {
    this.isSettling = false;
    const { landingRestOffsetY, playerScale } = this.getSelectedMode();
    this.player?.sprite
      .setPosition(basket.sprite.x, basket.restY + landingRestOffsetY)
      .setScale(playerScale)
      .setAngle(0);
    this.moveCameraToNextBasket(basket);
  }

  private moveCameraToNextBasket(basket: BasketData, isCheckpointRecovery = false) {
    const nextBasket = this.baskets[basket.index + 1];
    if (!nextBasket) {
      if (this.player) this.player.canJump = true;
      return;
    }

    const { CAMERA_MOVE_DURATION, NEXT_BASKET_SCREEN_Y_RATIO } = GAME_CONFIG.GAME;
    this.prepareReceiverForPlay(basket, nextBasket);
    const framingTarget = nextBasket.restY - GAME_CONFIG.CANVAS.HEIGHT * NEXT_BASKET_SCREEN_Y_RATIO;
    if (isCheckpointRecovery) this.restoreCheckpointCamera(framingTarget);
    else this.cameraTargetY = Math.min(this.cameraTargetY, framingTarget);
    this.time.delayedCall(CAMERA_MOVE_DURATION + this.getReceiverPreviewDuration(nextBasket), () =>
      this.finishCameraHandoff()
    );
  }

  private restoreCheckpointCamera(framingTarget: number) {
    this.cameraFocusY = framingTarget;
    this.cameraTargetY = framingTarget;
    this.cameras.main.scrollY = framingTarget;
    this.cameraRiseSpeed = this.cameraRiseTargetSpeed;
  }

  private getReceiverPreviewDuration(basket: BasketData) {
    if (basket.behavior === 'STEADY' || this.introducedBehaviors.has(basket.behavior)) return 0;
    this.introducedBehaviors.add(basket.behavior);
    this.showStatusBanner(
      this.getReceiverPreviewMessage(basket.behavior),
      this.getSelectedMode().accentHex
    );
    return GAME_CONFIG.RECEIVER.FIRST_PREVIEW_DURATION_MS;
  }

  private getReceiverPreviewMessage(behavior: BasketBehavior) {
    return {
      SWIFT: 'WATCH THE WIND',
      PAUSE: 'WATCH THE RHYTHM',
      REVERSE: 'WATCH THE WALLS',
      STEADY: '',
    }[behavior];
  }

  private finishCameraHandoff() {
    if (this.player && this.gameState === 'PLAYING' && !this.isFalling) {
      this.player.canJump = true;
    }
  }

  private prepareReceiverForPlay(currentBasket: BasketData, nextBasket: BasketData) {
    nextBasket.behaviorElapsed = 0;
    nextBasket.behaviorPhase = 'NORMAL';
    this.ensureReceiverKeepsCrossing(currentBasket, nextBasket);
    if (nextBasket.behavior === 'REVERSE') this.configureTurnLane(nextBasket);
    this.cameraRiseTargetSpeed = this.getFairCameraRiseSpeed(nextBasket);
    this.updateBehaviorText(
      nextBasket.behaviorText,
      nextBasket.behavior,
      'NORMAL',
      nextBasket.speed
    );
  }

  private configureTurnLane(basket: BasketData) {
    const { WIDTH } = GAME_CONFIG.CANVAS;
    const { TURN_LANE_WIDTH, TURN_WALL_INSET } = GAME_CONFIG.RECEIVER;
    const maxLeft = WIDTH - TURN_WALL_INSET - TURN_LANE_WIDTH;
    const idealLeft = basket.sprite.x - TURN_LANE_WIDTH / 2;
    basket.turnLaneLeft = Phaser.Math.Clamp(idealLeft, TURN_WALL_INSET, maxLeft);
    basket.turnLaneRight = basket.turnLaneLeft + TURN_LANE_WIDTH;
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
    const { CAMERA_RISE_SPEED, NEXT_BASKET_SCREEN_Y_RATIO } = GAME_CONFIG.GAME;
    const { HEIGHT, WIDTH } = GAME_CONFIG.CANVAS;
    const { MINIMUM_LANDING_CHANCES, MIN_ACTIVE_SPEED, SWIFT_MULTIPLIER } = GAME_CONFIG.RECEIVER;
    const bounds = this.getBasketMovementBounds(basket, basket.sprite.displayWidth / 2, WIDTH);
    const laneDistance = Math.max(bounds.maxX - bounds.minX, toRenderPixels(80));
    const topSpeed =
      Math.max(Math.abs(basket.speed), MIN_ACTIVE_SPEED) *
      (basket.behavior === 'SWIFT' ? SWIFT_MULTIPLIER : 1);
    const completeCrossingDuration = (laneDistance * 2 * 1000) / topSpeed;
    const visibleTravelRoom = HEIGHT * (1 - NEXT_BASKET_SCREEN_Y_RATIO);
    const maximumFairRiseSpeed =
      (visibleTravelRoom * 1000) / (completeCrossingDuration * MINIMUM_LANDING_CHANCES);

    return Math.min(CAMERA_RISE_SPEED, maximumFairRiseSpeed);
  }

  private endRun(reason: string) {
    if (!this.player || this.gameState === 'ENDING' || this.gameState === 'GAME_OVER') return;

    this.gameState = 'ENDING';
    this.isFalling = true;
    this.player.canJump = false;
    this.player.isJumping = false;
    this.player.flightElapsed = 0;
    this.clearFeedback();
    this.audio.miss();
    this.prepareMissFall();
    this.time.delayedCall(GAME_CONFIG.PLAYER.MISS_DURATION, () => this.gameOver(reason));
  }

  private prepareMissFall() {
    if (!this.player) return;
    const { sprite } = this.player;
    if (sprite.body && 'gravity' in sprite.body)
      sprite.body.gravity.y = GAME_CONFIG.PHYSICS.GRAVITY_Y;
    sprite.setVelocityY(Math.max(sprite.body?.velocity.y ?? 0, toRenderPixels(160)));
    this.time.delayedCall(GAME_CONFIG.PLAYER.MISS_FADE_DELAY, () => this.fadeMissedPlayer());
    if (!this.reducedMotion) {
      this.time.delayedCall(120, () => this.cameras.main.shake(120, 0.004));
    }
  }

  private fadeMissedPlayer() {
    if (!this.player || this.gameState !== 'ENDING') return;
    const duration = GAME_CONFIG.PLAYER.MISS_DURATION - GAME_CONFIG.PLAYER.MISS_FADE_DELAY;
    this.tweens.add({
      targets: this.player.sprite,
      alpha: 0,
      duration,
      ease: 'Cubic.easeIn',
    });
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
    this.tweens.killTweensOf(sprite);
    sprite.setAlpha(1).setAngle(0).setScale(this.getSelectedMode().playerScale).clearTint();

    if (sprite.body && 'gravity' in sprite.body) {
      sprite.body.gravity.y = 0;
    }

    this.player.isJumping = false;
    this.player.canJump = true;
    this.player.flightElapsed = 0;
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

  private showCatchFeedback(
    basket: BasketData,
    pointsAwarded: number,
    newLevel: number | null,
    isNewBest: boolean
  ) {
    this.showFloatingReward(basket, pointsAwarded);
    if (isNewBest) this.showStatusBanner('★ NEW BEST!', '#ffdf6b');
    else if (this.stats.basketsCaught > 0 && this.stats.basketsCaught % 5 === 0)
      this.showStatusBanner('NEW MARKET MILESTONE!', this.getSelectedMode().accentHex);
    else if (newLevel) this.showStatusBanner(`LEVEL ${newLevel}!`, '#8fffa0');
  }

  private showFloatingReward(basket: BasketData, pointsAwarded: number) {
    const text = this.texts.rewardText;
    if (!text) return;
    this.tweens.killTweensOf(text);
    const startY = basket.restY - basket.sprite.displayHeight / 2 - toRenderPixels(12);
    text
      .setText(`+${pointsAwarded}`)
      .setStyle({ color: '#8fff9c' })
      .setPosition(basket.sprite.x, startY)
      .setAlpha(1)
      .setScale(this.reducedMotion ? 1 : 0.9)
      .setVisible(true);
    this.tweens.add({
      targets: text,
      y: this.reducedMotion ? startY : startY - toRenderPixels(34),
      alpha: 0,
      scale: this.reducedMotion ? 1 : 1.08,
      duration: GAME_CONFIG.GAME.REWARD_DURATION,
      ease: 'Cubic.easeOut',
      onComplete: () => text.setVisible(false),
    });
  }

  private showStatusBanner(message: string, color: string) {
    const text = this.texts.statusText;
    if (!text) return;
    this.statusTimer?.remove(false);
    this.tweens.killTweensOf(text);
    text.setText(message).setStyle({ color }).setAlpha(1).setVisible(true);
    text.setScale(this.reducedMotion ? 1 : 0.86);
    if (!this.reducedMotion) {
      this.tweens.add({ targets: text, scale: 1, duration: 160, ease: 'Back.easeOut' });
    }
    this.statusTimer = this.time.delayedCall(GAME_CONFIG.GAME.STATUS_DURATION, () =>
      this.hideStatusBanner()
    );
  }

  private hideStatusBanner() {
    const text = this.texts.statusText;
    if (!text) return;
    this.tweens.add({
      targets: text,
      alpha: 0,
      duration: this.reducedMotion ? 80 : 180,
      ease: 'Cubic.easeIn',
      onComplete: () => text.setVisible(false),
    });
  }

  private clearFeedback() {
    this.statusTimer?.remove(false);
    this.statusTimer = null;
    this.tweens.killTweensOf([this.texts.rewardText, this.texts.statusText]);
    this.texts.rewardText?.setVisible(false);
    this.texts.statusText?.setVisible(false);
    this.texts.messageText?.setVisible(false);
  }

  private animateScoreUpdate() {
    const text = this.texts.scoreText;
    if (!text || this.reducedMotion) return;
    this.tweens.killTweensOf(text);
    text.setScale(1);
    this.tweens.add({
      targets: text,
      scale: 1.12,
      duration: 90,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  private updateUI() {
    this.texts.scoreText?.setText(`SCORE ${this.stats.score}`);
    this.texts.bestText?.setText(`Best: ${this.bestBaskets}`);
    this.texts.progressText?.setText(this.getProgressText());
  }

  private getProgressText() {
    return `BASKET ${this.stats.basketsCaught}`;
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
        fontStyle: 'bold',
        stroke: '#2b1d1a',
        strokeThickness: toRenderPixels(2),
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
    this.isSettingsOpen = false;
    this.toggleSettings(false);

    if (!this.texts.messageText) return;

    const mode = this.getSelectedMode();

    this.texts.messageText
      .setStyle({ color: '#fff9e8', fontSize: `${toRenderPixels(20)}px` })
      .setText(
        `TOSS KAKA\n\n${mode.name.toUpperCase()}\n` +
          `${mode.combination}\n\n` +
          `Tap or SPACE to toss\n` +
          `Use the arrows to choose a world`
      )
      .setVisible(true);
    this.setModeControlsVisible(true);
  }

  private startGame() {
    this.gameState = 'PLAYING';
    this.texts.messageText?.setVisible(false);
    this.setModeControlsVisible(false);
  }

  private gameOver(reason: string) {
    this.gameState = 'GAME_OVER';
    this.isFalling = false;
    this.isSettingsOpen = false;
    this.toggleSettings(false);

    if (!this.texts.messageText) return;

    const restartLabel = this.currentBasket
      ? 'Tap or SPACE to resume'
      : 'Tap or SPACE to play again';
    const recoveryTip = this.getRecoveryTip(reason);

    this.texts.messageText
      .setStyle({ color: '#fff9e8', fontSize: `${toRenderPixels(20)}px` })
      .setText(
        `${reason}\n${recoveryTip}\n\n` +
          `SCORE ${this.stats.score}  ·  BASKETS ${this.stats.basketsCaught}\n` +
          `BEST ${this.bestBaskets}\n\n` +
          `${restartLabel}`
      )
      .setVisible(true);
    this.setModeControlsVisible(true);
  }

  private getRecoveryTip(reason: string) {
    if (reason === 'LEFT BEHIND!') return 'Jump sooner to keep up with the market.';
    if (reason === 'EDGE MISS!') return 'Line up fully over the basket rim.';
    return 'Watch the receiver, then toss on its path.';
  }

  private setModeControlsVisible(isVisible: boolean) {
    this.texts.modeLeftText?.setVisible(isVisible);
    this.texts.modeRightText?.setVisible(isVisible);
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
    this.tweens.killTweensOf(sprite);
    this.resetReceiverReaction(this.currentBasket);
    sprite.setPosition(this.currentBasket.sprite.x, this.currentBasket.restY + landingRestOffsetY);
    sprite
      .setVelocity(0, 0)
      .setAlpha(1)
      .setAngle(0)
      .setScale(this.getSelectedMode().playerScale)
      .clearTint();

    if (sprite.body && 'gravity' in sprite.body) sprite.body.gravity.y = 0;
    this.player.isJumping = false;
    this.player.canJump = false;
    this.player.flightElapsed = 0;
    this.moveCameraToNextBasket(this.currentBasket, true);
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
      basket?.behaviorGuide.destroy();
      basket?.behaviorWalls.forEach((wall) => wall.destroy());
    }

    const basket0Y = this.playerStartY - START_Y;

    this.baskets.forEach((basket, index) => {
      const yPos = basket0Y - index * SPACING;
      this.tweens.killTweensOf([basket.sprite, basket.foregroundSprite]);
      basket.sprite
        .setPosition(WIDTH / 2, yPos)
        .setScale(catcherScale)
        .setAngle(0);
      basket.foregroundSprite
        .setPosition(WIDTH / 2, yPos)
        .setScale(catcherScale)
        .setAngle(0);

      basket.behavior = this.getBasketBehavior(index);
      basket.behaviorVisual.setTexture(this.getBehaviorTexture(basket.behavior));
      basket.behaviorElapsed = 0;
      basket.behaviorPhase = 'NORMAL';
      basket.turnLaneLeft = 0;
      basket.turnLaneRight = WIDTH;
      basket.restY = yPos;
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
    this.cameraFocusY = startCameraY;
    this.cameraTargetY = startCameraY;
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

function getPointerClientPosition(event: Event | undefined): ScreenPoint | null {
  if (event instanceof MouseEvent) return { x: event.clientX, y: event.clientY };
  if (event instanceof TouchEvent) {
    const touch = event.changedTouches[0] ?? event.touches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return null;
}

function toRenderPixels(value: number) {
  return value * RENDER_SCALE;
}

type ParticleBurstKind = 'TAKEOFF' | 'LANDING' | 'SPECIAL';
type ScreenPoint = { x: number; y: number };
