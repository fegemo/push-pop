export default class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 1;
    this.phase = Math.random() * Math.PI * 2;
  }

  draw(p5) {
    p5.push();
    {
      p5.noStroke();
      p5.fill(255, 255, 255, 200);
      p5.ellipse(this.x, this.y + 20, 100 * this.size, 50 * this.size);
      p5.ellipse(this.x + 50, this.y + 20, 100 * this.size, 50 * this.size);
      p5.ellipse(this.x + 25, this.y, 80 * this.size, 50 * this.size);
    }
    p5.pop();
  }

  update(delta) {
    this.phase += delta * 0.0005;
    this.size = Math.cos(this.phase) * 0.1 + 1;
  }
}
