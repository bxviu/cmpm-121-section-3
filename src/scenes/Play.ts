import * as Phaser from "phaser";

import starfieldUrl from "/assets/starfield.png";

export default class Play extends Phaser.Scene {
  fire?: Phaser.Input.Keyboard.Key;
  left?: Phaser.Input.Keyboard.Key;
  right?: Phaser.Input.Keyboard.Key;
  movement?: boolean;
  enemyCount?: number;

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
    this.enemyCount = 0;

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
  }

  update(_timeMs: number, delta: number) {
    this.starfield!.tilePositionX -= 4;
    if (this.enemyCount! < 4) {
      const bruh = new Enemy(this, 50, 50);
      bruh.update(_timeMs, delta);
    }

    if (this.left!.isDown && this.movement) {
      this.spinner!.rotation -= delta * this.rotationSpeed;
      this.spinner!.x -= delta * 0.5;
    }
    if (this.right!.isDown && this.movement) {
      this.spinner!.rotation += delta * this.rotationSpeed;
      this.spinner!.x += delta * 0.5;
    }

    if (this.fire!.isDown) {
      this.movement = false;
      this.tweens.add({
        targets: this.spinner,
        scale: { from: 1.5, to: 1 },
        duration: 300,
        ease: Phaser.Math.Easing.Sine.Out,
      });
      this.tweens.add({
        targets: this.spinner,
        y: { from: 400, to: -20 },
        duration: 1000,
        ease: Phaser.Math.Easing.Linear,
        onComplete: () => {
          this.spinner!.y = 400;
          this.time.delayedCall(100, () => {
            this.movement = true;
          });
        },
      });
    }
  }
}

class Enemy {
  x?: number;
  y?: number;
  scene?: Phaser.Scene;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.scene.add.rectangle(x, y, 50, 50, 0xffffff);
  }
  update(_timeMs: number, delta: number) {
    this.x! += delta * 0.5;
  }
}
