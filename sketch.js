const dimensions = {
  width: 600,
  height: 600
};
const matrixDimension = 4;
var xAxis = dimensions.width / 2;
var yAxis = dimensions.height / 2;
let matrixStack = [];
var numObj = 0;
var id = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var id2 = [];
var actual = 0;
var tam = 1;
var mulTam = 0.001;
var canvas;

class Button {
  constructor(text, x, y, width, height) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw() {
    if (this.hover) {
      strokeWeight(2);
    }
    stroke(0, 0, 0);
    rect(this.x, this.y, this.width, this.height);
    textSize(15);
    text(this.text, this.x + 5, this.y + 20);

    if (this.hover) {
      strokeWeight(1);
    }
  }

  mouseover() {
    this.hover = true;
  }

  mouseout() {
    this.hover = false;
  }

  isPointWithin(x, y) {
    return (
      this.x <= x &&
      this.x + this.width >= x &&
      this.y <= y &&
      this.y + this.height >= y
    );
  }

  execute() {
    alert("Ainda não implementado");
  }

  configureBinding(matricesEl) {
    alert("Ainda não implementado");
  }
}

class PushMatrixButton extends Button {
  constructor(x, y, width, height) {
    super("glPushMatrix( )", x, y, width, height);
  }

  execute() {
    if (matrixStack.length === 0) {
      var d3 = [];
      arrayCopy(id2, d3);

      // the first matrix
      matrixStack.push(new Matrix(d3, dimensions.height - Matrix.size(4) / 2));
    } else if (matrixStack.length < 4) {
      if (matrixStack[matrixStack.length - 1].bot) {
        var d5 = [];
        arrayCopy(matrixStack[matrixStack.length - 1].numbers, d5);
        matrixStack.push(
          new Matrix(
            d5,
            matrixStack[matrixStack.length - 1].pos.y - Matrix.size(4) * 0.9
          )
        );
      }
    }
  }
}

class PopMatrixButton extends Button {
  constructor(x, y, width, height) {
    super("glPopMatrix( )", x, y, width, height);
  }

  execute() {
    matrixStack.splice(matrixStack.length - 1, 1);
  }
}

class LoadMatrixButton extends Button {
  constructor(x, y, width, height) {
    super("glLoadMatrix(...)", x, y, width, height);
  }

  execute() {
    if (matrixStack.length > 0) {
      openMatrixModal(this, matrixStack[matrixStack.length - 1].numbers)
        .then(numbers => (matrixStack[matrixStack.length - 1].numbers = numbers))
        .catch(() => {});
    }
  }

  configureBinding(generatedMatrixEl, operationParamsEl) {
    let ithParam = 0;
    let isConfigurable = this.getParams().configurableParams;
    for (let c = 0; c < matrixDimension * matrixDimension; c++) {
      if (isConfigurable & (1 << c)) {
        const matrixValueEl = generatedMatrixEl.querySelector(
          `.matrix-value:nth-of-type(${c + 1})`
        );
        const paramValueEl = operationParamsEl.querySelector(
          `.parameter:nth-of-type(${ithParam + 1})`
        );
        binder.bind(this.onParameterChanged, matrixValueEl, paramValueEl);

        ithParam++;
      }
    }
  }

  onParameterChanged() {
    // assembles a 1d array of the generated matrix
    const generated = Array.from(
      generatedMatrixEl.querySelectorAll(".matrix-value")
    ).map(el => parseFloat(el.value.trim() || "0"));
    // writes the 1d array result back into the resulting matrix
    const resultingEls = resultingMatrixEl.querySelectorAll(".matrix-value");
    resultingEls.forEach((el, i) => (el.value = resultsArray[i]));
  }

  getParams() {
    return {
      showLeftMatrix: false,
      showMiddleMatrix: true,
      showRightMatrix: false,
      configurableParams: 0b1111111111111111,
      openGLCommands: [
        "GLfloat mat[] = { @input:1, @input:0, @input:0, @input:0, @input:0, @input:1, @input:0, @input:0, @input:0, @input:0, @input:1, @input:0, @input:0, @input:0, @input:0, @input:1 };",
        "glLoadMatrixf(mat);"
      ]
    };
  }
}

class MultMatrixButton extends Button {
  constructor(text, x, y, width, height) {
    super(text, x, y, width, height);
  }

  execute() {
    if (matrixStack.length) {
      openMatrixModal(this, matrixStack[matrixStack.length - 1].numbers)
        .then(numbers => (matrixStack[matrixStack.length - 1].numbers = numbers))
        .catch(() => {});
    }
  }

  configureBinding(generatedMatrixEl, operationParamsEl) {
    let ithParam = 0;
    let isConfigurable = this.getParams().configurableParams;
    for (let c = 0; c < matrixDimension * matrixDimension; c++) {
      if (isConfigurable & (1 << c)) {
        const matrixValueEl = generatedMatrixEl.querySelector(
          `.matrix-value:nth-of-type(${c + 1})`
        );
        const paramValueEl = operationParamsEl.querySelector(
          `.parameter:nth-of-type(${ithParam + 1})`
        );
        binder.bind(this.onParameterChanged, matrixValueEl, paramValueEl);

        ithParam++;
      }
    }
  }

  onParameterChanged() {
    const modalMatrixEl = document.querySelector("#modal-matrix");
    const currentMatrixEl = modalMatrixEl.querySelector("#mat-left");
    const generatedMatrixEl = modalMatrixEl.querySelector("#mat-top");
    const resultingMatrixEl = modalMatrixEl.querySelector("#mat-right");
    // assembles a 1d array of the current matrix
    const currents = Array.from(
      currentMatrixEl.querySelectorAll(".matrix-value")
    ).map(el => parseFloat(el.value.trim() || "0"));

    // assembles a 1d array of the generated matrix
    const generated = Array.from(
      generatedMatrixEl.querySelectorAll(".matrix-value")
    ).map(el => parseFloat(el.value.trim() || "0"));

    // executes the multiplication
    const resultsArray = MultMatrixButton.multiplyMatrices(currents, generated);

    // writes the 1d array result back into the resulting matrix
    const resultingEls = resultingMatrixEl.querySelectorAll(".matrix-value");
    resultingEls.forEach((el, i) => (el.value = resultsArray[i]));
  }

  static multiplyMatrices(left, right) {
    const asMatrix = (array, i, j) => array[j * matrixDimension + i];
    const setAsMatrix = (array, i, j, value) =>
      (array[j * matrixDimension + i] = value);
    const sumAsMatrix = (array, i, j, value) =>
      (array[j * matrixDimension + i] += value);
    const result = [];

    for (let j = 0; j < matrixDimension; j++) {
      for (let i = 0; i < matrixDimension; i++) {
        setAsMatrix(result, i, j, 0);

        for (let k = 0; k < matrixDimension; k++) {
          const leftValue = asMatrix(left, i, k);
          const rightValue = asMatrix(right, k, j);
          const value = leftValue * rightValue;
          sumAsMatrix(result, i, j, value);
        }
      }
    }

    return result;
  }

  getParams() {
    return {
      showLeftMatrix: true,
      showMiddleMatrix: true,
      showRightMatrix: true,
      configurableParams: 0b1111111111111111,
      openGLCommands: [
        "GLfloat mat[] = { @input:1, @input:0, @input:0, @input:0, @input:0, @input:1, @input:0, @input:0, @input:0, @input:0, @input:1, @input:0, @input:0, @input:0, @input:0, @input:1 };",
        "glMultMatrixf(mat);"
      ]
    };
  }
}

class TranslateButton extends MultMatrixButton {
  constructor(x, y, width, height) {
    super("glTranslate(...)", x, y, width, height);
  }

  getParams() {
    return Object.assign({}, super.getParams(), {
      configurableParams: 0b111000000000000,
      openGLCommands: ["glTranslatef(@input:0, @input:0, @input:0);"]
    });
  }
}

class ScaleButton extends MultMatrixButton {
  constructor(x, y, width, height) {
    super("glScale(...)", x, y, width, height);
  }

  getParams() {
    return Object.assign({}, super.getParams(), {
      configurableParams: 0b000010000100001,
      openGLCommands: ["glScalef(@input:1, @input:1, @input:1);"]
    });
  }
}

class RotateButton extends MultMatrixButton {
  constructor(x, y, width, height) {
    super("glRotate(...)", x, y, width, height);
  }

  configureBinding(generatedMatrixEl, operationParamsEl) {
    const parameterEls = Array.from(
      operationParamsEl.querySelectorAll(".parameter")
    );
    const [angleEl, xEl, yEl, zEl] = parameterEls;
    const impactedGeneratedMatrixValueEls = Array.from(
      generatedMatrixEl.querySelectorAll(".matrix-value")
    ).filter(
      (_, i) =>
        i < matrixDimension * (matrixDimension - 1) &&
        (i + 1) % matrixDimension !== 0
    );

    binder.watchAndTransform(
      this.onParameterChanged,
      () => {
        const parameters = parameterEls.map(el => parseFloat(el.value || "0"));

        // gets the angle and the xyz rotation axis
        let [angle, ...rotationAxis] = parameters;
        // finds the norm
        const rotationAxisNormSquared = rotationAxis.reduce(
          (accum, n) => accum + n * n,
          0
        );
        const rotationAxisNorm =
          rotationAxisNormSquared > 0 ? Math.sqrt(rotationAxisNormSquared) : 0;

        // normalizes the axis
        if (rotationAxisNorm) {
          rotationAxis = rotationAxis.map(d => d / rotationAxisNorm);
        }

        // defines the new value for each matrix element according to
        // the euler rotation matrix (http://www.dei.isep.ipp.pt/~matos/cg/docs/manual/glRotate.3G.html)
        angle *= Math.PI / 180;
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        const [x, y, z] = rotationAxis;

        let matrixValues = [
          x ** 2 * (1 - cosine) + cosine,
          y * x * (1 - cosine) + z * cosine,
          x * z * (1 - cosine) - y * sine,
          x * y * (1 - cosine) - z * sine,
          y ** 2 * (1 - cosine) + cosine,
          y * z * (1 - cosine) + x * sine,
          x * z * (1 - cosine) + y * sine,
          y * z * (1 - cosine) - x * sine,
          z ** 2 * (1 - cosine) + cosine
        ];

        // checks if number is too close to zero... if it is, sets to 0
        matrixValues = matrixValues.map(v =>
          Math.abs(v) < Number.EPSILON ? 0 : v
        );

        // changes the values of the elements in the upper-left submatrix
        impactedGeneratedMatrixValueEls.forEach(
          (el, i) => (el.value = matrixValues[i])
        );
      },
      ...parameterEls,
      ...impactedGeneratedMatrixValueEls
    );
  }

  getParams() {
    return Object.assign({}, super.getParams(), {
      configurableParams: 0b0,
      openGLCommands: ["glRotatef(@input:0, @input:0, @input:0, @input:1);"]
    });
  }
}

class DisabledButton extends Button {
  constructor(text, x, y, width, height) {
    super(text, x, y, width, height);
  }

  draw() {
    stroke(0, 0, 0);
    // fill(100, 100, 100);
    rect(this.x, this.y, this.width, this.height);
    // fill(255, 255, 255);
    textSize(15);
    text(this.text, this.x + 5, this.y + 20);
    // fill(0, 0, 0);
  }
}

let buttons = [
  new PushMatrixButton(455, dimensions.height - 80, 112, 25),
  new PopMatrixButton(455, dimensions.height - 50, 105, 25),
  new TranslateButton(35, dimensions.height - 180, 110, 25),
  new ScaleButton(35, dimensions.height - 150, 90, 25),
  new RotateButton(35, dimensions.height - 120, 90, 25),
  new LoadMatrixButton(35, dimensions.height - 80, 120, 25),
  new MultMatrixButton("glMultMatrix(...)", 35, dimensions.height - 50, 115, 25)
];

class Matrix {
  constructor(numbers, bottomLimit) {
    this.numbers = numbers;
    this.pos = createVector(xAxis, 0);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0.5);
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

  draw() {
    noStroke();

    let x = this.pos.x;
    let y = this.pos.y;

    // left brackets
    rect(
      x - (this.size / 2) * Matrix.characterSpacing,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      22,
      5
    );
    rect(
      x - (this.size / 2) * Matrix.characterSpacing,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      5,
      this.size * Matrix.characterSpacing
    );
    rect(
      x - (this.size / 2) * Matrix.characterSpacing,
      y + (this.size / 2) * Matrix.characterSpacing - 10,
      22,
      5
    );

    // right brackets
    rect(
      x + (this.size / 2) * Matrix.characterSpacing - 22,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      22,
      5
    );
    rect(
      x + (this.size / 2) * Matrix.characterSpacing,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      5,
      this.size * Matrix.characterSpacing
    );
    rect(
      x + (this.size / 2) * Matrix.characterSpacing - 22,
      y + (this.size / 2) * Matrix.characterSpacing - 10,
      27,
      5
    );
    stroke(0);

    // numbers
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const posX = x + Matrix.characterSpacing * (j - (this.size - 1) / 2);
        const posY = y + Matrix.characterSpacing * (i - (this.size - 1) / 2);
        text(this.numbers[i + j * this.size], posX, posY);
      }
    }
  }

  drop() {
    if (this.pos.y < this.bottomLimit - 8) {
      this.pos.y += this.vel.y;
      this.vel.y += this.acc.y;

      return true;
    } else {
      this.bot = true;
      this.pos.y = this.bottomLimit - 8;
      return false;
    }
  }
}

function ButtonPush() {
  stroke(0, 0, 0);
  rect(35, 350, 112, 25);
  textSize(15);
  text("glPushMatrix( )", 41, 367);
}

function ButtonPop() {
  stroke(0, 0, 0);
  rect(455, 350, 105, 25);
  textSize(15);
  text("glPopMatrix( )", 461, 367);
}

function ButtonChangeMatrix() {
  stroke(0, 0, 0);
  rect(455, 350, 105, 25);
  rect(455, 300, 120, 25);
  textSize(15);
  text("glLoadMatrix(...)", 461, 320);
}

function cloud(x, y) {
  push();
  noStroke();
  fill(255, 255, 255, 200);
  ellipse(x, y + 20, 100 * tam, 50 * tam);
  ellipse(x + 50, y + 20, 100 * tam, 50 * tam);
  ellipse(x + 25, y, 80 * tam, 50 * tam);

  pop();
}

function mainScreen() {
  background(255, 255, 233, 80);
  background(0, 191, 255, 200);
  cloud(100, 180);
  cloud(400, 100);
  tam += mulTam;
  if (tam >= 1.1 || tam <= 0.9) {
    mulTam *= -1;
  }
  push();
  noStroke();
  fill(100, 255, 100);
  rect(0, height - 50, width, 50);
  pop();

  for (button of buttons) {
    button.draw();
  }

  if (matrixStack.length > 0) {
    text(
      "Atual",
      matrixStack[matrixStack.length - 1].pos.x + Matrix.size(4) * 0.5,
      matrixStack[matrixStack.length - 1].pos.y
    );
  }
  for (var i = matrixStack.length - 1; i >= 0; i--) {
    if (!matrixStack[i].bot) {
      matrixStack[i].drop();
    }
    matrixStack[i].draw();
  }
}

function mouseClicked() {
  for (button of buttons) {
    if (button.isPointWithin(mouseX, mouseY)) {
      button.execute();
    }
  }
}

function mouseMoved() {
  for (button of buttons) {
    if (button.isPointWithin(mouseX, mouseY)) {
      button.mouseover();
    } else {
      button.mouseout();
    }
  }
}

function setup() {
  canvas = createCanvas(dimensions.width, dimensions.height);
  arrayCopy(id, id2);
  var d3 = [];
  arrayCopy(id, d3);
  matrixStack.push(new Matrix(id, dimensions.height - Matrix.size(4) / 2));
  canvas.parent("holder");
}

function draw() {
  mainScreen();
}
