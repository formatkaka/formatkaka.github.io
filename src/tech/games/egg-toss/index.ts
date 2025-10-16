import Phaser from 'phaser';
import type { Types } from 'phaser';

class Example extends Phaser.Scene {
  preload() {
    this.load.setBaseURL('http://localhost:4321');
    this.load.image('basket', 'assets/egg-toss-game/basket.png');
    this.load.image('pp', 'assets/egg-toss-game/panipuri.png');
    this.load.image('bg', 'assets/egg-toss-game/bg.jpg');
  }

  create() {
    this.add.image(850, 500, 'bg');
    this.physics.world.setBounds(550, 100, 600, 600);

    const baskets = this.physics.add.group({
      allowGravity: false,
      collideWorldBounds: true,
      bounceX: 1,
    });

    baskets.create(850, 900, 'basket').setScale(0.5).setVelocityX(200);
    baskets.create(750, 500, 'basket').setScale(0.5).setVelocityX(150);
    baskets.create(950, 200, 'basket').setScale(0.5).setVelocityX(255);

    const player = this.physics.add.image(850, 500, 'pp').setScale(0.3);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, baskets, () => {
      console.log('collide');
    });
  }
}

const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: Example,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200, x: 10 },
    },
  },
};

new Phaser.Game(config);
