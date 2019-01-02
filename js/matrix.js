import { dimensions } from "./config.js";
import { roundTo } from "./number-formatter.js";

export default class Matrix {
  constructor(p5, numbers, bottomLimit) {
    this.p5 = p5;
    this.numbers = numbers;
    this.pos = p5.createVector(dimensions.width / 2, 0);
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0.5);
    this.bot = false;
    this.bottomLimit = bottomLimit;
    this.size = Math.floor(Math.sqrt(numbers.length));
  }

  limits() {
    return {
      left: this.pos.x - (this.size / 2) * Matrix.characterSpacing,
      right: this.pos.x + (this.size / 2) * Matrix.characterSpacing,
      top: this.pos.y - (this.size / 2) * Matrix.characterSpacing - 10,
      bottom: this.pos.y + (this.size / 2) * Matrix.characterSpacing - 10
    };
  }

  static get characterSpacing() {
    return 30;
  }

  static size(s) {
    return s * Matrix.characterSpacing + 20;
  }

  static identity(dimension) {
    return [...Array(dimension ** 2)].map((_, i) =>
      i % (dimension + 1) === 0 ? 1 : 0
    );
  }

  draw() {
    this.p5.noStroke();

    let x = this.pos.x;
    let y = this.pos.y;

    // left brackets
    this.p5.rect(
      x - (this.size / 2) * Matrix.characterSpacing,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      22,
      5
    );
    this.p5.rect(
      x - (this.size / 2) * Matrix.characterSpacing,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      5,
      this.size * Matrix.characterSpacing
    );
    this.p5.rect(
      x - (this.size / 2) * Matrix.characterSpacing,
      y + (this.size / 2) * Matrix.characterSpacing - 10,
      22,
      5
    );

    // right brackets
    this.p5.rect(
      x + 5 + (this.size / 2) * Matrix.characterSpacing - 22,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      17,
      5
    );
    this.p5.rect(
      x + (this.size / 2) * Matrix.characterSpacing,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      5,
      this.size * Matrix.characterSpacing
    );
    this.p5.rect(
      x + 5 + (this.size / 2) * Matrix.characterSpacing - 22,
      y + (this.size / 2) * Matrix.characterSpacing - 10,
      22,
      5
    );
    this.p5.stroke(0);

    // numbers
    this.p5.textAlign(this.p5.CENTER);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const posX = x + Matrix.characterSpacing * (j - (this.size - 1) / 2);
        const posY = y + Matrix.characterSpacing * (i - (this.size - 1) / 2);
        const number = this.numbers[i + j * this.size];
        this.p5.text(roundTo(number, 2), posX, posY);
      }
    }
    this.p5.textAlign(this.p5.LEFT);
  }

  drop() {
    if (this.pos.y < this.bottomLimit - 8) {
      this.pos.y += this.vel.y;
      this.vel.y += this.acc.y;

      return true;
    } else {
      if (!this.bot) {
        if (this.droppedCallback) {
          this.droppedCallback();
        }
      }
      this.bot = true;
      this.pos.y = this.bottomLimit - 8;
      return false;
    }
  }

  registerDropped(callback) {
    this.droppedCallback = callback;
  }
}
