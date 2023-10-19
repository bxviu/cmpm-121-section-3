import * as Phaser from "phaser";

import starfieldUrl from "/assets/starfield.png";

export default class Play extends Phaser.Scene {
  fire?: Phaser.Input.Keyboard.Key;
  left?: Phaser.Input.Keyboard.Key;
  right?: Phaser.Input.Keyboard.Key;
  movement?: boolean;
  enemies?: Enemy[];

  starfield?: Phaser.GameObjects.TileSprite;
  spinner?: Phaser.GameObjects.Shape;

  rotationSpeed = Phaser.Math.PI2 / 1000; // radians per millisecond

  constructor() {
    super("play");
  }

  preload() {
    this.load.image("starfield", starfieldUrl);
  }

  #addKey(
    name: keyof typeof Phaser.Input.Keyboard.KeyCodes,
  ): Phaser.Input.Keyboard.Key {
    return this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes[name]);
  }

  create() {
    this.fire = this.#addKey("F");
    this.left = this.#addKey("LEFT");
    this.right = this.#addKey("RIGHT");
    this.movement = true;
    this.enemies = [];

    this.starfield = this.add
      .tileSprite(
        0,
        0,
        this.game.config.width as number,
        this.game.config.height as number,
        "starfield",
      )
      .setOrigin(0, 0);

    this.spinner = this.add.rectangle(100, 400, 50, 50, 0x00f1d0);
    this.physics.add.existing(this.spinner);
  }

  update(_timeMs: number, delta: number) {
    this.starfield!.tilePositionX -= 4;
    if (this.enemies!.length < 4) {
      this.enemies!.push(
        new Enemy(this, Math.random() * -200, Math.random() * 200),
      );
      console.log(this.enemies);
    }

    this.enemies!.forEach((enemy) => {
      enemy.update(_timeMs, delta);
      this.physics.collide(this.spinner!, enemy.rect, () => {
        enemy.rect!.destroy();
        this.enemies!.splice(this.enemies!.indexOf(enemy), 1);
      });
      if (enemy.rect!.x > 600) {
        enemy.rect!.destroy();
        this.enemies!.splice(this.enemies!.indexOf(enemy), 1);
      }
    });

    if (this.left!.isDown && this.movement) {
      this.spinner!.rotation -= delta * this.rotationSpeed;
      this.spinner!.x -= delta * 0.5;
    }
    if (this.right!.isDown && this.movement) {
      this.spinner!.rotation += delta * this.rotationSpeed;
      this.spinner!.x += delta * 0.5;
    }

    if (this.fire!.isDown && this.movement) {
      this.movement = false;
      this.tweens.add({
        targets: this.spinner,
        scale: { from: 1.5, to: 1 },
        y: { from: 400, to: -20 },
        duration: 300,
        onComplete: () => {
          this.spinner!.y = 400;
          this.time.delayedCall(100, () => {
            this.movement = true;
          });
        },
        ease: Phaser.Math.Easing.Sine.Out,
      });
    }
  }
}

class Enemy {
  scene?: Phaser.Scene;
  rect?: Phaser.GameObjects.Rectangle;
  speed?: number;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.rect = this.scene.add.rectangle(x, y, 50, 50, 0xffffff);
    this.scene.physics.add.existing(this.rect);
    this.speed = Math.random() * 0.3;
  }
  update(_timeMs: number, delta: number) {
    this.rect!.x += delta * this.speed!;
  }
}
